const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi Wizard Contracts", function () {
    let factory, usdc, dai, pool, dex, staking;
    let owner, alice, bob;

    beforeEach(async function () {
        [owner, alice, bob] = await ethers.getSigners();

        const WizardFactory = await ethers.getContractFactory("WizardFactory");
        factory = await WizardFactory.deploy();

        const usdcAddr = await factory.usdc();
        const daiAddr = await factory.dai();
        const poolAddr = await factory.pool();
        const dexAddr = await factory.dex();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        usdc = ERC20Mock.attach(usdcAddr);
        dai = ERC20Mock.attach(daiAddr);

        const SimpleLendingPool = await ethers.getContractFactory("SimpleLendingPool");
        pool = SimpleLendingPool.attach(poolAddr);

        const BasicDEX = await ethers.getContractFactory("BasicDEX");
        dex = BasicDEX.attach(dexAddr);

        const StakingRewards = await ethers.getContractFactory("StakingRewards");
        staking = await StakingRewards.deploy(usdcAddr, usdcAddr);

        // Fund staking contract with rewards
        await usdc.mint(await staking.getAddress(), ethers.parseEther("100000"));

        // Fund alice for tests
        await factory.requestTokens(alice.address);
    });

    // ─── ERC20Mock ────────────────────────────────────────────────────────────
    describe("ERC20Mock", function () {
        it("mint() adds tokens to recipient", async function () {
            const before = await usdc.balanceOf(bob.address);
            await usdc.mint(bob.address, ethers.parseEther("500"));
            const after = await usdc.balanceOf(bob.address);
            expect(after - before).to.equal(ethers.parseEther("500"));
        });
    });

    // ─── WizardFactory ────────────────────────────────────────────────────────
    describe("WizardFactory", function () {
        it("deploys all four contracts", async function () {
            expect(await factory.usdc()).to.be.properAddress;
            expect(await factory.dai()).to.be.properAddress;
            expect(await factory.pool()).to.be.properAddress;
            expect(await factory.dex()).to.be.properAddress;
        });

        it("requestTokens() mints 1000 USDC + 1000 DAI", async function () {
            const usdcBefore = await usdc.balanceOf(bob.address);
            const daiBefore  = await dai.balanceOf(bob.address);
            await factory.requestTokens(bob.address);
            expect(await usdc.balanceOf(bob.address) - usdcBefore).to.equal(ethers.parseEther("1000"));
            expect(await dai.balanceOf(bob.address)  - daiBefore).to.equal(ethers.parseEther("1000"));
        });
    });

    // ─── SimpleLendingPool ────────────────────────────────────────────────────
    describe("SimpleLendingPool", function () {
        it("deposit() records collateral", async function () {
            const amount = ethers.parseEther("100");
            await usdc.connect(alice).approve(await pool.getAddress(), amount);
            await pool.connect(alice).deposit(amount);
            expect(await pool.deposits(alice.address)).to.equal(amount);
        });

        it("borrow() up to 50% LTV succeeds", async function () {
            const deposit = ethers.parseEther("100");
            await usdc.connect(alice).approve(await pool.getAddress(), deposit);
            await pool.connect(alice).deposit(deposit);

            const borrow = ethers.parseEther("50");
            await pool.connect(alice).borrow(borrow);
            expect(await pool.borrows(alice.address)).to.equal(borrow);
        });

        it("borrow() over 50% LTV reverts", async function () {
            const deposit = ethers.parseEther("100");
            await usdc.connect(alice).approve(await pool.getAddress(), deposit);
            await pool.connect(alice).deposit(deposit);

            await expect(pool.connect(alice).borrow(ethers.parseEther("51")))
                .to.be.revertedWith("Insufficient collateral (50% LTV)");
        });

        it("withdraw() restores tokens", async function () {
            const amount = ethers.parseEther("100");
            await usdc.connect(alice).approve(await pool.getAddress(), amount);
            await pool.connect(alice).deposit(amount);
            await pool.connect(alice).withdraw(amount);
            expect(await pool.deposits(alice.address)).to.equal(0n);
        });
    });

    // ─── BasicDEX ─────────────────────────────────────────────────────────────
    describe("BasicDEX", function () {
        it("factory seeded initial liquidity", async function () {
            expect(await dex.reserveA()).to.be.gt(0n);
            expect(await dex.reserveB()).to.be.gt(0n);
        });

        it("getAmountOut() returns a positive quote", async function () {
            const usdcAddr = await usdc.getAddress();
            const quote = await dex.getAmountOut(usdcAddr, ethers.parseEther("100"));
            expect(quote).to.be.gt(0n);
        });

        it("swap() USDC → DAI transfers DAI to user", async function () {
            const amountIn = ethers.parseEther("100");
            const usdcAddr = await usdc.getAddress();
            await usdc.connect(alice).approve(await dex.getAddress(), amountIn);

            const daiBefore = await dai.balanceOf(alice.address);
            await dex.connect(alice).swap(usdcAddr, amountIn);
            expect(await dai.balanceOf(alice.address)).to.be.gt(daiBefore);
        });

        it("swap() DAI → USDC transfers USDC to user", async function () {
            const amountIn = ethers.parseEther("100");
            const daiAddr = await dai.getAddress();
            await dai.connect(alice).approve(await dex.getAddress(), amountIn);

            const usdcBefore = await usdc.balanceOf(alice.address);
            await dex.connect(alice).swap(daiAddr, amountIn);
            expect(await usdc.balanceOf(alice.address)).to.be.gt(usdcBefore);
        });
    });

    // ─── StakingRewards ───────────────────────────────────────────────────────
    describe("StakingRewards", function () {
        it("stake() records staked amount", async function () {
            const amount = ethers.parseEther("50");
            await usdc.connect(alice).approve(await staking.getAddress(), amount);
            await staking.connect(alice).stake(amount);
            expect(await staking.stakedAmount(alice.address)).to.equal(amount);
        });

        it("earned() accrues rewards over time", async function () {
            const amount = ethers.parseEther("50");
            await usdc.connect(alice).approve(await staking.getAddress(), amount);
            await staking.connect(alice).stake(amount);

            await ethers.provider.send("evm_increaseTime", [3600]); // +1 hour
            await ethers.provider.send("evm_mine", []);

            expect(await staking.earned(alice.address)).to.be.gt(0n);
        });

        it("withdraw() returns staked tokens", async function () {
            const amount = ethers.parseEther("50");
            await usdc.connect(alice).approve(await staking.getAddress(), amount);
            await staking.connect(alice).stake(amount);
            await staking.connect(alice).withdraw(amount);
            expect(await staking.stakedAmount(alice.address)).to.equal(0n);
        });

        it("claimReward() transfers earned rewards", async function () {
            const amount = ethers.parseEther("50");
            await usdc.connect(alice).approve(await staking.getAddress(), amount);
            await staking.connect(alice).stake(amount);

            await ethers.provider.send("evm_increaseTime", [86400]); // +1 day
            await ethers.provider.send("evm_mine", []);

            const balBefore = await usdc.balanceOf(alice.address);
            await staking.connect(alice).claimReward();
            expect(await usdc.balanceOf(alice.address)).to.be.gte(balBefore);
        });
    });
});
