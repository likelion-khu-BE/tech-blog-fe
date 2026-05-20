import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { TorusKnotScene } from '../components/three/TorusKnotScene'
import { getGenerations, getGenerationMembers, getRanking } from '../api/profile'
import type { Generation, GenerationMember, SessionType, RankingMember, RankingPeriod } from '../types/profile'

const SESSION_LABEL: Record<SessionType, string> = {
  backend: '백엔드',
  frontend: '프론트엔드',
  design: '디자인',
  ai: 'AI',
  pm: 'PM',
  etc: '기타',
}

const PERIOD_LABEL: Record<RankingPeriod, string> = {
  month: '월간',
  year: '연간',
  all: '전체',
}

function MemberRow({ member }: { member: GenerationMember }) {
  const initials = member.name.slice(0, 1)
  return (
    <Link
      to={`/members/${member.memberId}`}
      className="group flex items-center gap-3 py-4 px-4 border-b border-border-default last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0 overflow-hidden">
        {member.profileImageUrl ? (
          <img src={member.profileImageUrl} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-text-tertiary">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
            {member.name}
          </h3>
          <span className="text-[10px] text-text-tertiary">{SESSION_LABEL[member.sessionType]}</span>
          {member.roleInGen === 'operating' && (
            <span className="text-[10px] text-accent-primary/80">운영진</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function RankingRow({ member }: { member: RankingMember }) {
  const initials = member.name.slice(0, 1)
  const rankStyle =
    member.rank === 1 ? 'text-yellow-400 font-bold' :
    member.rank === 2 ? 'text-slate-300 font-bold' :
    member.rank === 3 ? 'text-amber-600 font-bold' :
    'text-text-tertiary'

  return (
    <Link
      to={`/members/${member.memberId}`}
      className="group flex items-center gap-3 py-4 px-4 border-b border-border-default last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
    >
      <span className={`w-6 text-center text-sm shrink-0 ${rankStyle}`}>{member.rank}</span>
      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0 overflow-hidden">
        {member.profileImageUrl ? (
          <img src={member.profileImageUrl} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-text-tertiary">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
          {member.name}
        </h3>
      </div>
      <span className="text-sm font-semibold text-accent-primary/80 shrink-0">{member.totalScore}점</span>
    </Link>
  )
}

export default function GenerationsPage() {
  const visible = usePageTransition()
  const [view, setView] = useState<'members' | 'ranking'>('members')

  // 멤버 뷰
  const [generations, setGenerations] = useState<Generation[]>([])
  const [activeGen, setActiveGen] = useState<number | null>(null)
  const [members, setMembers] = useState<GenerationMember[]>([])
  const [loadingGens, setLoadingGens] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [sessionFilter, setSessionFilter] = useState<SessionType | '전체'>('전체')
  const [query, setQuery] = useState('')

  // 랭킹 뷰
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('month')
  const [rankingGen, setRankingGen] = useState<number | undefined>(undefined)
  const [rankingPage, setRankingPage] = useState(0)
  const [rankingList, setRankingList] = useState<RankingMember[]>([])
  const [rankingTotalPages, setRankingTotalPages] = useState(0)
  const [rankingHasNext, setRankingHasNext] = useState(false)
  const [loadingRanking, setLoadingRanking] = useState(false)

  useEffect(() => {
    setLoadingGens(true)
    getGenerations()
      .then((gens) => {
        const sorted = [...gens].sort((a, b) => b.number - a.number)
        setGenerations(sorted)
        const current = sorted.find((g) => g.isCurrent) ?? sorted[0]
        if (current) setActiveGen(current.number)
      })
      .catch(() => {})
      .finally(() => setLoadingGens(false))
  }, [])

  useEffect(() => {
    if (activeGen == null) return
    setLoadingMembers(true)
    setSessionFilter('전체')
    setQuery('')
    getGenerationMembers(activeGen)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false))
  }, [activeGen])

  useEffect(() => {
    if (view !== 'ranking') return
    setLoadingRanking(true)
    getRanking({ period: rankingPeriod, generationId: rankingGen, page: rankingPage, size: 20 })
      .then((r) => {
        setRankingList(r.content)
        setRankingTotalPages(r.totalPages)
        setRankingHasNext(r.hasNext)
      })
      .catch(() => {})
      .finally(() => setLoadingRanking(false))
  }, [view, rankingPeriod, rankingGen, rankingPage])

  const sessionTypes = useMemo(() => {
    const unique = [...new Set(members.map((m) => m.sessionType))] as SessionType[]
    return unique
  }, [members])

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = members
      .filter((m) => sessionFilter === '전체' || m.sessionType === sessionFilter)
      .filter((m) => !q || m.name.toLowerCase().includes(q))
    return [...list].sort((a, b) => {
      if (a.roleInGen === 'operating' && b.roleInGen !== 'operating') return -1
      if (a.roleInGen !== 'operating' && b.roleInGen === 'operating') return 1
      return a.name.localeCompare(b.name, 'ko')
    })
  }, [members, sessionFilter, query])

  return (
    <main className="pt-14">
      <section
        className={`relative max-w-[900px] mx-auto px-4 md:px-5 pt-14 md:pt-24 pb-8 transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="absolute right-0 top-0 w-[260px] h-[260px] pointer-events-none z-0 hidden md:block">
          <TorusKnotScene />
        </div>
        <div className="relative z-10">
          <p className="text-sm text-text-tertiary">멋쟁이사자처럼 경희대학교</p>
          <h1 className="text-2xl md:text-4xl font-bold text-text-primary tracking-tight mt-1">멤버</h1>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-4 md:px-5 mb-6">
        {/* 뷰 탭 */}
        <div className="flex gap-1 mb-5 border-b border-border-default">
          {(['members', 'ranking'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                view === v
                  ? 'border-accent-primary text-text-primary'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {v === 'members' ? '전체 멤버' : '기여도 랭킹'}
            </button>
          ))}
        </div>

        {view === 'members' && (
          <>
            {loadingGens ? (
              <div className="text-sm text-text-tertiary">불러오는 중...</div>
            ) : (
              <nav className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-text-tertiary/50 mr-1.5">기수</span>
                {generations.map((g) => (
                  <button
                    key={g.number}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                      activeGen === g.number
                        ? 'text-text-primary bg-bg-tertiary'
                        : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
                    }`}
                    onClick={() => setActiveGen(g.number)}
                  >
                    {g.number}기
                    {g.isCurrent && <span className="ml-1 text-[10px] text-accent-primary/80">현재</span>}
                  </button>
                ))}
              </nav>
            )}

            {!loadingGens && !loadingMembers && sessionTypes.length > 0 && (
              <nav className="flex items-center gap-1 mt-3 overflow-x-auto">
                <span className="text-[10px] text-text-tertiary/50 mr-1.5 shrink-0">파트</span>
                {(['전체', ...sessionTypes] as (SessionType | '전체')[]).map((s) => (
                  <button
                    key={s}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                      sessionFilter === s
                        ? 'text-text-primary bg-bg-tertiary'
                        : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
                    }`}
                    onClick={() => setSessionFilter(s)}
                  >
                    {s === '전체' ? '전체' : SESSION_LABEL[s]}
                  </button>
                ))}
              </nav>
            )}

            {!loadingGens && (
              <div className="relative mt-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="이름 검색"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary/50 focus:outline-none focus:border-accent-primary/50 transition-colors"
                />
              </div>
            )}
          </>
        )}

        {view === 'ranking' && (
          <>
            <div className="flex flex-wrap gap-4">
              <nav className="flex items-center gap-1">
                <span className="text-[10px] text-text-tertiary/50 mr-1.5">기간</span>
                {(['month', 'year', 'all'] as RankingPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setRankingPeriod(p); setRankingPage(0) }}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                      rankingPeriod === p
                        ? 'text-text-primary bg-bg-tertiary'
                        : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
                    }`}
                  >
                    {PERIOD_LABEL[p]}
                  </button>
                ))}
              </nav>
              <nav className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-text-tertiary/50 mr-1.5">기수</span>
                {[undefined, ...generations.map((g) => g.number)].map((g) => (
                  <button
                    key={g ?? 'all'}
                    onClick={() => { setRankingGen(g); setRankingPage(0) }}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all cursor-pointer ${
                      rankingGen === g
                        ? 'text-text-primary bg-bg-tertiary'
                        : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
                    }`}
                  >
                    {g != null ? `${g}기` : '전체'}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-5 pb-20">
        {view === 'members' && (
          <>
            {loadingMembers && <div className="text-center py-20 text-text-tertiary text-sm">불러오는 중...</div>}
            {!loadingMembers && filteredMembers.length === 0 && activeGen != null && (
              <div className="text-center py-20 text-text-tertiary text-sm">멤버가 없습니다.</div>
            )}
            {!loadingMembers && filteredMembers.length > 0 && (
              <div className="border border-border-default rounded-lg overflow-hidden">
                {filteredMembers.map((m) => (
                  <MemberRow key={m.memberId} member={m} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'ranking' && (
          <>
            {loadingRanking && <div className="text-center py-20 text-text-tertiary text-sm">불러오는 중...</div>}
            {!loadingRanking && rankingList.length === 0 && (
              <div className="text-center py-20 text-text-tertiary text-sm">랭킹 데이터가 없습니다.</div>
            )}
            {!loadingRanking && rankingList.length > 0 && (
              <>
                <div className="border border-border-default rounded-lg overflow-hidden">
                  {rankingList.map((m) => (
                    <RankingRow key={m.memberId} member={m} />
                  ))}
                </div>
                {rankingTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setRankingPage((p) => p - 1)}
                      disabled={rankingPage === 0 || loadingRanking}
                      className="text-xs px-3 py-1.5 rounded border border-border-default text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      이전
                    </button>
                    <span className="text-xs text-text-tertiary">{rankingPage + 1} / {rankingTotalPages}</span>
                    <button
                      onClick={() => setRankingPage((p) => p + 1)}
                      disabled={!rankingHasNext || loadingRanking}
                      className="text-xs px-3 py-1.5 rounded border border-border-default text-text-tertiary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
