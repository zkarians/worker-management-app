# Cloudtype DB 동기화 자동화 스크립트
# 사용법: .\sync-to-cloudtype.ps1

try {
    Write-Host "🚀 Cloudtype Database Sync Tool" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. 백업 파일 목록 표시 및 선택
    $backupDir = Join-Path $PSScriptRoot "backup"
    if (-not (Test-Path $backupDir)) {
        throw "Backup folder not found"
    }

    $backupFiles = Get-ChildItem -Path $backupDir -Filter "*.json" | Sort-Object LastWriteTime -Descending

    if ($backupFiles.Count -eq 0) {
        throw "No backup files found"
    }

    Write-Host "Select a backup file to upload to Cloudtype:" -ForegroundColor Yellow
    Write-Host ""

    $index = 1
    $fileMap = @{}

    foreach ($file in $backupFiles) {
        $size = [math]::Round($file.Length / 1KB, 2)
        $date = $file.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
        
        Write-Host "  $index. $($file.Name)" -ForegroundColor White
        Write-Host "     Size: $size KB" -ForegroundColor Gray
        Write-Host "     Date: $date" -ForegroundColor Gray
        Write-Host ""
        
        $fileMap[$index] = $file
        $index++
    }

    Write-Host "  0. Export current local DB and upload" -ForegroundColor Green
    Write-Host ""

    $choice = Read-Host "Select option (0-$($backupFiles.Count))"

    if ($choice -eq "0") {
        # 로컬 DB Export
        Write-Host ""
        Write-Host "📤 Exporting local database..." -ForegroundColor Yellow
        npm run db:export
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to export data"
        }
        # 가장 최근 파일 다시 찾기
        $selectedFile = Get-ChildItem -Path $backupDir -Filter "db-export-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    }
    elseif ($fileMap.ContainsKey([int]$choice)) {
        $selectedFile = $fileMap[[int]$choice]
    }
    else {
        throw "Invalid selection"
    }

    Write-Host ""
    Write-Host "✅ Selected file: $($selectedFile.Name)" -ForegroundColor Green
    Write-Host ""

    # 인코딩 설정
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

    # 2. 사용자에게 확인
    Write-Host "⚠️  WARNING: This will replace ALL data in the Cloudtype database!" -ForegroundColor Yellow
    Write-Host "   Make sure you have a backup of your Cloudtype database if needed." -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Do you want to continue? (y/n)"

    if ($confirm -ne "y" -and $confirm -ne "Y" -and $confirm -ne "yes") {
        Write-Host "❌ Cancelled by user" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 0
    }

    # 3. Cloudtype DATABASE_URL 입력
    Write-Host ""
    Write-Host "📝 Please enter your Cloudtype DATABASE_URL" -ForegroundColor Cyan
    Write-Host "   (Format: postgresql://user:password@host:port/database)" -ForegroundColor Gray
    Write-Host ""
    $cloudtypeUrl = Read-Host "DATABASE_URL"

    if ([string]::IsNullOrWhiteSpace($cloudtypeUrl)) {
        throw "DATABASE_URL is required"
    }

    # 4. 원래 DATABASE_URL 백업
    $originalUrl = $env:DATABASE_URL

    # 5. 환경변수 설정
    Write-Host ""
    Write-Host "🔧 Setting environment variable..." -ForegroundColor Yellow
    $env:DATABASE_URL = $cloudtypeUrl

    # 6. Cloudtype DB에 데이터 가져오기
    Write-Host ""
    Write-Host "📥 Importing data to Cloudtype database..." -ForegroundColor Yellow
    Write-Host "   This may take a few minutes depending on data size..." -ForegroundColor Gray
    Write-Host ""

    # 절대 경로 사용
    $absolutePath = $selectedFile.FullName
    
    # 실행 명령어 출력 (디버깅용)
    Write-Host "Running: npm run db:import `"$absolutePath`"" -ForegroundColor Gray
    
    npm run db:import "$absolutePath"

    if ($LASTEXITCODE -ne 0) {
        # 원래 URL 복원
        $env:DATABASE_URL = $originalUrl
        throw "Failed to import data (Exit Code: $LASTEXITCODE)"
    }

    # 7. 원래 DATABASE_URL 복원
    $env:DATABASE_URL = $originalUrl

    Write-Host ""
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   - Uploaded file: $($selectedFile.Name)" -ForegroundColor White
    Write-Host "   - Data imported to Cloudtype database" -ForegroundColor White
    Write-Host "   - Local DATABASE_URL has been restored" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Your Cloudtype database is now in sync!" -ForegroundColor Green
    Write-Host ""

}
catch {
    Write-Host ""
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    # 환경변수 복원 시도
    if ($originalUrl) {
        $env:DATABASE_URL = $originalUrl
    }
}

Read-Host "Press Enter to exit..."
