# setup-db.ps1
# Load an .env file into the current session and run db/schema.sql with that password

param(
  [string]$EnvPath = ""
)

$ErrorActionPreference = 'Stop'

Write-Host "Loading .env..."

# If a path wasn't provided, try common locations relative to this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$candidates = @()
if ([string]::IsNullOrWhiteSpace($EnvPath)) {
  $candidates = @(
    (Join-Path $scriptDir "..\.env"),
    (Join-Path $scriptDir "..\backend\.env"),
    (Join-Path $scriptDir ".\.env"),
    (Join-Path $scriptDir ".\backend\.env")
  )
} else {
  $candidates = @($EnvPath)
}

$found = $null
foreach ($p in $candidates) {
  if (Test-Path $p) { $found = (Resolve-Path $p).Path; break }
}

if (-not $found) {
  Write-Host "ERROR: .env file not found. Checked:" -ForegroundColor Red
  $candidates | ForEach-Object { Write-Host " - $_" }
  Write-Host "Tip: run with -EnvPath '..\backend\.env' if your .env is in backend\" -ForegroundColor Yellow
  exit 1
}

Write-Host "Using .env at: $found"

# Simple .env parser
Get-Content $found | ForEach-Object {
  if ($_ -match '^\s*#') { return }          # skip comments
  if ($_ -match '^\s*$') { return }          # skip empty lines
  if ($_ -match '^\s*([^=]+?)\s*=(.*)$') {
    $name  = $matches[1].Trim()
    $value = $matches[2]

    # strip surrounding quotes
    if ($value -match '^\s*"(.*)"\s*$') { $value = $matches[1] }
    elseif ($value -match "^\s*'(.*)'\s*$") { $value = $matches[1] }
    else { $value = $value.Trim() }

    Set-Item -Path ("Env:{0}" -f $name) -Value $value
  }
}

if (-not $env:DB_PASSWORD) {
  Write-Host "ERROR: DB_PASSWORD not found in .env ($found)" -ForegroundColor Red
  exit 1
}

Write-Host "Loaded .env. Running schema with DB_PASSWORD from .env..."

# Run schema.sql located beside this script
$schemaPath = Join-Path $scriptDir "schema.sql"
if (-not (Test-Path $schemaPath)) {
  Write-Host "ERROR: schema.sql not found at $schemaPath" -ForegroundColor Red
  exit 1
}

# Quote the password safely for psql -v
psql -U postgres -v DB_PASSWORD="$env:DB_PASSWORD" -f $schemaPath

Write-Host "Database setup complete!"
