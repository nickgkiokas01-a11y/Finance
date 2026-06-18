import { List } from 'lucide-react'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { Card } from '../components/ui/Card'
import { useApp } from '../context/AppContext'

export function Expenses() {
  const { activeMonth } = useApp()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <List size={20} className="text-indigo-600" />
        <h1 className="text-xl font-bold text-slate-800">Όλα τα Έξοδα</h1>
      </div>
      <Card>
        <div className="p-5">
          <ExpenseList yearMonth={activeMonth} />
        </div>
      </Card>
    </div>
  )
}
