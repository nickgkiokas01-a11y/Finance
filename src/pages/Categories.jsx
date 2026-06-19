import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { CategoryForm } from '../components/categories/CategoryForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import { useApp } from '../context/AppContext'
import { getTotalSpent, getSpendingByCategory } from '../lib/calculations'

export function Categories() {
  const { categories, expenses, activeMonth, addCategory, updateCategory, deleteCategory, settings } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [reassignId, setReassignId] = useState('')

  const spending = getSpendingByCategory(expenses, categories, activeMonth)
  const spendMap = Object.fromEntries(spending.map((s) => [s.category.id, s.total]))

  const handleAdd = (data) => { addCategory(data); setShowAdd(false) }
  const handleEdit = (data) => { updateCategory(editing.id, data); setEditing(null) }

  const hasExpenses = (id) => expenses.some((e) => e.categoryId === id)

  const confirmDelete = () => {
    deleteCategory(deleting.id, hasExpenses(deleting.id) ? reassignId || null : null)
    setDeleting(null)
    setReassignId('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800">Κατηγορίες</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Νέα Κατηγορία
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardBody className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.icon || '📦'}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(cat)}
                    className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleting(cat)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
              <p className="text-lg font-bold mt-1" style={{ color: cat.color }}>
                {settings.currency}{(spendMap[cat.id] || 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">αυτό το μήνα</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Νέα Κατηγορία">
        <CategoryForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Επεξεργασία Κατηγορίας">
        {editing && (
          <CategoryForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => { setDeleting(null); setReassignId('') }} title="Διαγραφή Κατηγορίας">
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Θέλετε σίγουρα να διαγράψετε την κατηγορία <strong>{deleting.name}</strong>;
            </p>
            {hasExpenses(deleting.id) && (
              <Select
                label="Μεταφορά εξόδων σε άλλη κατηγορία"
                value={reassignId}
                onChange={(e) => setReassignId(e.target.value)}
              >
                <option value="">— Χωρίς μεταφορά (τα έξοδα θα μείνουν ανατεθειμένα) —</option>
                {categories.filter((c) => c.id !== deleting.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { setDeleting(null); setReassignId('') }}>Άκυρο</Button>
              <Button variant="danger" onClick={confirmDelete}>Διαγραφή</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
