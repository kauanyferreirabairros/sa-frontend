import { useEffect, useState } from 'react'
import './App.css'

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
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

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [booting, setBooting] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  async function loadTransactions() {
    setLoading(true)
    setError(null)

    try {
      const data = await getTransactions()
      setTransactions(data || [])
    } catch {
      setError('Erro ao carregar transações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function boot() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        await loadTransactions()
      } catch {
        localStorage.removeItem('authToken')
        setUser(null)
        setTransactions([])
      } finally {
        setBooting(false)
      }
    }

    boot()
  }, [])

  async function handleLogin(credentials) {
    const loggedUser = await login(credentials)
    setUser(loggedUser)
    await loadTransactions()
  }

  async function handleRegister(userData) {
    const registeredUser = await register(userData)
    setUser(registeredUser)
    await loadTransactions()
  }

  async function handleLogout() {
    await logout()
    setUser(null)
    setTransactions([])
    setActiveTab('dashboard')
    setSelectedTransaction(null)
    setMessage('')
    setError(null)
  }

  const saldo = transactions.reduce(
    (acc, t) => t.tipo === 'entrada' ? acc + Number(t.valor) : acc - Number(t.valor),
    0
  )

  async function handleSave(transaction) {
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
    } catch {
      setError('Erro ao salvar transação.')
    }
  }

  async function handleDelete(id) {
    setError(null)
    setMessage('')

    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      if (selectedTransaction?.id === id) {
        setSelectedTransaction(null)
      }
      setMessage('Transação excluída com sucesso!')
    } catch {
      setError('Erro ao excluir transação.')
    }
  }

  function handleEdit(transaction) {
    setSelectedTransaction(transaction)
    setActiveTab('cadastro')
    setMessage('')
    setError(null)
  }

  const pages = {
    dashboard: <Dashboard transactions={transactions} />,
    transacoes: <Tabela transactions={transactions} onDelete={handleDelete} onEdit={handleEdit} />,
    cadastro: (
      <Formulario
        key={selectedTransaction?.id || 'new-transaction'}
        onSave={handleSave}
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
        {message && <div className="app-success">{message}</div>}
        {error && <div className="app-error">{error}</div>}
        {loading ? <div className="app-loading">Carregando...</div> : pages[activeTab]}
      </main>
    </div>
  )
}
