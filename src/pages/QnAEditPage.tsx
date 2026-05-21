import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { useAuth } from '../contexts/AuthContext'
import { getQuestion, updateQuestion, getTags } from '../api/qna'
import type { QnaTag } from '../types/qna'

export default function QnAEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visible = usePageTransition()
  const { userId } = useAuth()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<QnaTag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!id) { setIsLoading(false); return }
    Promise.all([getQuestion(Number(id)), getTags()])
      .then(([q, allTags]) => {
        if (q.author.userId !== userId) {
          navigate(`/qna/${id}`, { replace: true })
          return
        }
        setTitle(q.title)
        setContent(q.content)
        setTags(allTags)
        setSelectedTagIds(q.tags.map((t) => t.id))
      })
      .catch(() => navigate('/qna', { replace: true }))
      .finally(() => setIsLoading(false))
  }, [id, userId, navigate])

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setIsSubmitting(true)
    try {
      await updateQuestion(Number(id), {
        title: title.trim(),
        content: content.trim(),
        tagIds: selectedTagIds,
      })
      navigate(`/qna/${id}`, { replace: true })
    } catch {
      alert('수정에 실패했습니다.')
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
    <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
      <div
        className={`pt-8 md:pt-12 transition-opacity duration-500 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <Link
          to={`/qna/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          질문으로 돌아가기
        </Link>
      </div>

      <header
        className={`pt-8 pb-8 transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
          질문 수정
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className={`pb-16 space-y-6 transition-all duration-700 delay-100 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors"
          />
        </div>

        {tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              태그
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`text-sm px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTagIds.includes(tag.id)
                      ? 'border-accent-primary bg-accent-muted text-accent-secondary'
                      : 'border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            내용 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary/50 outline-none focus:border-border-hover transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link
            to={`/qna/${id}`}
            className="px-4 py-3 text-sm rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="px-4 py-1.5 text-sm rounded-md bg-accent-muted text-accent-secondary hover:bg-accent-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </main>
  )
}
