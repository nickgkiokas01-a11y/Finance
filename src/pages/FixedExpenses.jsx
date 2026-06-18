import { useState } from 'react'
import { Repeat, Plus, Pencil, Trash2, Check, Play, Bell } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { CategoryBadge } from '../components/categories/CategoryBadge'
import { useApp } from '../context/AppContext'
import { currentMonthKey } from '../lib/dateUtils'

function FixedForm({ initial = {}, onSubmit, onCancel }) {
  const { categories } = useApp()
  const [form, setForm] = useState({
    name: initial.name || '',
    amount: initial.amount || '',
    categoryId: initial.categoryId || categories[0]?.id || '',
    dayOfMonth: initial.dayOfMonth || 1,
    active: initial.active !== undefined ? initial.active : true,
    reminderDays: initial.reminderDays !== undefined ? initial.reminderDays : 3,
  })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Απαιτείται όνομα'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Εισάγετε έγκυρο ποσό'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ ...form, amount: Number(Number(form.amount).toFixed(2)), dayOfMonth: Number(form.dayOfMonth) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Περιγραφή" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Ποσό (€)" type="number" min="0.01" step="0.01" value={form.amount}
            onChange={(e) => set('amount', e.target.value)} error={errors.amount} />
        </div>
        <div className="flex-1">
          <Input label="Ημέρα μήνα" type="number" min="1" max="31" value={form.dayOfMonth}
            onChange={(e) => set('dayOfMonth', e.target.value)} />
        </div>
      </div>
      <Select label="Κατηγορία" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-1 flex items-center gap-1">
          <Bell size={12} className="text-amber-500" /> Ειδοποίηση πριν
        </label>
        <select
          value={form.reminderDays}
          onChange={(e) => set('reminderDays', Number(e.target.value))}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-full"
        >
          <option value={0}>Χωρίς ειδοποίηση</option>
          <option value={1}>1 μέρα πριν</option>
          <option value={2}>2 μέρες πριν</option>
          <option value={3}>3 μέρες πριν</option>
          <option value={5}>5 μέρες πριν</option>
          <option value={7}>7 μέρες πριν</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="rounded" />
        Ενεργό
      </label>
      <div className="flex gap-2 justify-end pt-1">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Άκυρο</Button>}
        <Button type="submit">Αποθήκευση</Button>
      </div>
    </form>
  )
}

export function FixedExpenses() {
  const { fixedExpenses, expenses, addFixed, updateFixed, deleteFixed, applyFixed, settings } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const thisMonth = currentMonthKey()

  const isApplied = (fe) =>
    fe.lastAppliedMonth === thisMonth ||
    expenses.some((e) => e.fixedExpenseId === fe.id && e.date.startsWith(thisMonth))

  const handleAdd = (data) => { addFixed(data); setShowAdd(false) }
  const handleEdit = (data) => { updateFixed(editing.id, data); setEditing(null) }
  const handleDelete = (fe) => {
    if (confirm(`Διαγραφή "${fe.name}";`)) deleteFixed(fe.id)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Repeat size={20} className="text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800">Σταθερά Έξοδα</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Νέο Σταθερό
        </Button>
      </div>

      {fixedExpenses.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-10 text-slate-400">
              <Repeat size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Δεν υπάρχουν σταθερά έξοδα</p>
              <p className="text-xs mt-1">Προσθέστε επαναλαμβανόμενα έξοδα όπως συνδρομές, λογαριασμούς κ.λπ.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {fixedExpenses.map((fe) => {
              const applied = isApplied(fe)
              return (
                <li key={fe.id} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${fe.active ? 'text-slate-800' : 'text-slate-400'}`}>
                          {fe.name}
                        </span>
                        {!fe.active && (
                          <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">Ανενεργό</span>
                        )}
                        {applied && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded flex items-center gap-1">
                            <Check size={10} /> Εφαρμόστηκε
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <CategoryBadge categoryId={fe.categoryId} />
                        <span className="text-xs text-slate-400">κάθε {fe.dayOfMonth} του μήνα</span>
                        {fe.reminderDays > 0 && (
                          <span className="text-xs text-amber-600 flex items-center gap-0.5">
                            <Bell size={10} /> {fe.reminderDays}μ πριν
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {settings.currency}{fe.amount.toFixed(2)}
                      </span>
                      {!applied && fe.active && (
                        <button
                          onClick={() => applyFixed(fe.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                          title="Εφαρμογή τώρα"
                        >
                          <Play size={13} />
                        </button>
                      )}
                      <button onClick={() => setEditing(fe)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(fe)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέο Σταθερό Έξοδο">
        <FixedForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Επεξεργασία Σταθερού">
        {editing && <FixedForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
