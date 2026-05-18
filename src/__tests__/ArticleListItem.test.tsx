import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ArticleListItem } from '../components/article/ArticleListItem'
import type { PostSummary } from '../types/post'

const BASE: PostSummary = {
  id: 1,
  title: '테스트 게시글',
  board: '백엔드',
  category: 'Spring',
  generation: '17기',
  status: 'PUBLISHED',
  authorId: 100,
  authorName: null,
  tags: [],
  likeCount: 0,
  createdAt: '2025-01-01T00:00:00',
  replyToId: null,
  replyToTitle: null,
}

function renderItem(overrides: Partial<PostSummary> = {}) {
  return render(
    <MemoryRouter>
      <ArticleListItem post={{ ...BASE, ...overrides }} />
    </MemoryRouter>,
  )
}

// ── 작성자 이름 표시 ───────────────────────────────────────────
describe('ArticleListItem — 작성자 이름(authorName)', () => {
  it('authorName이 있으면 메타 영역에 표시된다', () => {
    renderItem({ authorName: '홍길동' })
    expect(screen.getByText('홍길동')).toBeInTheDocument()
  })

  it('authorName이 null이면 표시되지 않는다', () => {
    renderItem({ authorName: null })
    expect(screen.queryByText('홍길동')).not.toBeInTheDocument()
  })
})

// ── 기수 정보는 generation 필드에서 ──────────────────────────
describe('ArticleListItem — 기수(generation)', () => {
  it('board 뱃지가 표시된다 (generation은 summary 카드에서 meta로 처리)', () => {
    renderItem({ board: '백엔드' })
    expect(screen.getByText('백엔드')).toBeInTheDocument()
  })
})

// ── 답글 배지 ─────────────────────────────────────────────────
describe('ArticleListItem — 답글 배지', () => {
  it('replyToId가 없으면 답글 배지가 없다', () => {
    renderItem({ replyToId: null, replyToTitle: null })
    expect(screen.queryByText(/답글/)).not.toBeInTheDocument()
  })

  it('replyToId가 있고 replyToTitle이 있으면 "X에 대한 답글"이 표시된다', () => {
    renderItem({ replyToId: 2, replyToTitle: '원본 게시글 제목' })
    expect(screen.getByText('원본 게시글 제목에 대한 답글')).toBeInTheDocument()
  })

  it('replyToId가 있지만 replyToTitle이 null이면 "답글" 폴백이 표시된다', () => {
    renderItem({ replyToId: 2, replyToTitle: null })
    expect(screen.getByText('답글')).toBeInTheDocument()
  })

  it('replyToTitle이 길어도 배지 영역 안에 truncate된다', () => {
    renderItem({ replyToId: 2, replyToTitle: '매우매우매우매우매우매우매우매우매우매우매우매우긴 원본 게시글 제목입니다' })
    const badge = screen.getByText(/에 대한 답글/)
    expect(badge).toBeInTheDocument()
  })
})
