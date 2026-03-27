import { useState, useEffect } from 'react'

export function useFirstVisit(key = 'visited') {
  const [isFirstVisit] = useState(() => !sessionStorage.getItem(key))

  useEffect(() => {
    sessionStorage.setItem(key, '1')
  }, [key])

  // 첫 방문: @keyframes (GPU 독립, 메인 스레드 부하에 강함)
  // 재방문: transition (JS 제어 fade-in)
  return { isFirstVisit, canAnimate: !isFirstVisit }
}
