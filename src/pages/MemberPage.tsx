import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { getMember, getMemberStats, getMemberActivities } from '../api/profile'
import type { MemberDetail, MemberTechStack, SessionType, MemberStats, ActivityPage, ActivityType } from '../types/profile'

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  blog_post: '블로그 글',
  blog_comment: '블로그 댓글',
  blog_post_like: '블로그 좋아요',
  blog_post_like_received: '블로그 좋아요 받음',
  qna_question: 'Q&A 질문',
  qna_answer: 'Q&A 답변',
  qna_accepted: 'Q&A 채택',
  qna_answer_upvote: 'Q&A 추천',
  qna_answer_downvote: 'Q&A 비추천',
  qna_comment: 'Q&A 댓글',
  session_speak: '세션 발표',
  session_event_post: '세션 게시글',
  session_event_comment: '세션 댓글',
  session_event_post_like: '세션 좋아요',
  session_event_post_like_received: '세션 좋아요 받음',
}

const SESSION_LABEL: Record<SessionType, string> = {
  backend: '백엔드',
  frontend: '프론트엔드',
  design: '디자인',
  ai: 'AI',
  pm: 'PM',
  etc: '기타',
}

const CATEGORY_LABEL: Record<string, string> = {
  language: '언어',
  framework: '프레임워크',
  ai: 'AI',
  design: '디자인',
  tool: '도구',
  infra: '인프라',
  etc: '기타',
}

function parseLinks(json: string | null): Record<string, string> {
  if (!json) return {}
  try {
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function TechStackBadge({ stack }: { stack: MemberTechStack }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-secondary border border-border-default">
      {stack.logoUrl && (
        <span className="flex items-center justify-center w-6 h-6 rounded bg-white/15 p-0.5 shrink-0">
          <img src={stack.logoUrl} alt={stack.name} className="w-full h-full object-contain" />
        </span>
      )}
      <span className="text-xs text-text-secondary">{stack.name}</span>
      {stack.proficiency != null && (
        <div className="flex gap-0.5 ml-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 h-1 rounded-full ${i < stack.proficiency! ? 'bg-purple-400' : 'bg-bg-tertiary'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MemberPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visible = usePageTransition()
  const [member, setMember] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [activities, setActivities] = useState<ActivityPage | null>(null)
  const [activitiesPage, setActivitiesPage] = useState(0)
  const [activitiesLoading, setActivitiesLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!id || isNaN(Number(id))) {
      setError('잘못된 접근입니다.')
      setLoading(false)
      return
    }
    const memberId = Number(id)
    setLoading(true)
    Promise.all([getMember(memberId), getMemberStats(memberId)])
      .then(([m, s]) => { setMember(m); setStats(s) })
      .catch(() => setError('멤버를 찾을 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || isNaN(Number(id))) return
    setActivitiesLoading(true)
    getMemberActivities(Number(id), { page: activitiesPage, size: 10 })
      .then(setActivities)
      .catch(() => {})
      .finally(() => setActivitiesLoading(false))
  }, [id, activitiesPage])

  if (loading) {
    return (
      <main className="pt-14">
        <div className="max-w-[700px] mx-auto px-4 md:px-5 py-32 text-center text-text-tertiary text-sm">
          불러오는 중...
        </div>
      </main>
    )
  }

  if (error || !member) {
    return (
      <main className="pt-14">
        <div className="max-w-[700px] mx-auto px-4 md:px-5 py-32 text-center">
          <p className="text-text-tertiary text-sm">{error ?? '멤버를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-accent-primary text-sm mt-4 inline-block"
          >
            돌아가기
          </button>
        </div>
      </main>
    )
  }

  const links = parseLinks(member.linksJson)
  const stacksByCategory = member.techStacks.reduce<Record<string, MemberTechStack[]>>((acc, ts) => {
    ;(acc[ts.category] ??= []).push(ts)
    return acc
  }, {})

  return (
    <main className="pt-14">
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
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden shrink-0">
            {member.profileImageUrl ? (
              <img src={member.profileImageUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-text-tertiary">{member.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
              {member.name}
            </h1>
            {member.githubUrl && (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-primary transition-colors font-mono mt-1"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 mb-4 text-xs text-text-tertiary">
          {(() => {
            const gens = member.generations
              .map((g) => ({ num: g.generationNumber ?? g.number, role: g.roleInGen }))
              .filter((g, i, arr) => g.num != null && arr.findIndex((x) => x.num === g.num) === i)
              .sort((a, b) => (a.num ?? 0) - (b.num ?? 0))
            const members = gens.filter((g) => g.role !== 'operating').map((g) => g.num)
            const operating = gens.filter((g) => g.role === 'operating').map((g) => g.num)
            return (
              <>
                {members.length > 0 && <span>{members.join('/')}기 멤버</span>}
                {operating.length > 0 && <span>{operating.join('/')}기 <span className="text-accent-primary/80">운영진</span></span>}
              </>
            )
          })()}
          {member.department && <span>· {member.department}</span>}
          <span>· {SESSION_LABEL[member.sessionType]}</span>
          {member.displayedEmail && (
            <a href={`mailto:${member.displayedEmail}`} className="hover:text-accent-primary transition-colors">
              · {member.displayedEmail}
            </a>
          )}
        </div>

        {member.intro && (
          <p className="text-base text-text-primary leading-relaxed break-keep mb-6">{member.intro}</p>
        )}

        {Object.keys(links).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(links).map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded-md border border-border-default text-text-tertiary hover:text-text-primary hover:border-accent-primary/40 transition-colors capitalize"
              >
                {label} →
              </a>
            ))}
          </div>
        )}
      </section>

      {member.techStacks.length > 0 && (
        <>
          <div className="max-w-[700px] mx-auto px-4 md:px-5">
            <div className="h-px bg-border-default" />
          </div>
          <section
            className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 transition-all duration-700 delay-100 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-bold text-text-primary tracking-tight mb-6">기술 스택</h2>
            <div className="space-y-5">
              {Object.entries(stacksByCategory).map(([category, stacks]) => (
                <div key={category}>
                  <p className="text-[10px] text-text-tertiary/60 uppercase tracking-wider mb-2">
                    {CATEGORY_LABEL[category] ?? category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stacks.map((ts) => (
                      <TechStackBadge key={ts.techStackId} stack={ts} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {stats && (
        <>
          <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>
          <section
            className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 transition-all duration-700 delay-150 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-bold text-text-primary tracking-tight mb-6">활동</h2>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {([['blog', '블로그'], ['qna', 'Q&A'], ['session', '세션']] as const).map(([key, label]) => (
                <div key={key} className="flex flex-col items-center gap-1 p-4 rounded-lg bg-bg-secondary border border-border-default">
                  <span className="text-2xl font-bold text-text-primary">{stats[key]}</span>
                  <span className="text-xs text-text-tertiary">{label}</span>
                </div>
              ))}
            </div>

            {activitiesLoading && activities === null ? (
              <p className="text-xs text-text-tertiary">불러오는 중...</p>
            ) : activities && activities.content.length > 0 ? (
              <>
                <div className="space-y-2">
                  {activities.content.map((activity) => {
                    const resolvedLink = activity.link
                      ? activity.link
                          .replace(/^\/blog\/posts\//, '/articles/')
                          .replace(/^\/qna\/questions\//, '/qna/')
                          .replace(/^\/session\/events\//, '/sessions/')
                      : null
                    const cls = "flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-default hover:border-accent-primary/40 transition-colors group"
                    const inner = (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
                            {ACTIVITY_LABEL[activity.type]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-[10px] text-accent-primary/80">+{activity.score}</span>
                          <span className="text-[10px] text-text-tertiary">
                            {new Date(activity.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </>
                    )
                    return resolvedLink ? (
                      <Link key={activity.id} to={resolvedLink} className={cls}>{inner}</Link>
                    ) : (
                      <div key={activity.id} className={cls}>{inner}</div>
                    )
                  })}
                </div>
                {(activities.totalPages > 1) && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setActivitiesPage((p) => p - 1)}
                      disabled={activitiesPage === 0 || activitiesLoading}
                      className="text-xs px-3 py-1.5 rounded border border-border-default text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      이전
                    </button>
                    <span className="text-xs text-text-tertiary">{activitiesPage + 1} / {activities.totalPages}</span>
                    <button
                      onClick={() => setActivitiesPage((p) => p + 1)}
                      disabled={!activities.hasNext || activitiesLoading}
                      className="text-xs px-3 py-1.5 rounded border border-border-default text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-text-tertiary">아직 활동이 없습니다.</p>
            )}
          </section>
        </>
      )}
    </main>
  )
}
