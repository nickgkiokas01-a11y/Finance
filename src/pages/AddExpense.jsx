import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { useApp } from '../context/AppContext'

export function AddExpense() {
  const { addExpense } = useApp()
  const navigate = useNavigate()
  const [addAnother, setAddAnother] = useState(false)
  const [key, setKey] = useState(0)

  const handleSubmit = (data) => {
    addExpense(data)
    if (addAnother) {
      setKey((k) => k + 1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle size={20} className="text-indigo-600" />
        <h1 className="text-xl font-bold text-slate-800">Νέο Έξοδο</h1>
      </div>
      <Card>
        <CardBody>
          <ExpenseForm key={key} onSubmit={handleSubmit} />
        </CardBody>
      </Card>
      <label className="flex items-center gap-2 mt-4 text-sm text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={addAnother}
          onChange={(e) => setAddAnother(e.target.checked)}
          className="rounded"
        />
        Προσθήκη άλλου εξόδου μετά την αποθήκευση
      </label>
    </div>
  )
}
