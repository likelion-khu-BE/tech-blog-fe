import { Link } from 'react-router-dom'
import { MemberAvatar } from './MemberAvatar'
import type { Member, LegacyMember } from '../../types'

interface MemberGridProps {
  members: Member[]
  label?: string
}

export function OtherMembersGrid({ members, label = '다른 멤버' }: MemberGridProps) {
  return (
    <section className="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16">
      <p className="text-xs text-text-tertiary mb-4">{label}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {members.map((m) => (
          <Link
            key={m.id}
            to={`/members/${m.id}`}
            className="group flex items-center gap-3 p-3.5 bg-bg-secondary border border-border-default rounded-lg hover:border-border-hover transition-colors"
          >
            <MemberAvatar name={m.name} avatar={m.avatar} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{m.name}</p>
              <p className="text-[11px] text-text-tertiary truncate">{m.studying[0]}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

interface LegacyGridProps {
  members: LegacyMember[]
}

export function OtherLegacyMembersGrid({ members }: LegacyGridProps) {
  return (
    <section className="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16">
      <p className="text-xs text-text-tertiary mb-4">같은 기수</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {members.map((m) => (
          <Link
            key={m.id}
            to={`/legacy/${m.id}`}
            className="group flex items-center gap-3 p-3.5 bg-bg-secondary border border-border-default rounded-lg hover:border-border-hover transition-colors"
          >
            <MemberAvatar name={m.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{m.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
