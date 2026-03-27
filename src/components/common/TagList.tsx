import { memo } from 'react'

interface Props {
  tags: string[]
  variant?: 'accent' | 'outline'
}

export const TagList = memo(function TagList({ tags, variant = 'accent' }: Props) {
  const className = variant === 'accent'
    ? 'font-mono text-[11px] text-accent-secondary px-2 py-0.5 bg-accent-muted rounded'
    : 'text-xs text-text-secondary px-2.5 py-1 border border-border-default rounded-md'

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={className}>{tag}</span>
      ))}
    </div>
  )
})
