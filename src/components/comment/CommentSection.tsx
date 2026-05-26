import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getComments, createComment } from '../../api/comments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import type { Comment, CommentCreateRequest } from '../../types/comment'

interface Props {
  postId: number
}

export function CommentSection({ postId }: Props) {
  const { isAuthenticated, userId } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getComments(postId)
      .then(setComments)
      .catch(() => setError('댓글을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [postId])

  async function handleCreate(content: string) {
    const created = await createComment(postId, { content })
    setComments((prev) => [...prev, created])
  }

  async function handleReply(req: CommentCreateRequest) {
    const created = await createComment(postId, req)
    setComments((prev) =>
      prev.map((c) =>
        c.id === req.parentId ? { ...c, replies: [...c.replies, created] } : c,
      ),
    )
  }

  function handleUpdated(updated: Comment) {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === updated.id) return { ...updated, replies: c.replies }
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === updated.id ? { ...updated, replies: r.replies } : r,
          ),
        }
      }),
    )
  }

  function handleDeleted(id: number) {
    setComments((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== id) })),
    )
  }

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  return (
    <section className="border-t border-border-default pt-10 pb-16">
      <h2 className="text-sm font-semibold text-text-primary mb-6">
        댓글
        {!isLoading && totalCount > 0 && (
          <span className="ml-2 text-text-tertiary font-normal">{totalCount}</span>
        )}
      </h2>

      {isAuthenticated ? (
        <div className="mb-8">
          <CommentForm onSubmit={handleCreate} />
        </div>
      ) : (
        <p className="mb-8 text-xs text-text-tertiary">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-4 h-4 border-2 border-border-default border-t-text-tertiary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-text-tertiary">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-tertiary">아직 댓글이 없습니다.</p>
      ) : (
        <div className="divide-y divide-border-default">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={userId}
              isAuthenticated={isAuthenticated}
              onReply={handleReply}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </section>
  )
}
