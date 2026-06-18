import { useState } from 'react'
import { Wallet, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else {
        const { error } = await signUp(email, password)
        if (error) setError(error.message)
        else setSuccessMsg('Ο λογαριασμός δημιουργήθηκε! Μπορείς τώρα να συνδεθείς.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">ΕξοδοΜέτρης</h1>
          <p className="text-sm text-slate-500 mt-1">Παρακολούθηση εξόδων</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/80 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            {isLogin ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Κωδικός</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <p className="text-xs text-green-700">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md shadow-indigo-500/30 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Παρακαλώ περίμενε...' : isLogin ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            {isLogin ? 'Δεν έχεις λογαριασμό;' : 'Έχεις ήδη λογαριασμό;'}
            {' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg('') }}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? 'Εγγραφή' : 'Σύνδεση'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
