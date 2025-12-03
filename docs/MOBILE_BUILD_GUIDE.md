# 모바일 앱 빌드 가이드 (Android)

## 개요
이 문서는 Worker Management 앱을 안드로이드 네이티브 앱으로 빌드하는 방법을 설명합니다.

## 🎯 앱 작동 방식
이 앱은 **WebView Wrapper** 방식을 사용합니다:
- 앱이 내장 웹뷰에서 Next.js 서버를 로드
- 개발 시: 로컬 서버 (`localhost:3000`) 사용
- 프로덕션: 배포된 서버 URL 또는 로컬 서버 사용 가능
- 모든 Next.js 기능 완벽 작동 (API 라우트, 인증 등)

## 사전 요구사항
- ✅ Node.js 및 npm 설치
- ✅ Android Studio 설치 (APK 빌드용)
- ✅ Java Development Kit (JDK) 11 이상
- ✅ 로컬 네트워크에서 접근 가능한 서버

---

## 🚀 빠른 시작 (개발 모드)

### 1. 로컬 IP 주소 확인
PowerShell에서 실행:
```powershell
ipconfig
```
`IPv4 Address`를 확인하세요 (예: `192.168.1.100`)

### 2. Next.js 개발 서버 실행
```bash
npm run dev
```
서버가 `http://localhost:3000`에서 실행됩니다.

### 3. Capacitor 설정 업데이트
`capacitor.config.ts` 파일을 열고 `server.url` 부분의 주석을 해제하고 IP를 설정:

```typescript
server: {
  url: 'http://192.168.1.100:3000',  // 본인의 IP로 변경
  cleartext: true,
  // ...
},
```

### 4. Android 프로젝트 동기화
```bash
npx cap sync android
```

### 5. Android Studio에서 열기
```bash
npx cap open android
```

### 6. 에뮬레이터 또는 실제 기기에서 실행
- Android Studio에서 `Run` 버튼 클릭
- 에뮬레이터 또는 USB로 연결된 실제 기기 선택
- 앱이 실행되면 로컬 서버로 연결됩니다

---

## 📦 프로덕션 빌드 (배포된 서버 사용)

### Option 1: 배포된 서버 URL 사용

1. `capacitor.config.ts` 수정:
```typescript
server: {
  url: 'https://your-app.cloudtype.app',  // 배포된 서버 URL
},
```

2. 동기화 및 빌드:
```bash
npx cap sync android
npx cap open android
```

3. Android Studio에서 APK 빌드:
   - `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 빌드 완료 후: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: 로컬 서버 유지 (권장)

앱과 함께 작은 Node.js 서버를 번들링할 수도 있지만, 가장 간단한 방법은:
1. 서버는 별도로 호스팅 (Cloudtype, Vercel 등)
2. 앱은 해당 서버 URL을 가리킴

---

## 🔧 트러블슈팅

### 앱이 서버에 연결되지 않을 때
1. **같은 네트워크인지 확인**: 모바일 기기와 PC가 같은 WiFi에 연결되어 있어야 함
2. **방화벽 확인**: Windows 방화벽에서 포트 3000 허용
3. **IP 주소 확인**: `ipconfig`로 올바른 IP 사용 중인지 확인

### CORS 에러가 발생할 때
Next.js 앱은 자체적으로 요청을 처리하므로 일반적으로 CORS 문제 없음

### Android Studio에서 빌드 에러
```bash
# Gradle 캐시 삭제
cd android
./gradlew clean
cd ..
```

---

## 📱 앱 아이콘 및 스플래시 스크린 설정

### 아이콘 생성
1. 1024x1024 PNG 이미지 준비
2. [icon.kitchen](https://icon.kitchen/) 사용하여 모든 크기 생성
3. `android/app/src/main/res/` 폴더에 복사

### 스플래시 스크린
`capacitor.config.ts`에 추가:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#ffffff",
  },
},
```

---

## 🎨 앱 정보 수정

### 앱 이름 변경
`android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">근로자 관리</string>
```

### 패키지명 변경
`capacitor.config.ts`의 `appId` 수정 후:
```bash
npx cap sync android
```

---

## ⚡ 유용한 명령어

```bash
# 동기화 (설정 변경 후 항상 실행)
npx cap sync android

# Android Studio 열기
npx cap open android

# 플러그인 추가 예시
npm install @capacitor/camera
npx cap sync
```

---

## 📌 중요 사항

1. **개발 중에는 항상 Next.js 서버가 실행 중이어야 합니다**
   ```bash
   npm run dev
   ```

2. **IP 주소가 변경되면 `capacitor.config.ts` 업데이트 필요**

3. **프로덕션에서는 HTTPS 사용 권장**

4. **데이터베이스는 서버에 있으므로 앱은 클라이언트 역할만 함**

---

## 🚀 배포 체크리스트

- [ ] 서버가 안정적으로 호스팅되어 있는지 확인
- [ ] `capacitor.config.ts`에서 프로덕션 URL 설정
- [ ] 앱 아이콘 및 스플래시 스크린 설정
- [ ] Release APK 빌드 (Android Studio에서 `Build` → `Generate Signed Bundle/APK`)
- [ ] Google Play Console에 업로드

---

## 📞 다음 단계

APK를 빌드한 후:
1. Google Play Console 계정 생성
2. 앱 등록 및 정보 입력
3. APK 업로드
4. 내부 테스트 → 베타 테스트 → 프로덕션 릴리스

