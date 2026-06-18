import { format, getDaysInMonth, getDate, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { el } from 'date-fns/locale'

export const currentMonthKey = () => format(new Date(), 'yyyy-MM')

export const monthLabel = (yearMonth) => {
  const [y, m] = yearMonth.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return format(d, 'MMMM yyyy', { locale: el })
}

export const daysInMonth = (yearMonth) => {
  const [y, m] = yearMonth.split('-')
  return getDaysInMonth(new Date(Number(y), Number(m) - 1, 1))
}

export const daysElapsed = (yearMonth) => {
  const today = currentMonthKey()
  if (yearMonth !== today) return daysInMonth(yearMonth)
  return getDate(new Date())
}

export const daysRemaining = (yearMonth) => {
  const total = daysInMonth(yearMonth)
  const elapsed = daysElapsed(yearMonth)
  return Math.max(0, total - elapsed)
}

export const formatDate = (isoString) => {
  try {
    return format(parseISO(isoString), 'd MMM', { locale: el })
  } catch {
    return isoString
  }
}

export const formatDateFull = (isoString) => {
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy')
  } catch {
    return isoString
  }
}

export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export const monthRange = (yearMonth) => {
  const [y, m] = yearMonth.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return { start: startOfMonth(d), end: endOfMonth(d) }
}

export const prevMonthKey = (yearMonth) => {
  const [y, m] = yearMonth.split('-')
  const d = new Date(Number(y), Number(m) - 2, 1)
  return format(d, 'yyyy-MM')
}

export const nextMonthKey = (yearMonth) => {
  const [y, m] = yearMonth.split('-')
  const d = new Date(Number(y), Number(m), 1)
  return format(d, 'yyyy-MM')
}
