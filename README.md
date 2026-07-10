# 🌍 Earth Memory

> Every Photo Has A Place.

사용자가 촬영한 사진을 3D 지구본 위에 기록하는 개인 여행 아카이브 웹 서비스.

## 프로젝트 구조

```
Earth-Memory/
├── client/     # React + Vite + Three.js (프론트엔드)
├── server/     # Node.js + Express (백엔드 API)
├── database/   # PostgreSQL 스키마
├── assets/     # 공용 정적 리소스 (텍스처, 아이콘 등)
├── uploads/    # 업로드된 사진 (초기: 로컬 디스크)
└── docs/       # 기획서, 서버 인프라 정보 등 문서
```

## 개발 환경 (Part 1)

- Windows + VS Code + Git
- Node.js LTS
- 서버: OCI Ubuntu 24.04 / Nginx / PostgreSQL / Stalwart Mail Server
- 서버 인프라 상세: [docs/server-info.md](./docs/server-info.md)

## 로컬 실행 방법

### 1. 클라이언트 (React + Vite)

```bash
cd client
npm install
npm run dev
```

→ http://localhost:5173

### 2. 서버 (Express)

```bash
cd server
npm install
cp .env.example .env   # 값 채워넣기
npm run dev
```

→ http://localhost:4000/api/health 로 동작 확인

### 3. 데이터베이스 (PostgreSQL)

```bash
createdb earth_memory
psql -d earth_memory -f database/schema.sql
```

## 개발 진행 순서 (Part 방식)

| Part | 내용 | 상태 |
|---|---|---|
| 1 | 개발 환경 | ✅ 완료 |
| 2 | 3D 지구 | 예정 |
| 3 | UI | 예정 |
| 4 | 사진 업로드 | 예정 |
| 5 | GPS | 예정 |
| 6 | 여행 | 예정 |
| 7 | 경로 | 예정 |
| 8 | Memory Replay | 예정 |
| 9 | 관리자 | 예정 |
| 10 | 배포 | 예정 |

## 기술 스택

**Frontend**: React, Vite, Three.js, React Three Fiber, Drei, Tailwind CSS, Framer Motion, React Router DOM

**Backend**: Node.js, Express, PostgreSQL, exifr (EXIF 파싱), Axios
