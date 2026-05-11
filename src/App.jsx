import { useState, useEffect } from 'react'
import './App.css'

import { getTransactions, createTransaction, deleteTransaction } from './services/transactionService'
import Sidebar    from './components/Sidebar'
import Dashboard  from './components/Dashboard'
import Tabela     from './components/Tabela'
import Formulario from './components/Formulario'

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab]       = useState('dashboard')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    getTransactions()
      .then(data => setTransactions(data))
      .catch(() => setError('Erro ao carregar transações.'))
      .finally(() => setLoading(false))
  }, [])

  const saldo = transactions.reduce(
    (acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc - t.valor,
    0
  )

  async function handleAdd(nova) {
    const criada = await createTransaction(nova)
    setTransactions(prev => [criada, ...prev])
  }

  async function handleDelete(id) {
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const pages = {
    dashboard:  <Dashboard  transactions={transactions} />,
    transacoes: <Tabela     transactions={transactions} onDelete={handleDelete} />,
    cadastro:   <Formulario onAdd={handleAdd} />,
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
        {pages[activeTab]}
      </main>
    </div>
  )
}

