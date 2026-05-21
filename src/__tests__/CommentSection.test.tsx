import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentSection } from '../components/comment/CommentSection'
import { MOCK_COMMENT, MOCK_COMMENT_WITH_REPLY, GUEST_AUTH, MEMBER_AUTH } from './fixtures'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/comments', () => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
  toggleCommentLike: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'
import { getComments, createComment } from '../api/comments'

const mockUseAuth = vi.mocked(useAuth)
const mockGetComments = vi.mocked(getComments)
const mockCreateComment = vi.mocked(createComment)

function renderSection(postId = 1) {
  return render(<CommentSection postId={postId} />)
}

beforeEach(() => {
  mockUseAuth.mockReturnValue(GUEST_AUTH)
  mockGetComments.mockResolvedValue([])
  mockCreateComment.mockResolvedValue({ ...MOCK_COMMENT, id: 99, content: '새 댓글' })
})

afterEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 기본 로드', () => {
  it('마운트 시 getComments(postId)가 호출된다', async () => {
    renderSection(42)
    await waitFor(() => expect(mockGetComments).toHaveBeenCalledWith(42))
  })

  it('댓글이 없으면 "아직 댓글이 없습니다." 가 표시된다', async () => {
    renderSection()
    expect(await screen.findByText('아직 댓글이 없습니다.')).toBeInTheDocument()
  })

  it('댓글이 있으면 내용이 표시된다', async () => {
    mockGetComments.mockResolvedValue([MOCK_COMMENT])
    renderSection()
    expect(await screen.findByText(MOCK_COMMENT.content)).toBeInTheDocument()
  })

  it('로드 실패 시 에러 메시지가 표시된다', async () => {
    mockGetComments.mockRejectedValue(new Error('network'))
    renderSection()
    expect(await screen.findByText('댓글을 불러오지 못했습니다.')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 댓글 카운트', () => {
  it('댓글 + 대댓글 합산 수가 헤딩에 표시된다', async () => {
    mockGetComments.mockResolvedValue([MOCK_COMMENT_WITH_REPLY])
    renderSection()
    await screen.findByText(MOCK_COMMENT.content)
    // parent 1 + reply 1 = 2
    const heading = screen.getByRole('heading', { name: /댓글/ })
    expect(heading).toHaveTextContent('2')
  })

  it('댓글이 0개이면 카운트가 표시되지 않는다', async () => {
    renderSection()
    await screen.findByText('아직 댓글이 없습니다.')
    const heading = screen.getByRole('heading', { name: /댓글/ })
    expect(heading).not.toHaveTextContent(/\d/)
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 인증 상태', () => {
  it('[비로그인] 로그인 유도 메시지가 표시된다', async () => {
    mockUseAuth.mockReturnValue(GUEST_AUTH)
    renderSection()
    await screen.findByText('아직 댓글이 없습니다.')
    expect(screen.getByText('댓글을 작성하려면 로그인이 필요합니다.')).toBeInTheDocument()
  })

  it('[비로그인] 댓글 입력 폼이 없다', async () => {
    mockUseAuth.mockReturnValue(GUEST_AUTH)
    renderSection()
    await screen.findByText('아직 댓글이 없습니다.')
    expect(screen.queryByPlaceholderText('댓글을 작성하세요')).not.toBeInTheDocument()
  })

  it('[로그인] 댓글 입력 폼이 표시된다', async () => {
    mockUseAuth.mockReturnValue(MEMBER_AUTH)
    renderSection()
    await screen.findByText('아직 댓글이 없습니다.')
    expect(screen.getByPlaceholderText('댓글을 작성하세요')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 댓글 작성', () => {
  it('등록 후 새 댓글이 목록에 추가된다', async () => {
    mockUseAuth.mockReturnValue(MEMBER_AUTH)
    renderSection()
    await screen.findByText('아직 댓글이 없습니다.')

    const textarea = screen.getByPlaceholderText('댓글을 작성하세요')
    await userEvent.type(textarea, '새 댓글')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => expect(screen.getByText('새 댓글')).toBeInTheDocument())
  })

  it('등록 후 기존 댓글과 함께 표시된다', async () => {
    mockUseAuth.mockReturnValue(MEMBER_AUTH)
    mockGetComments.mockResolvedValue([MOCK_COMMENT])
    renderSection()
    await screen.findByText(MOCK_COMMENT.content)

    const newComment = { ...MOCK_COMMENT, id: 99, content: '추가된 댓글' }
    mockCreateComment.mockResolvedValue(newComment)

    const textarea = screen.getByPlaceholderText('댓글을 작성하세요')
    await userEvent.type(textarea, '추가된 댓글')
    await userEvent.click(screen.getByRole('button', { name: '등록' }))

    await waitFor(() => expect(screen.getByText('추가된 댓글')).toBeInTheDocument())
    expect(screen.getByText(MOCK_COMMENT.content)).toBeInTheDocument()
  })
})
