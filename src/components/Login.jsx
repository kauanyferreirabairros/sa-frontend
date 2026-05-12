import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/authService'
import './Auth.css'

export default function Login({ onSwitchToSignup }) {
  const { login, setAuthError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos.')
        setLoading(false)
        return
      }

      const response = await loginUser({ email, password })
      login(response.user || { email })
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao fazer login.'
      setError(errorMsg)
      setAuthError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">◈</span>
          <h1>Finança<em>S</em></h1>
          <p>Gerencie suas finanças com facilidade</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Entrar</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email ou Usuário</label>
            <input
              id="email"
              type="text"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem uma conta? <button type="button" className="link-btn" onClick={onSwitchToSignup}>Criar conta</button></p>
        </div>
      </div>
    </div>
  )
}
