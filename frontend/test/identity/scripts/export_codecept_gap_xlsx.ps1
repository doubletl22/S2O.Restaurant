param(
  [string]$SourcePath = "C:\Users\Admin\Downloads\S2ORestaurant_Integration_Test.xlsx",
  [string]$DestinationPath = "C:\Kiemthu\S2O.Restaurant\frontend\output\S2ORestaurant_Integration_Test_Codecept_Gap.xlsx"
)

$ErrorActionPreference = "Stop"

function Release-ComObject {
  param([object]$ComObject)

  if ($null -ne $ComObject) {
    try {
      [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ComObject)
    } catch {
    }
  }
}

$sheetConfigs = @(
  @{
    Name = "BranchManagement"
    DeleteMiddleRange = "11:23"
    DeleteTailStart = 27
    CaseCount = 2
  },
  @{
    Name = "Restaurants Management"
    DeleteMiddleRange = "11:26"
    DeleteTailStart = 30
    CaseCount = 2
  },
  @{
    Name = "Staff Management"
    DeleteMiddleRange = "11:32"
    DeleteTailStart = 38
    CaseCount = 4
  }
)

$sourceFullPath = [System.IO.Path]::GetFullPath($SourcePath)
$destinationFullPath = [System.IO.Path]::GetFullPath($DestinationPath)
$destinationDir = Split-Path -Path $destinationFullPath -Parent

if (-not (Test-Path -LiteralPath $sourceFullPath)) {
  throw "Source workbook not found: $sourceFullPath"
}

if (-not (Test-Path -LiteralPath $destinationDir)) {
  New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
}

$excel = $null
$sourceWorkbook = $null
$gapWorkbook = $null
$tempSheet = $null
$sourceSheet = $null
$copiedSheet = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  $sourceWorkbook = $excel.Workbooks.Open($sourceFullPath, $null, $true)
  $gapWorkbook = $excel.Workbooks.Add()
  $tempSheet = $gapWorkbook.Worksheets.Item(1)
  $tempSheet.Name = "TEMP_DELETE_ME"

  foreach ($config in $sheetConfigs) {
    $sourceSheet = $sourceWorkbook.Worksheets.Item($config.Name)
    $sourceSheet.Copy([System.Type]::Missing, $gapWorkbook.Worksheets.Item($gapWorkbook.Worksheets.Count))

    $copiedSheet = $gapWorkbook.Worksheets.Item($gapWorkbook.Worksheets.Count)
    $usedRange = $copiedSheet.UsedRange
    $lastUsedRow = [int]$usedRange.Row + [int]$usedRange.Rows.Count - 1

    if ($lastUsedRow -ge $config.DeleteTailStart) {
      $copiedSheet.Rows("$($config.DeleteTailStart):$lastUsedRow").Delete() | Out-Null
    }

    $copiedSheet.Rows($config.DeleteMiddleRange).Delete() | Out-Null
    $copiedSheet.Range("B4").Value2 = $config.CaseCount
  }

  $gapWorkbook.Worksheets.Item("TEMP_DELETE_ME").Delete() | Out-Null
  $gapWorkbook.SaveAs($destinationFullPath, 51)

  Write-Output "Created: $destinationFullPath"
} finally {
  if ($gapWorkbook) {
    $gapWorkbook.Close($true)
  }

  if ($sourceWorkbook) {
    $sourceWorkbook.Close($false)
  }

  if ($excel) {
    $excel.Quit()
  }

  Release-ComObject $tempSheet
  Release-ComObject $copiedSheet
  Release-ComObject $sourceSheet
  Release-ComObject $gapWorkbook
  Release-ComObject $sourceWorkbook
  Release-ComObject $excel

  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
