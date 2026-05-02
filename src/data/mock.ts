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
  content?: string
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
    content: `## 왜 파헤치게 됐나

처음 Spring Security를 쓸 때는 그냥 의존성 추가하고, 설정 파일 복붙하고, "된다"는 걸 확인하고 넘어갔다. 그런데 JWT 토큰 검증 로직을 넣으려다 막혔다. \`OncePerRequestFilter\`를 어디에 끼워야 하는지, \`SecurityContextHolder\`에 언제 저장해야 하는지 감이 안 왔다.

결국 디버거를 들고 FilterChain을 직접 따라가기로 했다.

---

## FilterChain의 실제 흐름

HTTP 요청이 들어오면 Spring Security는 \`DelegatingFilterProxy\`를 통해 요청을 가로챈다. 이 proxy는 실제 처리를 \`FilterChainProxy\`에게 위임한다.

\`\`\`
HTTP Request
  → DelegatingFilterProxy
  → FilterChainProxy
  → SecurityFilterChain (여러 필터의 체인)
\`\`\`

\`SecurityFilterChain\`은 등록된 필터들을 순서대로 실행한다. 기본 설정 기준으로 15개 이상의 필터가 등록되는데, 그 중 핵심만 추리면:

| 순서 | 필터 | 역할 |
|------|------|------|
| 1 | \`SecurityContextPersistenceFilter\` | SecurityContext 복원/저장 |
| 6 | \`UsernamePasswordAuthenticationFilter\` | 폼 로그인 처리 |
| 11 | \`ExceptionTranslationFilter\` | 인증/인가 예외 처리 |
| 12 | \`FilterSecurityInterceptor\` | 접근 권한 최종 판단 |

---

## JWT 필터를 어디에 넣는가

커스텀 JWT 필터를 만들 때 위치가 중요하다. \`UsernamePasswordAuthenticationFilter\` **이전**에 넣어야 한다.

\`\`\`java
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .addFilterBefore(
                jwtAuthenticationFilter(),
                UsernamePasswordAuthenticationFilter.class
            );
        return http.build();
    }
}
\`\`\`

이유는 간단하다. JWT 필터가 먼저 토큰을 검증하고 \`SecurityContext\`에 인증 정보를 올려놓으면, 뒤따르는 \`FilterSecurityInterceptor\`가 이미 인증된 사용자로 판단하기 때문이다.

---

## SecurityContext에 인증 정보 저장

JWT 검증이 성공하면 아래처럼 \`SecurityContextHolder\`에 저장한다.

\`\`\`java
UsernamePasswordAuthenticationToken authentication =
    new UsernamePasswordAuthenticationToken(
        userDetails,
        null,
        userDetails.getAuthorities()
    );

SecurityContextHolder.getContext().setAuthentication(authentication);
\`\`\`

세 번째 인자(authorities)가 null이면 인증은 됐지만 권한이 없는 상태로 처리된다. \`@PreAuthorize\` 같은 어노테이션이 작동하려면 반드시 authorities를 넘겨줘야 한다.

---

## 삽질 포인트

**1. OncePerRequestFilter를 써야 하는 이유**

필터를 여러 번 타는 경우가 있다 (forward, include 등). \`OncePerRequestFilter\`는 요청당 한 번만 실행을 보장한다.

**2. SecurityContextHolder의 ThreadLocal**

기본 전략은 \`ThreadLocalSecurityContextHolderStrategy\`다. 즉, 같은 스레드 내에서만 컨텍스트를 공유한다. 비동기 처리할 때 다른 스레드로 넘기면 컨텍스트가 사라진다.

이 경우 \`@Async\` 메서드에 \`SecurityContextHolder.setStrategyName(MODE_INHERITABLETHREADLOCAL)\`을 설정하거나, \`DelegatingSecurityContextRunnable\`로 감싸야 한다.

---

## 정리

공식 문서가 어렵게 느껴졌던 건 "무엇"만 설명하고 "왜"와 "어떻게 흘러가는지"가 빠져있어서였다. 디버거로 직접 따라가보니 각 컴포넌트의 역할과 위치가 명확하게 보였다. 처음 Spring Security를 배운다면 한 번쯤 breakpoint 찍고 FilterChain을 따라가보는 걸 추천한다.
`,
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
