# Codebase Backup Script
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "workmanage_backup_$date.zip"
$targetPath = Join-Path $PSScriptRoot ".." | Resolve-Path
$destinationPath = Join-Path $targetPath $zipName

# Define root items to exclude from backup
$exclusions = @(
    "node_modules",
    ".next",
    ".git",
    ".idea",
    "android",
    "backup",
    "backups",
    "*.zip",
    "*.log",
    "*.bak",
    "*.bak2",
    "tsconfig.tsbuildinfo"
)

Write-Host "Starting codebase backup..."
Write-Host "Target Directory: $targetPath"
Write-Host "Excluding: $($exclusions -join ', ')"

# Get root items to include
$itemsToArchive = Get-ChildItem -Path $targetPath -Exclude $exclusions

if ($itemsToArchive) {
    Write-Host "Creating archive at: $destinationPath"
    Compress-Archive -Path $itemsToArchive -DestinationPath $destinationPath -Force
    
    if (Test-Path $destinationPath) {
        $fileInfo = Get-Item $destinationPath
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Host "[SUCCESS] Backup completed successfully!"
        Write-Host "File Name: $($fileInfo.Name)"
        Write-Host "File Size: $sizeMB MB"
    } else {
        Write-Error "Backup file was not created!"
    }
} else {
    Write-Error "No items found to archive!"
}
