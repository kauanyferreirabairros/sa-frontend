import api from './api'

export async function loginUser(credentials) {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export async function signupUser(userData) {
  const response = await api.post('/auth/signup', {
    ...userData,
    disp: userData.displayName,
    confirmation: userData.confirmPassword || userData.password,
  })
  return response.data
}

export async function logoutUser() {
  const response = await api.post('/auth/logout')
  return response.data
}

export async function validateSession() {
  try {
    const response = await api.get('/auth/me')
    return response.data
  } catch {
    return null
  }
}
