import { useState } from 'react'
import { Wallet, Check, Bell } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { CategoryBadge } from '../components/categories/CategoryBadge'
import { useApp } from '../context/AppContext'
import { getTotalSpent } from '../lib/calculations'
import { currentMonthKey, monthLabel, prevMonthKey } from '../lib/dateUtils'

function CategoryBudgetRow({ category, budget, spent, currency, onChange }) {
  const [val, setVal] = useState(budget > 0 ? budget.toString() : '')
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const barColor = pct > 90 ? '#f43f5e' : pct > 70 ? '#f59e0b' : '#818cf8'

  const handleBlur = () => {
    const n = parseFloat(val)
    onChange(isNaN(n) || n <= 0 ? 0 : n)
  }

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 mb-2">
        <CategoryBadge categoryId={category.id} />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">{currency}{spent.toFixed(2)}</span>
          {budget > 0 && <span className="text-xs text-slate-400">/ {currency}{budget.toFixed(2)}</span>}
          <input
            type="number"
            min="0"
            step="10"
            placeholder="0 = χωρίς"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={handleBlur}
            className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 text-right"
          />
        </div>
      </div>
      {budget > 0 && (
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      )}
    </div>
  )
}

export function Budget() {
  const { budgets, setBudget, expenses, categories, activeMonth, settings, updateCategoryBudget, updateSettings } = useApp()
  const currentBudget = budgets[activeMonth] || 0
  const [input, setInput] = useState(currentBudget.toString())
  const [saved, setSaved] = useState(false)

  const [threshold, setThreshold] = useState((settings.budgetAlertThreshold || 80).toString())
  const [savedThreshold, setSavedThreshold] = useState(false)

  const handleSave = () => {
    const val = parseFloat(input)
    if (!isNaN(val) && val > 0) {
      setBudget(activeMonth, val)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleSaveThreshold = () => {
    const val = parseInt(threshold)
    if (!isNaN(val) && val > 0 && val <= 100) {
      updateSettings({ budgetAlertThreshold: val })
      setSavedThreshold(true)
      setTimeout(() => setSavedThreshold(false), 2000)
    }
  }

  const copyFromPrev = () => {
    const prev = prevMonthKey(activeMonth)
    const prevBudget = budgets[prev]
    if (prevBudget) setInput(prevBudget.toString())
  }

  const isCurrentMonth = activeMonth === currentMonthKey()

  // Build history of last 6 months
  const months = []
  let m = activeMonth
  for (let i = 0; i < 6; i++) {
    const b = budgets[m] || 0
    const spent = getTotalSpent(expenses, m)
    months.push({ key: m, label: monthLabel(m), budget: b, spent, diff: b - spent })
    m = prevMonthKey(m)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Wallet size={20} className="text-indigo-600" />
        <h1 className="text-xl font-bold text-slate-800">Προϋπολογισμός</h1>
      </div>

      {/* Monthly budget */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">
            {monthLabel(activeMonth)} — Ορισμός Budget
          </h2>
        </CardHeader>
        <CardBody>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label={`Budget (${settings.currency})`}
                type="number" min="1" step="10"
                value={input}
                onChange={(e) => { setInput(e.target.value); setSaved(false) }}
              />
            </div>
            <Button onClick={handleSave} className={saved ? 'bg-green-600 hover:bg-green-700' : ''}>
              {saved ? <><Check size={14} /> Αποθηκεύτηκε</> : 'Αποθήκευση'}
            </Button>
            <Button variant="secondary" onClick={copyFromPrev}>Αντιγραφή ↩</Button>
          </div>
        </CardBody>
      </Card>

      {/* Alert threshold */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-700">Ειδοποίηση budget (threshold)</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-slate-500 mb-3">
            Λαμβάνεις ειδοποίηση όταν ξεπεράσεις αυτό το ποσοστό του budget σου (συνολικά ή ανά κατηγορία).
          </p>
          <div className="flex gap-3 items-end">
            <div className="w-36">
              <Input
                label="Κατώφλι (%)"
                type="number" min="10" max="100" step="5"
                value={threshold}
                onChange={(e) => { setThreshold(e.target.value); setSavedThreshold(false) }}
              />
            </div>
            <Button onClick={handleSaveThreshold} className={savedThreshold ? 'bg-green-600 hover:bg-green-700' : ''}>
              {savedThreshold ? <><Check size={14} /> OK</> : 'Αποθήκευση'}
            </Button>
            <div className="flex gap-1">
              {[50, 70, 80, 90].map((v) => (
                <button
                  key={v}
                  onClick={() => setThreshold(v.toString())}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors ${
                    threshold === v.toString()
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 text-slate-600 hover:border-indigo-400'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Category budgets */}
      {isCurrentMonth && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-700">Budget ανά Κατηγορία</h2>
            <p className="text-xs text-slate-400 mt-0.5">Αλλαγές αποθηκεύονται αυτόματα</p>
          </CardHeader>
          <CardBody className="py-1">
            {categories.map((cat) => {
              const spent = expenses
                .filter((e) => e.date.startsWith(activeMonth) && e.categoryId === cat.id)
                .reduce((sum, e) => sum + e.amount, 0)
              const budget = settings.categoryBudgets?.[cat.id] || 0
              return (
                <CategoryBudgetRow
                  key={cat.id}
                  category={cat}
                  budget={budget}
                  spent={spent}
                  currency={settings.currency}
                  onChange={(amount) => updateCategoryBudget(cat.id, amount)}
                />
              )
            })}
          </CardBody>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Ιστορικό</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">Μήνας</th>
                <th className="px-5 py-2 text-right text-xs font-medium text-slate-500">Budget</th>
                <th className="px-5 py-2 text-right text-xs font-medium text-slate-500">Δαπανήθηκαν</th>
                <th className="px-5 py-2 text-right text-xs font-medium text-slate-500">Διαφορά</th>
                <th className="px-5 py-2 text-center text-xs font-medium text-slate-500">Κατάσταση</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {months.map(({ key, label, budget, spent, diff }) => (
                <tr key={key} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm text-slate-700 capitalize">{label}</td>
                  <td className="px-5 py-3 text-sm text-right text-slate-600">
                    {budget > 0 ? `${settings.currency}${budget.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-slate-800 font-medium">
                    {settings.currency}{spent.toFixed(2)}
                  </td>
                  <td className={`px-5 py-3 text-sm text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {budget > 0 ? `${diff >= 0 ? '+' : ''}${settings.currency}${diff.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {budget > 0 && spent > 0 && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {diff >= 0 ? '✓ Εντός' : '✗ Υπέρβαση'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
