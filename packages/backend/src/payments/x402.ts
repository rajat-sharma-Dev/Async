/**
 * x402 Payment Handler
 * Handles HTTP 402 payment challenges from paid services
 * 📖 Ref: docs/KEEPERHUB_X402.md → "x402 Protocol"
 *
 * Flow:
 * 1. Agent calls a paid endpoint
 * 2. Service returns HTTP 402 with payment challenge
 * 3. Agentic wallet signs EIP-3009 TransferWithAuthorization
 * 4. Facilitator submits on-chain (Base USDC), pays gas
 * 5. Service returns result
 *
 * Constraints:
 * - Payments settle on Base USDC (chain 8453)
 * - Per-transfer cap: 100 USDC (Turnkey-enforced)
 * - Daily cap: 200 USDC (server-enforced)
 * - Agent pays USDC only — NO gas needed
 */

export interface X402Challenge {
  amount: string;
  currency: string;
  recipient: string;
  description?: string;
}

export interface X402PaymentResult {
  success: boolean;
  transactionHash?: string;
  amount?: string;
  error?: string;
}

/**
 * Call a potentially paid endpoint with automatic x402 handling.
 *
 * When the agentic wallet is installed (via @keeperhub/wallet),
 * 402 challenges are handled transparently by the wallet skill.
 * This wrapper provides the retry logic and error handling.
 */
export async function callWithPayment(
  url: string,
  options: RequestInit = {},
  config: {
    maxRetries?: number;
    onPaymentRequired?: (challenge: X402Challenge) => Promise<boolean>;
  } = {}
): Promise<Response> {
  const maxRetries = config.maxRetries || 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (res.status === 402) {
      // Parse the payment challenge
      const challenge = await parseChallenge(res);
      console.log(
        `[x402] Payment required: $${challenge.amount} ${challenge.currency} → ${challenge.recipient}`
      );

      // Optional approval callback
      if (config.onPaymentRequired) {
        const approved = await config.onPaymentRequired(challenge);
        if (!approved) {
          throw new X402Error("Payment rejected by policy", challenge);
        }
      }

      // When running inside an MCP-enabled agent with agentic wallet,
      // the wallet skill intercepts 402s and handles payment automatically.
      // For direct backend calls, we need to handle it ourselves.
      console.log(`[x402] Attempt ${attempt + 1}/${maxRetries}, retrying...`);
      continue;
    }

    if (res.ok) {
      return res;
    }

    // Non-402, non-OK error
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Service error ${res.status}: ${errorBody}`);
  }

  throw new X402Error("Payment failed after max retries", {
    amount: "unknown",
    currency: "USDC",
    recipient: url,
  });
}

/**
 * Parse x402 challenge from a 402 response
 */
async function parseChallenge(res: Response): Promise<X402Challenge> {
  try {
    const body = await res.json();
    return {
      amount: body.amount || body.price || "0",
      currency: body.currency || body.unit || "USDC",
      recipient: body.recipient || body.payTo || "",
      description: body.description || body.message,
    };
  } catch {
    // Fallback if body isn't JSON
    return {
      amount: res.headers.get("x-payment-amount") || "0",
      currency: res.headers.get("x-payment-currency") || "USDC",
      recipient: res.headers.get("x-payment-recipient") || "",
    };
  }
}

/**
 * Check if an agent can afford a payment based on safety thresholds
 */
export function checkSafetyThreshold(
  amountUSD: number,
  safety = { autoApproveMax: 5, blockThreshold: 100 }
): "auto" | "ask" | "block" {
  if (amountUSD <= safety.autoApproveMax) return "auto";
  if (amountUSD <= safety.blockThreshold) return "ask";
  return "block";
}

export class X402Error extends Error {
  constructor(
    message: string,
    public challenge: X402Challenge
  ) {
    super(message);
    this.name = "X402Error";
  }
}
