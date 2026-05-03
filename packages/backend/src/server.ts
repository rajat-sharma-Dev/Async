import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { AgentRuntime } from './agents/runtime.js';
import type { AgentRole } from './agents/types.js';
import taskRoutes from './routes/tasks.js';
import agentRoutes from './routes/agents.js';
import { getDeployerBalance, getSigner } from './contracts/index.js';
import { getLLM } from './llm/provider.js';
import { getKeeperHub } from './payments/keeperhub.js';
import { CHAIN_CONFIG, CONTRACT_ADDRESSES } from './types/index.js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const runtime = new AgentRuntime();

app.use(cors());
app.use(express.json());

// Live 0G Chain routes from Rajat's integration layer.
app.use('/api/chain/tasks', taskRoutes);
app.use('/api/chain/agents', agentRoutes);

app.get('/api/health', async (_req, res) => {
  const base = {
    status: 'ok',
    service: 'agentverse-backend',
    version: '0.2.0',
    mode: process.env.AGENTVERSE_DEMO_MODE === 'true' ? 'local-demo' : '0g-ready',
    timestamp: new Date().toISOString(),
    contracts: CONTRACT_ADDRESSES,
    chains: {
      agentVerse: {
        name: CHAIN_CONFIG.name,
        chainId: CHAIN_CONFIG.chainId,
        purpose: 'Agent identity, tasks, auctions',
      },
      payments: {
        name: 'Base',
        chainId: 8453,
        purpose: 'USDC payments via KeeperHub x402',
      },
    },
  };

  try {
    const balance = await getDeployerBalance();
    res.json({ ...base, wallet: { balance: `${balance} A0GI` } });
  } catch (err) {
    res.json({ ...base, wallet: { status: 'not-configured', reason: (err as Error).message } });
  }
});

app.get('/api/events', (_req, res) => {
  res.json({ events: runtime.listTimeline() });
});

app.get('/api/agents', (_req, res) => {
  res.json({ agents: runtime.listAgents() });
});

app.post('/api/agents', (req, res) => {
  const { name, role, personality, ownerAddress } = req.body as {
    name?: string;
    role?: AgentRole;
    personality?: Record<string, number>;
    ownerAddress?: string;
  };

  if (!name || !role) {
    res.status(400).json({ error: 'name and role are required' });
    return;
  }

  const agent = runtime.createAgent({ name, role, personality, ownerAddress });
  res.status(201).json({
    agentId: agent.id,
    tokenId: agent.id.replace(/\D/g, ''),
    txHash: `demo-mint-${agent.id}`,
    axlPeerId: agent.axlPeerId,
    agent,
  });
});

app.get('/api/agents/:id', async (req, res) => {
  const profile = await runtime.getAgentProfile(req.params.id);
  if (!profile) {
    res.status(404).json({ error: 'agent not found' });
    return;
  }
  res.json(profile);
});

app.get('/api/tasks', (_req, res) => {
  res.json({ tasks: runtime.listTasks() });
});

app.post('/api/tasks', async (req, res) => {
  const { description, budget, requesterAddress } = req.body as {
    description?: string;
    budget?: number;
    requesterAddress?: string;
  };

  if (!description || !description.trim()) {
    res.status(400).json({ error: 'description is required' });
    return;
  }

  const task = await runtime.createTask({
    description: description.trim(),
    budget: Number(budget || 1),
    requesterAddress,
  });
  res.status(201).json({ taskId: task.id, txHash: `demo-task-${task.id}`, task });
});

app.get('/api/tasks/:id', (req, res) => {
  const task = runtime.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: 'task not found' });
    return;
  }
  res.json({ task });
});

app.get('/api/tasks/:id/bids', (req, res) => {
  res.json({ bids: runtime.getBids(req.params.id) });
});

app.get('/api/tasks/:id/swarm', (req, res) => {
  const swarm = runtime.getSwarm(req.params.id);
  if (!swarm) {
    res.status(404).json({ error: 'swarm not found' });
    return;
  }
  res.json({ swarm });
});

app.get('/api/payments', (_req, res) => {
  res.json({ payments: runtime.listPayments() });
});

app.get('/api/llm/models', async (_req, res) => {
  try {
    const models = await getLLM().listModels();
    res.json({ count: models.length, models });
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

app.post('/api/llm/chat', async (req, res) => {
  try {
    const { messages, options } = req.body;
    if (!messages?.length) {
      res.status(400).json({ error: 'messages array required' });
      return;
    }
    const response = await getLLM().chatRaw(messages, options || {});
    res.json(response);
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

app.get('/api/payments/spend-cap', async (_req, res) => {
  try {
    const cap = await getKeeperHub().getSpendCap();
    res.json(cap);
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

app.get('/api/payments/workflows', async (_req, res) => {
  try {
    const workflows = await getKeeperHub().listWorkflows();
    res.json(workflows);
  } catch (err) {
    res.status(503).json({ error: (err as Error).message });
  }
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

function sendJson(ws: { send: (message: string) => void }, payload: unknown) {
  ws.send(JSON.stringify(payload));
}

wss.on('connection', (ws) => {
  sendJson(ws, {
    event: 'snapshot',
    data: {
      events: runtime.listTimeline(),
      tasks: runtime.listTasks(),
      agents: runtime.listAgents(),
      contracts: CONTRACT_ADDRESSES,
      chain: CHAIN_CONFIG,
    },
    timestamp: Date.now(),
  });
});

runtime.events.on('event', (item) => {
  const payload = JSON.stringify(item);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
});

export function broadcast(event: string, data: unknown) {
  const payload = JSON.stringify({ event, data, timestamp: Date.now() });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

server.listen(PORT, async () => {
  let walletLine = 'Wallet: not configured';
  try {
    const signer = getSigner();
    const balance = await getDeployerBalance();
    walletLine = `Wallet: ${signer.address} (${balance} A0GI)`;
  } catch {
    walletLine = 'Wallet: not configured (demo mode still works)';
  }

  console.log(
    [
      '',
      'AgentVerse Backend v0.2.0',
      `HTTP -> http://localhost:${PORT}`,
      `WS   -> ws://localhost:${PORT}`,
      `Mode -> ${process.env.AGENTVERSE_DEMO_MODE === 'true' ? 'local-demo' : '0g-ready'}`,
      walletLine,
      `AgentNFT    -> ${CONTRACT_ADDRESSES.AgentNFT}`,
      `TaskManager -> ${CONTRACT_ADDRESSES.TaskManager}`,
      `Auction     -> ${CONTRACT_ADDRESSES.Auction}`,
      '',
    ].join('\n'),
  );
});
