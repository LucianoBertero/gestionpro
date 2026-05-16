# GestiónPro — Newman API Test Runner
# Requiere: npm install -g newman
# Uso: .\tests\newman\run-tests.ps1

$collection = "tests/newman/gestionpro-api-collection.json"
$envFile = "tests/newman/gestionpro-env.json"

Write-Host "=== GestiónPro API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Create environment file if it doesn't exist
if (-not (Test-Path $envFile)) {
    @"
{
  "name": "GestiónPro Local",
  "values": [
    { "key": "baseUrl", "value": "http://localhost:3001/v1", "enabled": true }
  ]
}
"@ | Set-Content $envFile
}

newman run $collection `
  --env-var "baseUrl=http://localhost:3001/v1" `
  --reporters cli `
  --color on `
  --delay-request 200

Write-Host ""
Write-Host "=== Tests Completados ===" -ForegroundColor Cyan
