import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CategoryBadge } from '../categories/CategoryBadge'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { todayISO } from '../../lib/dateUtils'

export function SpendingToday() {
  const { expenses, settings } = useApp()
  const today = todayISO()
  const todayExpenses = expenses
    .filter((e) => e.date === today)
    .sort((a, b) => b.amount - a.amount)

  const total = todayExpenses.reduce((s, e) => s + e.amount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Σήμερα</h3>
          {total > 0 && (
            <span className="text-sm font-bold text-slate-800">
              {settings.currency}{total.toFixed(2)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {todayExpenses.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            Δεν έχουν καταχωρηθεί έξοδα σήμερα
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {todayExpenses.slice(0, 5).map((e) => (
              <li key={e.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">{e.name}</p>
                  <CategoryBadge categoryId={e.categoryId} />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {settings.currency}{e.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
