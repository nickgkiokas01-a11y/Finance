import { daysInMonth, daysElapsed } from './dateUtils'

export const getTotalIncome = (incomes, yearMonth) =>
  incomes.filter((i) => i.date.startsWith(yearMonth)).reduce((sum, i) => sum + i.amount, 0)

export const getNetCashFlow = (incomes, expenses, yearMonth) =>
  getTotalIncome(incomes, yearMonth) - getTotalSpent(expenses, yearMonth)

export const getTodaySpent = (expenses) => {
  const today = new Date().toISOString().slice(0, 10)
  return expenses.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0)
}

export const getTotalSpent = (expenses, yearMonth) =>
  expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .reduce((sum, e) => sum + e.amount, 0)

export const getRemainingBudget = (budget, expenses, yearMonth) =>
  (budget || 0) - getTotalSpent(expenses, yearMonth)

export const getSpendingByCategory = (expenses, categories, yearMonth) => {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(yearMonth))
  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
  const map = {}
  for (const e of monthExpenses) {
    map[e.categoryId] = (map[e.categoryId] || 0) + e.amount
  }
  return categories
    .map((cat) => ({
      category: cat,
      total: map[cat.id] || 0,
      pct: total > 0 ? ((map[cat.id] || 0) / total) * 100 : 0,
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
}

export const getDailyTotals = (expenses, yearMonth) => {
  const days = daysInMonth(yearMonth)
  const map = {}
  expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .forEach((e) => {
      const day = parseInt(e.date.split('-')[2], 10)
      map[day] = (map[day] || 0) + e.amount
    })
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    total: map[i + 1] || 0,
  }))
}

export const getDailyAverage = (expenses, yearMonth) => {
  const total = getTotalSpent(expenses, yearMonth)
  const elapsed = daysElapsed(yearMonth)
  return elapsed > 0 ? total / elapsed : 0
}

export const getTopExpenses = (expenses, yearMonth, limit = 5) =>
  expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)

export const getMonthOverMonth = (expenses, budgets, yearMonth, prevMonthKey) => {
  const current = getTotalSpent(expenses, yearMonth)
  const previous = getTotalSpent(expenses, prevMonthKey)
  const currentBudget = budgets[yearMonth] || 0
  return {
    current,
    previous,
    diff: current - previous,
    diffPct: previous > 0 ? ((current - previous) / previous) * 100 : 0,
    surplus: currentBudget - current,
    underBudget: currentBudget > 0 && current <= currentBudget,
  }
}

export const generateCSV = (expenses, categories, yearMonth) => {
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const rows = expenses
    .filter((e) => e.date.startsWith(yearMonth))
    .sort((a, b) => a.date.localeCompare(b.date))
  const header = 'Ημερομηνία,Περιγραφή,Κατηγορία,Ποσό,Σημειώσεις'
  const lines = rows.map(
    (e) =>
      `${e.date},"${e.name}","${catMap[e.categoryId] || ''}",${e.amount.toFixed(2)},"${e.notes || ''}"`
  )
  return [header, ...lines].join('\n')
}
