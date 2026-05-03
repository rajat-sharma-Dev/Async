import React, { useEffect, useState } from 'react';
import { CircleDollarSign, ExternalLink } from 'lucide-react';
import { apiFetch } from '../types';

interface PaymentReceipt {
  id: string;
  from: string;
  to: string;
  amount: string | number;
  asset: string;
  taskId?: string;
  txHash?: string;
  executionId?: string;
  transactionHash?: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: number;
  mode?: 'live' | 'demo';
}

const ASSET_COLORS: Record<string, string> = {
  USDC: '#2775ca',
  A0GI: '#55b6ff',
  demo: '#a8b3c7',
};

function chainScanUrl(receipt: PaymentReceipt): string | null {
  const hash = receipt.transactionHash || receipt.txHash;
  if (!hash || hash.startsWith('demo')) return null;
  // Base USDC payments → BaseScan
  if (receipt.asset === 'USDC') return `https://basescan.org/tx/${hash}`;
  // 0G payments → ChainScan
  return `https://chainscan-galileo.0g.ai/tx/${hash}`;
}

export default function Payments() {
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUSDC, setTotalUSDC] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch<{ payments: PaymentReceipt[] }>('/api/payments');
        const p = res.payments ?? [];
        setPayments(p);
        const usdc = p
          .filter(r => r.status === 'success' && (r.asset === 'USDC' || !r.asset))
          .reduce((sum, r) => sum + Number(r.amount || 0), 0);
        setTotalUSDC(usdc);
      } catch {
        /* non-fatal */
      } finally {
        setLoading(false);
      }
    }
    void load();
    const t = setInterval(() => void load(), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Payments</h1>
            <p className="page-subtitle">USDC settlements on Base · A0GI escrow on 0G Chain</p>
          </div>
          <div className="stat-pills">
            <div className="stat-pill"><strong>{payments.length}</strong> receipts</div>
            <div className="stat-pill" style={{ color: '#2775ca' }}>
              <strong>${totalUSDC.toFixed(2)}</strong> USDC settled
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }} /></div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CircleDollarSign size={40} /></div>
          <div className="empty-state-title">No payments yet</div>
          <div className="empty-state-desc">Submit a task to trigger agent swarm formation and payment distribution.</div>
        </div>
      ) : (
        <div className="panel">
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1fr 100px 100px 80px',
            gap: 12,
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}>
            <span>Time</span>
            <span>From → To</span>
            <span>Task</span>
            <span>Amount</span>
            <span>Asset</span>
            <span>Status</span>
          </div>

          {[...payments].reverse().map((p, i) => {
            const scanUrl = chainScanUrl(p);
            const assetColor = ASSET_COLORS[p.asset] || ASSET_COLORS.demo;
            const isDemoMode = p.mode === 'demo' || (p.transactionHash || p.txHash || '').startsWith('demo');

            return (
              <div key={p.id || i} style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr 100px 100px 80px',
                gap: 12,
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                alignItems: 'center',
                fontSize: '0.8125rem',
              }}>
                {/* Time */}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(p.timestamp).toLocaleTimeString()}
                </span>

                {/* From → To */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {p.from ? `${p.from.slice(0, 6)}…${p.from.slice(-4)}` : 'System'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>→</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {p.to ? `${p.to.slice(0, 6)}…${p.to.slice(-4)}` : 'Agent'}
                  </span>
                </div>

                {/* Task ID */}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {p.taskId || '—'}
                </span>

                {/* Amount */}
                <span style={{ fontWeight: 600, color: p.status === 'failed' ? 'var(--red, #ff8fab)' : undefined }}>
                  {Number(p.amount || 0).toFixed(4)}
                </span>

                {/* Asset + chain badge */}
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 600, color: assetColor, fontSize: '0.8rem' }}>
                    {p.asset || 'USDC'}
                  </span>
                  {isDemoMode ? (
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 99, background: 'rgba(168,179,199,0.15)', color: 'var(--text-muted)' }}>
                      demo
                    </span>
                  ) : scanUrl ? (
                    <a href={scanUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 99, background: 'rgba(85,182,255,0.12)', color: 'var(--accent)' }}>
                      {p.asset === 'USDC' ? 'Base' : '0G'}
                    </span>
                  )}
                </div>

                {/* Status */}
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                  background: p.status === 'success' ? 'rgba(126,231,135,0.12)' : p.status === 'failed' ? 'rgba(255,143,171,0.12)' : 'rgba(242,204,96,0.12)',
                  color: p.status === 'success' ? 'var(--green)' : p.status === 'failed' ? '#ff8fab' : '#f2cc60',
                }}>
                  {p.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
