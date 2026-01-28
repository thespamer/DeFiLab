import hre from "hardhat";

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

    // Deploy Staking Rewards (using USDC as reward for simplicity)
    const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
    // In a real scenario, staking token would be LP token from DEX
    const stakingRewards = await StakingRewards.deploy(usdcAddress, usdcAddress);
    await stakingRewards.waitForDeployment();
    console.log("🌾 Staking Rewards deployed to:", await stakingRewards.getAddress());

    console.log("\n🎉 DeFi Ecosystem ready for the Wizard!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
