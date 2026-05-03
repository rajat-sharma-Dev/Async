# 🐝 SWARM_LOGIC.md — Coordination, Auctions & Task Decomposition

## Overview

Swarm intelligence in AgentVerse is **emergent** — no central coordinator service exists. Instead, agents self-organize using on-chain auctions, P2P communication (AXL), and personality-driven decisions.

---

## Swarm Formation Flow

```
1. Task posted on-chain (TaskManager.createTask)
2. Backend detects event → broadcasts via AXL to all nodes
3. Each agent independently evaluates the task
4. Interested agents submit bids (on-chain or via AXL)
5. Auction resolves → winning agents identified
6. Winners form a swarm — coordinator elected
7. Coordinator decomposes task → assigns subtasks via AXL
8. Agents execute, communicate results, adapt
9. Coordinator aggregates → submits final result
10. Payments distributed via x402
```

## Auction / Bidding System

### Bid Structure

```typescript
interface Bid {
  agentId: string;        // iNFT token ID
  taskId: string;
  amount: number;         // Requested payment in USDC
  confidence: number;     // 0-1 self-assessed capability
  estimatedTime: number;  // Seconds
  role: AgentRole;        // What role they'd fill
  proposal: string;       // Brief approach description (LLM-generated)
}
```

### Auction Types

**MVP: Simple Scored Auction**
- Agents submit bids within a time window (30s for demo)
- Score = `0.4 * roleMatch + 0.3 * (1/amount) + 0.3 * confidence`
- Top N agents selected (N based on task complexity)
- Coordinator = highest-scoring Coordinator-role agent

**Future: Multi-round negotiation**
- Agents can counter-bid, form coalitions, negotiate prices

### Bid Calculation (Personality-Influenced)

```typescript
function calculateBid(agent: Agent, task: Task): number {
  const baseCost = estimateTokenCost(task.description);
  const margin = 1 + (1 - agent.personality.costSensitivity) * 0.5;
  const riskDiscount = agent.personality.riskTolerance * 0.2;
  return baseCost * margin * (1 - riskDiscount);
}
```

---

## Task Decomposition

### Decomposition Engine

The Coordinator agent uses LLM to break tasks into subtasks:

```typescript
async function decomposeTask(task: Task, swarm: Agent[]): Promise<Subtask[]> {
  const availableRoles = swarm.map(a => a.role);
  
  const prompt = `
    You are a project coordinator. Break this task into subtasks.
    
    Task: ${task.description}
    Budget: ${task.budget} USDC
    
    Available team members and their roles:
    ${swarm.map(a => `- ${a.name} (${a.role})`).join('\n')}
    
    Return a JSON array of subtasks with:
    - id, title, description, assignedRole, dependencies[], estimatedCost
    
    Rules:
    - Each subtask must be assignable to one of the available roles
    - Respect dependency ordering (no circular deps)
    - Total estimated cost must not exceed budget
  `;
  
  return JSON.parse(await llm.complete(prompt));
}
```

### Subtask Structure

```typescript
interface Subtask {
  id: string;
  title: string;
  description: string;
  assignedRole: AgentRole;
  assignedAgent?: string;     // Filled after delegation
  dependencies: string[];     // Subtask IDs that must complete first
  estimatedCost: number;
  status: 'pending' | 'in_progress' | 'review' | 'complete' | 'failed';
  result?: string;
  attempts: number;
}
```

### Dependency Resolution

```typescript
function getExecutableSubtasks(subtasks: Subtask[]): Subtask[] {
  return subtasks.filter(st => 
    st.status === 'pending' &&
    st.dependencies.every(depId => 
      subtasks.find(s => s.id === depId)?.status === 'complete'
    )
  );
}
```

---

## Swarm Communication Protocol

### Message Types via AXL

| Type | Sender | Receiver | Purpose |
|------|--------|----------|---------|
| `TASK_BROADCAST` | Backend | All agents | New task available |
| `BID` | Any agent | Coordinator/Backend | Submit bid |
| `SWARM_INVITE` | Coordinator | Selected agents | Join this swarm |
| `SWARM_ACK` | Agent | Coordinator | Accept swarm invite |
| `DELEGATION` | Coordinator | Worker agent | Assigned subtask |
| `PROGRESS` | Worker | Coordinator | Status update |
| `RESULT` | Worker | Coordinator | Subtask output |
| `REVIEW_REQUEST` | Coordinator | Critic agent | Review this output |
| `REVIEW_FEEDBACK` | Critic | Coordinator | Approval or issues |
| `ADAPTATION` | Any agent | Self/Coordinator | Strategy change |
| `PAYMENT_REQUEST` | Worker | Coordinator | Request payment for work |
| `PAYMENT_CONFIRM` | Coordinator | Worker | Payment sent |

### Message Flow Example

```
Coordinator ──DELEGATION──► Developer: "Build the hero section"
                                │
Developer  ──PROGRESS────► Coordinator: "50% done, header complete"
                                │
Developer  ──RESULT──────► Coordinator: "Here's the code output"
                                │
Coordinator ──REVIEW_REQ──► Critic: "Review this code"
                                │
Critic     ──REVIEW_FB───► Coordinator: "Needs responsive fixes"
                                │
Coordinator ──DELEGATION──► Developer: "Fix responsive issues"
                                │  (Mid-task adaptation!)
Developer  ──RESULT──────► Coordinator: "Fixed version"
                                │
Coordinator ──PAYMENT_CONFIRM─► Developer: "Paid 0.5 USDC"
```

---

## Mid-Task Adaptation

### Triggers

1. **Critic rejection** — Output didn't pass review
2. **Timeout** — Subtask taking too long
3. **New information** — Another agent provides relevant context
4. **Quality threshold** — Self-assessed output quality below threshold

### Adaptation Strategies

```typescript
enum AdaptationStrategy {
  ITERATE,        // Try again with modified approach
  PIVOT,          // Completely different approach
  DELEGATE,       // Hand off to a different specialist
  SPLIT,          // Break subtask into smaller pieces
  ESCALATE,       // Ask coordinator for help
  ABANDON         // Skip this subtask (high risk tolerance only)
}
```

### Decision Flow

```typescript
async function selectAdaptation(
  agent: Agent, subtask: Subtask, feedback: string
): Promise<AdaptationStrategy> {
  if (subtask.attempts >= 3) return AdaptationStrategy.DELEGATE;
  if (agent.personality.riskTolerance > 0.8) return AdaptationStrategy.PIVOT;
  if (agent.personality.thoroughness > 0.7) return AdaptationStrategy.ITERATE;
  return AdaptationStrategy.ESCALATE;
}
```

---

## Coordinator Election

For MVP, the coordinator is selected by:

1. **Role match:** Must be `coordinator` role
2. **Highest bid confidence** among coordinator-role agents
3. **Fallback:** If no coordinator-role agent bids, the highest-confidence agent of any role becomes coordinator

```typescript
function electCoordinator(bids: Bid[]): string {
  const coordinatorBids = bids.filter(b => b.role === 'coordinator');
  if (coordinatorBids.length > 0) {
    return coordinatorBids.sort((a, b) => b.confidence - a.confidence)[0].agentId;
  }
  return bids.sort((a, b) => b.confidence - a.confidence)[0].agentId;
}
```
