import { useState } from 'react'
import { notes } from '../../data/session-mock'
import type { NoteItem } from '../../types/session'

function NoteCard({ note }: { note: NoteItem }) {
  const defaultColor = 'bg-accent-muted text-accent-secondary'
  return (
    <div className="border border-border-default rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${note.color || defaultColor}`}>
          {note.initial}
        </div>
        <span className="text-sm font-medium text-text-primary">{note.author}</span>
        <span className="text-xs text-text-tertiary ml-auto">{note.date}</span>
      </div>
      <div className="text-xs text-text-tertiary">
        <span className="text-text-secondary font-medium">주제:</span> {note.topic}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{note.body}</p>
      {note.code && (
        <div className="bg-bg-tertiary rounded-md p-3">
          {note.codeLang && (
            <div className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1.5 font-mono">{note.codeLang}</div>
          )}
          <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap">{note.code}</pre>
        </div>
      )}
      {note.links && note.links.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.links.map(link => (
            <span
              key={link}
              className="text-[11px] px-2.5 py-1 rounded-md bg-accent-muted border border-accent-primary/30 text-accent-secondary cursor-pointer hover:bg-accent-muted/80 transition-colors"
            >
              {link}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function NotesView() {
  const [search, setSearch] = useState('')

  const filtered = notes.filter(n =>
    search === '' ||
    n.topic.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase()) ||
    n.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-12 border-b border-border-default flex-shrink-0">
        <span className="text-sm font-medium text-text-primary flex-1">세션 노트</span>
        <button className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors">
          + 노트 작성
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 border border-border-default rounded-lg bg-bg-tertiary">
          <svg className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="노트 전체 검색 (Full-Text Search)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-text-tertiary">검색 결과가 없습니다</div>
        ) : (
          filtered.map(note => <NoteCard key={note.id} note={note} />)
        )}
      </div>
    </div>
  )
}
