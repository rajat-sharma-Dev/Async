# Untitled

# **0G Compute Network**

Access affordable GPU computing power for AI workloads through a decentralized marketplace.

## **AI Computing Costs Are Crushing Innovation**

Running AI models today means choosing between:

- **Cloud Providers**: $5,000-50,000/month for dedicated GPUs
- **API Services**: $0.03+ per request, adding up to thousands monthly
- **Building Infrastructure**: Millions in hardware investment

**Result**: Only well-funded companies can afford AI at scale.

## **Decentralized GPU Marketplace**

0G Compute Network connects idle GPU owners with AI developers, creating a marketplace that's:

- **90% Cheaper**: Pay only for compute used, no monthly minimums
- **Instantly Available**: Access 1000s of GPUs globally
- **Verifiable**: Cryptographic proofs ensure computation integrity

Think of it as "Uber for GPUs" - matching supply with demand efficiently.

## **Architecture Overview**

![0G Compute Network Architecture](https://docs.0g.ai/assets/images/architecture-321f88478d71dcdff10cf2baf5b12551.png)

The network consists of:

1. **Smart Contracts**: Handle payments and verification
2. **Provider Network**: GPU owners running compute services
3. **Client SDKs**: Easy integration for developers
4. **Verification Layer**: Ensures computation integrity

## **Key Components**

### **🤖 Supported Services**

| **Service Type** | **What It Does** | **Status** |
| --- | --- | --- |
| **Inference** | Run pre-trained models (LLMs) | ✅ Live |
| **Fine-tuning** | Fine-tune models with your data | ✅ Live |
| **Training** | Train models from scratch | 🔜 Coming |

### **🔐 Trust & Verification**

**Verifiable Computation**: Proof that work was done correctly

- TEE (Trusted Execution Environment) for secure processing
- Cryptographic signatures on all results
- Can't fake or manipulate outputs
- **What makes it trustworthy?**

## **Quick Start Paths**

### **👨‍💻 "I want to use AI services"**

Two integration paths — pick one:

[**Compute Router**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview) *(recommended for most apps)* — a single OpenAI-compatible endpoint with one unified balance, automatic provider failover, and an API key. Ideal for server-side apps, agents, and prototypes.

1. Get an API key at [pc.0g.ai](https://pc.0g.ai/)
2. Deposit 0G tokens
3. Point your OpenAI SDK at `https://router-api.0g.ai/v1`

[**Direct**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) — connect to individual providers via the `@0gfoundation/0g-compute-ts-sdk` SDK, manage per-provider sub-accounts, sign requests with your wallet. Use this for browser dApps with wallet signing, on-chain control, or when you need **fine-tuning** (Router is inference-only).

1. [Install SDK](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference) and pick a provider
2. [Fund your account](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management) — shared across inference and fine-tuning
3. Run [Inference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference) or [Fine-tuning](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning)

Deeper comparison: [Router vs Direct](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison).

### **🖥️ "I have GPUs to monetize"**

Turn idle hardware into revenue:

1. Check [hardware requirements](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference-provider#prerequisites)
2. [Set up provider software](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference-provider#launch-provider-broker)

### **🎯 "I need to fine-tune AI models"**

Fine-tune models with your data:

1. [Install CLI tools](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#install-cli)
2. [Prepare your dataset](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prepare-your-data)
3. [Start fine-tuning](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#create-task)

## **Frequently Asked Questions**

- **How much can I save compared to OpenAI?**
- **Is my data secure?**
- **How fast is it compared to centralized services?**

---

*0G Compute Network: Democratizing AI computing for everyone.*

# **0G Compute Router**

The **0G Compute Router** is an API gateway that sits in front of the entire 0G Compute Network. One endpoint, one API key, every model.

It handles provider discovery, on-chain billing, authentication, and failover automatically — so you use 0G's decentralized inference with the same code you'd write for OpenAI or Anthropic.

## **When to Use the Router**

|  | **Router** | [**Direct**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) |
| --- | --- | --- |
| Setup | Get an API key | Install SDK, manage wallet keys |
| Provider management | Automatic routing + failover | Manual selection & funding |
| Billing | Single unified on-chain balance | Per-provider sub-accounts |
| API shape | OpenAI / Anthropic compatible | Custom SDK calls |
| Best for | Server-side apps, agents, prototypes | Browser dApps, direct chain access |

Pick the Router when you want the simplest integration path. Pick Direct when you need per-provider control or wallet-signed requests in the browser.

## **60-Second Tour**

[**Quickstart →**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/quickstart) Connect wallet, deposit, create an API key, send your first request — in four steps.

[**Chat Completions →**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/chat-completions) OpenAI-compatible `/v1/chat/completions` with streaming, tool calling, and reasoning tokens.

[**Provider Routing →**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) Route by lowest latency, lowest price, or pin to a specific on-chain provider.

[**Authentication →**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/authentication) API keys with three permission tiers.

[**Models →**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) Browse the live catalog. Each model has pricing, context window, and capability flags.

[**Deposits & Billing →**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits) Deposit 0G tokens, consume on-chain, settle periodically. No subscriptions.

## **Base URLs**

Mainnet and testnet are fully separate environments — different Web UI, different API endpoint, different on-chain balances and API keys. Pick the one that matches the network your wallet is on.

| **Network** | **Web UI** | **API Endpoint** |
| --- | --- | --- |
| **Mainnet** | [pc.0g.ai](https://pc.0g.ai/) | `https://router-api.0g.ai/v1` |
| **Testnet** | [pc.testnet.0g.ai](https://pc.testnet.0g.ai/) | `https://router-api-testnet.integratenetwork.work/v1` |

**OpenAI SDK drop-in**

Any tool that speaks the OpenAI API works with 0G Router — change `base_url` and `api_key`, nothing else.

**Migrating from compute-marketplace.0g.ai?**

If you previously deposited on [**compute-marketplace.0g.ai**](https://compute-marketplace.0g.ai/), those funds live in **per-provider sub-accounts** under the [Direct](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) flow. They do **not** appear in the Router balance on pc.0g.ai — the two systems use different contracts and different accounting.

To see and use those old funds on pc.0g.ai, switch to **Advanced** mode using the toggle in the top-right. Advanced mode is the same Direct flow, just embedded in the new UI. See [Router vs Advanced Mode](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison#pc0gai-router-vs-advanced-mode).

# **Quickstart**

Four steps. Five minutes.

## **1. Connect Your Wallet**

Visit [**pc.0g.ai**](https://pc.0g.ai/) and connect a wallet. MetaMask and WalletConnect work directly; you can also sign in with Google, X/Twitter, Discord, or TikTok via Privy, which provisions an embedded wallet for you.

## **2. Deposit Funds**

Deposit 0G tokens to the Router's on-chain payment contract. Your balance lives on-chain and is debited per request.

See [Deposits & Billing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits) for how costs are calculated and how to check your balance.

## **3. Create an API Key**

In **Dashboard → API Keys**, create a key with the `inference` permission. You'll get a secret starting with `sk-`.

Store it somewhere safe — the Router never shows it again.

## **4. Send Your First Request**

**cURLPython (OpenAI SDK)JavaScript (OpenAI SDK)**

- **cURL**
- Python (OpenAI SDK)
- JavaScript (OpenAI SDK)

```bash
curl https://router-api.0g.ai/v1/chat/completions \  -H "Content-Type: application/json" \  -H "Authorization: Bearer sk-YOUR_API_KEY" \  -d '{    "model": "zai-org/GLM-5-FP8",    "messages": [      {"role": "user", "content": "Hello!"}    ]  }'
```

That's it. You're talking to a decentralized TEE-backed provider through an OpenAI-compatible API.

## **Next Steps**

- [**Chat Completions**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/chat-completions) — streaming, tool calling, system prompts
- [**Provider Routing**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) — route by latency, price, or specific provider
- [**Models**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) — browse the catalog with live pricing

# **Principles**

The Router exists to make 0G's decentralized compute network usable with the same code you already have. Four design choices shape how it works.

## **1. Drop-in Compatibility**

The Router speaks the **OpenAI API** (`/v1/chat/completions`, `/v1/images/generations`, `/v1/audio/transcriptions`, …). Same routes, same fields, same SSE format.

Any SDK, agent framework, or tool that targets these APIs works without code changes — point it at `https://router-api.0g.ai/v1` and supply your Router API key.

The goal is zero switching cost. If we add a feature that OpenAI doesn't have (like provider pinning), it lives in an optional top-level field that is stripped before the request reaches the underlying provider. Your existing requests keep working.

## **2. On-Chain Billing, No Subscriptions**

There is no monthly plan. You deposit 0G tokens to a payment contract, and each request debits the exact cost based on per-model token prices. Remaining balance is always visible on-chain.

```
total_cost = (input_tokens × prompt_price) + (output_tokens × completion_price)
```

Settlement to individual providers happens periodically in the background — you only see a single unified balance. Details: [Deposits & Billing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits).

## **3. Failover by Default**

Each model is served by one or more independent providers. The Router health-checks them continuously and distributes requests round-robin across the healthy set. If a request fails, the Router retries on the next healthy provider before returning an error to you.

You can override this — [Provider Routing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) lets you sort by `latency` / `price` or pin to a specific provider address — but the default is "just work."

## **4. Verifiable Execution**

Every provider on the network runs inside a **Trusted Execution Environment (TEE)** and attests to the exact model it's serving. The Router exposes provider addresses and attestation metadata so you can verify, out-of-band, that your request was handled by a model you trust.

This is the reason to use 0G over a centralized endpoint: you get OpenAI-style ergonomics **and** cryptographic proof that the model wasn't silently swapped.

## **What the Router Does Not Do**

- **No prompt storage.** The Router does not persist request or response bodies. Only billing metadata (token counts, model, provider, timestamp) is stored.
- **Provider isolation via TEE.** Every provider runs inside a Trusted Execution Environment, which isolates the serving process so it cannot access inference traffic outside the attested request/response path.
- **No synthetic responses.** The Router never generates content itself. If no provider can serve the request, you get a `503` — not a fallback LLM.

# **Models**

The model catalog is served live by the Router. You can browse it two ways:

- **Web UI** — [**pc.0g.ai**](https://pc.0g.ai/) shows every model with current pricing, the number of healthy providers, and capability badges (streaming, tool calling, vision, etc.).
- **API** — `GET /v1/models` returns the same data in OpenAI's list format. No authentication required.

## **Listing Models**

```bash
curl https://router-api.0g.ai/v1/models
```

```json
{"object":"list","data":[{"id":"zai-org/GLM-5-FP8","object":"model","owned_by":"0G Foundation","name":"zai-org/GLM-5-FP8","context_length":131072,"pricing":{"prompt":"100000000000","completion":"320000000000"},"provider_count":3}]}
```

Prices are in **neuron per token** (1e18 neuron = 1 0G). Multiply by `input_tokens` / `output_tokens` to estimate cost.

## **Capability Flags**

Not every model supports every feature. Before relying on **tool calling**, **vision input**, or **JSON mode**, check the model's entry in the Web UI or in the `/v1/models` response — capability flags are shown on each model card and in the API payload.

If you send a `tools` field to a model that doesn't support it, the Router returns `400 Bad Request` rather than silently dropping the parameter.

## **Listing Providers for a Model**

```bash
curl "https://router-api.0g.ai/v1/providers?model=zai-org/GLM-5-FP8"
```

Returns every TEE-acknowledged provider serving that model, with on-chain address, observed latency, and TEE attestation info. Use these addresses with the [`provider.address` field](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) if you want deterministic routing.

Query parameters:

| **Field** | **Description** |
| --- | --- |
| `model` | Filter to providers serving a specific model ID |
| `service_type` | Filter by service type (e.g. `chatbot`, `text-to-image`, `speech-to-text`) |

# **Chat Completions**

**`POST /v1/chat/completions`**

Fully compatible with the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat). Supports streaming, tool calling, JSON mode, and reasoning-token models.

## **Request**

```json
{"model":"zai-org/GLM-5-FP8","messages":[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"Explain quantum computing in simple terms."}],"temperature":0.7,"max_tokens":1024,"stream":true}
```

All standard OpenAI fields are accepted — `temperature`, `top_p`, `n`, `stop`, `presence_penalty`, `frequency_penalty`, `logit_bias`, `user`, `response_format`, and so on.

### **0G Router Extensions**

Optional top-level fields. Stripped before the request is forwarded to the provider, so they never conflict with the OpenAI schema.

| **Field** | **Type** | **Description** |
| --- | --- | --- |
| `provider` | object | Control provider routing — see [Routing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) |
| `verify_tee` | boolean | Ask the Router to synchronously verify the provider's TEE signature — see [Verifiable Execution](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution) |

## **Streaming**

Set `"stream": true` to receive Server-Sent Events in the OpenAI SSE format. Any OpenAI client library that handles streaming will work unchanged.

```bash
curl https://router-api.0g.ai/v1/chat/completions \  -H "Content-Type: application/json" \  -H "Authorization: Bearer sk-YOUR_API_KEY" \  -d '{    "model": "zai-org/GLM-5-FP8",    "messages": [{"role": "user", "content": "Write a haiku about decentralization"}],    "stream": true  }'
```

**Reasoning models**

Some models (e.g. GLM-5) emit a `reasoning_content` field in streaming deltas before the final `content`. Client libraries that know about reasoning tokens will surface both separately.

## **Tool Calling**

Models that advertise tool-calling capability accept the standard OpenAI `tools` / `tool_choice` fields.

```json
{"model":"zai-org/GLM-5-FP8","messages":[{"role":"user","content":"What's the weather in Tokyo?"}],"tools":[{"type":"function","function":{"name":"get_weather","description":"Get current weather for a city","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]}
```

**Check model capabilities**

**Not every model supports tool calling.** Before sending a request with `tools`, verify the model's capability flags in the [catalog](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) or on [pc.0g.ai](https://pc.0g.ai/). Sending `tools` to a model that doesn't support it returns `400 Bad Request`.

The response shape (`tool_calls` in the assistant message, `tool` role for results) matches OpenAI exactly.

## **JSON Mode**

For models that support structured output:

```json
{"model":"zai-org/GLM-5-FP8","messages":[{"role":"system","content":"Respond with JSON only."},{"role":"user","content":"List three colors and their hex codes."}],"response_format":{"type":"json_object"}}
```

As with tool calling, check capability flags before using.

## **Response shape**

Responses are OpenAI-compatible (`choices[]`, `usage`, `model`, `id`, `object`, `created`). The Router adds two Router-specific additions on top:

### **`x_0g_trace` (always present)**

Every Router response carries an `x_0g_trace` object with metadata about the request's execution:

```json
"x_0g_trace":{"request_id":"0852f405-6c56-40c2-a800-e6fd70785065","provider":"0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C","billing":{"input_cost":"19000000000000","output_cost":"1916800000000000","total_cost":"1935800000000000"}}
```

| **Field** | **Description** |
| --- | --- |
| `request_id` | Unique ID for this request. Quote it in any support ticket or bug report. |
| `provider` | On-chain address of the provider that served the request |
| `billing.input_cost` / `output_cost` / `total_cost` | Exact cost in **neuron** for this specific request |
| `tee_verified` | Present only when `verify_tee: true` was set — see [Verifiable Execution](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution) |

This means you don't need to compute costs yourself — the Router tells you exactly what was charged. Handy for per-request logging and client-side budget tracking.

### **`reasoning_content` (thinking models)**

For models with thinking support (e.g. `zai-org/GLM-5-FP8`), the Router returns the reasoning trace alongside the final answer. It appears in two equivalent places:

```json
"choices":[{"message":{"role":"assistant","content":"{ \"colors\": [ ... ] }","reasoning_content":"The user wants a JSON response...","provider_specific_fields":{"reasoning_content":"The user wants a JSON response..."}}}]
```

Both fields contain the same text; most OpenAI SDKs surface `reasoning_content` directly on the message. You can ignore it for production output, log it for debugging, or display it to the user as "thinking".

**Disable thinking for GLM-5**

Thinking is on by default for GLM-5. If you don't want it (saves tokens and latency), pass `chat_template_kwargs: {"enable_thinking": false}` in the request body — GLM-5 advertises this in its `supported_parameters`.

## **Related**

- [**Routing**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) — choose your provider
- [**Errors**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/errors) — response codes and error shapes

# **Image Generation**

The Router exposes two paths for image generation:

- **Synchronous** — drop-in OpenAI-compatible endpoint (`POST /v1/images/generations`). Returns the image in the same request. Best when you're using the OpenAI SDK directly or have short/fast models.
- **Asynchronous (recommended for production)** — submit a job and poll (`POST /v1/async/images/generations` + `GET /v1/async/jobs/{jobId}`). Avoids long-held HTTP connections. Best for slow models, batch workloads, serverless, or browser reliability.

Both paths accept the same request shape and produce the same final output.

**`response_format: "b64_json"` is currently required**

Always send `"response_format": "b64_json"`. Base64 is the only format supported end-to-end right now; URL-based responses will be enabled in a future release. This applies to **both** sync and async paths.

## **Synchronous — OpenAI-compatible**

**`POST /v1/images/generations`**

Fully compatible with the [OpenAI Images API](https://platform.openai.com/docs/api-reference/images/create) — any OpenAI client library works unchanged once you switch the base URL.

**cURLPython (OpenAI SDK)**

- **cURL**
- Python (OpenAI SDK)

```bash
curl https://router-api.0g.ai/v1/images/generations \  -H "Content-Type: application/json" \  -H "Authorization: Bearer sk-YOUR_API_KEY" \  -d '{    "model": "z-image",    "prompt": "A serene mountain landscape at sunset",    "n": 1,    "size": "1024x1024",    "response_format": "b64_json"  }'
```

Returns the standard OpenAI image response: a `data` array with `b64_json` entries. Decode on the client to render.

### **Request fields**

| **Field** | **Required** | **Description** |
| --- | --- | --- |
| `model` | ✓ | Image model ID from [`/v1/models`](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) |
| `prompt` | ✓ | Text description of the desired image |
| `response_format` | ✓ | Must be `"b64_json"` today; `"url"` support is planned |
| `n` |  | Number of images to generate |
| `size` |  | e.g. `"1024x1024"` — check the model for supported sizes |

## **Asynchronous (recommended for production)**

Image generation can take tens of seconds. Holding an HTTP connection open that long is fragile — short-timeout clients, browsers, and serverless functions will drop it. The async path solves this: submit once, poll until ready.

### **1. Submit a job**

**`POST /v1/async/images/generations`** — same body as the synchronous endpoint.

```bash
curl https://router-api.0g.ai/v1/async/images/generations \  -H "Content-Type: application/json" \  -H "Authorization: Bearer sk-YOUR_API_KEY" \  -d '{    "model": "z-image",    "prompt": "A serene mountain landscape at sunset",    "n": 1,    "size": "1024x1024",    "response_format": "b64_json"  }'
```

The Router responds immediately with a job handle:

```json
{"jobId":"5b595c31955d4be2923f5070705cced4","status":"pending","provider_address":"0xE29a72..."}
```

`provider_address` identifies which provider is handling your job. You'll pass it back when polling — async jobs are pinned to their provider.

### **2. Poll for the result**

**`GET /v1/async/jobs/{jobId}?provider_address={addr}`**

```bash
curl "https://router-api.0g.ai/v1/async/jobs/5b595c31955d4be2923f5070705cced4?provider_address=0xE29a72..." \  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

While the job is running, `status` is `"pending"` (or `"running"`). When finished, `status: "completed"` appears with the result payload and an injected `x_0g_trace`:

```json
{"status":"completed","createdAt":"2026-04-24T09:44:57.804Z","data":{"created":1777023898,"data":[{"b64_json":"iVBORw0KGgoAAAANSUhEUg..."}]},"x_0g_trace":{"request_id":"...","provider":"0x...","billing":{"input_cost":"...","output_cost":"...","total_cost":"..."}}}
```

The image array lives at `data.data[]` — the outer `data` is a wrapper object the provider returns around the OpenAI-style result, not the OpenAI array itself.

**Use the `Retry-After` header for polling cadence**

Both submit and poll responses forward a `Retry-After` header (in seconds) when the provider sends one — use that value to decide when to poll again, since it reflects the provider's current queue. Fall back to a fixed 2–3 second interval only if the header is missing.

## **0G Router Extensions**

The same optional top-level fields as chat completions, stripped before forwarding to the provider (applies to both sync and async paths):

| **Field** | **Type** | **Description** |
| --- | --- | --- |
| `provider` | object | Control provider routing — see [Routing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) |
| `verify_tee` | boolean | Ask the Router to synchronously verify the provider's TEE signature — see [Verifiable Execution](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution) |

## **Billing**

Image generation is charged per image at rates declared by the model (see `pricing.image` in the [catalog](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models)). Billing is tied to the provider's execution, not to your client holding the connection:

- **Submission starts the clock.** Once the provider accepts the job, generation begins.
- **Abandoning a poll does not cancel the job.** If you close the HTTP connection, stop polling, or kill your process after submitting, the provider still runs the job to completion and you are still billed.

## **Related**

- [**Models**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) — browse available image models and sizes
- [**Routing**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing)
- [**Verifiable Execution**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution)

# **Audio Transcription**

**`POST /v1/audio/transcriptions`**

Fully compatible with the [OpenAI Audio Transcription API](https://platform.openai.com/docs/api-reference/audio/createTranscription). Send audio as `multipart/form-data`; the OpenAI SDK does this automatically.

**cURLPython (OpenAI SDK)**

- **cURL**
- Python (OpenAI SDK)

```bash
curl https://router-api.0g.ai/v1/audio/transcriptions \  -H "Authorization: Bearer sk-YOUR_API_KEY" \  -F "file=@recording.mp3" \  -F "model=openai/whisper-large-v3" \  -F "response_format=json"
```

## **Fields**

| **Field** | **Description** |
| --- | --- |
| `model` | Audio model ID from [`/v1/models`](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) |
| `file` | Audio file (multipart form) |
| `response_format` | `json`, `text`, `srt`, `verbose_json`, `vtt` |
| `language` | ISO-639-1 code, e.g. `"en"` — optional, improves accuracy |
| `prompt` | Optional text to guide style and vocabulary |
| `temperature` | Sampling temperature (0 = deterministic) |

## **Response**

```json
{"text":"Hello, this is a transcription of the audio file."}
```

## **0G Router Extensions**

Because this endpoint uses `multipart/form-data` instead of a JSON body, the only Router extension that can be passed today is `verify_tee`, as a **query parameter**:

```
?verify_tee=true
```

See [Verifiable Execution](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution) for what `tee_verified` means in the response. Provider routing fields (`provider.address`, `provider.sort`) are not currently parsed on multipart endpoints — use the default round-robin or pin via [Provider Routing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) on the JSON-body endpoints.

## **Related**

- [**Models**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) — list available audio models
- [**Verifiable Execution**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/verifiable-execution)

# **Verifiable Execution**

Every 0G Compute provider runs inside a **Trusted Execution Environment (TEE)** and cryptographically signs its responses. The Router can verify that signature synchronously on your behalf and report the result back in the response metadata.

## **Opt in with `verify_tee`**

Add `verify_tee: true` to any inference request, and the Router will verify the provider's TEE signature before returning the response. The verification result appears in the response trace.

**JSON bodyQuery parameter**

- **JSON body**
- Query parameter

```bash
curl https://router-api.0g.ai/v1/chat/completions \  -H "Content-Type: application/json" \  -H "Authorization: Bearer sk-YOUR_API_KEY" \  -d '{    "model": "zai-org/GLM-5-FP8",    "messages": [{"role": "user", "content": "Hello"}],    "verify_tee": true  }'
```

`verify_tee` is a 0G Router extension — it's stripped from the request before being forwarded to the provider, so it doesn't interfere with the OpenAI-compatible schema.

## **Reading the result**

When `verify_tee` is set, the Router adds a `tee_verified` field to the response's `x_0g_trace` metadata block (which is present on every Router response — see [Response shape](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/chat-completions#response-shape)):

```json
"x_0g_trace":{"request_id":"0852f405-6c56-40c2-a800-e6fd70785065","provider":"0xd9966e13a6026Fcca4b13E7ff95c94DE268C471C","billing":{"input_cost":"...","output_cost":"...","total_cost":"..."},"tee_verified":true}
```

| **`tee_verified`** | **Meaning** |
| --- | --- |
| `true` | The provider's TEE signature was validated successfully |
| `false` | A signature was present but did not verify — treat the response as untrusted |
| `null` / absent | Verification was not requested for this response |

## **When to use it**

- **Most chat-like applications** don't need per-request verification — the provider is already inside a TEE, and the network tolerates a small rate of signed-but-unverified responses.
- **Audit logs, high-trust pipelines, and research workloads** benefit from setting `verify_tee: true` so that every response carries a validated attestation flag alongside it.
- The pc.0g.ai UI enables `verify_tee` by default for playground requests; feel free to mirror that behaviour in your own clients.

## **Trust model**

`verify_tee: true` asks the **Router** to fetch the provider's TEE signature, look up the signer address on-chain, and verify the signature on your behalf. The Router returns a single boolean (`tee_verified`) summarising that check.

In other words, `tee_verified: true` in the response says *"the Router says it verified the signature."* It does **not** carry the raw signature back to you — you still have to trust the Router to have done the check honestly.

If that level of trust is acceptable for your application, stop here: set `verify_tee: true` and read the flag.

If you need an independent guarantee, **all the inputs the Router uses are public**, and you can reproduce the verification yourself. See the next section.

## **Independent verification (advanced)**

You don't have to trust the Router's `tee_verified` flag — the underlying inputs are all public, and the `@0gfoundation/0g-compute-ts-sdk` SDK ships a one-shot helper that does the whole verification for you.

### **With the SDK (recommended)**

The `chatID` required for verification comes from the **`ZG-Res-Key` response header** (the `id` field in the JSON body is a fallback when the header is absent). That means you need access to the raw HTTP response headers — `fetch` works directly; for OpenAI SDKs use their "raw response" / "with-response" helper.

```tsx
import{ ethers}from"ethers";import{ createZGComputeNetworkBroker}from"@0gfoundation/0g-compute-ts-sdk";// Any wallet works — processResponse only reads the chain and calls the provider's public signature endpoint.const rpc=newethers.JsonRpcProvider("https://evmrpc.0g.ai");const wallet= ethers.Wallet.createRandom().connect(rpc);const broker=awaitcreateZGComputeNetworkBroker(wallet);// 1. Make the request so you can read headersconst response=awaitfetch("https://router-api.0g.ai/v1/chat/completions",{  method:"POST",  headers:{"Content-Type":"application/json","Authorization":"Bearer sk-YOUR_API_KEY",},  body:JSON.stringify({ model:"zai-org/GLM-5-FP8", messages:[...]}),});const data=await response.json();// 2. Pull the two inputs processResponse needsconst providerAddress= data.x_0g_trace.provider;const chatID= response.headers.get("ZG-Res-Key")?? data.id;// 3. Verify independently — SDK reads the chain + calls the provider, not the Routerconst isValid=await broker.inference.processResponse(providerAddress, chatID);// true  → independently verified// false → verification failed (treat response as untrusted)// null  → provider has no verifiable TEE service (nothing to check)
```

Under the hood the SDK reads the provider's on-chain service record, fetches the signature from the provider, and verifies it against the TEE signer — the same work the Router does internally, but running on your side so you don't have to trust the Router's answer.

### **Without the SDK**

If you prefer to verify from scratch (e.g. from a language without the 0G SDK), the four steps you'd reproduce are:

1. Read the provider's service record from the on-chain `Service` contract using the `provider` address. The record gives you `url`, `teeSignerAddress`, and `verifiability`. (If `additionalInfo.targetSeparated` is true, use `additionalInfo.targetTeeAddress` as the signer instead.)
2. `GET {url}/v1/proxy/signature/{chatID}?model={model}` — returns `{text, signature}`.
3. Verify the signature as EIP-191 `personal_sign` against `teeSignerAddress`. Any standard Ethereum library works.
4. Confirm the signed `text` matches the response content you received from the Router.

All four steps pass → end-to-end cryptographic proof, no trust in the Router required.

## **Related**

- [**Principles: Verifiable Execution**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/principles#4-verifiable-execution) — the "why" behind this feature
- [**Chat Completions**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/features/chat-completions#response-shape) — structure of the `x_0g_trace` block
- [**Provider Routing**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/routing) — pin to a specific attested provider with `provider.address`

# **Provider Routing**

By default, the Router distributes requests across healthy providers using round-robin with automatic failover. The `provider` field lets you override this when you need specific behavior.

## **Default Behavior**

If you send no `provider` field, the Router:

1. Picks a healthy provider for the requested model
2. Retries on the next healthy provider if the first returns an error
3. Returns the response — or a `503` if every provider failed

This is the recommended path for most applications.

## **Routing Strategies**

**Lowest LatencyLowest PricePin a Specific Provider**

- **Lowest Latency**
- Lowest Price
- Pin a Specific Provider

```json
{"model":"zai-org/GLM-5-FP8","messages":[{"role":"user","content":"Hello"}],"provider":{"sort":"latency"}}
```

Routes to the provider with the lowest recently-observed latency for this model.

## **`provider` Field Reference**

| **Field** | **Type** | **Description** |
| --- | --- | --- |
| `sort` | string | `"latency"` or `"price"`. Ignored if `address` is set. |
| `address` | string | Provider's on-chain address for direct routing. |
| `allow_fallbacks` | boolean | Allow retrying other providers on failure. Default: `true` normally, `false` when `address` is set. |

## **Discovering Provider Addresses**

List the providers serving a model with `GET /v1/providers?model_id=…` — see [Models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models#listing-providers-for-a-model).

## **Related**

- [**Principles**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/principles) — why failover is the default
- [**Errors**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/errors) — what `502` and `503` mean for routing

# **Authentication**

The Router authenticates every request with an **API Key**. Each key is tied to your wallet address; usage is billed against the 0G tokens you deposited to the [Payment Layer](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits).

## **Sending the key**

Send the key in the `Authorization` header on every request:

```
Authorization: Bearer sk-YOUR_API_KEY
```

That's the whole protocol — no OAuth flow, no wallet signature per request, no session tokens.

## **Create and manage keys**

API keys are created and managed in the Web UI: [**pc.0g.ai](https://pc.0g.ai/) → Dashboard → API Keys**. From there you can:

- **Create** a new key — label it so you can tell keys apart (e.g. `staging`, `agent-bot`, `my-laptop`). The full secret is shown **once** on creation; copy it immediately. The dashboard only stores a hash.
- **List** existing keys with their labels, created-at, and last-used timestamps.
- **Revoke** any key instantly — in-flight requests using a revoked key return `401 api_key_revoked` on their next call.

## **Best practices**

- **One key per deployment.** Separate staging / production / per-service keys so you can revoke one without touching the others.
- **Rotate on suspicion.** If a key might have leaked, revoke it and issue a new one — takes seconds.

**Never ship API keys to browsers**

Whoever has your key can spend the 0G tokens you deposited. Keep keys server-side and proxy client requests through your own backend — your backend holds the key, your frontend talks to your backend.

**Coming soon**

Per-key controls such as **permission scopes**, **expiration**, and **per-key rate / token limits** are on the roadmap. Today every key grants full inference access and does not expire.

# **Deposits & Billing**

The Router charges on-chain, per token, from a single balance that covers every model, every provider, every service type. You deposit once; you're done until the balance runs out.

**Separate from Direct sub-accounts**

The balance you use with the Router is distinct from the per-provider sub-accounts used by the [Direct](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) flow / [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai/). Funds in one do not back calls in the other. See [Router vs Advanced Mode](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison#pc0gai-router-vs-advanced-mode) if you've been using the old flow.

## **Deposit**

You deposit to the **0G Payment Layer** — a shared balance contract used across all 0G products, not just the Router. Deposit once, and any 0G product you use (Router included) draws from the same pool.

The easiest way is [**pc.0g.ai](https://pc.0g.ai/) → Dashboard → Deposit**. It's a normal on-chain transaction signed by your wallet; funds are usable within a few seconds of confirmation.

Payment Layer contract addresses:

| **Network** | **Address** |
| --- | --- |
| Mainnet | `0xA3b15Bd2aD18BFB6b5f92D8AA9F444Dd59d1cE32` |
| Testnet | `0x0AD9690e0b34aB2d493DE02cDF149ee34f6C9939` |

## **How Costs Are Calculated**

```
total_cost = (input_tokens × prompt_price) + (output_tokens × completion_price)
```

- Prices are declared per model and quoted in **neuron per token** (1e18 neuron = 1 0G)
- `input_tokens` includes the full conversation context you send (system prompt + prior messages + current user message)
- Image and audio endpoints price per request or per second depending on the model — see the catalog

Get current prices from [`GET /v1/models`](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/models) or the model card on [pc.0g.ai](https://pc.0g.ai/). The Router does not add markup — what the provider charges is what you pay.

**Cached-token pricing**

Tiered pricing for cached prompt tokens is on the roadmap — a future release will report cached and fresh input tokens separately and bill them at distinct rates.

## **Check Your Balance**

```bash
curl https://router-api.0g.ai/v1/account/balance \  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

```json
{"address":"0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65","deposit_balance":"2000000000000000000","total_balance":"2000000000000000000"}
```

Values are in **neuron**. `total_balance` is what is available to spend right now. It may lag your Payment Layer balance slightly because the Router pulls from the Payment Layer in batches (see below). When `total_balance` hits zero and the Payment Layer is also empty, the next inference request returns `402 insufficient_balance`.

## **Check Your Usage**

Aggregate stats:

```bash
curl "https://router-api.0g.ai/v1/account/usage/stats?start_date=2026-04-01" \  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

Returns total requests, total tokens (prompt/completion split), and total cost for the window.

Per-request history:

```bash
curl "https://router-api.0g.ai/v1/account/usage/history?limit=20&offset=0" \  -H "Authorization: Bearer sk-YOUR_API_KEY"
```

Returns a paginated list of individual requests with model, provider address, token counts, and cost. Both endpoints also accept `api_key_id`, `source`, `start_date`, and `end_date` filters.

## **Related**

- [**Authentication**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/authentication) — how to create, rotate, and revoke the API keys billed against this balance
- [**Rate Limits**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/rate-limits)
- [**Errors**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/errors) — especially `402 insufficient_balance`

---

## **How funds reach the Router (advanced)**

You don't need to know this to use the Router, but if you're curious about the on-chain flow:

1. You deposit to the **Payment Layer** contract. The deposit belongs to your wallet address.
2. The Router runs a background **PaymentWorker** that watches for users whose Router-side balance is below a threshold and who have an active usage pattern. For those users, the worker asks the Payment Layer to release a small tranche of your balance into the Router's internal payment contract.
3. The Router then debits that internal contract as you consume tokens, and periodically settles the consumed amount to individual providers on-chain.

This two-step design (Payment Layer → Router) means the Payment Layer balance is shared across all 0G products, and the Router only holds what it needs for your near-term usage. From your side, the only thing you interact with is the Payment Layer deposit — everything else is automatic.

# **Rate Limits**

The Router applies per-account request limits to keep the network responsive. The exact thresholds depend on your account state and may evolve as we tune them — this page documents how to **observe and react to** the limit, not the specific numbers.

## **Response headers**

Every inference response includes rate-limit headers (OpenAI-compatible) so you can back off proactively without waiting for a `429`:

```
X-RateLimit-Limit-Requests: <your current per-minute limit>X-RateLimit-Remaining-Requests: <how many you have left in this window>X-RateLimit-Reset-Requests: <ISO-8601 timestamp when the window resets>
```

## **429 Too Many Requests**

When you exceed the limit, the Router returns `429` immediately with a `Retry-After` header (seconds):

```
HTTP/1.1 429 Too Many RequestsRetry-After: 15Content-Type: application/json
```

```json
{"error":{"message":"Rate limit exceeded. Please try again later.","type":"rate_limit_error","code":"rate_limit_exceeded"}}
```

**Honor `Retry-After`.** Don't retry in a tight loop — the Router will keep returning `429` and your real requests will be delayed.

## **Related**

- [**Errors**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/errors)
- [**Deposits & Billing**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits)

**Coming soon**

Per-API-key throughput controls — explicit **RPM** (requests per minute) and **TPM** (tokens per minute) budgets settable in the dashboard — are on the roadmap.

# **Errors**

Errors follow a consistent OpenAI-compatible shape. The response also includes `request_id` at the top level when available — quote it when reporting issues.

```json
{"error":{"message":"Insufficient balance to process request","type":"payment_error","code":"insufficient_balance"},"request_id":"req_abc123"}
```

## **HTTP Status Codes**

| **Status** | **Meaning** |
| --- | --- |
| `400` | Bad request — invalid model, malformed body, unsupported feature for model |
| `401` | Missing or invalid authentication |
| `402` | Insufficient balance — [deposit more](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits) |
| `403` | The API key does not have permission to perform this action |
| `404` | Resource not found |
| `429` | Rate limited — check `Retry-After` header, see [Rate Limits](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/rate-limits) |
| `502` | Provider returned an error (failover exhausted) |
| `503` | No healthy providers available for the requested model |

## **Error Types and Codes**

`error.type` groups errors into a small set of buckets; `error.code` identifies the specific cause.

| **`type`** | **`code` (examples)** | **When it happens** |
| --- | --- | --- |
| `invalid_request_error` | `invalid_body`, `missing_authorization`, `invalid_api_key`, `api_key_revoked` | 400, 401 — request or auth is wrong |
| `payment_error` | `insufficient_balance` | 402 — not enough 0G deposited |
| `permission_error` | `access_denied` | 403 — the key is not allowed to perform this action |
| `not_found_error` | `api_key_not_found` | 404 — resource doesn't exist |
| `rate_limit_error` | `rate_limit_exceeded` | 429 — see [Rate Limits](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/rate-limits) |
| `server_error` | `no_available_provider`, `provider_error`, `internal_error` | 502, 503, 500 — backend problem |

## **Retrying**

- `429` — honor `Retry-After`, then retry
- `502` (`provider_error`) — the Router already tried every healthy provider; retrying may help if one just came back online
- `503` (`no_available_provider`) — unlikely to resolve in seconds; consider a different model or waiting

Do **not** retry `400`, `401`, `402`, or `403` without changing your request — they won't succeed.

# **Router vs Direct**

The 0G Compute Network exposes the same underlying providers through two integration paths. This page helps you choose.

## **At a Glance**

|  | **Router** | [**Direct**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) |
| --- | --- | --- |
| **Where the request signs from** | Router API key (server-side) | User's wallet (client or server) |
| **API shape** | OpenAI / Anthropic compatible | 0G SDK calls |
| **Provider selection** | Automatic with failover | Manual — you choose and fund each |
| **Billing** | Single unified on-chain balance | Per-provider sub-accounts |
| **Browser-safe** | Only via your backend (API keys are secret) | Yes — user's wallet signs each request |
| **Integration effort** | Change `base_url` + API key | Install SDK, manage keys, handle signing |
| **On-chain transparency** | Settled periodically in batches | Every call settles against a sub-account |
| **Typical user** | Backend service, agent framework, prototype | Wallet-connected dApp, on-chain agent |

## **Pick the Router When…**

- You're building a **server-side app** — an agent, a backend, a CLI, an automation.
- You want to **reuse existing OpenAI/Anthropic code** without rewriting for a new SDK.
- You don't want to manage per-provider funding or provider discovery yourself.
- You want one balance covering every model, every service.
- You're prototyping and want the shortest path from signup to first request.

## **Pick Direct When…**

- You're building a **browser dApp** where the end user's wallet signs requests — API keys should never ship to browsers.
- You need **direct smart-contract interaction** — reading provider state, on-chain settlement receipts, custom escrow logic.
- You want to **choose and fund specific providers** with tight control, not a gateway's routing policy.
- You're writing an on-chain agent or a contract that calls providers directly.

## **Can I Use Both?**

Yes. The balances are separate (Router balance vs per-provider sub-accounts), but nothing prevents a single project from using the Router for backend workloads and Direct for a browser-wallet dApp.

## **pc.0g.ai: Router vs Advanced Mode**

The [pc.0g.ai](https://pc.0g.ai/) Web UI exposes **both** integration paths through a mode toggle in the top-right:

| **Mode in UI** | **What it is** | **Where funds live** |
| --- | --- | --- |
| **Router** (default) | This documentation. Unified API gateway with a single balance. | 0G **Payment Layer** — shared contract across all 0G products, single pool across all models/providers |
| **Advanced** | The classic [Direct](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) flow, embedded in the new UI | Per-provider sub-accounts — same as [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai/) |

**The two balance pools are independent.** A Router deposit does not fund your provider sub-accounts, and sub-account balances do not back Router API calls. They live in different contracts.

### **For existing compute-marketplace.0g.ai users**

If you've been using [compute-marketplace.0g.ai/wallet](https://compute-marketplace.0g.ai/wallet) and your funds don't appear in the default Router view on pc.0g.ai — that's expected. Click **Advanced** (top-right) to switch to the sub-account view where your existing balances are shown. Nothing has been lost; you're looking at the wrong pool.

If you want to consolidate onto the Router, withdraw from the per-provider sub-accounts in Advanced mode, then deposit the tokens into the Router balance from the default view.

## **See Also**

- [**Router Overview**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview)
- [**Direct**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) — SDK-based path (inference, fine-tuning, and account management)

# **FAQ**

## **I deposited on compute-marketplace.0g.ai but don't see my balance on pc.0g.ai — where did my 0G go?**

Nowhere. Those funds live in **per-provider sub-accounts** under the [Direct](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/direct) flow, and pc.0g.ai defaults to showing the **Router** balance, which is a different on-chain pool.

Click the **Advanced** toggle in the top-right of pc.0g.ai. Advanced mode is the same Direct flow you've been using, just embedded in the new UI — your sub-account balances appear there.

See [Router vs Advanced Mode](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison#pc0gai-router-vs-advanced-mode) for a side-by-side breakdown of the two systems.

## **Do I need a wallet to use the Router?**

Yes. The Router bills on-chain, so you need a wallet to deposit 0G tokens and create API keys. [pc.0g.ai](https://pc.0g.ai/) supports MetaMask and WalletConnect for direct wallet connect, plus social sign-in via Privy (Google, X/Twitter, Discord, TikTok) which provisions an embedded wallet for you.

Once you have an API key, your application code doesn't touch the wallet again — it just sends `Authorization: Bearer sk-…`.

## **What is TEE and why does it matter?**

A **Trusted Execution Environment** is a hardware-isolated region where code runs with cryptographic attestation of exactly what was executed. Every provider on the 0G Compute Network runs inside a TEE and attests to the model they serve.

This is what makes "decentralized inference" meaningful: you can verify, out-of-band, that the model you asked for is the model that ran — not a silently-swapped cheaper model.

## **What token do I pay in?**

**0G tokens**, native to the 0G chain. Deposit once to the Router payment contract; the Router handles conversions and provider payouts.

## **Is the Router really OpenAI-compatible?**

Yes. Any OpenAI client library — `openai-python`, `openai-node`, LangChain, LlamaIndex, Vercel AI SDK, etc. — works by changing `base_url` to `https://router-api.0g.ai/v1` and `api_key` to your Router key.

## **How is pricing set?**

Each provider declares prices per model (input tokens, output tokens). The Router publishes these in `/v1/models`. When you route with `sort: "price"`, the cheapest provider wins; otherwise failover picks a healthy provider regardless of price.

There is no Router markup on top of provider prices — what you see in the catalog is what you pay.

## **What happens if no providers are available?**

If every provider for your chosen model is unhealthy, you get `503 no_providers_available`. The Router does **not** fall back to a different model — picking a model is your decision. Choose a different model yourself, or wait and retry.

## **Does the Router store my prompts?**

No. The Router persists only billing metadata (token counts, model, provider, timestamp). Request and response bodies are not stored. If you need content audit logs, log them yourself on the caller side.

## **Can I run my own provider?**

Yes. See the [Inference Provider Setup](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference-provider) guide. Once you're registered and healthy, the Router will start routing traffic to you alongside existing providers.

# **Inference**

Run inference by connecting to individual 0G Compute providers via the `@0gfoundation/0g-compute-ts-sdk` SDK. You manage per-provider sub-accounts and sign every request with your wallet. For fine-tuning via the same SDK see [Fine-tuning](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning); for funding and sub-account management see [Account](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management).

**Not sure which path to use?**

0G Compute offers **two ways** to run inference:

- [**Router**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview) *(recommended for most applications)* — a single OpenAI-compatible API endpoint with one unified balance, automatic provider failover, and an API key. Use this if you're building a server-side app, agent, or prototype.
- **Direct** *(this page)* — connect to individual providers, manage per-provider sub-accounts, and sign requests with your wallet. Use this for browser dApps with wallet signing or when you need direct on-chain control.

Side-by-side comparison: [Router vs Direct](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/comparison).

**If your balance on pc.0g.ai looks empty**

The default **Router** view on [pc.0g.ai](https://pc.0g.ai/) shows the Router balance, which is a separate on-chain pool from the per-provider sub-accounts described on this page. To see funds you've deposited on [compute-marketplace.0g.ai](https://compute-marketplace.0g.ai/) (or through the CLI/SDK below), switch to **Advanced** mode using the top-right toggle on pc.0g.ai — it's the same Direct flow embedded in the new UI.

## **Prerequisites**

- Node.js >= 22.0.0
- A wallet with 0G tokens (either testnet or mainnet)
- EVM compatible wallet (for Web UI)

## **Supported Service Types**

- **Chatbot Services**: Conversational AI with models like GPT, DeepSeek, and others
- **Text-to-Image**: Generate images from text descriptions using Stable Diffusion and similar models
- **Speech-to-Text**: Transcribe audio to text using Whisper and other speech recognition models

## **Available Services**

The provider and model catalog changes frequently (providers join and leave, pricing is set per-provider). This page does not reproduce the list — check a live source instead:

- **Web UI** — [pc.0g.ai](https://pc.0g.ai/) (switch to **Advanced** mode, top-right) or [compute-marketplace.0g.ai/inference](https://compute-marketplace.0g.ai/inference) — both show the current provider catalog with pricing, health, and TEE attestation
- **CLI** — `0g-compute-cli inference list-providers`
- **SDK** — `await broker.inference.listService()`

### **Verification modes**

Each service declares one of two TEE verification modes:

**TeeML** — The AI model runs directly inside a Trusted Execution Environment. The TEE guarantees that both the model and the computation are protected, and responses are signed by the TEE's private key. Used by self-hosted models.

**TeeTLS** — The Broker runs inside a TEE and proxies requests to a centralized LLM provider over HTTPS. This provides cryptographic proof that responses genuinely came from the real provider:

- **Authentic routing**: During the TLS handshake, the Broker verifies the provider's certificate against trusted Certificate Authorities, ensuring the connection reaches the real provider — not an imposter.
- **Cryptographic proof**: The Broker captures the provider's TLS certificate fingerprint and bundles it together with the request hash, response hash, and provider identity into a signed routing proof using its TEE-protected private key.
- **Privacy preservation**: Since the Broker runs inside a TEE, it cannot inspect or tamper with user data in transit — 0G acts as a verifiable relay, not a middleman. This is conceptually similar to zkTLS but with stronger privacy properties, as the TEE ensures the relay itself is trustworthy.
- **End-to-end integrity**: The TEE attestation proves the Broker is running unmodified code, the CA/TLS system guarantees only the real provider holds a valid certificate for their domain, and the TEE signature binds everything together — a verifier can confirm the proof came from a genuine TEE and that the fingerprint belongs to the expected provider.

## **Choose Your Interface**

| **Feature** | **Web UI** | **CLI** | **SDK** |
| --- | --- | --- | --- |
| Setup time | ~1 min | ~2 min | ~5 min |
| Interactive chat | ✅ | ❌ | ❌ |
| Automation | ❌ | ✅ | ✅ |
| App integration | ❌ | ❌ | ✅ |
| Direct API access | ❌ | ❌ | ✅ |

**Web UICLISDK**

- **Web UI**
- CLI
- SDK

**Best for:** Quick testing, experimentation and direct frontend integration.

### **Option 1: Use the Hosted Web UI**

Two hosted entry points — both run the same Direct flow against the same per-provider sub-accounts:

- [**https://compute-marketplace.0g.ai/inference**](https://compute-marketplace.0g.ai/inference) — the original Marketplace UI
- [**https://pc.0g.ai**](https://pc.0g.ai/) with the top-right toggle set to **Advanced** — the same flow embedded in the new pc.0g.ai UI (the default "Router" mode on pc.0g.ai is a different, newer system — see the [Router docs](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview))

### **Option 2: Run Locally**

### **Installation**

```bash
pnpm add @0gfoundation/0g-compute-ts-sdk -g
```

### **Launch Web UI**

```bash
0g-compute-cli ui start-web
```

Open `http://localhost:3090` in your browser.

### **Getting Started**

### **1. Connect & Fund**

1. **Connect your wallet** (MetaMask recommended)
2. **Deposit some 0G tokens** using the account dashboard
3. **Browse available AI models** and their pricing

### **2. Start Using AI Services**

**Option A: Chat Interface**

- Click "Chat" on any chatbot provider
- Start conversations immediately
- Perfect for testing and experimentation

**Option B: Get API Integration**

- Click "Build" on any provider
- Get step-by-step integration guides
- Copy-paste ready code examples

---

## **Understanding Delayed Fee Settlement**

**How Fee Settlement Works**

0G Compute Network uses **delayed (batch) settlement** for provider fees. This means:

- **Fees are not deducted immediately** after each inference request. Instead, the provider accumulates usage fees and settles them on-chain in batches.
- **Your sub-account balance may appear to drop suddenly** when a batch settlement occurs. For example, if you make 10 requests and the provider settles all at once, you'll see a single larger deduction rather than 10 small ones.
- **You are only charged for actual usage** — no extra fees are deducted. The total amount settled always matches the sum of your individual request costs.
- **This is by design** to reduce on-chain transaction costs and improve efficiency for both users and providers.

**What this means in practice:**

- After making requests, your provider sub-account balance may temporarily appear higher than your "true" available balance
- When settlement occurs, the balance updates to reflect all accumulated fees at once
- If you see a sudden balance decrease, check your usage history — the total will match your actual usage

This behavior is visible in the Web UI (provider sub-account balances), CLI (`get-account`), and SDK (`getAccount()`).

**This applies only to the Direct flow.** The [Router](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview) uses a different billing path with a single unified balance — there are no per-provider sub-accounts and no delayed batch settlement visible to callers.

## **Rate Limits**

**Per-User Rate Limits**

Each provider enforces per-user rate limits to ensure fair resource sharing across all users. The default limits are:

- **30 requests per minute** per user (sustained)
- **Burst allowance of 5** requests (short spikes allowed)
- **5 concurrent requests** per user

If you exceed these limits, the provider will return HTTP `429 Too Many Requests`. Wait briefly and retry. These limits are set by individual providers and may vary.

## **Troubleshooting**

### **Common Issues**

- **Error: Too many requests (429)**
- **Error: Insufficient balance**
- **Error: Provider not acknowledged**
- **Error: No funds in provider sub-account**
- **Web UI not starting**

## **Next Steps**

- **Manage Accounts** → [Account](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management)
- **Fine-tune Models** → [Fine-tuning Guide](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning)
- **Become a Provider** → [Provider Setup](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference-provider)
- **View Examples** → [GitHub](https://github.com/0glabs/0g-compute-ts-starter-kit)

**Fine-tuning**
Customize AI models with your own data using 0G's distributed GPU network.
**Quick Start
Prerequisites**
Node version >= 22.0.0
**Install CLI**

`pnpm install @0gfoundation/0g-compute-ts-sdk -g`
**Set Environment
Choose Network**

`# Setup network0g-compute-cli setup-network`
**Login with Wallet**
Enter your wallet private key when prompted.

`# Login with your wallet private key0g-compute-cli login`
**Create Account & Add Funds**
The Fine-tuning CLI requires an account to pay for service fees via the 0G Compute Network.
**For detailed account management instructions, see [Account](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management).**

`# Deposit funds to your account0g-compute-cli deposit --amount 3# Transfer funds to a provider for fine-tuning# IMPORTANT: You must specify --service fine-tuning, otherwise funds go to the inference sub-account0g-compute-cli transfer-fund --provider <PROVIDER_ADDRESS> --amount 2 --service fine-tuning`**tip**
If you see `MinimumDepositRequired` when creating a task, it means you haven't transferred funds to the provider's **fine-tuning** sub-account. Make sure to include `--service fine-tuning` in the `transfer-fund` command.
**List Providers**

`0g-compute-cli fine-tuning list-providers`
The output will be like:

`┌──────────────────────────────────────────────────┬──────────────────────────────────────────────────┐│ Provider 1                                       │ 0x940b4a101CaBa9be04b16A7363cafa29C1660B0d       │├──────────────────────────────────────────────────┼──────────────────────────────────────────────────┤│ Available                                        │ ✓                                                │└──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘`
• **Provider x:** The address of the provider.
• **Available:** Indicates if the provider is available. If `✓`, the provider is available. If `✗`, the provider is occupied.
**List Models**

`# List available models0g-compute-cli fine-tuning list-models`**📋 Available Models Summary**
The output consists of two main sections:
• **Predefined Models:** Models provided by the system as predefined options. They are built-in, curated, and maintained to ensure quality and reliability.
• **Provider's Model:** Models offered by external service providers. Providers may customize or fine-tune models to address specific needs.**Model Name Format**
Use model names **without** the `Qwen/` prefix when specifying the `--model` parameter. For example:
• ✅ `--model "Qwen2.5-0.5B-Instruct"`
• ❌ `--model "Qwen/Qwen2.5-0.5B-Instruct"`
**Prepare Configuration File**
Use the standard configuration template below and **only modify the parameter values** as needed. Do not add additional parameters.
**Standard Configuration Template**

`{  "neftune_noise_alpha": 5,  "num_train_epochs": 1,  "per_device_train_batch_size": 2,  "learning_rate": 0.0002,  "max_steps": 3}`**Important Configuration Rules**
1. **Use the template above** - Copy the entire template
2. **Only modify parameter values** - Do not add or remove parameters
3. **Use decimal notation** - Write `0.0002` instead of `2e-4` for `learning_rate`
**Common mistakes to avoid:**
• ❌ Adding extra parameters (e.g., `"fp16": true`, `"bf16": false`)
• ❌ Removing existing parameters
• ❌ Using scientific notation like `2e-4`
**Adjustable Parameters**
You can modify these parameter values based on your training needs:**ParameterDescriptionNotes**`neftune_noise_alpha`Noise injection for fine-tuning0-10 (0 = disabled), typical: 5`num_train_epochs`Number of complete passes through the datasetPositive integer, typical: 1-3 for fine-tuning`per_device_train_batch_size`Training batch size1-4, reduce to 1 if out of memory`learning_rate`Learning rate (use decimal notation)0.00001-0.001, typical: 0.0002`max_steps`Maximum training steps-1 (use epochs) or positive integer**GPU Memory Management**
• If you encounter out-of-memory errors, **reduce batch size to 1**
• The provider automatically handles mixed precision training with `bf16`
*Note:* For custom models provided by third-party Providers, you can download the usage template including instructions on how to construct the dataset and training configuration using the following command:

`0g-compute-cli fine-tuning model-usage --provider <PROVIDER_ADDRESS>  --model <MODEL_NAME>   --output <PATH_TO_SAVE_MODEL_USAGE>`
**Prepare Your Data**
Your dataset must be in **JSONL format** with a **`.jsonl` file extension**. Each line is a JSON object representing one training example.
**Supported Dataset Formats**
**Format 1: Instruction-Input-Output**

`{"instruction": "Translate to French", "input": "Hello world", "output": "Bonjour le monde"}{"instruction": "Translate to French", "input": "Good morning", "output": "Bonjour"}{"instruction": "Summarize the text", "input": "Long article...", "output": "Brief summary"}`
**Format 2: Chat Messages**

`{"messages": [{"role": "user", "content": "What is 2+2?"}, {"role": "assistant", "content": "2+2 equals 4."}]}{"messages": [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there! How can I help you?"}]}`
**Format 3: Simple Text (for text completion)**

`{"text": "The quick brown fox jumps over the lazy dog."}{"text": "Machine learning is a subset of artificial intelligence."}`
**Dataset Guidelines**
• **File format**: Must be a `.jsonl` file (JSONL format)
• **Minimum examples**: At least 10 examples recommended for meaningful fine-tuning
• **Quality**: Ensure examples are accurate and representative of your use case
• **Consistency**: Use the same format throughout the dataset
• **Encoding**: UTF-8 encoding required
**Create Task**
Create a fine-tuning task. The fee will be **automatically calculated** by the broker based on the actual token count of your dataset.
**Option A: Using local dataset file (Recommended)**
The CLI will automatically upload the dataset to 0G Storage and create the task in one step:

`0g-compute-cli fine-tuning create-task \  --provider <PROVIDER_ADDRESS> \  --model <MODEL_NAME> \  --dataset-path <PATH_TO_DATASET> \  --config-path <PATH_TO_CONFIG_FILE>`
**Option B: Using dataset root hash**
If you prefer to upload the dataset separately first, or need to reuse the same dataset:
1. Upload your dataset to 0G Storage:

`0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>`
Output:

`Root hash: 0xabc123...`
1. Create the task using the root hash:

`0g-compute-cli fine-tuning create-task \  --provider <PROVIDER_ADDRESS> \  --model <MODEL_NAME> \  --dataset <DATASET_ROOT_HASH> \  --config-path <PATH_TO_CONFIG_FILE>`
**Parameters:ParameterDescription**`--provider`Address of the service provider`--model`Name of the pretrained model (without `Qwen/` prefix)`--dataset-path`Path to local dataset file — automatically uploads to 0G Storage (Option A)`--dataset`Root hash of the dataset on 0G Storage — mutually exclusive with `--dataset-path` (Option B)`--config-path`Path to the training configuration file`--gas-price`Gas price (optional)
The output will be like:

`Verify provider...Provider verifiedCreating task (fee will be calculated automatically)...Fee will be automatically calculated by the broker based on actual token countCreated Task ID: 6b607314-88b0-4fef-91e7-43227a54de57`
*Note:* When creating a task for the same provider, you must wait for the previous task to be completed (status `Finished`) before creating a new task. If the provider is currently running other tasks, you will be prompted to choose between adding your task to the waiting queue or canceling the request.
**Fee Calculation**
The fine-tuning service fee is **automatically calculated** based on your dataset size and training configuration. The fee consists of two components:
**Formula**

`Total Fee = Training Fee + Storage Reserve Fee`
Where:
• **Training Fee** = `(tokenSize / 1,000,000) × pricePerMillionTokens × trainEpochs`
• **Storage Reserve Fee** = Fixed amount based on model size
**Components ExplainedComponentDescription**`tokenSize`Total number of tokens in your dataset (automatically counted)`pricePerMillionTokens`Price per million tokens (model-specific, see [Predefined Models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#predefined-models))`trainEpochs`Number of training epochs (from your config)`Storage Reserve Fee`Fixed fee to reserve storage for the fine-tuned model:• Qwen3-32B (~900 MB LoRA): 0.09 0G• Qwen2.5-0.5B-Instruct (~100 MB LoRA): 0.01 0G
**Example**
For a dataset with 10,000 tokens, trained for 3 epochs on Qwen2.5-0.5B-Instruct:
• Price per million tokens = 0.5 0G (see [Predefined Models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#predefined-models))
• Training Fee = (10,000 / 1,000,000) × 0.5 × 3 = 0.015 0G
• Storage Reserve Fee = 0.01 0G (for Qwen2.5-0.5B-Instruct)
• **Total Fee = 0.025 0Gtip**
The actual fee is calculated during the setup phase after your dataset is analyzed. You can view the final fee using the [`get-task`](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#monitor-progress) command before training begins.
**Monitor Progress**
You can monitor the progress of your task by running the following command:

`0g-compute-cli fine-tuning get-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>`
The output will be like:

`┌───────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────────┐│ Field                             │ Value                                                                               │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ ID                                │ beb6f0d8-4660-4c62-988d-00246ce913d2                                                │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ Created At                        │ 2025-03-11T01:20:07.644Z                                                            │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ Pre-trained Model Hash            │ 0xcb42b5ca9e998c82dd239ef2d20d22a4ae16b3dc0ce0a855c93b52c7c2bab6dc                  │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ Dataset Hash                      │ 0xaae9b4e031e06f84b20f10ec629f36c57719ea512992a6b7e2baea93f447a5fa                  │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ Training Params                   │ {......}                                                                            │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ Fee (neuron)                      │ 82                                                                                  │├───────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────────┤│ Progress                          │ Delivered                                                                           │└───────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────────┘`
**Field Descriptions:**
• **ID**: Unique identifier for your fine-tuning task
• **Pre-trained Model Hash**: Hash identifier for the base model being fine-tuned
• **Dataset Hash**: Hash identifier for your training dataset (0G Storage root hash)
• **Training Params**: Configuration parameters used during fine-tuning
• **Fee (neuron)**: Total cost for the fine-tuning task (automatically calculated based on token count)
• **Progress**: Task status. Possible values are:
    ◦ `Init`: Task submitted
    ◦ `SettingUp`: Provider is preparing the environment (downloading dataset, etc.)
    ◦ `SetUp`: Provider is ready to start training
    ◦ `Training`: Provider is training the model
    ◦ `Trained`: Provider has finished training
    ◦ `Delivering`: Provider is encrypting and uploading the model to 0G Storage
    ◦ `Delivered`: Fine-tuning result is ready for download
    ◦ `UserAcknowledged`: User has downloaded and confirmed the result
    ◦ `Finished`: Provider has settled fees and shared decryption key — task is completed
    ◦ `Failed`: Task failed
**View Task Logs**
You can view the logs of your task by running the following command:

`0g-compute-cli fine-tuning get-log --provider <PROVIDER_ADDRESS> --task <TASK_ID>`
The output will be like:

`creating task....Step: 0, Logs: {'loss': ..., 'accuracy': ...}...Training model for task beb6f0d8-4660-4c62-988d-00246ce913d2 completed successfully`
**Download and Acknowledge Model**
Use the [Check Task](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#monitor-progress) command to view task status. When the status changes to `Delivered`, the provider has completed fine-tuning and the encrypted model is ready. Download and acknowledge the model:

`0g-compute-cli fine-tuning acknowledge-model \  --provider <PROVIDER_ADDRESS> \  --task-id <TASK_ID> \  --data-path <PATH_TO_SAVE_MODEL_FILE>`
The CLI will automatically download the encrypted model from 0G Storage. If 0G Storage download fails, it will fall back to downloading directly from the provider's TEE.**48-Hour Deadline**
**You must download and acknowledge the model within 48 hours after the task status changes to `Delivered`.**
If you fail to acknowledge within 48 hours:
• The provider will **force settlement** automatically
• You will **lose access to the fine-tuned model**
• **30% of the total task fee** will be deducted as compensation for the provider's compute resources
**Action required:** Monitor your task status and download promptly when it reaches `Delivered`.**File Path Required**
`--data-path` **must be a file path**, not a directory.
**Example:**

`0g-compute-cli fine-tuning acknowledge-model \  --provider <PROVIDER_ADDRESS> \  --task-id 0e91ef3d-ac0d-422e-a38c-9d42a28c4412 \  --data-path /workspace/output/encrypted_model.bin`**Data Integrity Verification**
The `acknowledge-model` command performs automatic data integrity verification to ensure the downloaded model matches the root hash that the provider submitted to the blockchain contract. This guarantees you receive the authentic model without corruption or tampering.
**Note:** The model file downloaded with the above command is encrypted, and additional steps are required for decryption.
**Decrypt Model**
After acknowledging the model, the provider automatically settles the fees and uploads the decryption key to the contract (encrypted with your public key). Use the `get-task` command to check the task status. **When the status changes to `Finished`**, you can decrypt the model:

`0g-compute-cli fine-tuning decrypt-model \  --provider <PROVIDER_ADDRESS> \  --task-id <TASK_ID> \  --encrypted-model <PATH_TO_ENCRYPTED_MODEL_FILE> \  --output <PATH_TO_SAVE_DECRYPTED_MODEL>`
**Example:**

`# Use the same file path you specified in acknowledge-model0g-compute-cli fine-tuning decrypt-model \  --provider <PROVIDER_ADDRESS> \  --task-id 0e91ef3d-ac0d-422e-a38c-9d42a28c4412 \  --encrypted-model /workspace/output/encrypted_model.bin \  --output /workspace/output/model_output.zip`
The above command performs the following operations:
• Gets the encrypted key from the contract uploaded by the provider
• Decrypts the key using the user's private key
• Decrypts the model with the decrypted key**Wait for Settlement**
After `acknowledge-model`, the provider needs about **1 minute** to settle fees and upload the decryption key. If you decrypt too early (status is still `UserAcknowledged` instead of `Finished`), you may see an error like `second arg must be public key`. Simply wait and retry.
**Note:** The decrypted result will be saved as a zip file. Ensure that the `<PATH_TO_SAVE_DECRYPTED_MODEL>` ends with .zip (e.g., model_output.zip). After downloading, unzip the file to access the decrypted model.
**Extract LoRA Adapter**
After decryption, unzip the model to access the LoRA adapter files:

`unzip model_output.zip -d ./lora_adapter/`
The extracted folder will contain:

`lora_adapter/├── output_model/│   ├── adapter_config.json       # LoRA configuration│   ├── adapter_model.safetensors # LoRA weights│   ├── tokenizer.json            # Tokenizer│   ├── tokenizer_config.json│   └── README.md`
**Using the Fine-tuned Model**
After fine-tuning, you receive a **LoRA adapter** (Low-Rank Adaptation), not a full model. To use it, you need to:
1. Download the base model
2. Load the LoRA adapter on top of the base model
3. Run inference
**Step 1: Download Base Model**
Download the same base model that was used for fine-tuning from HuggingFace:

`# Install huggingface-cli if not already installedpip install huggingface_hub# For Qwen2.5-0.5B-Instructhuggingface-cli download Qwen/Qwen2.5-0.5B-Instruct --local-dir ./base_model# For Qwen3-32B (requires ~65GB disk space)# huggingface-cli download Qwen/Qwen3-32B --local-dir ./base_model`
**Step 2: Load LoRA with Base Model**
Use the following Python code to combine the LoRA adapter with the base model.
**For Qwen2.5-0.5B-Instruct:**

`from transformers import AutoModelForCausalLM, AutoTokenizerfrom peft import PeftModelimport torch# Pathsbase_model_path = "./base_model"  # or "Qwen/Qwen2.5-0.5B-Instruct"lora_adapter_path = "./lora_adapter/output_model"# Load tokenizertokenizer = AutoTokenizer.from_pretrained(lora_adapter_path)# Load base modelbase_model = AutoModelForCausalLM.from_pretrained(    base_model_path,    torch_dtype=torch.bfloat16,    device_map="auto")# Load LoRA adaptermodel = PeftModel.from_pretrained(base_model, lora_adapter_path)print("Model loaded successfully!")`
**For Qwen3-32B (requires 40GB+ VRAM):**

`from transformers import AutoModelForCausalLM, AutoTokenizerfrom peft import PeftModelimport torch# Pathsbase_model_path = "./base_model"  # or "Qwen/Qwen3-32B"lora_adapter_path = "./lora_adapter/output_model"# Load tokenizertokenizer = AutoTokenizer.from_pretrained(lora_adapter_path)# Load base model with optimizations for large modelsbase_model = AutoModelForCausalLM.from_pretrained(    base_model_path,    torch_dtype=torch.float16,      # Use fp16 to reduce memory    device_map="auto",               # Automatically distribute across GPUs    low_cpu_mem_usage=True,          # Reduce CPU memory usage during loading    trust_remote_code=True           # Required for some Qwen models)# Load LoRA adaptermodel = PeftModel.from_pretrained(base_model, lora_adapter_path)print("Model loaded successfully!")`**Memory Optimization for Large Models**
If you encounter out-of-memory errors with Qwen3-32B, you can use quantization:

`# 8-bit quantization (requires bitsandbytes)from transformers import BitsAndBytesConfigquantization_config = BitsAndBytesConfig(load_in_8bit=True)base_model = AutoModelForCausalLM.from_pretrained(    base_model_path,    quantization_config=quantization_config,    device_map="auto",    trust_remote_code=True)`
**Step 3: Run Inference**

`def generate_response(prompt, max_new_tokens=100):    messages = [{"role": "user", "content": prompt}]        # Apply chat template    text = tokenizer.apply_chat_template(        messages,        tokenize=False,        add_generation_prompt=True    )        # Tokenize    inputs = tokenizer(text, return_tensors="pt").to(model.device)        # Generate    outputs = model.generate(        **inputs,        max_new_tokens=max_new_tokens,        do_sample=True,        temperature=0.7,        top_p=0.9    )        # Decode    response = tokenizer.decode(outputs[0][inputs['input_ids'].shape[1]:], skip_special_tokens=True)    return response# Example usageresponse = generate_response("Hello, how are you?")print(response)`
**Optional: Merge and Save Full Model**
If you want to create a standalone model without needing to load the adapter separately:

`from transformers import AutoModelForCausalLM, AutoTokenizerfrom peft import PeftModelimport torch# Load base model and LoRAbase_model = AutoModelForCausalLM.from_pretrained(    "Qwen/Qwen2.5-0.5B-Instruct",    torch_dtype=torch.bfloat16,    device_map="auto")model = PeftModel.from_pretrained(base_model, "./lora_adapter/output_model")# Merge LoRA weights into base modelmerged_model = model.merge_and_unload()# Save the merged modelmerged_model.save_pretrained("./merged_model")tokenizer = AutoTokenizer.from_pretrained("./lora_adapter/output_model")tokenizer.save_pretrained("./merged_model")print("Merged model saved to ./merged_model")`
**Requirements**
Install the required Python packages:
**For GPU Environments (Recommended)**
If you have an NVIDIA GPU, install PyTorch with CUDA support. **Important:** Match the CUDA version to your environment.

`# For CUDA 12.1 (check your CUDA version with: nvidia-smi)pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121# For CUDA 11.8pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118# Install other ML librariespip install transformers peft accelerate`
**For CPU-Only Environments**

`pip install torch transformers peft accelerate`
**Package RequirementsPackageMinimum VersionPurpose**`torch`>= 2.0Deep learning framework`transformers`>= 4.40.0Model loading and inference`peft`>= 0.10.0LoRA adapter support`accelerate`>= 0.27.0Device management**Verify GPU Support**
After installation, verify that PyTorch can detect your GPU:

`python3 -c "import torch; print('PyTorch version:', torch.__version__); print('CUDA available:', torch.cuda.is_available())"`
If `CUDA available: False`, you may need to reinstall PyTorch with the correct CUDA version.
**Account Management**
For comprehensive account management, including viewing balances, managing sub-accounts, and handling refunds, see [Account](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management).
Quick CLI commands:

`# Check balance0g-compute-cli get-account# View sub-account for a provider0g-compute-cli get-sub-account --provider <PROVIDER_ADDRESS># Request refund from sub-accounts0g-compute-cli retrieve-fund`
**Other Commands
Upload Dataset Separately**
You can upload a dataset to 0G Storage before creating a task:

`0g-compute-cli fine-tuning upload --data-path <PATH_TO_DATASET>`
**Download Data**
You can download previously uploaded datasets from 0G Storage:

`0g-compute-cli fine-tuning download --data-path <PATH_TO_SAVE_DATASET> --data-root <DATASET_ROOT_HASH>`
**View Task List**
You can view the list of tasks submitted to a specific provider using the following command:

`0g-compute-cli fine-tuning list-tasks  --provider <PROVIDER_ADDRESS>`
**Cancel a Task**
You can cancel a task before it starts running using the following command:

`0g-compute-cli fine-tuning cancel-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>`
**Note:** Tasks that are already in progress or completed cannot be canceled.
**TroubleshootingError: MinimumDepositRequiredError: Provider busyError: Insufficient balanceError: "second arg must be public key" when decryptingError: "Unexpected non-whitespace character after JSON" when creating task[PreviousInference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference)[NextAccount](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/account-management)**
• [Quick Start](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#quick-start)
    ◦ [Prerequisites](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prerequisites)
    ◦ [Install CLI](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#install-cli)
    ◦ [Set Environment](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#set-environment)
    ◦ [Create Account & Add Funds](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#create-account--add-funds)
    ◦ [List Providers](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#list-providers)
    ◦ [List Models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#list-models)
    ◦ [Prepare Configuration File](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prepare-configuration-file)
    ◦ [Prepare Your Data](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prepare-your-data)
    ◦ [Create Task](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#create-task)
    ◦ [Fee Calculation](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#fee-calculation)
    ◦ [Monitor Progress](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#monitor-progress)
    ◦ [View Task Logs](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#view-task-logs)
    ◦ [Download and Acknowledge Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#download-and-acknowledge-model)
    ◦ [Decrypt Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#decrypt-model)
    ◦ [Extract LoRA Adapter](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#extract-lora-adapter)
• [Using the Fine-tuned Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#using-the-fine-tuned-model)
    ◦ [Step 1: Download Base Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#step-1-download-base-model)
    ◦ [Step 2: Load LoRA with Base Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#step-2-load-lora-with-base-model)
    ◦ [Step 3: Run Inference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#step-3-run-inference)
    ◦ [Optional: Merge and Save Full Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#optional-merge-and-save-full-model)
    ◦ [Requirements](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#requirements)
    ◦ [Account Management](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#account-management)
    ◦ [Other Commands](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#other-commands)
• [Troubleshooting](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#troubleshooting)

- • **Provider x:** The address of the provider.
- • **Available:** Indicates if the provider is available. If `✓`, the provider is available. If `✗`, the provider is occupied.
- •
    
    **Predefined Models:** Models provided by the system as predefined options. They are built-in, curated, and maintained to ensure quality and reliability.
    
- •
    
    **Provider's Model:** Models offered by external service providers. Providers may customize or fine-tune models to address specific needs.
    
- • ✅ `-model "Qwen2.5-0.5B-Instruct"`
- • ❌ `-model "Qwen/Qwen2.5-0.5B-Instruct"`
1. 1. **Use the template above** - Copy the entire template
2. 2. **Only modify parameter values** - Do not add or remove parameters
3. 3. **Use decimal notation** - Write `0.0002` instead of `2e-4` for `learning_rate`
- • ❌ Adding extra parameters (e.g., `"fp16": true`, `"bf16": false`)
- • ❌ Removing existing parameters
- • ❌ Using scientific notation like `2e-4`
- • If you encounter out-of-memory errors, **reduce batch size to 1**
- • The provider automatically handles mixed precision training with `bf16`
- • **File format**: Must be a `.jsonl` file (JSONL format)
- • **Minimum examples**: At least 10 examples recommended for meaningful fine-tuning
- • **Quality**: Ensure examples are accurate and representative of your use case
- • **Consistency**: Use the same format throughout the dataset
- • **Encoding**: UTF-8 encoding required
1. 1. Upload your dataset to 0G Storage:
2. 1. Create the task using the root hash:
- • **Training Fee** = `(tokenSize / 1,000,000) × pricePerMillionTokens × trainEpochs`
- • **Storage Reserve Fee** = Fixed amount based on model size
- • Price per million tokens = 0.5 0G (see [Predefined Models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#predefined-models))
- • Training Fee = (10,000 / 1,000,000) × 0.5 × 3 = 0.015 0G
- • Storage Reserve Fee = 0.01 0G (for Qwen2.5-0.5B-Instruct)
- • **Total Fee = 0.025 0G**
- • **ID**: Unique identifier for your fine-tuning task
- • **Pre-trained Model Hash**: Hash identifier for the base model being fine-tuned
- • **Dataset Hash**: Hash identifier for your training dataset (0G Storage root hash)
- • **Training Params**: Configuration parameters used during fine-tuning
- • **Fee (neuron)**: Total cost for the fine-tuning task (automatically calculated based on token count)
- • **Progress**: Task status. Possible values are:
    - ◦ `Init`: Task submitted
    - ◦ `SettingUp`: Provider is preparing the environment (downloading dataset, etc.)
    - ◦ `SetUp`: Provider is ready to start training
    - ◦ `Training`: Provider is training the model
    - ◦ `Trained`: Provider has finished training
    - ◦ `Delivering`: Provider is encrypting and uploading the model to 0G Storage
    - ◦ `Delivered`: Fine-tuning result is ready for download
    - ◦ `UserAcknowledged`: User has downloaded and confirmed the result
    - ◦ `Finished`: Provider has settled fees and shared decryption key — task is completed
    - ◦ `Failed`: Task failed
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- • The provider will **force settlement** automatically
- • You will **lose access to the fine-tuned model**
- • **30% of the total task fee** will be deducted as compensation for the provider's compute resources
- • Gets the encrypted key from the contract uploaded by the provider
- • Decrypts the key using the user's private key
- • Decrypts the model with the decrypted key
1. 1. Download the base model
2. 2. Load the LoRA adapter on top of the base model
3. 3. Run inference
- • [Quick Start](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#quick-start)
    - ◦ [Prerequisites](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prerequisites)
    - ◦ [Install CLI](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#install-cli)
    - ◦ [Set Environment](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#set-environment)
    - ◦ [Create Account & Add Funds](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#create-account--add-funds)
    - ◦ [List Providers](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#list-providers)
    - ◦ [List Models](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#list-models)
    - ◦ [Prepare Configuration File](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prepare-configuration-file)
    - ◦ [Prepare Your Data](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#prepare-your-data)
    - ◦ [Create Task](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#create-task)
    - ◦ [Fee Calculation](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#fee-calculation)
    - ◦ [Monitor Progress](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#monitor-progress)
    - ◦ [View Task Logs](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#view-task-logs)
    - ◦ [Download and Acknowledge Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#download-and-acknowledge-model)
    - ◦ [Decrypt Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#decrypt-model)
    - ◦ [Extract LoRA Adapter](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#extract-lora-adapter)
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- • [Using the Fine-tuned Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#using-the-fine-tuned-model)
    - ◦ [Step 1: Download Base Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#step-1-download-base-model)
    - ◦ [Step 2: Load LoRA with Base Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#step-2-load-lora-with-base-model)
    - ◦ [Step 3: Run Inference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#step-3-run-inference)
    - ◦ [Optional: Merge and Save Full Model](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#optional-merge-and-save-full-model)
    - ◦ [Requirements](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#requirements)
    - ◦ [Account Management](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#account-management)
    - ◦ [Other Commands](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#other-commands)
- 
- 
- 
- 
- 
- 
- 
- • [Troubleshooting](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning#troubleshooting)

**Docs**
• [Introduction](https://docs.0g.ai/)
• [Developer Hub](https://docs.0g.ai/developer-hub/getting-started)
• [Run a Node](https://docs.0g.ai/run-a-node/overview)**Products**
• [0G Website](https://0g.ai/)
• [ChainScan (Mainnet Explorer)](https://chainscan.0g.ai/)
• [StorageScan (Storage Explorer)](https://storagescan.0g.ai/)
• [Builder Hub](https://build.0g.ai/)
• [Ecosystem Explorer](https://explorer.0g.ai/)**Community**
• [Discord](https://discord.gg/0glabs)
• [Telegram](https://t.me/zgcommunity)
• [X (Twitter)](https://x.com/0g_labs)**More**
• [Blog](https://0g.ai/blog)
• [GitHub](https://github.com/0gfoundation)
• [0G Foundation](https://0gfoundation.ai/)Copyright © 2026 0G Labs, Built with Docusaurus.

- • [Introduction](https://docs.0g.ai/)
- • [Developer Hub](https://docs.0g.ai/developer-hub/getting-started)
- • [Run a Node](https://docs.0g.ai/run-a-node/overview)
- • [0G Website](https://0g.ai/)
- • [ChainScan (Mainnet Explorer)](https://chainscan.0g.ai/)
- • [StorageScan (Storage Explorer)](https://storagescan.0g.ai/)
- • [Builder Hub](https://build.0g.ai/)
- • [Ecosystem Explorer](https://explorer.0g.ai/)
- • [Discord](https://discord.gg/0glabs)
- • [Telegram](https://t.me/zgcommunity)
- • [X (Twitter)](https://x.com/0g_labs)
- • [Blog](https://0g.ai/blog)
- • [GitHub](https://github.com/0gfoundation)
- • [0G Foundation](https://0gfoundation.ai/)

![0G Labs Logo](https://docs.0g.ai/img/0G-Logo-Dark.svg)

# **Account**

Both [**Direct Inference**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference) and [**Fine-tuning**](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning) use the same per-provider account system: you deposit to a main account, transfer funds to each provider's sub-account, and the provider deducts from there as you use the service. This page is the shared reference for all operations — Web UI, CLI, and SDK.

**Using the Router instead?**

The [Router](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/overview) has its own unified billing and does **not** use per-provider sub-accounts. Router deposits, balance, API keys, and usage live elsewhere — see [Router → Deposits & Billing](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/account/deposits) and [Router → Authentication](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/router/authentication).

## **Overview**

The account system provides a secure and flexible way to manage funds across different AI service providers.

### **Account Structure**

- **Main Account**: Your primary wallet where funds are deposited. All deposits go here first, and you can withdraw funds from here back to your wallet.
- **Sub-Accounts**: Provider-specific accounts created automatically when you transfer funds to a provider. Each provider has a separate sub-account where funds are locked for their specific services.

### **Fund Flow**

![Account Fund Flow Diagram](https://docs.0g.ai/img/compute-network-account.png)

1. **Deposit**: Transfer funds from your wallet to your Main Account
2. **Transfer**: Move funds from Main Account to Provider Sub-Accounts
3. **Usage**: Provider deducts from Sub-Account for services rendered
4. **Refund Request**: Initiate refund from Sub-Account (enters 24-hour lock period)
5. **Complete Refund**: After lock period expires, call retrieve-fund again to complete transfer back to Main Account
6. **Withdraw**: Transfer funds from Main Account back to your wallet

### **Security Features**

- **24-hour lock period** for refunds to protect providers from abuse
- **Single-use authentication** for each request to prevent replay attacks
- **On-chain verification** for all transactions ensuring transparency
- **Provider acknowledgment** required before first use of services

## **Prerequisites**

- Node.js >= 22.0.0
- A wallet with 0G tokens (for testnet or mainnet)
- EVM compatible wallet (for Web UI)

## **Choose Your Interface**

| **Feature** | **Web UI** | **CLI** | **SDK** |
| --- | --- | --- | --- |
| Setup time | ~1 min | ~2 min | ~5 min |
| Visual dashboard | ✅ | ❌ | ❌ |
| Automation | ❌ | ✅ | ✅ |
| App integration | ❌ | ❌ | ✅ |

**Web UICLISDK**

- **Web UI**
- CLI
- SDK

**Best for:** Quick account management with visual dashboard

### **Installation**

```bash
pnpm add @0gfoundation/0g-compute-ts-sdk -g
```

### **Launch Web UI**

```bash
0g-compute-cli ui start-web
```

Access the Web UI at `http://localhost:3090/wallet` where you can:

- View your account balance in real-time
- Deposit funds directly from your connected wallet
- Transfer funds to provider sub-accounts
- Monitor spending and usage
- Request refunds with a visual interface

---

## **Best Practices**

### **For Inference Services**

1. Deposit enough funds for expected usage
2. Transfer funds to providers you plan to use frequently
3. Keep some balance in sub-accounts for better response times
4. Monitor usage regularly

### **For Fine-tuning Services**

1. Calculate dataset size before transferring funds
2. Transfer enough to cover the entire training job
3. Request refunds for unused funds after job completion

## **Troubleshooting**

- **Insufficient Balance Error**
- **Refund Not Available**
- **Transaction Failed**

## **Related Documentation**

- [Inference Services](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference) - Using AI inference with your funded accounts
- [Fine-tuning Services](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/fine-tuning) - Training custom models with your funded accounts