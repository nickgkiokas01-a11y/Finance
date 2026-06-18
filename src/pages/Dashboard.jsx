import { Link } from 'react-router-dom'
import { ArrowRight, Bell, PlusCircle } from 'lucide-react'
import { BudgetMeter } from '../components/dashboard/BudgetMeter'
import { DailyBarChart } from '../components/dashboard/DailyBarChart'
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart'
import { SpendingToday } from '../components/dashboard/SpendingToday'
import { NewMonthPrompt } from '../components/onboarding/NewMonthPrompt'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'
import { getTotalSpent, getDailyAverage, getTodaySpent, getTotalIncome, getNetCashFlow } from '../lib/calculations'
import { currentMonthKey, daysRemaining } from '../lib/dateUtils'

function UpcomingFixed({ yearMonth }) {
  const { fixedExpenses, categories, settings } = useApp()
  const today = new Date().getDate()
  const thisMonth = currentMonthKey()

  const upcoming = fixedExpenses
    .filter((fe) => fe.active && yearMonth === thisMonth)
    .filter((fe) => fe.dayOfMonth > today && fe.dayOfMonth <= today + 7)
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth)

  if (!upcoming.length) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">Επερχόμενα Σταθερά</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="divide-y divide-slate-50">
          {upcoming.map((fe) => (
            <li key={fe.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700">{fe.name}</p>
                <p className="text-xs text-slate-400">στις {fe.dayOfMonth} του μήνα</p>
              </div>
              <span className="text-sm font-semibold text-amber-600">
                {settings.currency}{fe.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

function QuickStats({ yearMonth }) {
  const { expenses, settings } = useApp()
  const total = getTotalSpent(expenses, yearMonth)
  const todayTotal = getTodaySpent(expenses)
  const avg = getDailyAverage(expenses, yearMonth)
  const days = daysRemaining(yearMonth)

  const stats = [
    {
      label: 'Σύνολο εξόδων',
      value: `${settings.currency}${total.toFixed(2)}`,
      accent: 'border-l-indigo-400',
      valueColor: 'text-indigo-700',
    },
    {
      label: 'Σήμερα',
      value: `${settings.currency}${todayTotal.toFixed(2)}`,
      accent: 'border-l-rose-400',
      valueColor: 'text-rose-600',
    },
    {
      label: 'Ημερήσιος μέσος',
      value: `${settings.currency}${avg.toFixed(2)}`,
      accent: 'border-l-purple-400',
      valueColor: 'text-purple-700',
    },
    {
      label: 'Ημέρες ακόμα',
      value: days.toString(),
      accent: 'border-l-emerald-400',
      valueColor: 'text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white/70 backdrop-blur-sm rounded-xl border-l-4 ${s.accent} border border-slate-200/80 shadow-md shadow-slate-200/60 px-4 py-3`}
        >
          <p className="text-xs text-slate-500 font-medium">{s.label}</p>
          <p className={`text-xl font-extrabold mt-0.5 tracking-tight ${s.valueColor}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function CashFlowStrip({ yearMonth }) {
  const { incomes, expenses, settings } = useApp()
  const income = getTotalIncome(incomes, yearMonth)
  if (income === 0) return null
  const net = getNetCashFlow(incomes, expenses, yearMonth)
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-md shadow-emerald-500/25">
        <p className="text-emerald-100 text-xs font-medium">Εισόδημα μήνα</p>
        <p className="text-xl font-extrabold mt-0.5 tracking-tight">{settings.currency}{income.toFixed(2)}</p>
      </div>
      <div className={`rounded-xl p-4 text-white shadow-md ${net >= 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'}`}>
        <p className="text-white/80 text-xs font-medium">Net Cash Flow</p>
        <p className="text-xl font-extrabold mt-0.5 tracking-tight">{net >= 0 ? '+' : ''}{settings.currency}{net.toFixed(2)}</p>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { activeMonth, expenses } = useApp()
  const hasExpenses = expenses.some((e) => e.date.startsWith(activeMonth))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Αρχική</h1>
        <Link to="/add">
          <Button size="sm">
            <PlusCircle size={14} />
            Νέο Έξοδο
          </Button>
        </Link>
      </div>

      <NewMonthPrompt />
      <BudgetMeter yearMonth={activeMonth} />
      <QuickStats yearMonth={activeMonth} />
      <CashFlowStrip yearMonth={activeMonth} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DailyBarChart yearMonth={activeMonth} />
        <CategoryPieChart yearMonth={activeMonth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SpendingToday />
        <UpcomingFixed yearMonth={activeMonth} />
      </div>

      {hasExpenses && (
        <div className="flex justify-end">
          <Link to="/report" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline">
            Δείτε την πλήρη αναφορά <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
