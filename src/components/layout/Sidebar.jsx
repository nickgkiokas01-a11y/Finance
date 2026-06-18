import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Tag, Wallet, Repeat, BarChart3, List, Settings2, X, Bell, TrendingUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { monthLabel } from '../../lib/dateUtils'
import { getRemainingBudget } from '../../lib/calculations'

const BASE_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Αρχική' },
  { to: '/add', icon: PlusCircle, label: 'Νέο Έξοδο' },
  { to: '/expenses', icon: List, label: 'Έξοδα' },
  { to: '/categories', icon: Tag, label: 'Κατηγορίες' },
  { to: '/budget', icon: Wallet, label: 'Προϋπολογισμός' },
  { to: '/fixed', icon: Repeat, label: 'Σταθερά Έξοδα' },
  { to: '/income', icon: TrendingUp, label: 'Εισοδήματα' },
  { to: '/report', icon: BarChart3, label: 'Αναφορά' },
]

export function Sidebar({ onClose }) {
  const { expenses, budgets, activeMonth, settings, notifications } = useApp()
  const activeNotifs = notifications.filter((n) => !n.dismissed).length
  const budget = budgets[activeMonth] || 0
  const remaining = getRemainingBudget(budget, expenses, activeMonth)
  const pct = budget > 0 ? Math.min(100, (remaining / budget) * 100) : 0
  const barColor = pct > 50 ? '#34d399' : pct > 20 ? '#fbbf24' : '#f87171'

  return (
    <aside className="w-56 shrink-0 bg-slate-900 flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {settings.userName ? (
              <>
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-lg border border-indigo-500/30 shrink-0">
                  {settings.userIcon || '😊'}
                </div>
                <span className="font-bold text-white text-sm truncate">{settings.userName}</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <Wallet size={16} className="text-white" />
                </div>
                <span className="font-bold text-white text-sm">ΕξοδοΜέτρης</span>
              </>
            )}
          </div>
          <button onClick={onClose} className="md:hidden p-1 text-slate-500 hover:text-slate-300 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500 capitalize">{monthLabel(activeMonth)}</div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: barColor, boxShadow: `0 0 6px ${barColor}80` }}
            />
          </div>
          <span className="text-xs font-semibold text-white">
            {settings.currency}{remaining.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {BASE_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/60 text-white font-medium shadow-lg shadow-indigo-500/20 border-l-2 border-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        {/* Notifications with badge */}
        <NavLink
          to="/notifications"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/60 text-white font-medium shadow-lg shadow-indigo-500/20 border-l-2 border-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <div className="relative">
            <Bell size={16} />
            {activeNotifs > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                {activeNotifs > 9 ? '9+' : activeNotifs}
              </span>
            )}
          </div>
          Ειδοποιήσεις
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/60 text-white font-medium shadow-lg shadow-indigo-500/20 border-l-2 border-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Settings2 size={16} />
          Ρυθμίσεις
        </NavLink>
      </nav>
    </aside>
  )
}
