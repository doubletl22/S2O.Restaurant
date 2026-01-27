'use client'

interface CategoryChipsProps {
  categories: string[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function CategoryChips({ categories, activeIndex, onSelect }: CategoryChipsProps) {
  return (
    <div 
      className="flex gap-2 overflow-x-auto px-4 py-3"
      style={{ scrollbarWidth: 'none' }}
    >
      {categories.map((category, idx) => {
        const isActive = idx === activeIndex
        
        return (
          <button
            key={category}
            onClick={() => onSelect(idx)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, var(--g1), var(--g2))',
                    color: '#ffffff',
                  }
                : {
                    background: 'var(--card)',
                    color: 'var(--text)',
                    border: '1px solid var(--line)',
                  }
            }
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
