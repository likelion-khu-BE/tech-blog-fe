export type SessionType = 'backend' | 'frontend' | 'design' | 'ai' | 'pm' | 'etc'
export type RoleInTeam = 'backend' | 'frontend' | 'design' | 'ai' | 'pm' | 'infra' | 'etc'
export type TechStackCategory = 'language' | 'framework' | 'ai' | 'design' | 'tool' | 'infra' | 'etc'

export interface TechStack {
  id: number
  name: string
  category: TechStackCategory
  logoUrl: string | null
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
