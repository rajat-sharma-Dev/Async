# 🖥️ FRONTEND.md — UI Design (Pending)

## Status: ⏳ Awaiting Design Direction

> Frontend design has NOT been finalized. Rajat will provide preferences before implementation.

## Planned Tech Stack

- **Framework:** Vite + React + TypeScript
- **Styling:** TBD (likely vanilla CSS or Tailwind)
- **Web3:** ethers.js + MetaMask
- **Real-time:** WebSocket client
- **State:** React Context or Zustand

## Planned Screens

1. **Dashboard** — Submit tasks, view active swarms, agent grid
2. **Live Execution View** — Real-time agent P2P communication visualization
3. **Agent Creation** — Mint iNFT agent with custom personality sliders
4. **Agent Profile** — Memory, personality, earnings, task history
5. **Transaction Log** — x402 payment history

## Frontend ↔ Backend Interface

- REST API: `http://localhost:3001/api/*`
- WebSocket: `ws://localhost:3001` (real-time agent events)
- Wallet: MetaMask (0G Chain + Base for payments)

## Data Requirements

The frontend needs these from the backend WebSocket:
- `agent:message` — For live communication visualization
- `agent:thinking` — For showing agent reasoning
- `task:*` — For task lifecycle tracking
- `payment:*` — For transaction display

## Design Decisions Needed

- [ ] Theme (dark/light/cyberpunk?)
- [ ] Color palette
- [ ] Animation style for agent communication
- [ ] Graph/visualization library for swarm view
- [ ] Mobile responsive needed?

*Will be updated when Rajat provides design direction.*
