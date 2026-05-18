import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { getPosts } from '../../api/posts'
import { timeAgo } from '../../utils/time'
import type { PostSummary } from '../../types/post'

export function RecentArticlesSection() {
  const { ref, isVisible } = useIntersectionObserver()
  const [posts, setPosts] = useState<PostSummary[]>([])

  useEffect(() => {
    getPosts({ page: 0, size: 4 }).then((data) => setPosts(data.content)).catch(() => {})
  }, [])

  if (posts.length === 0) return null

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`bg-bg-secondary transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="max-w-[900px] mx-auto px-4 md:px-5 py-14 md:py-28">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-text-primary tracking-tight">엔지니어링 아티클</h2>
          <Link to="/articles" className="text-xs text-text-tertiary hover:text-accent-primary transition-colors">
            전체 보기 &rarr;
          </Link>
        </div>

        <div className="border-t border-border-default">
          {posts.map((post, idx) => (
            <Link
              key={post.id}
              to={`/articles/${post.id}`}
              className={`block py-5 border-b border-border-default group transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: isVisible ? `${idx * 80 + 200}ms` : '0ms' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                    <span className="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px]">{post.board}</span>
                    <span>&middot;</span>
                    <time className="tabular-nums">{timeAgo(post.createdAt)}</time>
                  </div>
                </div>

                {post.replyToId && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-default max-w-[180px]">
                    <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="truncate">
                      {post.replyToTitle ? `${post.replyToTitle}에 대한 답글` : '답글'}
                    </span>
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
