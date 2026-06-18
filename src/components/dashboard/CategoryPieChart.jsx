import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getSpendingByCategory } from '../../lib/calculations'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardBody } from '../ui/Card'

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium">{d.name}</p>
      <p style={{ color: d.color }}>{currency}{d.total.toFixed(2)} ({d.pct.toFixed(1)}%)</p>
    </div>
  )
}

export function CategoryPieChart({ yearMonth }) {
  const { expenses, categories, settings } = useApp()
  const data = getSpendingByCategory(expenses, categories, yearMonth)

  if (!data.length) {
    return (
      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-slate-700">Ανά Κατηγορία</h3></CardHeader>
        <CardBody>
          <div className="text-center py-8 text-slate-400 text-sm">Δεν υπάρχουν δεδομένα</div>
        </CardBody>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    name: d.category.name,
    total: d.total,
    pct: d.pct,
    color: d.category.color,
  }))

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-700">Ανά Κατηγορία</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="total"
            >
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={settings.currency} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 mt-1">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600">{d.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span>{d.pct.toFixed(0)}%</span>
                <span className="font-medium text-slate-700">{settings.currency}{d.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
