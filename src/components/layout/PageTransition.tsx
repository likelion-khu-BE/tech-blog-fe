import { useRef, useEffect, type ReactNode } from 'react'

interface Props {
  locationKey: string
  children: ReactNode
}

export function PageTransition({ locationKey, children }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = nodeRef.current
    if (!el) return

    el.style.opacity = '0'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.2s ease-out'
      el.style.opacity = '1'
    })
  }, [locationKey])

  return (
    <div ref={nodeRef} key={locationKey}>
      {children}
    </div>
  )
}
