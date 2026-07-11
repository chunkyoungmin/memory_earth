# 🌍 Earth Memory

> Every Photo Has A Place.

사용자가 촬영한 사진을 3D 지구본 위에 기록하는 개인 여행 아카이브 웹 서비스.
Google Earth처럼 지구를 회전·확대하며, 사진을 업로드하면 EXIF의 GPS/촬영시간을 자동으로 읽어 해당 위치에 핀을 생성한다.

🔗 **Live**: [https://23.ecs.li](https://23.ecs.li)

---

## ✨ 주요 기능

- **실사 3D 지구본** — NASA 위성 텍스처, 구름 레이어, 대기 글로우, 낮/밤 도시 불빛 셰이더
- **사진 업로드 & GPS 자동 인식** — EXIF에서 위치·촬영시간 자동 추출, 없으면 지구본 클릭으로 수동 지정
- **여행(Trip) 관리** — 사진을 여행 단위로 묶기, 여행별 경로(곡선) 시각화, 사진 순서 편집/삭제
- **여행 스토리 슬라이더** — 여행 사진을 순서대로 드래그하며 카메라가 자동으로 위치 이동
- **Memory Replay** — 촬영시간 순으로 카메라가 자동 비행하며 추억을 재생
- **전체 갤러리** — 검색, 날짜/국가 정렬, 클릭 시 원본 확대
- **즐겨찾기** — 사진 개별 즐겨찾기 지정/해제
- **프로필** — 유저 정보 및 활동 통계
- **관리자 대시보드** — 전체 통계, 전체 사진 관리(삭제)

---

## 🗂 프로젝트 구조

```
Earth-Memory/
├── client/     # React + Vite + Three.js (프론트엔드)
├── server/     # Node.js + Express (백엔드 API)
├── database/   # PostgreSQL 스키마
├── assets/     # 공용 정적 리소스
├── uploads/    # 업로드된 사진 (로컬 디스크, 추후 Object Storage 이전 예정)
└── docs/       # 기획서, 서버 인프라 정보
```

---

## 🛠 기술 스택

**Frontend**
React · Vite · Three.js · React Three Fiber · Drei · Tailwind CSS · Framer Motion · React Router DOM · Axios

**Backend**
Node.js · Express · PostgreSQL (`pg`) · Multer (업로드) · exifr (EXIF 파싱)

**Infra**
OCI Ubuntu 24.04 · Nginx (리버스 프록시 + 정적 파일 서빙) · PM2 (프로세스 관리) · Let's Encrypt

서버 인프라 상세: [`docs/server-info.md`](./docs/server-info.md)

---

## 🚀 로컬 개발 환경

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
cp .env.example .env   # DB 정보 등 채워넣기
npm run dev
```
→ http://localhost:4000/api/health 로 동작 확인

### 3. 데이터베이스 (PostgreSQL)

```bash
createdb earth_memory
psql -d earth_memory -f database/schema.sql
```

---

## 📦 배포 (OCI 서버)

코드 수정 후 반영하는 전체 흐름:

**로컬에서**
```bash
git add .
git commit -m "설명"
git push
```

**서버(SSH)에서**
```bash
cd ~/earth-memory
git pull
cd server && npm install && pm2 restart earth-memory-server
cd ../client && npm install && npm run build
```

Nginx가 `client/dist`를 정적 서빙하고, `/api`·`/uploads` 요청은 Express(포트 4000)로 리버스 프록시한다.

---

## 🧭 API 개요

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/api/health` | 서버 상태 확인 |
| GET | `/api/photos` | GPS 있는 사진 목록 (지도용) |
| POST | `/api/photos/upload` | 사진 업로드 + EXIF 파싱 |
| PATCH | `/api/photos/:id/location` | 위치 수동 지정 |
| PATCH | `/api/photos/:id/favorite` | 즐겨찾기 토글 |
| GET | `/api/trips` | 여행 목록 |
| POST | `/api/trips` | 여행 생성 |
| GET | `/api/trips/:id/photos` | 특정 여행의 사진 목록 |
| PATCH | `/api/trips/:id/reorder` | 여행 내 사진 순서 변경 |
| DELETE | `/api/trips/:id` | 여행 삭제 (사진은 유지) |
| GET | `/api/admin/stats` | 전체 통계 |
| GET | `/api/admin/photos` | 전체 사진 목록 (관리자) |
| DELETE | `/api/admin/photos/:id` | 사진 삭제 |
| GET | `/api/admin/profile` | 프로필 조회 |

---

## 🗺 개발 로드맵

| Part | 내용 | 상태 |
|---|---|---|
| 1 | 개발 환경 | ✅ |
| 2 | 3D 지구 | ✅ |
| 3 | UI (사이드바) | ✅ |
| 4 | 사진 업로드 | ✅ |
| 5 | GPS / 핀 | ✅ |
| 6 | 여행 | ✅ |
| 7 | 경로 연결 | ✅ |
| 8 | Memory Replay | ✅ |
| 9 | 관리자 | ✅ |
| 10 | 배포 | ✅ |
| - | 즐겨찾기 / 프로필 / 전체 갤러리 | ✅ |
| - | 로그인·회원가입 (다중 사용자) | 예정 |
| - | 친구 공유 / 공개 갤러리 | 예정 |
| - | 모바일 대응 | 예정 |

---

## 📝 향후 개선 예정

- 현재 `userId`가 임시로 `1`번 고정 — 실제 로그인/인증 붙이기
- 텍스처를 `threejs.org`에서 hotlink 중 — 배포 안정성을 위해 자체 호스팅으로 전환
- 업로드 저장소를 로컬 디스크 → OCI Object Storage로 이전
- Three.js 청크 사이즈 최적화 (동적 import / code splitting)
