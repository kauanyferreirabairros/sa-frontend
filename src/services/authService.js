import api from './api'

function normalizeAuthPayload(data) {
  const token = data?.token || data?.accessToken
  const user = data?.user || data

  if (token) {
    localStorage.setItem('authToken', token)
  }

  return user
}

export async function login(credentials) {
  const response = await api.post('/login', credentials)
  return normalizeAuthPayload(response.data)
}

export async function register(userData) {
  const response = await api.post('/register', userData)
  return normalizeAuthPayload(response.data)
}

export async function getCurrentUser() {
  const response = await api.get('/me')
  return response.data?.user || response.data
}

export async function logout() {
  try {
    await api.post('/logout')
  } finally {
    localStorage.removeItem('authToken')
  }
}
