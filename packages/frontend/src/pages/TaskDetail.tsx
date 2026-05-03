import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, Bot, CheckCircle2, Circle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { ROLE_COLORS, ROLE_EMOJIS, apiFetch } from '../types';
import type { Task } from '../types';

interface Bid {
  agentId: string;
  agentName: string;
  amount: number;
  confidence: number;
  proposal: string;
}

interface SwarmInfo {
  id: string;
  coordinatorAgentId: string;
  memberAgentIds: string[];
  taskId: string;
  formedAt: number;
}

const STATUS_COLOR: Record<string, string> = {
  open:      '#55b6ff',
  bidding:   '#f2cc60',
  executing: '#7ee787',
  completed: '#7ee787',
  failed:    '#ff8fab',
};

function statusIcon(s: string) {
  if (s === 'completed') return <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />;
  if (s === 'in_progress') return <Loader2 size={14} style={{ color: '#55b6ff', animation: 'spin 1s linear infinite' }} />;
  return <Circle size={14} style={{ color: 'var(--text-muted)' }} />;
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [swarm, setSwarm] = useState<SwarmInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const [taskRes, bidsRes, swarmRes] = await Promise.allSettled([
          apiFetch<{ task: Task }>(`/api/tasks/${id}`),
          apiFetch<{ bids: Bid[] }>(`/api/tasks/${id}/bids`),
          apiFetch<{ swarm: SwarmInfo }>(`/api/tasks/${id}/swarm`),
        ]);
        if (taskRes.status === 'fulfilled') setTask(taskRes.value.task);
        if (bidsRes.status === 'fulfilled') setBids(bidsRes.value.bids ?? []);
        if (swarmRes.status === 'fulfilled') setSwarm(swarmRes.value.swarm ?? null);
        if (taskRes.status === 'rejected') setError('Task not found');
      } catch {
        setError('Failed to load task');
      } finally {
        setLoading(false);
      }
    }

    void load();
    const interval = setInterval(() => {
      if (!task || task.status === 'completed' || task.status === 'failed') return;
      void load();
    }, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="page">
      <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
    </div>
  );
  if (error || !task) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">{error || 'Task not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>
    </div>
  );

  const completedSubs = task.subtasks.filter(s => s.status === 'complete').length;
  const chainScanBase = 'https://chainscan-galileo.0g.ai';

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Task {task.id}</h1>
            <p className="page-subtitle">{task.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="status-badge" style={{ background: STATUS_COLOR[task.status] + '22', color: STATUS_COLOR[task.status], border: `1px solid ${STATUS_COLOR[task.status]}44` }}>
              {task.status}
            </span>
            {task.onChainTaskId && (
              <a
                href={`${chainScanBase}/tx/${task.onChainTxHash}`}
                target="_blank" rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={12} /> 0G ChainScan
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="create-grid" style={{ gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Main column */}
        <div style={{ display: 'grid', gap: 20 }}>

          {/* Subtasks */}
          <div className="panel">
            <div className="panel-header">
              <Activity size={16} /> <span>Subtasks</span>
              <span className="text-muted text-xs" style={{ marginLeft: 'auto' }}>
                {completedSubs} / {task.subtasks.length} complete
              </span>
            </div>
            {task.subtasks.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-state-desc">Subtasks will appear here once decomposition begins…</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 1, background: 'var(--border-subtle)' }}>
                {task.subtasks.map(sub => (
                  <div key={sub.id} style={{ background: 'var(--bg-panel)', padding: '14px 18px', display: 'grid', gap: 8 }}>
                    <div className="flex items-center gap-2">
                      {statusIcon(sub.status)}
                      <strong style={{ fontSize: '0.875rem' }}>{sub.title}</strong>
                      <span
                        className="agent-role-badge"
                        style={{
                          marginLeft: 'auto',
                          color: ROLE_COLORS[sub.assignedRole as keyof typeof ROLE_COLORS] || 'var(--text-muted)',
                          borderColor: (ROLE_COLORS[sub.assignedRole as keyof typeof ROLE_COLORS] || '#999') + '40',
                          border: '1px solid',
                        }}
                      >
                        {ROLE_EMOJIS[sub.assignedRole as keyof typeof ROLE_EMOJIS] || '🤖'} {sub.assignedRole}
                      </span>
                    </div>
                    {sub.result && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        {sub.result}
                      </p>
                    )}
                    {sub.status !== 'complete' && !sub.result && (
                      <div className="flex items-center gap-2 text-muted text-xs">
                        <Clock size={11} /> Waiting…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Result hash */}
          {task.resultHash && (
            <div className="panel">
              <div className="panel-header">
                <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                <span>On-Chain Result</span>
                <span className="onchain-badge" style={{ marginLeft: 'auto' }}>0G Chain</span>
              </div>
              <div style={{ padding: '16px 20px', display: 'grid', gap: 10 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--green)', lineHeight: 1.6 }}>
                  {task.resultHash}
                </div>
                {task.onChainTxHash && (
                  <a
                    href={`${chainScanBase}/tx/${task.onChainTxHash}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: 'var(--accent)', fontSize: '0.8rem' }}
                  >
                    View on 0G ChainScan ↗
                  </a>
                )}
                {task.finalResult && (
                  <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.8125rem', lineHeight: 1.55 }}>
                    {task.finalResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>

          {/* Task meta */}
          <div className="panel">
            <div className="panel-header"><span>Details</span></div>
            <div style={{ display: 'grid', gap: 1, background: 'var(--border-subtle)' }}>
              {(
                [
                  ['Budget', `${task.budget} A0GI`] as const,
                  ['Requester', task.requester ? `${task.requester.slice(0, 8)}…${task.requester.slice(-4)}` : '—'] as const,
                  ['Created', new Date(task.createdAt).toLocaleString()] as const,
                  ...(task.completedAt ? [['Completed', new Date(task.completedAt).toLocaleString()] as const] : []),
                  ...(swarm ? [['Swarm Size', `${swarm.memberAgentIds.length} agents`] as const] : []),
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} style={{ background: 'var(--bg-panel)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Swarm members */}
          {swarm && (
            <div className="panel">
              <div className="panel-header"><Bot size={16} /><span>Swarm</span></div>
              <div style={{ padding: '12px 16px', display: 'grid', gap: 8 }}>
                {swarm.memberAgentIds.map(agentId => (
                  <div key={agentId} className="flex items-center gap-2">
                    <span style={{ fontSize: '0.75rem' }}>
                      {agentId === swarm.coordinatorAgentId ? '👑' : '🤖'}
                    </span>
                    <span style={{ fontSize: '0.8125rem' }}>{agentId}</span>
                    {agentId === swarm.coordinatorAgentId && (
                      <span className="onchain-badge" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>Coordinator</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bids */}
          {bids.length > 0 && (
            <div className="panel">
              <div className="panel-header"><span>Bids ({bids.length})</span></div>
              <div style={{ display: 'grid', gap: 1, background: 'var(--border-subtle)' }}>
                {bids.map((bid, i) => (
                  <div key={i} style={{ background: 'var(--bg-panel)', padding: '10px 16px' }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{bid.agentName || bid.agentId}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>{bid.amount} A0GI</span>
                    </div>
                    {bid.confidence !== undefined && (
                      <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Confidence: {(bid.confidence * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
