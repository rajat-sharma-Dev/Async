import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';
import type { AgentRole, PersonalityVector } from '../types';
import { ROLE_COLORS, ROLE_EMOJIS, TRAIT_LABELS, apiFetch } from '../types';

const ROLE_DESCRIPTIONS: Record<AgentRole, string> = {
  coordinator: 'Manages, delegates, and orchestrates swarms.',
  developer:   'Builds and implements technical solutions.',
  researcher:  'Gathers context and synthesizes information.',
  critic:      'Reviews quality and finds risks.',
  trader:      'Evaluates economics and manages bidding.',
};

const DEFAULT_PERSONALITY: PersonalityVector = {
  riskTolerance:   0.5,
  creativity:      0.5,
  costSensitivity: 0.5,
  thoroughness:    0.7,
  independence:    0.5,
};

const TRAIT_DESCRIPTIONS: Record<keyof PersonalityVector, string> = {
  riskTolerance:   'Willingness to take bold decisions under uncertainty.',
  creativity:      'Tendency to try novel approaches.',
  costSensitivity: 'How price-conscious the agent is when bidding.',
  thoroughness:    'Depth of analysis and output quality.',
  independence:    'Preference to act autonomously vs. seeking guidance.',
};

export default function CreateAgent() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentRole>('developer');
  const [personality, setPersonality] = useState<PersonalityVector>(DEFAULT_PERSONALITY);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const roles: AgentRole[] = ['coordinator', 'developer', 'researcher', 'critic', 'trader'];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Agent name is required'); return; }
    setIsCreating(true); setError('');
    try {
      const result = await apiFetch<{ agent: any; agentId: string }>('/api/agents', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), role, personality }),
      });
      navigate(`/agents/${result.agentId || result.agent?.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
      setIsCreating(false);
    }
  }

  const previewColor = ROLE_COLORS[role];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Create Agent</h1>
        <p className="page-subtitle">Design an autonomous agent with a custom personality. It will be minted as an iNFT on 0G Chain.</p>
      </div>

      <form onSubmit={handleCreate}>
        <div className="create-grid">
          {/* Left: config */}
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Name */}
            <div className="panel">
              <div className="panel-header"><Bot size={16} /><span>Agent Identity</span></div>
              <div className="panel-body">
                <label className="field-label">Name</label>
                <input
                  className="field"
                  placeholder="e.g. NovaCoder, InfoHound…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={32}
                />
              </div>
            </div>

            {/* Role */}
            <div className="panel">
              <div className="panel-header"><span>Role</span></div>
              <div className="panel-body">
                <div className="role-grid">
                  {roles.map(r => (
                    <div
                      key={r}
                      className={`role-card ${role === r ? 'selected' : ''}`}
                      onClick={() => setRole(r)}
                      style={role === r ? { borderColor: ROLE_COLORS[r], background: ROLE_COLORS[r] + '14' } : {}}
                    >
                      <div className="role-card-icon">{ROLE_EMOJIS[r]}</div>
                      <div className="role-card-name" style={{ color: role === r ? ROLE_COLORS[r] : undefined }}>{r}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-secondary mt-3">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            </div>

            {/* Personality */}
            <div className="panel">
              <div className="panel-header"><span>Personality Vector</span></div>
              <div className="panel-body">
                <div className="personality-sliders">
                  {(Object.keys(personality) as (keyof PersonalityVector)[]).map(key => (
                    <div className="slider-row" key={key}>
                      <div className="slider-header">
                        <span className="slider-name">{TRAIT_LABELS[key]}</span>
                        <span className="slider-val">{(personality[key] * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range" min={0} max={1} step={0.01}
                        value={personality[key]}
                        onChange={e => setPersonality(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                        style={{ accentColor: previewColor }}
                      />
                      <p className="slider-desc">{TRAIT_DESCRIPTIONS[key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: preview + submit */}
          <div>
            <div className="panel preview-card">
              <div className="panel-header"><span>Preview</span></div>
              <div className="panel-body">
                {/* Preview card */}
                <div
                  className="agent-card"
                  style={{ cursor: 'default', marginBottom: 20, borderColor: previewColor + '60' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '10px 10px 0 0', background: previewColor }} />
                  <div className="agent-card-top">
                    <div className="agent-name">{ROLE_EMOJIS[role]} {name || 'Unnamed Agent'}</div>
                    <span className="agent-role-badge" style={{ color: previewColor, borderColor: previewColor + '40', border: '1px solid' }}>{role}</span>
                  </div>
                  <div className="trait-bars">
                    {(Object.entries(personality) as [keyof PersonalityVector, number][]).map(([key, val]) => (
                      <div className="trait-row" key={key}>
                        <span className="trait-label">{TRAIT_LABELS[key]}</span>
                        <div className="trait-bar-bg">
                          <div className="trait-bar-fill" style={{ width: `${val * 100}%`, background: previewColor }} />
                        </div>
                        <span className="trait-value">{(val * 100).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="agent-meta">
                    <div className="agent-meta-text">0g://metadata/preview</div>
                  </div>
                </div>

                {error && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 8, fontSize: '0.8rem', color: '#ff8080' }}>
                    {error}
                  </div>
                )}

                <button className="btn btn-primary w-full btn-lg" type="submit" disabled={isCreating}>
                  {isCreating
                    ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating…</>
                    : <><Sparkles size={18} /> Mint Agent iNFT</>}
                </button>
                <p className="text-xs text-muted mt-2" style={{ textAlign: 'center', lineHeight: 1.5 }}>
                  Agent identity stored on 0G Chain as ERC-7857 iNFT
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
