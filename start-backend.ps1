# Start Sao Do Assistant Backend
Write-Host "Starting Sao Do Assistant backend..." -ForegroundColor Cyan
Write-Host "API: http://localhost:9191" -ForegroundColor Yellow
Write-Host "Health: http://localhost:9191/api/health" -ForegroundColor Yellow
Write-Host ""

if ($env:NEMOCLAW_API_URL) {
  Write-Host "Assistant runtime: NemoClaw HTTP bridge ($env:NEMOCLAW_API_URL)" -ForegroundColor Green
} elseif ($env:NEMOCLAW_SANDBOX_NAME) {
  Write-Host "Assistant runtime: OpenShell sandbox ($env:NEMOCLAW_SANDBOX_NAME)" -ForegroundColor Green
} elseif ($env:SAODO_AGENT_MODE -eq "openclaw-cli") {
  Write-Host "Assistant runtime: local OpenClaw CLI" -ForegroundColor Green
} elseif ($env:OPENAI_API_KEY) {
  Write-Host "Assistant runtime: OpenAI fallback" -ForegroundColor Green
} else {
  Write-Host "Assistant runtime: local deterministic fallback" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Demo account:" -ForegroundColor Green
Write-Host "  Student ID: SV2024001" -ForegroundColor White
Write-Host "  Password:   123456" -ForegroundColor White
Write-Host ""
Write-Host "Examples:" -ForegroundColor Cyan
Write-Host '  $env:NEMOCLAW_API_URL="http://localhost:8718"' -ForegroundColor Gray
Write-Host '  $env:NEMOCLAW_SANDBOX_NAME="my-assistant"' -ForegroundColor Gray
Write-Host '  $env:SAODO_AGENT_MODE="openclaw-cli"' -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host ""

Set-Location "$PSScriptRoot\packages\backend"
node src/server.mjs
