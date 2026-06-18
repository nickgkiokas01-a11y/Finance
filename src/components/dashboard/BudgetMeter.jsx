import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTotalSpent, getRemainingBudget } from '../../lib/calculations'
import { daysRemaining } from '../../lib/dateUtils'

export function BudgetMeter({ yearMonth }) {
  const { expenses, budgets, settings, setBudget } = useApp()
  const budget = budgets[yearMonth] || 0
  const total = getTotalSpent(expenses, yearMonth)
  const remaining = getRemainingBudget(budget, expenses, yearMonth)
  const days = daysRemaining(yearMonth)
  const pct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0
  const remainPct = budget > 0 ? Math.max(0, (remaining / budget) * 100) : 0

  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const startEdit = () => {
    setInputVal(budget > 0 ? budget.toString() : '')
    setEditing(true)
  }
  const confirmEdit = () => {
    const val = parseFloat(inputVal)
    if (!isNaN(val) && val > 0) setBudget(yearMonth, val)
    setEditing(false)
  }
  const cancelEdit = () => setEditing(false)

  const statusLabel = remainPct > 50 ? 'Καλά!' : remainPct > 20 ? 'Προσοχή' : 'Κίνδυνος'
  const statusBg = remainPct > 50 ? 'bg-white/20' : remainPct > 20 ? 'bg-amber-400/30' : 'bg-red-400/30'

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 shadow-xl shadow-indigo-500/30 text-white">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-indigo-200 text-sm font-medium">Διαθέσιμο υπόλοιπο</p>
          <p className="text-4xl font-extrabold mt-1 tracking-tight">
            {settings.currency}{remaining.toFixed(2)}
          </p>

          {/* Inline budget edit */}
          <div className="flex items-center gap-1 mt-1">
            {editing ? (
              <div className="flex items-center gap-1">
                <span className="text-indigo-300 text-xs">{settings.currency}</span>
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  step="10"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEdit()
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  className="w-24 bg-white/20 border border-white/40 rounded px-2 py-0.5 text-xs text-white placeholder-indigo-300 focus:outline-none focus:ring-1 focus:ring-white/50"
                />
                <button onClick={confirmEdit} className="text-green-300 hover:text-green-200 cursor-pointer">
                  <Check size={13} />
                </button>
                <button onClick={cancelEdit} className="text-white/50 hover:text-white cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={startEdit}
                className="flex items-center gap-1 text-xs text-indigo-300 hover:text-white group cursor-pointer transition-colors"
                title="Αλλαγή budget"
              >
                <span>από {settings.currency}{budget.toFixed(0)}</span>
                <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-indigo-200 text-sm font-medium">Δαπανήθηκαν</p>
          <p className="text-2xl font-bold mt-1">{settings.currency}{total.toFixed(2)}</p>
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${statusBg} text-white`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-white/80 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-indigo-200">{pct.toFixed(0)}% χρησιμοποιήθηκε</span>
        {days > 0 && budget > 0 && remaining > 0 && (
          <span className="text-xs text-indigo-200">
            {days} ημέρες · {settings.currency}{(remaining / days).toFixed(2)}/ημέρα
          </span>
        )}
      </div>
    </div>
  )
}
