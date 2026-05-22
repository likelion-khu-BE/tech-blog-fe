import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ArticleWritePage from '../pages/ArticleWritePage'

vi.mock('../api/posts', () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
  getPost: vi.fn(),
  submitPost: vi.fn(),
}))

vi.mock('../hooks/usePageTransition', () => ({
  usePageTransition: () => true,
}))

import { createPost, updatePost, getPost, submitPost } from '../api/posts'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockDraftPost = {
  id: 1,
  title: '임시저장 글',
  content: '내용',
  board: '백엔드',
  category: 'Spring Boot',
  status: 'DRAFT' as const,
  tags: ['spring'],
  generation: '13기',
  authorId: 1,
  authorName: null,
  likeCount: 0,
  bookmarkCount: 0,
  liked: false,
  bookmarked: false,
  replyToId: null,
  rejectedReason: null,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00',
}

const mockPublishedPost = {
  ...mockDraftPost,
  id: 2,
  status: 'PUBLISHED' as const,
}

const mockRejectedPost = {
  ...mockDraftPost,
  id: 3,
  status: 'REJECTED' as const,
  rejectedReason: '내용이 너무 짧습니다',
}

function renderWritePage(path = '/write') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/write" element={<ArticleWritePage />} />
        <Route path="/articles/:id/edit" element={<ArticleWritePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ArticleWritePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
  })

  describe('새 글 작성 모드 (비 PUBLISHED)', () => {
    it('임시저장 버튼과 제출 버튼이 모두 표시된다', () => {
      renderWritePage()

      expect(screen.getByText('임시저장')).toBeInTheDocument()
      expect(screen.getByText('제출')).toBeInTheDocument()
    })

    it('제목과 내용이 비어있으면 버튼이 비활성화된다', () => {
      renderWritePage()

      const submitBtn = screen.getByText('제출')
      const saveBtn = screen.getByText('임시저장')
      expect(submitBtn).toBeDisabled()
      expect(saveBtn).toBeDisabled()
    })

    it('제목/내용/카테고리 모두 입력시 버튼이 활성화된다', async () => {
      renderWritePage()

      fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), {
        target: { value: '테스트 제목' },
      })
      fireEvent.click(screen.getByText('Spring Boot'))
      const textarea = screen.getByPlaceholderText(/마크다운으로 작성하세요/)
      fireEvent.change(textarea, { target: { value: '테스트 내용' } })

      await waitFor(() => {
        expect(screen.getByText('제출')).not.toBeDisabled()
        expect(screen.getByText('임시저장')).not.toBeDisabled()
      })
    })

    it('임시저장 클릭시 createPost를 호출하고 이동한다', async () => {
      const mockPost = { ...mockDraftPost, id: 10 }
      vi.mocked(createPost).mockResolvedValue(mockPost)
      renderWritePage()

      fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), {
        target: { value: '임시 제목' },
      })
      fireEvent.click(screen.getByText('Spring Boot'))
      fireEvent.change(screen.getByPlaceholderText(/마크다운으로 작성하세요/), {
        target: { value: '임시 내용' },
      })

      await waitFor(() => {
        expect(screen.getByText('임시저장')).not.toBeDisabled()
      })

      fireEvent.click(screen.getByText('임시저장'))

      await waitFor(() => {
        expect(createPost).toHaveBeenCalledTimes(1)
        expect(submitPost).not.toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/articles/10', { replace: true })
      })
    })

    it('제출 클릭시 createPost 후 submitPost를 호출한다', async () => {
      const mockPost = { ...mockDraftPost, id: 10 }
      vi.mocked(createPost).mockResolvedValue(mockPost)
      vi.mocked(submitPost).mockResolvedValue({ ...mockPost, status: 'PENDING_REVIEW' as const })
      renderWritePage()

      fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), {
        target: { value: '제출 제목' },
      })
      fireEvent.click(screen.getByText('Spring Boot'))
      fireEvent.change(screen.getByPlaceholderText(/마크다운으로 작성하세요/), {
        target: { value: '제출 내용' },
      })

      await waitFor(() => expect(screen.getByText('제출')).not.toBeDisabled())

      fireEvent.click(screen.getByText('제출'))

      await waitFor(() => {
        expect(createPost).toHaveBeenCalledTimes(1)
        expect(submitPost).toHaveBeenCalledWith(10)
        expect(mockNavigate).toHaveBeenCalledWith('/articles/10', { replace: true })
      })
    })
  })

  describe('PUBLISHED 글 수정 모드', () => {
    beforeEach(() => {
      vi.mocked(getPost).mockResolvedValue(mockPublishedPost)
    })

    it('저장 버튼만 표시된다 (임시저장/제출 없음)', async () => {
      renderWritePage('/articles/2/edit')

      await waitFor(() => {
        expect(screen.getByText('저장')).toBeInTheDocument()
        expect(screen.queryByText('임시저장')).not.toBeInTheDocument()
        expect(screen.queryByText('제출')).not.toBeInTheDocument()
      })
    })

    it('저장 클릭시 updatePost를 호출하고 submitPost는 호출하지 않는다', async () => {
      const updated = { ...mockPublishedPost }
      vi.mocked(updatePost).mockResolvedValue(updated)
      renderWritePage('/articles/2/edit')

      await waitFor(() => expect(screen.getByText('저장')).toBeInTheDocument())

      fireEvent.click(screen.getByText('저장'))

      await waitFor(() => {
        expect(updatePost).toHaveBeenCalledWith(2, expect.any(Object))
        expect(submitPost).not.toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/articles/2', { replace: true })
      })
    })
  })

  describe('REJECTED 글 수정 모드', () => {
    beforeEach(() => {
      vi.mocked(getPost).mockResolvedValue(mockRejectedPost)
    })

    it('임시저장/제출 버튼이 표시된다', async () => {
      renderWritePage('/articles/3/edit')

      await waitFor(() => {
        expect(screen.getByText('임시저장')).toBeInTheDocument()
        expect(screen.getByText('제출')).toBeInTheDocument()
      })
    })
  })
})
