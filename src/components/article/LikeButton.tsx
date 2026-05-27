import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { toggleLikePost } from '../../api/posts'

interface Props {
  postId: number
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const inFlight = useRef(false)

  async function handleClick() {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (inFlight.current) return
    inFlight.current = true

    const prev = { liked, count }
    const nextLiked = !liked
    const nextCount = nextLiked ? count + 1 : Math.max(0, count - 1)
    setLiked(nextLiked)
    setCount(nextCount)

    try {
      const { liked: server } = await toggleLikePost(postId)
      if (server !== nextLiked) {
        setLiked(server)
        setCount(server ? prev.count + 1 : Math.max(0, prev.count - 1))
      }
    } catch {
      setLiked(prev.liked)
      setCount(prev.count)
    } finally {
      inFlight.current = false
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      className="inline-flex items-center gap-0.5 text-text-tertiary hover:text-accent-primary transition-colors"
    >
      <svg
        className="w-3 h-3"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}
