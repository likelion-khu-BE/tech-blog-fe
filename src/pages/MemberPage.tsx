import { useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { MemberAvatar } from '../components/member/MemberAvatar'
import { OtherMembersGrid } from '../components/member/OtherMembersGrid'
import { TagList } from '../components/common/TagList'
import { findMember, members } from '../data/members'
import { articles } from '../data/mock'
import { timeAgo } from '../utils/time'

export default function MemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visible = usePageTransition()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const member = useMemo(() => findMember(id ?? ''), [id])

  const memberArticles = useMemo(() => {
    if (!member) return []
    return articles.filter((a) => member.articles.includes(a.slug))
  }, [member])

  const otherMembers = useMemo(() => {
    if (!member) return []
    const others = members.filter((m) => m.id !== member.id)
    return [...others].sort(() => Math.random() - 0.5).slice(0, 4)
  }, [member])

  if (!member) {
    return (
      <main className="pt-14">
        <div className="max-w-[700px] mx-auto px-4 md:px-5 py-32 text-center">
          <p className="text-text-tertiary text-sm">멤버를 찾을 수 없습니다.</p>
          <Link to="/" className="text-accent-primary text-sm mt-4 inline-block">돌아가기</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-14">
      {/* Header */}
      <section
        className={`relative max-w-[700px] mx-auto px-4 md:px-5 pt-12 md:pt-20 pb-12 transition-all duration-700 ease-out ${
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
          <MemberAvatar name={member.name} avatar={member.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {member.name}
            </h1>
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-primary transition-colors font-mono"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              {member.github}
            </a>
          </div>
        </div>

        <p className="text-xs text-text-tertiary mb-6">{member.generation}기 · {member.part} · {member.department}</p>

        <div className="mb-8">
          <TagList tags={member.studying} variant="accent" />
        </div>

        <p className="text-base text-text-primary leading-relaxed break-keep">{member.bio}</p>
        <p className="mt-4 text-sm text-text-secondary leading-relaxed break-keep">"{member.message}"</p>
      </section>

      <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>

      {/* 탐구 기록 + 관심 분야 */}
      <section
        className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16 transition-all duration-700 delay-100 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h2 className="text-lg font-bold text-text-primary tracking-tight mb-8">탐구 기록</h2>
        <div className="divide-y divide-border-default">
          {member.logs.map((c) => (
            <div key={c.title} className="py-5 first:pt-0">
              <h3 className="text-sm font-medium text-text-primary">{c.title}</h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-relaxed break-keep">{c.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-xs text-text-tertiary mb-3">관심 분야</p>
          <TagList tags={member.curious} variant="outline" />
        </div>
      </section>

      {/* 작성한 아티클 */}
      {memberArticles.length > 0 && (
        <>
          <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>
          <section
            className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 md:py-16 transition-all duration-700 delay-200 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-bold text-text-primary tracking-tight mb-6">작성한 아티클</h2>
            {memberArticles.map((article) => (
              <Link
                key={article.slug}
                to="/articles"
                className="block py-4 border-b border-border-default group"
              >
                <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors break-keep">
                  {article.title}
                </h3>
                <p className="mt-1 text-xs text-text-secondary break-keep line-clamp-2">
                  {article.summary}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-text-tertiary">
                  <time className="tabular-nums">{timeAgo(article.date)}</time>
                  <span>&middot;</span>
                  <span>{article.readingTime}분</span>
                </div>
              </Link>
            ))}
          </section>
        </>
      )}

      <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>

      <OtherMembersGrid members={otherMembers} />
    </main>
  )
}
