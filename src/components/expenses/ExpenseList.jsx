import { useState } from 'react'
import { Search } from 'lucide-react'
import { ExpenseRow } from './ExpenseRow'
import { useApp } from '../../context/AppContext'

export function ExpenseList({ yearMonth }) {
  const { expenses, categories } = useApp()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20

  const filtered = expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => catFilter === 'all' || e.categoryId === catFilter)
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Αναζήτηση..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
        >
          <option value="all">Όλες οι κατηγορίες</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Δεν βρέθηκαν έξοδα</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ημ/νία</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Περιγραφή</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Κατηγορία</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Ποσό</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((e) => <ExpenseRow key={e.id} expense={e} />)}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <span>{filtered.length} εγγραφές</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  ←
                </button>
                <span className="px-2 py-1">{page}/{totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
