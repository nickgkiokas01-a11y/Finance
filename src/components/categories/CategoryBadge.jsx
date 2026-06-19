import { useApp } from '../../context/AppContext'

export function CategoryBadge({ categoryId }) {
  const { categories } = useApp()
  const cat = categories.find((c) => c.id === categoryId)
  if (!cat) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
    >
      {cat.icon && <span>{cat.icon}</span>}
      {cat.name}
    </span>
  )
}
