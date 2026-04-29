# Cloudtype API를 통한 데이터베이스 백업 스크립트
# 사용법: .\download-backup-from-cloudtype.ps1

param(
    [string]$AppUrl = "",
    [string]$BackupSecret = ""
)

Write-Host "🌐 Cloudtype API Backup Tool" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# 1. Cloudtype 앱 URL 입력
if ([string]::IsNullOrWhiteSpace($AppUrl)) {
    Write-Host "📝 Please enter your Cloudtype app URL" -ForegroundColor Cyan
    Write-Host "   (예: https://port-0-worker-management-app-xxxxx.sel3.cloudtype.app)" -ForegroundColor Gray
    Write-Host ""
    $AppUrl = Read-Host "App URL"
}

if ([string]::IsNullOrWhiteSpace($AppUrl)) {
    Write-Host "❌ App URL is required" -ForegroundColor Red
    exit 1
}

# URL 정규화 (trailing slash 제거)
$AppUrl = $AppUrl.TrimEnd('/')

# 2. 백업 비밀 키 입력
if ([string]::IsNullOrWhiteSpace($BackupSecret)) {
    Write-Host ""
    Write-Host "🔐 Please enter your BACKUP_SECRET" -ForegroundColor Cyan
    Write-Host "   (Cloudtype 환경변수의 BACKUP_SECRET 값)" -ForegroundColor Gray
    Write-Host ""
    $BackupSecret = Read-Host "BACKUP_SECRET" -AsSecureString
    $BackupSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($BackupSecret)
    )
}

if ([string]::IsNullOrWhiteSpace($BackupSecret)) {
    Write-Host "❌ BACKUP_SECRET is required" -ForegroundColor Red
    exit 1
}

# 3. 백업 폴더 확인/생성
$backupDir = Join-Path $PSScriptRoot "backup"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# 4. 백업 다운로드
Write-Host ""
Write-Host "📥 Downloading backup from Cloudtype..." -ForegroundColor Yellow
Write-Host "   URL: $AppUrl/api/admin/backup" -ForegroundColor Gray
Write-Host ""

$timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
$outputFile = Join-Path $backupDir "cloudtype-backup-$timestamp.json"

try {
    # API 호출
    $headers = @{
        "Authorization" = "Bearer $BackupSecret"
        "Accept"        = "application/json"
    }
    
    $response = Invoke-WebRequest `
        -Uri "$AppUrl/api/admin/backup" `
        -Headers $headers `
        -Method GET `
        -TimeoutSec 300 `
        -OutFile $outputFile
    
    # 백업 정보 파싱 (파일에서 읽기)
    $fileContent = Get-Content -Path $outputFile -Raw -Encoding UTF8
    $backup = $fileContent | ConvertFrom-Json
    
    Write-Host "✅ Backup downloaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Backup Summary:" -ForegroundColor Cyan
    Write-Host "   - Export Date: $($backup.exportDate)" -ForegroundColor White
    Write-Host "   - Companies: $($backup.summary.companies)" -ForegroundColor White
    Write-Host "   - Teams: $($backup.summary.teams)" -ForegroundColor White
    Write-Host "   - Users: $($backup.summary.users)" -ForegroundColor White
    Write-Host "   - Attendances: $($backup.summary.attendances)" -ForegroundColor White
    Write-Host "   - Leave Requests: $($backup.summary.leaveRequests)" -ForegroundColor White
    Write-Host "   - Rosters: $($backup.summary.rosters)" -ForegroundColor White
    Write-Host "   - Roster Assignments: $($backup.summary.rosterAssignments)" -ForegroundColor White
    Write-Host "   - Daily Logs: $($backup.summary.dailyLogs)" -ForegroundColor White
    Write-Host "   - Announcements: $($backup.summary.announcements)" -ForegroundColor White
    Write-Host "   - Categories: $($backup.summary.categories)" -ForegroundColor White
    Write-Host "   - Products: $($backup.summary.products)" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 Saved to:" -ForegroundColor Cyan
    Write-Host "   $outputFile" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 To restore this backup locally:" -ForegroundColor Yellow
    Write-Host "   npm run db:import `"$outputFile`"" -ForegroundColor White
    
}
catch {
    Write-Host "❌ Failed to download backup" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host ""
            Write-Host "💡 Tip: BACKUP_SECRET이 올바른지 확인하세요." -ForegroundColor Yellow
            Write-Host "   Cloudtype 환경변수에 BACKUP_SECRET을 설정했는지 확인하세요." -ForegroundColor Gray
        }
    }
    
    exit 1
}

Write-Host ""
Write-Host "🎉 Backup completed successfully!" -ForegroundColor Green
