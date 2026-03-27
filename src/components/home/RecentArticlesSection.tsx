import { Link } from 'react-router-dom'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { articles } from '../../data/mock'
import { findMember } from '../../data/members'
import { timeAgo } from '../../utils/time'

const recentArticles = articles.slice(0, 4)

export function RecentArticlesSection() {
  const { ref, isVisible } = useIntersectionObserver()

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
          {recentArticles.map((article, idx) => (
            <Link
              key={article.slug}
              to="/articles"
              className={`block py-5 border-b border-border-default group transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: isVisible ? `${idx * 80 + 200}ms` : '0ms' }}
            >
              <h3 className="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
                {article.title}
              </h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed break-keep line-clamp-2">
                {article.summary}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                <span>{findMember(article.authorId)?.name}</span>
                <span>&middot;</span>
                <time className="tabular-nums">{timeAgo(article.date)}</time>
                <span>&middot;</span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  {article.readingTime}분
                </span>
                <span className="ml-auto hidden sm:flex gap-1.5 font-mono text-[10px]">
                  {article.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
