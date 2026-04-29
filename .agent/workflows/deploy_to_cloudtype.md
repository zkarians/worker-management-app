---
description: Cloudtype에 Next.js 애플리케이션 배포하기
---

# Cloudtype 배포 가이드

이 가이드는 Worker Management App을 Cloudtype에 배포하는 방법을 설명합니다.

## 0. 사전 준비 (Git 설치)

Cloudtype은 GitHub를 통해 배포하므로 **Git**이 컴퓨터에 설치되어 있어야 합니다.

1.  터미널에서 `git --version`을 입력하여 설치 여부를 확인합니다.
2.  오류가 발생하면 [Git 공식 홈페이지](https://git-scm.com/downloads)에서 Windows용 Git을 다운로드하여 설치합니다.
3.  설치 후 VS Code를 재시작해야 할 수 있습니다.

## 1. GitHub 저장소 준비

Cloudtype은 GitHub 저장소와 연동하여 배포합니다.

1.  GitHub에 새 저장소(Repository)를 생성합니다.
2.  현재 프로젝트를 해당 저장소에 푸시합니다.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <당신의_GITHUB_저장소_URL>
git push -u origin main
```

## 2. Cloudtype 프로젝트 생성

1.  [Cloudtype](https://cloudtype.io)에 로그인합니다.
2.  새 프로젝트를 생성합니다.
3.  **서비스 추가** > **Next.js**를 선택합니다.

## 3. 배포 설정

Cloudtype 설정 화면에서 다음과 같이 입력합니다.

*   **저장소**: 방금 생성한 GitHub 저장소 선택
*   **브랜치**: `main`
*   **Node.js 버전**: `20` (또는 `18`)
*   **빌드 명령어**: `npm run build`
*   **시작 명령어**: `npm run start`
*   **포트**: `3000`

## 4. 데이터베이스 설정 (중요!)

현재 프로젝트는 **SQLite**를 사용하고 있습니다. Cloudtype과 같은 컨테이너 환경에서는 재배포 시 데이터가 초기화될 수 있습니다. 데이터를 영구적으로 저장하려면 두 가지 방법이 있습니다.

### 방법 A: 파일 시스템 볼륨 사용 (SQLite 유지)
*   설정에서 **File System** (볼륨)을 추가합니다.
*   경로를 `/app/prisma` (또는 데이터베이스 파일이 있는 경로)로 마운트합니다.
*   *주의: 이 방법은 설정이 까다로울 수 있습니다.*

### 방법 B: PostgreSQL로 변경 (권장)
Cloudtype에서 제공하는 PostgreSQL 데이터베이스를 사용하는 것이 가장 안정적입니다.

1.  Cloudtype 프로젝트에서 **PostgreSQL** 서비스를 추가합니다.
2.  생성된 DB의 접속 정보(Connection String)를 복사합니다.
3.  Next.js 서비스의 **환경 변수(Environment Variables)** 설정에 추가합니다.
    *   Key: `DATABASE_URL`
    *   Value: `postgresql://user:password@host:port/dbname...` (복사한 값)
4.  프로젝트 코드에서 `prisma/schema.prisma`를 수정해야 합니다.
    ```prisma
    datasource db {
      provider = "postgresql" // sqlite에서 변경
      url      = env("DATABASE_URL")
    }
    ```
5.  `package.json`의 빌드 스크립트를 수정하여 배포 시 DB 마이그레이션이 실행되도록 합니다.
    ```json
    "scripts": {
      "build": "npx prisma generate && npx prisma migrate deploy && next build",
      ...
    }
    ```

## 5. 환경 변수 설정

Next.js 서비스 설정의 **환경 변수** 섹션에 다음 값들을 추가합니다.

*   `JWT_SECRET`: (임의의 긴 문자열, 예: `my-secret-key-1234`)
*   `DATABASE_URL`: (위에서 설정한 DB 주소, SQLite 사용 시 `file:./dev.db`)

## 6. 배포하기

설정이 완료되면 **배포하기** 버튼을 누릅니다. 배포가 완료되면 제공된 URL로 접속하여 확인합니다.
