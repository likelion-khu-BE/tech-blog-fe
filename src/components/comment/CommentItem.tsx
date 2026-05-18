import { useState } from 'react'
import { timeAgo } from '../../utils/time'
import { updateComment, deleteComment, toggleCommentLike } from '../../api/comments'
import { CommentForm } from './CommentForm'
import type { Comment, CommentCreateRequest } from '../../types/comment'

interface Props {
  comment: Comment
  currentUserId: number | null
  isAuthenticated: boolean
  onReply: (req: CommentCreateRequest) => Promise<void>
  onUpdated: (updated: Comment) => void
  onDeleted: (id: number) => void
  depth?: number
}

const MAX_DEPTH = 1

export function CommentItem({
  comment,
  currentUserId,
  isAuthenticated,
  onReply,
  onUpdated,
  onDeleted,
  depth = 0,
}: Props) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [liked, setLiked] = useState(comment.liked)
  const [likeCount, setLikeCount] = useState(comment.likeCount)
  const [isLiking, setIsLiking] = useState(false)

  const isDeleted = comment.userId === null
  const isOwner = currentUserId !== null && comment.userId === currentUserId

  async function handleLike() {
    if (!isAuthenticated || isLiking || isDeleted) return
    setIsLiking(true)
    try {
      const next = await toggleCommentLike(comment.id)
      setLiked(next)
      setLikeCount((prev) => prev + (next ? 1 : -1))
    } finally {
      setIsLiking(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return
    await deleteComment(comment.id)
    onDeleted(comment.id)
  }

  async function handleUpdate(content: string) {
    const updated = await updateComment(comment.id, { content })
    onUpdated(updated)
    setIsEditing(false)
  }

  async function handleReply(content: string) {
    await onReply({ content, parentId: comment.id })
    setIsReplying(false)
  }

  return (
    <div className={depth > 0 ? 'ml-6 pl-4 border-l border-border-default' : ''}>
      <div className="py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="font-medium text-text-secondary">
              {isDeleted ? '(삭제됨)' : `user_${comment.userId}`}
            </span>
            <span>&middot;</span>
            <span>{timeAgo(comment.createdAt)}</span>
          </div>

          {!isDeleted && isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-text-tertiary hover:text-red-400 transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <CommentForm
            initialValue={comment.content}
            submitLabel="저장"
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <p className={`text-sm leading-relaxed break-keep ${isDeleted ? 'text-text-tertiary italic' : 'text-text-primary'}`}>
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isDeleted}
              className={`inline-flex items-center gap-1 text-xs transition-colors disabled:opacity-40 disabled:cursor-default ${
                liked ? 'text-accent-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            {isAuthenticated && !isDeleted && depth < MAX_DEPTH && (
              <button
                onClick={() => setIsReplying((v) => !v)}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                답글
              </button>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-3">
            <CommentForm
              placeholder="답글을 작성하세요"
              submitLabel="답글 등록"
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
              onReply={onReply}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
