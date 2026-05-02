import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePageTransition } from '../hooks/usePageTransition'
import { categories } from '../data/mock'

const CONTENT_CATEGORIES = categories.filter((c) => c !== '전체')

type Tab = 'write' | 'preview'

interface FormState {
  title: string
  category: string
  tags: string
  content: string
}

export default function ArticleWritePage() {
  const visible = usePageTransition()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    title: '',
    category: CONTENT_CATEGORIES[0],
    tags: '',
    content: '',
  })
  const [tab, setTab] = useState<Tab>('write')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const isValid = form.title.trim().length > 0 && form.content.trim().length > 0

  async function handlePublish() {
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    // TODO: POST /api/articles
    await new Promise((r) => setTimeout(r, 800))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <div className="w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">발행 완료!</h2>
            <p className="mt-2 text-sm text-text-secondary">아티클이 성공적으로 발행되었습니다.</p>
          </div>
          <button
            onClick={() => navigate('/articles')}
            className="px-5 py-2 text-sm bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors"
          >
            아티클 목록으로
          </button>
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
            {/* Mobile tabs */}
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
            <button
              onClick={() => navigate(-1)}
              className="text-xs px-3 py-1.5 text-text-tertiary hover:text-text-primary transition-colors"
            >
              취소
            </button>
            <button
              onClick={handlePublish}
              disabled={!isValid || isSubmitting}
              className="text-xs px-4 py-1.5 bg-accent-primary hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isSubmitting ? '발행 중...' : '발행'}
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

          {/* Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-tertiary">카테고리</span>
            <div className="flex gap-1.5 flex-wrap">
              {CONTENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => update('category', cat)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    form.category === cat
                      ? 'border-accent-primary bg-accent-muted text-accent-secondary'
                      : 'border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary shrink-0">태그</span>
            <input
              type="text"
              placeholder="태그를 쉼표로 구분해 입력하세요 (예: Spring, JPA)"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              className="flex-1 text-sm bg-transparent text-text-primary placeholder-text-tertiary/40 outline-none"
            />
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex gap-0 min-h-[calc(100vh-280px)]">
          {/* Editor pane */}
          <div className={`flex-1 ${tab === 'preview' ? 'hidden md:block' : 'block'} md:border-r border-border-default`}>
            <textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder={`마크다운으로 작성하세요...\n\n## 소제목\n\n본문 내용\n\n\`\`\`java\n// 코드 블록\n\`\`\``}
              className="w-full h-full min-h-[60vh] pt-6 pr-4 md:pr-8 text-sm font-mono bg-transparent text-text-primary placeholder-text-tertiary/30 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Preview pane */}
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