export interface QnaTag {
  id: number
  name: string
}

export interface QnaMember {
  userId: number
  nickname: string
  generation: number
}

export interface QuestionSummary {
  id: number
  title: string
  status: 'OPEN' | 'RESOLVED'
  generation: number
  viewCount: number
  answerCount: number
  hasAcceptedAnswer: boolean
  author: QnaMember
  tags: QnaTag[]
  createdAt: string
}

export interface QuestionDetail extends QuestionSummary {
  content: string
  updatedAt: string
}

export interface AnswerDetail {
  id: number
  content: string
  accepted: boolean
  upvoteCount: number
  downvoteCount: number
  commentCount: number
  author: QnaMember
  createdAt: string
  updatedAt: string
}

export interface AnswerList {
  acceptedAnswer: AnswerDetail | null
  answers: AnswerDetail[]
}

export interface QnaComment {
  id: number
  content: string
  author: QnaMember
  createdAt: string
  updatedAt: string
}

export interface QuestionListParams {
  keyword?: string
  status?: string
  tagId?: number
  generation?: number
  sort?: 'latest' | 'vote'
  page?: number
  size?: number
}

export interface QuestionCreateRequest {
  title: string
  content: string
  tagIds?: number[]
}

export interface QuestionUpdateRequest {
  title?: string
  content?: string
  tagIds?: number[]
}

export interface AnswerCreateRequest {
  content: string
}

export interface AnswerUpdateRequest {
  content: string
}

export interface TagCreateRequest {
  name: string
}

export type VoteType = 'UPVOTE' | 'DOWNVOTE'

export interface VoteCreateRequest {
  type: VoteType
}

export interface MyVoteResponse {
  type: VoteType | null
}

export interface CommentCreateRequest {
  content: string
}

export interface CommentUpdateRequest {
  content: string
}
