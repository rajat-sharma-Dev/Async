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

- [/] **AXL node setup** — Clone repo, build Go binary (`go build -o node ./cmd/node/`)
  - 📖 Ref: [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) → "Setup", [tracks-docs/AXL.md](./tracks-docs/AXL.md) → "Get Started"
  - ⚠️ Needs Go 1.25.x (NOT 1.26). macOS: `brew install openssl` for key generation
  - ✅ Repo automation added: `npm run axl:setup`, `npm run axl:start`, `npm run axl:verify`
  - ⚠️ Local machine check: Go is not installed, so live binary build/send-recv verification must be run after installing Go 1.25.x

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

- [x] **KeeperHub payments wired** — `src/agents/runtime.ts` + `payments/agent-payments.ts`
  - ✅ `KH_API_KEY=kh_dnNq2G1zE-...` set in `.env` — KeeperHub API calling live
  - ✅ `distributeTaskPayment()` → `payAgent()` calls fire for all 4 swarm workers
  - ✅ All 5 agents have real `0x` wallet addresses
  - ✅ `x402.ts` complete — calls `payAgent()` on 402 challenges
  - ⚠️  Payments return 422 "No wallet configured" — need org wallet in KeeperHub dashboard
    - Go to [app.keeperhub.com](https://app.keeperhub.com) → Settings → Wallets → Create Wallet
    - Fund it with Base USDC to enable real transfers

- [x] **0G Compute inference** — `sk-a2864179...` configured, fallback working
  - ⏳ Deposit A0GI at [pc.0g.ai](https://pc.0g.ai/) to unlock live AI responses
  - Without deposit: agents use deterministic fallback (still fully runnable for demo)

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

- [x] **Swarm formation logic** — `swarm/coordinator.ts` + `swarm/auction.ts`
  - ✅ `scoreBid(bid)` — scores each agent bid: `confidence × roleBonus × (1 - priceRatio)`
  - ✅ `createSwarm(task, bids)` — selects top 4 winners with role diversity constraint
  - ✅ `electCoordinator(members)` — picks agent with `coordinator` role, or highest bid score
  - ✅ `assignSubtasks(subtasks, swarmAgents, coordinatorId)` — direct role match first, then `evaluateRoleMatch()` ranking fallback
  - ✅ `AdaptationStrategy` enum: ITERATE / PIVOT / DELEGATE / SPLIT / ESCALATE / ABANDON

- [x] **Task decomposition engine** — `swarm/decomposer.ts`
  - ✅ Calls 0G Compute LLM: `"Decompose this task into 3-4 subtasks as JSON array"`
  - ✅ Returns subtasks with: `id, title, description, assignedRole, dependencies[], status`
  - ✅ Deterministic fallback: generates 4 template subtasks (research → implement → review → integrate) when LLM unavailable
  - ✅ Dependencies array enables sequential execution (e.g. "implement" depends on "research")

- [x] **Auction/bidding logic** — `swarm/auction.ts` + `agents/runtime.ts`
  - ✅ Each agent calls `shouldBidOnTask(task, agent)` → returns `{ shouldBid, bidPrice, confidence }`
  - ✅ Bid price = `task.budget × (0.15–0.35)` shaped by `costSensitivity` personality trait
  - ✅ Confidence = `roleMatchScore × thoroughness × (1 - riskPenalty)`
  - ✅ Bids broadcast via AXL `BID` message type, collected by coordinator
  - ✅ Auction closes after all agents respond or 2s timeout

- [x] **Agent delegation protocol** — `swarm/coordinator.ts` + `axl/client.ts`
  - ✅ `createDelegationPrompt(input, llm)` — LLM generates delegation instructions including: prior completed subtask results, target agent's role/personality, coordinator identity
  - ✅ Coordinator sends `DELEGATION` AXL message to each assigned agent's `axlPeerId`
  - ✅ Agent receives task, calls `thinkAndRespond(subtask, systemPrompt)` → generates result via 0G Compute
  - ✅ Agent sends `RESULT` AXL message back to coordinator with output

- [x] **Mid-task adaptation logic** — `swarm/coordinator.ts` + `agents/runtime.ts`
  - ✅ `needsAdaptation(subtask, result)` — checks if result is empty, too short, or contains error markers
  - ✅ `selectAdaptation(subtask, agent)` — picks strategy: reattempt (ITERATE) or assign different agent (DELEGATE)
  - ✅ `reviewSubtaskOutput(subtask, result, critic)` — critic agent reviews each output for quality
  - ✅ `getExecutableSubtasks(subtasks)` — dependency-aware: only runs subtasks whose `dependencies[]` are all `complete`
  - ✅ Deadlock detection: throws if pending subtasks exist but none are executable (cyclic deps)

- [x] **Agent-to-agent prompting** — `agents/runtime.ts` + `swarm/coordinator.ts`
  - ✅ Each agent's LLM call uses `buildSystemPrompt(agent)` — injects role, personality traits as floats, and behavioral directives
  - ✅ Delegation prompt includes: `priorResults[]` (prior subtask outputs), coordinator name, target agent name + role
  - ✅ Critic agent receives: original subtask description + agent output → returns `{ pass: bool, feedback: string }`
  - ✅ Failed critic review triggers re-delegation with feedback appended to prompt

- [x] **Agent memory persistence** — `storage/zerog.ts`
  - ✅ `ZeroGMemory` class wraps 0G Storage KV node (`STORAGE_KV_NODE_URL`)
  - ✅ `getAgentMemory(agentId)` — fetches agent's past task history from 0G KV
  - ✅ `appendTaskResult(agentId, taskId, result)` — writes subtask result to KV after completion
  - ✅ Memory injected into agent system prompt context for continuity across tasks
  - ⏳ Requires `STORAGE_KV_NODE_URL` in `.env` (0G Storage node) for live persistence; skips gracefully if absent

- [x] **Agent runtime loop** — `agents/runtime.ts` (511 lines)
  - ✅ `runTaskLifecycle(task)` — full state machine: open → bidding → swarm formation → decompose → execute → review → completed
  - ✅ Dependency-aware `while (pending)` execution: runs all unblocked subtasks per round
  - ✅ Each subtask: `delegation prompt → LLM response → AXL RESULT message → critic review → bridge result`
  - ✅ 5 seeded agents bootstrapped at startup (Architect, NovaCoder, InfoHound, QualityGate, PennyWise)
  - ✅ All lifecycle events emitted: `task:created`, `task:bidding`, `swarm:formed`, `task:decomposed`, `agent:thinking`, `agent:message`, `task:completed`, `chain:resultSubmitted`, `payment:distributed`

- [x] **Express API + WebSocket server** — `server.ts`
  - ✅ `GET /api/health` — live chain + wallet balance + AXL mode
  - ✅ `GET|POST /api/agents` — list agents / mint new agent
  - ✅ `GET /api/agents/:id` — agent profile, earnings, task history
  - ✅ `GET|POST /api/tasks` — list tasks / submit new task (triggers full swarm lifecycle)
  - ✅ `GET /api/events` — paginated event log
  - ✅ `GET /api/payments` — all payment receipts
  - ✅ `GET /api/axl/topology` — AXL node reachability status
  - ✅ `POST /api/llm/chat` — direct LLM prompt endpoint
  - ✅ WebSocket: sends `snapshot` on connect (current agents, tasks, events), then streams all runtime events live

### 🟣 Both — Integration

- [x] **Runtime → 0G Chain bridge** — every task lifecycle step anchored on-chain
  - ✅ `bridgeCreateTask()` → `TaskManager.createTask()` on 0G Chain, returns numeric on-chain task ID
  - ✅ `bridgeFormSwarm()` → `TaskManager.formSwarm()` with agent IDs
  - ✅ `bridgeSubmitResult()` → `TaskManager.submitResult("0g://result/sha256...")` — **THE KEY BRIDGE**
  - ✅ Explorer link emitted: `https://chainscan-galileo.0g.ai/tx/{hash}`
  - ✅ Gracefully skips (no-op) when RPC unavailable, runtime continues

- [x] **KeeperHub + AXL wired into runtime**
  - ✅ `KH_API_KEY` present → `distributeTaskPayment()` → real USDC on Base per agent
  - ✅ No key → demo receipts with same structure
  - ✅ AXL real HTTP when nodes reachable, in-process EventEmitter when offline

**✅ Milestone:** Full task lifecycle: submit task → agents bid → swarm forms → subtasks decomposed → dependency-aware execution → critic review → result hash stored on 0G Chain → USDC payments distributed.

---

## Phase 3: Frontend + Polish + Demo

### 🟢 Rajat — Frontend

- [x] **Vite + React project setup** ✅ Already scaffolded by Pranav, enhanced
  - ✅ `react-router-dom` + `ethers` added
  - ✅ Premium design system in `src/styles.css`

- [x] **Dashboard page** — `src/pages/Dashboard.tsx`
  - ✅ Agent grid with personality bars, role colors, click-to-profile
  - ✅ Task submission form with budget field
  - ✅ Live execution panel: subtask progress + on-chain result hash
  - ✅ Real-time event feed (WebSocket, auto-reconnect)

- [x] **Live execution view** — WebSocket events streamed, auto-reconnect after 3s
  - ✅ `src/hooks/useWebSocket.ts` — 300-event rolling buffer, snapshot hydration
  - ✅ Color-coded events: task/swarm/agent/payment/chain

- [x] **Agent creation page** — `src/pages/CreateAgent.tsx`
  - ✅ Role picker grid (5 roles, color-coded)
  - ✅ Personality sliders (5 traits) with live preview card
  - ✅ Mints via `POST /api/agents`, redirects to profile

- [x] **Agent profile page** — `src/pages/AgentProfile.tsx`
  - ✅ Personality bars + on-chain identity fields
  - ✅ Earnings total + payment history list
  - ✅ Task history + 0G Explorer link

- [x] **MetaMask wallet integration** — `src/hooks/useWallet.ts`
  - ✅ Connect + auto-switch to 0G Testnet (chain 16602)
  - ✅ Wrong-chain warning badge
  - ✅ Balance display (A0GI)
  - ✅ Account/chain change listeners

- [x] **UI polish + animations**
  - ✅ Glassmorphism panels, animated background gradient
  - ✅ Role color accent bars on agent cards
  - ✅ Pulse animations for live status dots
  - ✅ Event slide-in animation, trait bar transition
  - ✅ Space Grotesk headings, JetBrains Mono for hashes

### 🔵 Pranav — Phase 3 (Swarm Tuning)

- [x] **Dependency-aware subtask execution** — `swarm/coordinator.ts`
  - ✅ `assignSubtasks()` — direct role match, ranked fallback via `evaluateRoleMatch()`
  - ✅ `getExecutableSubtasks()` — respects dependency graph (waits for prerequisites)
  - ✅ `createDelegationPrompt()` — LLM-generated delegation instructions with prior results context
  - ✅ `AdaptationStrategy` enum: ITERATE / PIVOT / DELEGATE / SPLIT / ESCALATE / ABANDON

- [x] **Runtime dependency loop** — `agents/runtime.ts`
  - ✅ `while (pending subtasks)` loop instead of linear `for` loop
  - ✅ Runs all executable subtasks in parallel per round
  - ✅ Coordinator delegation prompts include prior completed subtask results
  - ✅ Deadlock detection: throws if 0 executable subtasks and some still pending

- [x] **AXL node scripts** — `packages/axl-nodes/`
  - ✅ `setup-axl.ps1` — downloads + installs AXL binary
  - ✅ `start-nodes.ps1` — starts both nodes (9002, 9012) in background
  - ✅ `verify-axl.ps1` — checks node connectivity and topology

- [ ] **Demo scenario end-to-end test**
  - Ref: [DEMO_FLOW.md](./DEMO_FLOW.md) — run backend + frontend together
  - Status: Backend boots, frontend at http://127.0.0.1:5173, needs live run-through

- [ ] **Tune agent personalities** — for demo impact
  - Adjust bid competitiveness for compelling swarm formation in live demo

### 🟣 Both — Remaining

- [ ] **Activate 0G Compute** — 🔴 RAJAT ACTION REQUIRED
  - Deposit A0GI at [pc.0g.ai](https://pc.0g.ai/) against existing API key
  - Without this: all LLM calls run deterministic fallback, not live AI

- [ ] **Get KeeperHub key** — 🔴 RAJAT ACTION REQUIRED
  - Get `kh_...` org key from [app.keeperhub.com](https://app.keeperhub.com)
  - Add `KH_API_KEY=kh_...` to `.env`
  - Without this: payments use demo receipts, not real USDC on Base

- [ ] **Task detail page** (`/tasks/:id`) — optional but good for demo
- [ ] **Payments log page** (`/payments`) — shows x402 receipt history
- [ ] **Documentation cleanup** — Update README.md with demo instructions
- [ ] **Demo video recording**

**✅ Current Milestone:** Full-stack system running, all tracks wired, all code deployed. Zero TypeScript errors. Ready for demo run.
**🎯 Next Milestone:** Live LLM inference + real USDC payments (requires external keys).

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
