import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { load, save } from '../lib/storage'
import { currentMonthKey, prevMonthKey } from '../lib/dateUtils'
import { v4 as uuid } from '../lib/uuid'

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Φαγητό', color: '#f97316', icon: 'UtensilsCrossed' },
  { id: 'cat-2', name: 'Μεταφορά', color: '#3b82f6', icon: 'Car' },
  { id: 'cat-3', name: 'Λογαριασμοί', color: '#ef4444', icon: 'Receipt' },
  { id: 'cat-4', name: 'Ψυχαγωγία', color: '#8b5cf6', icon: 'Gamepad2' },
  { id: 'cat-5', name: 'Υγεία', color: '#10b981', icon: 'Heart' },
  { id: 'cat-6', name: 'Άλλα', color: '#6b7280', icon: 'MoreHorizontal' },
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [categories, setCategories] = useState(() => {
    const stored = load('et_categories', null)
    return stored && stored.length > 0 ? stored : DEFAULT_CATEGORIES
  })
  const [expenses, setExpenses] = useState(() => load('et_expenses', []))
  const [incomes, setIncomes] = useState(() => load('et_incomes', []))
  const [fixedExpenses, setFixedExpenses] = useState(() => load('et_fixed_expenses', []))
  const [budgets, setBudgetsState] = useState(() => load('et_budgets', {}))
  const [settings, setSettingsState] = useState(() => {
    const stored = load('et_settings', {})
    return {
      currency: '€',
      defaultBudget: 800,
      activeMonth: currentMonthKey(),
      userName: '',
      userIcon: '😊',
      budgetAlertThreshold: 80,
      categoryBudgets: {},
      telegramBotToken: '',
      telegramChatId: '',
      ...stored,
      categoryBudgets: stored.categoryBudgets || {},
    }
  })
  const [activeMonth, setActiveMonthState] = useState(
    () => load('et_settings', {}).activeMonth || currentMonthKey()
  )
  const [notifications, setNotifications] = useState(() => {
    const stored = load('et_notifications', [])
    const thisMonth = currentMonthKey()
    return stored.filter((n) => n.monthKey === thisMonth)
  })

  // Keep a ref to categories for Telegram polling (avoids stale closure)
  const categoriesRef = useRef(categories)
  useEffect(() => { categoriesRef.current = categories }, [categories])

  // Show welcome modal on first use
  const [showWelcome, setShowWelcomeState] = useState(() => !load('et_onboarded', false))

  // Show new-month prompt when current month has no budget and user is already onboarded
  const [showNewMonthPrompt, setShowNewMonthPrompt] = useState(() => {
    const onboarded = load('et_onboarded', false)
    const bkts = load('et_budgets', {})
    return onboarded && !bkts[currentMonthKey()]
  })

  // Persist all state changes
  useEffect(() => { save('et_categories', categories) }, [categories])
  useEffect(() => { save('et_expenses', expenses) }, [expenses])
  useEffect(() => { save('et_incomes', incomes) }, [incomes])
  useEffect(() => { save('et_fixed_expenses', fixedExpenses) }, [fixedExpenses])
  useEffect(() => { save('et_budgets', budgets) }, [budgets])
  useEffect(() => { save('et_notifications', notifications) }, [notifications])
  useEffect(() => {
    save('et_settings', { ...settings, activeMonth })
  }, [settings, activeMonth])

  // Auto-apply fixed expenses on mount
  useEffect(() => {
    const today = new Date()
    const todayDay = today.getDate()
    const thisMonth = currentMonthKey()

    setFixedExpenses((prev) => {
      const newExpenses = []
      const updated = prev.map((fe) => {
        if (fe.active && fe.lastAppliedMonth !== thisMonth && todayDay >= fe.dayOfMonth) {
          const isoDate = `${thisMonth}-${String(fe.dayOfMonth).padStart(2, '0')}`
          newExpenses.push({
            id: uuid(),
            name: fe.name,
            amount: fe.amount,
            categoryId: fe.categoryId,
            date: isoDate,
            isFixed: true,
            fixedExpenseId: fe.id,
            notes: '',
          })
          return { ...fe, lastAppliedMonth: thisMonth }
        }
        return fe
      })
      if (newExpenses.length > 0) {
        setExpenses((prev) => [...prev, ...newExpenses])
      }
      return updated
    })
  }, [])

  // Generate in-app notifications for upcoming fixed expenses
  useEffect(() => {
    const today = new Date()
    const todayDay = today.getDate()
    const thisMonth = currentMonthKey()

    setNotifications((prev) => {
      const newNotifs = []
      for (const fe of fixedExpenses) {
        if (!fe.active || !fe.reminderDays || fe.reminderDays <= 0) continue
        if (fe.lastAppliedMonth === thisMonth) continue
        const daysUntil = fe.dayOfMonth - todayDay
        if (daysUntil < 0 || daysUntil > fe.reminderDays) continue
        const exists = prev.some((n) => n.fixedExpenseId === fe.id && n.monthKey === thisMonth)
        if (exists) continue
        newNotifs.push({
          id: uuid(),
          fixedExpenseId: fe.id,
          monthKey: thisMonth,
          name: fe.name,
          amount: fe.amount,
          daysUntil,
          dayOfMonth: fe.dayOfMonth,
          dismissed: false,
          createdAt: new Date().toISOString(),
        })
      }
      return newNotifs.length > 0 ? [...prev, ...newNotifs] : prev
    })
  }, [fixedExpenses])

  // Budget threshold alerts (total + per category)
  useEffect(() => {
    const thisMonth = currentMonthKey()
    const threshold = settings.budgetAlertThreshold || 80
    const totalBudget = budgets[thisMonth] || 0

    setNotifications((prev) => {
      const newNotifs = []
      const cats = categoriesRef.current || []

      // Total budget alert
      if (totalBudget > 0) {
        const totalSpent = expenses
          .filter((e) => e.date.startsWith(thisMonth))
          .reduce((sum, e) => sum + e.amount, 0)
        const pct = (totalSpent / totalBudget) * 100
        if (pct >= threshold) {
          const key = `budget-alert-${thisMonth}-${Math.floor(pct / threshold)}`
          if (!prev.some((n) => n.key === key)) {
            newNotifs.push({
              id: uuid(),
              key,
              type: 'budget_alert',
              monthKey: thisMonth,
              name: 'Συνολικός Προϋπολογισμός',
              pct: Math.round(pct),
              threshold,
              dismissed: false,
              createdAt: new Date().toISOString(),
            })
          }
        }
      }

      // Category budget alerts
      for (const [catId, catBudget] of Object.entries(settings.categoryBudgets || {})) {
        if (!catBudget || catBudget <= 0) continue
        const catSpent = expenses
          .filter((e) => e.date.startsWith(thisMonth) && e.categoryId === catId)
          .reduce((sum, e) => sum + e.amount, 0)
        const pct = (catSpent / catBudget) * 100
        if (pct >= threshold) {
          const key = `cat-alert-${catId}-${thisMonth}-${Math.floor(pct / threshold)}`
          if (!prev.some((n) => n.key === key)) {
            const cat = cats.find((c) => c.id === catId)
            newNotifs.push({
              id: uuid(),
              key,
              type: 'category_budget_alert',
              monthKey: thisMonth,
              name: cat?.name || 'Κατηγορία',
              pct: Math.round(pct),
              threshold,
              dismissed: false,
              createdAt: new Date().toISOString(),
            })
          }
        }
      }

      return newNotifs.length > 0 ? [...prev, ...newNotifs] : prev
    })
  }, [expenses, budgets, settings.budgetAlertThreshold, settings.categoryBudgets])

  // Telegram bot polling
  useEffect(() => {
    const { telegramBotToken, telegramChatId } = settings
    if (!telegramBotToken || !telegramChatId) return

    const poll = async () => {
      try {
        const offset = load('et_tg_offset', 0)
        const res = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/getUpdates?offset=${offset}&limit=10`
        )
        if (!res.ok) return
        const data = await res.json()
        if (!data.ok || !data.result.length) return

        let maxId = offset
        const cats = categoriesRef.current || []

        for (const update of data.result) {
          if (update.update_id >= maxId) maxId = update.update_id + 1
          const msg = update.message
          if (!msg?.text) continue
          if (String(msg.chat.id) !== String(telegramChatId)) continue

          const m = msg.text.trim().match(
            /^(?:πρόσθεσε|βάλε|add|έβαλα)\s+(\d+[.,]\d+|\d+)\s*(?:ευρώ|euro|€)?\s*(.*)$/i
          )
          if (!m) continue

          const amount = parseFloat(m[1].replace(',', '.'))
          const description = m[2].trim() || 'Telegram έξοδο'
          if (!amount || amount <= 0) continue

          const lowerDesc = description.toLowerCase()
          const matchedCat = cats.find((c) => lowerDesc.includes(c.name.toLowerCase()))
          const defaultCat = cats.find((c) => c.name === 'Άλλα') || cats[0]
          const catId = (matchedCat || defaultCat)?.id || ''

          const today = new Date().toISOString().slice(0, 10)
          setExpenses((prev) => [
            ...prev,
            { id: uuid(), name: description, amount, categoryId: catId, date: today, notes: 'Telegram', isFixed: false, fixedExpenseId: null },
          ])
        }

        if (maxId > offset) save('et_tg_offset', maxId)
      } catch {
        // Network/CORS errors - silently ignore
      }
    }

    poll()
    const interval = setInterval(poll, 60000)
    return () => clearInterval(interval)
  }, [settings.telegramBotToken, settings.telegramChatId])

  const completeWelcome = useCallback((budgetAmount, currency) => {
    const month = currentMonthKey()
    setBudgetsState((prev) => ({ ...prev, [month]: budgetAmount }))
    setSettingsState((prev) => ({ ...prev, currency, defaultBudget: budgetAmount }))
    save('et_onboarded', true)
    setShowWelcomeState(false)
    setShowNewMonthPrompt(false)
  }, [])

  const dismissNewMonthPrompt = useCallback(() => {
    setShowNewMonthPrompt(false)
  }, [])

  // Expenses CRUD
  const addExpense = useCallback((data) => {
    setExpenses((prev) => [...prev, { id: uuid(), isFixed: false, fixedExpenseId: null, notes: '', ...data }])
  }, [])

  const updateExpense = useCallback((id, data) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)))
  }, [])

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  // Categories CRUD
  const addCategory = useCallback((data) => {
    setCategories((prev) => [...prev, { id: uuid(), ...data }])
  }, [])

  const updateCategory = useCallback((id, data) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteCategory = useCallback((id, reassignId = null) => {
    if (reassignId) {
      setExpenses((prev) =>
        prev.map((e) => (e.categoryId === id ? { ...e, categoryId: reassignId } : e))
      )
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Fixed Expenses CRUD
  const addFixed = useCallback((data) => {
    setFixedExpenses((prev) => [...prev, { id: uuid(), active: true, lastAppliedMonth: null, ...data }])
  }, [])

  const updateFixed = useCallback((id, data) => {
    setFixedExpenses((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)))
  }, [])

  const deleteFixed = useCallback((id) => {
    setFixedExpenses((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const applyFixed = useCallback((id) => {
    setFixedExpenses((prev) => {
      const fe = prev.find((f) => f.id === id)
      if (!fe) return prev
      const thisMonth = currentMonthKey()
      const isoDate = `${thisMonth}-${String(fe.dayOfMonth).padStart(2, '0')}`
      setExpenses((ep) => [
        ...ep,
        {
          id: uuid(),
          name: fe.name,
          amount: fe.amount,
          categoryId: fe.categoryId,
          date: isoDate,
          isFixed: true,
          fixedExpenseId: fe.id,
          notes: '',
        },
      ])
      return prev.map((f) => (f.id === id ? { ...f, lastAppliedMonth: thisMonth } : f))
    })
  }, [])

  // Budget — also dismisses the new-month prompt when set
  const setBudget = useCallback((yearMonth, amount) => {
    setBudgetsState((prev) => ({ ...prev, [yearMonth]: amount }))
    if (yearMonth === currentMonthKey()) setShowNewMonthPrompt(false)
  }, [])

  // Settings
  const updateSettings = useCallback((data) => {
    setSettingsState((prev) => ({ ...prev, ...data }))
  }, [])

  // Income CRUD
  const addIncome = useCallback((data) => {
    setIncomes((prev) => [...prev, { id: uuid(), notes: '', ...data }])
  }, [])
  const updateIncome = useCallback((id, data) => {
    setIncomes((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
  }, [])
  const deleteIncome = useCallback((id) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id))
  }, [])

  // Category budget
  const updateCategoryBudget = useCallback((catId, amount) => {
    setSettingsState((prev) => ({
      ...prev,
      categoryBudgets: { ...prev.categoryBudgets, [catId]: amount },
    }))
  }, [])

  // Notifications
  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n)))
  }, [])

  // Full data reset
  const resetAllData = useCallback(() => {
    setExpenses([])
    setIncomes([])
    setCategories(DEFAULT_CATEGORIES)
    setFixedExpenses([])
    setBudgetsState({})
    setNotifications([])
    setSettingsState({ currency: '€', defaultBudget: 800, activeMonth: currentMonthKey(), budgetAlertThreshold: 80, categoryBudgets: {} })
    setActiveMonthState(currentMonthKey())
    save('et_onboarded', false)
    save('et_tg_offset', 0)
    setShowWelcomeState(true)
    setShowNewMonthPrompt(false)
  }, [])

  // Full data import (from JSON backup)
  const importData = useCallback((data) => {
    if (data.expenses) setExpenses(data.expenses)
    if (data.incomes) setIncomes(data.incomes)
    if (data.categories) setCategories(data.categories)
    if (data.fixedExpenses) setFixedExpenses(data.fixedExpenses)
    if (data.budgets) setBudgetsState(data.budgets)
    if (data.settings) setSettingsState(data.settings)
  }, [])

  const setActiveMonth = useCallback((month) => {
    setActiveMonthState(month)
  }, [])

  return (
    <AppContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        fixedExpenses,
        addFixed,
        updateFixed,
        deleteFixed,
        applyFixed,
        budgets,
        setBudget,
        settings,
        updateSettings,
        activeMonth,
        setActiveMonth,
        incomes,
        addIncome,
        updateIncome,
        deleteIncome,
        updateCategoryBudget,
        notifications,
        dismissNotification,
        showWelcome,
        completeWelcome,
        showNewMonthPrompt,
        dismissNewMonthPrompt,
        resetAllData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
