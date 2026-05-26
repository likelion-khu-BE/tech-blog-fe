export interface Comment {
  id: number
  content: string
  userId: number | null
  parentId: number | null
  likeCount: number
  liked: boolean
  createdAt: string
  replies: Comment[]
}

export interface CommentCreateRequest {
  content: string
  parentId?: number | null
}

export interface CommentUpdateRequest {
  content: string
}
