# 📜 SMART_CONTRACTS.md — Contract Interfaces & Data Models

## Overview

All contracts deploy on **0G Chain** (EVM-compatible L2). Three core contracts:

1. **AgentNFT** — ERC-721 Enumerable iNFT for agent identity
2. **TaskManager** — Task lifecycle + budget management
3. **Auction** — Time-limited auction for task assignment

> **✅ DEPLOYED TO 0G TESTNET** (Solidity 0.8.24, EVM cancun)
> | Contract | Address |
> |----------|---------|
> | AgentNFT | `0xD940B3Dec08366D4f4977eFbb2281B146aee5F69` |
> | TaskManager | `0xd1A98cA6db8E122e2Bd23aD0915d654b3BeB27b1` |
> | Auction | `0xd1519f4495D3b3E79f2F9877e6FfcEc9b1bA3057` |
>
> Explorer: [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai/)
> Deployer: `0xbc86ca947Ab27b990054870566cfE849C2109D2d` | Gas: 0.02 A0GI

---

## Contract 1: AgentNFT.sol

### Purpose
Represents each AI agent as an Intelligent NFT (ERC-7857) with on-chain identity and off-chain intelligence.

### Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct AgentInfo {
        string name;
        string role;          // coordinator, developer, researcher, critic, trader
        string metadataUri;   // 0G Storage hash → personality, memory pointer
        uint256 createdAt;
        bool active;
    }

    mapping(uint256 => AgentInfo) public agents;

    event AgentRegistered(uint256 indexed tokenId, address indexed owner, string role, string name);
    event AgentMetadataUpdated(uint256 indexed tokenId, string newMetadataUri);
    event AgentDeactivated(uint256 indexed tokenId);

    constructor() ERC721("AgentVerse Agent", "AVA") Ownable(msg.sender) {}

    function mintAgent(
        string calldata name,
        string calldata role,
        string calldata metadataUri
    ) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        agents[tokenId] = AgentInfo({
            name: name,
            role: role,
            metadataUri: metadataUri,
            createdAt: block.timestamp,
            active: true
        });

        emit AgentRegistered(tokenId, msg.sender, role, name);
        return tokenId;
    }

    function updateMetadata(uint256 tokenId, string calldata newUri) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        agents[tokenId].metadataUri = newUri;
        emit AgentMetadataUpdated(tokenId, newUri);
    }

    function deactivateAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        agents[tokenId].active = false;
        emit AgentDeactivated(tokenId);
    }

    function getAgent(uint256 tokenId) external view returns (AgentInfo memory) {
        return agents[tokenId];
    }

    function isActiveAgent(uint256 tokenId) external view returns (bool) {
        return agents[tokenId].active;
    }
}
```

---

## Contract 2: TaskManager.sol

### Purpose
Manages task lifecycle: creation, bidding, assignment, result submission, and budget distribution.

### Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskManager {
    enum TaskStatus { Open, Bidding, InProgress, Review, Completed, Failed }

    struct Task {
        uint256 id;
        address requester;
        string description;
        uint256 budget;
        TaskStatus status;
        uint256 coordinatorAgentId;
        uint256 createdAt;
        uint256 completedAt;
        string resultHash;       // 0G Storage hash of final result
    }

    struct Bid {
        uint256 agentId;
        uint256 amount;
        uint256 confidence;      // 0-100
        string role;
        string proposal;
    }

    uint256 public taskCount;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => Bid[]) public taskBids;
    mapping(uint256 => uint256[]) public taskSwarm;  // taskId → agentIds

    event TaskCreated(uint256 indexed taskId, address indexed requester, string description, uint256 budget);
    event BidSubmitted(uint256 indexed taskId, uint256 indexed agentId, uint256 amount);
    event SwarmFormed(uint256 indexed taskId, uint256[] agentIds, uint256 coordinatorId);
    event TaskCompleted(uint256 indexed taskId, string resultHash);
    event PaymentDistributed(uint256 indexed taskId, uint256 indexed agentId, uint256 amount);

    function createTask(string calldata description) external payable returns (uint256) {
        require(msg.value > 0, "Budget required");
        
        uint256 taskId = taskCount++;
        tasks[taskId] = Task({
            id: taskId,
            requester: msg.sender,
            description: description,
            budget: msg.value,
            status: TaskStatus.Open,
            coordinatorAgentId: 0,
            createdAt: block.timestamp,
            completedAt: 0,
            resultHash: ""
        });

        emit TaskCreated(taskId, msg.sender, description, msg.value);
        return taskId;
    }

    function submitBid(
        uint256 taskId,
        uint256 agentId,
        uint256 amount,
        uint256 confidence,
        string calldata role,
        string calldata proposal
    ) external {
        require(tasks[taskId].status == TaskStatus.Open, "Not open");
        
        taskBids[taskId].push(Bid({
            agentId: agentId,
            amount: amount,
            confidence: confidence,
            role: role,
            proposal: proposal
        }));

        emit BidSubmitted(taskId, agentId, amount);
    }

    function formSwarm(
        uint256 taskId,
        uint256[] calldata agentIds,
        uint256 coordinatorId
    ) external {
        require(tasks[taskId].status == TaskStatus.Open, "Not open");
        
        tasks[taskId].status = TaskStatus.InProgress;
        tasks[taskId].coordinatorAgentId = coordinatorId;
        taskSwarm[taskId] = agentIds;

        emit SwarmFormed(taskId, agentIds, coordinatorId);
    }

    function submitResult(uint256 taskId, string calldata resultHash) external {
        require(tasks[taskId].status == TaskStatus.InProgress, "Not in progress");
        
        tasks[taskId].status = TaskStatus.Completed;
        tasks[taskId].completedAt = block.timestamp;
        tasks[taskId].resultHash = resultHash;

        emit TaskCompleted(taskId, resultHash);
    }

    function distributePayment(
        uint256 taskId,
        uint256[] calldata agentIds,
        uint256[] calldata amounts,
        address[] calldata wallets
    ) external {
        require(tasks[taskId].status == TaskStatus.Completed, "Not completed");
        require(agentIds.length == amounts.length, "Length mismatch");
        
        uint256 totalPayout;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalPayout += amounts[i];
        }
        require(totalPayout <= tasks[taskId].budget, "Exceeds budget");

        for (uint256 i = 0; i < wallets.length; i++) {
            payable(wallets[i]).transfer(amounts[i]);
            emit PaymentDistributed(taskId, agentIds[i], amounts[i]);
        }
    }

    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function getBids(uint256 taskId) external view returns (Bid[] memory) {
        return taskBids[taskId];
    }

    function getSwarm(uint256 taskId) external view returns (uint256[] memory) {
        return taskSwarm[taskId];
    }
}
```

---

## Contract 3: Auction.sol

### Purpose
Simple scored auction for selecting agents for a task.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Auction {
    struct AuctionInfo {
        uint256 taskId;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        uint256[] winnerAgentIds;
    }

    mapping(uint256 => AuctionInfo) public auctions;

    event AuctionStarted(uint256 indexed taskId, uint256 endTime);
    event AuctionFinalized(uint256 indexed taskId, uint256[] winners);

    function startAuction(uint256 taskId, uint256 durationSeconds) external {
        auctions[taskId] = AuctionInfo({
            taskId: taskId,
            startTime: block.timestamp,
            endTime: block.timestamp + durationSeconds,
            finalized: false,
            winnerAgentIds: new uint256[](0)
        });
        emit AuctionStarted(taskId, block.timestamp + durationSeconds);
    }

    function finalizeAuction(
        uint256 taskId,
        uint256[] calldata winners
    ) external {
        require(!auctions[taskId].finalized, "Already finalized");
        require(block.timestamp >= auctions[taskId].endTime, "Not ended");
        
        auctions[taskId].finalized = true;
        auctions[taskId].winnerAgentIds = winners;
        emit AuctionFinalized(taskId, winners);
    }
}
```

---

## Deployment

### Hardhat Config

> ⚠️ See [0G_INTEGRATION.md](./0G_INTEGRATION.md) and [tracks-docs/OG-chain.md](./tracks-docs/OG-chain.md) for full chain details.

```javascript
// packages/contracts/hardhat.config.js
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox-viem");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      evmVersion: "cancun", // ⚠️ REQUIRED for 0G Chain
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "0g-testnet": {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: [process.env.PRIVATE_KEY],
    },
    "0g-mainnet": {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      "0g-testnet": "placeholder",
      "0g-mainnet": "placeholder",
    },
    customChains: [
      {
        network: "0g-testnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        network: "0g-mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/open/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
};
```

### Deployment Script

```typescript
// packages/contracts/scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
  const AgentNFT = await ethers.getContractFactory("AgentNFT");
  const agentNFT = await AgentNFT.deploy();
  console.log("AgentNFT deployed to:", await agentNFT.getAddress());

  const TaskManager = await ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();
  console.log("TaskManager deployed to:", await taskManager.getAddress());

  const Auction = await ethers.getContractFactory("Auction");
  const auction = await Auction.deploy();
  console.log("Auction deployed to:", await auction.getAddress());
}

main().catch(console.error);
```

---

## Data Models Summary

| Contract | Key Data | Storage |
|----------|----------|---------|
| AgentNFT | tokenId, owner, name, role, metadataUri | On-chain |
| TaskManager | taskId, requester, budget, status, bids | On-chain |
| Auction | taskId, startTime, endTime, winners | On-chain |
| Agent personality + memory | Full personality vector, context | Off-chain (0G KV) |
| Task results | Final output, intermediate results | Off-chain (0G Storage) |
