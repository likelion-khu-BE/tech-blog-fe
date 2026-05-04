import { useState, useEffect, useCallback } from 'react'
import { getUsers, approveUser, rejectUser, getPosts, updatePostStatus, deletePost, type UserResponse, type AdminPost } from '../api/admin'

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
                <span className="text-sm text-text-primary truncate">{user.email}</span>
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

const POST_STATUS_TABS = [
  { key: 'DRAFT',     label: '드래프트' },
  { key: 'PUBLISHED', label: '게시됨' },
] as const

const POST_STATUS_BADGE: Record<string, string> = {
  DRAFT:     'bg-yellow-500/15 text-yellow-400',
  PUBLISHED: 'bg-green-500/15 text-green-400',
}

function ArticleManagement() {
  const [tab, setTab] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getPosts(page, 20)
      const filtered = result.content.filter(p => p.status === tab)
      setPosts(filtered)
      setTotalPages(result.totalPages)
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => {
    setPage(0)
  }, [tab])

  useEffect(() => { load() }, [load])

  async function handleToggleStatus(post: AdminPost) {
    setActionId(post.id)
    try {
      const next = post.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT'
      const updated = await updatePostStatus(post.id, next)
      setPosts(prev => prev.filter(p => p.id !== updated.id))
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
            <div
              key={post.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-bg-secondary border border-border-default gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${POST_STATUS_BADGE[post.status] ?? ''}`}>
                  {post.status}
                </span>
                <span className="text-sm text-text-primary truncate">{post.title}</span>
                <span className="text-xs text-text-tertiary shrink-0 hidden md:block">{post.board} · {post.category}</span>
                <span className="text-xs text-text-tertiary shrink-0 hidden lg:block">{fmt(post.createdAt)}</span>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleToggleStatus(post)}
                  disabled={actionId === post.id}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 ${
                    post.status === 'DRAFT'
                      ? 'bg-accent-primary text-white hover:bg-accent-secondary'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-yellow-500/20 hover:text-yellow-400'
                  }`}
                >
                  {post.status === 'DRAFT' ? '게시' : '드래프트'}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={actionId === post.id}
                  className="text-xs px-3 py-1.5 rounded-md bg-bg-tertiary text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
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

// ── 메인 페이지 ──

const SECTIONS = [
  { key: 'users',    label: '회원 관리' },
  { key: 'articles', label: '아티클 관리' },
] as const

export default function AdminPage() {
  const [section, setSection] = useState<'users' | 'articles'>('users')

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-5 pt-24 pb-16">
      <h1 className="text-xl font-bold text-text-primary mb-6">관리자</h1>

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

      {section === 'users' ? <UserManagement /> : <ArticleManagement />}
    </div>
  )
}
