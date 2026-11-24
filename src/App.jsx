import { useCallback, useEffect, useState } from 'react'
import './App.css'

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getDashboard,
  updateTransaction,
} from './services/transactionService'
import {
  getCurrentUser,
  login,
  logout,
  register,
} from './services/authService'
import Dashboard from './components/Dashboard'
import Formulario from './components/Formulario'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Tabela from './components/Tabela'
import FeedbackToast from './components/FeedbackToast'

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [booting, setBooting] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [transactionPage, setTransactionPage] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 })
  const [dashboard, setDashboard] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const closeFeedback = useCallback(() => { setMessage(''); setError(null) }, [])

  useEffect(() => {
    if (!message && !error) return undefined
    const timer = window.setTimeout(() => { setMessage(''); setError(null) }, error ? 7000 : 4000)
    return () => window.clearTimeout(timer)
  }, [message, error])

  const loadTransactions = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getTransactions({ page: 1, pageSize: 10, ...params })
      setTransactions(result.data || [])
      setTransactionPage(result.pagination || { page: 1, pageSize: 10, total: result.data?.length || 0, totalPages: 1 })
    } catch {
      setError('Erro ao carregar transações.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDashboard = useCallback(async () => {
    try {
      setDashboard(await getDashboard())
    } catch {
      setError('Erro ao carregar o dashboard.')
    }
  }, [])

  useEffect(() => {
    async function boot() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        await Promise.all([loadTransactions(), loadDashboard()])
      } catch {
        localStorage.removeItem('authToken')
        setUser(null)
        setTransactions([])
      } finally {
        setBooting(false)
      }
    }

    boot()
  }, [loadTransactions, loadDashboard])

  async function handleLogin(credentials) {
    const loggedUser = await login(credentials)
    setUser(loggedUser)
    await Promise.all([loadTransactions(), loadDashboard()])
  }

  async function handleRegister(userData) {
    const registeredUser = await register(userData)
    setUser(registeredUser)
    await Promise.all([loadTransactions(), loadDashboard()])
  }

  async function handleLogout() {
    try {
      await logout()
    } finally {
      setUser(null)
      setTransactions([])
      setDashboard(null)
      setActiveTab('dashboard')
      setSelectedTransaction(null)
      setMessage('')
      setError(null)
    }
  }

  const saldo = dashboard?.geral?.saldo ?? 0

  async function handleSave(transaction) {
    setSaving(true)
    setError(null)
    setMessage('')

    try {
      if (selectedTransaction) {
        const atualizada = await updateTransaction(selectedTransaction.id, transaction)
        setTransactions(prev => prev.map(t => t.id === atualizada.id ? atualizada : t))
        setMessage('Transação atualizada com sucesso!')
      } else {
        const criada = await createTransaction(transaction)
        setTransactions(prev => [criada, ...prev])
        setMessage('Transação cadastrada com sucesso!')
      }

      setSelectedTransaction(null)
      setActiveTab('dashboard')
      setDataVersion(version => version + 1)
      await loadDashboard()
      return true
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Não foi possível salvar a transação.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError(null)
    setMessage('')

    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      setDataVersion(version => version + 1)
      await loadDashboard()
      if (selectedTransaction?.id === id) {
        setSelectedTransaction(null)
      }
      setMessage('Transação excluída com sucesso!')
      return true
    } catch (deleteError) {
      setError(deleteError.response?.data?.error || 'Não foi possível excluir a transação.')
      return false
    }
  }

  function handleEdit(transaction) {
    setSelectedTransaction(transaction)
    setActiveTab('cadastro')
    setMessage('')
    setError(null)
  }

  const pages = {
    dashboard: <Dashboard transactions={transactions} dashboard={dashboard} />,
    transacoes: <Tabela key={dataVersion} transactions={transactions} pagination={transactionPage} loading={loading} onQueryChange={loadTransactions} onDelete={handleDelete} onEdit={handleEdit} />,
    cadastro: (
      <Formulario
        key={selectedTransaction?.id || 'new-transaction'}
        onSave={handleSave}
        saving={saving}
        selectedTransaction={selectedTransaction}
        onCancelEdit={() => setSelectedTransaction(null)}
      />
    ),
  }

  if (booting) return <div className="app-loading">Carregando...</div>

  if (!user) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        saldo={saldo}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main">
        <FeedbackToast message={error || message} type={error ? 'error' : 'success'} onClose={closeFeedback} />
        {pages[activeTab]}
      </main>
    </div>
  )
}
