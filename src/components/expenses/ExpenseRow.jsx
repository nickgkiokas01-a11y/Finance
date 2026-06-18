import { useState } from 'react'
import { Pencil, Trash2, Repeat } from 'lucide-react'
import { CategoryBadge } from '../categories/CategoryBadge'
import { Modal } from '../ui/Modal'
import { ExpenseForm } from './ExpenseForm'
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../lib/dateUtils'

export function ExpenseRow({ expense }) {
  const { updateExpense, deleteExpense, settings } = useApp()
  const [editing, setEditing] = useState(false)

  const handleEdit = (data) => {
    updateExpense(expense.id, data)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Διαγραφή "${expense.name}";`)) deleteExpense(expense.id)
  }

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(expense.date)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-800">{expense.name}</span>
            {expense.isFixed && <Repeat size={12} className="text-slate-400" />}
          </div>
          {expense.notes && <p className="text-xs text-slate-400 mt-0.5">{expense.notes}</p>}
        </td>
        <td className="px-4 py-3">
          <CategoryBadge categoryId={expense.categoryId} />
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
          {settings.currency}{expense.amount.toFixed(2)}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center gap-1 justify-end">
            <button onClick={() => setEditing(true)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer">
              <Pencil size={14} />
            </button>
            <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Επεξεργασία Εξόδου">
        <ExpenseForm initial={expense} onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </Modal>
    </>
  )
}
