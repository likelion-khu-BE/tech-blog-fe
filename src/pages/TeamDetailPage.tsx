import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { useAuth } from '../contexts/AuthContext'
import {
  getTeam,
  getMe,
  updateTeam,
  deleteTeam,
  regenerateInviteCode,
  transferLead,
  updateMemberRoles,
  kickMember,
  leaveTeam,
  getTechStacks,
} from '../api/profile'
import type { TeamDetail, TeamMember, TechStack, RoleInTeam, UpdateTeamRequest } from '../types/profile'

const ROLE_LABEL: Record<RoleInTeam, string> = {
  backend: '백엔드',
  frontend: '프론트엔드',
  design: '디자인',
  ai: 'AI',
  pm: 'PM',
  infra: '인프라',
  etc: '기타',
}

const ALL_ROLES: RoleInTeam[] = ['backend', 'frontend', 'design', 'ai', 'pm', 'infra', 'etc']

// ── Edit Team Modal ──

function EditTeamModal({
  team,
  onClose,
  onSaved,
}: {
  team: TeamDetail
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<UpdateTeamRequest>({
    name: team.name,
    description: team.description,
    projectUrl: team.projectUrl,
    githubUrl: team.githubUrl,
    generationNumber: team.generation?.number ?? null,
    imageUrls: [...team.imageUrls],
    techStackIds: team.techStacks.map((ts) => ts.id),
  })
  const [allStacks, setAllStacks] = useState<TechStack[]>([])
  const [imageInput, setImageInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTechStacks().then((r) => setAllStacks(r.techStacks)).catch(() => {})
  }, [])

  function toggleStack(id: number) {
    setForm((prev) => {
      const ids = prev.techStackIds ?? []
      return { ...prev, techStackIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name?.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await updateTeam(team.id, {
        name: form.name?.trim(),
        description: form.description ?? null,
        projectUrl: form.projectUrl ?? null,
        githubUrl: form.githubUrl ?? null,
        generationNumber: form.generationNumber ?? null,
        imageUrls: form.imageUrls ?? [],
        techStackIds: form.techStackIds ?? [],
      })
      onSaved()
    } catch {
      setError('팀 수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-bg-primary border border-border-default rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="text-sm font-semibold text-text-primary">팀 수정</h2>
          <button onClick={onClose} className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">팀 이름 <span className="text-accent-primary">*</span></label>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">소개</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">프로젝트 URL</label>
              <input
                type="url"
                value={form.projectUrl ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, projectUrl: e.target.value }))}
                placeholder="https://"
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, githubUrl: e.target.value }))}
                placeholder="https://github.com/"
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">기수</label>
            <input
              type="number"
              value={form.generationNumber ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, generationNumber: e.target.value ? Number(e.target.value) : null }))}
              placeholder="14"
              min={1}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">이미지 URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const url = imageInput.trim()
                    if (url) { setForm((p) => ({ ...p, imageUrls: [...(p.imageUrls ?? []), url] })); setImageInput('') }
                  }
                }}
                placeholder="https://... (Enter로 추가)"
                className="flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  const url = imageInput.trim()
                  if (url) { setForm((p) => ({ ...p, imageUrls: [...(p.imageUrls ?? []), url] })); setImageInput('') }
                }}
                className="px-3 py-2 text-xs rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors"
              >
                추가
              </button>
            </div>
            {(form.imageUrls ?? []).length > 0 && (
              <ul className="mt-2 space-y-1">
                {(form.imageUrls ?? []).map((url, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-tertiary">
                    <span className="flex-1 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, imageUrls: (p.imageUrls ?? []).filter((_, j) => j !== i) }))}
                      className="shrink-0 text-text-tertiary/50 hover:text-text-primary"
                    >✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {allStacks.length > 0 && (
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">기술 스택</label>
              <div className="space-y-3">
                {Object.entries(
                  allStacks.reduce<Record<string, TechStack[]>>((acc, ts) => {
                    ;(acc[ts.category] ??= []).push(ts)
                    return acc
                  }, {})
                ).map(([category, stacks]) => (
                  <div key={category}>
                    <p className="text-[10px] text-text-tertiary/60 uppercase tracking-wider mb-1.5">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stacks.map((ts) => {
                        const selected = (form.techStackIds ?? []).includes(ts.id)
                        return (
                          <button
                            key={ts.id}
                            type="button"
                            onClick={() => toggleStack(ts.id)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                              selected
                                ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-secondary'
                                : 'border-border-default bg-bg-secondary text-text-tertiary hover:border-accent-primary/30'
                            }`}
                          >
                            {ts.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name?.trim()}
              className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit Roles Modal ──

function EditRolesModal({
  teamId,
  member,
  onClose,
  onSaved,
}: {
  teamId: number
  member: TeamMember
  onClose: () => void
  onSaved: () => void
}) {
  const [roles, setRoles] = useState<RoleInTeam[]>([...member.roles])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(role: RoleInTeam) {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (roles.length === 0) { setError('역할을 1개 이상 선택하세요.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await updateMemberRoles(teamId, member.memberId, roles)
      onSaved()
    } catch {
      setError('역할 수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-bg-primary border border-border-default rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="text-sm font-semibold text-text-primary">{member.name}의 역할 수정</h2>
          <button onClick={onClose} className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggle(role)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  roles.includes(role)
                    ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-secondary'
                    : 'border-border-default bg-bg-secondary text-text-tertiary hover:border-accent-primary/30'
                }`}
              >
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
              취소
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors">
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Member Row ──

function MemberRow({
  member,
  isCurrentUser,
  isCurrentUserLead,
  teamId,
  onAction,
}: {
  member: TeamMember
  isCurrentUser: boolean
  isCurrentUserLead: boolean
  teamId: number
  onAction: () => void
}) {
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [actioning, setActioning] = useState(false)

  async function handleKick() {
    if (!confirm(`${member.name}을(를) 강퇴하시겠습니까?`)) return
    setActioning(true)
    try {
      await kickMember(teamId, member.memberId)
      onAction()
    } catch {
      alert('강퇴에 실패했습니다.')
    } finally {
      setActioning(false)
    }
  }

  async function handleTransferLead() {
    if (!confirm(`${member.name}에게 팀장을 양도하시겠습니까?`)) return
    setActioning(true)
    try {
      await transferLead(teamId, member.memberId)
      onAction()
    } catch {
      alert('팀장 양도에 실패했습니다.')
    } finally {
      setActioning(false)
    }
  }

  const initials = member.name.slice(0, 1)
  return (
    <>
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
            {member.isLead && <span className="text-[10px] text-accent-primary/80">팀장</span>}
            {isCurrentUser && <span className="text-[10px] text-text-tertiary/60">나</span>}
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">
            {member.roles.map((r) => ROLE_LABEL[r]).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(isCurrentUser || isCurrentUserLead) && (
            <button
              onClick={() => setShowRolesModal(true)}
              className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
            >
              역할
            </button>
          )}
          {isCurrentUserLead && !member.isLead && (
            <>
              <button
                onClick={handleTransferLead}
                disabled={actioning}
                className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-accent-primary hover:border-accent-primary/40 transition-colors disabled:opacity-40"
              >
                양도
              </button>
              <button
                onClick={handleKick}
                disabled={actioning}
                className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-40"
              >
                강퇴
              </button>
            </>
          )}
        </div>
      </div>
      {showRolesModal && (
        <EditRolesModal
          teamId={teamId}
          member={member}
          onClose={() => setShowRolesModal(false)}
          onSaved={() => { setShowRolesModal(false); onAction() }}
        />
      )}
    </>
  )
}

// ── Main Page ──

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const visible = usePageTransition()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [myMemberId, setMyMemberId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [regenLoading, setRegenLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      getMe().then((m) => setMyMemberId(m.id)).catch(() => {})
    } else {
      setMyMemberId(null)
    }
  }, [isAuthenticated])

  const reload = useCallback(() => {
    if (!id) return
    getTeam(Number(id))
      .then((data) => { setTeam(data); setActiveImage(0) })
      .catch(() => setError('팀 정보를 불러오지 못했습니다.'))
  }, [id])

  useEffect(() => {
    if (authLoading || !id) return
    setLoading(true)
    getTeam(Number(id))
      .then((data) => { setTeam(data); setActiveImage(0) })
      .catch(() => setError('팀 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [id, authLoading])

  // API 스펙: inviteCode는 팀원(accepted)에게만 반환되고, 비회원에게는 null
  const isMember = team != null && team.inviteCode !== null
  const myMember = myMemberId != null ? (team?.members.find((m) => m.memberId === myMemberId) ?? null) : null
  const isLead = myMember?.isLead ?? false

  // 팀원이었다가 강퇴/탈퇴로 isMember가 false가 되면 팀 목록으로 이동
  const prevIsMemberRef = useRef<boolean | null>(null)
  useEffect(() => {
    if (prevIsMemberRef.current === true && !isMember) {
      navigate('/teams')
    }
    prevIsMemberRef.current = isMember
  }, [isMember, navigate])

  async function handleDelete() {
    if (!team || !confirm('팀을 삭제하시겠습니까? 모든 팀원이 제거됩니다.')) return
    setDeleting(true)
    try {
      await deleteTeam(team.id)
      navigate('/teams')
    } catch {
      alert('팀 삭제에 실패했습니다.')
      setDeleting(false)
    }
  }

  async function handleRegenInvite() {
    if (!team) return
    setRegenLoading(true)
    try {
      const res = await regenerateInviteCode(team.id)
      setTeam((prev) => prev ? { ...prev, inviteCode: res.inviteCode, inviteCodeExpiresAt: res.inviteCodeExpiresAt } : prev)
    } catch {
      alert('초대 코드 재생성에 실패했습니다.')
    } finally {
      setRegenLoading(false)
    }
  }

  async function handleLeave() {
    if (!team || !confirm('팀을 탈퇴하시겠습니까?')) return
    setLeaving(true)
    try {
      await leaveTeam(team.id)
      navigate('/teams')
    } catch {
      alert('탈퇴에 실패했습니다.')
      setLeaving(false)
    }
  }

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
                <a href={team.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-text-tertiary hover:text-text-primary transition-colors px-2 py-1 rounded border border-border-default hover:border-text-tertiary">
                  GitHub
                </a>
              )}
              {team.projectUrl && (
                <a href={team.projectUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-secondary hover:text-accent-primary transition-colors px-2 py-1 rounded border border-accent-primary/30 hover:border-accent-primary">
                  프로젝트 →
                </a>
              )}
              {isLead && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-40"
                  >
                    삭제
                  </button>
                </>
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

        {/* Invite code (members only) */}
        {isMember && team.inviteCode && (
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
              {isLead && (
                <button
                  type="button"
                  onClick={handleRegenInvite}
                  disabled={regenLoading}
                  className="text-xs px-2 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors disabled:opacity-40"
                >
                  {regenLoading ? '재생성 중...' : '재생성'}
                </button>
              )}
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
                  <span key={ts.id} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary">
                    {ts.logoUrl && (
                      <span className="flex items-center justify-center w-5 h-5 rounded bg-white/15 p-0.5 shrink-0">
                        <img src={ts.logoUrl} alt={ts.name} className="w-full h-full object-contain" />
                      </span>
                    )}
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
              {[...team.members].sort((a, b) => (a.isLead === b.isLead ? 0 : a.isLead ? -1 : 1)).map((m) => (
                <MemberRow
                  key={m.memberId}
                  member={m}
                  isCurrentUser={m.memberId === myMemberId}
                  isCurrentUserLead={isLead}
                  teamId={team.id}
                  onAction={reload}
                />
              ))}
            </div>

            {/* Leave team */}
            {isMember && !isLead && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="mt-4 w-full text-xs py-2 rounded-lg border border-border-default text-text-tertiary hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-40"
              >
                {leaving ? '탈퇴 중...' : '팀 탈퇴'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTeamModal
          team={team}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); reload() }}
        />
      )}
    </main>
  )
}
