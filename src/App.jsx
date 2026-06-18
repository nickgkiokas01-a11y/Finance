import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { WelcomeModal } from './components/onboarding/WelcomeModal'
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

export default function App() {
  return (
    <AppProvider>
      <WelcomeModal />
      <BrowserRouter>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
