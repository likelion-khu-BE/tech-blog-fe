import { useState, useMemo } from 'react'

export function useFilterState<T>(
  items: T[],
  categories: readonly string[],
  filterFn: (item: T, category: string) => boolean,
) {
  const [active, setActive] = useState(categories[0])

  const filtered = useMemo(() => {
    if (active === categories[0]) return items
    return items.filter((item) => filterFn(item, active))
  }, [items, active, categories, filterFn])

  return { active, setActive, filtered }
}
