import client from './client'
import type {
  TeamSummary,
  TeamDetail,
  TechStack,
  TechStackCategory,
  CreateTeamRequest,
  CreateTeamResponse,
} from '../types/profile'

export function getTeams(generationNumber?: number): Promise<TeamSummary[]> {
  return client
    .get<TeamSummary[]>('/api/profile/teams', {
      params: generationNumber != null ? { generationNumber } : undefined,
    })
    .then((r) => r.data)
}

export function getTeam(teamId: number): Promise<TeamDetail> {
  return client.get<TeamDetail>(`/api/profile/teams/${teamId}`).then((r) => r.data)
}

export function createTeam(req: CreateTeamRequest): Promise<CreateTeamResponse> {
  return client.post<CreateTeamResponse>('/api/profile/teams', req).then((r) => r.data)
}

export function getTechStacks(category?: TechStackCategory): Promise<{ techStacks: TechStack[] }> {
  return client
    .get<{ techStacks: TechStack[] }>('/api/profile/tech-stacks', {
      params: category ? { category } : undefined,
    })
    .then((r) => r.data)
}
