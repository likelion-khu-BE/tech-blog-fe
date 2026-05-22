import type { Post, SessionItem, NoteItem, ResourceItem, RetroItem } from '../types/session'

export const posts: Post[] = [
  {
    id: 0,
    type: 'hackathon',
    title: '24시간 해커톤 후기 — 우리가 만든 AI 식단 관리 앱',
    author: '김지현',
    initial: '김지',
    color: '',
    date: '2025년 5월 18일',
    excerpt:
      '지난 주말, 팀원 4명이 모여 24시간 동안 사진 찍고 개발했습니다. 처음엔 막막했지만 역할을 나누고 나니 생각보다 빠르게 진행되었어요. 새벽 3시에 API 연동이 안 돼서 절망하던 순간, 결국 CORS 문제였다는 걸 깨달았을 때의 허탈함이...',
    tags: ['Spring Boot', 'React', 'GPT API'],
    likes: 12,
    commentCount: 5,
    hasThumb: true,
    thumbGradient: 'from-[#2E1E0A] to-[#3D2810]',
    thumbAccent: '#FB923C',
    body: `<p>지난 주말, 팀원 4명이 모여 24시간 동안 사진 찍고 개발했습니다. 솔직히 처음엔 이게 가능한 건가 싶었는데, 맡은 시간이 어떻게 지나가는지 모를 정도였어요.</p>
<h3>우리가 만든 것</h3>
<p>AI가 등장하고 식재료 사진을 분석해서 건강한 식단을 추천해주는 앱이었습니다. Spring Boot로 백엔드를 짜고 GPT API를 연동해서 식재료 분석을 처리했어요.</p>
<h3>가장 힘들었던 순간</h3>
<blockquote>새벽 3시에 프론트엔드에서 API 호출이 계속 실패하는데, 결국 CORS 설정 문제였습니다. 2시간을 날렸어요. 그래도 해결했을 때의 쾌감은 이루 말할 수 없었어요.</blockquote>
<p>결론적으로 우리 팀의 아이디어 부문에서 2위를 했습니다. 완성도가 조금 아쉬웠지만 처음 해커톤치고는 꽤 잘 만들었다고 생각해요. 다음엔 꼭 우승하겠습니다!</p>
<h3>배운 것들</h3>
<ul><li>역할 분리가 명확하지 않으면 전체가 망한다</li><li>MVP 먼저, 욕심은 나중에</li><li>CORS는 항상 의심해라</li></ul>`,
    comments: [
      { author: '박서윤', initial: '박서', color: 'bg-[#0F2E1A] text-[#4ADE80]', date: '5월 18일', text: '고생하셨어요! 새벽 3시 CORS 저도 당해본 적 있어요 ㅠㅠ' },
      { author: '이민준', initial: '이민', color: 'bg-[#2D1F5E] text-[#A78BFA]', date: '5월 19일', text: '2위도 대단한 거예요! 다음 해커톤도 같이 가요' },
      { author: '최현우', initial: '최현', color: 'bg-[#2E0F0F] text-[#F87171]', date: '5월 19일', text: '저도 다음엔 참가하고 싶어요. 어떻게 신청하나요?' },
    ],
  },
  {
    id: 1,
    type: 'project',
    title: '팀 D 프로젝트 중간 회고 — 설계가 얼마나 중요한지 깨달았다',
    author: '박서윤',
    initial: '박서',
    color: 'bg-[#0F2E1A] text-[#4ADE80]',
    date: '2025년 5월 10일',
    excerpt:
      '3주 차에 접어들면서 이기서 초기에 대충 짠 DB 스키마 때문에 고생하고 있습니다. Event와 Session의 관계를 처음부터 명확하게 정의했어야 하는데, 지금은 마이그레이션이 너무 어렵습니다. 그래도 팀원들이랑 같이 해결해나가는 과정이 성장이라고 생각해요.',
    tags: ['DB 설계', 'JPA', '회고'],
    likes: 19,
    commentCount: 8,
    hasThumb: false,
    thumbGradient: '',
    thumbAccent: '',
    body: `<p>팀 D 프로젝트를 시작한 지 3주가 지났습니다. 중간 회고를 남겨보려고 합니다.</p>
<h3>잘 되고 있는 것들</h3>
<ul><li>매주 목요일 세션 참여율 100%</li><li>PR 리뷰를 서로 꼼꼼하게 해주고 있음</li><li>세션 노트를 꾸준히 기록하고 있음</li></ul>
<h3>아쉬운 것들</h3>
<blockquote>처음에 Event-Session 관계를 단순하게 설계했는데, 이제 보니 SessionNote까지 붙이면서 테이블 구조가 복잡해졌어요. 초기 설계에 더 시간을 썼어야 했습니다.</blockquote>
<p>그래도 팀원들이 다들 이성히 해줘서 분위기는 정말 좋습니다. 기술적으로 힘든 시간에도 서로 도와가며 해결하고 있어요.</p>`,
    comments: [
      { author: '김지현', initial: '김지', color: '', date: '5월 10일', text: '공감해요. ERD를 더 오래 들여다봤어야 했는데 ㅠ' },
      { author: '이민준', initial: '이민', color: 'bg-[#2D1F5E] text-[#A78BFA]', date: '5월 11일', text: '그래도 지금이라도 알았으니 다음엔 더 잘할 수 있겠죠!' },
    ],
  },
  {
    id: 2,
    type: 'workshop',
    title: '코드 리뷰 워크샵 후기 — 내 코드의 문제점을 이제서야 알았다',
    author: '이민준',
    initial: '이민',
    color: 'bg-[#2D1F5E] text-[#A78BFA]',
    date: '2025년 4월 26일',
    excerpt:
      '선배님이 진행해주신 코드 리뷰 워크샵이었는데, 내가 당연하다고 생각하던 코드 습관들이 얼마나 잘못된 건지 깨달았습니다. 특히 Service 레이어에 비즈니스 로직을 넣어야 한다는 걸 머리로는 알았지만 실제로 내 코드엔 Controller에 다 몰려 있었어요.',
    tags: ['코드 리뷰', '클린 코드', '레이어 설계'],
    likes: 9,
    commentCount: 6,
    hasThumb: true,
    thumbGradient: 'from-[#1A1040] to-[#2D1F5E]',
    thumbAccent: '#A78BFA',
    body: `<p>선배님이 직접 우리 코드를 보면서 피드백해주셨던 워크샵이었습니다. 솔직히 PR 올리기 전에 심청 긴장했어요.</p>
<h3>받은 피드백 중 가장 기억에 남는 것</h3>
<blockquote>"Service 레이어가 왜 이렇게 얇아요? 비즈니스 로직이 Controller에 다 몰려 있잖아요."</blockquote>
<p>이 말 들었을 때 얼굴이 빨개졌습니다. 이론으로는 알고 있었는데 정말 내 코드를 보니... 완전히 틀려 있었어요.</p>
<h3>앞으로 고칠 것들</h3>
<ul><li>Controller는 요청/응답만 처리</li><li>Service에 핵심 비즈니스 로직 모으기</li><li>메서드 하나는 한 가지 일만</li></ul>`,
    comments: [
      { author: '박서윤', initial: '박서', color: 'bg-[#0F2E1A] text-[#4ADE80]', date: '4월 26일', text: '저도 같은 피드백 받았어요 ㅋㅋㅋ 같이 고쳐내요' },
    ],
  },
  {
    id: 3,
    type: 'ideathon',
    title: '첫 아이디어톤 — 졌지만 얻은 게 더 많다',
    author: '최현우',
    initial: '최현',
    color: 'bg-[#2E0F0F] text-[#F87171]',
    date: '2025년 4월 12일',
    excerpt:
      '사용자 문제 정의부터 시작해서 아이디어를 발전 시켜 최종 발표까지 했습니다. 우리 팀은 캠퍼스 내 빈 강의실 실시간 확인 서비스를 제안했는데, 아이디어 자체는 좋다는 평가를 받았지만 구체성이 부족했어요.',
    tags: ['아이디어', '기획', '발표'],
    likes: 7,
    commentCount: 3,
    hasThumb: false,
    thumbGradient: '',
    thumbAccent: '',
    body: `<p>정말 처음 아이디어톤이었습니다. 개발보다 기획에 이렇게 오래 고민한 건 처음이에요.</p>
<h3>우리 팀 아이디어</h3>
<p>캠퍼스 내 빈 강의실 실시간 확인 서비스. 학교 포털 API를 크롤링해서 강의실 사용 현황을 실시간으로 보여주는 앱이었어요.</p>
<blockquote>심사위원 피드백: "아이디어는 좋은데 구체적인 수익 모델이 없고, 학교 측 협력 없이 크롤링만으로는 지속 가능성이 낮다"</blockquote>
<p>네, 맞는 말이었습니다. 다음엔 실행 가능성까지 고민해야겠어요.</p>`,
    comments: [
      { author: '김지현', initial: '김지', color: '', date: '4월 12일', text: '아이디어 진짜 좋았어요! 다음엔 같이 팀해요' },
    ],
  },
  {
    id: 4,
    type: 'meetup',
    title: '14기 OT 후기 — 처음 만난 날을 기록해 두렵니다',
    author: '김지현',
    initial: '김지',
    color: '',
    date: '2025년 3월 28일',
    excerpt:
      '드디어 14기가 시작됐습니다! 12명이 모여서 서로 자기소개를 하고 앞으로의 계획을 공유했어요. 모두 배경은 다르지만 개발을 좋아한다는 공통점이 있어서 금방 친해질 것 같았습니다. 첫 세션까지 2주 남았는데 벌써 설렌다.',
    tags: ['OT', '14기', '시작'],
    likes: 22,
    commentCount: 11,
    hasThumb: true,
    thumbGradient: 'from-[#0F1E2E] to-[#1A3050]',
    thumbAccent: '#60A5FA',
    body: `<p>드디어 14기가 시작됐습니다. 12명 모두 처음 만나는 자리라 어색할 줄 알았는데, 생각보다 분위기가 화기애애했어요.</p>
<h3>오늘 한 것들</h3>
<ul><li>자기소개 (각자 개발을 시작하게 된 계기 공유)</li><li>이번 기의 목표 설정 </li><li>팀 규칙 정하기 (지각 시 커피 사기 등 ㅋㅋ)</li><li>첫 세션 주제 결정 → Spring Boot 환경 세팅</li></ul>
<blockquote>인상 깊은 건, 다들 동기가 비슷하다는 거였어요. "제대로 된 백엔드를 만들어보고 싶다"는 말이 여기서 기름을 탔습니다.</blockquote>
<p>앞으로 9주 동안 잘 부탁드립니다, 14기 여러분!</p>`,
    comments: [
      { author: '박서윤', initial: '박서', color: 'bg-[#0F2E1A] text-[#4ADE80]', date: '3월 28일', text: '저도 너무 설레요! 잘 부탁드립니다 :)' },
      { author: '이민준', initial: '이민', color: 'bg-[#2D1F5E] text-[#A78BFA]', date: '3월 28일', text: '커피 사기 규칙... 벌써 걱정됩니다 ㅋㅋ' },
      { author: '최현우', initial: '최현', color: 'bg-[#2E0F0F] text-[#F87171]', date: '3월 29일', text: '정말 좋은 팀 만난 것 같아서 기대돼요!' },
    ],
  },
]

export const sessions: SessionItem[] = [
  { id: 1, weekLabel: 'W1-1', title: 'Spring Boot 환경 세팅 & 프로젝트 구조', speakers: [{ id: 13, name: '최현우', role: '발표자' }], status: 'DONE', rating: 4.6, noteCount: 5, resourceCount: 3 },
  { id: 2, weekLabel: 'W1-2', title: 'Git & GitHub 협업 워크플로우', speakers: [{ id: 14, name: '김다은', role: '발표자' }], status: 'DONE', rating: 4.4, noteCount: 3, resourceCount: 2 },
  { id: 3, weekLabel: 'W2-1', title: 'JPA 연관관계와 N+1 문제', speakers: [{ id: 12, name: '이민준', role: '발표자' }], status: 'DONE', rating: 4.3, noteCount: 4, resourceCount: 3 },
  { id: 4, weekLabel: 'W2-2', title: 'QueryDSL 실전 활용', speakers: [{ id: 13, name: '최현우', role: '발표자' }], status: 'DONE', rating: 4.5, noteCount: 2, resourceCount: 2 },
  { id: 5, weekLabel: 'W3-1', title: '트랜잭션 격리 수준과 Lock 전략', speakers: [{ id: 10, name: '김지현', role: '발표자' }], status: 'DONE', rating: 4.2, noteCount: 3, resourceCount: 2 },
  { id: 6, weekLabel: 'W3-2', title: 'Optimistic Lock vs Pessimistic Lock 실습', speakers: [{ id: 11, name: '박서윤', role: '발표자' }], status: 'DONE', rating: 4.8, noteCount: 4, resourceCount: 2 },
  { id: 7, weekLabel: 'W3-3', title: '@Transactional 전파 레벨 딥다이브', speakers: [{ id: 12, name: '이민준', role: '발표자' }], status: 'DONE', rating: 4.0, noteCount: 1, resourceCount: 1 },
]

export const notes: NoteItem[] = [
  {
    id: 1,
    author: { id: 10, name: '김지현', initial: '김지' },
    body: 'SERIALIZABLE 격리 수준은 성능 오버헤드가 크므로 보통 READ COMMITTED를 기본으로 사용하고, 필요한 구간에만 Lock을 거는 방식이 현실적. Phantom Read를 방지하려면 Range Lock이 필요한데 MySQL InnoDB는 Next-Key Lock으로 이를 구현함.',
    links: [
      { label: 'MySQL 공식 문서', url: 'https://dev.mysql.com/doc/', order: 0 },
      { label: 'Baeldung — Transaction Isolation', url: 'https://www.baeldung.com/transaction-isolation-levels-jdbc', order: 1 },
    ],
    createdAt: '2025-05-15T09:30:00Z',
  },
  {
    id: 2,
    author: { id: 11, name: '박서윤', initial: '박서' },
    body: '낙관적 잠금은 충돌이 드물 때 유리하고, 비관적 잠금은 충돌이 잦을 때 유리함. @Version 어노테이션 필드로 JPA에서 낙관적 잠금을 쉽게 구현할 수 있음.',
    links: [
      { label: 'JPA Lock Mode Docs', url: 'https://jakarta.ee/specifications/persistence/3.1/', order: 0 },
    ],
    createdAt: '2025-05-15T09:45:00Z',
  },
]

export const resources: ResourceItem[] = [
  { id: 1, type: 'SLIDE', name: '3주차_트랜잭션_정리.pdf', uploader: { id: 10, name: '김지현', initial: '김지' }, sizeLabel: '2.4 MB', url: '' },
  { id: 2, type: 'CODE', name: 'lock-practice.zip', uploader: { id: 11, name: '박서윤', initial: '박서' }, sizeLabel: '84 KB', url: '' },
  { id: 3, type: 'LINK', name: 'Baeldung — @Transactional 가이드', uploader: { id: 12, name: '이민준', initial: '이민' }, url: 'https://www.baeldung.com/transaction-configuration-with-jpa-and-spring' },
  { id: 4, type: 'SLIDE', name: '전파레벨_요약.pdf', uploader: { id: 12, name: '이민준', initial: '이민' }, sizeLabel: '1.1 MB', url: '' },
  { id: 5, type: 'DOCUMENT', name: '데드락_케이스_분석.docx', uploader: { id: 10, name: '김지현', initial: '김지' }, sizeLabel: '340 KB', url: '' },
  { id: 6, type: 'SLIDE', name: '2주차_JPA_연관관계.pdf', uploader: { id: 13, name: '최현우', initial: '최현' }, sizeLabel: '3.1 MB', url: '' },
  { id: 7, type: 'LINK', name: 'Hibernate FetchType 완벽 정리', uploader: { id: 14, name: '김다은', initial: '김다' }, url: 'https://www.baeldung.com/hibernate-fetchtype' },
]

export const retros: RetroItem[] = [
  { id: 1, author: { id: 10, name: '김지현', initial: '김지' }, rating: 5, body: '트랜잭션 격리 수준을 이론으로만 알고 있었는데 직접 코드로 실습하니 훨씬 와닿았습니다. 특히 Phantom Read 예시가 인상 깊었어요.' },
  { id: 2, author: { id: 11, name: '박서윤', initial: '박서' }, rating: 4, body: '낙관적 잠금 구현이 생각보다 간단해서 놀랐어요. 다음엔 분산 환경에서의 Lock 전략도 다뤄주시면 좋겠습니다.' },
  { id: 3, author: { id: 12, name: '이민준', initial: '이민' }, rating: 4, body: '전파 레벨 부분이 조금 어려웠지만 실제 코드 덕분에 이해됐습니다. 슬라이드 공유 감사합니다!' },
]

export const ratingData = [
  { label: 'W1 Spring 환경세팅', value: 4.6 },
  { label: 'W2 JPA 연관관계', value: 4.3 },
  { label: 'W3 트랜잭션 격리', value: 4.2 },
  { label: 'W3 Optimistic Lock', value: 4.8 },
  { label: 'W3 전파 레벨', value: 4.0 },
]

export const uploadData = [
  { label: 'W1', count: 4 },
  { label: 'W2', count: 7 },
  { label: 'W3', count: 5 },
]

export const keywords = [
  '5단계 상태 머신', 'JSONB 컬럼 설계', 'S3 Presigned URL',
  'Full-Text Search', 'GIN 인덱스', 'N+1 해결', 'Docker + CI/CD',
  'k6 부하 테스트', '@Transactional 전파',
]
