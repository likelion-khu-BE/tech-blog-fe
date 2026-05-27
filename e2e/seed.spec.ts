/**
 * 수동 테스트용 시드 데이터 삽입.
 * playwright.config.ts 기본 실행에서 제외됨 (testIgnore).
 * 실행: npx playwright test e2e/seed.spec.ts --reporter=line
 * 크리덴셜 오버라이드: E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_MEMBER_EMAIL, E2E_MEMBER_PASSWORD
 */

import { test } from '@playwright/test'

const API = 'http://localhost:8080'

interface PostPayload {
  title: string
  content: string
  board: string
  category: string
  status: 'PUBLISHED' | 'DRAFT'
  tags: string[]
}

async function apiLogin(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  email: string,
  password: string,
): Promise<string> {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email, password },
  })
  if (!res.ok()) throw new Error(`Login failed (${res.status()}): ${await res.text()}`)
  const body = await res.json()
  if (!body?.accessToken) throw new Error('Login response missing accessToken')
  return body.accessToken as string
}

async function createPost(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  token: string,
  payload: PostPayload,
): Promise<void> {
  const res = await request.post(`${API}/api/blog/posts`, {
    data: payload,
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok()) throw new Error(`Create post failed (${res.status()}): ${await res.text()}`)
  const body = await res.json()
  console.log(`  [${payload.status}] ${payload.board} / ${payload.category} / "${payload.title}" → id=${body.id}`)
}

// ─── 게시글 목록 ────────────────────────────────────────────────

const ADMIN_POSTS: PostPayload[] = [
  {
    title: '[Admin] Spring Boot 자동 설정 원리 분석',
    content: '## Spring Boot Auto-configuration\n\n`@EnableAutoConfiguration`이 동작하는 방식을 직접 파고들었습니다.\n\n### 핵심 메커니즘\n- `spring.factories` / `AutoConfiguration.imports`\n- `@ConditionalOnClass`, `@ConditionalOnMissingBean` 조건 평가 순서\n- 커스텀 AutoConfiguration 직접 작성해보기',
    board: '백엔드',
    category: 'Spring Boot',
    status: 'PUBLISHED',
    tags: ['spring-boot', 'auto-config', 'internals'],
  },
  {
    title: '[Admin] JPA N+1 문제와 Fetch Join 전략',
    content: '## JPA N+1 문제\n\n엔티티 연관관계 조회 시 발생하는 N+1을 다양한 방법으로 해결해봤습니다.\n\n### 해결책 비교\n- `@EntityGraph`\n- `FETCH JOIN` JPQL\n- `BatchSize`\n- Querydsl projections',
    board: '백엔드',
    category: 'JPA',
    status: 'PUBLISHED',
    tags: ['jpa', 'n+1', 'fetch-join'],
  },
  {
    title: '[Admin] React 상태 관리 패턴 비교 (Zustand vs Context)',
    content: '## 상태 관리 라이브러리 선택 기준\n\n소규모 프로젝트부터 대규모까지 어떤 상태 관리를 선택해야 할지 비교했습니다.\n\n### 비교 항목\n- 보일러플레이트 양\n- 리렌더링 제어\n- DevTools 지원',
    board: '프론트엔드',
    category: 'React',
    status: 'PUBLISHED',
    tags: ['react', 'zustand', 'context-api'],
  },
  {
    title: '[Admin] TypeScript 고급 타입 체조 (Draft)',
    content: '## 타입 레벨 프로그래밍\n\n작성 중인 글입니다.\n\n- Conditional Types\n- Infer\n- Template Literal Types',
    board: '프론트엔드',
    category: 'TypeScript',
    status: 'DRAFT',
    tags: ['typescript', 'generics', 'type-level'],
  },
  {
    title: '[Admin] MLOps 파이프라인 설계와 구현',
    content: '## MLOps란\n\n모델 개발부터 배포, 모니터링까지 전 과정을 자동화하는 파이프라인을 구축했습니다.\n\n### 구성 요소\n- 데이터 버전 관리 (DVC)\n- 실험 추적 (MLflow)\n- 자동 재학습 트리거',
    board: 'AI/ML',
    category: 'Machine Learning',
    status: 'PUBLISHED',
    tags: ['mlops', 'mlflow', 'dvc'],
  },
  {
    title: '[Admin] LLM 파인튜닝 실전 가이드',
    content: '## LLM Fine-tuning\n\nLLaMA3 기반 모델을 LoRA로 파인튜닝한 경험을 정리합니다.\n\n### 주요 내용\n- QLoRA vs LoRA 트레이드오프\n- 데이터셋 포맷 (Alpaca / ChatML)\n- 학습 하이퍼파라미터 튜닝',
    board: 'AI/ML',
    category: 'LLM',
    status: 'PUBLISHED',
    tags: ['llm', 'lora', 'fine-tuning'],
  },
]

const MEMBER_POSTS: PostPayload[] = [
  {
    title: '[Member] Redis 캐시 전략과 Eviction 정책 정리',
    content: '## Redis 캐싱 전략\n\n서비스 환경에 맞는 캐시 전략을 선택하는 기준을 정리했습니다.\n\n### 전략 종류\n- Cache-Aside\n- Write-Through / Write-Behind\n- Eviction: LRU, LFU, TTL 설정',
    board: '백엔드',
    category: 'Redis',
    status: 'PUBLISHED',
    tags: ['redis', 'cache', 'eviction'],
  },
  {
    title: '[Member] Spring Security OAuth2 Resource Server 직접 구현',
    content: '## OAuth2 Resource Server\n\nJWT 기반 OAuth2 Resource Server를 Spring Security로 직접 구현해봤습니다.\n\n### 구현 포인트\n- `SecurityFilterChain` 커스터마이징\n- `JwtAuthenticationConverter`\n- 역할 기반 엔드포인트 접근 제어',
    board: '백엔드',
    category: 'Spring Security',
    status: 'PUBLISHED',
    tags: ['spring-security', 'oauth2', 'jwt'],
  },
  {
    title: '[Member] Next.js App Router 완전 정복',
    content: '## App Router vs Pages Router\n\nNext.js 13+ App Router의 핵심 개념을 정리합니다.\n\n### 핵심 개념\n- Server Component vs Client Component\n- Streaming & Suspense\n- Route Handlers, Server Actions',
    board: '프론트엔드',
    category: 'Next.js',
    status: 'PUBLISHED',
    tags: ['nextjs', 'app-router', 'rsc'],
  },
  {
    title: '[Member] Vue3 Composition API 마이그레이션 후기',
    content: '## Options API → Composition API\n\n실제 프로덕션 코드를 마이그레이션하면서 겪은 문제와 해결책을 공유합니다.\n\n### 주요 변경 사항\n- `setup()` 함수와 `<script setup>`\n- Composables로 로직 재사용\n- Pinia 상태 관리 도입',
    board: '프론트엔드',
    category: 'Vue.js',
    status: 'PUBLISHED',
    tags: ['vue3', 'composition-api', 'pinia'],
  },
  {
    title: '[Member] NLP 전처리 파이프라인 자동화 (Draft)',
    content: '## NLP 전처리\n\n작성 중입니다.\n\n- 토크나이징\n- 불용어 처리\n- 임베딩',
    board: 'AI/ML',
    category: 'NLP',
    status: 'DRAFT',
    tags: ['nlp', 'preprocessing', 'tokenizer'],
  },
  {
    title: '[Member] Python asyncio 비동기 프로그래밍 완벽 가이드',
    content: '## Python 비동기 프로그래밍\n\n`asyncio`를 활용해 I/O 바운드 작업을 효율적으로 처리하는 방법을 정리합니다.\n\n### 주요 개념\n- Event Loop 동작 원리\n- `async/await`, `gather`, `TaskGroup`\n- 실전 패턴: 병렬 HTTP 요청, 비동기 DB 쿼리',
    board: 'AI/ML',
    category: 'Python',
    status: 'PUBLISHED',
    tags: ['python', 'asyncio', 'concurrency'],
  },
]

// ─── 테스트 ──────────────────────────────────────────────────────

const ADMIN_EMAIL    = process.env.E2E_ADMIN_EMAIL    ?? 'admin_test@khu.ac.kr'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'password123'
const MEMBER_EMAIL   = process.env.E2E_MEMBER_EMAIL   ?? 'member_test@khu.ac.kr'
const MEMBER_PASSWORD = process.env.E2E_MEMBER_PASSWORD ?? 'password123'

test('어드민 계정 게시글 6개 삽입', async ({ request }) => {
  console.log(`\n[ADMIN] ${ADMIN_EMAIL} 로그인...`)
  const token = await apiLogin(request, ADMIN_EMAIL, ADMIN_PASSWORD)

  for (const post of ADMIN_POSTS) {
    await createPost(request, token, post)
  }
})

test('멤버 계정 게시글 6개 삽입', async ({ request }) => {
  console.log(`\n[MEMBER] ${MEMBER_EMAIL} 로그인...`)
  const token = await apiLogin(request, MEMBER_EMAIL, MEMBER_PASSWORD)

  for (const post of MEMBER_POSTS) {
    await createPost(request, token, post)
  }
})
