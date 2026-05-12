import { useCallback, useEffect, useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { BadgeDollarSign, BarChart3, CreditCard, LayoutDashboard, Settings, Tag, UserRound, WalletCards } from 'lucide-react'
import { createApiClient } from './lib/apiClient'
import { buildDemoOverview, demoData, demoUser } from './lib/demoData'
import { defaultRange, getId, nextDemoId, queryString } from './lib/dashboardHelpers.js'
import { resourceConfig } from './lib/resourceConfig.js'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import AuthStrip from './components/AuthStrip.jsx'
import EditModal from './components/EditModal.jsx'
import DashboardPage from './components/pages/DashboardPage.jsx'
import ResourcePage from './components/pages/ResourcePage.jsx'
import BudgetsPage from './components/pages/BudgetsPage.jsx'
import CategoriesPage from './components/pages/CategoriesPage.jsx'
import AnalyticsPage from './components/pages/AnalyticsPage.jsx'
import ProfilePage from './components/pages/ProfilePage.jsx'
import SettingsPage from './components/pages/SettingsPage.jsx'

const storageKeys = {
  token: 'finance-dashboard-token',
  user: 'finance-dashboard-user',
  theme: 'finance-dashboard-theme',
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'incomes', label: 'Ingresos', icon: BadgeDollarSign },
  { id: 'expenses', label: 'Egresos', icon: CreditCard },
  { id: 'budgets', label: 'Presupuestos', icon: WalletCards },
  { id: 'categories', label: 'Categorías', icon: Tag },
  { id: 'analytics', label: 'Analítica', icon: BarChart3 },
  { id: 'profile', label: 'Perfil', icon: UserRound },
  { id: 'settings', label: 'Ajustes', icon: Settings },
]

function initialAuth() {
  const token = localStorage.getItem(storageKeys.token)
  const rawUser = localStorage.getItem(storageKeys.user)
  return {
    token,
    user: rawUser ? JSON.parse(rawUser) : null,
  }
}

function App() {
  const [auth, setAuth] = useState(initialAuth)
  const [activePage, setActivePage] = useState('dashboard')
  const [range, setRange] = useState(defaultRange)
  const [theme, setTheme] = useState(localStorage.getItem(storageKeys.theme) || 'aurora')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(Boolean(auth.token))
  const [modal, setModal] = useState(null)
  const [data, setData] = useState(() => ({ ...demoData }))
  const [overview, setOverview] = useState(() => buildDemoOverview(demoData, range, demoUser))
  const [alerts, setAlerts] = useState({ alerts: [] })

  const api = useMemo(() => createApiClient({
    token: auth.token,
    onUnauthorized: () => {
      localStorage.removeItem(storageKeys.token)
      localStorage.removeItem(storageKeys.user)
      setAuth({ token: null, user: null })
      toast.error('Tu sesión expiró')
    },
  }), [auth.token])

  const user = auth.user || demoUser
  const isDemo = !auth.token || !apiOnline

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(storageKeys.theme, theme)
  }, [theme])

  const applyDemo = useCallback(() => {
    setData({ ...demoData })
    setOverview(buildDemoOverview(demoData, range, user))
    setAlerts({ alerts: [] })
    setApiOnline(false)
  }, [range, user])

  const loadData = useCallback(async () => {
    if (!auth.token || !auth.user) {
      applyDemo()
      setLoading(false)
      return
    }

    setLoading(true)
    const rangeQuery = queryString(range)

    try {
      const [
        incomes,
        expenses,
        budgets,
        categoryBudgets,
        categories,
        overviewPayload,
        alertsPayload,
      ] = await Promise.all([
        api.listIncomes(rangeQuery),
        api.listExpenses(rangeQuery),
        api.listBudgets(),
        api.listCategoryBudgets(),
        api.listCategories(),
        api.overview(rangeQuery),
        api.alerts(rangeQuery),
      ])

      setData({ incomes, expenses, budgets, categoryBudgets, categories })
      setOverview(overviewPayload)
      setAlerts(alertsPayload)
      setApiOnline(true)
    } catch (error) {
      applyDemo()
      toast.error(`Usando datos demo: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [api, applyDemo, auth.token, auth.user, range])

  useEffect(() => {
    const task = window.setTimeout(() => {
      loadData()
    }, 0)
    return () => window.clearTimeout(task)
  }, [loadData])

  const saveAuth = (payload) => {
    localStorage.setItem(storageKeys.token, payload.token)
    localStorage.setItem(storageKeys.user, JSON.stringify(payload.user))
    setAuth({ token: payload.token, user: payload.user })
    setApiOnline(true)
  }

  const logout = () => {
    localStorage.removeItem(storageKeys.token)
    localStorage.removeItem(storageKeys.user)
    setAuth({ token: null, user: null })
    setApiOnline(false)
    toast.success('Sesión cerrada')
  }

  const submitAuth = async (mode, formData) => {
    try {
      const payload = mode === 'register'
        ? await api.register(formData)
        : await api.login({ email: formData.email, password: formData.password })
      saveAuth(payload)
      toast.success(mode === 'register' ? 'Cuenta creada' : 'Bienvenido de vuelta')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const mutateCollection = async (resource, action, payload, id) => {
    const config = resourceConfig[resource]

    if (isDemo) {
      setData((current) => {
        const items = current[config.key]
        const nextItem = { ...payload, _id: id || nextDemoId(config.prefix) }
        const nextItems = action === 'create'
          ? [nextItem, ...items]
          : items.map((item) => String(getId(item)) === String(id) ? { ...item, ...payload } : item)
        const nextData = { ...current, [config.key]: nextItems }
        setOverview(buildDemoOverview(nextData, range, user))
        return nextData
      })
      toast.success(action === 'create' ? 'Dato demo agregado' : 'Dato demo actualizado')
      return
    }

    try {
      if (action === 'create') {
        await api[config.create](payload)
      } else {
        await api[config.update](id, payload)
      }
      toast.success(action === 'create' ? 'Registro creado' : 'Registro actualizado')
      setModal(null)
      await loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteItem = async (resource, item) => {
    const config = resourceConfig[resource]
    const id = getId(item)

    if (!id || !window.confirm('¿Eliminar este registro?')) return

    if (isDemo) {
      setData((current) => {
        const nextData = {
          ...current,
          [config.key]: current[config.key].filter((entry) => String(getId(entry)) !== String(id)),
        }
        setOverview(buildDemoOverview(nextData, range, user))
        return nextData
      })
      toast.success('Registro demo eliminado')
      return
    }

    try {
      await api[config.delete](id)
      toast.success('Registro eliminado')
      await loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openModal = (resource, item = null) => {
    setModal({ resource, item })
  }

  const content = {
    dashboard: <DashboardPage data={data} overview={overview} alerts={alerts} loading={loading} currency={overview.currency} />,
    incomes: <ResourcePage resource="income" items={data.incomes} currency={overview.currency} onCreate={openModal} onEdit={openModal} onDelete={deleteItem} />,
    expenses: <ResourcePage resource="expense" items={data.expenses} currency={overview.currency} onCreate={openModal} onEdit={openModal} onDelete={deleteItem} />,
    budgets: <BudgetsPage data={data} currency={overview.currency} onCreate={openModal} onEdit={openModal} onDelete={deleteItem} />,
    categories: <CategoriesPage data={data} onCreate={openModal} onDelete={deleteItem} />,
    analytics: <AnalyticsPage data={data} overview={overview} alerts={alerts} currency={overview.currency} />,
    profile: <ProfilePage key={user.email} user={user} auth={auth} api={api} isDemo={isDemo} setAuth={setAuth} logout={logout} />,
    settings: <SettingsPage theme={theme} setTheme={setTheme} isDemo={isDemo} apiOnline={apiOnline} />,
  }[activePage]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Toaster position="top-right" toastOptions={{ className: 'toast-shell' }} />
      <div className="flex min-h-screen">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          user={user}
          navItems={navItems}
          isDemo={isDemo}
          logout={logout}
        />

        <main className="min-w-0 flex-1">
          <Topbar
            activePage={activePage}
            range={range}
            setRange={setRange}
            setSidebarOpen={setSidebarOpen}
            refresh={loadData}
            isDemo={isDemo}
            loading={loading}
            navItems={navItems}
          />

          {!auth.token && <AuthStrip onSubmit={submitAuth} />}

          <section className="mx-auto w-full max-w-[1360px] px-3 pb-6 pt-3 sm:px-4 lg:px-6">
            {content}
          </section>
        </main>
      </div>

      {modal && (
        <EditModal
          modal={modal}
          data={data}
          currency={overview.currency}
          onClose={() => setModal(null)}
          onSubmit={mutateCollection}
        />
      )}
    </div>
  )
}

export default App
