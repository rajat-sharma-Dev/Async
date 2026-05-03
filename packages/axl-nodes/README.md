# AXL Node Setup

## Prerequisites
- Go 1.25.x (NOT 1.26 — gVisor compatibility issue)
- OpenSSL (macOS: `brew install openssl`)

## Setup

```bash
# Clone and build AXL
git clone https://github.com/gensyn-ai/axl.git
cd axl
go build -o node ./cmd/node/

# Generate identity keys (macOS)
/opt/homebrew/opt/openssl/bin/openssl genpkey -algorithm ed25519 -out private.pem
/opt/homebrew/opt/openssl/bin/openssl genpkey -algorithm ed25519 -out private-2.pem

# Copy config files from this directory
cp ../node-config.json .
cp ../node-config-2.json .

# Start Node A (terminal 1)
./node -config node-config.json

# Start Node B (terminal 2)
./node -config node-config-2.json
```

## Verify

```bash
# Get Node A key
curl -s http://127.0.0.1:9002/topology | python3 -c "import sys,json; print(json.load(sys.stdin)['our_public_key'])"

# Get Node B key
curl -s http://127.0.0.1:9012/topology | python3 -c "import sys,json; print(json.load(sys.stdin)['our_public_key'])"
```
