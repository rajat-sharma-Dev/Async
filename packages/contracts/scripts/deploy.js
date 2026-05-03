const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "0G");

  // 1. Deploy AgentNFT
  console.log("\n--- Deploying AgentNFT ---");
  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
  const agentNFT = await AgentNFT.deploy();
  await agentNFT.waitForDeployment();
  const agentNFTAddr = await agentNFT.getAddress();
  console.log("AgentNFT deployed to:", agentNFTAddr);

  // 2. Deploy TaskManager
  console.log("\n--- Deploying TaskManager ---");
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();
  await taskManager.waitForDeployment();
  const taskManagerAddr = await taskManager.getAddress();
  console.log("TaskManager deployed to:", taskManagerAddr);

  // 3. Deploy Auction
  console.log("\n--- Deploying Auction ---");
  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  await auction.waitForDeployment();
  const auctionAddr = await auction.getAddress();
  console.log("Auction deployed to:", auctionAddr);

  // Summary
  console.log("\n═══════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════");
  console.log(`  AgentNFT:     ${agentNFTAddr}`);
  console.log(`  TaskManager:  ${taskManagerAddr}`);
  console.log(`  Auction:      ${auctionAddr}`);
  console.log("═══════════════════════════════════════");
  console.log("\nUpdate .env with these addresses:");
  console.log(`  AGENT_NFT_ADDRESS=${agentNFTAddr}`);
  console.log(`  TASK_MANAGER_ADDRESS=${taskManagerAddr}`);
  console.log(`  AUCTION_ADDRESS=${auctionAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
