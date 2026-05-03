import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Bot, CheckCircle2, ChevronRight, CircleDollarSign, Send, Sparkles, Zap } from 'lucide-react';
import type { Agent, Task, TimelineEvent } from '../types';
import { ROLE_COLORS, ROLE_EMOJIS, TRAIT_LABELS, apiFetch } from '../types';
import { summarizeNodes, findChainSubmission } from '../main';

interface Health {
  mode: string;
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

interface Props {
  agents: Agent[];
  tasks: Task[];
  events: TimelineEvent[];
  wsConnected: boolean;
  health: Health | null;
  topology: AxlTopology | null;
  onRefresh: () => void;
}

const EVENT_CLASS: Record<string, string> = {
  'task:': 'ev-task', 'swarm:': 'ev-swarm', 'agent:': 'ev-agent',
  'payment:': 'ev-payment', 'chain:': 'ev-chain',
};

function eventClass(ev: string): string {
  return Object.entries(EVENT_CLASS).find(([k]) => ev.startsWith(k))?.[1] ?? '';
}

function summarizeEvent(item: TimelineEvent): string {
  const d = item.data || {};
  if (d.thought) return d.thought;
  if (d.content) return d.content;
  if (d.description) return d.description;
  if (d.result) return String(d.result).slice(0, 160);
  if (d.finalResult) return String(d.finalResult).slice(0, 160);
  if (d.agent?.name) return `${d.agent.name} joined as ${d.agent.role}`;
  if (d.txHash) return `Payment tx: ${String(d.txHash).slice(0, 24)}…`;
  if (d.taskId) return `Task ${d.taskId}`;
  return JSON.stringify(d).slice(0, 160);
}

export default function Dashboard({ agents, tasks, events, wsConnected, health, topology, onRefresh }: Props) {
  const navigate = useNavigate();
  const [description, setDescription] = useState(
    'Build a responsive landing page for a DeFi yield aggregator. Include hero section, features grid, token stats, and a call-to-action.'
  );
  const [budget, setBudget] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTask = tasks[0];
  const completedSubs = activeTask?.subtasks.filter(s => s.status === 'complete').length ?? 0;
  const eventRows = useMemo(() => [...events].reverse().slice(0, 25), [events]);

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ description: description.trim(), budget }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Swarm Dashboard</h1>
            <p className="page-subtitle">Submit tasks and watch autonomous agents collaborate in real-time</p>
          </div>
          <div className="stat-pills">
            <div className="stat-pill"><strong>{agents.length}</strong> agents</div>
            <div className="stat-pill"><strong>{tasks.length}</strong> tasks</div>
            <div className="stat-pill">
              <div className={`wallet-dot ${wsConnected ? 'live' : 'off'}`} />
              {wsConnected ? 'Live' : 'Reconnecting'}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Left: Agents */}
        <aside>
          <div className="panel">
            <div className="panel-header">
              <Bot size={16} />
              <span>Active Agents</span>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={() => navigate('/agents/create')}
              >
                + New
              </button>
            </div>
            <div className="agent-list">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className="agent-card"
                  style={{ '--role-color': ROLE_COLORS[agent.role] } as any}
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '10px 10px 0 0', background: ROLE_COLORS[agent.role] }} />
                  <div className="agent-card-top">
                    <div>
                      <div className="agent-name">{ROLE_EMOJIS[agent.role]} {agent.name}</div>
                    </div>
                    <span className="agent-role-badge" style={{ color: ROLE_COLORS[agent.role], borderColor: ROLE_COLORS[agent.role] + '40', border: '1px solid' }}>
                      {agent.role}
                    </span>
                  </div>
                  <div className="trait-bars">
                    {(Object.entries(agent.personality) as [keyof typeof TRAIT_LABELS, number][]).map(([key, val]) => (
                      <div className="trait-row" key={key}>
                        <span className="trait-label">{TRAIT_LABELS[key]}</span>
                        <div className="trait-bar-bg">
                          <div className="trait-bar-fill" style={{ width: `${val * 100}%`, background: ROLE_COLORS[agent.role] }} />
                        </div>
                        <span className="trait-value">{(val * 100).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="agent-meta">
                    <div className="agent-meta-text">{agent.metadataUri || agent.axlPeerId}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <ChevronRight size={12} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                    <span className="text-xs text-muted">View profile</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Status + Task form + execution */}
        <section style={{ display: 'grid', gap: 18, gridTemplateRows: 'auto auto 1fr' }}>
          {/* Health status panel */}
          {(health || topology) && (
            <div className="statusPanel">
              <div className="metric">
                <span>0G Chain</span>
                <strong>{health?.chains?.agentVerse?.name || 'Checking…'}</strong>
                <small>Chain {health?.chains?.agentVerse?.chainId || '…'}</small>
              </div>
              <div className="metric">
                <span>Wallet</span>
                <strong>{health?.wallet?.balance || health?.wallet?.status || 'Checking…'}</strong>
                <small>{health?.wallet?.reason || 'Runtime bridge ready'}</small>
              </div>
              <div className="metric">
                <span>AXL Network</span>
                <strong style={{ color: topology?.mode === 'p2p-mesh' ? 'var(--green)' : undefined }}>{topology?.mode || 'Checking…'}</strong>
                <small>{summarizeNodes(topology)}</small>
              </div>
            </div>
          )}
          {/* Task form */}
          <div className="panel">
            <div className="panel-header">
              <Send size={16} />
              <span>Submit Task to Swarm</span>
            </div>
            <form className="task-form" onSubmit={submitTask}>
              <div>
                <label className="field-label">Task Description</label>
                <textarea
                  className="field"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what the agent swarm should accomplish..."
                />
              </div>
              <div className="form-row">
                <div>
                  <label className="field-label">Budget (A0GI)</label>
                  <input
                    className="field"
                    type="number"
                    min={0.1} step={0.1}
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    style={{ maxWidth: 160 }}
                  />
                </div>
                <button className="btn btn-primary" type="submit" disabled={isSubmitting || !description.trim()}>
                  {isSubmitting ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Starting…</> : <><Sparkles size={16} /> Run Swarm</>}
                </button>
              </div>
            </form>
          </div>

          {/* Execution view */}
          <div className="panel exec-panel">
            <div className="panel-header">
              <Activity size={16} />
              <span>Execution</span>
              {activeTask && (
                <span className={`status-badge status-${activeTask.status}`} style={{ marginLeft: 'auto' }}>
                  {activeTask.status}
                </span>
              )}
            </div>
            {activeTask ? (
              <>
                <div className="task-summary">
                  <p className="task-desc">{activeTask.description}</p>
                  <div className="subtask-progress">
                    Subtasks: <span>{completedSubs}</span> / {activeTask.subtasks.length || '?'}
                  </div>
                </div>
                <div className="subtask-list">
                  {activeTask.subtasks.map(sub => (
                    <div key={sub.id} className={`subtask-item ${sub.status}`}>
                      <div className="subtask-item-header">
                        <CheckCircle2 size={14} style={{ color: sub.status === 'complete' ? 'var(--green)' : 'var(--text-muted)' }} />
                        <span className="subtask-title">{sub.title}</span>
                        <span className="subtask-role" style={{ color: ROLE_COLORS[sub.assignedRole as keyof typeof ROLE_COLORS] }}>{sub.assignedRole}</span>
                      </div>
                      {sub.result && <p className="subtask-result">{sub.result.slice(0, 300)}{sub.result.length > 300 ? '…' : ''}</p>}
                    </div>
                  ))}
                </div>
                {activeTask.resultHash && (
                  <div className="result-hash">
                    <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="onchain-badge">0G Chain</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {findChainSubmission(events, activeTask.id) || 'Result stored on-chain'}
                        </span>
                      </div>
                      {activeTask.resultHash}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🤖</div>
                <div className="empty-state-title">No active task</div>
                <div className="empty-state-desc">Submit a task above to watch agents bid, form a swarm, and execute in real-time.</div>
              </div>
            )}
          </div>
        </section>

        {/* Right: Live events */}
        <aside className="event-col">
          <div className="panel" style={{ height: '100%' }}>
            <div className="panel-header">
              <Zap size={16} />
              <span>Live Events</span>
              <div className={`wallet-dot ${wsConnected ? 'live' : 'off'}`} style={{ marginLeft: 'auto' }} />
            </div>
            <div className="event-feed">
              {eventRows.length === 0 && (
                <div className="empty-state" style={{ padding: 24 }}>
                  <div className="text-muted text-sm">Events will appear here…</div>
                </div>
              )}
              {eventRows.map(item => (
                <div key={item.id} className="event-item">
                  <div className="event-time">{new Date(item.timestamp).toLocaleTimeString()}</div>
                  <div className={`event-type ${eventClass(item.event)}`}>{item.event}</div>
                  <div className="event-content">{summarizeEvent(item)}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
