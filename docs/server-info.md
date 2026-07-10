# 서버 인프라 정보

## 개발/운영 서버

| 항목 | 값 |
|---|---|
| 클라우드 | OCI (Oracle Cloud Infrastructure) |
| OS | Ubuntu 24.04 LTS |
| 웹 서버 | Nginx |
| 메일 서버 | Stalwart Mail Server |
| 웹메일 | SOGo (설정 중) |
| DB | PostgreSQL |

## 도메인

| 도메인 | 용도 |
|---|---|
| `23.ecs.li` | 홈페이지 (Earth Memory 클라이언트/API) |
| `mail.23.ecs.li` | 메일 서버 |
| `webmail.23.ecs.li` | 웹메일 (SOGo) |

## 참고 사항

- 프론트엔드(`client/`)는 빌드 후 Nginx가 정적 파일로 서빙, `/api` 경로는 Node.js(Express)로 리버스 프록시하는 구조를 기본으로 한다.
- Express 서버의 CORS `origin`은 운영 환경에서 `https://23.ecs.li`로 제한한다 (`server/.env` 참고).
- 메일 서버(Stalwart) 및 SOGo는 Earth Memory 서비스와 별개로 유지되는 인프라이며, 추후 사용자 알림 메일(예: 업로드 완료, 공유 초대) 기능이 추가될 때 연동을 고려한다.
- Part 10(배포) 단계에서 Nginx 설정 파일(리버스 프록시, HTTPS/SSL, 정적 파일 서빙)을 이 정보를 기준으로 작성한다.
