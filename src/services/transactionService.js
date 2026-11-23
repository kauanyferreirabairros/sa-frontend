import api from './api'

export async function getTransactions(params = {}) {
  const response = await api.get('/transactions', { params })
  return Array.isArray(response.data)
    ? { data: response.data, pagination: { page: 1, pageSize: response.data.length, total: response.data.length, totalPages: 1 } }
    : response.data
}

export async function createTransaction(transaction) {
  const response = await api.post('/transactions', transaction)
  return response.data
}

export async function updateTransaction(id, transaction) {
  const response = await api.put(`/transactions/${id}`, transaction)
  return response.data
}

export async function deleteTransaction(id) {
  await api.delete(`/transactions/${id}`)
}
