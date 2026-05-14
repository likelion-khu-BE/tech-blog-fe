import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { useAuth } from '../contexts/AuthContext'
import { getTeams, createTeam, getTechStacks } from '../api/profile'
import type { TeamSummary, TechStack, CreateTeamRequest } from '../types/profile'

function TeamCard({ team }: { team: TeamSummary }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="group block border border-border-default rounded-lg overflow-hidden hover:border-accent-primary/40 transition-colors"
    >
      {team.thumbUrl ? (
        <div className="aspect-video bg-bg-secondary overflow-hidden">
          <img
            src={team.thumbUrl}
            alt={team.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-bg-secondary flex items-center justify-center">
          <span className="text-4xl text-text-tertiary/30 font-bold">{team.name.charAt(0)}</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors leading-tight">
            {team.name}
          </h3>
          {team.generation && (
            <span className="text-[10px] text-text-tertiary shrink-0">{team.generation.number}기</span>
          )}
        </div>
        {team.description && (
          <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">{team.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {team.techStacks.slice(0, 4).map((ts) => (
            <span
              key={ts.id}
              className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary"
            >
              {ts.name}
            </span>
          ))}
          {team.techStacks.length > 4 && (
            <span className="text-[10px] text-text-tertiary">+{team.techStacks.length - 4}</span>
          )}
        </div>
        <p className="mt-3 text-[10px] text-text-tertiary">멤버 {team.memberCount}명</p>
      </div>
    </Link>
  )
}

const EMPTY_FORM: CreateTeamRequest = {
  name: '',
  description: '',
  projectUrl: '',
  githubUrl: '',
  generationNumber: null,
  techStackIds: [],
  imageUrls: [],
}

function CreateTeamModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const [form, setForm] = useState<CreateTeamRequest>(EMPTY_FORM)
  const [techStacks, setTechStacks] = useState<TechStack[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')

  useEffect(() => {
    getTechStacks().then((res) => setTechStacks(res.techStacks)).catch(() => {})
  }, [])

  function toggleTechStack(id: number) {
    setForm((prev) => {
      const ids = prev.techStackIds ?? []
      return {
        ...prev,
        techStackIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const body: CreateTeamRequest = { name: form.name.trim() }
      if (form.description) body.description = form.description
      if (form.projectUrl) body.projectUrl = form.projectUrl
      if (form.githubUrl) body.githubUrl = form.githubUrl
      if (form.generationNumber != null) body.generationNumber = form.generationNumber
      if (form.techStackIds?.length) body.techStackIds = form.techStackIds
      if (form.imageUrls?.length) body.imageUrls = form.imageUrls
      const res = await createTeam(body)
      onCreated(res.id)
    } catch {
      setError('팀 생성에 실패했습니다.')
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
          <h2 className="text-sm font-semibold text-text-primary">팀 만들기</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50 transition-colors"
          >
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
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="팀 이름을 입력하세요"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">소개</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="팀을 소개해주세요"
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
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const url = imageUrlInput.trim()
                    if (url) {
                      setForm((p) => ({ ...p, imageUrls: [...(p.imageUrls ?? []), url] }))
                      setImageUrlInput('')
                    }
                  }
                }}
                placeholder="https://... (Enter로 추가)"
                className="flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => {
                  const url = imageUrlInput.trim()
                  if (url) {
                    setForm((p) => ({ ...p, imageUrls: [...(p.imageUrls ?? []), url] }))
                    setImageUrlInput('')
                  }
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
                      className="shrink-0 text-text-tertiary/50 hover:text-text-primary transition-colors"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {techStacks.length > 0 && (
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">기술 스택</label>
              <div className="space-y-3">
                {Object.entries(
                  techStacks.reduce<Record<string, TechStack[]>>((acc, ts) => {
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
                            onClick={() => toggleTechStack(ts.id)}
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
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary/50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !form.name.trim()}
              className="flex-1 py-2 text-sm rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 disabled:opacity-40 transition-colors"
            >
              {submitting ? '생성 중...' : '팀 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamsPage() {
  const visible = usePageTransition()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState<TeamSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generationFilter, setGenerationFilter] = useState<number | undefined>()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getTeams(generationFilter)
      .then(setTeams)
      .catch(() => setError('팀 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [generationFilter])

  const generations = [undefined, 14, 13, 12] as const

  return (
    <main className="pt-14">
      <section
        className={`max-w-[900px] mx-auto px-4 md:px-5 pt-14 md:pt-24 pb-8 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-sm text-text-tertiary">멋쟁이사자처럼 경희대학교</p>
        <h1 className="text-2xl md:text-4xl font-bold text-text-primary tracking-tight mt-1">팀</h1>
      </section>

      <div className="max-w-[900px] mx-auto px-4 md:px-5 mb-6">
        <nav className="flex items-center gap-1">
          <span className="text-[10px] text-text-tertiary/50 mr-1.5">기수</span>
          {generations.map((g) => (
            <button
              key={g ?? 'all'}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                generationFilter === g
                  ? 'text-text-primary bg-bg-tertiary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
              }`}
              onClick={() => setGenerationFilter(g)}
            >
              {g != null ? `${g}기` : '전체'}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-5 pb-20">
        {loading && (
          <div className="text-center py-20 text-text-tertiary text-sm">불러오는 중...</div>
        )}
        {error && (
          <div className="text-center py-20 text-text-tertiary text-sm">{error}</div>
        )}
        {!loading && !error && teams.length === 0 && (
          <div className="text-center py-20 text-text-tertiary text-sm">등록된 팀이 없습니다.</div>
        )}
        {!loading && !error && teams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      {isAuthenticated && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg hover:bg-accent-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 z-40"
          aria-label="팀 생성"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {showModal && (
        <CreateTeamModal
          onClose={() => setShowModal(false)}
          onCreated={(id) => {
            setShowModal(false)
            navigate(`/teams/${id}`)
          }}
        />
      )}
    </main>
  )
}
