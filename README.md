# AgentVerse

AgentVerse is a 0G-native autonomous agent swarm runtime. Agents have roles, personalities, persistent memory hooks for 0G Storage, 0G Compute-ready reasoning, AXL-ready peer messaging, and a demo task lifecycle that forms a swarm, executes subtasks, and emits live events.

## What Works Now

- Backend REST API and WebSocket event stream
- Five seeded agents: coordinator, developer, researcher, critic, trader
- Personality-shaped task bidding
- Swarm formation and coordinator election
- Task decomposition into role-based subtasks
- Agent execution with 0G Compute provider hooks and local fallback
- 0G Storage KV wrapper integration points for memory/history
- Demo payment receipts and `0g://result/...` result hashes
- React dashboard for submitting tasks and watching live swarm execution
- 0G Chain contracts compile for AgentNFT, TaskManager, and Auction

## Quick Start

```bash
npm install
npm run build --workspace=packages/backend
npm run build --workspace=packages/frontend
npm run contracts:compile
```

Create `.env` from `.env.example`, or use the included local demo `.env`.

For local demo mode:

```env
AGENTVERSE_DEMO_MODE=true
LLM_PROVIDER=local
```

For live 0G Compute:

```env
AGENTVERSE_DEMO_MODE=false
LLM_PROVIDER=0g
LLM_BASE_URL=https://router-api.0g.ai/v1
LLM_API_KEY=sk-your-key
LLM_MODEL=zai-org/GLM-5-FP8
```

Start the app:

```bash
npm run start --workspace=packages/backend
npm run dev --workspace=packages/frontend
```

Local URLs:

- Backend: `http://localhost:3001`
- Frontend: `http://127.0.0.1:5173/index.html`

## Working Example Agent

Run the example swarm script:

```bash
npm run demo:swarm
```

It creates an in-process task, lets the seeded agents bid/form a swarm, and prints the final result hash.

## API

- `GET /api/health`
- `GET /api/agents`
- `POST /api/agents`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `GET /api/tasks/:id/bids`
- `GET /api/tasks/:id/swarm`
- `GET /api/payments`
- `GET /api/events`

## 0G Integration

- **0G Chain:** contracts in `packages/contracts/contracts`
- **0G Storage:** memory wrapper in `packages/backend/src/storage/zerog.ts`
- **0G Compute:** OpenAI-compatible provider in `packages/backend/src/llm/provider.ts`

Contract addresses go in `.env` after deployment:

```env
AGENT_NFT_ADDRESS=
TASK_MANAGER_ADDRESS=
AUCTION_ADDRESS=
```

## Hackathon Track Fit

This build targets **Best Autonomous Agents, Swarms & iNFT Innovations** first: it demonstrates role-specialized agents, persistent memory hooks, autonomous bidding, swarm coordination, and task execution on a 0G-ready stack.
