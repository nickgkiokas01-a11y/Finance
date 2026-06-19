import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#0891b2', '#7c3aed',
]

const EMOJIS = [
  '🍔', '🍕', '🍣', '🍜', '☕', '🍺', '🛒', '🥗',
  '🚗', '🚌', '✈️', '🚂', '🛵', '⛽', '🏍️', '🚲',
  '🎬', '🎮', '🎵', '📚', '⚽', '🎭', '📱', '💻',
  '💊', '🏥', '💉', '🦷', '👓', '🏋️', '🧘', '❤️',
  '🛍️', '👗', '👟', '💄', '⌚', '🎁', '🏠', '💡',
  '💧', '🔥', '📄', '📺', '🌐', '💰', '💳', '🏦',
  '📦', '🐾', '🎓', '✂️', '🌱', '⭐', '🎯', '🔧',
]

export function CategoryForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || '')
  const [color, setColor] = useState(initial.color || COLORS[0])
  const [icon, setIcon] = useState(initial.icon || '📦')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Απαιτείται όνομα'); return }
    onSubmit({ name: name.trim(), color, icon })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name + selected icon preview */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border-2"
          style={{ backgroundColor: `${color}20`, borderColor: `${color}50` }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <Input
            label="Όνομα κατηγορίας"
            placeholder="π.χ. Φαγητό"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            error={error}
            autoFocus
          />
        </div>
      </div>

      {/* Emoji picker */}
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Icon</label>
        <div className="grid grid-cols-8 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setIcon(e)}
              className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:bg-white hover:shadow-sm cursor-pointer ${
                icon === e ? 'bg-white shadow-md ring-2 ring-indigo-400 scale-110' : ''
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Χρώμα</label>
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#1e293b' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Άκυρο</Button>}
        <Button type="submit">Αποθήκευση</Button>
      </div>
    </form>
  )
}
