import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentItem } from '../components/comment/CommentItem'
import { MOCK_COMMENT, MOCK_COMMENT_DELETED, MOCK_COMMENT_WITH_REPLY } from './fixtures'
import type { Comment } from '../types/comment'

vi.mock('../api/comments', () => ({
  toggleCommentLike: vi.fn(),
  deleteComment: vi.fn(),
  updateComment: vi.fn(),
}))

import { toggleCommentLike, deleteComment, updateComment } from '../api/comments'

const mockToggleLike = vi.mocked(toggleCommentLike)
const mockDeleteComment = vi.mocked(deleteComment)
const mockUpdateComment = vi.mocked(updateComment)

type ItemProps = React.ComponentProps<typeof CommentItem>

function renderItem(overrides: Partial<ItemProps> = {}) {
  const onReply = vi.fn()
  const onUpdated = vi.fn()
  const onDeleted = vi.fn()
  render(
    <CommentItem
      comment={MOCK_COMMENT}
      currentUserId={null}
      isAuthenticated={false}
      onReply={onReply}
      onUpdated={onUpdated}
      onDeleted={onDeleted}
      {...overrides}
    />,
  )
  return { onReply, onUpdated, onDeleted }
}

beforeEach(() => {
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  mockDeleteComment.mockResolvedValue(undefined)
  mockToggleLike.mockResolvedValue(true)
  mockUpdateComment.mockResolvedValue({ ...MOCK_COMMENT, content: '수정된 댓글' })
})

afterEach(() => vi.clearAllMocks())

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 삭제된 댓글', () => {
  it('userId가 null이면 "(삭제됨)"이 표시된다', () => {
    renderItem({ comment: MOCK_COMMENT_DELETED })
    expect(screen.getByText('(삭제됨)')).toBeInTheDocument()
  })

  it('삭제된 댓글에는 수정·삭제 버튼이 없다', () => {
    renderItem({
      comment: MOCK_COMMENT_DELETED,
      currentUserId: 1625,
      isAuthenticated: true,
    })
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 소유자 권한', () => {
  it('[본인] 수정·삭제 버튼이 표시된다', () => {
    renderItem({ currentUserId: MOCK_COMMENT.userId!, isAuthenticated: true })
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('[타인] 수정·삭제 버튼이 없다', () => {
    renderItem({ currentUserId: 9999, isAuthenticated: true })
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })

  it('[비로그인] 수정·삭제 버튼이 없다', () => {
    renderItem({ currentUserId: null, isAuthenticated: false })
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 좋아요', () => {
  it('[비로그인] 좋아요 버튼이 비활성화된다', () => {
    renderItem({ isAuthenticated: false })
    const likeBtn = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'))
    expect(likeBtn).toBeDisabled()
  })

  it('[로그인] 좋아요 클릭 시 toggleCommentLike가 호출된다', async () => {
    renderItem({ isAuthenticated: true, currentUserId: 9999 })
    const likeBtn = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'))!
    await userEvent.click(likeBtn)
    expect(mockToggleLike).toHaveBeenCalledWith(MOCK_COMMENT.id)
  })

  it('좋아요 후 카운트가 1 증가한다', async () => {
    const comment: Comment = { ...MOCK_COMMENT, likeCount: 2, liked: false }
    renderItem({ comment, isAuthenticated: true, currentUserId: 9999 })
    const likeBtn = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'))!
    await userEvent.click(likeBtn)
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 삭제', () => {
  it('확인 후 deleteComment + onDeleted가 호출된다', async () => {
    const { onDeleted } = renderItem({ currentUserId: MOCK_COMMENT.userId!, isAuthenticated: true })
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    await waitFor(() => expect(mockDeleteComment).toHaveBeenCalledWith(MOCK_COMMENT.id))
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith(MOCK_COMMENT.id))
  })

  it('취소 시 deleteComment가 호출되지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderItem({ currentUserId: MOCK_COMMENT.userId!, isAuthenticated: true })
    await userEvent.click(screen.getByRole('button', { name: '삭제' }))
    expect(mockDeleteComment).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 수정', () => {
  it('수정 버튼 클릭 시 인라인 폼에 기존 내용이 채워진다', async () => {
    renderItem({ currentUserId: MOCK_COMMENT.userId!, isAuthenticated: true })
    await userEvent.click(screen.getByRole('button', { name: '수정' }))
    expect(screen.getByDisplayValue(MOCK_COMMENT.content)).toBeInTheDocument()
  })

  it('수정 취소 버튼 클릭 시 인라인 폼이 닫힌다', async () => {
    renderItem({ currentUserId: MOCK_COMMENT.userId!, isAuthenticated: true })
    await userEvent.click(screen.getByRole('button', { name: '수정' }))
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(screen.queryByDisplayValue(MOCK_COMMENT.content)).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 답글', () => {
  it('[로그인 + depth=0] 답글 버튼이 표시된다', () => {
    renderItem({ isAuthenticated: true, depth: 0 })
    expect(screen.getByRole('button', { name: '답글' })).toBeInTheDocument()
  })

  it('[로그인 + depth=1] 답글 버튼이 없다 (MAX_DEPTH)', () => {
    renderItem({ isAuthenticated: true, depth: 1 })
    expect(screen.queryByRole('button', { name: '답글' })).not.toBeInTheDocument()
  })

  it('[비로그인] 답글 버튼이 없다', () => {
    renderItem({ isAuthenticated: false, depth: 0 })
    expect(screen.queryByRole('button', { name: '답글' })).not.toBeInTheDocument()
  })

  it('답글 버튼 클릭 시 답글 폼이 표시된다', async () => {
    renderItem({ isAuthenticated: true, depth: 0 })
    await userEvent.click(screen.getByRole('button', { name: '답글' }))
    expect(screen.getByPlaceholderText('답글을 작성하세요')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 대댓글 렌더링', () => {
  it('replies가 있으면 대댓글이 렌더링된다', () => {
    renderItem({ comment: MOCK_COMMENT_WITH_REPLY, isAuthenticated: false })
    expect(screen.getByText('대댓글입니다.')).toBeInTheDocument()
  })
})
