import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Bot, CircleDollarSign, LayoutDashboard, Wallet } from 'lucide-react';
import './styles.css';

import { useWallet } from './hooks/useWallet';
import { useWebSocket } from './hooks/useWebSocket';
import { apiFetch } from './types';
import type { Agent, Task } from './types';

import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import AgentProfilePage from './pages/AgentProfile';
import TaskDetail from './pages/TaskDetail';
import Payments from './pages/Payments';

// ── Types (health + topology from Pranav) ─────────────────────────────────
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

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav({ wsConnected, health }: { wsConnected: boolean; health: Health | null }) {
  const { address, balance, isConnecting, connect, disconnect, shortAddress, isOnOGChain } = useWallet();

  return (
    <nav className="nav">
      <div className="nav-brand">
        <div className="nav-brand-dot" />
        AgentVerse
      </div>

      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={15} /> Dashboard
        </NavLink>
        <NavLink to="/agents/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bot size={15} /> Create Agent
        </NavLink>
        <NavLink to="/payments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <CircleDollarSign size={15} /> Payments
        </NavLink>
      </div>

      <div className="nav-right">
        {/* Network badge */}
        <div className="network-badge" title={health?.chains?.agentVerse?.name}>
          <div className={`wallet-dot ${wsConnected ? 'live' : 'off'}`} />
          {health?.chains?.agentVerse?.name || '0G Testnet'}
        </div>

        {health?.wallet?.balance && (
          <div className="network-badge" style={{ background: 'rgba(126,231,135,0.08)', borderColor: 'rgba(126,231,135,0.2)', color: 'var(--green)' }}>
            {health.wallet.balance.split(' ')[0]} A0GI
          </div>
        )}

        {/* Wallet */}
        {address ? (
          <button className="wallet-btn connected" onClick={disconnect}>
            <div className="wallet-dot live" />
            {shortAddress}
            {balance && <span style={{ opacity: 0.7 }}>· {balance} A0GI</span>}
            {!isOnOGChain && <span style={{ color: 'var(--gold)' }}>⚠ Wrong chain</span>}
          </button>
        ) : (
          <button className="wallet-btn disconnected" onClick={connect} disabled={isConnecting}>
            <Wallet size={14} />
            {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
          </button>
        )}
      </div>
    </nav>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [topology, setTopology] = useState<AxlTopology | null>(null);

  const { events, connected, registerSnapshotHandler } = useWebSocket();
  const { address } = useWallet();

  const refresh = useCallback(async () => {
    try {
      const [aRes, tRes] = await Promise.all([
        apiFetch<{ agents: Agent[] }>('/api/agents'),
        apiFetch<{ tasks: Task[] }>('/api/tasks'),
      ]);
      setAgents(aRes.agents);
      setTasks(tRes.tasks);
    } catch { /* non-fatal */ }
  }, []);

  const refreshMeta = useCallback(async () => {
    try {
      const [h, t] = await Promise.all([
        apiFetch<Health>('/api/health'),
        apiFetch<AxlTopology>('/api/axl/topology'),
      ]);
      setHealth(h);
      setTopology(t);
    } catch { /* non-fatal */ }
  }, []);

  // Hydrate from WS snapshot
  useEffect(() => {
    registerSnapshotHandler((data) => {
      if (data.agents) setAgents(data.agents);
      if (data.tasks) setTasks(data.tasks);
    });
  }, [registerSnapshotHandler]);

  // Poll on events
  useEffect(() => {
    const last = events[events.length - 1];
    if (!last) return;
    const e = last.event;
    if (e.startsWith('task:') || e.startsWith('swarm:') || e.startsWith('payment:') || e.startsWith('chain:')) {
      void refresh();
    }
  }, [events, refresh]);

  // Initial load
  useEffect(() => {
    void refresh();
    void refreshMeta();
  }, [refresh, refreshMeta]);

  return (
    <BrowserRouter>
      <div className="app-bg" />
      <div className="app-root">
        <Nav wsConnected={connected} health={health} />
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                agents={agents}
                tasks={tasks}
                events={events}
                wsConnected={connected}
                health={health}
                topology={topology}
                walletAddress={address || undefined}
                onRefresh={refresh}
              />
            }
          />
          <Route path="/agents/create" element={<CreateAgent />} />
          <Route path="/agents/:id" element={<AgentProfilePage />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ── Utilities (re-exported for pages) ─────────────────────────────────────
export function summarizeNodes(topology: AxlTopology | null): string {
  if (!topology) return 'Node status loading';
  const entries = Object.entries(topology.nodes || {});
  if (!entries.length) return 'No nodes reported';
  return entries.map(([node, value]) => `${node}: ${value.status || 'reachable'}`).join(', ');
}

export function findChainSubmission(
  events: Array<{ id: string; event: string; data: any; timestamp: number }>,
  taskId: string
): string | null {
  const event = [...events].reverse().find(
    (item) => item.event === 'chain:resultSubmitted' && item.data?.taskId === taskId,
  );
  if (!event) return null;
  if (event.data?.explorer) return `Explorer: ${event.data.explorer}`;
  if (event.data?.onChainTaskId) return `0G task #${event.data.onChainTaskId}`;
  return 'On-chain bridge skipped in local mode';
}

createRoot(document.getElementById('root')!).render(<App />);
