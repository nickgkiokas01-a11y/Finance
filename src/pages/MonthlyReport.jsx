import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CategoryBadge } from '../components/categories/CategoryBadge'
import { useApp } from '../context/AppContext'
import {
  getTotalSpent, getRemainingBudget, getSpendingByCategory,
  getDailyTotals, getTopExpenses, getMonthOverMonth, generateCSV,
  getTotalIncome, getNetCashFlow,
} from '../lib/calculations'
import { monthLabel, prevMonthKey, formatDate } from '../lib/dateUtils'

function SummaryCard({ yearMonth }) {
  const { expenses, incomes, budgets, settings } = useApp()
  const budget = budgets[yearMonth] || 0
  const total = getTotalSpent(expenses, yearMonth)
  const income = getTotalIncome(incomes, yearMonth)
  const net = getNetCashFlow(incomes, expenses, yearMonth)
  const prev = prevMonthKey(yearMonth)
  const mom = getMonthOverMonth(expenses, budgets, yearMonth, prev)
  const hasIncome = income > 0

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-700">Σύνοψη — {monthLabel(yearMonth)}</h2>
      </CardHeader>
      <CardBody>
        <div className={`grid gap-4 ${hasIncome ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
          <div>
            <p className="text-xs text-slate-500">Συνολικά Έξοδα</p>
            <p className="text-2xl font-bold text-slate-800">{settings.currency}{total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Budget</p>
            <p className="text-2xl font-bold text-slate-800">
              {budget > 0 ? `${settings.currency}${budget.toFixed(2)}` : '—'}
            </p>
          </div>
          {hasIncome && (
            <div>
              <p className="text-xs text-slate-500">Εισόδημα</p>
              <p className="text-2xl font-bold text-emerald-600">+{settings.currency}{income.toFixed(2)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500">{hasIncome ? 'Net Cash Flow' : (mom.surplus >= 0 ? 'Εξοικονόμηση' : 'Υπέρβαση')}</p>
            <p className={`text-2xl font-bold ${hasIncome ? (net >= 0 ? 'text-emerald-600' : 'text-red-500') : (mom.surplus >= 0 ? 'text-green-600' : 'text-red-500')}`}>
              {hasIncome
                ? `${net >= 0 ? '+' : ''}${settings.currency}${net.toFixed(2)}`
                : (budget > 0 ? `${mom.surplus >= 0 ? '+' : ''}${settings.currency}${mom.surplus.toFixed(2)}` : '—')}
            </p>
          </div>
        </div>
        {mom.previous > 0 && (
          <p className={`text-xs mt-3 ${mom.diff >= 0 ? 'text-red-500' : 'text-green-600'}`}>
            {mom.diff >= 0 ? '▲' : '▼'} {Math.abs(mom.diffPct).toFixed(1)}% σε σχέση με τον προηγούμενο μήνα
          </p>
        )}
      </CardBody>
    </Card>
  )
}

function CategoryBreakdown({ yearMonth }) {
  const { expenses, categories, settings } = useApp()
  const data = getSpendingByCategory(expenses, categories, yearMonth)

  if (!data.length) return null

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-slate-700">Ανά Κατηγορία</h2>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={data.length * 44 + 20}>
          <BarChart data={data.map(d => ({ name: d.category.name, total: d.total, color: d.category.color }))}
            layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} width={90} />
            <Tooltip formatter={(v) => `${settings.currency}${v.toFixed(2)}`} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {data.map((d) => <Cell key={d.category.id} fill={d.category.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((d) => (
            <div key={d.category.id} className="flex items-center justify-between text-sm">
              <CategoryBadge categoryId={d.category.id} />
              <div className="flex gap-4 text-slate-600">
                <span>{d.pct.toFixed(1)}%</span>
                <span className="font-semibold text-slate-800 w-24 text-right">
                  {settings.currency}{d.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

function TopExpenses({ yearMonth }) {
  const { expenses, settings } = useApp()
  const top = getTopExpenses(expenses, yearMonth, 10)

  if (!top.length) return null

  return (
    <Card>
      <CardHeader><h2 className="text-sm font-semibold text-slate-700">Μεγαλύτερα Έξοδα</h2></CardHeader>
      <div className="divide-y divide-slate-50">
        {top.map((e, i) => (
          <div key={e.id} className="px-5 py-3 flex items-center gap-3">
            <span className="text-slate-400 text-xs w-4">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm text-slate-800">{e.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <CategoryBadge categoryId={e.categoryId} />
                <span className="text-xs text-slate-400">{formatDate(e.date)}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-800">{settings.currency}{e.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function DailyTable({ yearMonth }) {
  const { expenses, settings } = useApp()
  const days = getDailyTotals(expenses, yearMonth).filter((d) => d.total > 0)

  if (!days.length) return null

  return (
    <Card>
      <CardHeader><h2 className="text-sm font-semibold text-slate-700">Ανά Ημέρα</h2></CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">Ημέρα</th>
              <th className="px-5 py-2 text-right text-xs font-medium text-slate-500">Σύνολο</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {days.map((d) => (
              <tr key={d.day} className="hover:bg-slate-50">
                <td className="px-5 py-2.5 text-sm text-slate-600">{d.day}/{yearMonth.split('-')[1]}</td>
                <td className="px-5 py-2.5 text-sm font-semibold text-slate-800 text-right">
                  {settings.currency}{d.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function MonthlyReport() {
  const { expenses, categories, activeMonth } = useApp()

  const handleExport = () => {
    const csv = generateCSV(expenses, categories, activeMonth)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `εξοδα-${activeMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasData = expenses.some((e) => e.date.startsWith(activeMonth))

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800">Μηνιαία Αναφορά</h1>
        </div>
        {hasData && (
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} /> Εξαγωγή CSV
          </Button>
        )}
      </div>

      {!hasData ? (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-slate-400">
              <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Δεν υπάρχουν δεδομένα για αυτό τον μήνα</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <SummaryCard yearMonth={activeMonth} />
          <CategoryBreakdown yearMonth={activeMonth} />
          <TopExpenses yearMonth={activeMonth} />
          <DailyTable yearMonth={activeMonth} />
        </>
      )}
    </div>
  )
}
