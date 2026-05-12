import { createContext, useState, useCallback, useEffect, useContext as ReactUseContext } from 'react'
import { validateSession } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check authentication on app load
  useEffect(() => {
    const performCheck = async () => {
      setLoading(true)
      setError(null)

      try {
        const session = await validateSession()
        if (session?.loggedIn && session.user) {
          setUser(session.user)
          setLoggedIn(true)
          localStorage.setItem('user', JSON.stringify(session.user))
        } else {
          setUser(null)
          setLoggedIn(false)
          localStorage.removeItem('user')
        }
      } catch (err) {
        setError(err.message)
        setUser(null)
        setLoggedIn(false)
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    performCheck()
  }, [])

  const login = useCallback((userData) => {
    setUser(userData)
    setLoggedIn(true)
    localStorage.setItem('user', JSON.stringify(userData))
    setError(null)
  }, [])

  const signup = useCallback((userData) => {
    setUser(userData)
    setLoggedIn(true)
    localStorage.setItem('user', JSON.stringify(userData))
    setError(null)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setLoggedIn(false)
    localStorage.removeItem('user')
    setError(null)
  }, [])

  const setAuthError = useCallback((errorMessage) => {
    setError(errorMessage)
  }, [])

  const value = {
    user,
    loggedIn,
    loading,
    error,
    login,
    signup,
    logout,
    setAuthError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = ReactUseContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
