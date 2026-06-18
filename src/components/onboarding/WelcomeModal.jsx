import { useState } from 'react'
import { Wallet, TrendingDown, BarChart3, Repeat } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const CURRENCIES = [
  { value: '€', label: 'Euro (€)' },
  { value: '$', label: 'Dollar ($)' },
  { value: '£', label: 'Pound (£)' },
  { value: '₺', label: 'Lira (₺)' },
]

export function WelcomeModal() {
  const { showWelcome, completeWelcome } = useApp()
  const [budget, setBudget] = useState('800')
  const [currency, setCurrency] = useState('€')
  const [error, setError] = useState('')

  if (!showWelcome) return null

  const handleStart = () => {
    const val = parseFloat(budget)
    if (!budget || isNaN(val) || val <= 0) {
      setError('Εισάγετε έγκυρο ποσό budget')
      return
    }
    completeWelcome(val, currency)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-8 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Καλωσήρθατε!</h1>
          <p className="text-indigo-200 text-sm mt-1">ΕξοδοΜέτρης — παρακολούθηση εξόδων</p>
        </div>

        {/* Features */}
        <div className="px-8 py-5 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: TrendingDown, label: 'Καθημερινή καταγραφή' },
              { icon: BarChart3, label: 'Μηνιαία ανάλυση' },
              { icon: Repeat, label: 'Σταθερά έξοδα' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Icon size={16} className="text-indigo-600" />
                </div>
                <span className="text-xs text-slate-500 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-8 py-6">
          <p className="text-sm font-medium text-slate-700 mb-4">
            Ορίστε το μηνιαίο σας budget για να ξεκινήσετε:
          </p>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Μηνιαίο Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  {currency}
                </span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={budget}
                  onChange={(e) => { setBudget(e.target.value); setError('') }}
                  className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-semibold"
                  placeholder="800"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div className="w-36">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Νόμισμα</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
          >
            Ξεκινήστε →
          </button>
          <p className="text-xs text-slate-400 text-center mt-3">
            Μπορείτε να αλλάξετε αυτές τις ρυθμίσεις οποτεδήποτε
          </p>
        </div>
      </div>
    </div>
  )
}
