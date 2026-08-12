@echo off
echo Running codebase backup script...
powershell -ExecutionPolicy Bypass -File scripts/zip-backup.ps1
pause
