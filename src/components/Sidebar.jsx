import { formatCurrency } from '../utils/format'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard'  },
  { id: 'transacoes', label: 'Transações' },
  { id: 'cadastro',   label: 'Cadastrar'  },
]

export default function Sidebar({ activeTab, onTabChange, saldo }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-icon">◈</span>
        <span className="logo-text">Finança<em>S</em></span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">⬡</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="saldo-mini">
          <span>Saldo atual</span>
          <strong className={saldo >= 0 ? 'pos' : 'neg'}>
            {formatCurrency(saldo)}
          </strong>
        </div>
      </div>
    </aside>
  )
}
