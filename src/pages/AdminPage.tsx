import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, approveUser, rejectUser, getPosts, publishPost, rejectPost, deletePost, getStats, type UserResponse, type AdminPost, type AdminPostStatus, type AdminStats } from '../api/admin'
import {
  getGenerations,
  createGeneration,
  updateGeneration,
  getGenerationMembers,
  addGenerationMember,
  getMembers,
  getTechStacks,
  createTechStack,
  updateTechStack,
  deleteTechStack,
} from '../api/profile'
import type {
  Generation,
  GenerationMember,
  GenerationRole,
  CreateGenerationRequest,
  TechStack,
  TechStackCategory,
  CreateTechStackRequest,
} from '../types/profile'

// ── 회원 관리 ──

const USER_STATUS_TABS = [
  { key: 'PENDING',  label: '승인 대기' },
  { key: 'ACTIVE',   label: '활성' },
  { key: 'REJECTED', label: '반려됨' },
  { key: '',         label: '전체' },
] as const

const STATUS_BADGE: Record<string, string> = {
  PENDING:  'bg-yellow-500/15 text-yellow-400',
  ACTIVE:   'bg-green-500/15 text-green-400',
  REJECTED: 'bg-red-500/15 text-red-400',
  EXPIRED:  'bg-gray-500/15 text-gray-400',
}

function fmt(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function UserManagement() {
  const [tab, setTab] = useState<string>('PENDING')
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsers(tab || undefined)
      setUsers(result)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  async function handleApprove(id: number) {
    setActionId(id)
    try {
      const updated = await approveUser(id)
      setUsers(prev => prev.map(u => u.id === id ? updated : u))
    } finally {
      setActionId(null)
    }
  }

  async function handleReject(id: number) {
    setActionId(id)
    try {
      const updated = await rejectUser(id)
      setUsers(prev => prev.map(u => u.id === id ? updated : u))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <div className="flex gap-1 mb-6 border-b border-border-default">
        {USER_STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-accent-primary text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`space-y-2 transition-opacity duration-150 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {!loading && users.length === 0 ? (
          <p className="text-text-tertiary text-sm">해당하는 유저가 없습니다.</p>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-secondary border border-border-default"
            >
              <div className="flex items-center gap-4 min-w-0">
                {user.status === 'ACTIVE' && user.memberId ? (
                  <Link to={`/members/${user.memberId}`} className="text-sm text-text-primary truncate hover:text-accent-primary transition-colors">{user.email}</Link>
                ) : (
                  <span className="text-sm text-text-primary truncate">{user.email}</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[user.status] ?? ''}`}>
                  {user.status}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary font-medium">
                    ADMIN
                  </span>
                )}
                <span className="text-xs text-text-tertiary hidden md:block">
                  가입 {fmt(user.signupRequestedAt)}
                </span>
              </div>

              {user.status === 'PENDING' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={actionId === user.id}
                    className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-secondary transition-colors disabled:opacity-50"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={actionId === user.id}
                    className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    반려
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}

// ── 아티클 관리 ──

const POST_STATUS_TABS: { key: AdminPostStatus; label: string }[] = [
  { key: 'PENDING_REVIEW', label: '검토 대기' },
  { key: 'PUBLISHED',      label: '게시됨' },
  { key: 'REJECTED',       label: '거부됨' },
]

const POST_STATUS_BADGE: Record<AdminPostStatus, string> = {
  PENDING_REVIEW: 'bg-yellow-500/15 text-yellow-400',
  PUBLISHED:      'bg-green-500/15 text-green-400',
  REJECTED:       'bg-red-500/15 text-red-400',
}

const POST_STATUS_LABEL: Record<AdminPostStatus, string> = {
  PENDING_REVIEW: '검토 대기',
  PUBLISHED:      '게시됨',
  REJECTED:       '거부됨',
}

interface ArticleManagementProps {
  tab: AdminPostStatus
  setTab: (tab: AdminPostStatus) => void
}

function ArticleManagement({ tab, setTab }: ArticleManagementProps) {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPosts(tab, page, 20)
      setPosts(result.content)
      setTotalPages(result.totalPages)
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => { setPage(0) }, [tab])
  useEffect(() => { load() }, [load])

  async function handlePublish(id: number) {
    setActionId(id)
    try {
      await publishPost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } finally {
      setActionId(null)
    }
  }

  function openReject(id: number) {
    setRejectingId(id)
    setRejectReason('')
  }

  async function handleRejectConfirm() {
    if (!rejectingId || !rejectReason.trim()) return
    setActionId(rejectingId)
    try {
      await rejectPost(rejectingId, rejectReason.trim())
      setPosts(prev => prev.filter(p => p.id !== rejectingId))
      setRejectingId(null)
      setRejectReason('')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setActionId(id)
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <div className="flex gap-1 mb-6 border-b border-border-default">
        {POST_STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-accent-primary text-text-primary'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`space-y-2 transition-opacity duration-150 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {!loading && posts.length === 0 ? (
          <p className="text-text-tertiary text-sm">해당하는 아티클이 없습니다.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="rounded-lg bg-bg-secondary border border-border-default overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${POST_STATUS_BADGE[post.status]}`}>
                    {POST_STATUS_LABEL[post.status]}
                  </span>
                  <Link to={`/articles/${post.id}`} className="text-sm text-text-primary truncate hover:text-accent-primary transition-colors">
                    {post.title}
                  </Link>
                  <span className="text-xs text-text-tertiary shrink-0 hidden md:block">{post.board} · {post.category}</span>
                  <span className="text-xs text-text-tertiary shrink-0 hidden lg:block">{fmt(post.createdAt)}</span>
                </div>

                <div className="flex gap-2 shrink-0">
                  {post.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        onClick={() => handlePublish(post.id)}
                        disabled={actionId === post.id}
                        className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-secondary transition-colors disabled:opacity-50"
                      >
                        발행
                      </button>
                      <button
                        onClick={() => openReject(post.id)}
                        disabled={actionId === post.id}
                        className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        거부
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={actionId === post.id}
                    className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 거부 사유 표시 (REJECTED 탭) */}
              {post.status === 'REJECTED' && post.rejectedReason && (
                <div className="px-4 py-2 border-t border-border-default bg-red-500/5">
                  <p className="text-xs text-red-400">거부 사유: {post.rejectedReason}</p>
                </div>
              )}

              {/* 거부 사유 입력 인라인 폼 */}
              {rejectingId === post.id && (
                <div className="px-4 py-3 border-t border-border-default bg-bg-tertiary space-y-2">
                  <p className="text-xs text-text-tertiary">거부 사유를 입력하세요 (작성자에게 전달됩니다)</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="예: 내용이 주제와 맞지 않습니다."
                    className="w-full text-xs bg-bg-secondary border border-border-default rounded-md px-3 py-2 text-text-primary placeholder-text-tertiary/40 outline-none resize-none focus:border-border-hover"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason('') }}
                      className="text-xs px-3 py-1.5 rounded-md bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleRejectConfirm}
                      disabled={!rejectReason.trim() || actionId === post.id}
                      className="text-xs px-3 py-1.5 rounded-md bg-red-500/80 hover:bg-red-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {actionId === post.id ? '처리 중...' : '거부 확정'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-bg-elevated disabled:opacity-40 transition-colors"
          >
            이전
          </button>
          <span className="text-xs text-text-tertiary py-1.5">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-bg-elevated disabled:opacity-40 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </>
  )
}

// ── 통계 대시보드 ──

const STAT_CARDS: { key: keyof AdminStats; label: string; colorClass: string; articleTab?: AdminPostStatus }[] = [
  { key: 'totalPosts',         label: '전체 게시글', colorClass: 'text-accent-secondary', articleTab: undefined },
  { key: 'pendingReviewPosts', label: '검토 대기',   colorClass: 'text-yellow-400',        articleTab: 'PENDING_REVIEW' },
  { key: 'publishedPosts',     label: '게시된 글',   colorClass: 'text-green-400',         articleTab: 'PUBLISHED' },
  { key: 'rejectedPosts',      label: '거부됨',      colorClass: 'text-red-400',           articleTab: 'REJECTED' },
  { key: 'totalComments',      label: '총 댓글',     colorClass: 'text-text-primary' },
]

interface StatsSectionProps {
  onNavigate: (articleTab?: AdminPostStatus) => void
}

function StatsSection({ onNavigate }: StatsSectionProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getStats()
      .then((data) => { if (active) setStats(data) })
      .catch(() => { if (active) setStats(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 transition-opacity duration-150 ${loading ? 'opacity-40' : 'opacity-100'}`}>
      {STAT_CARDS.map(({ key, label, colorClass, articleTab }) => {
        const clickable = key !== 'totalComments' && key !== 'totalPosts'
        return (
          <div
            key={key}
            onClick={clickable ? () => onNavigate(articleTab) : undefined}
            className={`px-4 py-4 rounded-lg bg-bg-secondary border border-border-default transition-colors ${clickable ? 'cursor-pointer hover:border-border-hover hover:bg-bg-tertiary' : ''}`}
          >
            <p className="text-xs text-text-tertiary mb-2">{label}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>
              {stats ? stats[key].toLocaleString() : '—'}
            </p>
          </div>
        )
      })}
    </div>
  )
}


// ── 기수 관리 ──

const ROLE_OPTIONS: { value: GenerationRole; label: string }[] = [
  { value: 'member', label: '멤버' },
  { value: 'operating', label: '운영진' },
]

function GenerationManagement() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)

  // 열린 패널: { genNumber, type: 'edit' | 'member' } — 하나만 열림
  const [openPanel, setOpenPanel] = useState<{ genNumber: number; type: 'edit' | 'member' } | null>(null)

  const [genMembers, setGenMembers] = useState<GenerationMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  // 기수 생성 폼 (최상단)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const emptyForm: CreateGenerationRequest = { number: 0, startDate: '', endDate: null, isCurrent: false }
  const [createForm, setCreateForm] = useState<CreateGenerationRequest>(emptyForm)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // 인라인 수정 폼
  const [editForm, setEditForm] = useState<CreateGenerationRequest>(emptyForm)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // 멤버 등록 폼
  const [allMembers, setAllMembers] = useState<{ id: number; name: string }[]>([])
  const [addMemberForm, setAddMemberForm] = useState<{ memberId: number | ''; roleInGen: GenerationRole }>({ memberId: '', roleInGen: 'member' })
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [addMemberError, setAddMemberError] = useState<string | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)

  const loadGenerations = useCallback(async () => {
    setLoading(true)
    try {
      const gens = await getGenerations()
      setGenerations(gens.sort((a, b) => b.number - a.number))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadGenerations() }, [loadGenerations])

  function togglePanel(genNumber: number, type: 'edit' | 'member', gen?: Generation) {
    if (openPanel?.genNumber === genNumber && openPanel.type === type) {
      setOpenPanel(null)
      return
    }
    setOpenPanel({ genNumber, type })
    setShowAddMember(false)
    setAddMemberError(null)
    if (type === 'edit' && gen) {
      setEditForm({ number: gen.number, startDate: gen.startDate, endDate: gen.endDate, isCurrent: gen.isCurrent })
      setEditError(null)
    }
    if (type === 'member') {
      setMembersLoading(true)
      getGenerationMembers(genNumber)
        .then(setGenMembers)
        .catch(() => setGenMembers([]))
        .finally(() => setMembersLoading(false))
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.startDate) return
    setCreateLoading(true)
    setCreateError(null)
    try {
      await createGeneration(createForm)
      setShowCreateForm(false)
      setCreateForm(emptyForm)
      await loadGenerations()
    } catch {
      setCreateError('기수 생성에 실패했습니다.')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleEdit(e: React.FormEvent, genNumber: number) {
    e.preventDefault()
    setEditLoading(true)
    setEditError(null)
    try {
      await updateGeneration(genNumber, editForm)
      setOpenPanel(null)
      await loadGenerations()
    } catch {
      setEditError('기수 수정에 실패했습니다.')
    } finally {
      setEditLoading(false)
    }
  }

  async function openAddMember() {
    setAddMemberForm({ memberId: '', roleInGen: 'member' })
    setAddMemberError(null)
    if (allMembers.length === 0) {
      const members = await getMembers()
      setAllMembers(members.map((m) => ({ id: m.id, name: m.name })))
    }
    setShowAddMember(true)
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!addMemberForm.memberId || !openPanel) return
    setAddMemberLoading(true)
    setAddMemberError(null)
    try {
      await addGenerationMember(openPanel.genNumber, { memberId: Number(addMemberForm.memberId), roleInGen: addMemberForm.roleInGen })
      setShowAddMember(false)
      setMembersLoading(true)
      getGenerationMembers(openPanel.genNumber).then(setGenMembers).finally(() => setMembersLoading(false))
    } catch {
      setAddMemberError('멤버 등록에 실패했습니다.')
    } finally {
      setAddMemberLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-tertiary">기수를 생성하고 멤버를 관리합니다.</p>
        <button
          onClick={() => { setShowCreateForm((v) => !v); setCreateError(null) }}
          className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors"
        >
          {showCreateForm ? '취소' : '+ 기수 생성'}
        </button>
      </div>

      {/* 기수 생성 폼 (최상단) */}
      {showCreateForm && (
        <div className="p-4 rounded-lg border border-border-default bg-bg-secondary">
          <h3 className="text-sm font-semibold text-text-primary mb-4">새 기수 생성</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">기수 번호 *</label>
                <input
                  type="number"
                  value={createForm.number || ''}
                  onChange={(e) => setCreateForm((p) => ({ ...p, number: Number(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">시작일 *</label>
                <input
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">종료일</label>
                <input
                  type="date"
                  value={createForm.endDate ?? ''}
                  onChange={(e) => setCreateForm((p) => ({ ...p, endDate: e.target.value || null }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={createForm.isCurrent ?? false}
                  onChange={(e) => setCreateForm((p) => ({ ...p, isCurrent: e.target.checked }))}
                  className="w-4 h-4 accent-accent-primary"
                />
                <label htmlFor="isCurrent" className="text-xs text-text-secondary">현재 기수</label>
              </div>
            </div>
            {createError && <p className="text-xs text-red-400">{createError}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
                취소
              </button>
              <button type="submit" disabled={createLoading} className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors">
                {createLoading ? '생성 중...' : '생성'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generation list */}
      {loading ? (
        <div className="text-sm text-text-tertiary">불러오는 중...</div>
      ) : generations.length === 0 ? (
        <p className="text-sm text-text-tertiary">등록된 기수가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {generations.map((gen) => {
            const isEditOpen = openPanel?.genNumber === gen.number && openPanel.type === 'edit'
            const isMemberOpen = openPanel?.genNumber === gen.number && openPanel.type === 'member'
            return (
              <div key={gen.number} className="rounded-lg border border-border-default bg-bg-secondary overflow-hidden">
                {isEditOpen ? (
                  <form onSubmit={(e) => handleEdit(e, gen.number)} className="px-4 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">기수 번호</label>
                        <input type="number" value={editForm.number} disabled className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary opacity-50" />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">시작일 *</label>
                        <input type="date" value={editForm.startDate} onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50" required />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">종료일</label>
                        <input type="date" value={editForm.endDate ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value || null }))} className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50" />
                      </div>
                      <div className="flex items-center gap-2 mt-5">
                        <input type="checkbox" id={`isCurrent-${gen.number}`} checked={editForm.isCurrent ?? false} onChange={(e) => setEditForm((p) => ({ ...p, isCurrent: e.target.checked }))} className="w-4 h-4 accent-accent-primary" />
                        <label htmlFor={`isCurrent-${gen.number}`} className="text-xs text-text-secondary">현재 기수</label>
                      </div>
                    </div>
                    {editError && <p className="text-xs text-red-400">{editError}</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setOpenPanel(null)} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">취소</button>
                      <button type="submit" disabled={editLoading} className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors">{editLoading ? '저장 중...' : '저장'}</button>
                    </div>
                  </form>
                ) : isMemberOpen ? (
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">{gen.number}기 멤버</span>
                      <div className="flex gap-2">
                        <button onClick={openAddMember} className="text-xs px-2.5 py-1 rounded border border-border-default text-text-tertiary hover:text-accent-primary hover:border-accent-primary/40 transition-colors">+ 멤버 등록</button>
                        <button onClick={() => setOpenPanel(null)} className="text-xs px-2.5 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors">닫기</button>
                      </div>
                    </div>
                    {membersLoading ? (
                      <p className="text-xs text-text-tertiary">불러오는 중...</p>
                    ) : genMembers.length === 0 ? (
                      <p className="text-xs text-text-tertiary">등록된 멤버가 없습니다.</p>
                    ) : (
                      <div className="space-y-1">
                        {genMembers.map((m) => (
                          <div key={m.memberId} className="flex items-center gap-2 py-1.5 text-xs">
                            <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center overflow-hidden shrink-0">
                              {m.profileImageUrl ? <img src={m.profileImageUrl} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-[10px] font-semibold text-text-tertiary">{m.name.slice(0, 1)}</span>}
                            </div>
                            <span className="text-text-primary">{m.name}</span>
                            <span className="text-text-tertiary">{m.roleInGen === 'operating' ? '운영진' : '멤버'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {showAddMember && (
                      <form onSubmit={handleAddMember} className="p-3 rounded-lg border border-border-default bg-bg-tertiary/30 space-y-3">
                        <p className="text-xs font-medium text-text-primary">멤버 등록</p>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={addMemberForm.memberId} onChange={(e) => setAddMemberForm((p) => ({ ...p, memberId: e.target.value ? Number(e.target.value) : '' }))} className="px-2 py-1.5 text-xs bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50" required>
                            <option value="">멤버 선택</option>
                            {allMembers.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                          </select>
                          <select value={addMemberForm.roleInGen} onChange={(e) => setAddMemberForm((p) => ({ ...p, roleInGen: e.target.value as GenerationRole }))} className="px-2 py-1.5 text-xs bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50">
                            {ROLE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                          </select>
                        </div>
                        {addMemberError && <p className="text-xs text-red-400">{addMemberError}</p>}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setShowAddMember(false)} className="flex-1 py-1.5 text-xs rounded border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">취소</button>
                          <button type="submit" disabled={addMemberLoading} className="flex-1 py-1.5 text-xs rounded bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors">{addMemberLoading ? '등록 중...' : '등록'}</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary">{gen.number}기</span>
                      {gen.isCurrent && (<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary">현재</span>)}
                      <span className="text-xs text-text-tertiary">{gen.startDate}{gen.endDate ? ` ~ ${gen.endDate}` : ' ~ 진행중'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => togglePanel(gen.number, 'member')} className="text-xs px-2.5 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors">멤버</button>
                      <button onClick={() => togglePanel(gen.number, 'edit', gen)} className="text-xs px-2.5 py-1 rounded border border-border-default text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors">수정</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 기술 스택 관리 ──

const TECH_CATEGORIES: { value: TechStackCategory; label: string }[] = [
  { value: 'language',  label: '언어' },
  { value: 'framework', label: '프레임워크' },
  { value: 'ai',        label: 'AI' },
  { value: 'design',    label: '디자인' },
  { value: 'tool',      label: '도구' },
  { value: 'infra',     label: '인프라' },
  { value: 'etc',       label: '기타' },
]

const CATEGORY_LABEL = Object.fromEntries(
  TECH_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<TechStackCategory, string>

function adminErrMsg(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { message?: string } } }).response
    return r?.data?.message || fallback
  }
  return fallback
}

function TechStackManagement() {
  const [stacks, setStacks] = useState<TechStack[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TechStackCategory | 'all'>('all')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TechStack | null>(null)
  const emptyForm: CreateTechStackRequest = { name: '', category: 'language', logoUrl: '' }
  const [form, setForm] = useState<CreateTechStackRequest>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { techStacks } = await getTechStacks(filter === 'all' ? undefined : filter)
      setStacks(techStacks)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setForm(emptyForm)
    setEditing(null)
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(ts: TechStack) {
    setForm({ name: ts.name, category: ts.category, logoUrl: ts.logoUrl ?? '' })
    setEditing(ts)
    setFormError(null)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setFormLoading(true)
    setFormError(null)
    const payload: CreateTechStackRequest = {
      name: form.name.trim(),
      category: form.category,
      logoUrl: form.logoUrl?.trim() || null,
    }
    try {
      if (editing) {
        await updateTechStack(editing.id, payload)
      } else {
        await createTechStack(payload)
      }
      setShowForm(false)
      await load()
    } catch (err) {
      setFormError(adminErrMsg(err, editing ? '수정에 실패했습니다.' : '등록에 실패했습니다.'))
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(ts: TechStack) {
    if (!confirm(`'${ts.name}'을(를) 삭제하시겠습니까?\n이 기술을 보유한 멤버·팀 연결도 함께 삭제됩니다.`)) return
    setActionId(ts.id)
    try {
      await deleteTechStack(ts.id)
      setStacks((prev) => prev.filter((s) => s.id !== ts.id))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TechStackCategory | 'all')}
          className="px-3 py-1.5 text-xs bg-bg-primary border border-border-default rounded-lg text-text-secondary focus:outline-none focus:border-accent-primary/50"
        >
          <option value="all">전체 분류</option>
          {TECH_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button
          onClick={openCreate}
          className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors"
        >
          + 기술 스택 추가
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="p-4 rounded-lg border border-border-default bg-bg-secondary">
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            {editing ? `'${editing.name}' 수정` : '새 기술 스택'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">분류 *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as TechStackCategory }))}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-accent-primary/50"
                >
                  {TECH_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-text-secondary mb-1">로고 URL</label>
                <input
                  type="url"
                  value={form.logoUrl ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-border-default rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-primary/50"
                />
              </div>
            </div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors">
                취소
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors">
                {formLoading ? '저장 중...' : (editing ? '수정' : '등록')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tech stack list */}
      <div className={`space-y-2 transition-opacity duration-150 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {loading ? (
          <p className="text-sm text-text-tertiary">불러오는 중...</p>
        ) : stacks.length === 0 ? (
          <p className="text-sm text-text-tertiary">등록된 기술 스택이 없습니다.</p>
        ) : (
          stacks.map((ts) => (
            <div key={ts.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-secondary border border-border-default gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded bg-bg-tertiary flex items-center justify-center overflow-hidden shrink-0">
                  {ts.logoUrl
                    ? <img src={ts.logoUrl} alt={ts.name} className="w-full h-full object-contain" />
                    : <span className="text-[10px] font-semibold text-text-tertiary">{ts.name.slice(0, 1)}</span>
                  }
                </div>
                <span className="text-sm text-text-primary truncate">{ts.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-tertiary shrink-0">
                  {CATEGORY_LABEL[ts.category] ?? ts.category}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEdit(ts)}
                  className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(ts)}
                  disabled={actionId === ts.id}
                  className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── 메인 페이지 ──

const SECTIONS = [
  { key: 'users',       label: '회원 관리' },
  { key: 'articles',    label: '아티클 관리' },
  { key: 'generations', label: '기수 관리' },
  { key: 'tech-stacks', label: '기술 스택' },
] as const

export default function AdminPage() {
  const [section, setSection] = useState<'users' | 'articles' | 'generations' | 'tech-stacks'>('users')
  const [articleTab, setArticleTab] = useState<AdminPostStatus>('PENDING_REVIEW')

  function handleStatNavigate(tab?: AdminPostStatus) {
    setSection('articles')
    if (tab) setArticleTab(tab)
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-5 pt-24 pb-16">
      <h1 className="text-xl font-bold text-text-primary mb-6">관리자</h1>

      <StatsSection onNavigate={handleStatNavigate} />

      <div className="flex gap-3 mb-8">
        {SECTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              section === key
                ? 'bg-accent-muted text-accent-secondary'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {section === 'users' && <UserManagement />}
      {section === 'articles' && <ArticleManagement tab={articleTab} setTab={setArticleTab} />}
      {section === 'generations' && <GenerationManagement />}
      {section === 'tech-stacks' && <TechStackManagement />}
    </div>
  )
}
