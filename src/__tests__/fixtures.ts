import { vi } from 'vitest'
import type { Post, PostSummary, PostPage } from '../types/post'
import type { AdminStats, AdminPostPage } from '../api/admin'

// ── 게시글 픽스처 ──────────────────────────────────────────────

export const MOCK_POST_SUMMARY: PostSummary = {
  id: 1,
  title: '테스트 게시글',
  board: '백엔드',
  category: 'Spring',
  generation: '14기',
  status: 'PUBLISHED',
  authorId: 100,
  authorEmail: 'author@khu.ac.kr',
  tags: ['Spring', 'JPA'],
  likeCount: 5,
  createdAt: '2025-01-01T00:00:00',
}

export const MOCK_POST: Post = {
  ...MOCK_POST_SUMMARY,
  content: '# 제목\n\n본문 내용입니다.',
  repostFromId: null,
  bookmarkCount: 2,
  liked: false,
  bookmarked: false,
  updatedAt: '2025-01-01T00:00:00',
}

export const MOCK_REPOST: Post = {
  ...MOCK_POST,
  id: 2,
  title: '리포스트 게시글',
  repostFromId: 1,
}

export const MOCK_ORIGINAL_POST: Post = {
  ...MOCK_POST,
  id: 1,
  title: '원본 게시글 제목',
}

export const MOCK_PAGE: PostPage = {
  content: [MOCK_POST_SUMMARY],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
}

export const EMPTY_PAGE: PostPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  first: true,
  last: true,
}

// ── 어드민 픽스처 ──────────────────────────────────────────────

export const MOCK_STATS: AdminStats = {
  totalPosts: 42,
  publishedPosts: 35,
  draftPosts: 7,
  totalComments: 128,
}

export const MOCK_ADMIN_PAGE: AdminPostPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
}

// ── 인증 상태 프리셋 ───────────────────────────────────────────

export const GUEST_AUTH = {
  isAuthenticated: false,
  isLoading: false,
  userId: null as null,
  role: null as null,
  login: vi.fn(),
  logout: vi.fn(),
}

export const MEMBER_AUTH = {
  isAuthenticated: true,
  isLoading: false,
  userId: 1625,
  role: 'MEMBER' as const,
  login: vi.fn(),
  logout: vi.fn(),
}

export const ADMIN_AUTH = {
  isAuthenticated: true,
  isLoading: false,
  userId: 1624,
  role: 'ADMIN' as const,
  login: vi.fn(),
  logout: vi.fn(),
}
