import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('../api/admin', () => ({
  getUsers: vi.fn().mockResolvedValue([]),
  approveUser: vi.fn(),
  rejectUser: vi.fn(),
  getPosts: vi.fn().mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0 }),
  publishPost: vi.fn(),
  rejectPost: vi.fn(),
  deletePost: vi.fn(),
  getStats: vi.fn().mockResolvedValue({
    totalPosts: 0,
    publishedPosts: 0,
    pendingReviewPosts: 0,
    rejectedPosts: 0,
    totalComments: 0,
  }),
}))

vi.mock('../api/profile', () => ({
  getGenerations: vi.fn().mockResolvedValue([]),
  createGeneration: vi.fn(),
  updateGeneration: vi.fn(),
  getGenerationMembers: vi.fn().mockResolvedValue([]),
  addGenerationMember: vi.fn(),
  getMembers: vi.fn().mockResolvedValue([]),
  getTechStacks: vi.fn().mockResolvedValue({ techStacks: [] }),
  createTechStack: vi.fn(),
  updateTechStack: vi.fn(),
  deleteTechStack: vi.fn(),
}))

import { getPosts, publishPost, rejectPost, getStats } from '../api/admin'
import AdminPage from '../pages/AdminPage'

const mockStats = {
  totalPosts: 20,
  pendingReviewPosts: 5,
  publishedPosts: 10,
  rejectedPosts: 3,
  totalComments: 30,
}

const mockPendingPost = {
  id: 1,
  title: '검토 대기 포스트',
  board: '백엔드',
  category: 'Spring Boot',
  generation: '13기',
  status: 'PENDING_REVIEW' as const,
  rejectedReason: null,
  authorId: 1,
  tags: [],
  likeCount: 0,
  createdAt: '2024-01-01T00:00:00',
}

const mockRejectedPost = {
  ...mockPendingPost,
  id: 2,
  title: '거부된 포스트',
  status: 'REJECTED' as const,
  rejectedReason: '내용이 너무 짧습니다',
}

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
}

function renderAdminPage() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  )
}

async function navigateToArticles() {
  const btn = await screen.findByRole('button', { name: '아티클 관리' })
  fireEvent.click(btn)
}

describe('AdminPage - 아티클 관리', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStats).mockResolvedValue(mockStats)
    vi.mocked(getPosts).mockResolvedValue({ ...emptyPage, content: [mockPendingPost], totalElements: 1 })
  })

  it('기본 탭이 "검토 대기"이다', async () => {
    renderAdminPage()
    await navigateToArticles()

    await waitFor(() => {
      expect(getPosts).toHaveBeenCalledWith('PENDING_REVIEW', 0, 20)
    })
  })

  it('PENDING_REVIEW 포스트에 발행/거부 버튼이 표시된다', async () => {
    renderAdminPage()
    await navigateToArticles()

    await waitFor(() => {
      expect(screen.getByText('검토 대기 포스트')).toBeInTheDocument()
    })

    expect(screen.getByText('발행')).toBeInTheDocument()
    expect(screen.getByText('거부')).toBeInTheDocument()
  })

  it('발행 버튼 클릭시 publishPost를 호출한다', async () => {
    vi.mocked(publishPost).mockResolvedValue({ ...mockPendingPost, status: 'PUBLISHED' as const })
    renderAdminPage()
    await navigateToArticles()

    await waitFor(() => expect(screen.getByText('발행')).toBeInTheDocument())

    fireEvent.click(screen.getByText('발행'))

    await waitFor(() => {
      expect(publishPost).toHaveBeenCalledWith(1)
    })
  })

  it('거부 버튼 클릭시 인라인 사유 입력창이 나타난다', async () => {
    renderAdminPage()
    await navigateToArticles()

    await waitFor(() => expect(screen.getByText('거부')).toBeInTheDocument())

    fireEvent.click(screen.getByText('거부'))

    await waitFor(() => {
      expect(screen.getByText('거부 사유를 입력하세요 (작성자에게 전달됩니다)')).toBeInTheDocument()
    })
  })

  it('거부 사유 없으면 거부 확정 버튼이 비활성화된다', async () => {
    renderAdminPage()
    await navigateToArticles()

    await waitFor(() => expect(screen.getByText('거부')).toBeInTheDocument())
    fireEvent.click(screen.getByText('거부'))

    await waitFor(() => expect(screen.getByText('거부 확정')).toBeInTheDocument())

    expect(screen.getByText('거부 확정')).toBeDisabled()
  })

  it('거부 사유 입력 후 거부 확정 클릭시 rejectPost를 호출한다', async () => {
    vi.mocked(rejectPost).mockResolvedValue({ ...mockPendingPost, status: 'REJECTED' as const, rejectedReason: '내용 부족' })
    renderAdminPage()
    await navigateToArticles()

    await waitFor(() => expect(screen.getByText('거부')).toBeInTheDocument())
    fireEvent.click(screen.getByText('거부'))

    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument())

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '내용 부족' } })

    await waitFor(() => expect(screen.getByText('거부 확정')).not.toBeDisabled())
    fireEvent.click(screen.getByText('거부 확정'))

    await waitFor(() => {
      expect(rejectPost).toHaveBeenCalledWith(1, '내용 부족')
    })
  })

  it('REJECTED 탭에서 거부 사유가 표시된다', async () => {
    vi.mocked(getPosts).mockResolvedValue({ ...emptyPage, content: [mockRejectedPost], totalElements: 1 })
    renderAdminPage()
    await navigateToArticles()

    const rejectedTabBtn = await screen.findByRole('button', { name: '거부됨' })
    fireEvent.click(rejectedTabBtn)

    await waitFor(() => {
      expect(getPosts).toHaveBeenCalledWith('REJECTED', 0, 20)
    })

    await waitFor(() => {
      expect(screen.getByText('거부 사유: 내용이 너무 짧습니다')).toBeInTheDocument()
    })
  })
})

describe('AdminPage - 통계', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getStats).mockResolvedValue(mockStats)
    vi.mocked(getPosts).mockResolvedValue(emptyPage)
  })

  it('5개 통계 카드가 모두 표시된다', async () => {
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('전체 게시글')).toBeInTheDocument()
      expect(screen.getAllByText('검토 대기').length).toBeGreaterThan(0)
      expect(screen.getByText('게시된 글')).toBeInTheDocument()
      expect(screen.getAllByText('거부됨').length).toBeGreaterThan(0)
      expect(screen.getByText('총 댓글')).toBeInTheDocument()
    })
  })

  it('pendingReviewPosts 수치가 표시된다', async () => {
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('rejectedPosts 수치가 표시된다', async () => {
    renderAdminPage()

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })
})
