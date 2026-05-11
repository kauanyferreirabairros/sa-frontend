import { formatCurrency, formatDate } from '../utils/format'

export default function Dashboard({ transactions }) {
  const totalEntradas = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((s, t) => s + t.valor, 0)

  const totalSaidas = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((s, t) => s + t.valor, 0)

  const saldo = totalEntradas - totalSaidas

  const categoriaMap = {}
  transactions
    .filter(t => t.tipo === 'saida')
    .forEach(t => {
      categoriaMap[t.categoria] = (categoriaMap[t.categoria] || 0) + t.valor
    })
  const topCategorias = Object.entries(categoriaMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxCat = topCategorias[0]?.[1] || 1

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema financeiro</p>
        </div>
      </header>

      {/* ── Cards de resumo ── */}
      <div className="cards">
        <div className="card card--saldo">
          <div className="card-label">Saldo Total</div>
          <div className={`card-value ${saldo >= 0 ? 'pos' : 'neg'}`}>
            {formatCurrency(saldo)}
          </div>
          <div className="card-sub">
            {saldo >= 0 ? 'Situação positiva' : 'Atenção: saldo negativo'}
          </div>
        </div>

        <div className="card card--entrada">
          <div className="card-label">Total Entradas</div>
          <div className="card-value pos">{formatCurrency(totalEntradas)}</div>
          <div className="card-sub">
            {transactions.filter(t => t.tipo === 'entrada').length} transações
          </div>
        </div>

        <div className="card card--saida">
          <div className="card-label">Total Saídas</div>
          <div className="card-value neg">{formatCurrency(totalSaidas)}</div>
          <div className="card-sub">
            {transactions.filter(t => t.tipo === 'saida').length} transações
          </div>
        </div>

        <div className="card card--count">
          <div className="card-label">Transações</div>
          <div className="card-value neutral">{transactions.length}</div>
          <div className="card-sub">registros no total</div>
        </div>
      </div>

      {/* ── Gráfico + Recentes ── */}
      <div className="dashboard-bottom">
        <div className="chart-section">
          <h2>Gastos por Categoria</h2>
          {topCategorias.length === 0
            ? <p className="empty">Nenhum gasto registrado.</p>
            : (
              <div className="bar-chart">
                {topCategorias.map(([cat, val]) => (
                  <div key={cat} className="bar-row">
                    <span className="bar-label">{cat}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(val / maxCat) * 100}%` }}
                      />
                    </div>
                    <span className="bar-val">{formatCurrency(val)}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="recentes-section">
          <h2>Últimas Transações</h2>
          <div className="recentes-list">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="recente-item">
                <div className={`recente-dot ${t.tipo}`} />
                <div className="recente-info">
                  <span className="recente-desc">{t.descricao}</span>
                  <span className="recente-cat">
                    {t.categoria} · {formatDate(t.data)}
                  </span>
                </div>
                <span className={`recente-val ${t.tipo}`}>
                  {t.tipo === 'entrada' ? '+' : '−'}{formatCurrency(t.valor)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
