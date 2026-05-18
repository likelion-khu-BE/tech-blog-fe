import client from './client'
import type { Comment, CommentCreateRequest, CommentUpdateRequest } from '../types/comment'

export async function getComments(postId: number): Promise<Comment[]> {
  const { data } = await client.get<Comment[]>(`/api/blog/posts/${postId}/comments`)
  return data
}

export async function createComment(postId: number, req: CommentCreateRequest): Promise<Comment> {
  const { data } = await client.post<Comment>(`/api/blog/posts/${postId}/comments`, req)
  return data
}

export async function updateComment(id: number, req: CommentUpdateRequest): Promise<Comment> {
  const { data } = await client.put<Comment>(`/api/blog/comments/${id}`, req)
  return data
}

export async function deleteComment(id: number): Promise<void> {
  await client.delete(`/api/blog/comments/${id}`)
}

export async function toggleCommentLike(id: number): Promise<boolean> {
  const { data } = await client.post<{ liked: boolean }>(`/api/blog/comments/${id}/like`)
  return data.liked
}
