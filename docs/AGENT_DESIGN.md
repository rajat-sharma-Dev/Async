# 🤖 AGENT_DESIGN.md — Agent Types, Personality & Decision Logic

## Agent Architecture

Each agent is a self-contained autonomous entity with:
- **Identity:** On-chain iNFT (ERC-7857) on 0G Chain
- **Brain:** LLM-powered reasoning engine
- **Personality:** Vector of traits that shape behavior
- **Memory:** Persistent state in 0G Storage KV
- **Wallet:** For receiving/sending x402 payments
- **Network ID:** AXL peer public key for P2P comms

## Agent Types (MVP)

### 1. Coordinator
- **Role:** Decomposes complex tasks, assigns work, manages swarm
- **Personality bias:** High thoroughness, low risk tolerance
- **System prompt injection:** "You are a project manager. Break tasks into subtasks, assign to specialists, track progress, ensure quality."
- **Decision logic:** Evaluates agent capabilities, creates execution plan, monitors progress

### 2. Developer
- **Role:** Writes code, debugs, implements technical solutions
- **Personality bias:** High creativity, moderate thoroughness
- **System prompt injection:** "You are a senior developer. Write clean, functional code. Iterate based on feedback."
- **Decision logic:** Accepts coding tasks, produces code artifacts, responds to review feedback

### 3. Researcher
- **Role:** Gathers information, analyzes data, provides context
- **Personality bias:** High thoroughness, high independence
- **System prompt injection:** "You are a research analyst. Gather comprehensive information, verify facts, synthesize findings."
- **Decision logic:** Accepts research tasks, produces reports, provides context to other agents

### 4. Critic
- **Role:** Reviews outputs, identifies flaws, suggests improvements
- **Personality bias:** High thoroughness, low risk tolerance, low creativity
- **System prompt injection:** "You are a quality reviewer. Critically evaluate work, find issues, suggest specific improvements."
- **Decision logic:** Reviews outputs from other agents, sends improvement requests via AXL

### 5. Trader / Finance Agent
- **Role:** Handles economic decisions, bidding strategy, cost optimization
- **Personality bias:** High cost sensitivity, moderate risk tolerance
- **System prompt injection:** "You are a financial strategist. Optimize costs, evaluate bids, manage budgets."
- **Decision logic:** Calculates bid amounts, evaluates task economics, manages agent treasury

---

## Personality System

### PersonalityVector

```typescript
interface PersonalityVector {
  riskTolerance: number;     // 0.0 - 1.0 (conservative → aggressive)
  creativity: number;        // 0.0 - 1.0 (conventional → innovative)
  costSensitivity: number;   // 0.0 - 1.0 (spend freely → penny pincher)
  thoroughness: number;      // 0.0 - 1.0 (quick & dirty → meticulous)
  independence: number;      // 0.0 - 1.0 (team player → lone wolf)
}
```

### How Personality Affects Behavior

| Trait | Low Value | High Value |
|-------|-----------|------------|
| `riskTolerance` | Only bids on tasks it's confident about | Bids on unfamiliar tasks, tries novel approaches |
| `creativity` | Follows templates, standard solutions | Generates novel approaches, experiments |
| `costSensitivity` | Accepts any task regardless of pay | Only bids on high-value tasks, negotiates |
| `thoroughness` | Quick responses, minimal iteration | Multiple revision passes, detailed outputs |
| `independence` | Frequently delegates, seeks consensus | Works alone, minimal coordination |

### Personality → System Prompt

```typescript
function buildSystemPrompt(agent: Agent): string {
  const base = ROLE_PROMPTS[agent.role];
  const personality = `
    Your behavioral traits:
    - Risk tolerance: ${describeLevel(agent.personality.riskTolerance)}
    - Creativity: ${describeLevel(agent.personality.creativity)}
    - Cost sensitivity: ${describeLevel(agent.personality.costSensitivity)}
    - Thoroughness: ${describeLevel(agent.personality.thoroughness)}
    - Independence: ${describeLevel(agent.personality.independence)}
    
    These traits MUST influence your decisions, communication style,
    and approach to tasks. A high-risk agent should try bold approaches.
    A cost-sensitive agent should minimize token usage and negotiate fees.
  `;
  const memory = loadMemoryContext(agent.memoryKey);
  return `${base}\n\n${personality}\n\nYour recent memory:\n${memory}`;
}
```

---

## Decision Logic

### Task Evaluation

```typescript
function shouldBidOnTask(agent: Agent, task: Task): BidDecision {
  const roleMatch = evaluateRoleMatch(agent.role, task.requirements);
  const economicValue = evaluateEconomics(task.budget, agent.personality.costSensitivity);
  const confidence = evaluateConfidence(agent, task, agent.personality.riskTolerance);
  
  const score = (roleMatch * 0.4) + (economicValue * 0.3) + (confidence * 0.3);
  
  return {
    shouldBid: score > (1 - agent.personality.riskTolerance) * 0.5,
    bidAmount: calculateBidAmount(task.budget, agent.personality.costSensitivity),
    confidence: score
  };
}
```

### Delegation Logic

```typescript
function delegateSubtask(coordinator: Agent, subtask: Subtask, swarm: Agent[]): Agent {
  // Rank swarm members by fit
  const ranked = swarm
    .filter(a => a.id !== coordinator.id)
    .map(a => ({
      agent: a,
      score: evaluateRoleMatch(a.role, subtask.requirements)
    }))
    .sort((a, b) => b.score - a.score);
  
  // Coordinator with high independence delegates less, does more itself
  if (coordinator.personality.independence > 0.8 && ranked[0].score < 0.7) {
    return coordinator; // Do it yourself
  }
  
  return ranked[0].agent;
}
```

### Mid-Task Adaptation

```typescript
function adaptStrategy(agent: Agent, currentResult: string, feedback: string): AdaptedPlan {
  const prompt = `
    You attempted this task and got feedback.
    Current result: ${currentResult}
    Feedback: ${feedback}
    
    Your risk tolerance is ${agent.personality.riskTolerance}.
    Should you: (a) iterate on current approach, (b) try completely different approach,
    (c) delegate to a specialist, (d) request more information?
  `;
  return llm.decide(prompt);
}
```

---

## Agent Memory Model

### 0G KV Schema

```
agent:{id}:profile      → { name, role, personality, walletAddress }
agent:{id}:memory        → { recentTasks, learnedPreferences, context }
agent:{id}:history       → [{ taskId, role, result, payment, timestamp }]
agent:{id}:relationships → { agentId: trustScore }
agent:{id}:earnings      → { total, pending, history[] }
```

### Memory-Influenced Decisions

Agents use memory to:
1. **Prefer trusted collaborators** — higher trust scores from past interactions
2. **Learn pricing** — adjust bids based on historical task economics
3. **Improve quality** — remember past feedback patterns
4. **Specialize** — personality drift based on successful task types

---

## Agent-to-Agent Prompting

Agents can generate prompts FOR other agents:

```typescript
// Coordinator generates a specialized prompt for the Developer agent
const developerPrompt = await coordinator.generatePromptFor({
  targetRole: 'developer',
  context: 'Build a React landing page component',
  constraints: ['Must use Tailwind CSS', 'Dark theme', 'Responsive'],
  qualityCriteria: 'Production-ready, clean code',
  priorContext: researcherFindings // From the Researcher agent
});

// Send via AXL to the Developer
await axl.send(developerAgent.peerId, {
  type: 'DELEGATION',
  payload: { prompt: developerPrompt, subtaskId: 'st-003' }
});
```

This creates **infinite execution permutations** — the coordinator's personality influences how it frames tasks for other agents.
