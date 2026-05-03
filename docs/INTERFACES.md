# 🔌 INTERFACES.md — Shared APIs, Types & Contracts

> **This is the single source of truth** for all shared interfaces between frontend, backend, contracts, and integrations. Both Rajat and Pranav MUST code against these types.

---

## Core Types

```typescript
// ============================================
// AGENT TYPES
// ============================================

type AgentRole = 'coordinator' | 'developer' | 'researcher' | 'critic' | 'trader';

interface PersonalityVector {
  riskTolerance: number;     // 0.0 - 1.0
  creativity: number;        // 0.0 - 1.0
  costSensitivity: number;   // 0.0 - 1.0
  thoroughness: number;      // 0.0 - 1.0
  independence: number;      // 0.0 - 1.0
}

interface Agent {
  id: string;                    // On-chain iNFT token ID
  name: string;
  role: AgentRole;
  personality: PersonalityVector;
  walletAddress: string;
  axlPeerId: string;             // AXL public key
  axlNodeId: string;             // Which AXL node this agent is on
  memoryKey: string;             // 0G KV namespace prefix
  metadataUri: string;           // 0G Storage hash for full metadata
  isActive: boolean;
  createdAt: number;
}

interface AgentInstance {
  agent: Agent;
  isActive: boolean;
  currentTask: string | null;    // taskId
  currentSwarm: string | null;   // swarmId
}

// ============================================
// TASK TYPES
// ============================================

type TaskStatus = 'open' | 'bidding' | 'in_progress' | 'review' | 'completed' | 'failed';

interface Task {
  id: string;
  description: string;
  requester: string;             // wallet address
  budget: number;                // in native tokens
  status: TaskStatus;
  coordinatorAgentId: string;
  subtasks: Subtask[];
  swarmId: string;
  resultHash: string;            // 0G Storage hash
  createdAt: number;
  completedAt: number;
}

interface Subtask {
  id: string;
  title: string;
  description: string;
  assignedRole: AgentRole;
  assignedAgentId: string;
  dependencies: string[];        // Subtask IDs
  estimatedCost: number;
  status: 'pending' | 'in_progress' | 'review' | 'complete' | 'failed';
  result: string;
  attempts: number;
}

// ============================================
// BID TYPES
// ============================================

interface Bid {
  agentId: string;
  taskId: string;
  amount: number;
  confidence: number;            // 0.0 - 1.0
  role: AgentRole;
  proposal: string;              // LLM-generated approach description
  timestamp: number;
}

interface BidDecision {
  shouldBid: boolean;
  bidAmount: number;
  confidence: number;
  proposal: string;
}

// ============================================
// SWARM TYPES
// ============================================

interface Swarm {
  id: string;
  taskId: string;
  coordinatorAgentId: string;
  memberAgentIds: string[];
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  createdAt: number;
}

// ============================================
// AXL MESSAGE TYPES
// ============================================

type MessageType =
  | 'TASK_BROADCAST'
  | 'BID'
  | 'SWARM_INVITE'
  | 'SWARM_ACK'
  | 'DELEGATION'
  | 'PROGRESS'
  | 'RESULT'
  | 'REVIEW_REQUEST'
  | 'REVIEW_FEEDBACK'
  | 'ADAPTATION'
  | 'PAYMENT_REQUEST'
  | 'PAYMENT_CONFIRM'
  | 'HEARTBEAT';

interface AXLMessage {
  type: MessageType;
  from: string;                  // AXL peer ID
  to: string;                   // AXL peer ID or 'broadcast'
  taskId?: string;
  swarmId?: string;
  payload: any;
  timestamp: number;
  nonce: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

interface PaymentRequest {
  from: string;                  // Payer wallet
  to: string;                   // Payee wallet
  amount: number;
  asset: string;                 // Token contract address
  reason: string;
  taskId: string;
  subtaskId: string;
}

interface PaymentReceipt {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// ============================================
// WEBSOCKET EVENT TYPES (Frontend ↔ Backend)
// ============================================

interface WSEvent_TaskCreated {
  event: 'task:created';
  data: { taskId: string; description: string; budget: number };
}

interface WSEvent_BidReceived {
  event: 'task:bidReceived';
  data: { taskId: string; agentId: string; agentName: string; amount: number; role: AgentRole };
}

interface WSEvent_SwarmFormed {
  event: 'swarm:formed';
  data: { taskId: string; swarmId: string; agents: Agent[]; coordinatorId: string };
}

interface WSEvent_AgentMessage {
  event: 'agent:message';
  data: { from: string; to: string; type: MessageType; content: string; timestamp: number };
}

interface WSEvent_AgentThinking {
  event: 'agent:thinking';
  data: { agentId: string; thought: string };
}

interface WSEvent_SubtaskComplete {
  event: 'task:subtaskComplete';
  data: { taskId: string; subtaskId: string; result: string };
}

interface WSEvent_PaymentSent {
  event: 'payment:sent';
  data: { from: string; to: string; amount: number; txHash: string };
}

interface WSEvent_TaskComplete {
  event: 'task:complete';
  data: { taskId: string; finalResult: string; payments: PaymentReceipt[] };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// POST /api/tasks
interface CreateTaskRequest {
  description: string;
  budget: number;
  requesterAddress: string;
}

interface CreateTaskResponse {
  taskId: string;
  txHash: string;
}

// POST /api/agents
interface CreateAgentRequest {
  name: string;
  role: AgentRole;
  personality: PersonalityVector;
  ownerAddress: string;
}

interface CreateAgentResponse {
  agentId: string;
  tokenId: string;
  txHash: string;
  axlPeerId: string;
}

// GET /api/agents/:id
interface AgentProfileResponse {
  agent: Agent;
  memory: any;
  earnings: { total: number; history: PaymentReceipt[] };
  taskHistory: { taskId: string; role: string; result: string; timestamp: number }[];
}
```

---

## Contract ABIs (Key Functions)

### AgentNFT

```typescript
const AGENT_NFT_ABI = [
  "function mintAgent(string name, string role, string metadataUri) returns (uint256)",
  "function updateMetadata(uint256 tokenId, string newUri)",
  "function getAgent(uint256 tokenId) view returns (tuple(string name, string role, string metadataUri, uint256 createdAt, bool active))",
  "function isActiveAgent(uint256 tokenId) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event AgentRegistered(uint256 indexed tokenId, address indexed owner, string role, string name)"
];
```

### TaskManager

```typescript
const TASK_MANAGER_ABI = [
  "function createTask(string description) payable returns (uint256)",
  "function submitBid(uint256 taskId, uint256 agentId, uint256 amount, uint256 confidence, string role, string proposal)",
  "function formSwarm(uint256 taskId, uint256[] agentIds, uint256 coordinatorId)",
  "function submitResult(uint256 taskId, string resultHash)",
  "function distributePayment(uint256 taskId, uint256[] agentIds, uint256[] amounts, address[] wallets)",
  "function getTask(uint256 taskId) view returns (tuple(uint256 id, address requester, string description, uint256 budget, uint8 status, uint256 coordinatorAgentId, uint256 createdAt, uint256 completedAt, string resultHash))",
  "event TaskCreated(uint256 indexed taskId, address indexed requester, string description, uint256 budget)",
  "event SwarmFormed(uint256 indexed taskId, uint256[] agentIds, uint256 coordinatorId)",
  "event TaskCompleted(uint256 indexed taskId, string resultHash)"
];
```

---

## Integration Points

| From | To | Interface | Transport |
|------|----|-----------|-----------|
| Frontend → Backend | REST API | `CreateTaskRequest/Response` | HTTP |
| Frontend ← Backend | WebSocket | `WSEvent_*` types | WS |
| Frontend → 0G Chain | Contract ABI | `AGENT_NFT_ABI`, `TASK_MANAGER_ABI` | ethers.js |
| Backend → AXL | HTTP API | `AXLMessage` | localhost HTTP |
| Backend → 0G Storage | SDK | `ZeroGMemory` class | 0G TS SDK |
| Backend → KeeperHub | REST API | `PaymentRequest/Receipt` | HTTP + x402 |
| Agent ↔ Agent | AXL P2P | `AXLMessage` | AXL mesh |
