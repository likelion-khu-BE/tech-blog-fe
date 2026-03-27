import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { MemberAvatar } from '../components/member/MemberAvatar'
import { OtherLegacyMembersGrid } from '../components/member/OtherMembersGrid'
import { TagList } from '../components/common/TagList'
import { findLegacyMember, legacyMembers } from '../data/legacy-members'

export default function LegacyMemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visible = usePageTransition()

  const member = useMemo(() => findLegacyMember(id ?? ''), [id])

  const otherMembers = useMemo(() => {
    if (!member) return []
    return legacyMembers
      .filter((m) => m.generation === member.generation && m.id !== member.id)
      .slice(0, 4)
  }, [member])

  if (!member) {
    return (
      <main className="pt-14">
        <div className="max-w-[700px] mx-auto px-4 md:px-5 py-32 text-center">
          <p className="text-text-tertiary text-sm">멤버를 찾을 수 없습니다.</p>
          <Link to="/members" className="text-accent-primary text-sm mt-4 inline-block">역대 멤버로 돌아가기</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-14">
      <section
        className={`max-w-[700px] mx-auto px-4 md:px-5 pt-12 md:pt-20 pb-12 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          &larr; 뒤로
        </button>

        <div className="flex items-center gap-4 mb-2">
          <MemberAvatar name={member.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{member.name}</h1>
              {member.role === 'lead' && <span className="text-[11px] text-accent-primary/80 font-medium">파트장</span>}
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">{member.generation}기 · {member.department}</p>
          </div>
        </div>

        <div className="my-6">
          <TagList tags={member.focus.split(' · ')} variant="accent" />
        </div>

        <p className="text-base text-text-primary leading-relaxed break-keep">{member.bio}</p>
        <p className="mt-4 text-sm text-text-secondary leading-relaxed break-keep italic">
          "{member.message}"
        </p>
      </section>

      <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>

      <section className="max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16">
        <h2 className="text-lg font-bold text-text-primary tracking-tight mb-6">업적</h2>
        <ul className="space-y-3">
          {member.achievements.map((a) => (
            <li key={a} className="text-sm text-text-secondary leading-relaxed break-keep">{a}</li>
          ))}
        </ul>
      </section>

      <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>

      <OtherLegacyMembersGrid members={otherMembers} />
    </main>
  )
}
