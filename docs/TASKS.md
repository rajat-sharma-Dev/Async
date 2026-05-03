# 📋 TASKS.md — Phase Breakdown & Assignments

## Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Complete
- 🟢 Rajat | 🔵 Pranav | 🟣 Both

---

## Phase 1: Foundation (Core Infrastructure)

### 🟢 Rajat — Web3 + Storage
- [ ] Project scaffolding (monorepo, npm workspaces, tsconfig)
- [ ] Smart contract: `AgentNFT.sol` (ERC-7857 iNFT)
- [ ] Smart contract: `TaskManager.sol`
- [ ] Smart contract: `Auction.sol`
- [ ] Hardhat config for 0G testnet
- [ ] Deploy script
- [ ] Contract tests (basic)
- [ ] 0G Storage KV wrapper (`zerog.ts`)
- [ ] Environment config (`.env.example`)

### 🔵 Pranav — AI + P2P
- [ ] AXL node setup (build Go binary)
- [ ] AXL node configs (3 nodes)
- [ ] AXL TypeScript client wrapper (`axl/client.ts`)
- [ ] Peer discovery logic (`axl/discovery.ts`)
- [ ] Message protocol + handlers (`axl/messaging.ts`)
- [ ] Agent type definitions (`agents/types.ts`)
- [ ] Personality system (`agents/personality.ts`)
- [ ] LLM provider abstraction (`llm/provider.ts`)
- [ ] Basic agent runtime loop (`agents/runtime.ts`)

### 🟣 Both — Integration
- [ ] Agree on shared interfaces (INTERFACES.md)
- [ ] Test AXL node ↔ backend connection
- [ ] Test 0G KV read/write from backend

**Milestone:** Two agents on separate AXL nodes exchange messages and make LLM-powered decisions.

---

## Phase 2: Swarm Intelligence + Economy

### 🟢 Rajat — Contracts + Payments
- [ ] Deploy contracts to 0G testnet
- [ ] Contract interaction utilities (ethers.js)
- [ ] x402 payment client (`payments/x402.ts`)
- [ ] KeeperHub integration (`payments/keeper.ts`)
- [ ] Agent wallet management
- [ ] Payment flow: coordinator → worker agents
- [ ] On-chain task creation from backend

### 🔵 Pranav — Swarm + Runtime
- [ ] Swarm formation logic (`swarm/coordinator.ts`)
- [ ] Task decomposition engine (`swarm/decomposer.ts`) — LLM-powered
- [ ] Auction/bidding logic (`swarm/auction.ts`)
- [ ] Agent delegation protocol via AXL
- [ ] Mid-task adaptation logic
- [ ] Agent-to-agent prompting
- [ ] Agent memory persistence (read/write 0G KV)
- [ ] Express API server (`server.ts`)
- [ ] WebSocket server for real-time events
- [ ] API routes: tasks, agents, payments

### 🟣 Both — Integration
- [ ] End-to-end test: task → swarm → execute → pay → result
- [ ] Fix integration bugs

**Milestone:** Full task lifecycle works — submit task, agents bid, swarm forms, work done, payments flow, result returned.

---

## Phase 3: Frontend + Polish + Demo

### 🟢 Rajat — Frontend
- [ ] Vite + React project setup
- [ ] Dashboard page (task submission, agent grid)
- [ ] Live execution view (real-time agent messages)
- [ ] Agent creation page (mint iNFT)
- [ ] Agent profile page (memory, personality, earnings)
- [ ] Transaction log page
- [ ] WebSocket client for real-time updates
- [ ] MetaMask wallet integration
- [ ] UI polish + animations

### 🔵 Pranav — Demo Tuning
- [ ] Demo scenario end-to-end test
- [ ] Tune agent personalities for compelling demo
- [ ] Tune task decomposition prompts
- [ ] Ensure mid-task adaptation triggers reliably
- [ ] Performance optimization (caching, concurrency)
- [ ] Error handling hardening

### 🟣 Both — Final
- [ ] Documentation cleanup (all 17 .md files)
- [ ] Demo video recording
- [ ] README finalization
- [ ] Submission preparation

**Milestone:** Polished, demoable MVP with video.

---

## Dependency Graph

```
Phase 1 (Rajat: contracts)  ──┐
Phase 1 (Pranav: AXL+agent)──┼──► Phase 2 (Integration) ──► Phase 3
Phase 1 (Both: interfaces)  ──┘
```

Rajat and Pranav can work **fully in parallel** during Phase 1.
Phase 2 requires integration points defined in INTERFACES.md.
Phase 3: Rajat focuses on frontend, Pranav on backend tuning.
