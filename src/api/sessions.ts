import client from './client'

export type SessionStatus = 'SCHEDULED' | 'ONGOING' | 'DONE'
export type ResourceType = 'SLIDE' | 'CODE' | 'LINK' | 'DOCUMENT'
export type ResourceVisibility = 'PUBLIC' | 'MEMBER' | 'PRIVATE'

export interface ApiSpeaker {
  id: number
  name: string
  role: string
}

export interface ApiAuthor {
  id: number
  name: string
  initial: string
}

export interface ApiNoteLink {
  label: string
  url: string
  order: number
}

export interface ApiSession {
  id: number
  weekLabel: string
  title: string
  status: SessionStatus
  startedAt: string
  speakers: ApiSpeaker[]
  rating: number
  noteCount: number
  resourceCount: number
}

export interface ApiNote {
  id: number
  author: ApiAuthor
  body: string
  links: ApiNoteLink[]
  createdAt: string
}

export interface ApiResource {
  id: number
  type: ResourceType
  name: string
  uploader: ApiAuthor
  sizeLabel?: string
  visibility: ResourceVisibility
  url: string
  uploadedAt: string
}

export interface ApiRetrosResponse {
  averageRating: number
  retros: ApiRetro[]
}

export interface ApiRetro {
  id: number
  author: ApiAuthor
  rating: number
  body: string
  createdAt: string
}

// ─── Sessions ────────────────────────────────────────────────

export function getSessions(generationNumber: number, params?: { status?: SessionStatus }) {
  return client
    .get<{ sessions: ApiSession[] }>(`/api/session-board/${generationNumber}/sessions`, { params })
    .then((r) => r.data.sessions)
}

export function createSession(
  generationNumber: number,
  data: {
    weekLabel: string
    title: string
    status?: SessionStatus
    startedAt?: string
    speakerIds?: number[]
  },
) {
  return client
    .post<{ id: number }>(`/api/session-board/${generationNumber}/sessions`, data)
    .then((r) => r.data)
}

export function updateSession(
  generationNumber: number,
  sessionId: number,
  data: {
    weekLabel?: string
    title?: string
    status?: SessionStatus
    startedAt?: string
    speakerIds?: number[]
  },
) {
  return client
    .put<{ id: number; updatedAt: string }>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}`,
      data,
    )
    .then((r) => r.data)
}

export function deleteSession(generationNumber: number, sessionId: number) {
  return client.delete(`/api/session-board/${generationNumber}/sessions/${sessionId}`)
}

// ─── Notes ───────────────────────────────────────────────────

export function getNotes(generationNumber: number, sessionId: number, q?: string) {
  return client
    .get<{ notes: ApiNote[] }>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/notes`,
      { params: q ? { q } : undefined },
    )
    .then((r) => r.data.notes)
}

export function createNote(
  generationNumber: number,
  sessionId: number,
  data: { body: string; links?: { label: string; url: string; order: number }[] },
) {
  return client
    .post<ApiNote>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/notes`,
      data,
    )
    .then((r) => r.data)
}

export function updateNote(
  generationNumber: number,
  sessionId: number,
  noteId: number,
  data: { body?: string; links?: { label: string; url: string; order: number }[] },
) {
  return client
    .put<ApiNote>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/notes/${noteId}`,
      data,
    )
    .then((r) => r.data)
}

export function deleteNote(generationNumber: number, sessionId: number, noteId: number) {
  return client.delete(
    `/api/session-board/${generationNumber}/sessions/${sessionId}/notes/${noteId}`,
  )
}

// ─── Resources ───────────────────────────────────────────────

export function getResources(
  generationNumber: number,
  sessionId: number,
  type?: ResourceType,
) {
  return client
    .get<{ resources: ApiResource[] }>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/resources`,
      { params: type ? { type } : undefined },
    )
    .then((r) => r.data.resources)
}

export function createResourceFile(
  generationNumber: number,
  sessionId: number,
  formData: FormData,
) {
  return client
    .post<ApiResource>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/resources`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((r) => r.data)
}

export function createResourceLink(
  generationNumber: number,
  sessionId: number,
  data: { type: ResourceType; name: string; url: string; visibility?: ResourceVisibility },
) {
  return client
    .post<ApiResource>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/resources`,
      data,
    )
    .then((r) => r.data)
}

export function deleteResource(
  generationNumber: number,
  sessionId: number,
  resourceId: number,
) {
  return client.delete(
    `/api/session-board/${generationNumber}/sessions/${sessionId}/resources/${resourceId}`,
  )
}

// ─── Retros ──────────────────────────────────────────────────

export function getRetros(generationNumber: number, sessionId: number) {
  return client
    .get<ApiRetrosResponse>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/retros`,
    )
    .then((r) => r.data)
}

export function createRetro(
  generationNumber: number,
  sessionId: number,
  data: { rating: number; body: string },
) {
  return client
    .post<ApiRetro>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/retros`,
      data,
    )
    .then((r) => r.data)
}

export function updateRetro(
  generationNumber: number,
  sessionId: number,
  retroId: number,
  data: { rating?: number; body?: string },
) {
  return client
    .put<ApiRetro>(
      `/api/session-board/${generationNumber}/sessions/${sessionId}/retros/${retroId}`,
      data,
    )
    .then((r) => r.data)
}
