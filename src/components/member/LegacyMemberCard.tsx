import { memo } from 'react'
import { Link } from 'react-router-dom'
import { MemberAvatar } from './MemberAvatar'
import type { LegacyMember } from '../../types'

interface Props {
  member: LegacyMember
}

export const LegacyMemberCard = memo(function LegacyMemberCard({ member: m }: Props) {
  return (
    <Link
      to={`/legacy/${m.id}`}
      className="group flex items-start gap-3 py-4 px-4 border-b border-border-default last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
    >
      <MemberAvatar name={m.name} size="sm" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{m.name}</h3>
          {m.role === 'lead' && <span className="text-[10px] text-accent-primary/80">파트장</span>}
          <span className="text-[10px] text-text-tertiary">{m.department}</span>
        </div>
        <p className="text-xs text-text-secondary break-keep leading-relaxed">{m.bio}</p>
      </div>
      <p className="text-[11px] text-text-tertiary font-mono shrink-0 hidden sm:block whitespace-nowrap">
        {m.focus}
      </p>
    </Link>
  )
})
