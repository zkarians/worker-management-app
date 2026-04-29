---
description: 로컬 데이터베이스를 Cloudtype에 동기화하기
---

# 로컬 DB를 Cloudtype에 동기화

이 워크플로우는 로컬 데이터베이스의 모든 데이터를 Cloudtype 배포 환경으로 마이그레이션합니다.

## 자동 방법 (권장)

// turbo-all

1. 자동화 스크립트 실행:
```powershell
.\sync-to-cloudtype.ps1
```

2. 안내에 따라 Cloudtype DATABASE_URL을 입력하세요.

## 수동 방법

// turbo

1. 로컬 데이터를 JSON 파일로 내보내기:
```bash
npm run db:export
```

2. `.env` 파일을 열고 `DATABASE_URL`을 임시로 Cloudtype의 PostgreSQL URL로 변경합니다.

3. 내보낸 데이터를 Cloudtype DB로 가져오기:
```bash
npm run db:import backup/db-export-[최신타임스탬프].json
```

4. `.env` 파일의 `DATABASE_URL`을 다시 로컬 설정으로 복원합니다.

## 주의사항

⚠️ **경고**: 
- 이 작업은 Cloudtype DB의 모든 기존 데이터를 삭제하고 로컬 데이터로 대체합니다.
- 중요한 프로덕션 데이터가 있다면 먼저 백업하세요.
- DATABASE_URL을 올바르게 입력했는지 반드시 확인하세요.

## 초기 시드 데이터만 필요한 경우

프로덕션에 깨끗한 초기 상태의 데이터만 필요한 경우:

// turbo

1. Cloudtype DATABASE_URL을 환경변수로 설정:
```powershell
$env:DATABASE_URL="your-cloudtype-database-url"
```

2. 마이그레이션 실행:
```bash
npx prisma migrate deploy
```

3. 초기 시드 데이터 생성:
```bash
npm run db:seed
```

4. 로컬 DATABASE_URL 복원

## 트러블슈팅

- **연결 실패**: Cloudtype의 DATABASE_URL이 올바른지 확인하세요.
- **타임아웃**: Cloudtype DB의 방화벽 설정을 확인하세요.
- **Unique 제약 위반**: 대상 DB를 완전히 초기화하거나 `npx prisma migrate reset`을 사용하세요 (주의: 데이터 삭제됨).

## 추가 정보

자세한 내용은 `SYNC_DB_TO_CLOUDTYPE.md` 파일을 참조하세요.
