param(
  [string]$AxlRepoUrl = "https://github.com/gensyn-ai/axl.git",
  [string]$AxlDir = ".\axl"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $root $AxlDir

function Assert-Command($Name, $InstallHint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is not installed or not on PATH. $InstallHint"
  }
}

Assert-Command "git" "Install Git for Windows."
Assert-Command "go" "Install Go 1.25.x. AXL is not compatible with Go 1.26."
Assert-Command "openssl" "Install OpenSSL 3.x and add it to PATH."

$goVersion = (& go version)
if ($goVersion -match "go1\.26") {
  throw "Detected $goVersion. Install/use Go 1.25.x for AXL because gVisor currently breaks on Go 1.26."
}

if (-not (Test-Path $target)) {
  git clone $AxlRepoUrl $target
}

Push-Location $target
try {
  go build -o node.exe .\cmd\node\
} finally {
  Pop-Location
}

$nodePath = Join-Path $target "node.exe"
Copy-Item $nodePath (Join-Path $root "node.exe") -Force

if (-not (Test-Path (Join-Path $root "private.pem"))) {
  openssl genpkey -algorithm ed25519 -out (Join-Path $root "private.pem")
}
if (-not (Test-Path (Join-Path $root "private-2.pem"))) {
  openssl genpkey -algorithm ed25519 -out (Join-Path $root "private-2.pem")
}

Write-Host "AXL setup complete."
Write-Host "Binary: $root\node.exe"
Write-Host "Keys: private.pem, private-2.pem"
Write-Host "Next: .\start-nodes.ps1"
