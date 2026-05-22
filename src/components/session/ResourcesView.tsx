import { useState, useEffect } from 'react'
import { getSessions, getResources } from '../../api/sessions'
import type { ApiResource, ResourceType } from '../../api/sessions'

const kindMeta: Record<ResourceType, { label: string; bg: string; icon: React.ReactNode }> = {
  SLIDE: {
    label: 'SLIDE', bg: 'bg-[#0F1E2E]',
    icon: (
      <svg viewBox="0 0 15 15" fill="none" className="w-4 h-4">
        <rect x="1.5" y="2.5" width="12" height="9" rx="1.5" stroke="#60A5FA" strokeWidth="1.1" />
        <path d="M5 13h5M7.5 11.5V13" stroke="#60A5FA" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  CODE: {
    label: 'CODE', bg: 'bg-[#2D1F5E]',
    icon: (
      <svg viewBox="0 0 15 15" fill="none" className="w-4 h-4">
        <path d="M4.5 5L2 7.5 4.5 10M10.5 5L13 7.5 10.5 10M8.5 4l-2 7" stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  LINK: {
    label: 'LINK', bg: 'bg-[#0F2E1A]',
    icon: (
      <svg viewBox="0 0 15 15" fill="none" className="w-4 h-4">
        <path d="M6 9.5a3.5 3.5 0 0 0 4.95 0l1.06-1.06A3.5 3.5 0 0 0 7.06 3.49L6 4.55" stroke="#4ADE80" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M9 5.5a3.5 3.5 0 0 0-4.95 0L3 6.56a3.5 3.5 0 0 0 4.95 4.95L9 10.45" stroke="#4ADE80" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
  DOCUMENT: {
    label: 'DOCUMENT', bg: 'bg-[#2E1E0A]',
    icon: (
      <svg viewBox="0 0 15 15" fill="none" className="w-4 h-4">
        <path d="M3 2h7l3 3v8H3V2z" stroke="#FB923C" strokeWidth="1.1" />
        <path d="M10 2v3h3" stroke="#FB923C" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M5 7.5h5M5 10h3" stroke="#FB923C" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
  },
}

type Filter = ResourceType | 'all'
const filterOptions: { value: Filter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'SLIDE', label: 'SLIDE' },
  { value: 'CODE', label: 'CODE' },
  { value: 'LINK', label: 'LINK' },
  { value: 'DOCUMENT', label: 'DOCUMENT' },
]

export function ResourcesView({ generationNumber }: { generationNumber: number }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [resources, setResources] = useState<ApiResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getSessions(generationNumber)
      .then(sessions => {
        const withResources = sessions.filter(s => s.resourceCount > 0)
        return Promise.all(withResources.map(s => getResources(generationNumber, s.id)))
      })
      .then(nested => setResources(nested.flat()))
      .catch(() => setError('자료를 불러오지 못했습니다'))
      .finally(() => setLoading(false))
  }, [generationNumber])

  const counts: Record<ResourceType, number> = {
    SLIDE: resources.filter(r => r.type === 'SLIDE').length,
    CODE: resources.filter(r => r.type === 'CODE').length,
    LINK: resources.filter(r => r.type === 'LINK').length,
    DOCUMENT: resources.filter(r => r.type === 'DOCUMENT').length,
  }

  const filtered = filter === 'all' ? resources : resources.filter(r => r.type === filter)

  return (
    <div>
      {/* 컨트롤 바 */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {filterOptions.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? 'bg-accent-muted border-accent-primary/50 text-accent-secondary'
                  : 'border-border-default text-text-tertiary hover:text-text-secondary hover:border-border-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors flex-shrink-0">
          + 자료 업로드
        </button>
      </div>

      {/* 종류별 통계 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(Object.entries(counts) as [ResourceType, number][]).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`bg-bg-tertiary border rounded-lg p-4 text-left transition-colors ${
              filter === type ? 'border-accent-primary/50' : 'border-border-default hover:border-border-hover'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${kindMeta[type].bg}`}>
                {kindMeta[type].icon}
              </div>
            </div>
            <div className="text-[11px] text-text-tertiary mb-1">{type}</div>
            <div className="text-xl font-semibold text-text-primary">{count}</div>
          </button>
        ))}
      </div>

      {/* 자료 목록 */}
      {loading ? (
        <div className="py-16 text-center text-sm text-text-tertiary">불러오는 중...</div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-400">{error}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => {
            const meta = kindMeta[r.type]
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 p-3 border border-border-default rounded-lg hover:border-border-hover transition-colors cursor-pointer group"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{r.name}</a>
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">{r.uploader.name}</div>
                </div>
                {r.sizeLabel && <span className="text-xs text-text-tertiary flex-shrink-0">{r.sizeLabel}</span>}
                <svg className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
