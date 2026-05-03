# 📦 0G_INTEGRATION.md — Storage, Memory & iNFTs

## Overview

0G provides two critical layers for AgentVerse:
1. **0G Storage (KV)** — Persistent, decentralized agent memory
2. **0G Chain + ERC-7857** — On-chain agent identity as Intelligent NFTs

---

## 0G Storage KV — Agent Memory

### Architecture

```
Agent Runtime ──► 0G TS SDK ──► 0G Storage Node ──► 0G Network
                                     │
                              ┌──────▼──────┐
                              │   KV Store   │
                              │  GET / SET   │
                              │  DELETE      │
                              │  SCAN        │
                              └─────────────┘
```

### Installation

```bash
npm install @0gfoundation/0g-ts-sdk ethers
```

### Key Schema

All agent data uses namespaced keys:

```
agent:{tokenId}:profile       → Agent profile (name, role, personality)
agent:{tokenId}:memory        → Active memory (recent context, learned info)
agent:{tokenId}:history       → Task execution history array
agent:{tokenId}:relationships → Trust scores with other agents
agent:{tokenId}:earnings      → Payment history
task:{taskId}:state           → Task execution state
task:{taskId}:results         → Intermediate and final results
swarm:{swarmId}:members       → Active swarm membership
swarm:{swarmId}:log           → Swarm communication log
```

### TypeScript Client

```typescript
// packages/backend/src/storage/zerog.ts

import { ZgFile, Indexer, getFlowContract } from '@0gfoundation/0g-ts-sdk';
import { ethers } from 'ethers';

export class ZeroGMemory {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private indexer: Indexer;

  constructor(rpcUrl: string, privateKey: string, indexerUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.indexer = new Indexer(indexerUrl);
  }

  // Store agent memory
  async setMemory(agentId: string, key: string, value: any): Promise<string> {
    const fullKey = `agent:${agentId}:${key}`;
    const data = JSON.stringify(value);
    // Upload to 0G storage as a KV entry
    const file = new ZgFile(Buffer.from(data));
    const [tx, hash] = await file.uploadTo(
      getFlowContract(this.signer),
      this.indexer
    );
    // Store hash mapping for retrieval
    await this.storeMapping(fullKey, hash);
    return hash;
  }

  // Retrieve agent memory
  async getMemory(agentId: string, key: string): Promise<any> {
    const fullKey = `agent:${agentId}:${key}`;
    const hash = await this.getMapping(fullKey);
    if (!hash) return null;
    const file = await this.indexer.download(hash);
    return JSON.parse(file.toString());
  }

  // Store task results
  async storeTaskResult(taskId: string, result: any): Promise<string> {
    const key = `task:${taskId}:results`;
    const data = JSON.stringify(result);
    const file = new ZgFile(Buffer.from(data));
    const [tx, hash] = await file.uploadTo(
      getFlowContract(this.signer),
      this.indexer
    );
    return hash;
  }

  // Append to swarm log
  async appendSwarmLog(swarmId: string, entry: SwarmLogEntry): Promise<void> {
    const key = `swarm:${swarmId}:log`;
    const existing = await this.getMemory('', key) || [];
    existing.push(entry);
    await this.setMemory('', key, existing);
  }
}
```

### Memory Operations in Agent Lifecycle

```typescript
// On agent startup
const memory = await zeroG.getMemory(agent.id, 'memory');
agent.context = memory?.recentContext || '';

// During task execution
await zeroG.setMemory(agent.id, 'memory', {
  recentContext: agent.context,
  lastTask: currentTask.id,
  learnedPatterns: agent.patterns
});

// After task completion
const history = await zeroG.getMemory(agent.id, 'history') || [];
history.push({
  taskId: task.id,
  role: agent.role,
  result: 'success',
  earnings: payment,
  timestamp: Date.now()
});
await zeroG.setMemory(agent.id, 'history', history);
```

### Caching Strategy

For demo performance, we use local cache + async writes:

```typescript
class CachedMemory extends ZeroGMemory {
  private cache: Map<string, { data: any; dirty: boolean }> = new Map();

  async getMemory(agentId: string, key: string): Promise<any> {
    const cacheKey = `agent:${agentId}:${key}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!.data;
    const data = await super.getMemory(agentId, key);
    this.cache.set(cacheKey, { data, dirty: false });
    return data;
  }

  async setMemory(agentId: string, key: string, value: any): Promise<string> {
    const cacheKey = `agent:${agentId}:${key}`;
    this.cache.set(cacheKey, { data: value, dirty: true });
    // Async write to 0G (don't block)
    return super.setMemory(agentId, key, value).catch(console.error) as any;
  }
}
```

---

## ERC-7857 iNFT — Agent Identity

### What is an iNFT?

An Intelligent NFT (ERC-7857) represents an AI agent as an on-chain asset with:
- **Ownership:** User owns the agent
- **Transferability:** Agent + its intelligence can be sold/transferred
- **Metadata:** Links to off-chain encrypted agent data
- **Upgradeability:** Agent intelligence evolves without redeploying contracts
- **Monetization:** Agents can earn and accumulate value

### Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IERC7857 is IERC721 {
    // Agent metadata (links to 0G storage)
    function getMetadata(uint256 tokenId) external view returns (string memory metadataUri);
    function updateMetadata(uint256 tokenId, string calldata newMetadataUri) external;
    
    // Secure transfer with proof (TEE/ZKP verification)
    function safeTransferWithProof(
        address to,
        uint256 tokenId,
        bytes calldata proof,
        bytes calldata encryptedKey
    ) external;
    
    // Agent registration
    event AgentRegistered(uint256 indexed tokenId, address indexed owner, string role, string name);
    event MetadataUpdated(uint256 indexed tokenId, string newMetadataUri);
}
```

### Agent Registration Flow

```
User ──► Frontend ──► MetaMask ──► AgentNFT.mint()
                                       │
                                  ┌────▼────┐
                                  │ On-Chain │
                                  │ tokenId  │
                                  │ owner    │
                                  │ metaURI  │
                                  └────┬────┘
                                       │
                                  ┌────▼─────────┐
                                  │ 0G Storage    │
                                  │ personality   │
                                  │ role          │
                                  │ initial memory│
                                  └──────────────┘
```

### On-Chain Data (Minimal)

| Field | Type | Purpose |
|-------|------|---------|
| `tokenId` | uint256 | Unique agent ID |
| `owner` | address | Who owns this agent |
| `metadataUri` | string | 0G Storage hash pointing to agent data |
| `role` | string | Agent role (coordinator, developer, etc.) |
| `createdAt` | uint256 | Timestamp |

### Off-Chain Data (0G Storage)

| Field | Storage | Content |
|-------|---------|---------|
| Personality vector | 0G KV | `{ riskTolerance, creativity, ... }` |
| Memory | 0G KV | Recent context, learned patterns |
| Task history | 0G KV | Past tasks, results, earnings |
| Relationships | 0G KV | Trust scores with other agents |

---

## Track Satisfaction

### How AgentVerse uses 0G:

1. **0G Storage KV** — Every agent's persistent memory is stored on 0G
2. **0G Chain** — All smart contracts deployed on 0G's EVM L2
3. **ERC-7857 iNFTs** — Agents ARE iNFTs — ownable, transferable AI entities
4. **Shared Memory** — Swarm coordination state stored in 0G KV (`swarm:*` keys)
5. **Audit Trail** — All task execution logs persisted in 0G storage
