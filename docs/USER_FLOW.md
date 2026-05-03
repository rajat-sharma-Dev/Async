# 🧭 USER_FLOW.md — End-to-End User Journeys

## Flow 1: Create an Agent

```
1. User opens AgentVerse dashboard
2. Clicks "Create Agent"
3. Fills in:
   - Name (e.g., "CodeBot-7")
   - Role (dropdown: Coordinator / Developer / Researcher / Critic / Trader)
   - Personality sliders:
     - Risk Tolerance: 0.0 → 1.0
     - Creativity: 0.0 → 1.0
     - Cost Sensitivity: 0.0 → 1.0
     - Thoroughness: 0.0 → 1.0
     - Independence: 0.0 → 1.0
4. Clicks "Mint Agent"
5. MetaMask popup → Approve transaction (0G Chain)
6. iNFT minted → Agent appears in dashboard
7. Agent personality + memory stored in 0G KV
8. Agent registers on AXL network (gets peer ID)
9. Agent enters IDLE state, ready for tasks
```

## Flow 2: Submit a Task

```
1. User clicks "New Task" on dashboard
2. Enters task description (e.g., "Build a landing page for a DeFi protocol")
3. Sets budget (e.g., 5 USDC equivalent)
4. Clicks "Submit Task"
5. MetaMask popup → Approve transaction + lock budget (0G Chain)
6. Task created on-chain (TaskManager contract)
7. Task broadcast to all agents via AXL P2P network
8. User sees "Task Submitted — Awaiting Bids" status
```

## Flow 3: Watch Agents Work (Live View)

```
1. Task appears in Live Execution View
2. User sees real-time feed:
   - "🔍 Agent 'Researcher-3' is evaluating task..."
   - "💰 Agent 'Developer-1' bid 1.5 USDC (confidence: 0.85)"
   - "💰 Agent 'Critic-2' bid 0.5 USDC (confidence: 0.92)"
   - "🤝 Swarm formed: Coordinator-1, Developer-1, Researcher-3, Critic-2"
3. Coordinator decomposes task:
   - "📋 Subtask 1: Research DeFi landing page trends (→ Researcher-3)"
   - "📋 Subtask 2: Write hero section code (→ Developer-1)"
   - "📋 Subtask 3: Review output quality (→ Critic-2)"
4. Agents communicate in real-time (messages visible):
   - Researcher → Coordinator: "Found 5 trending patterns..."
   - Coordinator → Developer: "Build hero section using these trends..."
   - Developer → Coordinator: "Here's the code output"
   - Coordinator → Critic: "Please review this code"
   - Critic → Coordinator: "Needs responsive fixes"
   - Coordinator → Developer: "Fix responsive issues" (ADAPTATION!)
   - Developer → Coordinator: "Fixed version ready"
5. Payments flow:
   - "💸 Coordinator paid Developer-1: 1.5 USDC"
   - "💸 Coordinator paid Researcher-3: 1.0 USDC"
   - "💸 Coordinator paid Critic-2: 0.5 USDC"
6. Final result rendered to user
```

## Flow 4: View Agent Profile

```
1. User clicks on an agent in the dashboard
2. Sees:
   - Agent name, role, personality radar chart
   - iNFT token ID + ownership info
   - Memory (recent tasks, learned patterns)
   - Earnings history (x402 payments received)
   - Task history (past work, ratings)
   - Current status (IDLE / ACTIVE / BIDDING)
   - AXL peer ID
```

## Flow 5: Transfer/Sell Agent

```
1. User goes to Agent Profile
2. Clicks "Transfer Agent"
3. Enters recipient wallet address
4. MetaMask popup → ERC-7857 transfer with proof
5. Agent ownership transfers
6. Agent's memory + intelligence persist (0G Storage)
7. New owner can now use the agent
```

---

## User Roles

| Role | Actions |
|------|---------|
| **Task Requester** | Submit tasks, set budgets, view results |
| **Agent Owner** | Create agents, customize personality, view earnings |
| **Observer** | Watch live task execution, explore agent profiles |
