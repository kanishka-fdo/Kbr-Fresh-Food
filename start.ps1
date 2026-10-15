# KBR Fresh Foods - Start All Servers
# Run this from the project root: .\start.ps1

Write-Host "Starting KBR Fresh Foods..." -ForegroundColor Green

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend (nodemon - auto-restarts on file changes)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev" -WindowStyle Normal

# Start Frontend (Vite HMR - auto-reloads on file changes)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Backend  running at http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend running at http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both servers will AUTO-RELOAD whenever you save a file." -ForegroundColor Yellow
