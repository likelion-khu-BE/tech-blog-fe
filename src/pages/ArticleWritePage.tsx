import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePageTransition } from '../hooks/usePageTransition'
import { createPost, updatePost, getPost } from '../api/posts'
import { BOARDS, CATEGORIES } from '../types/post'
import type { PostStatus } from '../types/post'

type Tab = 'write' | 'preview'

interface FormState {
  title: string
  board: string
  category: string
  status: PostStatus
  content: string
  tags: string[]
}

const DEFAULT_FORM: FormState = {
  title: '',
  board: BOARDS[0],
  category: '',
  status: 'DRAFT',
  content: '',
  tags: [],
}

export default function ArticleWritePage() {
  const visible = usePageTransition()
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const isEditMode = Boolean(id)

  // 원글 ID (작성 모드에서만 유효) — NaN 방지
  const rawReplyTo = !isEditMode ? searchParams.get('replyTo') : null
  const parsedReplyTo = rawReplyTo ? Number(rawReplyTo) : null
  const replyToId = parsedReplyTo !== null && Number.isInteger(parsedReplyTo) && parsedReplyTo > 0
    ? parsedReplyTo
    : null
  const [replyOriginal, setReplyOriginal] = useState<{ id: number; title: string } | null>(null)
  const [replyOriginalNotFound, setReplyOriginalNotFound] = useState(false)
  const [replyOriginalFailed, setReplyOriginalFailed] = useState(false)

  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [tab, setTab] = useState<Tab>('write')
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)

  // 수정 모드: 기존 게시글 불러오기
  useEffect(() => {
    if (!isEditMode || !id) return
    getPost(Number(id))
      .then((post) => {
        setForm({
          title: post.title,
          board: post.board,
          category: post.category,
          status: post.status,
          content: post.content,
          tags: post.tags ?? [],
        })
      })
      .catch(() => setError('게시글을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [id, isEditMode])

  // 원글 게시글 제목 조회
  useEffect(() => {
    if (!replyToId) return
    setReplyOriginal(null)
    setReplyOriginalNotFound(false)
    setReplyOriginalFailed(false)
    getPost(replyToId)
      .then((p) => setReplyOriginal({ id: p.id, title: p.title }))
      .catch((err) => {
        if (err?.response?.status === 404) setReplyOriginalNotFound(true)
        else setReplyOriginalFailed(true)
      })
  }, [replyToId])

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const isValid = form.title.trim().length > 0 && form.content.trim().length > 0 && form.category.trim().length > 0

  async function handleSubmit() {
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      if (isEditMode && id) {
        const updated = await updatePost(Number(id), {
          title: form.title,
          content: form.content,
          board: form.board,
          category: form.category,
          status: form.status,
          tags: form.tags,
        })
        navigate(`/articles/${updated.id}`, { replace: true })
      } else {
        const created = await createPost({
          title: form.title,
          content: form.content,
          board: form.board,
          category: form.category,
          status: form.status,
          tags: form.tags,
          replyToId: replyToId ?? undefined,
        })
        navigate(`/articles/${created.id}`, { replace: true })
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? '저장에 실패했습니다. 다시 시도해주세요.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
        <div className="pt-40 flex justify-center">
          <div className="w-5 h-5 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className={`pt-14 min-h-screen transition-opacity duration-500 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Top bar */}
      <div className="sticky top-14 z-40 bg-bg-primary/95 backdrop-blur-lg border-b border-border-default">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex md:hidden bg-bg-tertiary rounded-lg p-0.5 text-xs">
              {(['write', 'preview'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-md transition-colors ${tab === t ? 'bg-bg-elevated text-text-primary' : 'text-text-tertiary'}`}
                >
                  {t === 'write' ? '작성' : '미리보기'}
                </button>
              ))}
            </div>
            <span className="hidden md:block text-xs text-text-tertiary">좌: 에디터 · 우: 미리보기</span>
          </div>

          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-400">{error}</span>}
            <button
              onClick={() => navigate(-1)}
              className="text-xs px-3 py-1.5 text-text-tertiary hover:text-text-primary transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="text-xs px-4 py-1.5 bg-accent-primary hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (isEditMode ? '저장 중...' : '발행 중...') : (isEditMode ? '저장' : '발행')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-5">
        {/* Meta fields */}
        <div className="py-6 border-b border-border-default space-y-4">
          {/* 원글 배너 */}
          {replyToId && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-default">
              <svg className="w-3.5 h-3.5 shrink-0 text-text-tertiary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs text-text-tertiary shrink-0">원글:</span>
              {replyOriginal ? (
                <Link
                  to={`/articles/${replyOriginal.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-primary hover:underline underline-offset-2 truncate"
                >
                  {replyOriginal.title}
                </Link>
              ) : replyOriginalNotFound ? (
                <span className="text-xs text-text-tertiary/60">(삭제된 게시글)</span>
              ) : replyOriginalFailed ? (
                <span className="text-xs text-text-tertiary/60">원글을 불러올 수 없습니다.</span>
              ) : (
                <span className="text-xs text-text-tertiary/60">불러오는 중...</span>
              )}
            </div>
          )}

          {/* Title */}
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full text-2xl md:text-3xl font-bold bg-transparent text-text-primary placeholder-text-tertiary/50 outline-none"
          />

          {/* Board */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-tertiary w-12 shrink-0">게시판</span>
            <div className="flex gap-1.5 flex-wrap">
              {BOARDS.map((b) => (
                <button
                  key={b}
                  onClick={() => update('board', b)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    form.board === b
                      ? 'border-accent-primary bg-accent-muted text-accent-secondary'
                      : 'border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-2">
            <span className="text-xs text-text-tertiary w-12 shrink-0 pt-1.5">카테고리</span>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => update('category', c)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    form.category === c
                      ? 'border-accent-primary bg-accent-muted text-accent-secondary'
                      : 'border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-start gap-2">
            <span className="text-xs text-text-tertiary w-12 shrink-0 pt-1">태그</span>
            <div
              className="flex flex-wrap items-center gap-1.5 cursor-text"
              onClick={() => tagInputRef.current?.focus()}
            >
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-border-default text-text-tertiary hover:border-border-hover"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      update('tags', form.tags.filter((t) => t !== tag))
                    }}
                    className="hover:text-text-primary transition-colors leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const tag = tagInput.trim().replace(/,$/, '')
                    if (tag && !form.tags.includes(tag)) {
                      update('tags', [...form.tags, tag])
                    }
                    setTagInput('')
                  } else if (e.key === 'Backspace' && tagInput === '' && form.tags.length > 0) {
                    update('tags', form.tags.slice(0, -1))
                  }
                }}
                placeholder={form.tags.length === 0 ? '태그 입력 후 Enter (선택)' : ''}
                className="text-xs bg-transparent text-text-tertiary placeholder-text-tertiary/40 outline-none min-w-[160px] py-1 leading-none"
              />
            </div>
          </div>

        </div>

        {/* Editor / Preview */}
        <div className="flex gap-0 min-h-[calc(100vh-380px)]">
          <div className={`flex-1 ${tab === 'preview' ? 'hidden md:block' : 'block'} md:border-r border-border-default`}>
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder={`마크다운으로 작성하세요...\n\n## 소제목\n\n본문 내용\n\n\`\`\`java\n// 코드 블록\n\`\`\``}
              className="w-full h-full min-h-[60vh] pt-6 pr-4 md:pr-8 text-sm font-mono bg-transparent text-text-primary placeholder-text-tertiary/30 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className={`flex-1 ${tab === 'write' ? 'hidden md:block' : 'block'}`}>
            <div className="pt-6 pl-0 md:pl-8">
              {form.content.trim() ? (
                <div className="article-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-text-tertiary/40 italic">미리보기가 여기에 표시됩니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
