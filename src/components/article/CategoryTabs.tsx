import { memo } from 'react'

interface Props {
  categories: readonly string[]
  active: string
  onSelect: (cat: string) => void
  className?: string
}

export const CategoryTabs = memo(function CategoryTabs({ categories, active, onSelect, className = '' }: Props) {
  return (
    <nav className={`flex gap-1 mb-2 overflow-x-auto scrollbar-hide ${className}`}>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`px-2.5 py-1.5 text-xs rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
            active === cat
              ? 'text-text-primary bg-bg-tertiary'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary/50'
          }`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  )
})
