export interface LegacyMember {
  id: string
  name: string
  generation: number
  role?: 'lead'
  department: string
  bio: string
  focus: string
  message: string
  achievements: string[]
}

export const legacyMembers: LegacyMember[] = [
  // ━━━ 13기 ━━━
  // 파트장 맨 위
  {
    id: 'linus-torvalds',
    name: '리누스 토르발즈',
    generation: 13,
    role: 'lead',
    department: 'Linux Foundation',
    bio: '취미로 OS를 만들었습니다. 그냥 재미로.',
    focus: 'Linux · Git',
    message: 'Talk is cheap. Show me the code.',
    achievements: ['Linux 커널 개발', 'Git 버전 관리 시스템 개발'],
  },
  {
    id: 'grace-hopper',
    name: '그레이스 호퍼',
    generation: 13,
    department: 'US Navy',
    bio: '최초의 컴파일러를 만들고, 버그라는 단어를 남겼습니다',
    focus: '컴파일러 · COBOL',
    message: '가장 위험한 말은 "우리는 항상 이렇게 해왔다"입니다.',
    achievements: ['최초의 컴파일러 개발', 'COBOL 언어 설계 기여', '컴퓨터 버그 용어 유래'],
  },
  {
    id: 'james-gosling',
    name: '제임스 고슬링',
    generation: 13,
    department: 'Sun Microsystems',
    bio: 'Write Once, Run Anywhere를 믿었습니다',
    focus: 'Java · JVM',
    message: '좋은 프로그래밍 언어는 프로그래머가 생각하는 방식을 바꿉니다.',
    achievements: ['Java 프로그래밍 언어 설계', 'JVM 아키텍처 설계'],
  },
  {
    id: 'tim-berners-lee',
    name: '팀 버너스리',
    generation: 13,
    department: 'CERN · W3C',
    bio: '논문 공유하려고 웹을 발명했습니다',
    focus: 'HTTP · HTML',
    message: '웹은 모든 사람을 위한 것입니다.',
    achievements: ['월드 와이드 웹 발명', 'HTTP 프로토콜 설계', 'HTML 개발'],
  },
  {
    id: 'donald-knuth',
    name: '도널드 커누스',
    generation: 13,
    department: 'Stanford University',
    bio: 'The Art of Computer Programming을 아직도 쓰고 있습니다',
    focus: '알고리즘 · TeX',
    message: '미성숙한 최적화는 프로그래밍에서 모든 악의 근원입니다.',
    achievements: ['The Art of Computer Programming 저술', 'TeX 조판 시스템 개발'],
  },
  {
    id: 'margaret-hamilton',
    name: '마거릿 해밀턴',
    generation: 13,
    department: 'MIT · NASA',
    bio: '아폴로 11호 소프트웨어를 손으로 짰습니다',
    focus: '소프트웨어 공학',
    message: '소프트웨어 공학이라는 말을 쓰기 시작한 건, 이것도 공학이라는 걸 인정받기 위해서였습니다.',
    achievements: ['아폴로 11호 온보드 소프트웨어 개발', '소프트웨어 공학 용어 창시'],
  },

  // ━━━ 12기 ━━━
  // 파트장 맨 위
  {
    id: 'alan-turing',
    name: '앨런 튜링',
    generation: 12,
    role: 'lead',
    department: 'University of Cambridge',
    bio: '기계가 생각할 수 있는지 묻다가 컴퓨터를 만들었습니다',
    focus: '계산 이론 · 암호학',
    message: '때때로 아무도 상상하지 못한 것을 상상하는 사람이 있어야 합니다.',
    achievements: ['튜링 머신 개념 정립', '에니그마 암호 해독', '튜링 테스트 제안'],
  },
  {
    id: 'ada-lovelace',
    name: '에이다 러브레이스',
    generation: 12,
    department: 'Charles Babbage 연구실',
    bio: '세계 최초의 프로그래머. 기계가 음악을 작곡할 수 있다고 예견했습니다',
    focus: '알고리즘 · 수학',
    message: '분석 기관은 어떤 것도 창조하지 않습니다. 우리가 명령하는 것을 수행할 뿐입니다.',
    achievements: ['최초의 컴퓨터 프로그램 작성', '범용 컴퓨팅 개념 예견'],
  },
  {
    id: 'dennis-ritchie',
    name: '데니스 리치',
    generation: 12,
    department: 'Bell Labs',
    bio: 'C 언어와 Unix를 만들고 조용히 떠났습니다',
    focus: 'C · Unix',
    message: 'Unix는 단순합니다. 단순함을 이해하려면 천재가 되어야 할 뿐.',
    achievements: ['C 프로그래밍 언어 개발', 'Unix 운영체제 공동 개발'],
  },
  {
    id: 'john-von-neumann',
    name: '존 폰 노이만',
    generation: 12,
    department: 'Princeton IAS',
    bio: '프로그램을 메모리에 저장한다는 아이디어 하나로 컴퓨터 구조를 바꿨습니다',
    focus: '컴퓨터 아키텍처',
    message: '수학에서는 이해하는 것이 아닙니다. 익숙해지는 것입니다.',
    achievements: ['폰 노이만 아키텍처 설계', '게임 이론 정립', '양자역학 수학적 기초'],
  },
  {
    id: 'ken-thompson',
    name: '켄 톰슨',
    generation: 12,
    department: 'Bell Labs · Google',
    bio: 'Unix와 Go를 만든 사람. 간결함을 추구합니다',
    focus: 'Unix · Go',
    message: '의심스러우면 무차별 대입을 사용하라.',
    achievements: ['Unix 운영체제 공동 개발', 'Go 프로그래밍 언어 공동 설계', 'UTF-8 공동 설계'],
  },
  {
    id: 'larry-wall',
    name: '래리 월',
    generation: 12,
    department: 'Perl Foundation',
    bio: '게으름은 프로그래머의 미덕이라 했습니다',
    focus: 'Perl · 언어 설계',
    message: '프로그래머의 세 가지 미덕: 게으름, 조급함, 자만심.',
    achievements: ['Perl 프로그래밍 언어 개발'],
  },
]

export function findLegacyMember(id: string): LegacyMember | undefined {
  return legacyMembers.find((m) => m.id === id)
}
