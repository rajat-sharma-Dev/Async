# Untitled

# **0G Storage SDKs**

Build decentralized storage into your applications with our powerful SDKs designed for modern development workflows.

## **Available SDKs**

- **Go SDK**: Ideal for backend systems and applications built with Go
- **TypeScript SDK**: Perfect for frontend development and JavaScript-based projects

## **Core Features**

Both SDKs provide a streamlined interface to interact with the 0G Storage network:

- **Upload and Download Files**: Securely store and retrieve data of various sizes and formats
- **Manage Data**: List uploaded files, check their status, and control access permissions
- **Leverage Decentralization**: Benefit from the 0G network's distributed architecture for enhanced data availability, immutability, and censorship resistance

## **Quick Start Resources**

**Starter Kits Available**

Get up and running quickly with our starter kits:

- [**TypeScript Starter Kit**](https://github.com/0gfoundation/0g-storage-ts-starter-kit) - CLI scripts, importable library, and browser UI with MetaMask wallet connect. Supports turbo/standard modes.
- [**Go Starter Kit**](https://github.com/0gfoundation/0g-storage-go-starter-kit) - Ready-to-use examples with Gin server and CLI tool

```bash
# TypeScript — upload a file in under 5 minutesgit clone https://github.com/0gfoundation/0g-storage-ts-starter-kitcd 0g-storage-ts-starter-kit && npm installcp .env.example .env   # Add your PRIVATE_KEYnpm run upload -- ./file.txt
```

**Go SDKTypeScript SDK**

- **Go SDK**
- TypeScript SDK

## **Installation**

Install the 0G Storage Client library:

```bash
go get github.com/0gfoundation/0g-storage-client
```

## **Setup**

### **Import Required Packages**

```go
import("context""github.com/0gfoundation/0g-storage-client/common/blockchain""github.com/0gfoundation/0g-storage-client/common""github.com/0gfoundation/0g-storage-client/indexer""github.com/0gfoundation/0g-storage-client/transfer""github.com/0gfoundation/0g-storage-client/core")
```

### **Initialize Clients**

Create the necessary clients to interact with the network:

```go
// Create Web3 client for blockchain interactionsw3client:= blockchain.MustNewWeb3(evmRpc, privateKey)defer w3client.Close()// Create indexer client for node managementindexerClient, err:= indexer.NewClient(indRpc, indexer.IndexerClientOption{    LogOption: common.LogOption{},})if err!=nil{// Handle error}
```

**Parameters:** `evmRpc` is the chain RPC endpoint, `privateKey` is your signer key, and `indRpc` is the indexer RPC endpoint. Use the current values published in the network overview docs for your network.

## **Core Operations**

### **Node Selection**

Select storage nodes before performing file operations:

```go
nodes, err:= indexerClient.SelectNodes(ctx, expectedReplicas, droppedNodes, method, fullTrusted)if err!=nil{// Handle error}
```

**Parameters:** `ctx` is the context for the operation. `expectedReplicas` is the number of replicas to maintain. `droppedNodes` is a list of nodes to exclude, `method` can be `min`, `max`, `random`, or a positive number string, and `fullTrusted` limits selection to trusted nodes.

### **File Upload**

Upload files to the network with the indexer client:

```go
file, err:= core.Open(filePath)if err!=nil{// Handle error}defer file.Close()fragmentSize:=int64(4*1024*1024*1024)opt:= transfer.UploadOption{    ExpectedReplica:1,    TaskSize:10,    SkipTx:true,    FinalityRequired: transfer.TransactionPacked,    FastMode:true,    Method:"min",    FullTrusted:true,}txHashes, roots, err:= indexerClient.SplitableUpload(ctx, w3client, file, fragmentSize, opt)if err!=nil{// Handle error}
```

`fragmentSize` controls the split size for large files. The returned `roots` contain the merkle root(s) to download later.

### **File Hash Calculation**

Calculate a file's Merkle root hash for identification:

```go
rootHash, err:= core.MerkleRoot(filePath)if err!=nil{// Handle error}fmt.Printf("File hash: %s\n", rootHash.String())
```

**Important**

Save the root hash - you'll need it to download the file later!

### **File Download**

Download files from the network:

```go
rootHex:= rootHash.String()err= indexerClient.Download(ctx, rootHex, outputPath, withProof)if err!=nil{// Handle error}
```

`withProof` enables merkle proof verification during download.

## **Best Practices**

1. **Error Handling**: Implement proper error handling and cleanup
2. **Context Management**: Use contexts for operation timeouts and cancellation
3. **Resource Cleanup**: Always close clients when done using `defer client.Close()`
4. **Verification**: Enable proof verification for sensitive files
5. **Monitoring**: Track transaction status for important uploads

## **Additional Resources**

- [Go SDK Repository](https://github.com/0gfoundation/0g-storage-client)
- [Go Starter Kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)

# **0G Storage CLI**

The 0G Storage CLI is your command-line gateway to interact directly with the 0G Storage network. It simplifies the process of uploading and downloading files while providing full control over your decentralized storage operations.

## **Why Use the CLI?**

- **Direct Control**: Manage data location and versioning with precision
- **Automation Ready**: Build scripts and cron jobs for regular operations
- **Full Feature Access**: Access all storage and KV operations from the terminal
- **Developer Friendly**: Perfect for integrating into your development workflow

**Web-Based Alternative**

For a quick and easy web interface, try the [0G Storage Web Tool](https://storagescan-galileo.0g.ai/tool) - perfect for one-off uploads and downloads.

## **Installation**

### **Prerequisites**

- Go 1.18 or higher installed on your system
- Git for cloning the repository

### **Setup Steps**

**1. Clone the Repository**

```bash
git clone https://github.com/0gfoundation/0g-storage-client.gitcd 0g-storage-client
```

**2. Build the Binary**

```bash
go build
```

**3. Add to PATH** (Optional but recommended)

```bash
# Move binary to Go bin directorymv 0g-storage-client ~/go/bin# Add to PATH if not already configuredexport PATH=~/go/bin:$PATH
```

## **Command Overview**

The CLI provides a comprehensive set of commands for storage operations:

```
0g-storage-client [command] [flags]Available Commands:  upload      Upload file to 0G Storage network  download    Download file from 0G Storage network  upload-dir  Upload directory to 0G Storage network  download-dir Download directory from 0G Storage network  diff-dir    Diff directory from 0G Storage network  gen         Generate test files  kv-write    Write to KV streams  kv-read     Read KV streams  gateway     Start gateway service  indexer     Start indexer service  deploy      Deploy storage contracts  completion  Generate shell completion scripts  help        Get help for any commandGlobal Flags:  --gas-limit uint                Custom gas limit to send transaction  --gas-price uint                Custom gas price to send transaction  --log-level string              Log level (default "info")  --log-color-disabled            Force to disable colorful logs  --rpc-retry-count int           Retry count for rpc request (default 5)  --rpc-retry-interval duration   Retry interval for rpc request (default 5s)  --rpc-timeout duration          Timeout for single rpc request (default 30s)  --web3-log-enabled              Enable Web3 RPC logging
```

## **Core Operations**

### **File Upload**

Upload files to the 0G Storage network using the indexer service or explicit nodes:

```bash
0g-storage-client upload \  --url <blockchain_rpc_endpoint> \  --key <private_key> \  --indexer <storage_indexer_endpoint> \  --file <file_path>
```

**Parameters:** `--url` is the chain RPC endpoint, `--key` is your private key, and `--file` is the path to the file you want to upload. Use exactly one of `--indexer` or `--node`.

Common flags include `--tags`, `--submitter`, `--expected-replica`, `--skip-tx`, `--finality-required`, `--task-size`, `--fast-mode`, `--fragment-size`, `--routines`, `--fee`, `--nonce`, `--max-gas-price`, `--n-retries`, `--step`, `--method`, `--full-trusted`, `--timeout`, `--flow-address`, and `--market-address`.

Fee notes (turbo):

- `unitPrice = 11 / pricePerToken / 1024 * 256`. If `pricePerToken = 1`, then `unitPrice = 2.75` (tokens), or `2.75e18` 0G.
- `pricePerSector(256B)/month = lifetimeMonth * unitPrice * 1e18 / 1024 / 1024 / 1024` (no `/12` since $11 is per TB per month).

### **File Download**

Download files from the network using the indexer or explicit nodes:

```bash
0g-storage-client download \  --indexer <storage_indexer_endpoint> \  --root <file_root_hash> \  --file <output_file_path>
```

**Parameters:** `--file` is the output path. Use exactly one of `--indexer` or `--node`. Use exactly one of `--root` or `--roots`.

### **Download with Verification**

Enable proof verification for enhanced security:

```bash
0g-storage-client download \  --indexer <storage_indexer_endpoint> \  --root <file_root_hash> \  --file <output_file_path> \  --proof
```

The `--proof` flag requests cryptographic proof of data integrity from the storage node.

### **Directory Upload**

Upload an entire directory using explicit storage nodes:

```bash
0g-storage-client upload-dir \  --url <blockchain_rpc_endpoint> \  --key <private_key> \  --node <storage_node_endpoint> \  --file <directory_path>
```

### **Directory Download**

Download a directory by root:

```bash
0g-storage-client download-dir \  --indexer <storage_indexer_endpoint> \  --root <directory_root_hash> \  --file <output_directory>
```

### **Directory Diff**

Compare a local directory with the on-chain version:

```bash
0g-storage-client diff-dir \  --indexer <storage_indexer_endpoint> \  --root <directory_root_hash> \  --file <local_directory>
```

## **Practical Examples**

### **Upload Example**

```bash
# Upload a document to 0G Storage0g-storage-client upload \  --url <blockchain_rpc_endpoint> \  --key YOUR_PRIVATE_KEY \  --indexer <storage_indexer_endpoint> \  --file ./documents/report.pdf# Output:# ✓ File uploaded successfully# Root hash: 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470# Transaction: 0x742d35cc6634c0532925a3b844bc454e8e4a0e3f...
```

### **Download Example**

```bash
# Download file using root hash0g-storage-client download \  --indexer <storage_indexer_endpoint> \  --root 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 \  --file ./downloads/report.pdf# With verification0g-storage-client download \  --indexer <storage_indexer_endpoint> \  --root 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 \  --file ./downloads/report.pdf \  --proof
```

## **Key-Value Operations**

### **Write to KV Store (Batch Operations)**

Write multiple key-value pairs in a single operation:

```bash
0g-storage-client kv-write \  --url <blockchain_rpc_endpoint> \  --key <private_key> \  --indexer <storage_indexer_endpoint> \  --stream-id <stream_id> \  --stream-keys <comma_separated_keys> \  --stream-values <comma_separated_values>
```

**Important:** `--stream-keys` and `--stream-values` are comma-separated string lists and their length must be equal.

You can use `--indexer` for node selection or pass storage nodes directly with `--node`. If `--indexer` is omitted, `--node` is required.

**Example:**

```bash
0g-storage-client kv-write \  --url <blockchain_rpc_endpoint> \  --key YOUR_PRIVATE_KEY \  --indexer <storage_indexer_endpoint> \  --stream-id 1 \  --stream-keys "key1,key2,key3" \  --stream-values "value1,value2,value3"
```

### **Read from KV Store**

```bash
0g-storage-client kv-read \  --node <kv_node_rpc_endpoint> \  --stream-id <stream_id> \  --stream-keys <comma_separated_keys>
```

**KV Read Endpoint**

Note that for KV read operations, you need to specify `--node` as the URL of a KV node, not the indexer endpoint.

## **RESTful API Gateway**

The indexer service provides a RESTful API gateway for easy HTTP-based file access:

### **File Downloads via HTTP**

**By Transaction Sequence Number:**

```
GET /file?txSeq=7
```

**By File Merkle Root:**

```
GET /file?root=0x0376e0d95e483b62d5100968ed17fe1b1d84f0bc5d9bda8000cdfd3f39a59927
```

**With Custom Filename:**

```
GET /file?txSeq=7&name=foo.log
```

### **Folder Support**

Download specific files from within structured folders:

**By Transaction Sequence:**

```
GET /file/{txSeq}/path/to/file
```

**By Merkle Root:**

```
GET /file/{merkleRoot}/path/to/file
```

## **Advanced Features**

### **Custom Gas Settings**

Control transaction costs with custom gas parameters:

```bash
0g-storage-client upload \  --gas-limit 3000000 \  --gas-price 10000000000 \  # ... other parameters
```

### **RPC Configuration**

Configure RPC retry behavior and timeouts:

```bash
0g-storage-client upload \  --rpc-retry-count 10 \  --rpc-retry-interval 3s \  --rpc-timeout 60s \  # ... other parameters
```

### **Logging Configuration**

Adjust logging for debugging:

```bash
# Verbose logging with Web3 details0g-storage-client upload \  --log-level debug \  --web3-log-enabled \  # ... other parameters# Minimal logging0g-storage-client download \  --log-level error \  --log-color-disabled \  # ... other parameters
```

### **Shell Completion**

Enable tab completion for easier command entry:

```bash
# Bash0g-storage-client completion bash > /etc/bash_completion.d/0g-storage-client# Zsh0g-storage-client completion zsh > "${fpath[1]}/_0g-storage-client"# Fish0g-storage-client completion fish > ~/.config/fish/completions/0g-storage-client.fish
```

## **Indexer Service**

The indexer service provides two types of storage node discovery:

### **Trusted Nodes**

Well-maintained nodes that provide stable and reliable service.

### **Discovered Nodes**

Nodes discovered automatically through the P2P network.

The indexer intelligently routes data to appropriate storage nodes based on their shard configurations, eliminating the need to manually specify storage nodes or contract addresses.

## **Important Considerations**

### **Network Configuration**

**Required Information**

**RPC endpoints** and **indexer endpoints** are published in the network overview docs. Use the current values for your network. Keep private keys secure and never share them.

### **File Management**

- **Root Hash Storage**: Save file root hashes after upload - they're required for downloads
- **Transaction Monitoring**: Track upload transactions on the blockchain explorer
- **Indexer Benefits**: The indexer automatically selects optimal storage nodes for better reliability

## **Running Services**

### **Indexer Service**

The indexer helps users find suitable storage nodes:

```bash
0g-storage-client indexer \  --endpoint :12345 \  --node <storage_node_endpoint>
```

Or start with a trusted node list:

```bash
0g-storage-client indexer \  --endpoint :12345 \  --trusted <node1,node2>
```

### **Gateway Service**

Run a gateway to provide HTTP access to storage:

```bash
0g-storage-client gateway \  --nodes <storage_node_endpoint>
```

Optionally specify a local file repo:

```bash
0g-storage-client gateway \  --nodes <storage_node_endpoint> \  --repo <local_path>
```

## **Automation Examples**

### **Backup Script**

Create automated backup scripts:

```bash
#!/bin/bash# backup.sh - Daily backup to 0G StorageDATE=$(date +%Y%m%d)BACKUP_FILE="/backups/daily-${DATE}.tar.gz"# Create backuptar -czf $BACKUP_FILE /important/data# Upload to 0GROOT_HASH=$(0g-storage-client upload \  --url $RPC_URL \  --key $PRIVATE_KEY \  --indexer $INDEXER_URL \  --file $BACKUP_FILE | grep "root =" | awk '{print $NF}')# Save root hashecho "${DATE}: ${ROOT_HASH}" >> /backups/manifest.txt
```

### **Monitoring Integration**

Monitor uploads with logging:

```bash
# upload-with-monitoring.sh0g-storage-client upload \  --file $1 \  --log-level info \  # ... other parameters \  2>&1 | tee -a /var/log/0g-uploads.log
```

## **Troubleshooting**

- **Upload fails with "insufficient funds" error**
- **"Indexer not found" error during upload/download**
- **RPC timeout errors**

## **Best Practices**

1. **Security First**: Store private keys in environment variables, not command line
2. **Backup Root Hashes**: Always save file root hashes after uploads
3. **Use Verification**: Enable `-proof` for important downloads
4. **Monitor Transactions**: Track uploads on the blockchain explorer
5. **Test with Gen**: Use the `gen` command to create test files for development
6. **HTTP Access**: Leverage the RESTful API for web applications and integrations
7. **Batch KV Operations**: Use comma-separated lists for efficient key-value operations