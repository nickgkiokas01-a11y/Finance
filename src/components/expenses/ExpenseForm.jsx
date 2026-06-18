import { useState } from 'react'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useApp } from '../../context/AppContext'
import { todayISO } from '../../lib/dateUtils'

export function ExpenseForm({ initial = {}, onSubmit, onCancel }) {
  const { categories } = useApp()
  const [form, setForm] = useState({
    name: initial.name || '',
    amount: initial.amount || '',
    categoryId: initial.categoryId || categories[0]?.id || '',
    date: initial.date || todayISO(),
    notes: initial.notes || '',
  })
  const [errors, setErrors] = useState({})

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Απαιτείται περιγραφή'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Εισάγετε έγκυρο ποσό'
    if (!form.categoryId) e.categoryId = 'Επιλέξτε κατηγορία'
    if (!form.date) e.date = 'Επιλέξτε ημερομηνία'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ ...form, amount: Number(Number(form.amount).toFixed(2)) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Περιγραφή"
        placeholder="π.χ. Σούπερ Μάρκετ"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={errors.name}
        autoFocus
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Ποσό (€)"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            error={errors.amount}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Ημερομηνία"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            error={errors.date}
          />
        </div>
      </div>
      <Select
        label="Κατηγορία"
        value={form.categoryId}
        onChange={(e) => set('categoryId', e.target.value)}
        error={errors.categoryId}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>
      <Textarea
        label="Σημειώσεις (προαιρετικό)"
        placeholder="Επιπλέον πληροφορίες..."
        rows={2}
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
      />
      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Άκυρο</Button>
        )}
        <Button type="submit">Αποθήκευση</Button>
      </div>
    </form>
  )
}
