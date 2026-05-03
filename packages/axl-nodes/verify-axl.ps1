$ErrorActionPreference = "Stop"

function Get-PeerId($Port) {
  $topology = Invoke-RestMethod "http://127.0.0.1:$Port/topology"
  if ($topology.our_public_key) { return $topology.our_public_key }
  if ($topology.publicKey) { return $topology.publicKey }
  throw "Could not read peer id from node on port $Port"
}

$nodeA = Get-PeerId 9002
$nodeB = Get-PeerId 9012

$message = @{
  type = "HEARTBEAT"
  from = $nodeB
  to = $nodeA
  payload = @{ text = "hello from node B"; createdAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  nonce = [guid]::NewGuid().ToString()
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Post "http://127.0.0.1:9012/send" -Headers @{ "X-Destination-Peer-Id" = $nodeA } -ContentType "application/json" -Body $message | Out-Null
Start-Sleep -Seconds 1
$response = Invoke-WebRequest "http://127.0.0.1:9002/recv" -UseBasicParsing

Write-Host "Node A: $nodeA"
Write-Host "Node B: $nodeB"
Write-Host "Received from: $($response.Headers['X-From-Peer-Id'])"
Write-Host "Body: $($response.Content)"
