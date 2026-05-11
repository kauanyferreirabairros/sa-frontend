import { useState } from 'react'
import './App.css'

import { initialTransactions } from './data/transactions'
import Sidebar    from './components/Sidebar'
import Dashboard  from './components/Dashboard'
import Tabela     from './components/Tabela'
import Formulario from './components/Formulario'

export default function App() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [activeTab, setActiveTab]       = useState('dashboard')

  const saldo = transactions.reduce(
    (acc, t) => t.tipo === 'entrada' ? acc + t.valor : acc - t.valor,
    0
  )

  function handleAdd(nova) {
    setTransactions(prev => [{ id: Date.now(), ...nova }, ...prev])
  }

  function handleDelete(id) {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const pages = {
    dashboard:  <Dashboard  transactions={transactions} />,
    transacoes: <Tabela     transactions={transactions} onDelete={handleDelete} />,
    cadastro:   <Formulario onAdd={handleAdd} />,
  }

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
