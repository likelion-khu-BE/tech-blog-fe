import client from './client'

// ── 유저 관리 ──

export interface UserResponse {
  id: number
  memberId: number | null
  email: string
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXPIRED'
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

// ── 아티클 관리 ──

export interface AdminPost {
  id: number
  title: string
  board: string
  category: string
  generation: string
  status: 'DRAFT' | 'PUBLISHED'
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

export async function getPosts(page = 0, size = 20): Promise<AdminPostPage> {
  const { data } = await client.get<AdminPostPage>('/api/blog/admin/posts', {
    params: { page, size },
  })
  return data
}

export async function updatePostStatus(id: number, status: 'DRAFT' | 'PUBLISHED'): Promise<AdminPost> {
  const { data } = await client.patch<AdminPost>(`/api/blog/admin/posts/${id}/status`, { status })
  return data
}

export async function deletePost(id: number): Promise<void> {
  await client.delete(`/api/blog/admin/posts/${id}`)
}

// ── 통계 ──

export interface AdminStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalComments: number
}

export async function getStats(): Promise<AdminStats> {
  const { data } = await client.get<AdminStats>('/api/blog/admin/stats')
  return data
}