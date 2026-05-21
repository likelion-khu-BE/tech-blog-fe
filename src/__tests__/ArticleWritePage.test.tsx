import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ArticleWritePage from '../pages/ArticleWritePage'
import { MOCK_POST } from './fixtures'

vi.mock('../api/posts', () => ({
  getPost: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
}))
vi.mock('../hooks/usePageTransition', () => ({ usePageTransition: () => true }))

import { getPost, createPost, updatePost } from '../api/posts'

const mockGetPost = vi.mocked(getPost)
const mockCreatePost = vi.mocked(createPost)
const mockUpdatePost = vi.mocked(updatePost)

function renderCreate(search = '') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/articles/write', search }]}>
      <Routes>
        <Route path="/articles/write" element={<ArticleWritePage />} />
        <Route path="/articles/:id" element={<div>상세 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderEdit(postId = 1) {
  return render(
    <MemoryRouter initialEntries={[`/articles/${postId}/edit`]}>
      <Routes>
        <Route path="/articles/:id/edit" element={<ArticleWritePage />} />
        <Route path="/articles/:id" element={<div>상세 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockGetPost.mockResolvedValue(MOCK_POST)
  mockCreatePost.mockResolvedValue(MOCK_POST)
  mockUpdatePost.mockResolvedValue(MOCK_POST)
})

afterEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────────────────────
describe('ArticleWritePage — 작성 모드 렌더링', () => {
  it('제목 입력창이 렌더링된다', () => {
    renderCreate()
    expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument()
  })

  it('게시판 선택 버튼(백엔드·프론트엔드·AI/ML)이 렌더링된다', () => {
    renderCreate()
    expect(screen.getByRole('button', { name: '백엔드' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '프론트엔드' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AI/ML' })).toBeInTheDocument()
  })

  it('마크다운 에디터 textarea가 렌더링된다', () => {
    renderCreate()
    expect(screen.getByPlaceholderText(/마크다운으로 작성하세요/)).toBeInTheDocument()
  })

  it('"발행" 버튼이 렌더링된다', () => {
    renderCreate()
    expect(screen.getByRole('button', { name: '발행' })).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleWritePage — 유효성', () => {
  it('초기 상태에서 발행 버튼이 비활성화된다', () => {
    renderCreate()
    expect(screen.getByRole('button', { name: '발행' })).toBeDisabled()
  })

  it('제목·내용·카테고리 입력 시 발행 버튼이 활성화된다', async () => {
    renderCreate()
    await userEvent.type(screen.getByPlaceholderText('제목을 입력하세요'), '테스트 제목')
    await userEvent.type(screen.getByPlaceholderText(/마크다운으로 작성하세요/), '테스트 내용')
    await userEvent.click(screen.getByRole('button', { name: 'Spring Boot' }))
    expect(screen.getByRole('button', { name: '발행' })).toBeEnabled()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleWritePage — 태그 입력', () => {
  it('Enter 키로 태그를 추가할 수 있다', async () => {
    renderCreate()
    const tagInput = screen.getByPlaceholderText('태그 입력 후 Enter (선택)')
    await userEvent.type(tagInput, 'my-tag{Enter}')
    // 태그 chip 스팬에서 텍스트를 확인
    expect(screen.getAllByText('my-tag').length).toBeGreaterThanOrEqual(1)
  })

  it('쉼표(,)로 태그를 추가할 수 있다', async () => {
    renderCreate()
    const tagInput = screen.getByPlaceholderText('태그 입력 후 Enter (선택)')
    await userEvent.type(tagInput, 'my-tag,')
    expect(screen.getAllByText('my-tag').length).toBeGreaterThanOrEqual(1)
  })

  it('× 버튼으로 태그를 삭제할 수 있다', async () => {
    renderCreate()
    const tagInput = screen.getByPlaceholderText('태그 입력 후 Enter (선택)')
    await userEvent.type(tagInput, 'my-tag{Enter}')
    expect(screen.getAllByText('my-tag').length).toBeGreaterThanOrEqual(1)
    await userEvent.click(screen.getByRole('button', { name: '×' }))
    expect(screen.queryByText('my-tag')).not.toBeInTheDocument()
  })

  it('중복 태그는 추가되지 않는다', async () => {
    renderCreate()
    const tagInput = screen.getByPlaceholderText('태그 입력 후 Enter (선택)')
    await userEvent.type(tagInput, 'my-tag{Enter}')
    await userEvent.type(tagInput, 'my-tag{Enter}')
    // 태그 chip 영역(span.inline-flex)은 1개여야 함
    const chips = document.querySelectorAll('span.inline-flex')
    expect(chips).toHaveLength(1)
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleWritePage — 답글 모드', () => {
  it('?replyTo=1 파라미터가 있으면 원글 배너가 표시된다', async () => {
    renderCreate('?replyTo=1')
    expect(await screen.findByText('원글:')).toBeInTheDocument()
  })

  it('원글 제목이 링크로 표시된다', async () => {
    renderCreate('?replyTo=1')
    await screen.findByText('원글:')
    expect(await screen.findByRole('link', { name: MOCK_POST.title })).toBeInTheDocument()
  })

  it('원글이 404이면 "(삭제된 게시글)" 텍스트가 표시된다', async () => {
    mockGetPost.mockRejectedValue({ response: { status: 404 } })
    renderCreate('?replyTo=1')
    expect(await screen.findByText('(삭제된 게시글)')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleWritePage — 수정 모드', () => {
  it('기존 게시글 제목이 폼에 로드된다', async () => {
    renderEdit(1)
    expect(await screen.findByDisplayValue(MOCK_POST.title)).toBeInTheDocument()
  })

  it('"저장" 버튼이 렌더링된다 (발행 아님)', async () => {
    renderEdit(1)
    expect(await screen.findByRole('button', { name: '저장' })).toBeInTheDocument()
  })

  it('게시글 로드 실패 시 에러 메시지가 표시된다', async () => {
    mockGetPost.mockRejectedValue(new Error('not found'))
    renderEdit(1)
    expect(await screen.findByText('게시글을 불러오지 못했습니다.')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('ArticleWritePage — 제출', () => {
  it('작성 모드 발행 시 createPost가 호출된다', async () => {
    renderCreate()
    await userEvent.type(screen.getByPlaceholderText('제목을 입력하세요'), '제목')
    await userEvent.type(screen.getByPlaceholderText(/마크다운으로 작성하세요/), '내용')
    await userEvent.click(screen.getByRole('button', { name: 'Spring Boot' }))
    await userEvent.click(screen.getByRole('button', { name: '발행' }))
    await waitFor(() => expect(mockCreatePost).toHaveBeenCalledTimes(1))
  })

  it('수정 모드 저장 시 updatePost가 호출된다', async () => {
    renderEdit(1)
    await screen.findByRole('button', { name: '저장' })
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    await waitFor(() => expect(mockUpdatePost).toHaveBeenCalledWith(1, expect.any(Object)))
  })

  it('제출 실패 시 에러 메시지가 표시된다', async () => {
    mockCreatePost.mockRejectedValue({
      response: { data: { message: '서버 오류입니다.' } },
    })
    renderCreate()
    await userEvent.type(screen.getByPlaceholderText('제목을 입력하세요'), '제목')
    await userEvent.type(screen.getByPlaceholderText(/마크다운으로 작성하세요/), '내용')
    await userEvent.click(screen.getByRole('button', { name: 'Spring Boot' }))
    await userEvent.click(screen.getByRole('button', { name: '발행' }))
    expect(await screen.findByText('서버 오류입니다.')).toBeInTheDocument()
  })
})
