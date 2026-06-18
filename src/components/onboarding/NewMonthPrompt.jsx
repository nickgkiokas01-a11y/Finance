import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { currentMonthKey, monthLabel, prevMonthKey } from '../../lib/dateUtils'

export function NewMonthPrompt() {
  const { showNewMonthPrompt, setBudget, budgets, settings, dismissNewMonthPrompt } = useApp()
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  if (!showNewMonthPrompt) return null

  const thisMonth = currentMonthKey()
  const prev = prevMonthKey(thisMonth)
  const prevBudget = budgets[prev] || settings.defaultBudget || 800

  const handleUseSame = () => {
    setBudget(thisMonth, prevBudget)
  }

  const handleCustom = () => {
    const val = parseFloat(customInput)
    if (!isNaN(val) && val > 0) {
      setBudget(thisMonth, val)
    }
  }

  return (
    <div className="mb-5 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={15} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Νέος μήνας — {monthLabel(thisMonth)}!
            </p>
            <p className="text-xs text-indigo-600 mt-0.5">
              Ορίστε το budget για αυτό τον μήνα.
            </p>
          </div>
        </div>
        <button
          onClick={dismissNewMonthPrompt}
          className="text-indigo-300 hover:text-indigo-500 cursor-pointer mt-0.5"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleUseSame}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Ίδιο budget ({settings.currency}{prevBudget.toFixed(0)})
        </button>

        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="px-4 py-2 bg-white border border-indigo-300 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            Αλλαγή ποσού
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              step="10"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={prevBudget.toString()}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleCustom}
              className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              Αποθήκευση
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
            >
              Άκυρο
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
