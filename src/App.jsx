import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { AddExpense } from './pages/AddExpense'
import { Expenses } from './pages/Expenses'
import { Categories } from './pages/Categories'
import { Budget } from './pages/Budget'
import { FixedExpenses } from './pages/FixedExpenses'
import { MonthlyReport } from './pages/MonthlyReport'
import { Settings } from './pages/Settings'
import { Notifications } from './pages/Notifications'
import { Income } from './pages/Income'
import { AuthPage } from './pages/AuthPage'
import { AdminPanel } from './pages/AdminPanel'

function ProtectedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="categories" element={<Categories />} />
          <Route path="budget" element={<Budget />} />
          <Route path="fixed" element={<FixedExpenses />} />
          <Route path="income" element={<Income />} />
          <Route path="report" element={<MonthlyReport />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedApp />
      </BrowserRouter>
    </AuthProvider>
  )
}
