/**
 * x402 Payment Handler — COMPLETE IMPLEMENTATION
 * Handles HTTP 402 payment challenges and KeeperHub USDC payments on Base.
 *
 * Flow:
 * 1. Agent calls a paid endpoint
 * 2. Service returns HTTP 402 with payment challenge
 * 3. This module resolves via KeeperHub payAgent() (Base USDC, gasless)
 * 4. On success, request is retried with payment proof header
 *
 * When KH_API_KEY is set: real USDC transfer on Base (chain 8453)
 * When no key: returns demo payment proof (still processes gracefully)
 *
 * 📖 Ref: docs/KEEPERHUB_X402.md
 */

export interface X402Challenge {
  amount: string;
  currency: string;
  recipient: string;
  description?: string;
  taskId?: string;
}

export interface X402PaymentResult {
  success: boolean;
  transactionHash?: string;
  amount?: string;
  currency?: string;
  error?: string;
  mode: 'live' | 'demo';
}

/**
 * Execute a payment via KeeperHub (real USDC on Base) or demo receipt.
 * This is the core x402 resolver used in callWithPayment().
 */
export async function executeX402Payment(
  challenge: X402Challenge
): Promise<X402PaymentResult> {
  const khKey = process.env.KH_API_KEY;
  const amountNum = parseFloat(challenge.amount || '0');

  if (khKey && khKey.startsWith('kh_')) {
    try {
      // Real KeeperHub payment on Base
      const { getKeeperHub } = await import('./keeperhub.js');
      const kh = getKeeperHub();
      const result = await kh.payAgent({
        agentWallet: challenge.recipient,
        amount: amountNum,
        asset: 'USDC',
        taskId: challenge.taskId,
        description: challenge.description,
      });

      console.log(`[x402] ✅ KeeperHub payment: ${amountNum} USDC → ${challenge.recipient} | tx: ${result.executionId}`);
      return {
        success: true,
        transactionHash: result.executionId,
        amount: challenge.amount,
        currency: 'USDC',
        mode: 'live',
      };
    } catch (err) {
      console.error('[x402] KeeperHub payment failed:', (err as Error).message);
      return {
        success: false,
        error: (err as Error).message,
        mode: 'live',
      };
    }
  }

  // Demo mode — no KH_API_KEY
  const demoHash = `demo-x402-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[x402] 🟡 Demo payment: ${amountNum} USDC → ${challenge.recipient} (set KH_API_KEY for real)`);
  return {
    success: true,
    transactionHash: demoHash,
    amount: challenge.amount,
    currency: 'USDC',
    mode: 'demo',
  };
}

/**
 * Call a paid endpoint with automatic x402 handling.
 * On 402, parses the challenge, executes payment, and retries with proof.
 */
export async function callWithPayment(
  url: string,
  options: RequestInit = {},
  config: {
    maxRetries?: number;
    onPaymentRequired?: (challenge: X402Challenge) => Promise<boolean>;
  } = {}
): Promise<Response> {
  const maxRetries = config.maxRetries ?? 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });

    if (res.status !== 402) {
      if (res.ok) return res;
      const body = await res.text().catch(() => '');
      throw new Error(`Service error ${res.status}: ${body}`);
    }

    // Parse the 402 challenge
    const challenge = await parseChallenge(res);
    console.log(`[x402] 402 received: $${challenge.amount} ${challenge.currency} → ${challenge.recipient}`);

    // Optional approval gate
    if (config.onPaymentRequired) {
      const approved = await config.onPaymentRequired(challenge);
      if (!approved) throw new X402Error('Payment rejected by policy', challenge);
    }

    // Safety threshold check
    const amountUSD = parseFloat(challenge.amount || '0');
    const safety = checkSafetyThreshold(amountUSD);
    if (safety === 'block') {
      throw new X402Error(`Payment blocked: $${amountUSD} exceeds safety threshold`, challenge);
    }

    // Execute payment
    const payment = await executeX402Payment(challenge);
    if (!payment.success) {
      throw new X402Error(`Payment failed: ${payment.error}`, challenge);
    }

    // Retry with payment proof header
    const retryRes = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Hash': payment.transactionHash || '',
        'X-Payment-Amount': challenge.amount,
        'X-Payment-Currency': challenge.currency,
        ...options.headers,
      },
    });

    if (retryRes.ok) return retryRes;
  }

  throw new X402Error('Payment flow exhausted max retries', {
    amount: '0', currency: 'USDC', recipient: url,
  });
}

async function parseChallenge(res: Response): Promise<X402Challenge> {
  try {
    const body = await res.json();
    return {
      amount:      body.amount    ?? body.price    ?? '0',
      currency:    body.currency  ?? body.unit     ?? 'USDC',
      recipient:   body.recipient ?? body.payTo    ?? '',
      description: body.description ?? body.message,
      taskId:      body.taskId,
    };
  } catch {
    return {
      amount:    res.headers.get('x-payment-amount')    ?? '0',
      currency:  res.headers.get('x-payment-currency')  ?? 'USDC',
      recipient: res.headers.get('x-payment-recipient') ?? '',
    };
  }
}

/**
 * Check if an amount falls within safety thresholds.
 * auto  = execute without user prompt
 * ask   = require explicit approval
 * block = reject entirely
 */
export function checkSafetyThreshold(
  amountUSD: number,
  safety = { autoApproveMax: 5, blockThreshold: 100 }
): 'auto' | 'ask' | 'block' {
  if (amountUSD <= safety.autoApproveMax) return 'auto';
  if (amountUSD <= safety.blockThreshold) return 'ask';
  return 'block';
}

export class X402Error extends Error {
  constructor(message: string, public challenge: X402Challenge) {
    super(message);
    this.name = 'X402Error';
  }
}
