import { useState } from 'react'

const LOGIN_FORM = {
  email: '',
  password: '',
}

const REGISTER_FORM = {
  username: '',
  displayname: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function validateLogin(form) {
  const errors = {}

  if (!form.email.trim()) errors.email = 'Informe seu e-mail'
  if (!form.password) errors.password = 'Informe sua senha'

  return errors
}

function validateRegister(form) {
  const errors = {}

  if (!form.username.trim()) errors.username = 'Informe um usuário'
  if (!form.displayname.trim()) errors.displayname = 'Informe seu nome'
  if (!form.email.trim()) errors.email = 'Informe seu e-mail'
  if (form.password.length < 6) errors.password = 'Use pelo menos 6 caracteres'
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'As senhas não conferem'
  }

  return errors
}

function AuthField({ label, error, children }) {
  return (
    <label className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  )
}

export default function Login({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState(LOGIN_FORM)
  const [registerForm, setRegisterForm] = useState(REGISTER_FORM)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  function updateLogin(key, value) {
    setLoginForm(prev => ({ ...prev, [key]: value }))
  }

  function updateRegister(key, value) {
    setRegisterForm(prev => ({ ...prev, [key]: value }))
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setErrors({})
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = isLogin
      ? validateLogin(loginForm)
      : validateRegister(registerForm)

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      if (isLogin) {
        await onLogin(loginForm)
      } else {
        const payload = { ...registerForm }
        delete payload.confirmPassword
        await onRegister(payload)
      }
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message
      setSubmitError(message || 'Não foi possível autenticar. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="logo-icon">◆</span>
          <strong>FinançaS</strong>
        </div>

        <div className="auth-heading">
          <h1>{isLogin ? 'Entrar' : 'Criar conta'}</h1>
          <p>
            {isLogin
              ? 'Acesse seu painel financeiro.'
              : 'Cadastre-se para organizar suas transações.'}
          </p>
        </div>

        <div className="auth-tabs" aria-label="Modo de acesso">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => changeMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => changeMode('register')}
          >
            Cadastro
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <AuthField label="E-mail" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={event => updateLogin('email', event.target.value)}
                />
              </AuthField>

              <AuthField label="Senha" error={errors.password}>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={event => updateLogin('password', event.target.value)}
                />
              </AuthField>
            </>
          ) : (
            <>
              <AuthField label="Usuário" error={errors.username}>
                <input
                  type="text"
                  autoComplete="username"
                  value={registerForm.username}
                  onChange={event => updateRegister('username', event.target.value)}
                />
              </AuthField>

              <AuthField label="Nome" error={errors.displayname}>
                <input
                  type="text"
                  autoComplete="name"
                  value={registerForm.displayname}
                  onChange={event => updateRegister('displayname', event.target.value)}
                />
              </AuthField>

              <AuthField label="E-mail" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={event => updateRegister('email', event.target.value)}
                />
              </AuthField>

              <AuthField label="Senha" error={errors.password}>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={event => updateRegister('password', event.target.value)}
                />
              </AuthField>

              <AuthField label="Confirmar senha" error={errors.confirmPassword}>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.confirmPassword}
                  onChange={event => updateRegister('confirmPassword', event.target.value)}
                />
              </AuthField>
            </>
          )}

          {submitError && <div className="auth-error">{submitError}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
