import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { v4 as uuid } from '../lib/uuid'
import { currentMonthKey } from '../lib/dateUtils'

const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Φαγητό', color: '#f59e0b', icon: '🍔' },
  { id: 'transport', name: 'Μεταφορά', color: '#3b82f6', icon: '🚗' },
  { id: 'entertainment', name: 'Ψυχαγωγία', color: '#8b5cf6', icon: '🎬' },
  { id: 'health', name: 'Υγεία', color: '#10b981', icon: '💊' },
  { id: 'shopping', name: 'Αγορές', color: '#ec4899', icon: '🛍️' },
  { id: 'bills', name: 'Λογαριασμοί', color: '#64748b', icon: '📄' },
  { id: 'other', name: 'Άλλο', color: '#94a3b8', icon: '📦' },
]

const DEFAULT_SETTINGS = {
  currency: '€', defaultBudget: 800, activeMonth: currentMonthKey(),
  userName: '', userIcon: '😊', budgetAlertThreshold: 80, categoryBudgets: {},
  telegramBotToken: '', telegramChatId: '',
}

const toExpense = (r) => ({ id: r.id, name: r.name, amount: Number(r.amount), date: r.date, categoryId: r.category_id, notes: r.notes || '' })
const toCategory = (r) => ({ id: r.id, name: r.name, color: r.color, icon: r.icon })
const toFixed = (r) => ({ id: r.id, name: r.name, amount: Number(r.amount), dayOfMonth: r.day_of_month, active: r.active, reminderDays: r.reminder_days, lastAppliedMonth: r.last_applied_month, telegramReminder: r.telegram_reminder || false })
const toIncome = (r) => ({ id: r.id, name: r.name, amount: Number(r.amount), date: r.date, notes: r.notes || '' })
const toSettings = (r) => ({
  currency: r.currency || '€',
  defaultBudget: Number(r.default_budget) || 800,
  activeMonth: r.active_month || currentMonthKey(),
  userName: r.user_name || '',
  userIcon: r.user_icon || '😊',
  budgetAlertThreshold: r.budget_alert_threshold || 80,
  categoryBudgets: r.category_budgets || {},
  telegramBotToken: r.telegram_bot_token || '',
  telegramChatId: r.telegram_chat_id || '',
})

export function AppProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.id

  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [budgets, setBudgetsState] = useState({})
  const [fixedExpenses, setFixedExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS)
  const [notifications, setNotifications] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)

  const categoriesRef = useRef(categories)
  useEffect(() => { categoriesRef.current = categories }, [categories])

  const settingsRef = useRef(DEFAULT_SETTINGS)
  useEffect(() => { settingsRef.current = settings }, [settings])

  const expensesRef = useRef([])
  useEffect(() => { expensesRef.current = expenses }, [expenses])

  const budgetsRef = useRef({})
  useEffect(() => { budgetsRef.current = budgets }, [budgets])

  const activeMonthRef = useRef(currentMonthKey())
  useEffect(() => { activeMonthRef.current = settings.activeMonth }, [settings.activeMonth])

  useEffect(() => {
    if (!uid) return
    setDataLoaded(false)
    const load = async () => {
      const [expR, catR, budR, fixR, incR, setR] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', uid),
        supabase.from('categories').select('*').eq('user_id', uid),
        supabase.from('budgets').select('*').eq('user_id', uid),
        supabase.from('fixed_expenses').select('*').eq('user_id', uid),
        supabase.from('incomes').select('*').eq('user_id', uid),
        supabase.from('user_settings').select('*').eq('user_id', uid).single(),
      ])
      setExpenses((expR.data || []).map(toExpense))
      if (catR.data && catR.data.length > 0) {
        setCategories(catR.data.map(toCategory))
      } else {
        const rows = DEFAULT_CATEGORIES.map(c => ({ id: c.id, user_id: uid, name: c.name, color: c.color, icon: c.icon }))
        await supabase.from('categories').insert(rows)
        setCategories(DEFAULT_CATEGORIES)
      }
      const budMap = {}
      ;(budR.data || []).forEach(r => { budMap[r.year_month] = Number(r.amount) })
      setBudgetsState(budMap)
      setFixedExpenses((fixR.data || []).map(toFixed))
      setIncomes((incR.data || []).map(toIncome))
      if (setR.data) {
        setSettingsState(toSettings(setR.data))
      } else {
        await supabase.from('user_settings').insert({ user_id: uid })
      }
      setDataLoaded(true)
    }
    load()
  }, [uid])

  const updateSettings = useCallback(async (patch) => {
    const next = { ...settingsRef.current, ...patch }
    setSettingsState(next)
    if (uid) {
      await supabase.from('user_settings').upsert({
        user_id: uid, currency: next.currency, default_budget: next.defaultBudget,
        active_month: next.activeMonth, user_name: next.userName, user_icon: next.userIcon,
        budget_alert_threshold: next.budgetAlertThreshold, category_budgets: next.categoryBudgets,
        telegram_bot_token: next.telegramBotToken, telegram_chat_id: next.telegramChatId,
      }, { onConflict: 'user_id' })
    }
  }, [uid])

  const setActiveMonth = useCallback((m) => updateSettings({ activeMonth: m }), [updateSettings])
  const activeMonth = settings.activeMonth

  const addExpense = useCallback(async (data) => {
    const exp = { id: uuid(), ...data }
    setExpenses(prev => [exp, ...prev])
    await supabase.from('expenses').insert({ id: exp.id, user_id: uid, name: exp.name, amount: exp.amount, date: exp.date, category_id: exp.categoryId, notes: exp.notes })
  }, [uid])

  const updateExpense = useCallback(async (id, data) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
    await supabase.from('expenses').update({ name: data.name, amount: data.amount, date: data.date, category_id: data.categoryId, notes: data.notes }).eq('id', id)
  }, [])

  const deleteExpense = useCallback(async (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    await supabase.from('expenses').delete().eq('id', id)
  }, [])

  const addCategory = useCallback(async (data) => {
    const cat = { id: uuid(), ...data }
    setCategories(prev => [...prev, cat])
    await supabase.from('categories').insert({ id: cat.id, user_id: uid, name: cat.name, color: cat.color, icon: cat.icon })
  }, [uid])

  const updateCategory = useCallback(async (id, data) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
    await supabase.from('categories').update({ name: data.name, color: data.color, icon: data.icon }).eq('id', id).eq('user_id', uid)
  }, [uid])

  const deleteCategory = useCallback(async (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    await supabase.from('categories').delete().eq('id', id).eq('user_id', uid)
  }, [uid])

  const setBudget = useCallback(async (yearMonth, amount) => {
    setBudgetsState(prev => ({ ...prev, [yearMonth]: amount }))
    await supabase.from('budgets').upsert({ user_id: uid, year_month: yearMonth, amount })
  }, [uid])

  const addFixedExpense = useCallback(async (data) => {
    const fe = { id: uuid(), ...data }
    setFixedExpenses(prev => [...prev, fe])
    await supabase.from('fixed_expenses').insert({ id: fe.id, user_id: uid, name: fe.name, amount: fe.amount, day_of_month: fe.dayOfMonth, active: fe.active, reminder_days: fe.reminderDays, last_applied_month: fe.lastAppliedMonth, telegram_reminder: fe.telegramReminder })
  }, [uid])

  const updateFixedExpense = useCallback(async (id, data) => {
    setFixedExpenses(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))
    await supabase.from('fixed_expenses').update({ name: data.name, amount: data.amount, day_of_month: data.dayOfMonth, active: data.active, reminder_days: data.reminderDays, last_applied_month: data.lastAppliedMonth, telegram_reminder: data.telegramReminder }).eq('id', id)
  }, [])

  const deleteFixedExpense = useCallback(async (id) => {
    setFixedExpenses(prev => prev.filter(f => f.id !== id))
    await supabase.from('fixed_expenses').delete().eq('id', id)
  }, [])

  const applyFixedExpense = useCallback(async (fe) => {
    const exp = { id: uuid(), name: fe.name, amount: fe.amount, date: new Date().toISOString().slice(0, 10), categoryId: fe.categoryId || 'bills', notes: 'Αυτόματο σταθερό έξοδο' }
    setExpenses(prev => [exp, ...prev])
    await supabase.from('expenses').insert({ id: exp.id, user_id: uid, name: exp.name, amount: exp.amount, date: exp.date, category_id: exp.categoryId, notes: exp.notes })
    const thisMonth = currentMonthKey()
    setFixedExpenses(prev => prev.map(f => f.id === fe.id ? { ...f, lastAppliedMonth: thisMonth } : f))
    await supabase.from('fixed_expenses').update({ last_applied_month: thisMonth }).eq('id', fe.id)
  }, [uid])

  const addIncome = useCallback(async (data) => {
    const inc = { id: uuid(), ...data }
    setIncomes(prev => [inc, ...prev])
    await supabase.from('incomes').insert({ id: inc.id, user_id: uid, name: inc.name, amount: inc.amount, date: inc.date, notes: inc.notes })
  }, [uid])

  const updateIncome = useCallback(async (id, data) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
    await supabase.from('incomes').update({ name: data.name, amount: data.amount, date: data.date, notes: data.notes }).eq('id', id)
  }, [])

  const deleteIncome = useCallback(async (id) => {
    setIncomes(prev => prev.filter(i => i.id !== id))
    await supabase.from('incomes').delete().eq('id', id)
  }, [])

  const updateCategoryBudget = useCallback((catId, amount) => {
    updateSettings({ categoryBudgets: { ...settings.categoryBudgets, [catId]: amount } })
  }, [settings.categoryBudgets, updateSettings])

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n))
  }, [])

  useEffect(() => {
    if (!dataLoaded) return
    const today = new Date(); const todayDay = today.getDate(); const thisMonth = currentMonthKey()
    setNotifications(prev => {
      const newNotifs = []
      for (const fe of fixedExpenses) {
        if (!fe.active || !fe.reminderDays || fe.reminderDays <= 0) continue
        if (fe.lastAppliedMonth === thisMonth) continue
        const daysUntil = fe.dayOfMonth - todayDay
        if (daysUntil < 0 || daysUntil > fe.reminderDays) continue
        const exists = prev.some(n => n.fixedExpenseId === fe.id && n.monthKey === thisMonth)
        if (exists) continue
        newNotifs.push({ id: uuid(), fixedExpenseId: fe.id, monthKey: thisMonth, name: fe.name, amount: fe.amount, daysUntil, dayOfMonth: fe.dayOfMonth, dismissed: false, createdAt: new Date().toISOString() })
      }
      return newNotifs.length > 0 ? [...prev, ...newNotifs] : prev
    })
  }, [fixedExpenses, dataLoaded])

  useEffect(() => {
    if (!dataLoaded) return
    const thisMonth = currentMonthKey()
    const threshold = settings.budgetAlertThreshold || 80
    const totalBudget = budgets[thisMonth] || 0
    setNotifications(prev => {
      const newNotifs = []
      const cats = categoriesRef.current || []
      if (totalBudget > 0) {
        const totalSpent = expenses.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0)
        const pct = (totalSpent / totalBudget) * 100
        if (pct >= threshold) {
          const key = `budget-alert-${thisMonth}-${Math.floor(pct / threshold)}`
          if (!prev.some(n => n.key === key)) {
            newNotifs.push({ id: uuid(), key, type: 'budget_alert', monthKey: thisMonth, name: 'Συνολικός Προϋπολογισμός', pct: Math.round(pct), threshold, dismissed: false, createdAt: new Date().toISOString() })
          }
        }
      }
      for (const [catId, catBudget] of Object.entries(settings.categoryBudgets || {})) {
        if (!catBudget || catBudget <= 0) continue
        const catSpent = expenses.filter(e => e.date.startsWith(thisMonth) && e.categoryId === catId).reduce((s, e) => s + e.amount, 0)
        const pct = (catSpent / catBudget) * 100
        if (pct >= threshold) {
          const key = `cat-alert-${catId}-${thisMonth}-${Math.floor(pct / threshold)}`
          if (!prev.some(n => n.key === key)) {
            const cat = cats.find(c => c.id === catId)
            newNotifs.push({ id: uuid(), key, type: 'category_budget_alert', monthKey: thisMonth, name: cat?.name || 'Κατηγορία', pct: Math.round(pct), threshold, dismissed: false, createdAt: new Date().toISOString() })
          }
        }
      }
      return newNotifs.length > 0 ? [...prev, ...newNotifs] : prev
    })
  }, [expenses, budgets, settings.budgetAlertThreshold, settings.categoryBudgets, dataLoaded])

  useEffect(() => {
    if (!dataLoaded || !settings.telegramBotToken || !settings.telegramChatId) return
    const thisMonth = currentMonthKey()
    const storageKey = `tg_sent_${thisMonth}`
    const sent = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'))
    let changed = false
    for (const n of notifications) {
      if (!n.fixedExpenseId || n.dismissed) continue
      const key = `${n.fixedExpenseId}`
      if (sent.has(key)) continue
      const fe = fixedExpenses.find(f => f.id === n.fixedExpenseId)
      if (!fe?.telegramReminder) continue
      sent.add(key)
      changed = true
      const daysText = n.daysUntil === 0 ? 'σήμερα' : n.daysUntil === 1 ? 'αύριο' : `σε ${n.daysUntil} μέρες`
      const text = `⏰ Υπενθύμιση πληρωμής\n\n📌 ${n.name}\n💰 ${settings.currency}${n.amount}\n📅 Πληρωτέο ${daysText} (ημέρα ${n.dayOfMonth})`
      fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: settings.telegramChatId, text }),
      }).catch(() => {})
    }
    if (changed) localStorage.setItem(storageKey, JSON.stringify([...sent]))
  }, [notifications, fixedExpenses, settings.telegramBotToken, settings.telegramChatId, settings.currency, dataLoaded])

  const tgOffsetRef = useRef(0)
  const pendingExpenseRef = useRef(null)
  useEffect(() => {
    if (!settings.telegramBotToken || !settings.telegramChatId) return
    const token = settings.telegramBotToken; const chatId = settings.telegramChatId

    // Register bot commands menu
    fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands: [
        { command: 'help', description: 'Όλες οι εντολές' },
        { command: 'kategoreis', description: 'Λίστα κατηγοριών' },
        { command: 'ypoloipo', description: 'Υπόλοιπο budget μήνα' },
      ]}),
    }).catch(() => {})

    const tgSend = (text, extra = {}) => fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, ...extra }),
    }).catch(() => {})

    const poll = async () => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${tgOffsetRef.current}&timeout=5`)
        const data = await res.json()
        if (!data.ok) return

        for (const update of data.result || []) {
          tgOffsetRef.current = update.update_id + 1
          const cats = categoriesRef.current
          const today = new Date().toISOString().slice(0, 10)

          // Handle inline keyboard button taps
          const cq = update.callback_query
          if (cq) {
            if (String(cq.from?.id || cq.message?.chat?.id || '') === chatId && cq.data?.startsWith('cat_')) {
              const catId = cq.data.replace('cat_', '')
              const cat = cats.find(c => c.id === catId)
              const pending = pendingExpenseRef.current
              if (pending && cat) {
                await addExpense({ name: pending.name, amount: pending.amount, date: today, categoryId: cat.id, notes: 'Από Telegram' })
                await tgSend(`✅ Καταχωρήθηκε!\n📌 ${pending.name}\n💰 €${pending.amount.toFixed(2)}\n📂 ${cat.icon || ''} ${cat.name}`)
                pendingExpenseRef.current = null
              }
              fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: cq.id }),
              }).catch(() => {})
            }
            continue
          }

          const text = update.message?.text?.trim() || ''
          const fromId = String(update.message?.chat?.id || '')
          if (fromId !== chatId) continue

          // /start
          if (/^\/start/i.test(text)) {
            await tgSend(`👋 Καλώς ήρθες στο Monflow Bot!\n\nΕντολές:\n/help — όλες οι εντολές\n/kategoreis — κατηγορίες\n/ypoloipo — υπόλοιπο budget\n\nΠρόσθεσε έξοδο:\nπρόσθεσε 5 καφές\nπρόσθεσε 30 βενζίνη μεταφορά`)
            continue
          }

          // /help
          if (/^\/help/i.test(text)) {
            await tgSend(`📋 Εντολές Monflow Bot:\n\n/start — Καλωσόρισμα\n/kategoreis — Λίστα κατηγοριών\n/ypoloipo — Υπόλοιπο budget μήνα\n\n➕ Προσθήκη εξόδου:\nπρόσθεσε [ποσό] [περιγραφή]\nπρόσθεσε [ποσό] [περιγραφή] [κατηγορία]\n\nΠαραδείγματα:\nπρόσθεσε 2.5 καφές\nπρόσθεσε 50 βενζίνη μεταφορά\nπρόσθεσε 30 φαρμακείο υγεία`)
            continue
          }

          // /kategoreis ή /κατηγορίες
          if (/^\/(kategoreis|κατηγορίες|categories)/i.test(text)) {
            const list = cats.map(c => `${c.icon || '📦'} ${c.name}`).join('\n')
            await tgSend(`📂 Κατηγορίες:\n${list}\n\nΧρήση: πρόσθεσε 5 καφές φαγητό`)
            continue
          }

          // /ypoloipo ή /υπολοιπο
          if (/^\/(ypoloipo|υπολοιπο)/i.test(text)) {
            const month = activeMonthRef.current
            const budget = budgetsRef.current[month] || 0
            const spent = expensesRef.current.filter(e => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0)
            const remaining = budget - spent
            const cur = settingsRef.current.currency
            if (budget === 0) {
              await tgSend(`📊 Δεν έχεις ορίσει budget για τον μήνα.`)
            } else {
              const pct = Math.round((spent / budget) * 100)
              await tgSend(`📊 Budget ${month}:\n💰 Σύνολο: ${cur}${budget.toFixed(2)}\n💸 Δαπανήθηκαν: ${cur}${spent.toFixed(2)} (${pct}%)\n✅ Υπόλοιπο: ${cur}${remaining.toFixed(2)}`)
            }
            continue
          }

          // πρόσθεσε [ποσό] [περιγραφή] [κατηγορία (προαιρετική)]
          const m = text.match(/πρόσθεσε\s+([\d.,]+)\s*€?\s*(?:ευρ[ωώ])?\s+(.+)/i)
          if (m) {
            const amount = parseFloat(m[1].replace(',', '.'))
            const rest = m[2].trim()
            if (isNaN(amount) || amount <= 0) continue

            let matchedCat = null
            let expenseName = rest

            for (const cat of cats) {
              if (rest.toLowerCase().endsWith(cat.name.toLowerCase())) {
                matchedCat = cat
                expenseName = rest.slice(0, rest.length - cat.name.length).trim() || rest
                break
              }
            }

            if (matchedCat) {
              await addExpense({ name: expenseName, amount, date: today, categoryId: matchedCat.id, notes: 'Από Telegram' })
              await tgSend(`✅ Καταχωρήθηκε!\n📌 ${expenseName}\n💰 €${amount.toFixed(2)}\n📂 ${matchedCat.icon || ''} ${matchedCat.name}`)
            } else {
              pendingExpenseRef.current = { name: expenseName, amount }
              const keyboard = []
              for (let i = 0; i < cats.length; i += 2) {
                const row = [{ text: `${cats[i].icon || '📦'} ${cats[i].name}`, callback_data: `cat_${cats[i].id}` }]
                if (cats[i + 1]) row.push({ text: `${cats[i + 1].icon || '📦'} ${cats[i + 1].name}`, callback_data: `cat_${cats[i + 1].id}` })
                keyboard.push(row)
              }
              await tgSend(`📌 ${expenseName} — €${amount.toFixed(2)}\nΕπίλεξε κατηγορία:`, {
                reply_markup: { inline_keyboard: keyboard }
              })
            }
          }
        }
      } catch { /* ignore */ }
    }
    const iv = setInterval(poll, 5000)
    poll()
    return () => clearInterval(iv)
  }, [settings.telegramBotToken, settings.telegramChatId, addExpense])

  const resetAllData = useCallback(async () => {
    if (!uid) return
    await Promise.all([
      supabase.from('expenses').delete().eq('user_id', uid),
      supabase.from('incomes').delete().eq('user_id', uid),
      supabase.from('budgets').delete().eq('user_id', uid),
      supabase.from('fixed_expenses').delete().eq('user_id', uid),
      supabase.from('user_settings').delete().eq('user_id', uid),
    ])
    setExpenses([]); setIncomes([]); setBudgetsState({}); setFixedExpenses([])
    setSettingsState(DEFAULT_SETTINGS); setNotifications([])
  }, [uid])

  const exportData = useCallback(() => JSON.stringify({ expenses, categories, budgets, fixedExpenses, incomes, settings }, null, 2), [expenses, categories, budgets, fixedExpenses, incomes, settings])

  const importData = useCallback(async (json) => {
    try {
      const d = JSON.parse(json)
      if (d.expenses) {
        setExpenses(d.expenses)
        await supabase.from('expenses').delete().eq('user_id', uid)
        await supabase.from('expenses').insert(d.expenses.map(e => ({ id: e.id, user_id: uid, name: e.name, amount: e.amount, date: e.date, category_id: e.categoryId, notes: e.notes })))
      }
      if (d.incomes) {
        setIncomes(d.incomes)
        await supabase.from('incomes').delete().eq('user_id', uid)
        await supabase.from('incomes').insert(d.incomes.map(i => ({ id: i.id, user_id: uid, name: i.name, amount: i.amount, date: i.date, notes: i.notes })))
      }
    } catch { /* ignore */ }
  }, [uid])

  return (
    <AppContext.Provider value={{
      expenses, categories, budgets, fixedExpenses, incomes, settings, notifications, activeMonth, dataLoaded,
      addExpense, updateExpense, deleteExpense,
      addCategory, updateCategory, deleteCategory,
      setBudget,
      addFixedExpense, updateFixedExpense, deleteFixedExpense, applyFixedExpense,
      addIncome, updateIncome, deleteIncome,
      updateSettings, setActiveMonth,
      updateCategoryBudget,
      dismissNotification,
      resetAllData, exportData, importData,
    }}>
      {children}
    </AppContext.Provider>
  )
}
