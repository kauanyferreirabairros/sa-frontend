import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { signupUser } from '../services/authService'
import './Auth.css'

export default function Signup({ onSwitchToLogin }) {
  const { signup, setAuthError } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.username.trim() || !formData.displayName.trim() || !formData.email.trim() || !formData.password.trim()) {
        setError('Por favor, preencha todos os campos.')
        setLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        setLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não correspondem.')
        setLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        setError('Por favor, insira um email válido.')
        setLoading(false)
        return
      }

      const response = await signupUser({
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
      })

      signup(response.user || { email: formData.email, username: formData.username })
    } catch (err) {
      let errorMsg = 'Erro ao criar conta.'

      if (err.response?.data?.error) {
        errorMsg = err.response.data.error
      } else if (err.response?.data?.errors) {
        errorMsg = Object.values(err.response.data.errors).flat().join(' ')
      } else if (err.message) {
        errorMsg = err.message
      }

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
          <p>Crie sua conta para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Criar Conta</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="seu_usuario"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Nome Completo</label>
            <input
              id="displayName"
              type="text"
              name="displayName"
              placeholder="Seu Nome Completo"
              value={formData.displayName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <small>Mínimo 6 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem uma conta? <button type="button" className="link-btn" onClick={onSwitchToLogin}>Fazer login</button></p>
        </div>
      </div>
    </div>
  )
}
