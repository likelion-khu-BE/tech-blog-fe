import { useState, useMemo } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'
import { MemberCard } from '../components/member/MemberCard'
import { LegacyMemberCard } from '../components/member/LegacyMemberCard'
import { TorusKnotScene } from '../components/three/TorusKnotScene'
import { members } from '../data/members'
import { legacyMembers } from '../data/legacy-members'

const gens = [14, 13, 12] as const

export default function GenerationsPage() {
  const visible = usePageTransition()
  const [activeGen, setActiveGen] = useState<number>(14)
  const [activePart, setActivePart] = useState('전체')

  const parts = useMemo(() => {
    const unique = [...new Set(members.map((m) => m.part))]
    return ['전체', ...unique]
  }, [])

  const filteredMembers = useMemo(() => {
    const list = activePart === '전체' ? members : members.filter((m) => m.part === activePart)
    return [...list].sort((a, b) => {
      if (a.role === 'lead' && b.role !== 'lead') return -1
      if (a.role !== 'lead' && b.role === 'lead') return 1
      return a.name.localeCompare(b.name, 'ko')
    })
  }, [activePart])

  const gen13 = useMemo(() => legacyMembers.filter((m) => m.generation === 13), [])
  const gen12 = useMemo(() => legacyMembers.filter((m) => m.generation === 12), [])

  return (
    <main className="pt-14">
      {/* Header with 3D */}
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

      {/* 기수 탭 */}
      <div className="max-w-[900px] mx-auto px-4 md:px-5 mb-6">
        <nav className="flex items-center gap-1">
          <span className="text-[10px] text-text-tertiary/50 mr-1.5">기수</span>
          {gens.map((g) => (
            <button
              key={g}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 cursor-pointer ${
                activeGen === g
                  ? 'text-text-primary bg-bg-tertiary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
              }`}
              onClick={() => setActiveGen(g)}
            >
              {g}기
              {g === 14 && <span className="ml-1 text-[10px] text-accent-primary/80">현재</span>}
            </button>
          ))}
        </nav>

        {/* 파트 필터 (14기에서만) */}
        {activeGen === 14 && (
          <nav className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] text-text-tertiary/50 mr-1.5 shrink-0">파트</span>
            {parts.map((p) => (
              <button
                key={p}
                className={`px-2.5 py-1 text-xs rounded-md transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap ${
                  activePart === p
                    ? 'text-text-primary bg-bg-tertiary'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
                }`}
                onClick={() => setActivePart(p)}
              >
                {p}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* 멤버 리스트 */}
      <div className="max-w-[900px] mx-auto px-4 md:px-5 pb-20">
        {activeGen === 14 && filteredMembers.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
        {activeGen === 13 && gen13.map((m) => (
          <LegacyMemberCard key={m.id} member={m} />
        ))}
        {activeGen === 12 && gen12.map((m) => (
          <LegacyMemberCard key={m.id} member={m} />
        ))}
      </div>
    </main>
  )
}
