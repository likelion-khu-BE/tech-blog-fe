# Session API 명세서

## 공통

| 항목 | 내용 |
|------|------|
| Base URL | `{VITE_API_BASE_URL}/api` |
| 인증 | `Authorization: Bearer {accessToken}` |
| Content-Type | `application/json` |
| 에러 포맷 | `{ "code": string, "message": string }` |

---

## 데이터 타입

```typescript
type SessionState = 'draft' | 'open' | 'progress' | 'done' | 'archive'
type ResourceKind  = 'SLIDE' | 'CODE' | 'LINK' | 'DOCUMENT'
```

---

## 1. 세션 (Session)

### 1-1. 세션 목록 조회

```
GET /cohorts/{cohortId}/sessions
```

| Query | Type | 설명 |
|-------|------|------|
| `week` | string | 필터 (예: `W1`) |
| `state` | SessionState | 필터 |

**Response 200**
```json
{
  "sessions": [
    {
      "id": 1,
      "week": "W1-1",
      "title": "Spring Boot 환경 세팅 & 프로젝트 구조",
      "content": "Spring Boot 프로젝트를 처음 생성하는 것부터 시작해...",
      "speaker": "최현우",
      "state": "done",
      "rating": 4.6,
      "noteCount": 5,
      "resourceCount": 3
    }
  ]
}
```

---

### 1-2. 세션 단건 조회

```
GET /cohorts/{cohortId}/sessions/{sessionId}
```

**Response 200**
```json
{
  "id": 1,
  "week": "W1-1",
  "title": "Spring Boot 환경 세팅 & 프로젝트 구조",
  "content": "...",
  "speaker": "최현우",
  "state": "done",
  "rating": 4.6,
  "noteCount": 5,
  "resourceCount": 3,
  "createdAt": "2025-03-28T10:00:00Z",
  "updatedAt": "2025-03-28T10:00:00Z"
}
```

---

### 1-3. 세션 생성

```
POST /cohorts/{cohortId}/sessions
```

**Request Body**
```json
{
  "week": "W1",
  "title": "세션 제목",
  "content": "세션 내용 / 아젠다",
  "speaker": "발표자 이름",
  "state": "draft"
}
```

**Response 201**
```json
{
  "id": 8,
  "week": "W1-3",
  "title": "세션 제목",
  "content": "세션 내용 / 아젠다",
  "speaker": "발표자 이름",
  "state": "draft",
  "rating": 0.0,
  "noteCount": 0,
  "resourceCount": 0,
  "createdAt": "2025-05-17T12:00:00Z",
  "updatedAt": "2025-05-17T12:00:00Z"
}
```

> `week` suffix (예: `W1-3`)는 서버에서 해당 week의 기존 세션 수를 기반으로 자동 부여합니다.

---

### 1-4. 세션 수정

```
PUT /cohorts/{cohortId}/sessions/{sessionId}
```

**Request Body** (변경 필드만 포함 가능)
```json
{
  "week": "W2",
  "title": "수정된 세션 제목",
  "content": "수정된 내용",
  "speaker": "수정된 발표자",
  "state": "open"
}
```

**Response 200** — 수정된 세션 객체 (1-2와 동일 구조)

---

### 1-5. 세션 삭제

```
DELETE /cohorts/{cohortId}/sessions/{sessionId}
```

**Response 204** No Content

---

## 2. 세션 노트 (Session Note)

### 2-1. 노트 목록 조회

```
GET /sessions/{sessionId}/notes
```

| Query | Type | 설명 |
|-------|------|------|
| `q` | string | 전문 검색 (topic, body) |

**Response 200**
```json
{
  "notes": [
    {
      "id": 1,
      "author": { "id": 10, "name": "김지현", "initial": "김지", "color": "" },
      "date": "2025-05-15",
      "topic": "트랜잭션 격리 수준과 Lock 전략",
      "body": "SERIALIZABLE 격리 수준은 성능 오버헤드가 크므로...",
      "code": "@Transactional(isolation = Isolation.READ_COMMITTED)\npublic void process() { ... }",
      "codeLang": "JAVA",
      "links": ["MySQL 공식 문서", "Baeldung — Transaction Isolation"],
      "createdAt": "2025-05-15T09:30:00Z"
    }
  ]
}
```

---

### 2-2. 노트 작성

```
POST /sessions/{sessionId}/notes
```

**Request Body**
```json
{
  "topic": "노트 주제",
  "body": "노트 본문 내용",
  "code": "// 코드 스니펫 (선택)",
  "codeLang": "JAVA",
  "links": ["참고 링크1", "참고 링크2"]
}
```

**Response 201** — 생성된 노트 객체 (2-1 배열 아이템과 동일 구조)

---

### 2-3. 노트 수정

```
PUT /sessions/{sessionId}/notes/{noteId}
```

**Request Body** — 2-2와 동일 구조

**Response 200** — 수정된 노트 객체

---

### 2-4. 노트 삭제

```
DELETE /sessions/{sessionId}/notes/{noteId}
```

**Response 204** No Content

---

## 3. 세션 자료 (Session Resource)

### 3-1. 자료 목록 조회

```
GET /sessions/{sessionId}/resources
```

| Query | Type | 설명 |
|-------|------|------|
| `kind` | ResourceKind | 필터 (`SLIDE`, `CODE`, `LINK`, `DOCUMENT`) |

**Response 200**
```json
{
  "resources": [
    {
      "id": 1,
      "kind": "SLIDE",
      "name": "3주차_트랜잭션_정리.pdf",
      "author": { "id": 10, "name": "김지현" },
      "meta": "W3 · 동시성과 트랜잭션",
      "size": "2.4 MB",
      "url": "https://...",
      "createdAt": "2025-05-15T09:00:00Z"
    }
  ]
}
```

---

### 3-2. 자료 업로드 (파일)

```
POST /sessions/{sessionId}/resources
Content-Type: multipart/form-data
```

| Field | Type | 설명 |
|-------|------|------|
| `file` | File | 업로드 파일 (이미지, PPT, PDF, ZIP, 코드 파일 등) |
| `kind` | ResourceKind | 자료 종류 |
| `name` | string | 표시 이름 (선택, 생략 시 파일명 사용) |
| `meta` | string | 부가 설명 (선택) |

**Response 201** — 생성된 자료 객체

---

### 3-3. 자료 등록 (링크)

```
POST /sessions/{sessionId}/resources
Content-Type: application/json
```

```json
{
  "kind": "LINK",
  "name": "Baeldung — @Transactional 가이드",
  "url": "https://www.baeldung.com/transaction-configuration-with-jpa-and-spring",
  "meta": "W3 · 동시성과 트랜잭션"
}
```

**Response 201** — 생성된 자료 객체

---

### 3-4. 자료 삭제

```
DELETE /sessions/{sessionId}/resources/{resourceId}
```

**Response 204** No Content

---

## 4. 세션 회고 (Session Retrospective)

### 4-1. 회고 목록 조회

```
GET /sessions/{sessionId}/retros
```

**Response 200**
```json
{
  "averageRating": 4.6,
  "retros": [
    {
      "id": 1,
      "author": { "id": 10, "name": "김지현", "initial": "김지", "color": "" },
      "rating": 5,
      "body": "트랜잭션 격리 수준을 이론으로만 알고 있었는데...",
      "createdAt": "2025-05-15T10:00:00Z"
    }
  ]
}
```

---

### 4-2. 회고 작성

```
POST /sessions/{sessionId}/retros
```

**Request Body**
```json
{
  "rating": 5,
  "body": "회고 내용"
}
```

> 1인 1회만 작성 가능. 이미 작성한 경우 `409 Conflict` 반환.

**Response 201** — 생성된 회고 객체

---

### 4-3. 회고 수정

```
PUT /sessions/{sessionId}/retros/{retroId}
```

**Request Body**
```json
{
  "rating": 4,
  "body": "수정된 회고 내용"
}
```

**Response 200** — 수정된 회고 객체

---

## 에러 코드

| HTTP | code | 설명 |
|------|------|------|
| 400 | `INVALID_REQUEST` | 필수 필드 누락 또는 유효하지 않은 값 |
| 401 | `UNAUTHORIZED` | 인증 토큰 없음 또는 만료 |
| 403 | `FORBIDDEN` | 해당 cohort 멤버가 아님 또는 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 중복 작성 (예: 회고 1인 1회 제한) |
| 500 | `SERVER_ERROR` | 서버 내부 오류 |
