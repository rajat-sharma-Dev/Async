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
  - ⚠️ Config uses mixed casing: PascalCase for Yggdrasil, snake_case for AXL

- [ ] **AXL TypeScript client wrapper** — `axl/client.ts` wrapping `/send`, `/recv`, `/topology`
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Pattern 1: Send/Recv", [INTERFACES.md](./INTERFACES.md) → "AXL Message Types"
  - Note: `/recv` returns `X-From-Peer-Id` header with sender's public key

- [ ] **Agent type definitions** — `agents/types.ts`
  - 📖 Ref: [INTERFACES.md](./INTERFACES.md) → "Core Types", [AGENT_DESIGN.md](./AGENT_DESIGN.md) → all sections

- [ ] **Personality system** — `agents/personality.ts` — personality vector → system prompt
  - 📖 Ref: [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Personality System", "Personality → System Prompt"

- [ ] **LLM provider: 0G Compute Router** — `llm/provider.ts` — **0G Compute as default** (OpenAI drop-in)
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "0G Compute", [tracks-docs/OG-compute.md](./tracks-docs/OG-compute.md) → "Quickstart"
  - API: `https://router-api.0g.ai/v1` — same as OpenAI API!
  - Need: API key from [pc.0g.ai](https://pc.0g.ai/) + 0G token deposit
  - Model: `zai-org/GLM-5-FP8` (supports streaming, tool calling, JSON mode)

- [ ] **Basic agent runtime loop** — `agents/runtime.ts` — poll AXL, think, respond
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → "Agent Runtime Engine", [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Decision Logic"

### 🟣 Both — Integration Test

- [/] **Agree on shared interfaces** — Finalize types in INTERFACES.md
  - 📖 Ref: [INTERFACES.md](./INTERFACES.md)
  - 🟡 Types defined in docs; need to create actual `.ts` files

- [ ] **Test AXL node ↔ backend** — Verify send/recv between two nodes
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Step 5: Verify + Quick Test"

- [ ] **Test 0G KV read/write** — Verify agent memory persistence
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "TypeScript Wrapper"

- [ ] **Test 0G Compute inference** — Verify LLM calls work via 0G Compute Router
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "0G Compute"

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

- [ ] **Contract interaction utilities** — ethers.js wrappers for frontend + backend
  - 📖 Ref: [INTERFACES.md](./INTERFACES.md) → "Contract ABIs"
  - After deploy: copy ABIs from `packages/contracts/artifacts/` + addresses from deploy output

- [ ] **KeeperHub API client** — `payments/keeperhub.ts` — Direct Execution + Workflow API
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "KeeperHub API", [tracks-docs/KeepersHub-completedocs.md](./tracks-docs/KeepersHub-completedocs.md)
  - API: `https://app.keeperhub.com/api`, Auth: `Bearer kh_...`
  - Endpoints: `POST /execute/transfer`, `POST /execute/contract-call`
  - Rate: 60 req/min (direct exec), 100 req/min (API)

- [ ] **Agentic Wallet setup** — `@keeperhub/wallet` for agent payments
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "Agentic Wallet Setup"
  - Install: `npx -p @keeperhub/wallet keeperhub-wallet skill install && keeperhub-wallet add`
  - Creates `~/.keeperhub/wallet.json` (HMAC secret, NOT a private key)
  - Safety: auto ≤$5, ask ≤$100, block >$100

- [ ] **x402 payment handler** — `payments/x402.ts` — handle HTTP 402 challenges
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "x402 Protocol"
  - Payments settle on **Base USDC** (chain 8453, token `0x833589fCD...`)
  - Agent pays USDC only — NO gas needed (facilitator pays gas)
  - Per-transfer cap: 100 USDC, daily cap: 200 USDC

- [ ] **Payment distribution** — `payments/agent-payments.ts` — coordinator → workers
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "Payment Flows in AgentVerse"
  - Uses KeeperHub Direct Execution `POST /execute/transfer`

- [ ] **On-chain task creation from backend** — API routes for task lifecycle
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "TaskManager.sol", [BACKEND.md](./BACKEND.md) → "API Endpoints: Tasks"

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
