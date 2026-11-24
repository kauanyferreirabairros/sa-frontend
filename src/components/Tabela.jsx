import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '../utils/format'

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="sort-icon">↕</span>
  return (
    <span className="sort-icon active">
      {sortDir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export default function Tabela({ transactions, pagination, loading, onQueryChange, onDelete, onEdit }) {
  const [filterTipo, setFilterTipo] = useState('todos')
  const [sortField, setSortField] = useState('data')
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    onQueryChange({
      page,
      pageSize: pagination?.pageSize || 10,
      ...(filterTipo !== 'todos' && { tipo: filterTipo }),
      ...(query && { q: query }),
      ...(dataInicio && { dataInicio }),
      ...(dataFim && { dataFim }),
      sortBy: sortField,
      sortOrder: sortDir,
    })
  }, [page, filterTipo, query, dataInicio, dataFim, sortField, sortDir, onQueryChange, pagination?.pageSize])

  function handleSort(field) {
    if (sortField === field) {
      setSortDir(current => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = transactions

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'entrada', label: 'Entradas' },
    { key: 'saida', label: 'Saídas' },
  ]

  const columns = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'valor', label: 'Valor' },
    { key: 'data', label: 'Data' },
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
              onClick={() => { setFilterTipo(f.key); setPage(1) }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input aria-label="Buscar transações" placeholder="Buscar descrição ou categoria" value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} />
        <label>De <input aria-label="Data inicial" type="date" value={dataInicio} onChange={event => { setDataInicio(event.target.value); setPage(1) }} /></label>
        <label>Até <input aria-label="Data final" type="date" value={dataFim} onChange={event => { setDataFim(event.target.value); setPage(1) }} /></label>
      </header>

      {loading && <p role="status">Atualizando transações...</p>}

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
                    {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                  </td>
                  <td className="td-date">{formatDate(t.data)}</td>
                  <td className="td-actions">
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(t)}
                      title="Editar transação"
                    >
                      ✎
                    </button>
                    <button
                      className="del-btn"
                      onClick={() => onDelete(t.id)}
                      title="Remover transação"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        {pagination?.total ?? filtered.length} registro(s) · Página {pagination?.page || page} de {Math.max(1, pagination?.totalPages || 1)}
        <button disabled={loading || page <= 1} onClick={() => setPage(current => current - 1)}>Anterior</button>
        <button disabled={loading || page >= (pagination?.totalPages || 1)} onClick={() => setPage(current => current + 1)}>Próxima</button>
      </div>
    </div>
  )
}
