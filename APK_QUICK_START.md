# 🚀 빠른 APK 빌드 가이드

## 📱 3단계로 안드로이드 앱 만들기

### ✅ 1단계: Cloudtype URL 확인
현재 설정: `https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app`

브라우저에서 위 URL이 정상 작동하는지 확인하세요!

---

### ✅ 2단계: APK 빌드

**방법 A: 자동 빌드 (가장 쉬움)** ⭐
```bash
# 프로젝트 폴더에서
.\build-apk.bat
```

**방법 B: 수동 빌드**
```bash
cd android
.\gradlew.bat assembleDebug
```

**방법 C: Android Studio**
1. Android Studio 실행
2. `File` → `Open` → `android` 폴더
3. `Build` → `Build APK(s)`

---

### ✅ 3단계: APK 설치

APK 위치:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

**설치 방법**:
- USB로 기기 연결 후 `adb install` 사용
- APK를 카카오톡/구글 드라이브로 전송 후 설치
- 이메일로 전송 후 다운로드

---

## 🎉 완료!

안드로이드 앱이 Cloudtype 서버에 연결됩니다.

### 💡 중요 사항

**웹 앱 업데이트 시**:
- GitHub에 푸시 → Cloudtype 자동 배포
- 안드로이드 앱은 재빌드 **불필요**! (WebView 방식)
- 앱을 다시 열면 최신 버전 자동 적용 🎉

**앱 설정 변경 시** (앱 이름, 아이콘 등):
- APK 재빌드 필요
- `npx cap sync android` → `.\build-apk.bat`

---

## 🔧 문제 해결

**빌드 실패?**
→ Android Studio에서 직접 빌드 (`Build` → `Build APK(s)`)

**앱 설치 안 됨?**
→ 설정 → 보안 → 알 수 없는 출처 허용

**서버 연결 안 됨?**
→ Cloudtype 서버가 정상 작동 중인지 확인
→ `capacitor.config.ts`의 URL 확인

---

📚 **자세한 가이드**: [`ANDROID_BUILD_GUIDE.md`](./ANDROID_BUILD_GUIDE.md)
