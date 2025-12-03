# 📱 안드로이드 앱 빌드 가이드 (GitHub + Cloudtype)

이 문서는 GitHub 저장소와 Cloudtype 배포를 사용하는 환경에서 안드로이드 APK를 빌드하는 전체 과정을 설명합니다.

## 🏗️ 아키텍처 개요

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub    │────▶│  Cloudtype   │────▶│ PostgreSQL  │
│ (코드 저장소) │     │ (웹 호스팅)   │     │   (DB)      │
└─────────────┘     └──────────────┘     └─────────────┘
       │                     ▲
       │                     │
       ▼                     │
┌─────────────┐              │
│Android 앱    │──────────────┘
│ (WebView)   │  Cloudtype URL 접속
└─────────────┘
```

### 작동 방식
1. **웹 앱**: Next.js 앱이 Cloudtype에서 호스팅됨
2. **안드로이드 앱**: Capacitor를 사용해 Cloudtype URL을 WebView로 감싸는 네이티브 앱
3. **데이터베이스**: PostgreSQL (Cloudtype에서 관리)

---

## 📋 사전 요구사항

### 필수 소프트웨어
- ✅ **Android Studio** ([다운로드](https://developer.android.com/studio))
- ✅ **Git** (GitHub 연동용)
- ✅ **Node.js** (Next.js 로컬 개발용)

### 확인 사항
- ✅ GitHub 저장소에 코드가 푸시되어 있어야 함
- ✅ Cloudtype에 앱이 배포되어 있어야 함
- ✅ Cloudtype URL이 정상 작동하는지 확인

---

## 🚀 전체 워크플로우

### 1️⃣ **웹 앱 배포 (GitHub → Cloudtype)**

#### 로컬에서 코드 작성 후 GitHub에 푸시
```bash
# 변경사항 확인
git status

# 파일 추가
git add .

# 커밋
git commit -m "feat: 새로운 기능 추가"

# GitHub에 푸시
git push origin main
```

#### Cloudtype 자동 배포
- Cloudtype이 자동으로 GitHub 변경사항을 감지하고 배포
- 배포 완료 후 웹 앱 URL 확인: `https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app`

---

### 2️⃣ **안드로이드 앱 설정 확인**

#### Capacitor 설정 확인 (`capacitor.config.ts`)
```typescript
const config: CapacitorConfig = {
  appId: 'com.workermanagement.app',
  appName: 'Worker Management',
  webDir: 'public',
  
  server: {
    // 🌐 Cloudtype 프로덕션 URL (현재 설정)
    url: 'https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app',
    
    // 로컬 개발용 (선택사항)
    // url: 'http://192.168.0.124:3000',
    // cleartext: true,
  },
};
```

✅ **중요**: `server.url`이 Cloudtype 배포 URL과 일치하는지 확인!

---

### 3️⃣ **APK 빌드하기**

#### 방법 1: 자동 빌드 스크립트 (추천) ⭐

프로젝트 루트에서 `build-apk.bat` 실행:
```bash
# 더블클릭하거나 터미널에서
.\build-apk.bat
```

**빌드 과정**:
1. Android Studio JDK 자동 탐지
2. Gradle을 사용해 Debug APK 빌드
3. 완료 후 APK 폴더 자동으로 열림

#### 방법 2: 수동 빌드

```bash
# Android 폴더로 이동
cd android

# Gradle을 사용해 APK 빌드
.\gradlew.bat assembleDebug

# 빌드 완료 후 APK 위치
# android\app\build\outputs\apk\debug\app-debug.apk
```

#### 방법 3: Android Studio 사용

1. Android Studio 실행
2. `File` → `Open` → `android` 폴더 선택
3. 메뉴: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
4. 빌드 완료 후 `locate` 링크 클릭

---

### 4️⃣ **APK 설치 및 테스트**

#### APK 파일 위치
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 안드로이드 기기에 설치

**방법 1: USB 연결**
```bash
# ADB 설치 확인
adb devices

# APK 설치
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**방법 2: 파일 전송**
1. APK 파일을 Google Drive, 이메일, 카카오톡 등으로 전송
2. 안드로이드 기기에서 다운로드
3. 파일 매니저로 APK 클릭 → 설치 허용

**방법 3: QR 코드**
1. APK를 웹 서버에 업로드
2. QR 코드 생성
3. 안드로이드 기기로 스캔 후 다운로드

---

## 🔧 개발 모드 vs 프로덕션 모드

### 개발 모드 (로컬 서버)

로컬에서 Next.js를 실행하고 안드로이드 앱에서 접속:

**1. 로컬 IP 확인**
```bash
ipconfig
# 예: 192.168.0.124
```

**2. `capacitor.config.ts` 수정**
```typescript
server: {
  url: 'http://192.168.0.124:3000',
  cleartext: true,
}
```

**3. Next.js 개발 서버 실행**
```bash
npm run dev
```

**4. Android 프로젝트 동기화**
```bash
npx cap sync android
```

**5. Android Studio에서 실행**
```bash
npx cap open android
# Run 버튼 클릭
```

### 프로덕션 모드 (Cloudtype 서버)

`capacitor.config.ts`를 Cloudtype URL로 설정:
```typescript
server: {
  url: 'https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app',
}
```

이제 APK에서 직접 Cloudtype 서버에 접속합니다.

---

## 📦 Release APK 빌드 (Google Play 배포용)

### 1. 키스토어 생성

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. `android/gradle.properties` 설정

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

### 3. `android/app/build.gradle` 수정

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 4. Release APK 빌드

```bash
cd android
.\gradlew.bat assembleRelease
```

APK 위치: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🛠️ 문제 해결

### APK 빌드 실패

**문제**: JDK를 찾을 수 없음
```
해결: Android Studio 설치 후 JDK 경로 확인
- C:\Program Files\Android\Android Studio\jbr
```

**문제**: Gradle 빌드 실패
```
해결: Android Studio에서 직접 빌드
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### 앱이 Cloudtype 서버에 연결 안 됨

**확인 사항**:
1. Cloudtype 서버가 정상 작동 중인지 확인
2. `capacitor.config.ts`의 URL이 정확한지 확인
3. 안드로이드 기기가 인터넷에 연결되어 있는지 확인

### 앱 설치 불가

**문제**: "알 수 없는 앱 설치 차단"
```
해결: 
설정 → 보안 → 알 수 없는 출처 → 허용
```

---

## 📱 Google Play Store 배포

1. **Google Play Console** 계정 생성
2. **Release APK** 빌드 (위 참조)
3. **앱 등록** 및 스토어 정보 입력
4. **내부 테스트** 진행
5. **베타 테스트** (선택사항)
6. **프로덕션 릴리스**

---

## 🔄 지속적인 업데이트 워크플로우

### 웹 앱 업데이트
```bash
# 1. 코드 수정
# 2. GitHub 푸시
git add .
git commit -m "feat: 기능 추가"
git push origin main

# 3. Cloudtype 자동 배포 (5-10분)
# 4. 안드로이드 앱은 자동으로 최신 버전 사용! 🎉
```

✅ **장점**: 안드로이드 앱을 다시 빌드할 필요 없음! (WebView 방식)

### 안드로이드 앱 자체 업데이트 (앱 설정 변경 시)

다음과 같은 경우에만 APK 재빌드 필요:
- 앱 아이콘 변경
- 앱 이름 변경
- Capacitor 플러그인 추가
- 네이티브 코드 수정

```bash
# 1. capacitor.config.ts 또는 android/ 폴더 수정
# 2. 프로젝트 동기화
npx cap sync android

# 3. APK 재빌드
.\build-apk.bat
```

---

## 📊 버전 관리

### 앱 버전 업데이트

`android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        versionCode 2        // 정수 (1씩 증가)
        versionName "1.1.0"  // 사용자에게 표시되는 버전
    }
}
```

---

## 🎉 완료!

이제 다음과 같은 완전한 워크플로우를 갖췄습니다:

```
로컬 개발 → GitHub → Cloudtype → 웹 앱 배포
                                     ↓
                               안드로이드 앱 (WebView)
```

### 주요 장점
✅ 웹과 모바일 단일 코드베이스  
✅ 웹 업데이트 시 모바일도 자동 업데이트  
✅ 복잡한 네이티브 코드 없음  
✅ 빠른 개발 및 배포  

---

**질문이나 문제가 있으시면 언제든지 문의하세요!** 🚀
