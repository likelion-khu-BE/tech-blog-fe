import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { useAuth } from '../contexts/AuthContext'
import { getMe, updateMe, getMyTeams, getTechStacks, updateMyTechStacks, getGenerations, createGeneration, updateGeneration, getMyReactions, getMemberStats, getMemberActivities, issueProfileImagePresignedUrl, uploadToS3 } from '../api/profile'
import { getUsers, approveUser, rejectUser, type UserResponse } from '../api/admin'
import type { MemberDetail, MyTeam, UpdateMemberRequest, SessionType, RoleInTeam, TechStack, MemberTechStack, Generation, CreateGenerationRequest, ActivityPage, ActivityType, MemberStats } from '../types/profile'

const SESSION_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'backend', label: '백엔드' },
  { value: 'frontend', label: '프론트엔드' },
  { value: 'design', label: '디자인' },
  { value: 'ai', label: 'AI' },
  { value: 'pm', label: 'PM' },
  { value: 'etc', label: '기타' },
]

const CATEGORY_LABEL: Record<string, string> = {
  language: '언어',
  framework: '프레임워크',
  ai: 'AI',
  design: '디자인',
  tool: '도구',
  infra: '인프라',
  etc: '기타',
}

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

const ROLE_LABEL: Record<RoleInTeam, string> = {
  backend: '백엔드',
  frontend: '프론트엔드',
  design: '디자인',
  ai: 'AI',
  pm: 'PM',
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

function stringifyLinks(obj: Record<string, string>): string {
  const cleaned = Object.fromEntries(Object.entries(obj).filter(([k, v]) => k.trim() && v.trim()))
  return Object.keys(cleaned).length ? JSON.stringify(cleaned) : ''
}

function EditProfileModal({
  member,
  onClose,
  onSaved,
}: {
  member: MemberDetail
  onClose: () => void
  onSaved: () => void
}) {
  const links = parseLinks(member.linksJson)
  const [form, setForm] = useState<UpdateMemberRequest>({
    name: member.name,
    department: member.department,
    sessionType: member.sessionType,
    githubUrl: member.githubUrl,
    displayedEmail: member.displayedEmail,
    intro: member.intro,
    linksJson: member.linksJson,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(member.profileImageUrl)
  const [linkEntries, setLinkEntries] = useState<{ key: string; value: string }[]>(
    Object.entries(links).map(([key, value]) => ({ key, value }))
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allStacks, setAllStacks] = useState<TechStack[]>([])
  const [selectedStacks, setSelectedStacks] = useState<MemberTechStack[]>(member.techStacks)

  useEffect(() => {
    getTechStacks().then((r) => setAllStacks(r.techStacks))
  }, [])

  function toggleStack(stack: TechStack) {
    setSelectedStacks((prev) => {
      const exists = prev.find((s) => s.techStackId === stack.id)
      if (exists) return prev.filter((s) => s.techStackId !== stack.id)
      return [...prev, { techStackId: stack.id, name: stack.name, category: stack.category, logoUrl: stack.logoUrl, proficiency: null }]
    })
  }

  function setProficiency(techStackId: number, value: number) {
    setSelectedStacks((prev) =>
      prev.map((s) => s.techStackId === techStackId ? { ...s, proficiency: s.proficiency === value ? null : value } : s)
    )
  }

  function addLink() {
    setLinkEntries((prev) => [...prev, { key: '', value: '' }])
  }

  function removeLink(i: number) {
    setLinkEntries((prev) => prev.filter((_, j) => j !== i))
  }

  function updateLink(i: number, field: 'key' | 'value', val: string) {
    setLinkEntries((prev) => prev.map((entry, j) => j === i ? { ...entry, [field]: val } : entry))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError(null)
    const linksObj = Object.fromEntries(linkEntries.filter((e) => e.key.trim() && e.value.trim()).map((e) => [e.key, e.value]))
    const linksJson = stringifyLinks(linksObj) || null
    try {
      let profileImageKey: string | null = null
      if (imageFile) {
        const { presignedUrl, key } = await issueProfileImagePresignedUrl(imageFile.name)
        await uploadToS3(presignedUrl, imageFile)
        profileImageKey = key
      }
      await Promise.all([
        updateMe({
          ...form,
          name: form.name.trim(),
          department: form.department?.trim() || null,
          githubUrl: form.githubUrl?.trim() || null,
          displayedEmail: form.displayedEmail?.trim() || null,
          intro: form.intro?.trim() || null,
          linksJson,
          profileImageKey,
        }),
        updateMyTechStacks(selectedStacks.map((s) => ({ techStackId: s.techStackId, proficiency: s.proficiency }))),
      ])
      onSaved()
    } catch {
      setError('프로필 수정에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-bg-primary border border-border-default rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border-default">
          <h2 className="text-sm font-semibold text-text-primary">프로필 수정</h2>
          <button onClick={onClose} className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">이름 <span className="text-accent-primary">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">학과</label>
            <input
              type="text"
              value={form.department ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              placeholder="컴퓨터공학과"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">파트 <span className="text-accent-primary">*</span></label>
            <select
              value={form.sessionType}
              onChange={(e) => setForm((p) => ({ ...p, sessionType: e.target.value as SessionType }))}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50 transition-colors"
            >
              {SESSION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">프로필 이미지</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-bg-tertiary border border-border-default overflow-hidden shrink-0 flex items-center justify-center">
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  : <span className="text-xl text-text-tertiary">{form.name.slice(0, 1)}</span>
                }
              </div>
              <label className="cursor-pointer px-3 py-1.5 text-xs rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
                파일 선택
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {imageFile && <span className="text-xs text-text-tertiary truncate max-w-[120px]">{imageFile.name}</span>}
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">GitHub URL</label>
            <input
              type="url"
              value={form.githubUrl ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, githubUrl: e.target.value }))}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">공개 이메일</label>
            <input
              type="email"
              value={form.displayedEmail ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, displayedEmail: e.target.value }))}
              placeholder="example@email.com"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">소개</label>
            <textarea
              value={form.intro ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
              rows={3}
              placeholder="자신을 소개해주세요"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors resize-none"
            />
          </div>
          {allStacks.length > 0 && (
            <div>
              <label className="block text-xs text-text-secondary mb-2">기술 스택</label>
              {Object.entries(
                allStacks.reduce<Record<string, TechStack[]>>((acc, s) => {
                  ;(acc[s.category] ??= []).push(s)
                  return acc
                }, {})
              ).map(([cat, stacks]) => (
                <div key={cat} className="mb-3">
                  <p className="text-[10px] text-text-tertiary mb-1.5">{CATEGORY_LABEL[cat] ?? cat}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stacks.map((s) => {
                      const sel = selectedStacks.find((x) => x.techStackId === s.id)
                      return (
                        <div key={s.id} className="flex flex-col items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => toggleStack(s)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              sel
                                ? 'border-accent-primary text-accent-primary bg-accent-muted'
                                : 'border-border-default text-text-tertiary hover:border-accent-primary/40'
                            }`}
                          >
                            {s.name}
                          </button>
                          {sel && (
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setProficiency(s.id, n)}
                                  className={`text-[10px] transition-colors ${
                                    sel.proficiency != null && n <= sel.proficiency
                                      ? 'text-purple-400'
                                      : 'text-text-tertiary/30'
                                  }`}
                                >
                                  ●
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-secondary">링크</label>
              <button type="button" onClick={addLink} className="text-xs text-accent-primary hover:text-accent-secondary transition-colors">
                + 추가
              </button>
            </div>
            <div className="space-y-2">
              {linkEntries.map((entry, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) => updateLink(i, 'key', e.target.value)}
                    placeholder="notion"
                    className="w-24 px-2 py-1.5 text-xs bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50"
                  />
                  <input
                    type="url"
                    value={entry.value}
                    onChange={(e) => updateLink(i, 'value', e.target.value)}
                    placeholder="https://"
                    className="flex-1 px-2 py-1.5 text-xs bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50"
                  />
                  <button type="button" onClick={() => removeLink(i)} className="text-text-tertiary/50 hover:text-text-primary transition-colors">✕</button>
                </div>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
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

function MyTeamCard({ team }: { team: MyTeam }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="group flex items-start gap-3 p-4 rounded-lg border border-border-default hover:border-accent-primary/40 transition-colors"
    >
      <div className="w-10 h-10 rounded-md bg-bg-tertiary flex items-center justify-center shrink-0 overflow-hidden">
        {team.thumbUrl ? (
          <img src={team.thumbUrl} alt={team.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-text-tertiary/50">{team.name.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors truncate">{team.name}</h3>
          {team.isLead && <span className="text-[10px] text-accent-primary/80 shrink-0">팀장</span>}
          {team.generation && <span className="text-[10px] text-text-tertiary shrink-0">{team.generation.number}기</span>}
        </div>
        {team.description && (
          <p className="text-xs text-text-secondary line-clamp-1">{team.description}</p>
        )}
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {team.roles.map((r) => (
            <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary">{ROLE_LABEL[r]}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

// ── 어드민 전용: 회원가입 허가 ──

function SignupApproval() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await getUsers('PENDING'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleApprove(id: number) {
    setActionId(id)
    try {
      const updated = await approveUser(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)).filter((u) => u.status === 'PENDING'))
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(id: number) {
    setActionId(id)
    try {
      const updated = await rejectUser(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)).filter((u) => u.status === 'PENDING'))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      {loading ? (
        <p className="text-xs text-text-tertiary">불러오는 중...</p>
      ) : users.length === 0 ? (
        <p className="text-xs text-text-tertiary">대기 중인 가입 신청이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-default">
              <span className="text-sm text-text-primary truncate mr-3">{u.email}</span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleApprove(u.id)}
                  disabled={actionId === u.id}
                  className="text-xs px-2.5 py-1 rounded bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-50 transition-colors"
                >
                  승인
                </button>
                <button
                  onClick={() => handleReject(u.id)}
                  disabled={actionId === u.id}
                  className="text-xs px-2.5 py-1 rounded bg-bg-tertiary text-text-secondary hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50 transition-colors"
                >
                  반려
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 어드민 전용: 기수 관리 ──

function GenerationAdmin() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingGen, setEditingGen] = useState<Generation | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const emptyForm: CreateGenerationRequest = { number: 0, startDate: '', endDate: null, isCurrent: false }
  const [form, setForm] = useState<CreateGenerationRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setGenerations((await getGenerations()).sort((a, b) => b.number - a.number))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setForm(emptyForm)
    setEditingGen(null)
    setError(null)
    setShowCreate(true)
  }

  function openEdit(gen: Generation) {
    setForm({ number: gen.number, startDate: gen.startDate, endDate: gen.endDate, isCurrent: gen.isCurrent })
    setEditingGen(gen)
    setError(null)
    setShowCreate(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.startDate) return
    setSaving(true)
    setError(null)
    try {
      if (editingGen) {
        await updateGeneration(editingGen.number, form)
      } else {
        await createGeneration(form)
      }
      setShowCreate(false)
      await load()
    } catch {
      setError(editingGen ? '기수 수정에 실패했습니다.' : '기수 생성에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors"
        >
          + 기수 생성
        </button>
      </div>

      {showCreate && (
        <div className="p-4 rounded-lg border border-border-default bg-bg-secondary">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            {editingGen ? `${editingGen.number}기 수정` : '새 기수 생성'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">기수 번호 *</label>
                <input
                  type="number"
                  value={form.number || ''}
                  onChange={(e) => setForm((p) => ({ ...p, number: Number(e.target.value) }))}
                  disabled={!!editingGen}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50 disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">시작일 *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">종료일</label>
                <input
                  type="date"
                  value={form.endDate ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value || null }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="genIsCurrent"
                  checked={form.isCurrent ?? false}
                  onChange={(e) => setForm((p) => ({ ...p, isCurrent: e.target.checked }))}
                  className="w-4 h-4 accent-accent-primary"
                />
                <label htmlFor="genIsCurrent" className="text-xs text-text-secondary">현재 기수</label>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
                취소
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors">
                {saving ? '저장 중...' : (editingGen ? '수정' : '생성')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-text-tertiary">불러오는 중...</p>
      ) : generations.length === 0 ? (
        <p className="text-xs text-text-tertiary">등록된 기수가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {generations.map((gen) => (
            <div key={gen.number} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-default">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">{gen.number}기</span>
                {gen.isCurrent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary">현재</span>
                )}
                <span className="text-xs text-text-tertiary">{gen.startDate}{gen.endDate ? ` ~ ${gen.endDate}` : ' ~ 진행중'}</span>
              </div>
              <button
                onClick={() => openEdit(gen)}
                className="text-xs px-2.5 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
              >
                수정
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyProfilePage() {
  const { role } = useAuth()
  const visible = usePageTransition()
  const [member, setMember] = useState<MemberDetail | null>(null)
  const [teams, setTeams] = useState<MyTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [activities, setActivities] = useState<ActivityPage | null>(null)
  const [activitiesPage, setActivitiesPage] = useState(0)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [reactions, setReactions] = useState<ActivityPage | null>(null)
  const [reactionsPage, setReactionsPage] = useState(0)
  const [reactionsLoading, setReactionsLoading] = useState(false)

  function loadData() {
    Promise.all([getMe(), getMyTeams()])
      .then(([m, t]) => {
        setMember(m)
        setTeams(t)
        getMemberStats(m.id).then(setStats).catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (!member) return
    setActivitiesLoading(true)
    getMemberActivities(member.id, { page: activitiesPage, size: 10 })
      .then(setActivities)
      .catch(() => {})
      .finally(() => setActivitiesLoading(false))
  }, [member?.id, activitiesPage])

  useEffect(() => {
    setReactionsLoading(true)
    getMyReactions({ page: reactionsPage, size: 10 })
      .then(setReactions)
      .catch(() => {})
      .finally(() => setReactionsLoading(false))
  }, [reactionsPage])

  if (loading) {
    return (
      <main className="pt-14 min-h-screen">
        <div className="max-w-[700px] mx-auto px-4 md:px-5 pt-24 text-center text-text-tertiary text-sm">
          불러오는 중...
        </div>
      </main>
    )
  }

  if (!member) return null

  const links = parseLinks(member.linksJson)

  return (
    <main className="pt-14">
      <section
        className={`max-w-[700px] mx-auto px-4 md:px-5 pt-12 md:pt-20 pb-12 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden shrink-0">
            {member.profileImageUrl ? (
              <img src={member.profileImageUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-text-tertiary">{member.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">{member.name}</h1>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs px-2.5 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors shrink-0"
              >
                수정
              </button>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-text-tertiary">
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
                    {operating.length > 0 && <span>{operating.join('/')}기 운영진</span>}
                  </>
                )
              })()}
              {member.department && <span>· {member.department}</span>}
              {member.displayedEmail && (
                <a href={`mailto:${member.displayedEmail}`} className="hover:text-accent-primary transition-colors">
                  · {member.displayedEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {member.githubUrl && (
          <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent-primary transition-colors mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        )}

        {member.intro && (
          <p className="text-sm text-text-primary leading-relaxed break-keep mb-6">{member.intro}</p>
        )}

        {Object.keys(links).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(links).map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1 rounded-md border border-border-default text-text-tertiary hover:text-text-primary hover:border-accent-primary/40 transition-colors capitalize">
                {label} →
              </a>
            ))}
          </div>
        )}

        {member.techStacks.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-text-tertiary mb-2">기술 스택</p>
            <div className="flex flex-wrap gap-2">
              {member.techStacks.map((ts) => (
                <span key={ts.techStackId} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-bg-secondary border border-border-default text-text-secondary">
                  {ts.logoUrl && (
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-white/15 p-0.5 shrink-0">
                      <img src={ts.logoUrl} alt={ts.name} className="w-full h-full object-contain" />
                    </span>
                  )}
                  {ts.name}
                  {ts.proficiency != null && <span className="ml-1"><span className="text-purple-400">{'●'.repeat(ts.proficiency)}</span><span className="text-text-tertiary/30">{'○'.repeat(5 - ts.proficiency)}</span></span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {teams.length > 0 && (
        <>
          <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>
          <section
            className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 transition-all duration-700 delay-100 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-lg font-bold text-text-primary tracking-tight mb-5">내 팀</h2>
            <div className="space-y-3">
              {teams.map((t) => (
                <MyTeamCard key={t.id} team={t} />
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
                  {activities.content.map((activity) => (
                    <Link
                      key={activity.id}
                      to={activity.link}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-default hover:border-accent-primary/40 transition-colors group"
                    >
                      <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
                        {ACTIVITY_LABEL[activity.type]}
                      </span>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-[10px] text-accent-primary/80">+{activity.score}</span>
                        <span className="text-[10px] text-text-tertiary">
                          {new Date(activity.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                {activities.totalPages > 1 && (
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

      <>
        <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>
        <section
          className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 transition-all duration-700 delay-150 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-lg font-bold text-text-primary tracking-tight mb-5">내 반응 활동</h2>
          {reactionsLoading && reactions === null ? (
            <p className="text-xs text-text-tertiary">불러오는 중...</p>
          ) : reactions && reactions.content.length > 0 ? (
            <>
              <div className="space-y-2">
                {reactions.content.map((activity) => (
                  <Link
                    key={activity.id}
                    to={activity.link}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-default hover:border-accent-primary/40 transition-colors group"
                  >
                    <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors truncate">
                      {ACTIVITY_LABEL[activity.type]}
                    </span>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-[10px] text-accent-primary/80">+{activity.score}</span>
                      <span className="text-[10px] text-text-tertiary">
                        {new Date(activity.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {reactions.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setReactionsPage((p) => p - 1)}
                    disabled={reactionsPage === 0 || reactionsLoading}
                    className="text-xs px-3 py-1.5 rounded border border-border-default text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    이전
                  </button>
                  <span className="text-xs text-text-tertiary">{reactionsPage + 1} / {reactions.totalPages}</span>
                  <button
                    onClick={() => setReactionsPage((p) => p + 1)}
                    disabled={!reactions.hasNext || reactionsLoading}
                    className="text-xs px-3 py-1.5 rounded border border-border-default text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-text-tertiary">아직 반응 활동이 없습니다.</p>
          )}
        </section>
      </>

      {role === 'ADMIN' && (
        <>
          <div className="max-w-[700px] mx-auto px-4 md:px-5"><div className="h-px bg-border-default" /></div>
          <section
            className={`max-w-[700px] mx-auto px-4 md:px-5 py-12 space-y-10 transition-all duration-700 delay-200 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight mb-5">회원가입 허가</h2>
              <SignupApproval />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-tight mb-5">기수 관리</h2>
              <GenerationAdmin />
            </div>
          </section>
        </>
      )}

      {showEditModal && (
        <EditProfileModal
          member={member}
          onClose={() => setShowEditModal(false)}
          onSaved={() => { setShowEditModal(false); loadData() }}
        />
      )}
    </main>
  )
}
