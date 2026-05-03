import { EventEmitter } from 'events';
import crypto from 'crypto';
import { createConfiguredAXLClients } from '../axl/client.js';
import { createLLMProvider, type LLMProvider } from '../llm/provider.js';
import { ZeroGMemory } from '../storage/zerog.js';
import { createSwarm } from '../swarm/auction.js';
import { decomposeTask } from '../swarm/decomposer.js';
import {
  buildSystemPrompt,
  createDefaultAgents,
  normalizePersonality,
  shouldBidOnTask,
} from './personality.js';
import type {
  Agent,
  AgentRole,
  Bid,
  PaymentReceipt,
  PersonalityVector,
  Swarm,
  Task,
  TimelineEvent,
} from './types.js';

export class AgentRuntime {
  readonly events = new EventEmitter();
  private readonly memory = new ZeroGMemory();
  private readonly llm: LLMProvider = createLLMProvider();
  private readonly axlClients = createConfiguredAXLClients();
  private readonly agents = new Map<string, Agent>();
  private readonly tasks = new Map<string, Task>();
  private readonly bids = new Map<string, Bid[]>();
  private readonly swarms = new Map<string, Swarm>();
  private readonly payments: PaymentReceipt[] = [];
  private readonly timeline: TimelineEvent[] = [];
  private nextAgentId = 1;
  private nextTaskId = 1;

  constructor() {
    for (const agent of createDefaultAgents()) {
      this.createAgent(agent);
    }
  }

  listAgents(): Agent[] {
    return [...this.agents.values()];
  }

  listTasks(): Task[] {
    return [...this.tasks.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  listPayments(): PaymentReceipt[] {
    return this.payments;
  }

  listTimeline(): TimelineEvent[] {
    return this.timeline.slice(-200);
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getBids(taskId: string): Bid[] {
    return this.bids.get(taskId) || [];
  }

  getSwarm(taskId: string): Swarm | undefined {
    return [...this.swarms.values()].find((swarm) => swarm.taskId === taskId);
  }

  async getAgentProfile(id: string): Promise<{ agent: Agent; memory: unknown; taskHistory: unknown[]; earnings: { total: number; history: PaymentReceipt[] } } | null> {
    const agent = this.agents.get(id);
    if (!agent) return null;
    const numericId = Number(agent.id.replace(/\D/g, '')) || 0;
    const memory = await this.memory.getAgentMemory(numericId);
    const taskHistory = await this.memory.getTaskHistory(numericId);
    const history = this.payments.filter((payment) => payment.to === agent.walletAddress || payment.to === agent.id);
    return {
      agent,
      memory,
      taskHistory,
      earnings: { total: history.reduce((sum, payment) => sum + payment.amount, 0), history },
    };
  }

  createAgent(input: {
    name: string;
    role: AgentRole;
    personality?: Partial<PersonalityVector>;
    walletAddress?: string;
    ownerAddress?: string;
    axlNodeId?: string;
    axlPeerId?: string;
    memoryKey?: string;
    metadataUri?: string;
    isActive?: boolean;
  }): Agent {
    const id = `agent-${this.nextAgentId++}`;
    const agent: Agent = {
      id,
      name: input.name,
      role: input.role,
      personality: normalizePersonality(input.personality || {}, input.role),
      walletAddress: input.walletAddress || input.ownerAddress || `demo-wallet-${id}`,
      axlPeerId: input.axlPeerId || `local-peer-${id}`,
      axlNodeId: input.axlNodeId || (this.nextAgentId % 2 === 0 ? 'node-a' : 'node-b'),
      memoryKey: input.memoryKey || `agent:${id}:memory`,
      metadataUri: input.metadataUri || `0g://metadata/${id}`,
      isActive: input.isActive ?? true,
      createdAt: Date.now(),
    };
    this.agents.set(agent.id, agent);
    this.emit('agent:created', { agent });
    return agent;
  }

  async createTask(input: { description: string; budget: number; requesterAddress?: string }): Promise<Task> {
    const task: Task = {
      id: `task-${this.nextTaskId++}`,
      description: input.description,
      requester: input.requesterAddress || 'demo-requester',
      budget: Number(input.budget || 1),
      status: 'open',
      coordinatorAgentId: '',
      subtasks: [],
      swarmId: '',
      resultHash: '',
      finalResult: '',
      createdAt: Date.now(),
      completedAt: 0,
    };
    this.tasks.set(task.id, task);
    this.emit('task:created', { taskId: task.id, description: task.description, budget: task.budget });
    void this.runTaskLifecycle(task.id);
    return task;
  }

  private async runTaskLifecycle(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      task.status = 'bidding';
      this.emit('agent:message', {
        from: 'backend',
        to: 'broadcast',
        type: 'TASK_BROADCAST',
        content: task.description,
        timestamp: Date.now(),
      });

      const bids: Bid[] = [];
      for (const agent of this.listAgents().filter((candidate) => candidate.isActive)) {
        const decision = shouldBidOnTask(agent, task);
        this.emit('agent:thinking', {
          agentId: agent.id,
          thought: `${agent.name} evaluated the task: confidence ${decision.confidence}, bid ${decision.shouldBid ? decision.bidAmount : 'abstain'}.`,
        });
        if (decision.shouldBid) {
          const bid: Bid = {
            agentId: agent.id,
            taskId: task.id,
            amount: decision.bidAmount,
            confidence: decision.confidence,
            role: agent.role,
            proposal: decision.proposal,
            timestamp: Date.now(),
          };
          bids.push(bid);
          this.emit('task:bidReceived', {
            taskId: task.id,
            agentId: agent.id,
            agentName: agent.name,
            amount: bid.amount,
            role: agent.role,
          });
        }
      }
      this.bids.set(task.id, bids);

      const swarm = createSwarm(task.id, bids, this.listAgents());
      this.swarms.set(swarm.id, swarm);
      task.status = 'in_progress';
      task.swarmId = swarm.id;
      task.coordinatorAgentId = swarm.coordinatorAgentId;
      const swarmAgents = swarm.memberAgentIds.map((id) => this.agents.get(id)).filter((agent): agent is Agent => Boolean(agent));
      this.emit('swarm:formed', { taskId: task.id, swarmId: swarm.id, agents: swarmAgents, coordinatorId: swarm.coordinatorAgentId });

      task.subtasks = await decomposeTask(task, swarmAgents, this.llm);
      for (const subtask of task.subtasks) {
        subtask.assignedAgentId =
          swarmAgents.find((agent) => agent.role === subtask.assignedRole)?.id || swarm.coordinatorAgentId;
      }
      this.emit('task:decomposed', { taskId: task.id, subtasks: task.subtasks });

      for (const subtask of task.subtasks) {
        const agent = this.agents.get(subtask.assignedAgentId);
        if (!agent) continue;
        subtask.status = 'in_progress';
        subtask.attempts += 1;
        this.emit('agent:message', {
          from: task.coordinatorAgentId,
          to: agent.id,
          type: 'DELEGATION',
          content: subtask.description,
          timestamp: Date.now(),
        });
        const memory = await this.safeGetAgentMemory(agent.id);
        const prompt = `${buildSystemPrompt(agent, memory)}

Task: ${task.description}
Subtask: ${subtask.title}
Subtask detail: ${subtask.description}
Return the agent's concrete result in 4-8 bullet points.`;
        const output = await this.safeComplete(prompt, agent, subtask.title);
        subtask.result = output;
        subtask.status = 'complete';
        this.emit('task:subtaskComplete', { taskId: task.id, subtaskId: subtask.id, result: output });
        await this.safeAppendTaskResult(agent.id, {
          taskId: task.id,
          subtaskId: subtask.id,
          role: agent.role,
          result: output,
          timestamp: Date.now(),
        });
      }

      const critic = swarmAgents.find((agent) => agent.role === 'critic');
      if (critic) {
        this.emit('agent:message', {
          from: task.coordinatorAgentId,
          to: critic.id,
          type: 'REVIEW_REQUEST',
          content: 'Review all subtask outputs before final aggregation.',
          timestamp: Date.now(),
        });
      }

      task.status = 'completed';
      task.completedAt = Date.now();
      task.finalResult = this.composeFinalResult(task, swarmAgents);
      task.resultHash = this.makeDemoResultHash(task);
      this.createPaymentReceipts(task, swarmAgents);
      this.emit('task:complete', {
        taskId: task.id,
        finalResult: task.finalResult,
        resultHash: task.resultHash,
        payments: this.payments.filter((payment) => payment.txHash.includes(task.id)),
      });
    } catch (error) {
      task.status = 'failed';
      this.emit('task:failed', { taskId, error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async safeComplete(prompt: string, agent: Agent, fallbackTitle: string): Promise<string> {
    try {
      return await this.llm.complete(prompt, { maxTokens: 800, temperature: 0.35 });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      return `${agent.name} completed "${fallbackTitle}" in local demo mode. Live 0G Compute call was skipped or unavailable: ${reason}`;
    }
  }

  private async safeGetAgentMemory(agentId: string): Promise<unknown> {
    const numericId = Number(agentId.replace(/\D/g, '')) || 0;
    try {
      return await this.memory.getAgentMemory(numericId);
    } catch {
      return { recentContext: '', learnings: [], preferences: {} };
    }
  }

  private async safeAppendTaskResult(agentId: string, result: unknown): Promise<void> {
    const numericId = Number(agentId.replace(/\D/g, '')) || 0;
    try {
      await this.memory.appendTaskResult(numericId, result);
    } catch {
      // The storage wrapper logs live 0G errors. Demo execution should continue.
    }
  }

  private composeFinalResult(task: Task, agents: Agent[]): string {
    const lines = task.subtasks.map((subtask) => {
      const agent = this.agents.get(subtask.assignedAgentId);
      return `## ${subtask.title}\nOwner: ${agent?.name || subtask.assignedAgentId}\n${subtask.result}`;
    });
    return `# AgentVerse Swarm Result\n\nTask: ${task.description}\n\nSwarm: ${agents.map((agent) => `${agent.name} (${agent.role})`).join(', ')}\n\n${lines.join('\n\n')}`;
  }

  private makeDemoResultHash(task: Task): string {
    const digest = crypto.createHash('sha256').update(JSON.stringify(task)).digest('hex');
    return `0g://result/${digest}`;
  }

  private createPaymentReceipts(task: Task, agents: Agent[]): void {
    const share = Number((task.budget / Math.max(agents.length, 1)).toFixed(2));
    for (const agent of agents) {
      const receipt: PaymentReceipt = {
        txHash: `demo-${task.id}-${agent.id}`,
        from: task.coordinatorAgentId || task.requester,
        to: agent.id,
        amount: share,
        asset: '0G-demo',
        timestamp: Date.now(),
        status: 'confirmed',
      };
      this.payments.push(receipt);
      this.emit('payment:confirmed', receipt);
    }
  }

  private emit(event: string, data: unknown): void {
    const item = { id: crypto.randomUUID(), event, data, timestamp: Date.now() };
    this.timeline.push(item);
    this.events.emit('event', item);
    this.events.emit(event, data);
  }
}
