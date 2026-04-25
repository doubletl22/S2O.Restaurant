param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet("auth", "staff", "auth-staff")]
  [string]$Suite,

  [Parameter(Position = 1)]
  [switch]$Headless
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
  Write-Host "[identity-suite] $Message"
}

function Test-AppReady([string]$Url) {
  try {
    Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Get -TimeoutSec 5 | Out-Null
    return $true
  } catch {
    return $false
  }
}

$suiteConfig = @{
  "auth" = @{
    Scope = "environment"
    Tests = @("./test/identity/auth/*_test.ts")
  }
  "staff" = @{
    Scope = "branch"
    Tests = @("./test/identity/staff/staff_test.ts")
  }
  "auth-staff" = @{
    Scope = "branch"
    Tests = @(
      "./test/identity/auth/*_test.ts",
      "./test/identity/staff/staff_test.ts"
    )
  }
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Set-Location $repoRoot

if (-not (Test-AppReady -Url "http://localhost:3000/login")) {
  throw "Frontend chua chay tai http://localhost:3000. Hay mo `npm run dev` truoc."
}

$targetSuite = $suiteConfig[$Suite]
$scope = [string]$targetSuite.Scope
$tests = @($targetSuite.Tests)

Log "Suite: $Suite"
Log "Tests: $($tests -join ', ')"
Log "Prerequisite: $scope"

& npx ts-node --project tsconfig.codecept.json .\test\identity\scripts\setup_prerequisites.ts "--scope=$scope"
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if ($Headless) {
  $env:HEADLESS = "true"
} else {
  Remove-Item Env:HEADLESS -ErrorAction SilentlyContinue
}

& node .\test\identity\scripts\run_identity_codecept_subset.cjs @tests
exit $LASTEXITCODE
