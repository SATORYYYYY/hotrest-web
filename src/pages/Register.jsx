import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('manager')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, userData } = useAuth()
  const navigate = useNavigate()

  // Navigate after userData is loaded (useEffect to avoid React warnings)
  useEffect(() => {
    if (!loading && userData) {
      navigate('/', { replace: true })
    }
  }, [loading, userData, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      return setError('Пароли не совпадают')
    }

    if (password.length < 6) {
      return setError('Пароль должен быть не менее 6 символов')
    }

    setLoading(true)

    try {
      await register(email, password, role)
    } catch (err) {
      setError(getErrorMessage(err.code))
      setLoading(false)
    }
  }

  function getErrorMessage(code) {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email уже используется'
      case 'auth/invalid-email':
        return 'Неверный формат email'
      case 'auth/weak-password':
        return 'Слишком слабый пароль'
      default:
        return 'Ошибка регистрации'
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-gradient"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg viewBox="0 0 100 100" width="60" height="60">
                <defs>
                  <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF6D00' }} />
                    <stop offset="100%" style={{ stopColor: '#FFB300' }} />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="20" fill="url(#logoGrad2)" />
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white" />
              </svg>
            </div>
            <h1 className="auth-title">Регистрация</h1>
            <p className="auth-subtitle">Создайте новый аккаунт</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Подтвердите пароль"
                  required
                />
              </div>
            </div>

            <div className="role-selection">
              <label>Выберите роль:</label>
              <div className="role-options">
                <label className={`role-option ${role === 'manager' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="manager"
                    checked={role === 'manager'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-card">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                    </svg>
                    <span>Менеджер</span>
                  </div>
                </label>
                <label className={`role-option ${role === 'admin' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-card">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                    <span>Админ</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Зарегистрироваться
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Есть аккаунт? <Link to="/login">Войти</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
