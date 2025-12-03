# 📱 근로자 관리 앱 (Worker Management App)

Next.js 기반의 근로자 관리 웹/모바일 애플리케이션입니다.

## ✨ 주요 기능

- 👥 근로자 관리 (추가, 수정, 삭제)
- 📅 출퇴근 기록 관리
- 📊 근무 시간 통계 및 리포트
- 🏢 제품/카테고리 관리
- 📢 공지사항
- 📝 특이사항 기록 및 달력 뷰
- 🔐 사용자 인증 (관리자/일반 사용자)
- 📱 **안드로이드 네이티브 앱 지원**

## 🚀 빠른 시작

### 웹 버전

```bash
# 의존성 설치
npm install

# 데이터베이스 설정
npx prisma generate
npx prisma db push

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 📱 모바일 앱 (Android)

**안드로이드 앱이 준비되었습니다!**

#### 빠른 시작
1. Next.js 개발 서버 실행: `npm run dev`
2. Capacitor 설정 확인: `capacitor.config.ts`
3. Android Studio 설치 및 실행

#### 자세한 가이드
- **⚡ APK 빠른 빌드**: [`APK_QUICK_START.md`](./APK_QUICK_START.md) ⭐ 3단계로 완료!
- **📱 안드로이드 전체 가이드**: [`ANDROID_BUILD_GUIDE.md`](./ANDROID_BUILD_GUIDE.md)
- **빠른 시작**: [`MOBILE_QUICKSTART.md`](./MOBILE_QUICKSTART.md) (개발 모드)
- **전체 설정**: [`SETUP_COMPLETE.md`](./SETUP_COMPLETE.md)

## 📱 모바일 앱 구조

이 앱은 **WebView Wrapper** 방식을 사용합니다:
- 안드로이드 앱이 Next.js 서버를 WebView로 로드
- 모든 Next.js 기능 완벽 작동 (API 라우트, 인증 등)
- 개발 시: 로컬 서버 사용
- 프로덕션: 배포된 서버 URL 사용

```
앱 (WebView) → Next.js 서버 → 데이터베이스
```

## 🛠️ 기술 스택

### 웹
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT (jose)
- **UI**: Lucide React Icons
- **Date**: date-fns

### 모바일
- **Framework**: Capacitor
- **Platform**: Android (iOS 지원 가능)
- **Build**: Gradle

## 📂 프로젝트 구조

```
worker-management-app/
├── app/                        # Next.js 앱 디렉토리
│   ├── api/                    # API 라우트
│   ├── components/             # React 컴포넌트
│   ├── dashboard/              # 대시보드 페이지
│   ├── lib/                    # 유틸리티 함수
│   └── contexts/               # React Context
├── android/                    # Android 네이티브 프로젝트
│   └── app/                    # Android 앱 소스
├── prisma/                     # Prisma 스키마 및 마이그레이션
├── public/                     # 정적 파일
├── docs/                       # 문서
├── capacitor.config.ts         # Capacitor 설정
├── build-apk.bat              # APK 빌드 스크립트
└── package.json
```

## 🎮 주요 스크립트

### 웹 개발
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작
```

### 모바일 개발
```bash
npx cap sync android        # Android 프로젝트 동기화
npx cap open android        # Android Studio 열기
.\build-apk.bat            # APK 빌드
```

### 데이터베이스
```bash
npx prisma generate         # Prisma 클라이언트 생성
npx prisma db push          # 스키마 적용
npm run db:seed             # 초기 데이터 생성
npm run db:export           # DB 데이터를 JSON으로 내보내기
npm run db:import <file>    # JSON 파일에서 DB로 가져오기
```

### 데이터베이스 편집 (GUI)
```bash
npx prisma studio       # 로컬 DB 편집 (현재 상태)
.\edit-backup.ps1       # 백업 파일 선택 및 편집 ⭐
.\edit-backup.bat       # (PowerShell 스크립트 실행)
```

자세한 가이드: [`EDIT_BACKUP_GUIDE.md`](./EDIT_BACKUP_GUIDE.md)

### 데이터베이스 동기화
```bash
# Cloudtype에 로컬 데이터 동기화
.\sync-to-cloudtype.ps1             # 로컬 → Cloudtype 업로드

# Cloudtype에서 데이터 백업받기
.\cloudtype-backup.bat              # 원클릭 백업 ⭐ (더블클릭!)
.\download-backup-from-cloudtype.ps1  # PowerShell 백업

# 또는 /sync_db 워크플로우 사용
```

- **원클릭 백업**: [`ONE_CLICK_BACKUP_GUIDE.md`](./ONE_CLICK_BACKUP_GUIDE.md) ⭐ 가장 쉬움
- **API 백업 가이드**: [`API_BACKUP_GUIDE.md`](./API_BACKUP_GUIDE.md) 
- 동기화 가이드: [`SYNC_DB_TO_CLOUDTYPE.md`](./SYNC_DB_TO_CLOUDTYPE.md)


## 🔐 환경 변수

`.env` 파일 생성:

```env
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/worker_db"

# JWT
JWT_SECRET="your-secret-key"
```

## 📱 모바일 앱 빌드

### 개발 모드
1. `npm run dev` 실행
2. `capacitor.config.ts`에서 로컬 IP 설정
3. Android Studio나 에뮬레이터에서 실행

### 프로덕션 APK
1. `capacitor.config.ts`에서 서버 URL 설정
2. `.\build-apk.bat` 실행
3. `android\app\build\outputs\apk\debug\app-debug.apk` 생성

자세한 내용은 [`SETUP_COMPLETE.md`](./SETUP_COMPLETE.md) 참조

## 🌐 배포

### 웹 (Cloudtype)
- `/deploy_to_cloudtype` 워크플로우 사용
- 자동 빌드 및 배포

### 모바일 (Google Play)
1. Release APK/AAB 빌드
2. Google Play Console에 업로드
3. 내부/베타 테스트 진행
4. 프로덕션 릴리스

## 📚 문서

- [모바일 앱 빠른 시작](./MOBILE_QUICKSTART.md)
- [설정 완료 가이드](./SETUP_COMPLETE.md)
- [모바일 빌드 가이드](./docs/MOBILE_BUILD_GUIDE.md)

## 🤝 기여

이슈와 PR은 언제나 환영합니다!

## 📄 라이선스

MIT License

---

## 🎉 최신 업데이트

**✨ 안드로이드 네이티브 앱 지원 추가!**
- Capacitor를 사용한 WebView 래퍼 구현
- 코드 수정 없이 모바일 앱 변환 완료
- 모든 Next.js 기능 완벽 작동
- 웹/모바일 동시 운영 가능

자세한 내용은 [`SETUP_COMPLETE.md`](./SETUP_COMPLETE.md)를 확인하세요!
