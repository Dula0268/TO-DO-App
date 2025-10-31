<#
Start-backend.ps1

Loads environment variables from a `.env` file located beside this script
and starts the Spring Boot backend via the Maven wrapper.

Usage:
  .\start-backend.ps1

Notes:
- This script runs in PowerShell and sets variables in the process environment
  so Spring Boot can read them via `${ENV_VAR}` placeholders.
- It ignores commented lines and blank lines in `.env`.
- Do NOT commit real secrets to source control. Keep your `.env` in `.gitignore`.
#>

# move to script directory so relative paths work
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Loading .env from $scriptDir"

if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -eq "" -or $line.StartsWith("#")) { return }
        # parse KEY=VALUE (first '=')
        $idx = $line.IndexOf('=')
        if ($idx -lt 0) { return }
        $name = $line.Substring(0,$idx).Trim()
        $value = $line.Substring($idx+1).Trim()
        # strip surrounding quotes
        if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1,$value.Length-2) }
        if ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Substring(1,$value.Length-2) }
        Write-Host "Setting env $name"
        Set-Item -Path "Env:$name" -Value $value
    }
} else {
    Write-Host ".env not found in $scriptDir - starting without loading env file."
}

Write-Host "Starting backend using Maven wrapper..."
$mvnwCmd = Join-Path $scriptDir 'mvnw.cmd'
if (Test-Path $mvnwCmd) {
    & $mvnwCmd spring-boot:run
} else {
    $mvnw = Join-Path $scriptDir 'mvnw'
    if (Test-Path $mvnw) {
        & $mvnw spring-boot:run
    } else {
        Write-Error "Maven wrapper not found (mvnw.cmd or mvnw)."
        exit 1
    }
}
