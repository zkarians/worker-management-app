@echo off
set PORT=3001
echo ==========================================
echo   Worker Management App 시작 중...
echo   접속 주소: http://localhost:%PORT%
echo ==========================================

:: 브라우저를 먼저 실행 (서버 로딩 중 잠시 대기할 수 있음)
start "" "http://localhost:%PORT%"

:: Next.js 서버 실행 (포트 3001)
npm run dev -- -p %PORT%

pause
