import { useState } from 'react'
import { usePageTransition } from '../hooks/usePageTransition'
import { useCohort } from '../hooks/useCohort'
import { EventsView } from '../components/session/EventsView'
import { SessionsView } from '../components/session/SessionsView'
import { ResourcesView } from '../components/session/ResourcesView'

type Tab = 'events' | 'sessions' | 'resources'

// 운영 기수 목록 — 새 기수 시작 시 여기에 추가
const COHORTS = [14]

const tabs: { value: Tab; label: string }[] = [
  { value: 'events', label: '활동 기록' },
  { value: 'sessions', label: '세션 목록' },
  { value: 'resources', label: '자료 아카이브' },
]

export default function SessionBoardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('events')
  const visible = usePageTransition()
  const { cohort, setCohort } = useCohort()

  return (
    <main className="max-w-[900px] mx-auto px-4 md:px-5 pt-14">
      <header className={`pt-14 md:pt-20 pb-8 transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight break-keep">
            세션보드
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary tabular-nums">
            <span>경희대학교 멋쟁이사자처럼</span>
            <select
              value={cohort}
              onChange={e => setCohort(parseInt(e.target.value, 10))}
              className="bg-bg-secondary border border-border-default rounded px-1.5 py-0.5 text-text-secondary outline-none hover:border-border-hover focus:border-accent-primary/50 transition-colors cursor-pointer"
            >
              {COHORTS.map(n => (
                <option key={n} value={n}>{n}기</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-sm text-text-secondary">매주 진행하는 스터디 세션과 활동 기록을 관리합니다</p>
      </header>

      <div className={`transition-opacity duration-700 delay-100 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex border-b border-border-default mb-8">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`text-sm px-4 py-2.5 border-b-2 transition-colors ${
                activeTab === tab.value
                  ? 'text-text-primary border-accent-primary font-medium'
                  : 'text-text-tertiary border-transparent hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pb-20">
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'sessions' && <SessionsView generationNumber={cohort} />}
          {activeTab === 'resources' && <ResourcesView generationNumber={cohort} />}
        </div>
      </div>
    </main>
  )
}
