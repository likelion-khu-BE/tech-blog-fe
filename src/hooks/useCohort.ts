import { useState } from 'react'

const KEY = 'likelion-cohort'

export function useCohort() {
  const [cohort, set] = useState<number>(() => {
    const v = localStorage.getItem(KEY)
    return v ? parseInt(v, 10) : 14
  })

  function setCohort(n: number) {
    localStorage.setItem(KEY, String(n))
    set(n)
  }

  return { cohort, setCohort }
}
