import { useState, useEffect, useCallback } from 'react'

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000
const COOKIE_KEY = 'readPosts'

export function useArticleReadStatus() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`${COOKIE_KEY}=([^;]+)`))
    if (match) setReadIds(new Set(match[1].split(',')))
  }, [])

  const markAsRead = useCallback((id: number) => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(String(id))
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `${COOKIE_KEY}=${[...next].join(',')};expires=${expires};path=/`
      return next
    })
  }, [])

  const isNew = useCallback(
    (post: { id: number; createdAt: string }) => {
      if (readIds.has(String(post.id))) return false
      return Date.now() - new Date(post.createdAt).getTime() < THREE_DAYS
    },
    [readIds],
  )

  return { isNew, markAsRead }
}
