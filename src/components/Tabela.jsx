import { useState } from 'react'
import { formatCurrency, formatDate } from '../utils/format'

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="sort-icon">↕</span>
  return (
    <span className="sort-icon active">
      {sortDir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export default function Tabela({ transactions, onDelete }) {
  const [filterTipo, setFilterTipo] = useState('todos')
  const [sortField, setSortField] = useState('data')
  const [sortDir, setSortDir]   = useState('desc')

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = transactions
    .filter(t => filterTipo === 'todos' || t.tipo === filterTipo)
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField]
      if (sortField === 'valor') { va = +va; vb = +vb }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })

  const filters = [
    { key: 'todos',  label: 'Todos'   },
    { key: 'entrada', label: 'Entradas' },
    { key: 'saida',  label: 'Saídas'  },
  ]

  const columns = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'tipo',      label: 'Tipo'      },
    { key: 'valor',     label: 'Valor'     },
    { key: 'data',      label: 'Data'      },
  ]

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Transações</h1>
          <p>Histórico completo de movimentações</p>
        </div>

        <div className="filter-group">
          {filters.map(f => (
            <button
              key={f.key}
              className={`filter-btn${filterTipo === f.key ? ' active' : ''}`}
              onClick={() => setFilterTipo(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="sortable"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}{' '}
                  <SortIcon
                    field={col.key}
                    sortField={sortField}
                    sortDir={sortDir}
                  />
                </th>
              ))}
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              )
              : filtered.map(t => (
                <tr key={t.id} className={`row-${t.tipo}`}>
                  <td className="td-desc">{t.descricao}</td>
                  <td><span className="badge">{t.categoria}</span></td>
                  <td>
                    <span className={`tipo-tag ${t.tipo}`}>
                      {t.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td className={`td-val ${t.tipo}`}>
                    {t.tipo === 'entrada' ? '+' : '−'}{formatCurrency(t.valor)}
                  </td>
                  <td className="td-date">{formatDate(t.data)}</td>
                  <td>
                    <button
                      className="del-btn"
                      onClick={() => onDelete(t.id)}
                      title="Remover transação"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        {filtered.length} registro(s) exibido(s)
      </div>
    </div>
  )
}
