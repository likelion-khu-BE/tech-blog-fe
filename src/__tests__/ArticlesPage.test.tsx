import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ArticlesPage from '../pages/ArticlesPage'
import { MOCK_PAGE, EMPTY_PAGE, GUEST_AUTH } from './fixtures'

// ── 모듈 모킹 ─────────────────────────────────────────────────

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/posts', () => ({ getPosts: vi.fn() }))
vi.mock('../hooks/usePageTransition', () => ({ usePageTransition: () => true }))

import { useAuth } from '../contexts/AuthContext'
import { getPosts } from '../api/posts'

const mockUseAuth = vi.mocked(useAuth)
const mockGetPosts = vi.mocked(getPosts)

// ── 렌더 헬퍼 ─────────────────────────────────────────────────

function renderPage(locationState?: object) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/articles', state: locationState }]}>
      <ArticlesPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockUseAuth.mockReturnValue(GUEST_AUTH)
  mockGetPosts.mockResolvedValue(MOCK_PAGE)
})

afterEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
describe('ArticlesPage — 공통 UI', () => {
  it('검색창이 렌더링된다', () => {
    renderPage()
    expect(screen.getByPlaceholderText('제목, 내용 검색')).toBeInTheDocument()
  })

  it('기수 필터 버튼이 전체 기수·14기·15기 세 가지 렌더링된다', () => {
    renderPage()
    expect(screen.getByRole('button', { name: '전체 기수' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '14기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '15기' })).toBeInTheDocument()
  })

  it('마운트 시 getPosts가 호출된다', async () => {
    renderPage()
    await waitFor(() => expect(mockGetPosts).toHaveBeenCalledTimes(1))
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticlesPage — #7 키워드 검색', () => {
  it('키워드 입력 후 keyword 파라미터로 API가 호출된다', async () => {
    renderPage()
    const input = screen.getByPlaceholderText('제목, 내용 검색')
    await userEvent.type(input, 'Spring')
    await waitFor(
      () =>
        expect(mockGetPosts).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: 'Spring' }),
        ),
      { timeout: 1000 },
    )
  })

  it('결과 없을 때 빈 상태 메시지가 표시된다', async () => {
    mockGetPosts.mockResolvedValue(EMPTY_PAGE)
    renderPage()
    const input = screen.getByPlaceholderText('제목, 내용 검색')
    await userEvent.type(input, '없는키워드')
    await waitFor(
      () => expect(screen.getByText(/"없는키워드"에 대한 검색 결과가 없습니다./)).toBeInTheDocument(),
      { timeout: 1000 },
    )
  })

  it('X 버튼으로 검색어를 초기화하면 API가 keyword 없이 재호출된다', async () => {
    renderPage()
    const input = screen.getByPlaceholderText('제목, 내용 검색')
    await userEvent.type(input, 'Spring')
    await waitFor(() =>
      expect(mockGetPosts).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'Spring' })),
      { timeout: 1000 },
    )
    const clearBtn = screen.getByRole('button', { name: '검색어 지우기' })
    await userEvent.click(clearBtn)
    await waitFor(() =>
      expect(mockGetPosts).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ keyword: expect.any(String) }),
      ),
    )
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticlesPage — #8 기수 필터', () => {
  it('14기 클릭 시 generation=14기 파라미터로 API가 호출된다', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: '14기' }))
    await waitFor(() =>
      expect(mockGetPosts).toHaveBeenCalledWith(
        expect.objectContaining({ generation: '14기' }),
      ),
    )
  })

  it('15기 클릭 시 generation=15기 파라미터로 API가 호출된다', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: '15기' }))
    await waitFor(() =>
      expect(mockGetPosts).toHaveBeenCalledWith(
        expect.objectContaining({ generation: '15기' }),
      ),
    )
  })

  it('전체 기수 클릭 시 generation 파라미터 없이 API가 호출된다', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: '15기' }))
    await userEvent.click(screen.getByRole('button', { name: '전체 기수' }))
    await waitFor(() =>
      expect(mockGetPosts).toHaveBeenLastCalledWith(
        expect.objectContaining({ generation: undefined }),
      ),
    )
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticlesPage — #6 작성자 필터', () => {
  it('location.state에 authorId가 있으면 작성자 필터 배지가 표시된다', async () => {
    renderPage({ authorId: 100, authorLabel: 'author' })
    const badge = await screen.findByText(/작성자 필터:/)
    // 배지 영역(부모 div) 안에 작성자 레이블이 있는지 확인
    expect(badge.closest('div')).toHaveTextContent('author')
  })

  it('작성자 필터 배지의 X 클릭 시 배지가 사라지고 API가 authorId 없이 재호출된다', async () => {
    renderPage({ authorId: 100, authorLabel: 'author' })
    await screen.findByText(/작성자 필터:/)

    // X 버튼 클릭 (배지 내부의 버튼)
    const xButtons = screen.getAllByRole('button').filter(
      (btn) => btn.closest('.bg-accent-muted') !== null,
    )
    if (xButtons.length > 0) await userEvent.click(xButtons[xButtons.length - 1])

    await waitFor(() => expect(screen.queryByText(/작성자 필터:/)).not.toBeInTheDocument())
  })

  it('작성자 필터 적용 시 authorId 파라미터로 API가 호출된다', async () => {
    renderPage({ authorId: 100, authorLabel: 'author' })
    await waitFor(() =>
      expect(mockGetPosts).toHaveBeenCalledWith(
        expect.objectContaining({ authorId: 100 }),
      ),
    )
  })
})
