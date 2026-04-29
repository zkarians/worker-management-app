@echo off
setlocal enabledelayedexpansion
color 0B
title Cloudtype Database Backup

echo ========================================
echo    Cloudtype Database Backup Tool
echo ========================================
echo.

REM Load config file
if exist backup-config.bat (
    call backup-config.bat
    echo [OK] Config loaded
) else (
    echo [!] backup-config.bat not found. Using defaults
    set APP_URL=https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app
    set BACKUP_SECRET=my-secure-backup-key-2024
    set BACKUP_ROOT=backup
)
echo.

REM Create backup folder if not exists
if not exist "%BACKUP_ROOT%" (
    mkdir "%BACKUP_ROOT%"
    echo [OK] Backup folder created: %BACKUP_ROOT%
) else (
    echo [OK] Backup folder exists: %BACKUP_ROOT%
)
echo.

echo [Progress] Downloading backup from Cloudtype...
echo            URL: %APP_URL%
echo.

REM Create PowerShell script
set "PS_SCRIPT=%TEMP%\cloudtype-backup-script.ps1"
(
echo $timestamp = Get-Date -Format 'yyyy-MM-dd-HH-mm-ss'
echo $outputFile = '%BACKUP_ROOT%\backup-' + $timestamp + '.json'
echo $headers = @{ 'Authorization' = 'Bearer %BACKUP_SECRET%'; 'Accept' = 'application/json' }
echo try {
echo     $response = Invoke-WebRequest -Uri '%APP_URL%/api/admin/backup' -Headers $headers -Method GET -TimeoutSec 120
echo     $response.Content ^| Out-File -FilePath $outputFile -Encoding UTF8
echo     Write-Host ''
echo     Write-Host '[Done] Backup successful!' -ForegroundColor Green
echo     Write-Host ''
echo     Write-Host '[File] Saved to:' -ForegroundColor Cyan
echo     Write-Host "       $outputFile" -ForegroundColor White
echo     $backup = $response.Content ^| ConvertFrom-Json
echo     Write-Host ''
echo     Write-Host '[Stats] Backup summary:' -ForegroundColor Cyan
echo     Write-Host "        Users: $($backup.summary.users)" -ForegroundColor White
echo     Write-Host "        Companies: $($backup.summary.companies)" -ForegroundColor White
echo     Write-Host "        Teams: $($backup.summary.teams)" -ForegroundColor White
echo     Write-Host "        Attendance: $($backup.summary.attendances)" -ForegroundColor White
echo     Write-Host "        Rosters: $($backup.summary.rosters)" -ForegroundColor White
echo     Write-Host "        Products: $($backup.summary.products)" -ForegroundColor White
echo     $fileSize = [math]::Round((Get-Item $outputFile^).Length / 1KB, 2^)
echo     Write-Host "        Size: $fileSize KB" -ForegroundColor Yellow
echo     Write-Host ''
echo     exit 0
echo } catch {
echo     Write-Host ''
echo     Write-Host '[Error] Backup failed!' -ForegroundColor Red
echo     Write-Host "        $($_.Exception.Message)" -ForegroundColor Red
echo     Write-Host ''
echo     Write-Host '[Check]' -ForegroundColor Yellow
echo     Write-Host '  1. Cloudtype app is running' -ForegroundColor Gray
echo     Write-Host '  2. BACKUP_SECRET is correct' -ForegroundColor Gray
echo     Write-Host '  3. Internet connection is active' -ForegroundColor Gray
echo     Write-Host ''
echo     exit 1
echo }
) > "%PS_SCRIPT%"

REM Run PowerShell
%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File "%PS_SCRIPT%"

set RESULT=%ERRORLEVEL%

REM Delete temp script
del "%PS_SCRIPT%" >nul 2>&1

if %RESULT% EQU 0 (
    echo.
    echo ========================================
    echo       Backup completed successfully!
    echo ========================================
    echo.
    echo [List] All backups in folder:
    dir /b "%BACKUP_ROOT%\backup-*.json" 2>nul | sort /r
   if errorlevel 1 echo        (No backup files)
) else (
    echo.
    echo ========================================
    echo       Backup failed
    echo ========================================
)

echo.
echo Press any key to exit...
pause >nul
