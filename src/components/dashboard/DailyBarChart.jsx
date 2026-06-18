import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDailyTotals } from '../../lib/calculations'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { currentMonthKey } from '../../lib/dateUtils'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium">{label} {payload[0].payload.month}</p>
      <p className="text-indigo-600">{currency}{payload[0].value.toFixed(2)}</p>
    </div>
  )
}

export function DailyBarChart({ yearMonth }) {
  const { expenses, budgets, settings } = useApp()
  const data = getDailyTotals(expenses, yearMonth)
  const budget = budgets[yearMonth] || 0
  const days = data.filter((d) => d.total > 0).length || 1
  const dailyLimit = budget > 0 ? budget / data.length : 0
  const today = currentMonthKey() === yearMonth ? new Date().getDate() : 0

  const colored = data.map((d) => ({
    ...d,
    fill: d.day === today ? '#6366f1' : d.total > dailyLimit && dailyLimit > 0 ? '#f43f5e' : '#818cf8',
  }))

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-700">Ημερήσια Έξοδα</h3>
      </CardHeader>
      <CardBody className="pt-2">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={colored} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip currency={settings.currency} />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="total" radius={[3, 3, 0, 0]}>
              {colored.map((d) => (
                <Cell key={d.day} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-1">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1" />Σήμερα
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 ml-3 mr-1" />Υπέρβαση ημερήσιου ορίου
        </p>
      </CardBody>
    </Card>
  )
}
