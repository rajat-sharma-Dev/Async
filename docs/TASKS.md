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

- [ ] **Project scaffolding** — Set up monorepo with npm workspaces, shared tsconfig
  - 📖 Ref: [ARCHITECTURE.md](./ARCHITECTURE.md) (project structure), [INTERFACES.md](./INTERFACES.md) (shared types)

- [ ] **Smart contract: `AgentNFT.sol`** — ERC-7857 iNFT for agent identity
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Contract 1: AgentNFT", [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "ERC-7857 iNFT"

- [ ] **Smart contract: `TaskManager.sol`** — Task lifecycle + budget management
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Contract 2: TaskManager"

- [ ] **Smart contract: `Auction.sol`** — Sealed-bid auction for task assignment
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Contract 3: Auction", [SWARM_LOGIC.md](./SWARM_LOGIC.md) → "Auction/Bidding System"

- [ ] **Hardhat config for 0G testnet** — Network config, deploy scripts
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Deployment", [0G_INTEGRATION.md](./0G_INTEGRATION.md)

- [ ] **0G Storage KV wrapper** — Agent memory read/write via 0G TS SDK
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "0G Storage KV", [INTERFACES.md](./INTERFACES.md) → key schema

- [ ] **Environment config** — `.env.example` with all required vars
  - 📖 Ref: [README.md](./README.md) → "Environment Variables"

### 🔵 Pranav — AI + P2P

- [ ] **AXL node setup** — Clone repo, build Go binary (`go build -o node ./cmd/node/`)
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Setup", [tracks-docs/AXL.md](./tracks-docs/AXL.md) → "Get Started"
  - ⚠️ Needs Go 1.25.x (NOT 1.26). macOS: `brew install openssl` for key generation

- [ ] **AXL node configs** — Create configs for 2 local nodes (ports 9002 + 9012)
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Step 3: Configure Nodes", [tracks-docs/AXL.md](./tracks-docs/AXL.md) → "Configuration"
  - ⚠️ Config uses mixed casing: PascalCase for Yggdrasil, snake_case for AXL

- [ ] **AXL TypeScript client wrapper** — `axl/client.ts` wrapping `/send`, `/recv`, `/topology`
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Pattern 1: Send/Recv", [INTERFACES.md](./INTERFACES.md) → "AXL Message Types"
  - Note: `/recv` returns `X-From-Peer-Id` header with sender's public key

- [ ] **Agent type definitions** — `agents/types.ts`
  - 📖 Ref: [INTERFACES.md](./INTERFACES.md) → "Core Types", [AGENT_DESIGN.md](./AGENT_DESIGN.md) → all sections

- [ ] **Personality system** — `agents/personality.ts` — personality vector → system prompt
  - 📖 Ref: [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Personality System", "Personality → System Prompt"

- [ ] **LLM provider abstraction** — `llm/provider.ts` — pluggable LLM (OpenAI, etc.)
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → "LLM Provider Abstraction"

- [ ] **Basic agent runtime loop** — `agents/runtime.ts` — poll AXL, think, respond
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → "Agent Runtime Engine", [AGENT_DESIGN.md](./AGENT_DESIGN.md) → "Decision Logic"

### 🟣 Both — Integration Test

- [ ] **Agree on shared interfaces** — Finalize types in INTERFACES.md
  - 📖 Ref: [INTERFACES.md](./INTERFACES.md)

- [ ] **Test AXL node ↔ backend** — Verify send/recv between two nodes
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Step 5: Verify + Quick Test"

- [ ] **Test 0G KV read/write** — Verify agent memory persistence
  - 📖 Ref: [0G_INTEGRATION.md](./0G_INTEGRATION.md) → "TypeScript Client"

**✅ Milestone:** Two agents on separate AXL nodes exchange messages and make LLM-powered decisions.

---

## Phase 2: Swarm Intelligence + Economy

### 🟢 Rajat — Contracts + Payments

- [ ] **Deploy contracts to 0G testnet**
  - 📖 Ref: [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) → "Deployment"

- [ ] **Contract interaction utilities** — ethers.js wrappers for frontend + backend
  - 📖 Ref: [INTERFACES.md](./INTERFACES.md) → "Contract ABIs"

- [ ] **x402 payment client** — `payments/x402.ts` — handle 402 challenges
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "x402 Protocol", "TypeScript Implementation"

- [ ] **KeeperHub integration** — `payments/keeper.ts` — reliable execution
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "KeeperHub Integration"

- [ ] **Agent wallet management** — Create/manage wallets for agents
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "Agent Payment Wrapper"

- [ ] **Payment flow: coordinator → workers**
  - 📖 Ref: [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) → "Payment Flows in AgentVerse"

- [ ] **On-chain task creation from backend**
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

- [ ] **Express API server** — `server.ts` — REST + WebSocket
  - 📖 Ref: [BACKEND.md](./BACKEND.md) → "API Endpoints", "WebSocket Events"

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
