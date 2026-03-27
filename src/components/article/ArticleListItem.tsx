import { memo } from 'react'
import { MemberAvatar } from '../member/MemberAvatar'
import { findMember } from '../../data/members'
import { timeAgo } from '../../utils/time'
import type { Article } from '../../types'

interface Props {
  article: Article
  showNewBadge?: boolean
  showTags?: boolean
  showAvatar?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export const ArticleListItem = memo(function ArticleListItem({
  article,
  showNewBadge = false,
  showTags = true,
  showAvatar = true,
  onClick,
  className = '',
  style,
}: Props) {
  const author = findMember(article.authorId)

  return (
    <a
      href="#"
      className={`block py-5 border-b border-border-default group ${className}`}
      onClick={(e) => { e.preventDefault(); onClick?.() }}
      style={style}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm md:text-base font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep leading-snug">
          {article.title}
        </h3>
        {showNewBadge && <span className="shrink-0 text-[10px] text-accent-primary/80">NEW</span>}
      </div>

      <p className="mt-1.5 text-sm text-text-secondary leading-relaxed break-keep line-clamp-2">
        {article.summary}
      </p>

      <div className="mt-2.5 flex items-center gap-2 text-xs text-text-tertiary">
        {showAvatar && author && (
          <MemberAvatar name={author.name} avatar={author.avatar} size="sm" className="!w-5 !h-5 !text-[9px]" />
        )}
        <span>{author?.name}</span>
        <span>&middot;</span>
        <span>{timeAgo(article.date)}</span>
        <span>&middot;</span>
        <span className="inline-flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {article.readingTime}분
        </span>
        {showTags && (
          <span className="ml-auto hidden sm:flex gap-1.5">
            {article.tags.map((tag) => (
              <span key={tag} className="font-mono px-1.5 py-0.5 bg-bg-tertiary rounded text-[10px]">{tag}</span>
            ))}
          </span>
        )}
      </div>
    </a>
  )
})
