import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { MemberAvatar } from '../member/MemberAvatar'
import { members } from '../../data/members'

export function MemberNudgeSection() {
  const { ref, isVisible } = useIntersectionObserver()
  const doubled = useMemo(() => [...members, ...members], [])

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`max-w-[900px] mx-auto px-4 md:px-5 py-14 md:py-28 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <h2 className="text-lg md:text-xl font-bold text-text-primary tracking-tight">함께 공부하는 사람들</h2>
      <p className="text-sm text-text-tertiary mt-1">14기 · {members.length}명</p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-6">
        {/* 데스크탑: 아바타 겹침 */}
        <Link to="/members" className="hidden sm:flex -space-x-2 hover:opacity-80 transition-opacity">
          {members.map((m, i) => (
            <MemberAvatar
              key={m.id}
              name={m.name}
              avatar={m.avatar}
              size="sm"
              className={`ring-2 ring-bg-primary transition-all duration-300 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
              style={{ transitionDelay: isVisible ? `${i * 40 + 200}ms` : '0ms' } as React.CSSProperties}
            />
          ))}
        </Link>

        {/* 모바일: 마퀴 */}
        <Link to="/members" className="sm:hidden block overflow-hidden">
          <div className="marquee-track flex gap-1.5">
            {doubled.map((m, i) => (
              <MemberAvatar
                key={`${m.id}-${i}`}
                name={m.name}
                avatar={m.avatar}
                size="sm"
                className="ring-2 ring-bg-primary shrink-0"
              />
            ))}
          </div>
        </Link>

        <Link
          to="/members"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors group/cta"
        >
          14기 멤버 보러 가기
          <span className="inline-block transition-transform group-hover/cta:translate-x-1">&rarr;</span>
        </Link>
      </div>
    </section>
  )
}
