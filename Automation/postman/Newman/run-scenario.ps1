param(
  [switch]$ContinueOnError,
  [switch]$WriteBackEnvironment
)

$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmCmd) {
  throw "npm not found. Please install Node.js (includes npm)."
}

$npmArgs = @("run", "scenario", "--silent", "--")
if ($ContinueOnError) {
  $npmArgs += "--continue-on-error"
}
if ($WriteBackEnvironment) {
  $npmArgs += "--write-back-environment"
}

& npm @npmArgs
exit $LASTEXITCODE
