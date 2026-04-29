@echo off
chcp 65001 >nul
echo ========================================
echo   Android Studio 설치 완료 확인
echo ========================================
echo.
echo Android Studio가 설치되었는지 확인합니다...
echo.

echo [1/2] Android Studio에서 프로젝트 열기...
echo.
echo 아래 명령어를 실행하여 프로젝트를 엽니다:
echo.
echo   npx cap open android
echo.
pause

echo.
echo [2/2] Android Studio에서 APK 빌드:
echo.
echo 1. Android Studio가 프로젝트를 로드할 때까지 대기
echo 2. 상단 메뉴: Build ^> Build Bundle(s) / APK(s) ^> Build APK(s)
echo 3. 빌드 완료 대기 (처음은 5-10분 소요)
echo 4. 알림에서 "locate" 클릭하여 APK 확인
echo.
echo APK 위치: android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause

echo.
echo ========================================
echo   빌드 완료 후 다음 단계
echo ========================================
echo.
echo 1. APK 파일을 안드로이드 기기로 전송
echo 2. 파일 관리자에서 APK 클릭하여 설치
echo 3. "근로자 관리" 앱 실행
echo 4. 자동으로 서버 연결됨!
echo.
pause
