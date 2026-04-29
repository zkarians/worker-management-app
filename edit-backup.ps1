# Backup File Editor
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Backup File Editor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check backup folder
if (-not (Test-Path "backup")) {
    Write-Host "[ERROR] No backup folder found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run cloudtype-backup.bat first."
    Write-Host ""
    pause
    exit 1
}

# Get all JSON files in backup folder and subfolders
$backupFiles = Get-ChildItem -Path "backup" -Recurse -Include "*.json" | Sort-Object LastWriteTime -Descending

if ($backupFiles.Count -eq 0) {
    Write-Host "[ERROR] No backup files found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run cloudtype-backup.bat first."
    Write-Host ""
    pause
    exit 1
}

# Display backup files
Write-Host "Available backup files:" -ForegroundColor Yellow
Write-Host ""

$index = 1
$fileMap = @{}

foreach ($file in $backupFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
    $size = [math]::Round($file.Length / 1KB, 2)
    $date = $file.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
    
    Write-Host "  $index. $relativePath" -ForegroundColor White
    Write-Host "     Size: $size KB" -ForegroundColor Gray
    Write-Host "     Date: $date" -ForegroundColor Gray
    Write-Host ""
    
    $fileMap[$index] = $relativePath
    $index++
}

Write-Host "========================================" -ForegroundColor Cyan
$choice = Read-Host "Select backup file (1-$($backupFiles.Count))"

# Validate choice
if (-not $fileMap.ContainsKey([int]$choice)) {
    Write-Host ""
    Write-Host "[ERROR] Invalid selection" -ForegroundColor Red
    pause
    exit 1
}

$selectedFile = $fileMap[[int]$choice]
Write-Host ""
Write-Host "Selected: $selectedFile" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Restore this backup? (Y/N)"

if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host ""
    Write-Host "Cancelled." -ForegroundColor Yellow
    pause
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Restoring backup..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Restore backup
$absolutePath = Join-Path (Get-Location) $selectedFile
npm run db:import "`"$absolutePath`""

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Restore failed" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[OK] Restore completed!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Prisma Studio..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Browser will open automatically" -ForegroundColor Yellow
Write-Host "       URL: http://localhost:5555" -ForegroundColor Yellow
Write-Host ""
Write-Host "[DATA] Editing: $selectedFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "[STOP] Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start Prisma Studio
npx prisma studio

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Prisma Studio stopped" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pause
