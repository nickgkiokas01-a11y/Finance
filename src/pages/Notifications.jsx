import { Bell, Calendar, X, CheckCheck, AlertTriangle, Tag } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { useApp } from '../context/AppContext'

function NotificationItem({ n, onDismiss }) {
  const { settings } = useApp()

  if (n.type === 'budget_alert' || n.type === 'category_budget_alert') {
    const isOver = n.pct >= 100
    return (
      <div className={`rounded-xl border border-slate-200/80 px-5 py-4 flex items-start justify-between gap-3 shadow-sm ${
        isOver ? 'bg-red-50 border-l-4 border-l-red-400' : 'bg-amber-50 border-l-4 border-l-amber-400'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
            isOver ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {n.type === 'category_budget_alert' ? <Tag size={15} /> : <AlertTriangle size={15} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{n.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isOver ? 'Υπέρβαση budget!' : `${n.pct}% χρησιμοποιήθηκε`}
              {' · '}κατώφλι ειδοποίησης: {n.threshold}%
            </p>
            <div className="mt-1.5 h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, n.pct)}%`, backgroundColor: isOver ? '#f43f5e' : '#f59e0b' }}
              />
            </div>
          </div>
        </div>
        <button onClick={() => onDismiss(n.id)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 mt-0.5">
          <X size={15} />
        </button>
      </div>
    )
  }

  // upcoming_fixed (default)
  const daysUntil = n.daysUntil ?? 0
  const urgency = daysUntil === 0
    ? { bg: 'bg-red-50 border-l-4 border-l-red-400', icon: 'bg-red-100 text-red-600', label: 'Σήμερα!' }
    : daysUntil === 1
    ? { bg: 'bg-amber-50 border-l-4 border-l-amber-400', icon: 'bg-amber-100 text-amber-600', label: 'Αύριο' }
    : { bg: 'bg-indigo-50/50 border-l-4 border-l-indigo-300', icon: 'bg-indigo-100 text-indigo-600', label: `Σε ${daysUntil} μέρες` }

  return (
    <div className={`rounded-xl ${urgency.bg} border border-slate-200/80 px-5 py-4 flex items-start justify-between gap-3 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 ${urgency.icon} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
          <Calendar size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{n.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {urgency.label} · κάθε {n.dayOfMonth} του μήνα
          </p>
          <p className="text-base font-extrabold text-indigo-600 mt-1 tracking-tight">
            {settings.currency}{n.amount?.toFixed(2)}
          </p>
        </div>
      </div>
      <button onClick={() => onDismiss(n.id)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 mt-0.5">
        <X size={15} />
      </button>
    </div>
  )
}

export function Notifications() {
  const { notifications, dismissNotification } = useApp()

  const active = notifications.filter((n) => !n.dismissed)
  const dismissed = notifications.filter((n) => n.dismissed)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Bell size={20} className="text-indigo-600" />
        <h1 className="text-xl font-bold text-slate-800">Ειδοποιήσεις</h1>
        {active.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {active.length}
          </span>
        )}
      </div>

      {active.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12 text-slate-400">
              <CheckCheck size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Όλα καλά!</p>
              <p className="text-xs mt-1">Δεν υπάρχουν ειδοποιήσεις που χρειάζονται προσοχή.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {active.map((n) => (
            <NotificationItem key={n.id} n={n} onDismiss={dismissNotification} />
          ))}
        </div>
      )}

      {dismissed.length > 0 && (
        <p className="text-xs text-slate-400 mt-6 text-center">
          {dismissed.length} ειδοποιήσεις έχουν απορριφθεί αυτόν τον μήνα
        </p>
      )}
    </div>
  )
}
