export type SessionType = 'backend' | 'frontend' | 'design' | 'ai' | 'pm' | 'etc'
export type RoleInTeam = 'backend' | 'frontend' | 'design' | 'ai' | 'pm' | 'infra' | 'etc'
export type TechStackCategory = 'language' | 'framework' | 'ai' | 'design' | 'tool' | 'infra' | 'etc'
export type GenerationRole = 'member' | 'operating'

export interface TechStack {
  id: number
  name: string
  category: TechStackCategory
  logoUrl: string | null
}

// 기술 스택 등록/수정 요청 (§3-2, §3-3) — name/category/logoUrl 전체 교체
export interface CreateTechStackRequest {
  name: string
  category: TechStackCategory
  logoUrl?: string | null
}

export interface MemberTechStack {
  techStackId: number
  name: string
  category: TechStackCategory
  logoUrl: string | null
  proficiency: number | null
}

export interface MemberSummary {
  id: number
  name: string
  department: string | null
  sessionType: SessionType
  profileImageUrl: string | null
  intro: string | null
}

export interface MemberDetail {
  id: number
  name: string
  department: string | null
  sessionType: SessionType
  profileImageUrl: string | null
  githubUrl: string | null
  displayedEmail: string | null
  intro: string | null
  linksJson: string | null
  techStacks: MemberTechStack[]
  generations: { generationNumber?: number; number?: number; roleInGen: GenerationRole }[]
  createdAt: string
  updatedAt?: string
}

export interface UpdateMemberRequest {
  name: string
  department?: string | null
  sessionType: SessionType
  profileImageUrl?: string | null
  githubUrl?: string | null
  displayedEmail?: string | null
  intro?: string | null
  linksJson?: string | null
}

export interface MyTeam {
  id: number
  name: string
  description: string | null
  generation: { number: number } | null
  techStacks: TechStack[]
  isLead: boolean
  roles: RoleInTeam[]
  thumbUrl: string | null
}

export interface Generation {
  number: number
  startDate: string
  endDate: string | null
  isCurrent: boolean
}

export interface GenerationMember {
  memberId: number
  name: string
  sessionType: SessionType
  profileImageUrl: string | null
  roleInGen: GenerationRole
  joinedAt: string
}

export interface CreateGenerationRequest {
  number: number
  startDate: string
  endDate?: string | null
  isCurrent?: boolean
}

export interface TeamMember {
  memberId: number
  name: string
  sessionType: SessionType
  profileImageUrl: string | null
  isLead: boolean
  roles: RoleInTeam[]
}

export interface TeamSummary {
  id: number
  name: string
  description: string | null
  generation: { number: number } | null
  techStacks: TechStack[]
  memberCount: number
  thumbUrl: string | null
}

export interface TeamDetail {
  id: number
  name: string
  description: string | null
  projectUrl: string | null
  githubUrl: string | null
  generation: { number: number } | null
  techStacks: TechStack[]
  imageUrls: string[]
  members: TeamMember[]
  inviteCode: string | null
  inviteCodeExpiresAt: string | null
  updatedAt: string
}

export interface CreateTeamRequest {
  name: string
  description?: string | null
  projectUrl?: string | null
  githubUrl?: string | null
  generationNumber?: number | null
  imageUrls?: string[] | null
  techStackIds?: number[] | null
}

export interface CreateTeamResponse {
  id: number
  inviteCode: string
  inviteCodeExpiresAt: string
}

export interface UpdateTeamRequest {
  name?: string
  description?: string | null
  projectUrl?: string | null
  githubUrl?: string | null
  generationNumber?: number | null
  imageUrls?: string[] | null
  techStackIds?: number[] | null
}

export interface InviteCodeResponse {
  inviteCode: string
  inviteCodeExpiresAt: string
}

export interface JoinTeamResponse {
  teamId: number
  teamName: string
}

export interface UpdateRolesResponse {
  memberId: number
  roles: RoleInTeam[]
}

export type ActivityType =
  | 'blog_post'
  | 'blog_comment'
  | 'blog_post_like'
  | 'blog_post_like_received'
  | 'qna_question'
  | 'qna_answer'
  | 'qna_accepted'
  | 'qna_answer_upvote'
  | 'qna_answer_downvote'
  | 'qna_comment'
  | 'session_speak'
  | 'session_event_post'
  | 'session_event_comment'
  | 'session_event_post_like'
  | 'session_event_post_like_received'

export type RankingPeriod = 'month' | 'year' | 'all'

export interface MemberStats {
  memberId: number
  blog: number
  qna: number
  session: number
}

export interface Activity {
  id: number
  type: ActivityType
  score: number
  createdAt: string
  link: string
}

export interface ActivityPage {
  content: Activity[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

export interface RankingMember {
  rank: number
  memberId: number
  name: string
  profileImageUrl: string | null
  totalScore: number
}

export interface RankingPage {
  content: RankingMember[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}
