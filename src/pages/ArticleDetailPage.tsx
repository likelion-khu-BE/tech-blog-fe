import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePageTransition } from '../hooks/usePageTransition'
import { useAuth } from '../contexts/AuthContext'
import { getPost, deletePost } from '../api/posts'
import { timeAgo } from '../utils/time'
import { CommentSection } from '../components/comment/CommentSection'
import type { Post } from '../types/post'

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visible = usePageTransition()
  const { isAuthenticated, userId, role } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setNotFound(false)
    getPost(Number(id))
      .then(setPost)
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
        <div className="pt-40 flex justify-center">
          <div className="w-5 h-5 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  if (notFound || !post) {
    return (
      <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
        <div className="pt-40 text-center">
          <p className="text-sm text-text-tertiary">게시글을 찾을 수 없습니다.</p>
          <Link to="/articles" className="mt-4 inline-block text-sm text-accent-primary hover:underline">
            목록으로
          </Link>
        </div>
      </main>
    )
  }

  const canEdit = isAuthenticated && (userId === post.authorId || role === 'ADMIN')

  async function handleDelete() {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    setIsDeleting(true)
    try {
      await deletePost(post!.id)
      navigate('/articles', { replace: true })
    } catch {
      alert('삭제에 실패했습니다.')
      setIsDeleting(false)
    }
  }

  return (
    <main className="max-w-[700px] mx-auto px-4 md:px-5 pt-14">
      {/* Back */}
      <div className={`pt-8 md:pt-12 transition-opacity duration-500 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          아티클 목록
        </Link>
      </div>

      {/* Header */}
      <header className={`pt-8 pb-8 border-b border-border-default transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 bg-accent-muted text-accent-secondary rounded">
              {post.board}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 bg-bg-tertiary text-text-tertiary rounded">
              {post.category}
            </span>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <Link
                to={`/articles/${post.id}/edit`}
                className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-text-tertiary hover:text-red-400 transition-colors disabled:opacity-40"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-snug break-keep">
          {post.title}
        </h1>

        <div className="mt-6 flex items-center gap-3 text-xs text-text-tertiary">
          {post.authorEmail && <span>{post.authorEmail.split('@')[0]}</span>}
          {post.authorEmail && <span>&middot;</span>}
          <span>{post.generation}</span>
          <span>&middot;</span>
          <span>{timeAgo(post.createdAt)}</span>
          {post.likeCount > 0 && (
            <>
              <span>&middot;</span>
              <span className="inline-flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {post.likeCount}
              </span>
            </>
          )}
        </div>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="font-mono text-[10px] px-2 py-0.5 bg-bg-tertiary rounded text-text-tertiary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className={`py-10 pb-20 transition-all duration-700 delay-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {post.content ? (
          <div className="article-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-text-tertiary">아직 본문이 작성되지 않았습니다.</p>
          </div>
        )}
      </div>

      <CommentSection postId={post.id} />

      {/* Footer nav */}
      <div className="border-t border-border-default py-8 mb-16">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-sm text-text-tertiary hover:text-accent-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          모든 아티클 보기
        </Link>
      </div>
    </main>
  )
}
