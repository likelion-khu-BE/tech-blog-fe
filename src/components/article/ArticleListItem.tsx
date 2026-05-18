import { memo } from 'react'
import { Link } from 'react-router-dom'
import { timeAgo } from '../../utils/time'
import type { PostSummary } from '../../types/post'

interface Props {
  post: PostSummary
  showNewBadge?: boolean
  showTags?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export const ArticleListItem = memo(function ArticleListItem({
  post,
  showNewBadge = false,
  showTags = true,
  onClick,
  className = '',
  style,
}: Props) {
  return (
    <Link
      to={`/articles/${post.id}`}
      className={`block py-5 border-b border-border-default group ${className}`}
      onClick={onClick}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
              {post.title}
            </h3>
            {showNewBadge && <span className="shrink-0 text-[10px] text-accent-primary/80">NEW</span>}
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-xs text-text-tertiary">
            <span className="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px]">{post.board}</span>
            <span>&middot;</span>
            <span>{post.category}</span>
            {post.authorEmail && (
              <>
                <span>&middot;</span>
                <span>{post.authorEmail.split('@')[0]}</span>
              </>
            )}
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
            {showTags && post.tags.length > 0 && (
              <span className="ml-auto hidden sm:flex gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px]">{tag}</span>
                ))}
              </span>
            )}
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
  )
})
