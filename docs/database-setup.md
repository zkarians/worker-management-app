# 데이터베이스 연결 설정 가이드

## CloudType PostgreSQL 연결 정보

PostgreSQL 서비스 주소: `svc.sel3.cloudtype.app:30255`

## DATABASE_URL 형식

CloudType 환경 변수에 다음 형식으로 설정해야 합니다:

```
postgresql://username:password@svc.sel3.cloudtype.app:30255/database_name?sslmode=require
```

또는 SSL 없이 (내부 네트워크인 경우):

```
postgresql://username:password@svc.sel3.cloudtype.app:30255/database_name
```

## 필수 정보

1. **username**: PostgreSQL 사용자 이름 (보통 `postgres` 또는 CloudType에서 생성한 사용자)
2. **password**: PostgreSQL 비밀번호
3. **database_name**: 데이터베이스 이름 (보통 `postgres` 또는 생성한 데이터베이스 이름)

## CloudType에서 DATABASE_URL 확인 방법

1. PostgreSQL 서비스 페이지에서 "주소 복사" 버튼 클릭
2. 또는 "연결" 탭에서 연결 정보 확인
3. 환경 변수에 `DATABASE_URL`로 설정

## 연결 테스트

배포 후 다음 엔드포인트로 연결 상태 확인:
- `/api/health` - 데이터베이스 연결 상태 확인



