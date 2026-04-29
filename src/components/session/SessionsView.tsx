import { useState, useRef } from 'react'
import { sessions, notes, resources, retros } from '../../data/session-mock'
import type { SessionItem, ResourceKind } from '../../types/session'

type SubView = 'list' | 'detail' | 'create'
type Tab = 'notes' | 'resources' | 'retro'

const ACCEPTED_FILES = 'image/*,.ppt,.pptx,.pdf,.zip,.java,.py,.ts,.tsx,.js,.doc,.docx'
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13', 'W14', 'W15']

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼'
  if (['ppt', 'pptx'].includes(ext)) return '📊'
  if (ext === 'pdf') return '📄'
  if (['zip', 'tar'].includes(ext)) return '🗜'
  if (['java', 'py', 'ts', 'tsx', 'js', 'go', 'rs'].includes(ext)) return '💻'
  if (['doc', 'docx'].includes(ext)) return '📝'
  return '📎'
}

const kindIcons: Record<ResourceKind, React.ReactNode> = {
  SLIDE: (
    <svg viewBox="0 0 15 15" fill="none" className="w-3.5 h-3.5">
      <rect x="1.5" y="2.5" width="12" height="9" rx="1.5" stroke="#60A5FA" strokeWidth="1.1" />
      <path d="M5 13h5M7.5 11.5V13" stroke="#60A5FA" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  CODE: (
    <svg viewBox="0 0 15 15" fill="none" className="w-3.5 h-3.5">
      <path d="M4.5 5L2 7.5 4.5 10M10.5 5L13 7.5 10.5 10M8.5 4l-2 7" stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  LINK: (
    <svg viewBox="0 0 15 15" fill="none" className="w-3.5 h-3.5">
      <path d="M6 9.5a3.5 3.5 0 0 0 4.95 0l1.06-1.06A3.5 3.5 0 0 0 7.06 3.49L6 4.55" stroke="#4ADE80" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M9 5.5a3.5 3.5 0 0 0-4.95 0L3 6.56a3.5 3.5 0 0 0 4.95 4.95L9 10.45" stroke="#4ADE80" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  DOCUMENT: (
    <svg viewBox="0 0 15 15" fill="none" className="w-3.5 h-3.5">
      <path d="M3 2h7l3 3v8H3V2z" stroke="#FB923C" strokeWidth="1.1" />
      <path d="M10 2v3h3M5 7.5h5M5 10h3" stroke="#FB923C" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
}
const kindBg: Record<ResourceKind, string> = {
  SLIDE: 'bg-[#0F1E2E]',
  CODE: 'bg-[#2D1F5E]',
  LINK: 'bg-[#0F2E1A]',
  DOCUMENT: 'bg-[#2E1E0A]',
}

const defaultAvatarCls = 'bg-accent-muted text-accent-secondary'

function weekOf(week: string) {
  return week.split('-')[0]
}
function groupByWeek(items: SessionItem[]) {
  const map = new Map<string, SessionItem[]>()
  for (const s of items) {
    const w = weekOf(s.week)
    if (!map.has(w)) map.set(w, [])
    map.get(w)!.push(s)
  }
  return map
}

// ─── 세션 목록 ───────────────────────────────────────────────
function SessionList({ onSelect, onCreate }: { onSelect: (s: SessionItem) => void; onCreate: () => void }) {
  const grouped = groupByWeek(sessions)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-text-tertiary">{sessions.length}개 세션</p>
        <button
          onClick={onCreate}
          className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors"
        >
          + 세션 추가
        </button>
      </div>

      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([week, items]) => (
          <div key={week}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono font-semibold text-accent-secondary px-2 py-0.5 rounded bg-accent-muted">{week}</span>
              <div className="flex-1 h-px bg-border-default" />
              <span className="text-[11px] text-text-tertiary">{items.length}개 세션</span>
            </div>
            <div className="space-y-2">
              {items.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className="w-full text-left border border-border-default rounded-lg p-4 hover:border-border-hover hover:bg-bg-tertiary/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary leading-snug">{s.title}</span>
                    <svg className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed mt-1.5 mb-2.5 line-clamp-2">{s.content}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary">발표자: {s.speaker}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[#F59E0B] text-xs">{'★'.repeat(Math.round(s.rating))}</span>
                      <span className="text-xs text-text-tertiary">{s.rating.toFixed(1)}</span>
                      <span className="text-xs text-text-tertiary ml-1">노트 {s.noteCount}</span>
                      <span className="text-xs text-text-tertiary">자료 {s.resourceCount}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 세션 상세 ───────────────────────────────────────────────
function SessionDetail({ session, onBack }: { session: SessionItem; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('notes')
  const [search, setSearch] = useState('')

  const filteredNotes = notes.filter(n =>
    search === '' ||
    n.topic.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { value: Tab; label: string }[] = [
    { value: 'notes', label: `세션 노트 (${session.noteCount})` },
    { value: 'resources', label: `자료 (${session.resourceCount})` },
    { value: 'retro', label: '회고' },
  ]

  return (
    <div>
      {/* 헤더 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        세션 목록으로
      </button>

      <div className="mb-1">
        <span className="text-[11px] font-mono bg-bg-tertiary text-text-tertiary px-2 py-0.5 rounded">{session.week}</span>
      </div>
      <h2 className="text-lg font-semibold text-text-primary leading-snug mb-2">{session.title}</h2>
      <p className="text-sm text-text-secondary leading-relaxed mb-4">{session.content}</p>
      <div className="flex items-center gap-4 mb-5">
        <span className="text-xs text-text-tertiary">발표자: {session.speaker}</span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[#F59E0B] text-xs">{'★'.repeat(Math.round(session.rating))}{'☆'.repeat(5 - Math.round(session.rating))}</span>
          <span className="text-xs text-text-tertiary">{session.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border-default mb-5">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-sm px-4 py-2.5 border-b-2 transition-colors ${tab === t.value
                ? 'text-text-primary border-accent-primary font-medium'
                : 'text-text-tertiary border-transparent hover:text-text-secondary'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 세션 노트 */}
      {tab === 'notes' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 border border-border-default rounded-lg bg-bg-tertiary">
              <svg className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input type="text" placeholder="노트 검색..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none" />
            </div>
            <button className="text-xs px-3 py-2 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors flex-shrink-0">+ 노트 작성</button>
          </div>
          {filteredNotes.map(note => (
            <div key={note.id} className="border border-border-default rounded-lg p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${note.color || defaultAvatarCls}`}>{note.initial}</div>
                <span className="text-sm font-medium text-text-primary">{note.author}</span>
                <span className="text-xs text-text-tertiary ml-auto">{note.date}</span>
              </div>
              <div className="text-xs text-text-tertiary"><span className="text-text-secondary font-medium">주제:</span> {note.topic}</div>
              <p className="text-sm text-text-secondary leading-relaxed">{note.body}</p>
              {note.code && (
                <div className="bg-bg-tertiary rounded-md p-3">
                  {note.codeLang && <div className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1.5 font-mono">{note.codeLang}</div>}
                  <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap">{note.code}</pre>
                </div>
              )}
              {note.links && (
                <div className="flex flex-wrap gap-1.5">
                  {note.links.map(l => (
                    <span key={l} className="text-[11px] px-2.5 py-1 rounded-md bg-accent-muted border border-accent-primary/30 text-accent-secondary cursor-pointer hover:opacity-80 transition-opacity">{l}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 자료 */}
      {tab === 'resources' && (
        <div className="space-y-2">
          <div className="flex justify-end mb-2">
            <button className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors">+ 자료 업로드</button>
          </div>
          {resources.slice(0, session.resourceCount).map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 border border-border-default rounded-lg hover:border-border-hover transition-colors cursor-pointer">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${kindBg[r.kind]}`}>{kindIcons[r.kind]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{r.name}</div>
                <div className="text-xs text-text-tertiary mt-0.5">{r.author}</div>
              </div>
              {r.size && <span className="text-xs text-text-tertiary flex-shrink-0">{r.size}</span>}
            </div>
          ))}
        </div>
      )}

      {/* 회고 */}
      {tab === 'retro' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-bg-tertiary border border-border-default rounded-lg px-4 py-3">
            <span className="text-xs text-text-tertiary">세션 평균 별점</span>
            <span className="text-xl font-semibold text-[#F59E0B]">{session.rating.toFixed(1)}</span>
            <span className="text-[#F59E0B] text-sm">{'★'.repeat(Math.round(session.rating))}{'☆'.repeat(5 - Math.round(session.rating))}</span>
            <button className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors ml-auto">+ 회고 작성</button>
          </div>
          {retros.map(r => (
            <div key={r.id} className="border border-border-default rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${r.color || defaultAvatarCls}`}>{r.initial}</div>
                <span className="text-sm font-medium text-text-primary">{r.author}</span>
                <span className="text-[#F59E0B] text-sm ml-1">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-text-tertiary ml-auto">{r.rating}점</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 세션 추가 폼 ─────────────────────────────────────────────
function SessionCreateForm({ onBack }: { onBack: () => void }) {
  const [week, setWeek] = useState('W1')
  const [attachments, setAttachments] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
    e.target.value = ''
  }

  function removeFile(idx: number) {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        취소
      </button>

      <h2 className="text-base font-semibold text-text-primary mb-6">세션 추가</h2>

      <div className="space-y-5">
        {/* 주차 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">주차 선택</div>
          <select
            value={week}
            onChange={e => setWeek(e.target.value)}
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-border-hover transition-colors cursor-pointer"
          >
            {WEEKS.map((w, i) => <option key={w} value={w}>Week {i + 1}</option>)}
          </select>
        </div>

        {/* 발표자 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">발표자</div>
          <input
            type="text"
            placeholder="발표자 이름"
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors"
          />
        </div>

        {/* 제목 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">세션 제목</div>
          <input
            type="text"
            placeholder="세션 주제를 입력하세요"
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors"
          />
        </div>

        {/* 내용 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">세션 내용 / 아젠다</div>
          <textarea
            rows={5}
            placeholder="세션에서 다룰 내용이나 아젠다를 입력하세요"
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 자료 첨부 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">자료 첨부</div>
          <input ref={fileRef} type="file" multiple accept={ACCEPTED_FILES} onChange={handleFiles} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 w-full px-4 py-3 border border-dashed border-border-hover rounded-lg text-text-tertiary hover:text-text-secondary hover:border-accent-primary/50 transition-colors mb-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8 2v7M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">사진, PPT, PDF, 코드 파일 등 첨부</span>
            <span className="text-xs ml-auto opacity-60">클릭 또는 드래그</span>
          </button>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-tertiary border border-border-default">
                  <span>{fileIcon(f.name)}</span>
                  <span className="text-xs text-text-secondary max-w-[160px] truncate">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-text-tertiary hover:text-text-primary transition-colors ml-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-muted/30 border border-accent-primary/20">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-accent-secondary flex-shrink-0">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] text-accent-secondary">첨부한 자료는 자료 아카이브에서도 함께 확인할 수 있습니다</span>
          </div>
        </div>

        {/* 액션 */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border-default">
          <button onClick={onBack} className="text-xs px-4 py-2 rounded-md border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
            취소
          </button>
          <button onClick={onBack} className="text-xs px-4 py-2 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors">
            세션 저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────────
export function SessionsView() {
  const [subView, setSubView] = useState<SubView>('list')
  const [selected, setSelected] = useState<SessionItem | null>(null)

  if (subView === 'detail' && selected) {
    return <SessionDetail session={selected} onBack={() => setSubView('list')} />
  }
  if (subView === 'create') {
    return <SessionCreateForm onBack={() => setSubView('list')} />
  }
  return (
    <SessionList
      onSelect={s => { setSelected(s); setSubView('detail') }}
      onCreate={() => setSubView('create')}
    />
  )
}
