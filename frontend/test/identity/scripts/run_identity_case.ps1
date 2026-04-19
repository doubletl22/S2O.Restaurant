param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$CaseId,

  [Parameter(Position = 1)]
  [switch]$Headless
)

$ErrorActionPreference = "Stop"

function Log([string]$Message) {
  Write-Host "[identity-case] $Message"
}

function Test-AppReady([string]$Url) {
  try {
    Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Get -TimeoutSec 5 | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Resolve-CaseFile([string]$NormalizedCaseId) {
  $searchToken = "[$NormalizedCaseId]"
  $matches = @()

  if (Get-Command rg -ErrorAction SilentlyContinue) {
    $matches = @(& rg -l --fixed-strings $searchToken ".\test\identity" 2>$null | Where-Object { $_ })
  } else {
    $matches = @(
      Get-ChildItem -Path ".\test\identity" -Recurse -File |
        Select-String -SimpleMatch $searchToken |
        Select-Object -ExpandProperty Path -Unique
    )
  }

  if (-not $matches) {
    throw "Khong tim thay testcase `"$NormalizedCaseId`" trong test\identity."
  }

  $paths = @($matches | Where-Object { $_ })
  if ($paths.Count -gt 1) {
    throw "Tim thay nhieu file cho testcase `"$NormalizedCaseId`": $($paths -join ', ')"
  }

  return $paths[0]
}

function Resolve-PrerequisiteScope([string]$NormalizedCaseId, [string]$CaseFile) {
  switch -Regex ($CaseFile) {
    "\\test\\identity\\user\\" { return "environment" }
    "\\test\\identity\\tenants\\" { return "environment" }
    "\\test\\identity\\staff\\" { return "branch" }
    "\\test\\identity\\navigation\\" { return "branch" }
    "\\test\\identity\\auth\\" {
      if ($NormalizedCaseId -eq "AUTH-05") {
        return "owner"
      }

      return "environment"
    }
  }

  return "environment"
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Set-Location $repoRoot

$normalizedCaseId = $CaseId.Trim().ToUpper()
$caseFile = Resolve-CaseFile -NormalizedCaseId $normalizedCaseId
$scope = Resolve-PrerequisiteScope -NormalizedCaseId $normalizedCaseId -CaseFile $caseFile
$grepPattern = if ($normalizedCaseId.StartsWith("BVA-")) {
  $normalizedCaseId
} else {
  "(?<!BVA-)$normalizedCaseId"
}
$extraCaseIds = @(
  "BVA-BRANCH-06",
  "BVA-BRANCH-07",
  "BVA-REST-06",
  "BVA-REST-07",
  "BVA-STAFF-10",
  "BVA-STAFF-11",
  "BVA-STAFF-12",
  "BVA-STAFF-13"
)

if (-not (Test-AppReady -Url "http://localhost:3000/login")) {
  throw "Frontend chua chay tai http://localhost:3000. Hay mo `npm run dev` truoc."
}

Log "Case: $normalizedCaseId"
Log "File: $caseFile"
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

if ($extraCaseIds -contains $normalizedCaseId) {
  $env:IDENTITY_INCLUDE_EXTRA_CASES = "true"
} else {
  Remove-Item Env:IDENTITY_INCLUDE_EXTRA_CASES -ErrorAction SilentlyContinue
}

& npx ts-node --project tsconfig.codecept.json .\node_modules\codeceptjs\bin\codecept.js run --grep $grepPattern --steps
exit $LASTEXITCODE
