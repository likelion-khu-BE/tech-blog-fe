import client from './client'

// ── 유저 관리 ──

export interface UserResponse {
  id: number
  memberId: number | null
  email: string
  role: 'PRESIDENT' | 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACTIVE' | 'ALUMNI' | 'REJECTED' | 'EXPIRED'
  signupRequestedAt: string
  approvedAt: string | null
}

export async function getUsers(status?: string): Promise<UserResponse[]> {
  const { data } = await client.get<UserResponse[]>('/api/admin/users', {
    params: status ? { status } : {},
  })
  return data
}

export async function approveUser(id: number): Promise<UserResponse> {
  const { data } = await client.post<UserResponse>(`/api/admin/users/${id}/approve`)
  return data
}

export async function rejectUser(id: number): Promise<UserResponse> {
  const { data } = await client.post<UserResponse>(`/api/admin/users/${id}/reject`)
  return data
}

// ── PRESIDENT 전용 권한 관리 ──

export async function grantAdmin(userId: number): Promise<void> {
  await client.post(`/api/admin/users/${userId}/grant-admin`)
}

export async function revokeAdmin(userId: number): Promise<void> {
  await client.post(`/api/admin/users/${userId}/revoke-admin`)
}

export async function transferPresident(userId: number): Promise<void> {
  await client.post(`/api/admin/users/${userId}/transfer-president`)
}

// ── 아티클 관리 ──

export type AdminPostStatus = 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'

export interface AdminPost {
  id: number
  title: string
  board: string
  category: string
  generation: string
  status: AdminPostStatus
  rejectedReason: string | null
  authorId: number
  tags: string[]
  likeCount: number
  createdAt: string
}

export interface AdminPostPage {
  content: AdminPost[]
  totalElements: number
  totalPages: number
  number: number
}

export async function getPosts(status?: AdminPostStatus, page = 0, size = 20): Promise<AdminPostPage> {
  const { data } = await client.get<AdminPostPage>('/api/blog/admin/posts', {
    params: { status, page, size },
  })
  return data
}

export async function publishPost(id: number): Promise<AdminPost> {
  const { data } = await client.patch<AdminPost>(`/api/blog/admin/posts/${id}/status`, { status: 'PUBLISHED' })
  return data
}

export async function rejectPost(id: number, reason: string): Promise<AdminPost> {
  const { data } = await client.patch<AdminPost>(`/api/blog/admin/posts/${id}/status`, { status: 'REJECTED', reason })
  return data
}

export async function hidePost(postId: number): Promise<void> {
  await client.patch(`/api/blog/admin/posts/${postId}/hide`)
}

export async function deletePost(id: number): Promise<void> {
  await client.delete(`/api/blog/admin/posts/${id}`)
}

// ── 댓글 관리 ──

export async function hideComment(commentId: number): Promise<void> {
  await client.patch(`/api/blog/admin/comments/${commentId}/hide`)
}

export async function forceDeleteComment(commentId: number): Promise<void> {
  await client.delete(`/api/blog/admin/comments/${commentId}`)
}

// ── 통계 ──

export interface AdminStats {
  totalPosts: number
  pendingReviewPosts: number
  publishedPosts: number
  rejectedPosts: number
  totalComments: number
}

export async function getStats(): Promise<AdminStats> {
  const { data } = await client.get<AdminStats>('/api/blog/admin/stats')
  return data
}
