# Cloudtype DB에서 로컬로 동기화하는 스크립트
# 사용법: .\sync-from-cloudtype.ps1

try {
    Write-Host "🚀 Cloudtype to Local Sync Tool" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Cloudtype DATABASE_URL 입력
    Write-Host "📝 Please enter your Cloudtype DATABASE_URL" -ForegroundColor Cyan
    Write-Host "   (Format: postgresql://user:password@host:port/database)" -ForegroundColor Gray
    Write-Host ""
    $cloudtypeUrl = Read-Host "DATABASE_URL"

    if ([string]::IsNullOrWhiteSpace($cloudtypeUrl)) {
        throw "DATABASE_URL is required"
    }

    # 2. 원래 DATABASE_URL 백업 (현재 세션)
    $originalUrl = $env:DATABASE_URL
    
    # 3. Cloudtype URL로 환경변수 설정
    Write-Host ""
    Write-Host "🔧 Setting environment variable to Cloudtype..." -ForegroundColor Yellow
    $env:DATABASE_URL = $cloudtypeUrl

    # 4. Cloudtype에서 데이터 내보내기
    Write-Host ""
    Write-Host "📥 Exporting data from Cloudtype..." -ForegroundColor Yellow
    npm run db:export

    if ($LASTEXITCODE -ne 0) {
        $env:DATABASE_URL = $originalUrl
        throw "Failed to export data from Cloudtype"
    }

    # 5. 로컬 URL로 복원
    Write-Host ""
    Write-Host "🔧 Restoring local environment variable..." -ForegroundColor Yellow
    $env:DATABASE_URL = $originalUrl
    # 만약 originalUrl이 비어있으면 (보통 .env 사용) null로 설정
    if ([string]::IsNullOrWhiteSpace($originalUrl)) {
        Remove-Item Env:\DATABASE_URL
    }

    # 6. 가장 최근 백업 파일 찾기
    $backupDir = Join-Path $PSScriptRoot "backup"
    $latestFile = Get-ChildItem -Path $backupDir -Filter "db-export-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

    if (-not $latestFile) {
        throw "No export file found"
    }

    Write-Host "✅ Exported file: $($latestFile.Name)" -ForegroundColor Green

    # 7. 로컬 DB로 가져오기
    Write-Host ""
    Write-Host "📤 Importing data to Local database..." -ForegroundColor Yellow
    
    # 절대 경로 사용
    $absolutePath = $latestFile.FullName
    npm run db:import "$absolutePath"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to import data to local DB"
    }

    Write-Host ""
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
    Write-Host "🎉 Your Local database is now in sync with Cloudtype!" -ForegroundColor Green
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
    } else {
        Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    }
}

Read-Host "Press Enter to exit..."
