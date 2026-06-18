import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#6b7280', '#0891b2', '#7c3aed',
]

export function CategoryForm({ initial = {}, onSubmit, onCancel }) {
  const [name, setName] = useState(initial.name || '')
  const [color, setColor] = useState(initial.color || COLORS[0])
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Απαιτείται όνομα'); return }
    onSubmit({ name: name.trim(), color })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Όνομα κατηγορίας"
        placeholder="π.χ. Φαγητό"
        value={name}
        onChange={(e) => { setName(e.target.value); setError('') }}
        error={error}
        autoFocus
      />
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
