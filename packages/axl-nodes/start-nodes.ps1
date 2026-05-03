$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Join-Path $root "node.exe"

if (-not (Test-Path $node)) {
  throw "node.exe not found. Run .\setup-axl.ps1 first."
}

foreach ($key in @("private.pem", "private-2.pem")) {
  if (-not (Test-Path (Join-Path $root $key))) {
    throw "$key not found. Run .\setup-axl.ps1 first."
  }
}

$nodeA = Start-Process -FilePath $node -ArgumentList @("-config", "node-config.json") -WorkingDirectory $root -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2
$nodeB = Start-Process -FilePath $node -ArgumentList @("-config", "node-config-2.json") -WorkingDirectory $root -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2

Write-Host "AXL nodes started."
Write-Host "Node A PID: $($nodeA.Id), API: http://127.0.0.1:9002"
Write-Host "Node B PID: $($nodeB.Id), API: http://127.0.0.1:9012"
Write-Host "Verify: .\verify-axl.ps1"
