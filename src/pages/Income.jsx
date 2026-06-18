import { useState } from 'react'
import { TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useApp } from '../context/AppContext'
import { getTotalIncome, getNetCashFlow } from '../lib/calculations'
import { formatDate, currentMonthKey } from '../lib/dateUtils'

function IncomeForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    amount: initial.amount || '',
    date: initial.date || new Date().toISOString().slice(0, 10),
    notes: initial.notes || '',
  })
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Απαιτείται περιγραφή'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Εισάγετε έγκυρο ποσό'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit({ ...form, amount: Number(Number(form.amount).toFixed(2)) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Περιγραφή" placeholder="π.χ. Μισθός Ιουνίου" value={form.name}
        onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
      <div className="flex gap-3">
        <div className="flex-1">
          <Input label="Ποσό (€)" type="number" min="0.01" step="0.01" value={form.amount}
            onChange={(e) => set('amount', e.target.value)} error={errors.amount} />
        </div>
        <div className="flex-1">
          <Input label="Ημερομηνία" type="date" value={form.date}
            onChange={(e) => set('date', e.target.value)} />
        </div>
      </div>
      <Input label="Σημειώσεις (προαιρετικά)" value={form.notes}
        onChange={(e) => set('notes', e.target.value)} />
      <div className="flex gap-2 justify-end pt-1">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Άκυρο</Button>}
        <Button type="submit">Αποθήκευση</Button>
      </div>
    </form>
  )
}

export function Income() {
  const { incomes, expenses, addIncome, updateIncome, deleteIncome, settings, activeMonth } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  const monthIncomes = incomes
    .filter((i) => i.date.startsWith(activeMonth))
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalIncome = getTotalIncome(incomes, activeMonth)
  const net = getNetCashFlow(incomes, expenses, activeMonth)

  const handleAdd = (data) => { addIncome(data); setShowAdd(false) }
  const handleEdit = (data) => { updateIncome(editing.id, data); setEditing(null) }
  const handleDelete = (item) => {
    if (confirm(`Διαγραφή "${item.name}";`)) deleteIncome(item.id)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-800">Εισοδήματα</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Νέο Εισόδημα
        </Button>
      </div>

      {/* Hero cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-5 text-white shadow-xl shadow-emerald-500/25">
          <p className="text-emerald-100 text-xs font-medium">Εισόδημα μήνα</p>
          <p className="text-3xl font-extrabold mt-1 tracking-tight">
            {settings.currency}{totalIncome.toFixed(2)}
          </p>
          <p className="text-emerald-200 text-xs mt-1">{monthIncomes.length} εγγραφές</p>
        </div>
        <div className={`rounded-2xl p-5 text-white shadow-xl ${
          net >= 0
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25'
            : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25'
        }`}>
          <p className="text-white/80 text-xs font-medium">Net Cash Flow</p>
          <p className="text-3xl font-extrabold mt-1 tracking-tight">
            {net >= 0 ? '+' : ''}{settings.currency}{net.toFixed(2)}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {net >= 0 ? 'Θετική ροή' : 'Ελλειμματική ροή'}
          </p>
        </div>
      </div>

      {/* Income list */}
      {monthIncomes.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-10 text-slate-400">
              <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Δεν υπάρχουν εισοδήματα αυτόν τον μήνα</p>
              <p className="text-xs mt-1">Πρόσθεσε μισθό, freelance, ή οποιοδήποτε εισόδημα</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">Εγγραφές μήνα</h2>
          </CardHeader>
          <ul className="divide-y divide-slate-100">
            {monthIncomes.map((item) => (
              <li key={item.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.date)}</p>
                  {item.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{item.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-600">
                    +{settings.currency}{item.amount.toFixed(2)}
                  </span>
                  <button onClick={() => setEditing(item)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέο Εισόδημα">
        <IncomeForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Επεξεργασία Εισοδήματος">
        {editing && <IncomeForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  )
}
