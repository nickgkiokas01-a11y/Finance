import { useState, useRef, useEffect } from 'react'
import { Settings2, Download, Upload, Trash2, Check, UserCircle, Send } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const CURRENCIES = [
  { value: '€', label: 'Euro (€)' },
  { value: '$', label: 'Dollar ($)' },
  { value: '£', label: 'Pound (£)' },
  { value: '₺', label: 'Lira (₺)' },
  { value: 'kr', label: 'Krone (kr)' },
]

const EMOJI_OPTIONS = ['😊','😎','🦁','🐻','🦊','🐺','🦋','🚀','⚡','🌟','🎯','🔥','💡','🧠','👤','🎭']

export function Settings() {
  const {
    expenses, categories, fixedExpenses, budgets, settings, dataLoaded,
    updateSettings, importData, resetAllData,
  } = useApp()

  const [userName, setUserName] = useState(settings.userName || '')
  const [userIcon, setUserIcon] = useState(settings.userIcon || '😊')
  const [savedProfile, setSavedProfile] = useState(false)

  const [currency, setCurrency] = useState(settings.currency || '€')
  const [defaultBudget, setDefaultBudget] = useState((settings.defaultBudget || 800).toString())
  const [savedSettings, setSavedSettings] = useState(false)

  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || '')
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '')
  const [savedTelegram, setSavedTelegram] = useState(false)
  const [telegramStatus, setTelegramStatus] = useState(null)

  useEffect(() => {
    if (!dataLoaded) return
    setUserName(settings.userName || '')
    setUserIcon(settings.userIcon || '😊')
    setCurrency(settings.currency || '€')
    setDefaultBudget((settings.defaultBudget || 800).toString())
    setTelegramBotToken(settings.telegramBotToken || '')
    setTelegramChatId(settings.telegramChatId || '')
  }, [dataLoaded])

  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const fileRef = useRef(null)

  const handleSaveProfile = () => {
    updateSettings({ userName: userName.trim(), userIcon })
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 2000)
  }

  const handleSaveSettings = () => {
    const val = parseFloat(defaultBudget)
    if (isNaN(val) || val <= 0) return
    updateSettings({ currency, defaultBudget: val })
    setSavedSettings(true)
    setTimeout(() => setSavedSettings(false), 2000)
  }

  const handleExport = () => {
    const data = JSON.stringify(
      { expenses, categories, fixedExpenses, budgets, settings },
      null,
      2
    )
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `εξοδομετρης-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.expenses && !data.categories) {
          setImportError('Μη έγκυρο αρχείο backup')
          return
        }
        importData(data)
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 3000)
      } catch {
        setImportError('Σφάλμα ανάγνωσης αρχείου JSON')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSaveTelegram = () => {
    updateSettings({ telegramBotToken: telegramBotToken.trim(), telegramChatId: telegramChatId.trim() })
    setSavedTelegram(true)
    setTimeout(() => setSavedTelegram(false), 2000)
  }

  const handleTestTelegram = async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`)
      const data = await res.json()
      if (data.ok) {
        setTelegramStatus({ ok: true, message: `Συνδέθηκε! Bot: @${data.result.username}` })
      } else {
        setTelegramStatus({ ok: false, message: 'Λάθος token — έλεγξε το BotFather.' })
      }
    } catch {
      setTelegramStatus({ ok: false, message: 'Σφάλμα σύνδεσης. Δοκίμασε να αποθηκεύσεις και να ανανεώσεις.' })
    }
    setTimeout(() => setTelegramStatus(null), 6000)
  }

  const handleReset = () => {
    if (confirm('Θέλετε σίγουρα να διαγράψετε ΟΛΕΣ τις εγγραφές; Αυτή η ενέργεια δεν αναιρείται.')) {
      resetAllData()
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings2 size={20} className="text-indigo-600" />
        <h1 className="text-xl font-bold text-slate-800">Ρυθμίσεις</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle size={15} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Προφίλ</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-2xl border-2 border-indigo-200 shrink-0">
              {userIcon}
            </div>
            <div className="flex-1">
              <Input
                label="Όνομα"
                placeholder="π.χ. Νίκος"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Εικονίδιο</label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setUserIcon(emoji)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
                    userIcon === emoji
                      ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            className={savedProfile ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {savedProfile ? <><Check size={14} /> Αποθηκεύτηκε</> : 'Αποθήκευση Προφίλ'}
          </Button>
        </CardBody>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Γενικές Ρυθμίσεις</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Νόμισμα</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Default budget νέου μήνα"
            type="number"
            min="1"
            step="10"
            value={defaultBudget}
            onChange={(e) => setDefaultBudget(e.target.value)}
          />
          <Button
            onClick={handleSaveSettings}
            className={savedSettings ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {savedSettings ? <><Check size={14} /> Αποθηκεύτηκε</> : 'Αποθήκευση'}
          </Button>
        </CardBody>
      </Card>

      {/* Telegram Bot */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send size={15} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-700">Telegram Bot</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 leading-relaxed space-y-1">
            <p><strong>Πώς να ρυθμίσεις:</strong></p>
            <p>1. Άνοιξε το Telegram και γράψε στον <strong>@BotFather</strong> → <code>/newbot</code></p>
            <p>2. Αντέγραψε το Bot Token που σου έδωσε</p>
            <p>3. Γράψε στον <strong>@userinfobot</strong> για να βρεις το Chat ID σου</p>
            <p className="pt-1 text-indigo-600">Στη συνέχεια: <em>"Πρόσθεσε 2.5 καφέ"</em> ή <em>"Βάλε 15 φαγητό"</em></p>
          </div>
          <Input
            label="Bot Token"
            type="password"
            placeholder="123456789:ABCdef..."
            value={telegramBotToken}
            onChange={(e) => setTelegramBotToken(e.target.value)}
          />
          <Input
            label="Chat ID (αριθμητικό)"
            placeholder="123456789"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
          />
          {telegramStatus && (
            <p className={`text-xs font-medium ${telegramStatus.ok ? 'text-green-600' : 'text-red-500'}`}>
              {telegramStatus.message}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSaveTelegram} className={savedTelegram ? 'bg-green-600 hover:bg-green-700' : ''}>
              {savedTelegram ? <><Check size={14} /> Αποθηκεύτηκε</> : 'Αποθήκευση'}
            </Button>
            {telegramBotToken && (
              <Button variant="secondary" onClick={handleTestTelegram}>
                Δοκιμή σύνδεσης
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">Διαχείριση Δεδομένων</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Εξαγωγή</strong> — Κατεβάστε όλα τα δεδομένα σε αρχείο JSON (backup)
            </p>
            <Button variant="secondary" onClick={handleExport}>
              <Download size={14} /> Εξαγωγή JSON
            </Button>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Εισαγωγή</strong> — Επαναφορά δεδομένων από αρχείο backup
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileRef}
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> Εισαγωγή JSON
            </Button>
            {importError && <p className="text-xs text-red-500 mt-2">{importError}</p>}
            {importSuccess && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Check size={12} /> Τα δεδομένα εισήχθησαν επιτυχώς
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader className="border-red-100">
          <h2 className="text-sm font-semibold text-red-600">Επικίνδυνη Ζώνη</h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-600 mb-3">
            Διαγραφή όλων των εξόδων, κατηγοριών, budgets και ρυθμίσεων. Η ενέργεια δεν αναιρείται.
          </p>
          <Button variant="danger" onClick={handleReset}>
            <Trash2 size={14} /> Επαναφορά εφαρμογής
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
