import hre from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log("🚀 Starting DeFi Wizard Deployment...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy Factory
    const WizardFactory = await hre.ethers.getContractFactory("WizardFactory");
    const factory = await WizardFactory.deploy();
    await factory.waitForDeployment();

    const factoryAddress = await factory.getAddress();
    const usdcAddress = await factory.usdc();
    const daiAddress = await factory.dai();
    const poolAddress = await factory.pool();
    const dexAddress = await factory.dex();

    console.log("✅ WizardFactory deployed to:", factoryAddress);
    console.log("💰 USDC Mock:", usdcAddress);
    console.log("🪙 DAI Mock:", daiAddress);
    console.log("🏦 Lending Pool:", poolAddress);
    console.log("🔄 Basic DEX:", dexAddress);

    // Deploy Staking Rewards (USDC as both staking token and reward token)
    const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
    const stakingRewards = await StakingRewards.deploy(usdcAddress, usdcAddress);
    await stakingRewards.waitForDeployment();
    const stakingAddress = await stakingRewards.getAddress();
    console.log("🌾 Staking Rewards deployed to:", stakingAddress);

    // Fund StakingRewards with reward tokens so claimReward() can pay out
    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    const usdc = ERC20Mock.attach(usdcAddress);
    await usdc.mint(stakingAddress, hre.ethers.parseEther("100000"));
    console.log("💎 Funded StakingRewards with 100,000 USDC rewards");

    // Pre-fund first 5 Hardhat test accounts with tokens for ContractTestStep
    const signers = await hre.ethers.getSigners();
    for (let i = 0; i < 5; i++) {
        await factory.requestTokens(signers[i].address);
        console.log(`🎁 Funded [${i}] ${signers[i].address} with 1000 USDC + 1000 DAI`);
    }

    // Write deployments.json to frontend/public so the UI can load contract addresses at runtime
    const deployments = {
        chainId: 31337,
        factory: factoryAddress,
        usdc: usdcAddress,
        dai: daiAddress,
        pool: poolAddress,
        dex: dexAddress,
        staking: stakingAddress,
        deployedAt: new Date().toISOString(),
    };

    const outDir = join(__dirname, "../frontend/public");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "deployments.json"), JSON.stringify(deployments, null, 2));

    console.log("\n📝 Deployments saved to frontend/public/deployments.json");
    console.log("\n🎉 DeFi Ecosystem ready for the Wizard!");
    console.log(JSON.stringify(deployments, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
