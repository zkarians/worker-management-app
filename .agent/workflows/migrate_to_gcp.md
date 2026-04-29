---
description: Cloudtype에서 Google Cloud Platform(GCP)으로 서버 및 데이터베이스 이전 가이드
---

# Google Cloud Platform(GCP) 이전 가이드

이 가이드는 Cloudtype에서 운영 중인 Next.js 애플리케이션과 PostgreSQL 데이터베이스를 Google Cloud Platform(Cloud Run + Cloud SQL)으로 이전하는 방법을 설명합니다.

## 사전 준비 사항

1.  **Google Cloud 계정**: [Google Cloud Console](https://console.cloud.google.com/)에 접속 가능한 계정.
2.  **Google Cloud SDK (gcloud CLI)**: 로컬 컴퓨터에 설치되어 있어야 합니다. ([설치 가이드](https://cloud.google.com/sdk/docs/install))
3.  **Docker**: 로컬 컴퓨터에 Docker가 설치되어 있어야 합니다. (이미지 빌드용)

## 1단계: Google Cloud 프로젝트 설정

1.  [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트를 생성합니다 (예: `worker-management`).
2.  다음 API를 활성화합니다:
    *   **Cloud Run API**
    *   **Cloud SQL Admin API**
    *   **Artifact Registry API** (또는 Container Registry API)

```bash
# gcloud CLI로 로그인 및 프로젝트 설정
gcloud auth login
gcloud config set project [PROJECT_ID]

# API 활성화
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com
```

## 2단계: Cloud SQL (PostgreSQL) 생성

1.  Google Cloud Console > **SQL** > **인스턴스 만들기** > **PostgreSQL** 선택.
2.  **인스턴스 ID**, **비밀번호** 설정 (비밀번호는 꼭 기억해두세요).
3.  **데이터베이스 버전**: PostgreSQL 15 (또는 기존 버전과 동일하게).
4.  **리전**: `asia-northeast3` (서울) 권장.
5.  **구성 옵션**:
    *   개발/테스트용이라면 `Sandbox` 또는 `Shared Core` 등 저렴한 옵션 선택.
    *   **연결**: '공개 IP'를 활성화하고, '승인된 네트워크'에 현재 로컬 IP를 추가하면 로컬에서 접속하여 데이터를 넣기 편합니다. (보안상 나중에는 끄거나 Cloud SQL Auth Proxy 사용 권장)
6.  인스턴스 생성 완료 후, **데이터베이스** 탭에서 새 데이터베이스 생성 (예: `worker_db`).

## 3단계: 데이터베이스 이전 (Cloudtype -> Cloud SQL)

1.  **Cloudtype 데이터 백업**:
    *   기존에 만든 `sync-from-cloudtype.ps1` 스크립트 등을 사용하여 Cloudtype DB 데이터를 로컬로 덤프(`backup.sql`)합니다.
    *   또는 Cloudtype 대시보드나 pgAdmin 등을 이용해 데이터를 내보냅니다.

2.  **Cloud SQL로 데이터 가져오기**:
    *   로컬에서 `psql` 도구를 사용하여 Cloud SQL에 접속하고 데이터를 복원합니다.
    ```bash
    # Cloud SQL 접속 (공개 IP가 열려있다고 가정)
    psql -h [CLOUD_SQL_PUBLIC_IP] -U postgres -d worker_db -f backup.sql
    ```
    *   또는 Google Cloud Storage 버킷에 `backup.sql`을 올리고, Cloud SQL 콘솔의 '가져오기' 기능을 사용할 수도 있습니다.

## 4단계: Docker 이미지 빌드 및 푸시

1.  **Artifact Registry 저장소 생성**:
    ```bash
    gcloud artifacts repositories create my-repo --repository-format=docker --location=asia-northeast3 --description="Docker repository"
    ```

2.  **이미지 빌드 및 푸시**:
    *   프로젝트 루트(`Dockerfile`이 있는 곳)에서 실행합니다.
    ```bash
    # 인증 구성
    gcloud auth configure-docker asia-northeast3-docker.pkg.dev

    # 이미지 빌드 (PROJECT_ID를 실제 프로젝트 ID로 변경)
    docker build -t asia-northeast3-docker.pkg.dev/[PROJECT_ID]/my-repo/worker-app:latest .

    # 이미지 푸시
    docker push asia-northeast3-docker.pkg.dev/[PROJECT_ID]/my-repo/worker-app:latest
    ```

## 5단계: Cloud Run 배포

1.  **Cloud Run 서비스 배포**:
    ```bash
    gcloud run deploy worker-app \
      --image asia-northeast3-docker.pkg.dev/[PROJECT_ID]/my-repo/worker-app:latest \
      --platform managed \
      --region asia-northeast3 \
      --allow-unauthenticated \
      --set-env-vars DATABASE_URL="postgresql://postgres:[PASSWORD]@[CLOUD_SQL_PUBLIC_IP]:5432/worker_db"
    ```
    *   **중요**: `DATABASE_URL`은 Cloud SQL의 연결 정보로 설정해야 합니다.
    *   보안을 위해 Cloud SQL Auth Proxy를 사이드카로 쓰거나, VPC 커넥터를 사용하는 것이 좋지만, 초기 설정에는 공개 IP 연결이 가장 간단합니다.

2.  **배포 확인**:
    *   배포가 완료되면 제공되는 URL로 접속하여 확인합니다.

## 6단계: 도메인 연결 (선택 사항)

*   Cloud Run 콘솔의 '도메인 매핑' 기능을 사용하여 보유한 도메인을 연결할 수 있습니다.

---
**주의사항**:
*   Cloud SQL 비용이 발생할 수 있으므로, 사용하지 않을 때는 인스턴스를 중지하거나 삭제하세요.
*   `DATABASE_URL` 등 민감한 정보는 Cloud Secret Manager를 사용하는 것이 안전합니다.
