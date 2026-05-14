import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { getTeam } from '../api/profile'
import type { TeamDetail, TeamMember } from '../types/profile'

const ROLE_LABEL: Record<string, string> = {
  backend: '백엔드',
  frontend: '프론트엔드',
  design: '디자인',
  ai: 'AI',
  pm: 'PM',
  infra: '인프라',
  etc: '기타',
}

function MemberRow({ member }: { member: TeamMember }) {
  const initials = member.name.slice(0, 1)
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-default last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0 overflow-hidden">
        {member.profileImageUrl ? (
          <img src={member.profileImageUrl} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-text-tertiary">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{member.name}</span>
          {member.isLead && (
            <span className="text-[10px] text-accent-primary/80">팀장</span>
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">
          {member.roles.map((r) => ROLE_LABEL[r] ?? r).join(' · ')}
        </p>
      </div>
    </div>
  )
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const visible = usePageTransition()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getTeam(Number(id))
      .then((data) => {
        setTeam(data)
        setActiveImage(0)
      })
      .catch(() => setError('팀 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="pt-14 min-h-screen">
        <div className="max-w-[900px] mx-auto px-4 md:px-5 pt-24 text-center text-text-tertiary text-sm">
          불러오는 중...
        </div>
      </main>
    )
  }

  if (error || !team) {
    return (
      <main className="pt-14 min-h-screen">
        <div className="max-w-[900px] mx-auto px-4 md:px-5 pt-24 text-center text-text-tertiary text-sm">
          {error ?? '팀을 찾을 수 없습니다.'}
        </div>
      </main>
    )
  }

  return (
    <main className="pt-14">
      <div
        className={`max-w-[900px] mx-auto px-4 md:px-5 pt-14 md:pt-20 pb-20 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary mb-8">
          <Link to="/teams" className="hover:text-text-primary transition-colors">팀</Link>
          <span>/</span>
          <span className="text-text-secondary">{team.name}</span>
        </div>

        {/* Image gallery */}
        {team.imageUrls.length > 0 && (
          <div className="mb-8">
            <div className="aspect-video rounded-lg overflow-hidden bg-bg-secondary mb-2">
              <img
                src={team.imageUrls[activeImage]}
                alt={`${team.name} 이미지 ${activeImage + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {team.imageUrls.length > 1 && (
              <div className="flex gap-2">
                {team.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-accent-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">{team.name}</h1>
            <div className="flex items-center gap-2 shrink-0 mt-1">
              {team.githubUrl && (
                <a
                  href={team.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-2 py-1 rounded border border-border-default hover:border-text-tertiary"
                >
                  GitHub
                </a>
              )}
              {team.projectUrl && (
                <a
                  href={team.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-secondary hover:text-accent-primary transition-colors px-2 py-1 rounded border border-accent-primary/30 hover:border-accent-primary"
                >
                  프로젝트 →
                </a>
              )}
            </div>
          </div>
          {team.generation && (
            <p className="text-sm text-text-tertiary mb-3">{team.generation.number}기</p>
          )}
          {team.description && (
            <p className="text-sm text-text-secondary leading-relaxed break-keep">{team.description}</p>
          )}
        </div>

        {/* Invite code */}
        {team.inviteCode && (
          <div className="mb-8 p-4 rounded-lg border border-accent-primary/20 bg-accent-primary/5">
            <h2 className="text-xs font-semibold text-accent-secondary uppercase tracking-wider mb-3">초대 코드</h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-text-primary tracking-widest">{team.inviteCode}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(team.inviteCode!)}
                className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
              >
                복사
              </button>
            </div>
            {team.inviteCodeExpiresAt && (
              <p className="text-xs text-text-tertiary mt-2">
                만료: {new Date(team.inviteCodeExpiresAt).toLocaleString('ko-KR')}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tech stacks */}
          {team.techStacks.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">기술 스택</h2>
              <div className="flex flex-wrap gap-2">
                {team.techStacks.map((ts) => (
                  <span
                    key={ts.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary"
                  >
                    {ts.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          <div className={team.techStacks.length > 0 ? '' : 'md:col-span-3'}>
            <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              멤버 ({team.members.length}명)
            </h2>
            <div>
              {team.members.map((m) => (
                <MemberRow key={m.memberId} member={m} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
