# AXL Node Setup

These scripts complete Pranav Phase 1's AXL setup path on Windows.

## Prerequisites

- Go 1.25.x on PATH. Do not use Go 1.26 because AXL's gVisor dependency is incompatible.
- Git on PATH.
- OpenSSL 3.x on PATH.

## Setup

```powershell
cd packages\axl-nodes
.\setup-axl.ps1
```

The script:

- clones `https://github.com/gensyn-ai/axl.git` into `packages/axl-nodes/axl`
- builds `node.exe`
- copies it to `packages/axl-nodes/node.exe`
- generates `private.pem` and `private-2.pem`

## Start Nodes

```powershell
.\start-nodes.ps1
```

Node A API: `http://127.0.0.1:9002`

Node B API: `http://127.0.0.1:9012`

## Verify Send/Recv

```powershell
.\verify-axl.ps1
```

The verification sends a `HEARTBEAT` message from Node B to Node A and reads it back through `/recv`.

## Backend Check

Once both nodes are running:

```powershell
npm run backend:dev
```

Then visit:

```text
http://localhost:3001/api/axl/topology
```

Expected `mode`: `p2p-mesh`.
