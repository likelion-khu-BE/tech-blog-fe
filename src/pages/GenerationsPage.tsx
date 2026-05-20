import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePageTransition } from '../hooks/usePageTransition'
import { TorusKnotScene } from '../components/three/TorusKnotScene'
import { getGenerations, getGenerationMembers } from '../api/profile'
import type { Generation, GenerationMember, SessionType } from '../types/profile'

const SESSION_LABEL: Record<SessionType, string> = {
  backend: '백엔드',
  frontend: '프론트엔드',
  design: '디자인',
  ai: 'AI',
  pm: 'PM',
  etc: '기타',
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

export default function GenerationsPage() {
  const visible = usePageTransition()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [activeGen, setActiveGen] = useState<number | null>(null)
  const [members, setMembers] = useState<GenerationMember[]>([])
  const [loadingGens, setLoadingGens] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [sessionFilter, setSessionFilter] = useState<SessionType | '전체'>('전체')

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
    getGenerationMembers(activeGen)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false))
  }, [activeGen])

  const sessionTypes = useMemo(() => {
    const unique = [...new Set(members.map((m) => m.sessionType))] as SessionType[]
    return unique
  }, [members])

  const filteredMembers = useMemo(() => {
    const list = sessionFilter === '전체' ? members : members.filter((m) => m.sessionType === sessionFilter)
    return [...list].sort((a, b) => {
      if (a.roleInGen === 'operating' && b.roleInGen !== 'operating') return -1
      if (a.roleInGen !== 'operating' && b.roleInGen === 'operating') return 1
      return a.name.localeCompare(b.name, 'ko')
    })
  }, [members, sessionFilter])

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
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-5 pb-20">
        {loadingMembers && (
          <div className="text-center py-20 text-text-tertiary text-sm">불러오는 중...</div>
        )}
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
      </div>
    </main>
  )
}
