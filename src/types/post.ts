export type PostStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'

export const BOARDS = ['백엔드', '프론트엔드', 'AI/ML'] as const
export type Board = (typeof BOARDS)[number]

export const GENERATIONS = ['14기', '15기'] as const
export type Generation = (typeof GENERATIONS)[number]

export const CATEGORIES = [
  'Spring Boot', 'JPA', 'Spring Security', 'Redis',
  'React', 'Vue.js', 'TypeScript', 'Next.js',
  'Docker', 'Kubernetes', 'CI/CD', 'AWS',
  'Database', 'Algorithm', 'Network', 'Security',
  'Python', 'Machine Learning', 'NLP', 'LLM',
  'Git', 'Linux', 'Testing',
] as const
export type Category = (typeof CATEGORIES)[number]

export interface PostSummary {
  id: number
  title: string
  board: string
  category: string
  generation: string
  status: PostStatus
  authorId: number
  authorEmail: string | null
  authorName: string | null
  tags: string[]
  likeCount: number
  createdAt: string
  replyToId?: number | null
  replyToTitle?: string | null
}

export interface Post extends PostSummary {
  content: string
  repostFromId: number | null
  replyToId: number | null
  rejectedReason: string | null
  bookmarkCount: number
  liked: boolean
  bookmarked: boolean
  updatedAt: string
}

export interface PostPage {
  content: PostSummary[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface PostCreateRequest {
  title: string
  content: string
  board: string
  category: string
  status: PostStatus
  generation: string
  tags: string[]
  repostFromId?: number | null
  replyToId?: number | null
}

export interface PostUpdateRequest {
  title: string
  content: string
  board: string
  category: string
  status: PostStatus
  tags: string[]
}
