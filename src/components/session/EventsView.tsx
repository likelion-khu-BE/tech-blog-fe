import { useState, useRef } from 'react'
import { posts as initialPosts } from '../../data/session-mock'
import type { Post, EventType, ViewMode } from '../../types/session'

type SubView = 'list' | 'post' | 'write' | 'edit'

interface LocalReply {
  id: number
  author: string
  initial: string
  color: string
  date: string
  text: string
}

interface LocalComment {
  id: number
  author: string
  initial: string
  color: string
  date: string
  text: string
  replies: LocalReply[]
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim()
}

const typeMeta: Record<EventType, { label: string; cls: string }> = {
  hackathon: { label: '해커톤', cls: 'bg-[#2D1F5E] text-[#A78BFA]' },
  ideathon: { label: '아이디어톤', cls: 'bg-[#0F2E1A] text-[#4ADE80]' },
  workshop: { label: '자유', cls: 'bg-[#2E1E0A] text-[#FB923C]' },
  project: { label: '프로젝트', cls: 'bg-[#2E0F0F] text-[#F87171]' },
  meetup: { label: '모임', cls: 'bg-[#0F1E2E] text-[#60A5FA]' },
}

const filterOptions: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'workshop', label: '자유' },
  { value: 'hackathon', label: '해커톤' },
  { value: 'ideathon', label: '아이디어톤' },
  { value: 'project', label: '프로젝트' },
  { value: 'meetup', label: '모임' },
]

const defaultAvatarCls = 'bg-accent-muted text-accent-secondary'

const ACCEPTED_FILES = 'image/*,.ppt,.pptx,.pdf,.zip,.java,.py,.ts,.tsx,.js,.doc,.docx'

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼'
  if (['ppt', 'pptx'].includes(ext)) return '📊'
  if (ext === 'pdf') return '📄'
  if (['zip', 'tar', 'gz'].includes(ext)) return '🗜'
  if (['java', 'py', 'ts', 'tsx', 'js', 'go', 'rs'].includes(ext)) return '💻'
  if (['doc', 'docx'].includes(ext)) return '📝'
  return '📎'
}

function ThumbPlaceholder({ post }: { post: Post }) {
  return (
    <div
      className={`w-full h-full rounded-md flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br ${post.thumbGradient}`}
    >
      <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="6" width="24" height="18" rx="2.5" fill={post.thumbAccent} opacity=".25" />
        <circle cx="10" cy="13" r="3" fill={post.thumbAccent} opacity=".5" />
        <path d="M2 20l6-5 4 4 4-3 10 7" stroke={post.thumbAccent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
      </svg>
      <span className="text-[9px] opacity-60" style={{ color: post.thumbAccent }}>사진</span>
    </div>
  )
}

function TypeBadge({ type }: { type: EventType }) {
  const { label, cls } = typeMeta[type]
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

// ─── 카드 컴포넌트 ────────────────────────────────────────────
function PostCard({ post, viewMode, onClick }: { post: Post; viewMode: ViewMode; onClick: () => void }) {
  if (viewMode === 'photo') {
    return (
      <div
        className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group border border-border-default hover:border-border-hover transition-colors"
        onClick={onClick}
      >
        {post.hasThumb ? (
          <div className={`w-full h-full bg-gradient-to-br ${post.thumbGradient}`} />
        ) : (
          <div className="w-full h-full bg-bg-tertiary flex flex-col items-center justify-center gap-2 p-3 text-center">
            <TypeBadge type={post.type} />
            <span className="text-xs text-text-secondary line-clamp-3">{post.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    )
  }

  if (viewMode === 'card') {
    return (
      <div
        className="border border-border-default rounded-lg p-4 cursor-pointer hover:border-border-hover transition-colors flex flex-col"
        onClick={onClick}
      >
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <TypeBadge type={post.type} />
          <span className="text-xs text-text-tertiary">{post.date}</span>
          <div className="flex items-center gap-1 ml-auto">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium ${post.color || defaultAvatarCls}`}>{post.initial}</div>
            <span className="text-xs text-text-tertiary">{post.author}</span>
          </div>
        </div>
        {post.hasThumb && (
          <div className={`w-full h-24 rounded-md bg-gradient-to-br ${post.thumbGradient} mb-3`} />
        )}
        <div className="text-sm font-medium text-text-primary mb-2 line-clamp-2">{post.title}</div>
        <p className="text-xs text-text-secondary line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-default">
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 12C7 12 2 8.5 2 5a3 3 0 0 1 5-2.24A3 3 0 0 1 12 5c0 3.5-5 7-5 7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            {post.likes}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5L2 11V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            {post.commentCount}
          </span>
          <div className="flex gap-1 flex-1 overflow-hidden">
            {post.tags.slice(0, 2).map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-default truncate max-w-[80px]">{t}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // blog mode (default)
  return (
    <div
      className={`border border-border-default rounded-lg p-4 cursor-pointer hover:border-border-hover transition-colors ${post.hasThumb ? 'grid grid-cols-[1fr_auto] gap-4 items-start' : ''}`}
      onClick={onClick}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <TypeBadge type={post.type} />
          <span className="w-1 h-1 rounded-full bg-border-hover flex-shrink-0" />
          <span className="text-xs text-text-tertiary">{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-border-hover flex-shrink-0" />
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium ${post.color || defaultAvatarCls}`}>{post.initial}</div>
            <span className="text-xs text-text-tertiary">{post.author}</span>
          </div>
        </div>
        <div className="text-sm font-medium text-text-primary mb-1.5 leading-snug">{post.title}</div>
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">{post.excerpt}</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-text-tertiary flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 12C7 12 2 8.5 2 5a3 3 0 0 1 5-2.24A3 3 0 0 1 12 5c0 3.5-5 7-5 7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            {post.likes}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-tertiary flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5L2 11V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            {post.commentCount}
          </span>
          <div className="flex gap-1 flex-1 overflow-hidden">
            {post.tags.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-default truncate">{t}</span>
            ))}
          </div>
        </div>
      </div>
      {post.hasThumb && (
        <div className="w-28 h-28 flex-shrink-0">
          <ThumbPlaceholder post={post} />
        </div>
      )}
    </div>
  )
}

// ─── 댓글 아이템 ──────────────────────────────────────────────
function CommentItem({
  comment,
  onEdit,
  onDelete,
  onAddReply,
  isReply = false,
}: {
  comment: LocalComment | LocalReply
  onEdit: (id: number, text: string) => void
  onDelete: (id: number) => void
  onAddReply?: (id: number, text: string) => void
  isReply?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  function submitEdit() {
    if (editText.trim()) onEdit(comment.id, editText.trim())
    setEditing(false)
  }

  function submitReply() {
    if (replyText.trim()) onAddReply?.(comment.id, replyText.trim())
    setReplyText('')
    setReplying(false)
  }

  return (
    <div>
      {/* 댓글 삭제 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-bg-secondary border border-border-default rounded-xl shadow-xl p-6 w-80 mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2.5A1.5 1.5 0 0 1 6.5 1h3A1.5 1.5 0 0 1 11 2.5V4M6 7v5M10 7v5M3 4l1 9.5A1 1 0 0 0 5 14.5h6a1 1 0 0 0 1-1L13 4" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">댓글 삭제</p>
                <p className="text-xs text-text-tertiary mt-0.5">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-5 line-clamp-2">
              <span className="text-text-primary font-medium">"{comment.text}"</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 text-sm py-2 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); onDelete(comment.id) }}
                className="flex-1 text-sm py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2.5">
        <div className={`${isReply ? 'w-6 h-6' : 'w-7 h-7'} rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${comment.color || defaultAvatarCls}`}>
          {comment.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-text-primary">{comment.author}</span>
            <span className="text-xs text-text-tertiary">{comment.date}</span>
            <div className="ml-auto flex items-center gap-2">
              {!isReply && (
                <button
                  onClick={() => setReplying(r => !r)}
                  className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  답글
                </button>
              )}
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-xs text-text-tertiary hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                autoFocus
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditing(false) }}
                className="flex-1 bg-bg-tertiary border border-border-hover rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
              />
              <button onClick={submitEdit} className="text-xs px-2.5 py-1 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors flex-shrink-0">저장</button>
              <button onClick={() => setEditing(false)} className="text-xs px-2.5 py-1 rounded-md border border-border-default text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0">취소</button>
            </div>
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed">{comment.text}</p>
          )}
        </div>
      </div>

      {/* 답글 목록 */}
      {'replies' in comment && comment.replies.length > 0 && (
        <div className="ml-9 mt-3 space-y-3 pl-3 border-l border-border-default">
          {comment.replies.map(r => (
            <CommentItem
              key={r.id}
              comment={r}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply
            />
          ))}
        </div>
      )}

      {/* 답글 입력 */}
      {replying && (
        <div className="ml-9 mt-2 flex gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${defaultAvatarCls}`}>나</div>
          <input
            autoFocus
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitReply(); if (e.key === 'Escape') setReplying(false) }}
            placeholder="답글을 입력하세요..."
            className="flex-1 bg-bg-tertiary border border-border-default rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors"
          />
          <button onClick={submitReply} className="text-xs px-2.5 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors flex-shrink-0">등록</button>
          <button onClick={() => setReplying(false)} className="text-xs px-2.5 py-1.5 rounded-md border border-border-default text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0">취소</button>
        </div>
      )}
    </div>
  )
}

// ─── 게시글 상세 ──────────────────────────────────────────────
function PostDetail({ post, onBack, onEdit, onDelete }: { post: Post; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const [liked, setLiked] = useState(true)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [comments, setComments] = useState<LocalComment[]>(() =>
    post.comments.map((c, i) => ({ ...c, id: i + 1, replies: [] }))
  )
  const [newComment, setNewComment] = useState('')

  function addComment() {
    if (!newComment.trim()) return
    setComments(prev => [...prev, { id: Date.now(), author: '나', initial: '나', color: defaultAvatarCls, date: '방금', text: newComment.trim(), replies: [] }])
    setNewComment('')
  }

  function editComment(id: number, text: string) {
    setComments(prev => prev.map(c => {
      if (c.id === id) return { ...c, text }
      return { ...c, replies: c.replies.map(r => r.id === id ? { ...r, text } : r) }
    }))
  }

  function deleteComment(id: number) {
    setComments(prev => {
      const top = prev.filter(c => c.id !== id)
      return top.map(c => ({ ...c, replies: c.replies.filter(r => r.id !== id) }))
    })
  }

  function addReply(commentId: number, text: string) {
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, replies: [...c.replies, { id: Date.now(), author: '나', initial: '나', color: defaultAvatarCls, date: '방금', text }] }
        : c
    ))
  }

  return (
    <div className="max-w-2xl">
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-bg-secondary border border-border-default rounded-xl shadow-xl p-6 w-80 mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V2.5A1.5 1.5 0 0 1 6.5 1h3A1.5 1.5 0 0 1 11 2.5V4M6 7v5M10 7v5M3 4l1 9.5A1 1 0 0 0 5 14.5h6a1 1 0 0 0 1-1L13 4" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">활동 기록 삭제</p>
                <p className="text-xs text-text-tertiary mt-0.5">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              <span className="text-text-primary font-medium">"{post.title}"</span> 기록을 삭제하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 text-sm py-2 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); onDelete() }}
                className="flex-1 text-sm py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        목록으로
      </button>

      <div className="flex items-center gap-2 mb-3">
        <TypeBadge type={post.type} />
      </div>

      <h1 className="text-xl font-semibold text-text-primary leading-snug mb-4">{post.title}</h1>

      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-border-default">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${post.color || defaultAvatarCls}`}>{post.initial}</div>
        <div>
          <div className="text-sm font-medium text-text-primary">{post.author}</div>
          <div className="text-xs text-text-tertiary">{post.date}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 rounded-md border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-xs px-3 py-1.5 rounded-md border border-border-default text-text-secondary hover:text-red-400 hover:border-red-400/50 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      <div
        className="text-sm text-text-secondary leading-relaxed mb-6
          [&_p]:mb-3
          [&_h3]:text-text-primary [&_h3]:font-medium [&_h3]:mt-5 [&_h3]:mb-2
          [&_ul]:pl-5 [&_ul]:mb-3
          [&_li]:mb-1 [&_li]:text-text-secondary
          [&_blockquote]:bg-bg-tertiary [&_blockquote]:border-l-2 [&_blockquote]:border-accent-primary [&_blockquote]:pl-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-md [&_blockquote]:my-3 [&_blockquote]:text-text-secondary"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      <div className="flex gap-2 pt-4 border-t border-border-default mb-8">
        <button
          onClick={() => { setLiked(p => { setLikeCount(c => c + (p ? -1 : 1)); return !p }) }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
            liked ? 'bg-accent-muted border-accent-primary/50 text-accent-secondary' : 'border-border-default text-text-tertiary hover:border-border-hover'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill={liked ? 'currentColor' : 'none'}>
            <path d="M7 12C7 12 2 8.5 2 5a3 3 0 0 1 5-2.24A3 3 0 0 1 12 5c0 3.5-5 7-5 7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
          좋아요 {likeCount}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-default text-xs text-text-tertiary hover:border-border-hover transition-colors">
          공유
        </button>
      </div>

      <div>
        <div className="text-sm text-text-tertiary mb-4">댓글 {comments.length}개</div>
        <div className="flex gap-2 mb-5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${defaultAvatarCls}`}>나</div>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addComment() }}
            placeholder="댓글을 남겨보세요..."
            className="flex-1 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors"
          />
          <button onClick={addComment} className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors flex-shrink-0">등록</button>
        </div>
        <div className="space-y-5">
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              onEdit={editComment}
              onDelete={deleteComment}
              onAddReply={addReply}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 글쓰기 / 수정 폼 ────────────────────────────────────────
function WriteView({ onBack, initialPost }: { onBack: () => void; initialPost?: Post }) {
  const isEdit = !!initialPost
  const [selectedCat, setSelectedCat] = useState<EventType>(initialPost?.type ?? 'workshop')
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [body, setBody] = useState(initialPost ? stripHtml(initialPost.body) : '')
  const [attachments, setAttachments] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>(initialPost?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t))
  }

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

      <div className="space-y-5">
        {/* 카테고리 */}
        <div>
          <div className="text-xs text-text-tertiary mb-2">카테고리</div>
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.filter(f => f.value !== 'all').map(f => (
              <button
                key={f.value}
                onClick={() => setSelectedCat(f.value as EventType)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCat === f.value
                    ? 'bg-accent-muted border-accent-primary/50 text-accent-secondary'
                    : 'border-border-default text-text-tertiary hover:border-border-hover'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full bg-transparent text-xl font-semibold text-text-primary placeholder:text-text-tertiary outline-none border-b border-border-default pb-3 focus:border-border-hover transition-colors"
        />

        {/* 본문 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">본문</div>
          <textarea
            rows={10}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="활동을 자유롭게 기록해보세요. 느낀 점, 배운 것, 힘들었던 점 모두 환영합니다 :)"
            className="w-full bg-bg-tertiary border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 태그 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">태그</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="태그 입력..."
              className="flex-1 bg-bg-tertiary border border-border-default rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-hover transition-colors"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 rounded-lg bg-bg-tertiary border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent-muted border border-accent-primary/30 text-accent-secondary">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:opacity-70 transition-opacity">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 첨부파일 */}
        <div>
          <div className="text-xs text-text-tertiary mb-1.5">첨부파일</div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED_FILES}
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 w-full px-4 py-3 border border-dashed border-border-hover rounded-lg text-text-tertiary hover:text-text-secondary hover:border-accent-primary/50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 10v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8 2v7M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">사진, PPT, PDF, 코드 파일 등 첨부</span>
            <span className="text-xs ml-auto opacity-60">클릭 또는 드래그</span>
          </button>

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-tertiary border border-border-default">
                  <span>{fileIcon(f.name)}</span>
                  <span className="text-xs text-text-secondary max-w-[160px] truncate">{f.name}</span>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-text-tertiary hover:text-text-primary transition-colors ml-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="flex gap-2 justify-end pt-4 border-t border-border-default">
          <button onClick={onBack} className="text-xs px-4 py-2 rounded-md border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors">
            {isEdit ? '취소' : '임시저장'}
          </button>
          <button onClick={onBack} className="text-xs px-4 py-2 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors">
            {isEdit ? '저장' : '발행'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 ────────────────────────────────────────────────────
export function EventsView() {
  const [postList, setPostList] = useState<Post[]>(initialPosts)
  const [subView, setSubView] = useState<SubView>('list')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('blog')
  const [filterType, setFilterType] = useState<EventType | 'all'>('all')

  const filtered = filterType === 'all' ? postList : postList.filter((p: Post) => p.type === filterType)

  function openPost(post: Post) {
    setSelectedPost(post)
    setSubView('post')
  }

  function handleDelete(id: number) {
    setPostList(prev => prev.filter(p => p.id !== id))
    setSubView('list')
  }

  if (subView === 'post' && selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={() => setSubView('list')}
        onEdit={() => setSubView('edit')}
        onDelete={() => handleDelete(selectedPost.id)}
      />
    )
  }

  if (subView === 'edit' && selectedPost) {
    return <WriteView initialPost={selectedPost} onBack={() => setSubView('post')} />
  }

  if (subView === 'write') {
    return <WriteView onBack={() => setSubView('list')} />
  }

  const viewModeButtons: { mode: ViewMode; title: string; icon: React.ReactNode }[] = [
    {
      mode: 'blog', title: '글+사진',
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8 4h5M8 7h5M8 10h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      mode: 'photo', title: '사진 피드',
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8" y="1" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.1" />
          <rect x="1" y="8" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8" y="8" width="5" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      ),
    },
    {
      mode: 'card', title: '카드형',
      icon: (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M1 3.5h12M1 7h12M1 10.5h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <div>
      {/* 컨트롤 바 */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {filterOptions.map(f => (
            <button
              key={f.value}
              onClick={() => setFilterType(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filterType === f.value
                  ? 'bg-accent-muted border-accent-primary/50 text-accent-secondary'
                  : 'border-border-default text-text-tertiary hover:text-text-secondary hover:border-border-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex border border-border-default rounded-md overflow-hidden">
            {viewModeButtons.map(({ mode, title, icon }, i) => (
              <button
                key={mode}
                title={title}
                onClick={() => setViewMode(mode)}
                className={`w-8 h-7 flex items-center justify-center transition-colors ${
                  viewMode === mode ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary'
                } ${i > 0 ? 'border-l border-border-default' : ''}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSubView('write')}
            className="text-xs px-3 py-1.5 rounded-md bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors"
          >
            + 글쓰기
          </button>
        </div>
      </div>

      {/* 카드 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-text-tertiary">해당 카테고리의 기록이 없습니다.</div>
      ) : viewMode === 'photo' ? (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} viewMode={viewMode} onClick={() => openPost(post)} />
          ))}
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} viewMode={viewMode} onClick={() => openPost(post)} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} viewMode={viewMode} onClick={() => openPost(post)} />
          ))}
        </div>
      )}
    </div>
  )
}
