import { useState, useEffect } from 'react'
import './App.css'

import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './services/transactionService'
import Sidebar    from './components/Sidebar'
import Dashboard  from './components/Dashboard'
import Tabela     from './components/Tabela'
import Formulario from './components/Formulario'

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab]       = useState('dashboard')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [message, setMessage]           = useState('')
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
    loadTransactions()
  }, [])

  const saldo = transactions.reduce(
    (acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc - t.valor,
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
    dashboard:  <Dashboard  transactions={transactions} />,
    transacoes: <Tabela     transactions={transactions} onDelete={handleDelete} onEdit={handleEdit} />,
    cadastro:   <Formulario onSave={handleSave} selectedTransaction={selectedTransaction} onCancelEdit={() => setSelectedTransaction(null)} />,
  }

  if (loading) return <div className="app-loading">Carregando...</div>
  if (error)   return <div className="app-error">{error}</div>

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        saldo={saldo}
      />

      <main className="main">
        {message && <div className="app-success">{message}</div>}
        {pages[activeTab]}
      </main>
    </div>
  )
}

