import client from './client'
import type { Post, PostPage, PostCreateRequest, PostUpdateRequest } from '../types/post'

export interface PostListParams {
  board?: string
  category?: string
  generation?: string
  authorId?: number
  keyword?: string
  page?: number
  size?: number
}

export async function getPosts(params?: PostListParams): Promise<PostPage> {
  const { data } = await client.get<PostPage>('/api/blog/posts', { params })
  return data
}

export async function getPost(id: number): Promise<Post> {
  const { data } = await client.get<Post>(`/api/blog/posts/${id}`)
  return data
}

export async function createPost(req: PostCreateRequest): Promise<Post> {
  const { data } = await client.post<Post>('/api/blog/posts', req)
  return data
}

export async function updatePost(id: number, req: PostUpdateRequest): Promise<Post> {
  const { data } = await client.put<Post>(`/api/blog/posts/${id}`, req)
  return data
}

export async function deletePost(id: number): Promise<void> {
  await client.delete(`/api/blog/posts/${id}`)
}

export async function toggleBookmark(id: number): Promise<boolean> {
  const { data } = await client.post<{ bookmarked: boolean }>(`/api/blog/posts/${id}/bookmark`)
  return data.bookmarked
}
