import { useRef, useState, useEffect } from 'react'

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.1, ...options })

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, isVisible }
}
