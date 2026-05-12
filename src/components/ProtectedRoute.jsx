import { useAuth } from '../context/AuthContext'
import Login from './Login'
import Signup from './Signup'
import { useState } from 'react'

export default function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)

  if (loading) {
    return <div className="app-loading">Carregando...</div>
  }

  if (!loggedIn) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  return children
}
