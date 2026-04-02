import React, { memo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Home.css'

const Home = memo(function Home() {
  const { user, userData, logout, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }, [logout, navigate])

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-logo">
          <svg viewBox="0 0 100 100" width="36" height="36">
            <defs>
              <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF6D00' }} />
                <stop offset="100%" style={{ stopColor: '#FFB300' }} />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#headerGrad)" />
            <path d="M50 20 L20 40 L20 80 L80 80 L80 40 Z" fill="white" opacity="0.9" />
            <rect x="35" y="55" width="30" height="25" rx="3" fill="url(#headerGrad)" />
          </svg>
          <span>HotRest</span>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Переключить тему">
            {isDark ? (
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 17.19 14.93 19 12 19c-3.86 0-7-3.14-7-7 0-2.93 1.81-5.45 4.37-6.49zM12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            )}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Выйти
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="welcome-card">
          <div className="welcome-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="welcome-text">
            <h1>Добро пожаловать!</h1>
            <p>{isAdmin ? 'Администратор' : 'Менеджер'}</p>
          </div>
        </div>

        <p className="home-description">Выберите раздел для работы</p>

        <div className="menu-grid">
          <Link to="/hotel" className="menu-card hotel-card">
            <div className="menu-card-bg" style={{ background: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)' }}></div>
            <div className="menu-card-content">
              <div className="menu-card-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="currentColor" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
                </svg>
              </div>
              <h2>Отель</h2>
              <p>Управление номерами</p>
            </div>
          </Link>

          <Link to="/restaurant" className="menu-card restaurant-card">
            <div className="menu-card-bg" style={{ background: 'linear-gradient(135deg, #FF6D00 0%, #FFB300 100%)' }}></div>
            <div className="menu-card-content">
              <div className="menu-card-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                </svg>
              </div>
              <h2>Ресторан</h2>
              <p>Меню и заказы</p>
            </div>
          </Link>
        </div>

        {isAdmin && (
          <div className="quick-actions">
            <h3>Быстрые действия</h3>
            <div className="action-chips">
              <button className="action_chip" onClick={() => navigate('/restaurant')}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Добавить блюдо
              </button>
              <button className="action_chip" onClick={() => navigate('/hotel')}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
                </svg>
                Номера
              </button>
              <button className="action_chip" onClick={() => navigate('/restaurant')}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
                Заказы
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
})

export default Home
