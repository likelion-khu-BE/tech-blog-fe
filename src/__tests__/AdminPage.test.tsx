import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from '../pages/AdminPage'
import { MOCK_STATS, MOCK_ADMIN_PAGE, ADMIN_AUTH } from './fixtures'

// ── 모듈 모킹 ─────────────────────────────────────────────────

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/admin', () => ({
  getStats: vi.fn(),
  getUsers: vi.fn(),
  getPosts: vi.fn(),
  approveUser: vi.fn(),
  rejectUser: vi.fn(),
  updatePostStatus: vi.fn(),
  deletePost: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'
import { getStats, getUsers, getPosts as getAdminPosts } from '../api/admin'

const mockUseAuth = vi.mocked(useAuth)
const mockGetStats = vi.mocked(getStats)
const mockGetUsers = vi.mocked(getUsers)
const mockGetAdminPosts = vi.mocked(getAdminPosts)

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseAuth.mockReturnValue(ADMIN_AUTH)
  mockGetStats.mockResolvedValue(MOCK_STATS)
  mockGetUsers.mockResolvedValue([])
  mockGetAdminPosts.mockResolvedValue(MOCK_ADMIN_PAGE)
})

afterEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
describe('AdminPage — #4 통계 카드', () => {
  it('통계 카드 레이블 4개가 렌더링된다', () => {
    renderAdmin()
    expect(screen.getByText('전체 게시글')).toBeInTheDocument()
    expect(screen.getByText('게시된 글')).toBeInTheDocument()
    expect(screen.getByText('초안')).toBeInTheDocument()
    expect(screen.getByText('총 댓글')).toBeInTheDocument()
  })

  it('API 응답값이 각 카드에 올바르게 표시된다', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()  // totalPosts
      expect(screen.getByText('35')).toBeInTheDocument()  // publishedPosts
      expect(screen.getByText('7')).toBeInTheDocument()   // draftPosts
      expect(screen.getByText('128')).toBeInTheDocument() // totalComments
    })
  })

  it('로딩 중에는 "—"가 표시된다', () => {
    mockGetStats.mockImplementation(() => new Promise(() => {})) // 응답 없음
    renderAdmin()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4)
  })

  it('마운트 시 getStats API가 1회 호출된다', async () => {
    renderAdmin()
    await waitFor(() => expect(mockGetStats).toHaveBeenCalledTimes(1))
  })
})

// ─────────────────────────────────────────────────────────────
describe('AdminPage — 탭 렌더링', () => {
  it('회원 관리·아티클 관리 탭이 존재한다', () => {
    renderAdmin()
    expect(screen.getByRole('button', { name: '회원 관리' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '아티클 관리' })).toBeInTheDocument()
  })
})
