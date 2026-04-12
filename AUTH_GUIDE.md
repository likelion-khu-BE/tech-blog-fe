# 프론트엔드 인증 사용 가이드

> 작성: 김우진 (인프라/인증 담당)
> 최종 수정: 2026-04-12

이 문서는 내가 구현한 프론트엔드 인증 인프라를 팀원들이 쓸 때 필요한 것만 정리한 거다.
모르겠으면 이 파일 읽으라고 하면 된다.

---

## 전체 구조

```
src/
├── api/
│   ├── client.ts     ← axios 인스턴스. 토큰 자동 부착 + 401 자동 갱신
│   └── auth.ts       ← login/signup/refresh/logout 함수
├── contexts/
│   └── AuthContext.tsx ← 인증 상태 관리 (Provider + useAuth 훅)
├── components/auth/
│   └── ProtectedRoute.tsx ← 인증 필요 라우트 가드
├── pages/
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
└── types/
    └── auth.ts       ← 타입 정의
```

---

## API 호출하는 법

```ts
import client from '../api/client'

// 이것만 쓰면 된다. 토큰은 자동으로 붙는다.
const { data } = await client.get('/api/articles')
const { data } = await client.post('/api/articles', { title, content })
```

- `client`를 import해서 쓰면 `Authorization: Bearer {token}`이 자동으로 붙는다
- 토큰 만료(401) 시 자동으로 refresh → 재시도한다. 신경 안 써도 된다
- `fetch`나 `axios.create()`를 직접 쓰지 마라 — 토큰이 안 붙는다

---

## 현재 인증 상태 사용하기

```tsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth()

  if (isLoading) return null  // silent refresh 중
  if (!isAuthenticated) return <p>로그인이 필요합니다</p>

  return <button onClick={logout}>로그아웃</button>
}
```

| 값 | 타입 | 설명 |
|---|---|---|
| `isAuthenticated` | `boolean` | 로그인 상태 |
| `isLoading` | `boolean` | 초기 silent refresh 진행 중 |
| `login(credentials)` | `async` | 로그인 실행 |
| `logout()` | `async` | 로그아웃 실행 |

---

## 특정 페이지를 로그인 필수로 만들기

`router.tsx`에서 `ProtectedRoute`로 감싸면 된다:

```tsx
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

// 기존
{ path: 'my-page', element: <SuspenseWrapper><MyPage /></SuspenseWrapper> }

// 인증 필수로 변경
{ path: 'my-page', element: <SuspenseWrapper><ProtectedRoute><MyPage /></ProtectedRoute></SuspenseWrapper> }
```

- 미인증이면 `/login`으로 자동 리다이렉트
- 로그인 후 원래 가려던 페이지로 돌아온다

---

## 개발 환경 세팅

```bash
# 1. 의존성 설치 (axios 추가됨)
npm install

# 2. 환경변수 (이미 .env.development에 설정돼있음)
# VITE_API_BASE_URL= (비어있으면 Vite proxy 사용)

# 3. 백엔드 먼저 띄우기 (study-be 디렉토리에서)
./gradlew :app:bootRun

# 4. 프론트 dev 서버
npm run dev
# → http://localhost:3000 에서 확인
# → /api 요청은 Vite proxy가 localhost:8080으로 프록싱
```

---

## 인증 플로우

```
1. 앱 로드 → AuthProvider가 silent refresh 시도
   - 쿠키에 유효한 refresh token 있으면 → 자동 로그인
   - 없으면 → 로그인 페이지 보여줌

2. 로그인 → access token(메모리) + refresh token(쿠키, 브라우저 관리)

3. API 호출 → client가 Bearer 토큰 자동 부착

4. 15분 후 토큰 만료 → 401 → 인터셉터가 자동 refresh → 재시도
   (이 과정은 완전 자동, 코드에서 신경 안 써도 됨)

5. 7일 후 refresh도 만료 → /login 리다이렉트
```

---

## 하지 말 것

1. **`client` 대신 `fetch`나 새 axios 인스턴스 쓰지 마라** — 토큰 관리가 안 된다
2. **access token을 localStorage에 저장하지 마라** — XSS 취약. 메모리에만 있어야 한다
3. **refresh token을 직접 다루지 마라** — 쿠키로 자동 관리된다
4. **`src/api/client.ts` 직접 수정하지 마라** — 인터셉터 로직은 내가 관리한다

---

## 궁금한 거

`src/api/`, `src/contexts/AuthContext.tsx` 코드를 보면 답이 있을 수도 있다.
구현 관련 질문은 김우진한테.
