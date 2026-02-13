Write-Host "Starting Backend and Frontend..."

$backend = Start-Process cmd `
  -ArgumentList "/k cd backend && python manage.py runserver" `
  -WindowStyle Minimized `
  -PassThru

$frontend = Start-Process cmd `
  -ArgumentList "/k cd frontend && npm run dev" `
  -WindowStyle Minimized `
  -PassThru

Write-Host ""
Write-Host "==============================="
Write-Host "Services are running"
Write-Host "Type Q or E then press Enter to stop"
Write-Host "==============================="
Write-Host ""

while ($true) {
    $userInput = Read-Host
    if ($userInput -match '^[QqEe]$') {
        $backend.CloseMainWindow()
        $frontend.CloseMainWindow()
        Start-Sleep -Seconds 2
        if (!$backend.HasExited) { $backend | Stop-Process -Force }
        if (!$frontend.HasExited) { $frontend | Stop-Process -Force }
        break
    }
}

Write-Host ""
Write-Host "Stopping Backend and Frontend..."
Write-Host "Done."
