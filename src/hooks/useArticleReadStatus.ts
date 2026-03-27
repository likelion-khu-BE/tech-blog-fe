import { useState, useEffect, useCallback } from 'react'

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000

export function useArticleReadStatus() {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = document.cookie.match(/readArticles=([^;]+)/)
    if (stored) {
      setReadSlugs(new Set(stored[1].split(',')))
    }
  }, [])

  const markAsRead = useCallback((slug: string) => {
    setReadSlugs((prev) => {
      const next = new Set(prev)
      next.add(slug)
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `readArticles=${[...next].join(',')};expires=${expires};path=/`
      return next
    })
  }, [])

  const isNew = useCallback(
    (article: { slug: string; date: string }) => {
      if (readSlugs.has(article.slug)) return false
      return Date.now() - new Date(article.date).getTime() < THREE_DAYS
    },
    [readSlugs],
  )

  return { readSlugs, isNew, markAsRead }
}
