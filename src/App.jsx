import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Hotel from './pages/Hotel'
import Restaurant from './pages/Restaurant'

// Loading spinner component
function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--background)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Загрузка...</span>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, userData, loading } = useAuth()

  if (loading || !userData) {
    return <LoadingSpinner />
  }

  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return user ? <Navigate to="/" /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      } />
      <Route path="/hotel" element={
        <PrivateRoute>
          <Hotel />
        </PrivateRoute>
      } />
      <Route path="/restaurant" element={
        <PrivateRoute>
          <Restaurant />
        </PrivateRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
