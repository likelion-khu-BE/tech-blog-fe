// 아티클 더미 데이터 — 실제 백엔드 API 연동 전까지 사용
// authorId는 members.ts의 Member.id와 매칭
export interface Article {
  slug: string
  title: string
  summary: string
  authorId: string
  date: string
  category: string
  tags: string[]
  readingTime: number
  thumbnail?: string
}

export const categories = ['전체', '백엔드', '프론트엔드', 'AI'] as const

export const articles: Article[] = [
  {
    slug: 'spring-security-jwt-architecture',
    title: 'Spring Security의 인증 흐름을 파헤치며',
    summary: 'SecurityFilterChain이 요청을 처리하는 과정을 직접 디버깅하며 정리했습니다. UsernamePasswordAuthenticationFilter부터 SecurityContext까지, 내부 동작을 하나씩 따라가 봅니다. 공식 문서만으로는 이해하기 어려웠던 부분을 시퀀스 다이어그램과 함께 설명합니다.',
    authorId: 'yebin-kim',
    date: '2026-03-20',
    category: '백엔드',
    tags: ['Spring Security', 'JWT'],
    readingTime: 12,
    thumbnail: '/images/spring-security-flow.svg',
  },
  {
    slug: 'jpa-n-plus-one',
    title: 'N+1 쿼리, 왜 생기고 어떻게 잡는가',
    summary: '글 목록 API에서 쿼리가 40개 넘게 나가는 걸 보고 원인을 추적한 기록. fetch join, EntityGraph, BatchSize 각각의 트레이드오프를 비교합니다. 실제 실행 쿼리 로그와 함께.',
    authorId: 'hyuna-park',
    date: '2026-03-14',
    category: '백엔드',
    tags: ['JPA', 'QueryDSL'],
    readingTime: 8,
  },
  {
    slug: 'github-actions-cicd',
    title: 'GitHub Actions CI/CD — 자동화 파이프라인 구성 과정',
    summary: 'PR을 올리면 테스트가 자동으로 돌고, main에 머지하면 서버에 배포되는 파이프라인을 처음부터 만들어본 기록. workflow 파일 작성부터 시크릿 관리, 캐싱 전략까지.',
    authorId: 'sunwoo-shin',
    date: '2026-03-05',
    category: '백엔드',
    tags: ['GitHub Actions', 'Docker'],
    readingTime: 10,
    thumbnail: '/images/cicd-pipeline.svg',
  },
  {
    slug: 'rest-api-design-decisions',
    title: 'REST API 설계에서 실제로 고민했던 것들',
    summary: 'URI 네이밍, 상태코드 선택, 페이지네이션 방식 — 정답이 없는 선택지에서 우리가 내린 결정과 그 이유를 정리합니다. 팀 내 코드리뷰에서 나온 논의를 바탕으로.',
    authorId: 'juyeon-kim',
    date: '2026-02-20',
    category: '백엔드',
    tags: ['REST API', 'Spring Boot'],
    readingTime: 7,
  },
  {
    slug: 'oauth2-flow-implementation',
    title: 'GitHub OAuth 로그인, 직접 구현해보니',
    summary: 'Authorization Code Grant 플로우를 따라가며 토큰 교환, 사용자 정보 조회, 세션 관리까지 구현한 과정. 라이브러리 없이 HTTP 요청부터 직접 보내며 프로토콜을 이해했습니다.',
    authorId: 'yejin-han',
    date: '2026-02-03',
    category: '백엔드',
    tags: ['OAuth2', 'Spring Security'],
    readingTime: 15,
    thumbnail: '/images/oauth2-flow.svg',
  },
  {
    slug: 'docker-compose-dev-environment',
    title: 'docker-compose로 로컬 개발 환경 통일하기',
    summary: '"제 컴퓨터에서는 되는데요"를 없애기 위해 MySQL, Redis, 애플리케이션을 컨테이너로 묶은 과정. Dockerfile 최적화와 볼륨 마운트 삽질기 포함.',
    authorId: 'sein-park',
    date: '2026-01-15',
    category: '백엔드',
    tags: ['Docker', 'Docker Compose'],
    readingTime: 6,
  },
  {
    slug: 'transaction-isolation-level',
    title: '트랜잭션 격리 수준, 직접 깨보며 이해하기',
    summary: 'Dirty Read, Phantom Read가 실제로 어떻게 발생하는지 테스트 코드로 재현하고, 각 격리 수준의 차이를 체감한 기록. 터미널 두 개 열어놓고 실험한 스크린샷과 함께.',
    authorId: 'sunjae-yoon',
    date: '2025-12-10',
    category: '백엔드',
    tags: ['MySQL', 'Transaction'],
    readingTime: 9,
    thumbnail: '/images/isolation-level.svg',
  },
  {
    slug: 'layered-architecture-why',
    title: '왜 레이어드 아키텍처인가 — Controller, Service, Repository',
    summary: '처음엔 왜 나누는지 몰랐다. 코드가 500줄이 넘어가면서 비로소 이해한 관심사 분리 이야기. 한 파일에 다 넣었던 코드를 리팩토링하며 느낀 점.',
    authorId: 'geunyeop-im',
    date: '2025-11-02',
    category: '백엔드',
    tags: ['Spring Boot', 'Architecture'],
    readingTime: 5,
  },
]
