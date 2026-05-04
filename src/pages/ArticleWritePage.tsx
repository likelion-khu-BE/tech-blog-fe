import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePageTransition } from '../hooks/usePageTransition'
import { createPost, updatePost, getPost } from '../api/posts'
import { BOARDS, GENERATIONS } from '../types/post'
import type { PostStatus } from '../types/post'

type Tab = 'write' | 'preview'

interface FormState {
  title: string
  board: string
  category: string
  generation: string
  status: PostStatus
  tags: string
  content: string
}

const DEFAULT_FORM: FormState = {
  title: '',
  board: BOARDS[0],
  category: '',
  generation: GENERATIONS[0],
  status: 'PUBLISHED',
  tags: '',
  content: '',
}

export default function ArticleWritePage() {
  const visible = usePageTransition()
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [tab, setTab] = useState<Tab>('write')
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 수정 모드: 기존 게시글 불러오기
  useEffect(() => {
    if (!isEditMode || !id) return
    getPost(Number(id))
      .then((post) => {
        setForm({
          title: post.title,
          board: post.board,
          category: post.category,
          generation: post.generation,
          status: post.status,
          tags: post.tags.join(', '),
          content: post.content,
        })
      })
      .catch(() => setError('게시글을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [id, isEditMode])

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const isValid = form.title.trim().length > 0 && form.content.trim().length > 0 && form.category.trim().length > 0

  async function handleSubmit() {
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (isEditMode && id) {
        const updated = await updatePost(Number(id), {
          title: form.title,
          content: form.content,
          board: form.board,
          category: form.category,
          status: form.status,
          tags,
        })
        navigate(`/articles/${updated.id}`, { replace: true })
      } else {
        const created = await createPost({
          title: form.title,
          content: form.content,
          board: form.board,
          category: form.category,
          status: form.status,
          generation: form.generation,
          tags,
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary w-12 shrink-0">카테고리</span>
            <input
              type="text"
              placeholder="예: CI/CD, Authentication, Hooks"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="flex-1 text-sm bg-transparent text-text-primary placeholder-text-tertiary/40 outline-none"
            />
          </div>

          {/* Generation (수정 모드에서는 숨김 — PUT 요청에 generation 없음) */}
          {!isEditMode && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-tertiary w-12 shrink-0">기수</span>
              <div className="flex gap-1.5">
                {GENERATIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => update('generation', g)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      form.generation === g
                        ? 'border-accent-primary bg-accent-muted text-accent-secondary'
                        : 'border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary w-12 shrink-0">공개</span>
            <div className="flex bg-bg-tertiary rounded-lg p-0.5 text-xs">
              {(['PUBLISHED', 'DRAFT'] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => update('status', s)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    form.status === s ? 'bg-bg-elevated text-text-primary' : 'text-text-tertiary'
                  }`}
                >
                  {s === 'PUBLISHED' ? '공개' : '임시저장'}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary w-12 shrink-0">태그</span>
            <input
              type="text"
              placeholder="쉼표로 구분 (예: Spring, JPA)"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              className="flex-1 text-sm bg-transparent text-text-primary placeholder-text-tertiary/40 outline-none"
            />
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
