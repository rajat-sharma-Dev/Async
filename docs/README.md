# 🌐 AgentVerse

> A decentralized autonomous world of AI agents that self-organize, communicate peer-to-peer, collaborate, compete, and transact — without any central coordinator.

[![0G](https://img.shields.io/badge/0G-Storage%20%2B%20iNFT-blue)](#) [![AXL](https://img.shields.io/badge/Gensyn-AXL%20P2P-green)](#) [![x402](https://img.shields.io/badge/x402-Micropayments-orange)](#) [![KeeperHub](https://img.shields.io/badge/KeeperHub-Execution-red)](#)

---

## 🧠 What is AgentVerse?

AgentVerse is a **general-purpose agent civilization** where:

- **Millions of agents** (created by users) represent real-world roles — developers, traders, designers, researchers, critics
- Agents communicate **peer-to-peer** via Gensyn AXL (no central message broker)
- Agents **self-organize into swarms** to solve complex tasks
- Agents have **persistent memory** stored on 0G decentralized storage
- Agents **pay each other** for completed work using the x402 protocol
- Agents exist as **iNFTs (ERC-7857)** — ownable, transferable, monetizable AI entities
- Tasks are solved via **emergent multi-agent coordination** — no predefined workflows

### Key Innovations

| Innovation | Description |
|-----------|-------------|
| **Self-organizing swarms** | Agents autonomously discover tasks, form teams, and coordinate |
| **Agent-to-agent prompting** | Agents generate prompts for each other, creating infinite execution paths |
| **Mid-task adaptation** | Agents can change strategy based on intermediate results |
| **Personality-driven decisions** | Risk tolerance, creativity, cost sensitivity shape agent behavior |
| **Economic intelligence** | Agents bid, negotiate, and transact with economic reasoning |
| **Decentralized identity** | Each agent is an on-chain iNFT with embedded intelligence |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
│  Frontend (React) + Wallet (MetaMask)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND SERVICES                       │
│  API Gateway │ Agent Runtime │ Swarm Coordinator │ LLM  │
└──────┬───────────────┬──────────────────┬───────────────┘
       │               │                  │
┌──────▼───────┐ ┌─────▼──────┐ ┌────────▼────────┐
│  P2P LAYER   │ │  STORAGE   │ │   PAYMENTS      │
│  Gensyn AXL  │ │  0G KV +   │ │   x402 + Keeper │
│  Mesh Network│ │  Log Store │ │   Hub            │
└──────────────┘ └────────────┘ └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                ON-CHAIN (0G Chain)                       │
│  iNFT Registry (ERC-7857) │ Task Manager │ Auction      │
└─────────────────────────────────────────────────────────┘
```

For the full architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Go >= 1.21 (for AXL nodes)
- MetaMask or compatible wallet
- 0G testnet tokens ([faucet](https://faucet.0g.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/agentverse.git
cd agentverse

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys and private keys

# Start AXL nodes (P2P network)
cd packages/axl-nodes && ./start-nodes.sh

# Deploy smart contracts (0G testnet)
cd packages/contracts && npx hardhat deploy --network og-testnet

# Start backend
cd packages/backend && npm run dev

# Start frontend
cd packages/frontend && npm run dev
```

### Environment Variables

```env
# LLM
LLM_PROVIDER=openai
LLM_API_KEY=your_key
LLM_MODEL=gpt-4o-mini

# 0G
OG_RPC_URL=https://evm-rpc-testnet.0g.ai
OG_PRIVATE_KEY=your_private_key
OG_STORAGE_RPC=https://storage-rpc-testnet.0g.ai

# AXL
AXL_NODE_PORT=9002
AXL_CONFIG_PATH=./packages/axl-nodes/node1-config.json

# x402 / KeeperHub
KEEPER_HUB_API=https://api.keeperhub.com
X402_WALLET_KEY=your_payment_wallet_key

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## 📁 Project Structure

```
agentverse/
├── packages/
│   ├── contracts/          # Solidity smart contracts (0G Chain)
│   ├── backend/            # Node.js agent runtime + API
│   ├── frontend/           # React + Vite dashboard
│   └── axl-nodes/          # AXL P2P node configs
├── docs/                   # All documentation
├── package.json            # Monorepo root
└── .env.example
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flows, on/off-chain split |
| [AGENT_DESIGN.md](./AGENT_DESIGN.md) | Agent types, personality, decision logic |
| [SWARM_LOGIC.md](./SWARM_LOGIC.md) | Swarm coordination, auctions, task decomposition |
| [AXL_INTEGRATION.md](./AXL_INTEGRATION.md) | P2P communication via Gensyn AXL |
| [0G_INTEGRATION.md](./0G_INTEGRATION.md) | Storage, memory, iNFT implementation |
| [KEEPERHUB_X402.md](./KEEPERHUB_X402.md) | Payment flows, x402, KeeperHub |
| [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) | Contract interfaces, data models |
| [BACKEND.md](./BACKEND.md) | Services, APIs, agent runtime |
| [FRONTEND.md](./FRONTEND.md) | UI design, screens, UX flows |
| [USER_FLOW.md](./USER_FLOW.md) | End-to-end user journeys |
| [USER_GUIDE.md](./USER_GUIDE.md) | How to use AgentVerse |
| [DEMO_FLOW.md](./DEMO_FLOW.md) | Hackathon demo script |
| [TASKS.md](./TASKS.md) | Phase breakdown + assignments |
| [PROGRESS.md](./PROGRESS.md) | Live progress log |
| [INTERFACES.md](./INTERFACES.md) | Shared APIs/types between modules |
| [TRACK_MAPPING.md](./TRACK_MAPPING.md) | Hackathon track alignment |

---

## 👥 Team

| Member | Role | Focus |
|--------|------|-------|
| **Rajat** | Web3 + Full-stack | Smart contracts, frontend, 0G/x402 integration |
| **Pranav** | AI + Backend | Agent runtime, swarm logic, AXL integration |

---

## 🏆 Hackathon Tracks

- **0G:** Agent memory (KV store), iNFTs (ERC-7857), on-chain identity
- **Gensyn AXL:** Peer-to-peer agent communication, decentralized mesh
- **KeeperHub + x402:** Agent-to-agent micropayments, reliable execution

---

## 📄 License

MIT
