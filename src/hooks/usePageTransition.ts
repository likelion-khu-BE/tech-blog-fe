import { useState, useEffect } from 'react'

export function usePageTransition() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return visible
}
