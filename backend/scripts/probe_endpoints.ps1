# Probe health and /api/todos endpoints and print status/body
try {
  $h = Invoke-RestMethod -Uri 'http://localhost:8080/actuator/health' -UseBasicParsing -TimeoutSec 10
  Write-Output "HEALTH_OK: $($h.status)"
} catch {
  Write-Output "HEALTH_ERROR: $($_.Exception.Message)"
}

try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/todos' -UseBasicParsing -Method GET -Headers @{ Accept='application/json' } -TimeoutSec 10
  Write-Output "TODOS_STATUS: $($r.StatusCode)"
  Write-Output "TODOS_BODY: $($r.Content)"
} catch {
  $err = $_.Exception
  $resp = $err.Response
  if ($resp -ne $null) {
    $status = $resp.StatusCode.Value__
    $body = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    Write-Output "TODOS_ERROR_STATUS: $status"
    Write-Output "TODOS_ERROR_BODY: $body"
  } else {
    Write-Output "TODOS_ERROR: $($err.Message)"
  }
}
