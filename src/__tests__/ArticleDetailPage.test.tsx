import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ArticleDetailPage from '../pages/ArticleDetailPage'
import { MOCK_POST, MOCK_REPLY, MOCK_ORIGINAL_POST, GUEST_AUTH, MEMBER_AUTH, ADMIN_AUTH } from './fixtures'

// ── 모듈 모킹 ─────────────────────────────────────────────────

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/posts', () => ({ getPost: vi.fn(), deletePost: vi.fn() }))
vi.mock('../hooks/usePageTransition', () => ({ usePageTransition: () => true }))

import { useAuth } from '../contexts/AuthContext'
import { getPost } from '../api/posts'

const mockUseAuth = vi.mocked(useAuth)
const mockGetPost = vi.mocked(getPost)

// ── 렌더 헬퍼 ─────────────────────────────────────────────────

function renderDetail(postId = 1) {
  return render(
    <MemoryRouter initialEntries={[`/articles/${postId}`]}>
      <Routes>
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/articles" element={<div>목록</div>} />
        <Route path="/articles/write" element={<div>작성</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseAuth.mockReturnValue(GUEST_AUTH)
  mockGetPost.mockResolvedValue(MOCK_POST)
})

afterEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
describe('ArticleDetailPage — 게시글 기본 렌더링', () => {
  it('게시글 제목이 표시된다', async () => {
    renderDetail()
    expect(await screen.findByText(MOCK_POST.title)).toBeInTheDocument()
  })

  it('작성자명이 클릭 가능한 버튼으로 렌더링된다 (#6)', async () => {
    renderDetail()
    const authorBtn = await screen.findByRole('button', { name: MOCK_POST.authorName! })
    expect(authorBtn).toBeInTheDocument()
  })

  it('기수(generation)가 메타 영역에 표시된다', async () => {
    renderDetail()
    expect(await screen.findByText(MOCK_POST.generation)).toBeInTheDocument()
  })

  it('authorName이 null이면 작성자 버튼이 렌더링되지 않는다', async () => {
    mockGetPost.mockResolvedValue({ ...MOCK_POST, authorName: null })
    renderDetail()
    await screen.findByText(MOCK_POST.title)
    expect(screen.queryByRole('button', { name: /author/ })).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleDetailPage — #5 답글 버튼 역할별 표시', () => {
  it('[비로그인] 답글 버튼이 없다', async () => {
    mockUseAuth.mockReturnValue(GUEST_AUTH)
    renderDetail()
    await screen.findByText(MOCK_POST.title)
    expect(screen.queryByRole('button', { name: '답글' })).not.toBeInTheDocument()
  })

  it('[멤버] 답글 버튼이 보인다', async () => {
    mockUseAuth.mockReturnValue(MEMBER_AUTH)
    renderDetail()
    expect(await screen.findByRole('button', { name: '답글 작성' })).toBeInTheDocument()
  })

  it('[어드민] 답글 버튼이 보인다', async () => {
    mockUseAuth.mockReturnValue(ADMIN_AUTH)
    renderDetail()
    expect(await screen.findByRole('button', { name: '답글 작성' })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleDetailPage — 수정/삭제 버튼 역할별 표시', () => {
  it('[비로그인] 수정/삭제 버튼이 없다', async () => {
    mockUseAuth.mockReturnValue(GUEST_AUTH)
    renderDetail()
    await screen.findByText(MOCK_POST.title)
    expect(screen.queryByText('수정')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('[멤버·본인 글] 수정/삭제 버튼이 보인다', async () => {
    mockUseAuth.mockReturnValue({ ...MEMBER_AUTH, userId: MOCK_POST.authorId })
    renderDetail()
    expect(await screen.findByText('수정')).toBeInTheDocument()
    expect(screen.getByText('삭제')).toBeInTheDocument()
  })

  it('[멤버·타인 글] 수정/삭제 버튼이 없다', async () => {
    mockUseAuth.mockReturnValue({ ...MEMBER_AUTH, userId: 9999 })
    renderDetail()
    await screen.findByText(MOCK_POST.title)
    expect(screen.queryByText('수정')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('[어드민] 타인 글에도 수정/삭제 버튼이 보인다', async () => {
    mockUseAuth.mockReturnValue(ADMIN_AUTH)  // authorId(100) !== adminId(1624)
    renderDetail()
    expect(await screen.findByText('수정')).toBeInTheDocument()
    expect(screen.getByText('삭제')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleDetailPage — #9 답글 원본 게시글 표시', () => {
  it('replyToId가 없으면 원본 배너가 없다', async () => {
    mockGetPost.mockResolvedValue(MOCK_POST) // replyToId: null
    renderDetail()
    await screen.findByText(MOCK_POST.title)
    expect(screen.queryByText('원글:')).not.toBeInTheDocument()
  })

  it('replyToId가 있으면 원본 배너가 표시되고 원본 제목 링크가 렌더링된다', async () => {
    mockGetPost
      .mockResolvedValueOnce(MOCK_REPLY)         // 답글 글 조회
      .mockResolvedValueOnce(MOCK_ORIGINAL_POST)  // 원본 글 조회
    renderDetail(2)
    expect(await screen.findByText('원글:')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: MOCK_ORIGINAL_POST.title })).toBeInTheDocument()
  })

  it('원본 게시글이 삭제됐을 때 "(삭제된 게시글)" 텍스트가 표시된다', async () => {
    mockGetPost
      .mockResolvedValueOnce(MOCK_REPLY)
      .mockRejectedValueOnce({ response: { status: 404 } })
    renderDetail(2)
    await screen.findByText('원글:')
    await waitFor(() =>
      expect(screen.getByText('(삭제된 게시글)')).toBeInTheDocument(),
    )
  })
})
