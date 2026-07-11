$ErrorActionPreference = "SilentlyContinue"
Set-Location "C:\Users\USER\Desktop\Maymanah"
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" | Out-Null }

while ($true) {
    $devUp = $false
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { $devUp = $true }
    } catch {}

    if (-not $devUp) {
        Write-Output "$(Get-Date -Format o) dev server down, restarting" | Out-File -Append "logs\watchdog.log"
        $env:NODE_OPTIONS = "--no-deprecation"
        Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/c", "node_modules\.bin\next.cmd dev >> logs\dev.log 2>&1" `
            -WorkingDirectory "C:\Users\USER\Desktop\Maymanah" `
            -WindowStyle Hidden
        Start-Sleep -Seconds 8
    }

    $ngrokUp = $false
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:4040/api/tunnels" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { $ngrokUp = $true }
    } catch {}

    if (-not $ngrokUp) {
        Write-Output "$(Get-Date -Format o) ngrok down, restarting" | Out-File -Append "logs\watchdog.log"
        Start-Process -FilePath "ngrok" `
            -ArgumentList "http", "3000", "--log=stdout" `
            -WorkingDirectory "C:\Users\USER\Desktop\Maymanah" `
            -RedirectStandardOutput "C:\Users\USER\Desktop\Maymanah\logs\ngrok.log" `
            -WindowStyle Hidden
    }

    Start-Sleep -Seconds 60
}
