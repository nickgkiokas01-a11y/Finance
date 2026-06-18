import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { monthLabel, prevMonthKey, nextMonthKey, currentMonthKey } from '../../lib/dateUtils'

export function TopBar({ onMenuClick }) {
  const { activeMonth, setActiveMonth } = useApp()
  const isCurrentMonth = activeMonth === currentMonthKey()

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMonth(prevMonthKey(activeMonth))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-slate-700 capitalize min-w-36 text-center">
            {monthLabel(activeMonth)}
          </span>
          <button
            onClick={() => setActiveMonth(nextMonthKey(activeMonth))}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          {!isCurrentMonth && (
            <button
              onClick={() => setActiveMonth(currentMonthKey())}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 ml-1 cursor-pointer transition-colors"
            >
              Σήμερα
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
