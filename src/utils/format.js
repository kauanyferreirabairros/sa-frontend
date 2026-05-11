export function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export function formatDate(d) {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
