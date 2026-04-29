@echo off
chcp 949 >nul
echo ========================================
echo   APK 빌드 스크립트
echo ========================================
echo.

echo Android Studio의 JDK를 사용하여 빌드합니다...
echo.

:: Android Studio의 일반적인 JDK 경로들
set AS_JDK1=C:\Program Files\Android\Android Studio\jbr
set AS_JDK2=C:\Program Files\Android\Android Studio\jre
set AS_JDK3=%LOCALAPPDATA%\Android\Sdk\jdk

:: JDK 경로 찾기
if exist "%AS_JDK1%\bin\java.exe" (
    set "JAVA_HOME=%AS_JDK1%"
    echo ✓ JDK 찾음: %AS_JDK1%
    goto :build
)

if exist "%AS_JDK2%\bin\java.exe" (
    set "JAVA_HOME=%AS_JDK2%"
    echo ✓ JDK 찾음: %AS_JDK2%
    goto :build
)

if exist "%AS_JDK3%\bin\java.exe" (
    set "JAVA_HOME=%AS_JDK3%"
    echo ✓ JDK 찾음: %AS_JDK3%
    goto :build
)

echo.
echo ❌ Android Studio JDK를 찾을 수 없습니다.
echo.
echo 해결 방법:
echo   1. Android Studio를 실행하세요
echo   2. 하단의 "Terminal" 탭 클릭
echo   3. 다음 명령어 입력:
echo.
echo      cd android
echo      .\gradlew.bat assembleDebug
echo.
pause
exit /b 1

:build
echo.
echo [빌드 시작]
echo 소요 시간: 5-10분
echo.

cd android
call gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo ❌ 빌드 실패!
    echo.
    echo Android Studio에서 직접 빌드해보세요:
    echo   Build → Build Bundle(s) / APK(s) → Build APK(s)
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ 빌드 성공!
echo ========================================
echo.
echo APK 위치:
echo   android\app\build\outputs\apk\debug\app-debug.apk
echo.

:: APK 파일 열기
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo APK 파일을 탐색기에서 엽니다...
    explorer app\build\outputs\apk\debug\
)

echo.
echo 이제 APK를 안드로이드 기기에 설치하세요!
echo.
pause
