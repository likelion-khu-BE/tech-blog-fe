import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Comment } from '../types/comment'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/comments', () => ({
  getComments: vi.fn(),
  createComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
  toggleCommentLike: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'
import { getComments, createComment, deleteComment, updateComment, toggleCommentLike } from '../api/comments'
import { CommentSection } from '../components/comment/CommentSection'

// ── 픽스처 ────────────────────────────────────────────────────

const OWNER_ID = 100
const OTHER_ID = 200

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    content: '테스트 댓글입니다.',
    userId: OWNER_ID,
    parentId: null,
    likeCount: 0,
    liked: false,
    createdAt: '2025-01-01T00:00:00',
    replies: [],
    ...overrides,
  }
}

const GUEST = {
  isAuthenticated: false,
  isLoading: false,
  userId: null as null,
  role: null as null,
  login: vi.fn(),
  logout: vi.fn(),
}

const MEMBER = {
  isAuthenticated: true,
  isLoading: false,
  userId: OWNER_ID,
  role: 'MEMBER' as const,
  login: vi.fn(),
  logout: vi.fn(),
}

const OTHER_MEMBER = { ...MEMBER, userId: OTHER_ID }

// ── 헬퍼 ──────────────────────────────────────────────────────

function renderSection(postId = 1) {
  return render(<CommentSection postId={postId} />)
}

// ── 설정 ──────────────────────────────────────────────────────

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue(GUEST)
  vi.mocked(getComments).mockResolvedValue([])
})

afterEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 기본 렌더링', () => {
  it('댓글이 없으면 "아직 댓글이 없습니다." 표시', async () => {
    renderSection()
    await waitFor(() =>
      expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument()
    )
  })

  it('댓글 로드 실패 시 에러 메시지 표시', async () => {
    vi.mocked(getComments).mockRejectedValue(new Error('Network error'))
    renderSection()
    await waitFor(() =>
      expect(screen.getByText('댓글을 불러오지 못했습니다.')).toBeInTheDocument()
    )
  })

  it('댓글 내용이 표시된다', async () => {
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    renderSection()
    await waitFor(() =>
      expect(screen.getByText('테스트 댓글입니다.')).toBeInTheDocument()
    )
  })

  it('댓글 1개일 때 헤더에 숫자 1이 표시된다', async () => {
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    renderSection()
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())
  })

  it('대댓글까지 포함한 총 개수가 표시된다', async () => {
    const reply = makeComment({ id: 2, content: '대댓글', userId: OTHER_ID, parentId: 1, replies: [] })
    const root = makeComment({ replies: [reply] })
    vi.mocked(getComments).mockResolvedValue([root])
    renderSection()
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
  })

  it('댓글이 0개이면 헤더에 숫자가 표시되지 않는다', async () => {
    renderSection()
    await waitFor(() => expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument())
    // 숫자 span이 없어야 함 — "댓글" 헤더만 있고 숫자 없음
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('postId가 바뀌면 댓글을 다시 불러온다', async () => {
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    const { rerender } = render(<CommentSection postId={1} />)
    await waitFor(() => expect(getComments).toHaveBeenCalledWith(1))

    rerender(<CommentSection postId={2} />)
    await waitFor(() => expect(getComments).toHaveBeenCalledWith(2))
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 인증 상태별 UI', () => {
  it('[비로그인] 로그인 유도 메시지가 표시된다', async () => {
    vi.mocked(useAuth).mockReturnValue(GUEST)
    renderSection()
    await waitFor(() =>
      expect(screen.getByText('댓글을 작성하려면 로그인이 필요합니다.')).toBeInTheDocument()
    )
  })

  it('[비로그인] 댓글 작성 textarea가 없다', async () => {
    vi.mocked(useAuth).mockReturnValue(GUEST)
    renderSection()
    await waitFor(() => screen.getByText('아직 댓글이 없습니다.'))
    expect(screen.queryByPlaceholderText('댓글을 작성하세요')).not.toBeInTheDocument()
  })

  it('[로그인] 댓글 작성 textarea가 표시된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    renderSection()
    await waitFor(() =>
      expect(screen.getByPlaceholderText('댓글을 작성하세요')).toBeInTheDocument()
    )
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 댓글 생성', () => {
  it('댓글 작성 후 목록에 추가된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    const created = makeComment({ id: 99, content: '새 댓글' })
    vi.mocked(createComment).mockResolvedValue(created)

    renderSection()

    const textarea = await screen.findByPlaceholderText('댓글을 작성하세요')
    fireEvent.change(textarea, { target: { value: '새 댓글' } })
    fireEvent.click(screen.getByText('등록'))

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith(1, { content: '새 댓글' })
      expect(screen.getByText('새 댓글')).toBeInTheDocument()
    })
  })

  it('댓글 작성 후 입력창이 비워진다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(createComment).mockResolvedValue(makeComment({ id: 99, content: '입력 완료' }))

    renderSection()

    const textarea = await screen.findByPlaceholderText('댓글을 작성하세요')
    fireEvent.change(textarea, { target: { value: '입력 완료' } })
    fireEvent.click(screen.getByText('등록'))

    await waitFor(() => expect(textarea).toHaveValue(''))
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentSection — 대댓글 표시', () => {
  it('대댓글이 렌더링된다', async () => {
    const reply = makeComment({ id: 2, content: '대댓글 내용', userId: OTHER_ID, parentId: 1, replies: [] })
    vi.mocked(getComments).mockResolvedValue([makeComment({ replies: [reply] })])
    renderSection()
    await waitFor(() => {
      expect(screen.getByText('테스트 댓글입니다.')).toBeInTheDocument()
      expect(screen.getByText('대댓글 내용')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 좋아요', () => {
  it('[로그인] 좋아요 버튼을 클릭하면 toggleCommentLike를 호출한다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment({ likeCount: 0, liked: false })])
    vi.mocked(toggleCommentLike).mockResolvedValue(true)

    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    // 하트 버튼 클릭 (좋아요 버튼은 svg를 포함한 button)
    const likeBtn = screen.getAllByRole('button').find(btn =>
      btn.querySelector('svg path[d*="4.318"]')
    )!
    fireEvent.click(likeBtn)

    await waitFor(() =>
      expect(toggleCommentLike).toHaveBeenCalledWith(1)
    )
  })

  it('[비로그인] 좋아요 버튼이 비활성화된다', async () => {
    vi.mocked(useAuth).mockReturnValue(GUEST)
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    const likeBtn = screen.getAllByRole('button').find(btn =>
      btn.querySelector('svg path[d*="4.318"]')
    )!
    expect(likeBtn).toBeDisabled()
  })

  it('좋아요 카운트가 0이면 숫자가 표시되지 않는다', async () => {
    vi.mocked(getComments).mockResolvedValue([makeComment({ likeCount: 0 })])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))
    // likeCount=0 → span 없음
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('좋아요 카운트가 있으면 숫자가 표시된다', async () => {
    vi.mocked(getComments).mockResolvedValue([makeComment({ likeCount: 5 })])
    renderSection()
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument())
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 수정/삭제 버튼 노출', () => {
  it('[본인 댓글] 수정·삭제 버튼이 표시된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER) // userId: OWNER_ID
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))
    expect(screen.getByText('수정')).toBeInTheDocument()
    expect(screen.getByText('삭제')).toBeInTheDocument()
  })

  it('[타인 댓글] 수정·삭제 버튼이 없다', async () => {
    vi.mocked(useAuth).mockReturnValue(OTHER_MEMBER) // userId: OTHER_ID
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))
    expect(screen.queryByText('수정')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('[비로그인] 수정·삭제 버튼이 없다', async () => {
    vi.mocked(useAuth).mockReturnValue(GUEST)
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))
    expect(screen.queryByText('수정')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 삭제', () => {
  it('삭제 확인 후 deleteComment를 호출하고 목록에서 제거된다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])
    vi.mocked(deleteComment).mockResolvedValue(undefined)

    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    fireEvent.click(screen.getByText('삭제'))

    await waitFor(() => {
      expect(deleteComment).toHaveBeenCalledWith(1)
      expect(screen.queryByText('테스트 댓글입니다.')).not.toBeInTheDocument()
    })
  })

  it('삭제 취소 시 deleteComment를 호출하지 않는다', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])

    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    fireEvent.click(screen.getByText('삭제'))

    expect(deleteComment).not.toHaveBeenCalled()
    expect(screen.getByText('테스트 댓글입니다.')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 수정', () => {
  it('수정 버튼 클릭 시 편집 폼이 나타난다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])

    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    fireEvent.click(screen.getByText('수정'))

    // 편집 폼이 나타나고 기존 내용이 채워진다
    await waitFor(() => {
      const textarea = screen.getByDisplayValue('테스트 댓글입니다.')
      expect(textarea).toBeInTheDocument()
    })
    expect(screen.getByText('저장')).toBeInTheDocument()
    expect(screen.getByText('취소')).toBeInTheDocument()
  })

  it('저장 클릭 시 updateComment를 호출하고 내용이 바뀐다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])
    vi.mocked(updateComment).mockResolvedValue(
      makeComment({ content: '수정된 댓글', userId: OWNER_ID })
    )

    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    fireEvent.click(screen.getByText('수정'))

    const textarea = await screen.findByDisplayValue('테스트 댓글입니다.')
    fireEvent.change(textarea, { target: { value: '수정된 댓글' } })
    fireEvent.click(screen.getByText('저장'))

    await waitFor(() => {
      expect(updateComment).toHaveBeenCalledWith(1, { content: '수정된 댓글' })
      expect(screen.getByText('수정된 댓글')).toBeInTheDocument()
    })
  })

  it('취소 클릭 시 편집 폼이 닫힌다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment({ userId: OWNER_ID })])

    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))

    fireEvent.click(screen.getByText('수정'))
    await screen.findByDisplayValue('테스트 댓글입니다.')

    fireEvent.click(screen.getByText('취소'))

    await waitFor(() =>
      expect(screen.queryByDisplayValue('테스트 댓글입니다.')).not.toBeInTheDocument()
    )
    expect(screen.getByText('테스트 댓글입니다.')).toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 답글', () => {
  it('[로그인] 루트 댓글에 답글 버튼이 표시된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))
    expect(screen.getByText('답글')).toBeInTheDocument()
  })

  it('[비로그인] 답글 버튼이 없다', async () => {
    vi.mocked(useAuth).mockReturnValue(GUEST)
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    renderSection()
    await waitFor(() => screen.getByText('테스트 댓글입니다.'))
    expect(screen.queryByText('답글')).not.toBeInTheDocument()
  })

  it('답글 버튼 클릭 시 답글 입력폼이 나타난다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([makeComment()])
    renderSection()

    await waitFor(() => screen.getByText('답글'))
    fireEvent.click(screen.getByText('답글'))

    await waitFor(() =>
      expect(screen.getByPlaceholderText('답글을 작성하세요')).toBeInTheDocument()
    )
  })

  it('depth=1인 대댓글에는 답글 버튼이 없다 (MAX_DEPTH=1)', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    const reply = makeComment({
      id: 2,
      content: '대댓글입니다.',
      userId: OTHER_ID,
      parentId: 1,
      replies: [],
    })
    vi.mocked(getComments).mockResolvedValue([makeComment({ replies: [reply] })])
    renderSection()

    await waitFor(() => {
      expect(screen.getByText('테스트 댓글입니다.')).toBeInTheDocument()
      expect(screen.getByText('대댓글입니다.')).toBeInTheDocument()
    })

    // 루트 댓글의 "답글" 버튼은 있지만, 대댓글 아이템에는 답글 버튼이 없어야 함
    const replyBtns = screen.getAllByText('답글')
    expect(replyBtns).toHaveLength(1) // 루트 댓글에만 있음
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentItem — 삭제된 댓글 (소프트 삭제)', () => {
  it('userId가 null이면 "(삭제됨)" 표시', async () => {
    vi.mocked(getComments).mockResolvedValue([
      makeComment({ userId: null, content: '삭제된 댓글입니다.' }),
    ])
    renderSection()
    await waitFor(() => expect(screen.getByText('(삭제됨)')).toBeInTheDocument())
  })

  it('삭제된 댓글에는 수정·삭제 버튼이 없다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(getComments).mockResolvedValue([
      makeComment({ userId: null, content: '삭제된 댓글입니다.' }),
    ])
    renderSection()
    await waitFor(() => screen.getByText('(삭제됨)'))
    expect(screen.queryByText('수정')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────
describe('CommentForm — 유효성 검사', () => {
  it('내용이 비어있으면 등록 버튼이 비활성화된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    renderSection()

    const submitBtn = await screen.findByText('등록')
    expect(submitBtn).toBeDisabled()
  })

  it('공백만 있으면 등록 버튼이 비활성화된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    renderSection()

    const textarea = await screen.findByPlaceholderText('댓글을 작성하세요')
    fireEvent.change(textarea, { target: { value: '   ' } })

    expect(screen.getByText('등록')).toBeDisabled()
  })

  it('내용 입력 후 등록 버튼이 활성화된다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    renderSection()

    const textarea = await screen.findByPlaceholderText('댓글을 작성하세요')
    fireEvent.change(textarea, { target: { value: '내용 입력' } })

    expect(screen.getByText('등록')).not.toBeDisabled()
  })

  it('Ctrl+Enter로 댓글을 제출할 수 있다', async () => {
    vi.mocked(useAuth).mockReturnValue(MEMBER)
    vi.mocked(createComment).mockResolvedValue(makeComment({ content: '단축키 제출' }))
    renderSection()

    const textarea = await screen.findByPlaceholderText('댓글을 작성하세요')
    fireEvent.change(textarea, { target: { value: '단축키 제출' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    await waitFor(() => expect(createComment).toHaveBeenCalledWith(1, { content: '단축키 제출' }))
  })
})
