import { useMemo } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePageTransition } from '../hooks/usePageTransition'
import { MemberAvatar } from '../components/member/MemberAvatar'
import { findMember } from '../data/members'
import { articles } from '../data/mock'
import { timeAgo } from '../utils/time'

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const visible = usePageTransition()

  const article = useMemo(() => articles.find((a) => a.slug === slug), [slug])

  if (!article) return <Navigate to="/articles" replace />

  const author = findMember(article.authorId)

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
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] px-2 py-0.5 bg-accent-muted text-accent-secondary rounded">
            {article.category}
          </span>
          <span className="text-xs text-text-tertiary inline-flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {article.readingTime}분
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary leading-snug break-keep">
          {article.title}
        </h1>

        <p className="mt-3 text-sm text-text-secondary leading-relaxed break-keep">
          {article.summary}
        </p>

        <div className="mt-6 flex items-center gap-3">
          {author && (
            <>
              <MemberAvatar name={author.name} avatar={author.avatar} size="sm" className="!w-7 !h-7 !text-[11px]" />
              <div>
                <p className="text-sm font-medium text-text-primary">{author.name}</p>
                <p className="text-xs text-text-tertiary">{timeAgo(article.date)}</p>
              </div>
            </>
          )}
        </div>

        {article.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <span key={tag} className="font-mono text-[10px] px-2 py-0.5 bg-bg-tertiary rounded text-text-tertiary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className={`py-10 pb-20 transition-all duration-700 delay-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {article.content ? (
          <div className="article-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-text-tertiary">아직 본문이 작성되지 않았습니다.</p>
          </div>
        )}
      </div>

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