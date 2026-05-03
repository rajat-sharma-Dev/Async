import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, Bot, Brain, CheckCircle2, CircleDollarSign, Network, Send, Sparkles } from 'lucide-react';
import './styles.css';

type AgentRole = 'coordinator' | 'developer' | 'researcher' | 'critic' | 'trader';

interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  personality: Record<string, number>;
  axlNodeId: string;
  metadataUri: string;
}

interface Subtask {
  id: string;
  title: string;
  assignedRole: AgentRole;
  assignedAgentId: string;
  status: string;
  result: string;
}

interface Task {
  id: string;
  description: string;
  budget: number;
  status: string;
  coordinatorAgentId: string;
  subtasks: Subtask[];
  resultHash: string;
  finalResult: string;
  onChainTaskId?: number;
  onChainTxHash?: string | null;
}

interface TimelineEvent {
  id: string;
  event: string;
  data: any;
  timestamp: number;
}

interface Health {
  mode: string;
  contracts?: Record<string, string>;
  chains?: {
    agentVerse?: { name: string; chainId: number };
    payments?: { name: string; chainId: number };
  };
  wallet?: { balance?: string; status?: string; reason?: string };
}

interface AxlTopology {
  mode: string;
  nodes: Record<string, { status?: string }>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

function roleColor(role: AgentRole) {
  return {
    coordinator: '#55b6ff',
    developer: '#7ee787',
    researcher: '#f2cc60',
    critic: '#ff8fab',
    trader: '#c297ff',
  }[role];
}

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [description, setDescription] = useState(
    'Build a responsive landing page for a DeFi yield aggregator. Include hero section, features grid, token stats, and a call-to-action.',
  );
  const [budget, setBudget] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [topology, setTopology] = useState<AxlTopology | null>(null);

  async function refresh() {
    const [agentRes, taskRes, eventRes, healthRes, topologyRes] = await Promise.all([
      fetch(`${API_URL}/api/agents`),
      fetch(`${API_URL}/api/tasks`),
      fetch(`${API_URL}/api/events`),
      fetch(`${API_URL}/api/health`),
      fetch(`${API_URL}/api/axl/topology`),
    ]);
    setAgents((await agentRes.json()).agents);
    setTasks((await taskRes.json()).tasks);
    setEvents((await eventRes.json()).events);
    setHealth(await healthRes.json());
    setTopology(await topologyRes.json());
  }

  useEffect(() => {
    void refresh();
    const ws = new WebSocket(WS_URL);
    ws.onmessage = (message) => {
      const item = JSON.parse(message.data);
      if (item.event === 'snapshot') {
        setAgents(item.data.agents);
        setTasks(item.data.tasks);
        setEvents(item.data.events);
        return;
      }
      setEvents((current) => [...current.slice(-160), item]);
      if (item.event.startsWith('task:') || item.event.startsWith('swarm:') || item.event.startsWith('payment:')) {
        void refresh();
      }
    };
    return () => ws.close();
  }, []);

  async function submitTask(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, budget, requesterAddress: 'demo-requester' }),
      });
      await refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeTask = tasks[0];
  const completedCount = activeTask?.subtasks.filter((subtask) => subtask.status === 'complete').length || 0;
  const eventRows = useMemo(() => [...events].reverse().slice(0, 18), [events]);

  return (
    <main>
      <section className="topbar">
        <div>
          <h1>AgentVerse</h1>
          <p>0G-native autonomous swarm runtime</p>
        </div>
        <div className="statusPills">
          <span><Network size={16} /> {topology?.mode || 'AXL checking'}</span>
          <span><Brain size={16} /> {health?.mode || 'runtime checking'}</span>
          <span><CircleDollarSign size={16} /> {health?.chains?.payments?.name || 'payments'} {health?.chains?.payments?.chainId || ''}</span>
        </div>
      </section>

      <section className="layout">
        <aside className="panel agentsPanel">
          <div className="panelHeader">
            <Bot size={18} />
            <h2>Agents</h2>
          </div>
          <div className="agentList">
            {agents.map((agent) => (
              <article className="agentCard" key={agent.id} style={{ borderColor: roleColor(agent.role) }}>
                <div className="agentTop">
                  <strong>{agent.name}</strong>
                  <span>{agent.role}</span>
                </div>
                <div className="bars">
                  {Object.entries(agent.personality).map(([key, value]) => (
                    <label key={key}>
                      <span>{key.replace(/[A-Z]/g, (match) => ` ${match}`).toLowerCase()}</span>
                      <meter min="0" max="1" value={value} />
                    </label>
                  ))}
                </div>
                <small>{agent.metadataUri}</small>
              </article>
            ))}
          </div>
        </aside>

        <section className="workbench">
          <section className="panel statusPanel">
            <div className="metric">
              <span>0G Chain</span>
              <strong>{health?.chains?.agentVerse?.name || 'Checking'}</strong>
              <small>Chain {health?.chains?.agentVerse?.chainId || '...'}</small>
            </div>
            <div className="metric">
              <span>Wallet</span>
              <strong>{health?.wallet?.balance || health?.wallet?.status || 'Checking'}</strong>
              <small>{health?.wallet?.reason || 'Runtime bridge ready'}</small>
            </div>
            <div className="metric">
              <span>AXL</span>
              <strong>{topology?.mode || 'Checking'}</strong>
              <small>{summarizeNodes(topology)}</small>
            </div>
          </section>

          <form className="panel taskForm" onSubmit={submitTask}>
            <div className="panelHeader">
              <Send size={18} />
              <h2>Submit Task</h2>
            </div>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            <div className="formRow">
              <label>
                Budget
                <input min="0.1" step="0.1" type="number" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
              </label>
              <button disabled={isSubmitting || !description.trim()} type="submit">
                <Sparkles size={16} />
                {isSubmitting ? 'Starting' : 'Run Swarm'}
              </button>
            </div>
          </form>

          <section className="panel executionPanel">
            <div className="panelHeader">
              <Activity size={18} />
              <h2>Execution</h2>
            </div>
            {activeTask ? (
              <>
                <div className="taskSummary">
                  <span className={`taskStatus ${activeTask.status}`}>{activeTask.status}</span>
                  <p>{activeTask.description}</p>
                  <strong>{completedCount}/{activeTask.subtasks.length || 4} subtasks complete</strong>
                </div>
                <div className="subtasks">
                  {activeTask.subtasks.map((subtask) => (
                    <article key={subtask.id}>
                      <div>
                        <CheckCircle2 size={16} />
                        <strong>{subtask.title}</strong>
                      </div>
                      <span>{subtask.assignedRole}</span>
                      <p>{subtask.result || 'Waiting for agent output...'}</p>
                    </article>
                  ))}
                </div>
                {activeTask.resultHash && (
                  <div className="resultHash">
                    <span>{activeTask.resultHash}</span>
                    {findChainSubmission(events, activeTask.id) && <span>{findChainSubmission(events, activeTask.id)}</span>}
                  </div>
                )}
              </>
            ) : (
              <div className="empty">Submit a task to watch agents bid, form a swarm, execute subtasks, and write a final 0G result hash.</div>
            )}
          </section>
        </section>

        <aside className="panel eventPanel">
          <div className="panelHeader">
            <Activity size={18} />
            <h2>Live Events</h2>
          </div>
          <div className="eventList">
            {eventRows.map((item) => (
              <article key={item.id}>
                <time>{new Date(item.timestamp).toLocaleTimeString()}</time>
                <strong>{item.event}</strong>
                <p>{summarizeEvent(item)}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function summarizeEvent(item: TimelineEvent): string {
  const data = item.data || {};
  if (data.thought) return data.thought;
  if (data.content) return data.content;
  if (data.description) return data.description;
  if (data.result) return String(data.result).slice(0, 180);
  if (data.finalResult) return String(data.finalResult).slice(0, 180);
  if (data.agent?.name) return `${data.agent.name} joined as ${data.agent.role}`;
  if (data.taskId) return `Task ${data.taskId}`;
  return JSON.stringify(data).slice(0, 180);
}

function summarizeNodes(topology: AxlTopology | null): string {
  if (!topology) return 'Node status loading';
  const entries = Object.entries(topology.nodes || {});
  if (!entries.length) return 'No nodes reported';
  return entries.map(([node, value]) => `${node}: ${value.status || 'reachable'}`).join(', ');
}

function findChainSubmission(events: TimelineEvent[], taskId: string): string | null {
  const event = [...events].reverse().find((item) => item.event === 'chain:resultSubmitted' && item.data?.taskId === taskId);
  if (!event) return null;
  if (event.data?.explorer) return `Explorer: ${event.data.explorer}`;
  if (event.data?.onChainTaskId) return `0G task #${event.data.onChainTaskId}`;
  return 'On-chain bridge skipped in local mode';
}

createRoot(document.getElementById('root')!).render(<App />);
