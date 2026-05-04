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
              <h3 className="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
                {post.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                <span className="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px]">{post.board}</span>
                <span>&middot;</span>
                <time className="tabular-nums">{timeAgo(post.createdAt)}</time>
                {post.tags.length > 0 && (
                  <span className="ml-auto hidden sm:flex gap-1.5 font-mono text-[10px]">
                    {post.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
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
