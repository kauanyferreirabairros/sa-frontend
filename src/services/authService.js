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
  const response = await api.post('/auth/login', credentials)
  return normalizeAuthPayload(response.data)
}

export async function register(userData) {
  const response = await api.post('/auth/register', userData)
  return normalizeAuthPayload(response.data)
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data?.user || response.data
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch {
    // JWT logout remains local if the API is unavailable.
  } finally {
    localStorage.removeItem('authToken')
  }
}
