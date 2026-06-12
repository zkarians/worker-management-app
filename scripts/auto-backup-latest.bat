@echo off
echo ===================================================
echo [Daily Auto Backup Script]
echo ===================================================

REM 1. Database Connection & Paths (No quotes in variable assignments)
set PGPASSWORD=z456qwe12!@
set PG_DUMP_PATH=D:\Gemini\pg_bin\pgsql\bin\pg_dump.exe
set BACKUP_DIR=C:\Users\Administrator\backup
set BACKUP_FILE=C:\Users\Administrator\backup\db_dump_latest.sql

REM 2. Create directory if not exists (Quotes added during execution)
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo Created backup directory: %BACKUP_DIR%
)

REM 3. Run pg_dump (Overwrites the file to keep exactly 1 latest backup)
echo Starting database backup...
"%PG_DUMP_PATH%" -U postgres -h localhost -p 5432 work > "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Backup completed: %BACKUP_FILE%
) else (
    echo [ERROR] Backup failed! Error code: %ERRORLEVEL%
)
