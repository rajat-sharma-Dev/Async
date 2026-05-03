const hre = require("hardhat");

async function main() {
  // Get deployer account
  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error("No signers found. Check PRIVATE_KEY in .env");
  }
  const deployer = signers[0];
  console.log("Deploying contracts with:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "A0GI");

  if (balance === 0n) {
    throw new Error("Deployer has no balance. Get tokens from faucet.0g.ai");
  }

  // 1. Deploy AgentNFT
  console.log("\n--- Deploying AgentNFT ---");
  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT", deployer);
  const agentNFT = await AgentNFT.deploy();
  console.log("  Tx sent, waiting for confirmation...");
  await agentNFT.waitForDeployment();
  const agentNFTAddr = await agentNFT.getAddress();
  console.log("  ✅ AgentNFT deployed to:", agentNFTAddr);

  // 2. Deploy TaskManager
  console.log("\n--- Deploying TaskManager ---");
  const TaskManager = await hre.ethers.getContractFactory("TaskManager", deployer);
  const taskManager = await TaskManager.deploy();
  console.log("  Tx sent, waiting for confirmation...");
  await taskManager.waitForDeployment();
  const taskManagerAddr = await taskManager.getAddress();
  console.log("  ✅ TaskManager deployed to:", taskManagerAddr);

  // 3. Deploy Auction
  console.log("\n--- Deploying Auction ---");
  const Auction = await hre.ethers.getContractFactory("Auction", deployer);
  const auction = await Auction.deploy();
  console.log("  Tx sent, waiting for confirmation...");
  await auction.waitForDeployment();
  const auctionAddr = await auction.getAddress();
  console.log("  ✅ Auction deployed to:", auctionAddr);

  // Summary
  console.log("\n═══════════════════════════════════════");
  console.log("  🎉 DEPLOYMENT COMPLETE — 0G Testnet");
  console.log("═══════════════════════════════════════");
  console.log(`  Network:      0G Testnet (${hre.network.name})`);
  console.log(`  Chain ID:     16602`);
  console.log(`  Deployer:     ${deployer.address}`);
  console.log(`  AgentNFT:     ${agentNFTAddr}`);
  console.log(`  TaskManager:  ${taskManagerAddr}`);
  console.log(`  Auction:      ${auctionAddr}`);
  console.log("═══════════════════════════════════════");
  console.log("\nUpdate .env with these addresses:");
  console.log(`  AGENT_NFT_ADDRESS=${agentNFTAddr}`);
  console.log(`  TASK_MANAGER_ADDRESS=${taskManagerAddr}`);
  console.log(`  AUCTION_ADDRESS=${auctionAddr}`);

  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;
  console.log(`\nGas spent: ${hre.ethers.formatEther(gasUsed)} A0GI`);
  console.log(`Remaining: ${hre.ethers.formatEther(finalBalance)} A0GI`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
