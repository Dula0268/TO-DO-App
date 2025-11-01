# Probe POST /api/auth/login and print status/body
$bodyObj = @{ email = 'doesnotexist@example.com'; password = 'badpass' }
$body = $bodyObj | ConvertTo-Json

Write-Output "Request URL: http://localhost:8080/api/auth/login"
Write-Output "Request Method: POST"
Write-Output "Request Headers: Content-Type: application/json, Accept: application/json"
Write-Output "Request Body: $body"

try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/login' -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -TimeoutSec 10
  Write-Output "STATUS: $($resp.StatusCode)"
  Write-Output "BODY: $($resp.Content)"
} catch {
  $err = $_.Exception
  $resp = $err.Response
  if ($resp -ne $null) {
    try {
      $status = $resp.StatusCode.Value__
    } catch { $status = 'UNKNOWN' }
    $body = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    Write-Output "ERROR_STATUS: $status"
    Write-Output "ERROR_BODY: $body"
  } else {
    Write-Output "REQUEST_ERROR: $($err.Message)"
  }
}
