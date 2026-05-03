import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, CircleDollarSign, Clock, ExternalLink } from 'lucide-react';
import type { AgentProfile } from '../types';
import { ROLE_COLORS, ROLE_EMOJIS, TRAIT_LABELS, apiFetch } from '../types';

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<AgentProfile>(`/api/agents/${id}`)
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page">
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <div className="empty-state-title">Loading agent profile…</div>
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="page">
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Agent not found</div>
        <div className="empty-state-desc">{error}</div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    </div>
  );

  const { agent, earnings } = profile;
  const color = ROLE_COLORS[agent.role];

  return (
    <div className="page">
      {/* Back */}
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '2.5rem' }}>{ROLE_EMOJIS[agent.role]}</div>
          <div>
            <h1 className="page-title">{agent.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="agent-role-badge" style={{ color, borderColor: color + '40', border: '1px solid' }}>{agent.role}</span>
              <span className="stat-pill" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                {agent.isActive ? '🟢 Active' : '⚪ Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left col */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          {/* Personality */}
          <div className="panel">
            <div className="panel-header"><Bot size={16} /><span>Personality</span></div>
            <div className="panel-body">
              <div className="trait-bars">
                {(Object.entries(agent.personality) as [keyof typeof TRAIT_LABELS, number][]).map(([key, val]) => (
                  <div className="trait-row" key={key} style={{ gridTemplateColumns: '110px 1fr 36px' }}>
                    <span className="trait-label">{TRAIT_LABELS[key]}</span>
                    <div className="trait-bar-bg">
                      <div className="trait-bar-fill" style={{ width: `${val * 100}%`, background: color }} />
                    </div>
                    <span className="trait-value">{(val * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="panel">
            <div className="panel-header"><span>On-Chain Identity</span></div>
            <div className="panel-body" style={{ display: 'grid', gap: 10 }}>
              {[
                ['Agent ID', agent.id],
                ['Wallet', agent.walletAddress],
                ['AXL Peer', agent.axlPeerId],
                ['Node', agent.axlNodeId],
                ['Metadata', agent.metadataUri],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-xs text-muted" style={{ marginBottom: 2 }}>{label}</div>
                  <div className="font-mono text-xs" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{val}</div>
                </div>
              ))}
              {agent.metadataUri?.startsWith('0g://') && (
                <a
                  href={`https://chainscan-galileo.0g.ai/address/${agent.walletAddress}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-accent btn-sm"
                  style={{ marginTop: 6 }}
                >
                  <ExternalLink size={12} /> View on 0G Explorer
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          {/* Earnings */}
          <div className="panel">
            <div className="earnings-bar">
              <div>
                <div className="earnings-label">Total Earnings</div>
                <div className="earnings-number">{earnings.total.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>A0GI</span></div>
              </div>
              <CircleDollarSign size={28} style={{ color: 'var(--green)', opacity: 0.7 }} />
            </div>
            <div className="panel-header" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span>Payment History</span>
              <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{earnings.history.length} payments</span>
            </div>
            {earnings.history.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-state-icon">💸</div>
                <div className="empty-state-title">No payments yet</div>
                <div className="empty-state-desc">Earnings will appear when this agent completes tasks in a swarm.</div>
              </div>
            ) : (
              <div className="payment-list">
                {earnings.history.slice(0, 20).map((p, i) => (
                  <div key={i} className="payment-item">
                    <div>
                      <div className="payment-hash">{p.txHash.slice(0, 32)}…</div>
                      <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                        {p.asset} · {new Date(p.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="payment-amount">+{p.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task history */}
          <div className="panel">
            <div className="panel-header"><Clock size={16} /><span>Task History</span></div>
            {Array.isArray(profile.taskHistory) && profile.taskHistory.length > 0 ? (
              <div className="payment-list">
                {profile.taskHistory.slice(0, 10).map((t: any, i: number) => (
                  <div key={i} className="payment-item">
                    <div>
                      <div className="text-sm font-600">{t.subtaskId || t.taskId}</div>
                      <div className="text-xs text-muted">{t.role} · {t.timestamp ? new Date(t.timestamp).toLocaleString() : '—'}</div>
                    </div>
                    <span className="status-badge status-completed" style={{ fontSize: '0.65rem' }}>done</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-state-title text-muted">No task history</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
