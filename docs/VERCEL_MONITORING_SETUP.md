# Vercel Usage 모니터링 설정 가이드

시스템 모니터링 페이지(`/dashboard/monitor`)에서 Vercel의 usage 데이터를 확인할 수 있습니다.

## 📊 표시되는 Usage 데이터

- **Bandwidth**: 이번 달 총 대역폭 사용량 (GB/MB)
- **Edge Requests**: Edge 네트워크 요청 수
- **Function Invocations**: Serverless 함수 호출 횟수
- **Build Execution Time**: 빌드 실행 시간 (분)

## 🔧 설정 방법

### 1. Vercel API Token 발급

1. [Vercel Account Settings](https://vercel.com/account/tokens)로 이동
2. "Create Token" 버튼 클릭
3. Token 이름 입력 (예: "Worker Management Monitor")
4. Scope 선택:
   - **Full Account** 또는
   - 특정 프로젝트만 선택
5. "Create" 클릭 후 토큰 복사

### 2. Vercel Project ID 확인 (선택사항)

Project ID를 지정하지 않으면 자동으로 첫 번째 프로젝트를 사용합니다.

**방법 1: Vercel Dashboard에서 확인**
1. [Vercel Dashboard](https://vercel.com/dashboard)로 이동
2. 프로젝트 선택
3. Settings → General
4. "Project ID" 복사

**방법 2: API로 확인**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v9/projects
```

### 3. 환경 변수 설정

`.env` 파일에 다음 내용 추가:

```env
# Vercel API Configuration
VERCEL_API_TOKEN="your_vercel_api_token_here"
VERCEL_PROJECT_ID="your_project_id_here"  # 선택사항
```

### 4. 개발 서버 재시작

환경 변수를 추가한 후 개발 서버를 재시작해야 합니다:

```powershell
# 현재 실행 중인 서버 중지 (Ctrl+C)
# 또는 PowerShell에서:
Get-Process node | Stop-Process -Force

# 서버 재시작
npm run dev
```

### 5. 확인

1. 브라우저에서 `http://localhost:3000/dashboard/monitor` 접속
2. Manager 계정으로 로그인
3. Vercel Project Info 카드에서 usage 데이터 확인

## 🔍 문제 해결

### "API Key configuration missing" 오류
- `.env` 파일에 `VERCEL_API_TOKEN`이 올바르게 설정되었는지 확인
- 개발 서버를 재시작했는지 확인

### "Failed to fetch Vercel project" 오류
- API Token이 유효한지 확인
- Token에 프로젝트 접근 권한이 있는지 확인

### Usage 데이터가 표시되지 않음
- Vercel의 Free Plan에서는 일부 usage 데이터가 제한될 수 있습니다
- API Token이 Team 또는 Personal account에 맞게 설정되었는지 확인

## 📝 참고

- Usage 데이터는 현재 월(1일 ~ 말일)의 누적 데이터입니다
- 데이터는 실시간으로 Vercel API에서 조회됩니다
- 새로고침 버튼(🔄)을 클릭하여 최신 데이터를 가져올 수 있습니다

## 🔗 관련 링크

- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Vercel Usage API](https://vercel.com/docs/rest-api/endpoints#get-usage)
- [Vercel Account Tokens](https://vercel.com/account/tokens)
