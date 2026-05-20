import client from './client'
import type {
  MemberSummary,
  MemberDetail,
  MemberTechStack,
  UpdateMemberRequest,
  MyTeam,
  Generation,
  GenerationMember,
  CreateGenerationRequest,
  GenerationRole,
  TeamSummary,
  TeamDetail,
  TechStack,
  TechStackCategory,
  CreateTeamRequest,
  CreateTeamResponse,
  UpdateTeamRequest,
  InviteCodeResponse,
  JoinTeamResponse,
  RoleInTeam,
  UpdateRolesResponse,
  SessionType,
} from '../types/profile'

// ── Members ──

export function getMe(): Promise<MemberDetail> {
  return client.get<MemberDetail>('/api/profile/members/me').then((r) => r.data)
}

export function updateMe(req: UpdateMemberRequest): Promise<{ id: number; name: string; updatedAt: string }> {
  return client.patch('/api/profile/members/me', req).then((r) => r.data)
}

export function getMyTeams(): Promise<MyTeam[]> {
  return client.get<MyTeam[]>('/api/profile/members/me/teams').then((r) => r.data)
}

export function getMembers(params?: { generationNumber?: number; sessionType?: SessionType }): Promise<MemberSummary[]> {
  return client.get<MemberSummary[]>('/api/profile/members', { params }).then((r) => r.data)
}

export function getMember(memberId: number): Promise<MemberDetail> {
  return client.get<MemberDetail>(`/api/profile/members/${memberId}`).then((r) => r.data)
}

// ── Generations ──

export function getGenerations(): Promise<Generation[]> {
  return client.get<Generation[]>('/api/profile/generations').then((r) => r.data)
}

export function createGeneration(req: CreateGenerationRequest): Promise<{ number: number }> {
  return client.post('/api/profile/generations', req).then((r) => r.data)
}

export function getGeneration(generationNumber: number): Promise<Generation & { createdAt: string }> {
  return client.get(`/api/profile/generations/${generationNumber}`).then((r) => r.data)
}

export function updateGeneration(generationNumber: number, req: CreateGenerationRequest): Promise<{ number: number }> {
  return client.patch(`/api/profile/generations/${generationNumber}`, req).then((r) => r.data)
}

export function getGenerationMembers(generationNumber: number): Promise<GenerationMember[]> {
  return client.get<GenerationMember[]>(`/api/profile/generations/${generationNumber}/members`).then((r) => r.data)
}

export function addGenerationMember(
  generationNumber: number,
  req: { memberId: number; roleInGen: GenerationRole },
): Promise<{ id: number }> {
  return client.post(`/api/profile/generations/${generationNumber}/members`, req).then((r) => r.data)
}

// ── Tech Stacks ──

export function getTechStacks(category?: TechStackCategory): Promise<{ techStacks: TechStack[] }> {
  return client
    .get<{ techStacks: TechStack[] }>('/api/profile/tech-stacks', {
      params: category ? { category } : undefined,
    })
    .then((r) => r.data)
}

// ── Teams ──

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

export function updateTeam(teamId: number, req: UpdateTeamRequest): Promise<{ id: number; updatedAt: string }> {
  return client.patch(`/api/profile/teams/${teamId}`, req).then((r) => r.data)
}

export function deleteTeam(teamId: number): Promise<void> {
  return client.delete(`/api/profile/teams/${teamId}`).then(() => undefined)
}

export function regenerateInviteCode(teamId: number): Promise<InviteCodeResponse> {
  return client.post<InviteCodeResponse>(`/api/profile/teams/${teamId}/invite-code/regenerate`).then((r) => r.data)
}

export function joinTeam(inviteCode: string): Promise<JoinTeamResponse> {
  return client.post<JoinTeamResponse>('/api/profile/teams/join', { inviteCode }).then((r) => r.data)
}

export function transferLead(teamId: number, memberId: number): Promise<void> {
  return client.patch(`/api/profile/teams/${teamId}/lead`, { memberId }).then(() => undefined)
}

export function updateMemberRoles(teamId: number, memberId: number, roles: RoleInTeam[]): Promise<UpdateRolesResponse> {
  return client.put<UpdateRolesResponse>(`/api/profile/teams/${teamId}/members/${memberId}/roles`, { roles }).then((r) => r.data)
}

export function kickMember(teamId: number, memberId: number): Promise<void> {
  return client.delete(`/api/profile/teams/${teamId}/members/${memberId}`).then(() => undefined)
}

export function leaveTeam(teamId: number): Promise<void> {
  return client.delete(`/api/profile/teams/${teamId}/members/me`).then(() => undefined)
}

export function updateMyTechStacks(
  stacks: { techStackId: number; proficiency?: number | null }[],
): Promise<MemberTechStack[]> {
  return client.put<MemberTechStack[]>('/api/profile/members/me/tech-stacks', stacks).then((r) => r.data)
}
