import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Users, UserCheck, TrendingUp, Calendar, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export function AdminPanel() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isAdmin) return
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setProfiles(data || [])
        setLoading(false)
      })
  }, [isAdmin])

  if (!isAdmin) return <Navigate to="/" replace />

  const now = new Date()
  const thisMonth = profiles.filter((p) => {
    const d = new Date(p.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const lastMonth = profiles.filter((p) => {
    const d = new Date(p.created_at)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth()
  }).length

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-xs text-slate-500">Μόνο για διαχειριστή</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Σύνολο χρηστών" value={loading ? '—' : profiles.length} color="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard icon={UserCheck} label="Νέοι αυτόν τον μήνα" value={loading ? '—' : thisMonth} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard icon={TrendingUp} label="Προηγούμενος μήνας" value={loading ? '—' : lastMonth} color="bg-gradient-to-br from-violet-500 to-purple-600" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <h2 className="font-semibold text-slate-700 text-sm">Εγγεγραμμένοι χρήστες</h2>
        </div>

        {error && (
          <div className="px-5 py-4 text-sm text-red-600 bg-red-50">
            Σφάλμα: {error}. Βεβαιώσου ότι έτρεξες το SQL για τον πίνακα profiles στο Supabase.
          </div>
        )}

        {loading && !error && (
          <div className="px-5 py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            Δεν βρέθηκαν χρήστες. Βεβαιώσου ότι έτρεξες το SQL για τον πίνακα profiles.
          </div>
        )}

        {!loading && profiles.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wide">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Ημερομηνία εγγραφής</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {profiles.map((p, i) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{profiles.length - i}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {p.email}
                    {p.email === ADMIN_EMAIL && (
                      <span className="ml-2 text-[10px] bg-violet-100 text-violet-600 font-semibold px-1.5 py-0.5 rounded-full">admin</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {new Date(p.created_at).toLocaleString('el-GR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
