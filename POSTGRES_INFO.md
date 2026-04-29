# PostgreSQL Portable Information

이 프로젝트는 별도의 설치 없이 사용할 수 있는 포터블 버전의 PostgreSQL을 사용합니다.

## 주요 경로
- **실행 파일 (bin)**: `D:\Gemini\pg_bin\pgsql\bin`
- **데이터 폴더 (data)**: `D:\Gemini\pg_data`
- **로그 파일**: `D:\Gemini\pg_data\logfile`

## 서버 관리 명령어

### 서버 시작
```powershell
D:\Gemini\pg_bin\pgsql\bin\pg_ctl.exe start -D D:\Gemini\pg_data -l D:\Gemini\pg_data\logfile
```

### 서버 중지
```powershell
D:\Gemini\pg_bin\pgsql\bin\pg_ctl.exe stop -D D:\Gemini\pg_data
```

### 상태 확인
```powershell
D:\Gemini\pg_bin\pgsql\bin\pg_ctl.exe status -D D:\Gemini\pg_data
```

## 데이터베이스 접속 정보
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: z456qwe12!@ (현재 설정값)
- **Database**: work
