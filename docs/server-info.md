# 서버 인프라 정보

## 운영 주소

| 용도 | 주소 |
|---|---|
| 홈페이지 | [Earth Memory](https://earth-memory-client.onrender.com/) |
| API 상태 확인 | [Express 상태 확인](https://earth-memory-server.onrender.com/api/health) |

## Render 설정

- 정적 사이트를 빌드할 때 `VITE_API_URL=https://earth-memory-server.onrender.com`을 사용한다. 이 값을 바꾸면 클라이언트를 다시 빌드한다.
- Express 서비스의 `CLIENT_ORIGIN`은 `https://earth-memory-client.onrender.com`으로 설정한다.
- 정적 사이트에서 `/signup`과 `/login`을 직접 열거나 새로고침해도 React 앱이 로드되도록 `/*`에서 `/index.html`로 rewrite를 설정한다.
- API 호스트의 `/api/health`에서 JSON 응답을 확인한다.

## 메일 인프라

기존 OCI 서버의 Stalwart Mail Server와 SOGo 웹메일은 Earth Memory 웹 서비스와 별도로 관리한다.
