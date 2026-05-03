# 📋 TASKS.md — Phase Breakdown & Assignments

## Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Complete
- 🟢 Rajat | 🔵 Pranav | 🟣 Both

## Doc References
> Each task references the documentation file(s) to consult while working on it.

---

## Phase 1: Foundation (Core Infrastructure)

### 🟢 Rajat — Web3 + Storage

- [x] **Project scaffolding** — Monorepo with npm workspaces (`contracts`, `backend`, `frontend`, `axl-nodes`)
  - 📖 Ref: [ARCHITECTURE.md](./ARCHITECTURE.md) (project structure), [INTERFACES.md](./INTERFACES.md) (shared types)
  - ✅ `package.json` root with workspaces, `.gitignore`, `tsconfig.json`

- [x] **Smart contract: `AgentNFT.sol`** — ERC-721 Enumerable iNFT with roles, reputation, earnings
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Contract 1: AgentNFT"
  - ✅ Compiled (Solidity 0.8.24, EVM cancun). Includes: 5 roles, reputation tracking, owner enumeration

- [x] **Smart contract: `TaskManager.sol`** — Full lifecycle with budget escrow
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Contract 2: TaskManager"
  - ✅ Compiled. Includes: escrow, bidding, swarm formation, result submission, payment + refunds, failTask

- [x] **Smart contract: `Auction.sol`** — Time-limited auction with off-chain scoring
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Contract 3: Auction"
  - ✅ Compiled. Includes: start/bid/finalize/cancel, active status check

- [x] **Hardhat config for 0G testnet** — Network config, deploy scripts, verification
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Deployment", [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "0G Chain"
  - ✅ Solidity 0.8.24, `evmVersion: "cancun"`, testnet (16602) + mainnet (16661)
  - ✅ Deploy script: `packages/contracts/scripts/deploy.js`

- [x] **0G Storage KV wrapper** — Agent memory read/write via CLI wrapper
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "0G Storage", [tracks-docs/OG-storage.md](./tracks-docs/OG-storage.md)
  - ✅ `packages/backend/src/storage/zerog.ts` — `ZeroGMemory` class with getAgentState/Memory/TaskHistory

- [x] **Environment config** — `.env.example` with all required vars
  - 📖 Ref: [README.md](./README.md) → "Environment Variables"
  - ✅ Covers: 0G Chain/Storage/Compute, AXL, KeeperHub, contract addresses, frontend

> **✅ DEPLOYED TO 0G TESTNET** (Chain ID: 16602)
> - AgentNFT: `0xD940B3Dec08366D4f4977eFbb2281B146aee5F69`
> - TaskManager: `0xd1A98cA6db8E122e2Bd23aD0915d654b3BeB27b1`
> - Auction: `0xd1519f4495D3b3E79f2F9877e6FfcEc9b1bA3057`

### 🔵 Pranav — AI + P2P

- [ ] **AXL node setup** — Clone repo, build Go binary (`go build -o node ./cmd/node/`)
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Setup", [tracks-docs/AXL.md](./tracks-docs/AXL.md) → "Get Started"
  - ⚠️ Needs Go 1.25.x (NOT 1.26). macOS: `brew install openssl` for key generation

- [x] **AXL node configs** — Created configs for 2 local nodes (ports 9002 + 9012)
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Step 3: Configure Nodes", [tracks-docs/AXL.md](./tracks-docs/AXL.md) → "Configuration"
  - ✅ `packages/axl-nodes/node-config.json` (Node A) + `node-config-2.json` (Node B)

- [x] **AXL TypeScript client wrapper** — `axl/client.ts`
  - ✅ Real HTTP calls to `/send`, `/recv`, `/topology` on AXL nodes (ports 9002/9012)
  - ✅ `AXLRouter` — auto-detects reachable nodes, falls back to in-process EventEmitter bus
  - ✅ Messages sent at every stage: TASK_BROADCAST, BID, SWARM_INVITE, DELEGATION, RESULT, REVIEW_REQUEST

- [x] **Agent type definitions** — `agents/types.ts` ✅ Built

- [x] **Personality system** — `agents/personality.ts`
  - ✅ Personality vectors per role (riskTolerance, creativity, costSensitivity, thoroughness, independence)
  - ✅ `shouldBidOnTask()` — role match + economic value → bid or abstain
  - ✅ `buildSystemPrompt()` — personality → LLM system prompt

- [x] **LLM provider** — `llm/provider.ts`
  - ✅ `ZeroGComputeProvider` — 0G Compute Router (deepseek-v3, GLM-5-FP8)
  - ✅ `LocalHeuristicProvider` — fallback for demo mode
  - ✅ `createLLMProvider()` — picks correct provider from env
  - ⏳ 0G Compute API key needs deposit on pc.0g.ai for live inference

- [x] **Agent runtime loop** — `agents/runtime.ts`
  - ✅ Full lifecycle: open → bidding → in_progress → review → completed
  - ✅ 5 default agents: Architect, NovaCoder, InfoHound, QualityGate, PennyWise
  - ✅ AXL messages at each step (real P2P or in-process fallback)
  - ✅ On-chain bridge: `bridgeCreateTask`, `bridgeFormSwarm`, `bridgeSubmitResult`
  - ✅ KeeperHub payments when `KH_API_KEY` present, demo receipts otherwise

- [x] **Swarm formation** — `swarm/auction.ts` ✅ Coordinator election + role-based member selection

- [x] **Task decomposition** — `swarm/decomposer.ts` ✅ LLM-powered with deterministic fallback

- [x] **React frontend** — `packages/frontend/`
  - ✅ Vite + React + TypeScript
  - ✅ Live agent cards with personality bars
  - ✅ Task submission form + real-time event feed via WebSocket
  - ✅ Execution panel showing subtasks and results

### 🟣 Both — Integration

- [x] **Shared interfaces** ✅ `src/types/index.ts` + `src/agents/types.ts`

- [x] **Runtime → 0G Chain bridge** — `src/bridge/onchain.ts`
  - ✅ `bridgeCreateTask()` — creates task on TaskManager when runtime task is created
  - ✅ `bridgeFormSwarm()` — records swarm formation on-chain
  - ✅ `bridgeSubmitResult()` — submits `0g://result/sha256...` hash to TaskManager
  - ✅ Gracefully no-ops when chain is unavailable (demo mode continues)
  - ✅ Explorer link printed: `https://chainscan-galileo.0g.ai/tx/{hash}`

- [x] **AXL node ↔ backend messaging** — `src/axl/client.ts`
  - ✅ Real HTTP to AXL nodes (ports 9002/9012) when reachable
  - ✅ In-process EventEmitter fallback when nodes are offline
  - ✅ `GET /api/axl/topology` endpoint shows node status

- [x] **KeeperHub payments wired** — `src/agents/runtime.ts`
  - ✅ Uses `distributeTaskPayment()` → KeeperHub `payAgent()` when `KH_API_KEY` is set
  - ✅ Falls back to demo receipts when no key
  - ⏳ Needs real agent wallet addresses (not `demo-wallet-*`) for live payments

- [ ] **0G Compute inference live** — needs deposit on pc.0g.ai
  - ⏳ API key `sk-a2864179...` configured, deposit pending

- [ ] **KeeperHub key** — needs `kh_` org-scoped key from app.keeperhub.com
  - ⏳ Set `KH_API_KEY=kh_...` in `.env` to activate live USDC payments

**✅ Milestone:** Two agents on separate AXL nodes exchange messages and make LLM-powered decisions.

---

## Phase 2: Swarm Intelligence + Economy

### 🟢 Rajat — Contracts + Payments

- [x] **Deploy contracts to 0G testnet** — All 3 contracts live!
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Deployment"
  - ✅ **AgentNFT:** `0xD940B3Dec08366D4f4977eFbb2281B146aee5F69`
  - ✅ **TaskManager:** `0xd1A98cA6db8E122e2Bd23aD0915d654b3BeB27b1`
  - ✅ **Auction:** `0xd1519f4495D3b3E79f2F9877e6FfcEc9b1bA3057`
  - Deployer: `0xbc86ca947Ab27b990054870566cfE849C2109D2d` | Gas: 0.02 A0GI

- [x] **Contract interaction utilities** — ethers.js wrappers for all 3 contracts
  - ✅ `packages/backend/src/contracts/index.ts` — AgentNFT, TaskManager, Auction wrappers
  - ✅ ABIs extracted to `packages/backend/src/contracts/*.abi.json`
  - ✅ Shared types in `packages/backend/src/types/index.ts`

- [x] **KeeperHub API client** — `payments/keeperhub.ts`
  - ✅ `packages/backend/src/payments/keeperhub.ts`
  - ✅ Direct Execution: transfer USDC, contract calls, check-and-execute
  - ✅ Workflow management, execution polling, spend cap analytics
  - ⏳ Needs `KH_API_KEY` in `.env` for live testing

- [x] **x402 payment handler** — `payments/x402.ts`
  - ✅ `packages/backend/src/payments/x402.ts`
  - ✅ 402 challenge parsing, retry logic, safety threshold checking

- [x] **Payment distribution** — `payments/agent-payments.ts` — coordinator → workers
  - ✅ `packages/backend/src/payments/agent-payments.ts`
  - ✅ Equal share + reputation-weighted distribution strategies

- [x] **On-chain task creation from backend** — full REST API
  - ✅ `packages/backend/src/routes/tasks.ts` — create, get, bid, swarm, result, pay, fail
  - ✅ `packages/backend/src/routes/agents.ts` — mint, get, reputation, earnings
  - ✅ `packages/backend/src/llm/provider.ts` — 0G Compute deepseek-v3 provider
  - ✅ `packages/backend/src/server.ts` — all routes wired, server boots clean
  - ✅ Health check verified live: `GET /api/health` returns contracts + 10.48 A0GI balance

### 🔵 Pranav — Swarm + Runtime

- [ ] **Swarm formation logic** — `swarm/coordinator.ts`
  - 📖 Ref: [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Swarm Formation Flow", "Coordinator Election"

- [ ] **Task decomposition engine** — `swarm/decomposer.ts` — LLM-powered
  - 📖 Ref: [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Task Decomposition"

- [ ] **Auction/bidding logic** — `swarm/auction.ts`
  - 📖 Ref: [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Auction/Bidding System"

- [ ] **Agent delegation protocol** — via AXL send/recv
  - 📖 Ref: [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Swarm Communication Protocol", [AXL_INTEGRATION.md](./AXL_INTEGRATION.md)

- [ ] **Mid-task adaptation logic**
  - 📖 Ref: [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Mid-Task Adaptation", [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Mid-Task Adaptation"

- [ ] **Agent-to-agent prompting** — Agents generate prompts for other agents
  - 📖 Ref: [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Agent-to-Agent Prompting"

- [ ] **Agent memory persistence** — Read/write 0G KV during task execution
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "Memory Operations in Agent Lifecycle"

- [x] **Express API server** — `server.ts` — REST + WebSocket skeleton
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → "API Endpoints", "WebSocket Events"
  - ✅ `packages/backend/src/server.ts` — Express + WS + broadcast helper (routes TBD)

- [ ] **API routes** — Tasks, agents, payments
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → tables, [INTERFACES.md](./INTERFACES.md) → "API Request/Response Types"

### 🟣 Both — Integration Test

- [ ] **End-to-end test** — task → swarm → execute → pay → result
  - 📖 Ref: [USER_FLOW.md](./USER_FLOW.md) → "Flow 2: Submit a Task", "Flow 3: Watch Agents Work"

- [ ] **Fix integration bugs**

**✅ Milestone:** Full task lifecycle works — submit, bid, swarm, execute, pay, result.

---

## Phase 3: Frontend + Polish + Demo

### 🟢 Rajat — Frontend

- [ ] **Vite + React project setup**
  - 📖 Ref: [FRONTEND.md](./FRONTEND.md)

- [ ] **Dashboard page** — Task submission, agent grid
  - 📖 Ref: [USER_FLOW.md](./USER_FLOW.md) → "Flow 2", [FRONTEND.md](./FRONTEND.md)

- [ ] **Live execution view** — Real-time agent messages via WebSocket
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → "WebSocket Events", [DEMO_FLOW.md](./DEMO_FLOW.md) → "Scene 6"

- [ ] **Agent creation page** — Mint iNFT with personality sliders
  - 📖 Ref: [USER_FLOW.md](./USER_FLOW.md) → "Flow 1", [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "PersonalityVector"

- [ ] **Agent profile page** — Memory, personality, earnings
  - 📖 Ref: [USER_FLOW.md](./USER_FLOW.md) → "Flow 4"

- [ ] **MetaMask wallet integration** — Connect to 0G Chain
  - 📖 Ref: [USER_GUIDE.md](./USER_GUIDE.md) → "Connect Your Wallet"

- [ ] **UI polish + animations**
  - 📖 Ref: [DEMO_FLOW.md](./DEMO_FLOW.md) (what needs to look good on video)

### 🔵 Pranav — Demo Tuning

- [ ] **Demo scenario end-to-end test**
  - 📖 Ref: [DEMO_FLOW.md](./DEMO_FLOW.md) — full scene-by-scene script

- [ ] **Tune agent personalities** — Make demo compelling
  - 📖 Ref: [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Personality System"

- [ ] **Tune task decomposition prompts**
  - 📖 Ref: [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Decomposition Engine"

- [ ] **Performance optimization** — Caching, concurrency
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "Caching Strategy"

### 🟣 Both — Final

- [ ] **Documentation cleanup**
  - 📖 Ref: All .md files in docs/

- [ ] **Demo video recording**
  - 📖 Ref: [DEMO_FLOW.md](./DEMO_FLOW.md)

- [ ] **Submission preparation**
  - 📖 Ref: [TRACK_MAPPING.md](./TRACK_MAPPING.md) (for track-specific talking points)

**✅ Milestone:** Polished, demoable MVP with video.

---

## Dependency Graph

```
Phase 1 (Rajat: contracts + 0G)    ──┐
Phase 1 (Pranav: AXL + agent runtime)──┼──► Phase 2 (Integration) ──► Phase 3
Phase 1 (Both: shared interfaces)    ──┘
```

**Parallel workstreams:**
- Rajat and Pranav work **fully in parallel** during Phase 1
- Phase 2 requires integration points defined in [INTERFACES.md](./INTERFACES.md)
- Phase 3: Rajat focuses on frontend, Pranav on backend tuning
