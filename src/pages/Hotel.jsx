import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import './Hotel.css'

export default function Hotel() {
  const { logout, isAdmin } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Simple query without orderBy for faster loading
    const unsubscribe = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort locally
      roomsData.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      setRooms(roomsData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching rooms:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filter rooms by search query
  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  async function toggleStatus(room) {
    const newStatus = room.status === 'free' ? 'occupied' : 'free'
    await updateDoc(doc(db, 'rooms', room.id), { status: newStatus })
  }

  async function deleteRoom(roomId) {
    await deleteDoc(doc(db, 'rooms', roomId))
    setDeleteConfirm(null)
  }

  return (
    <div className="hotel-page">
      <header className="page-header">
        <div className="header-left">
          <Link to="/" className="back-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div className="header-logo">
            <svg viewBox="0 0 100 100" width="36" height="36">
              <defs>
                <linearGradient id="hotelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#1E88E5' }} />
                  <stop offset="100%" style={{ stopColor: '#42A5F5' }} />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="20" fill="url(#hotelGrad)" />
              <path d="M50 20 L20 40 L20 80 L80 80 L80 40 Z" fill="white" opacity="0.9" />
              <rect x="35" y="55" width="30" height="25" rx="3" fill="url(#hotelGrad)" />
            </svg>
            <span>Отель</span>
          </div>
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
          {isAdmin && (
            <button className="add-btn" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Добавить номер
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="page-content">
        {/* Search bar */}
        <div className="search-bar">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск номеров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
              </svg>
            </div>
            <h2>Нет доступных номеров</h2>
            <p>Добавьте первый номер отеля</p>
          </div>
        ) : (
          <div className="rooms-grid">
            <AnimatePresence>
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="room-card"
                >
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    <span className={`status-badge ${room.status}`}>
                      <span className="status-dot"></span>
                      {room.status === 'free' ? 'Свободен' : 'Занят'}
                    </span>
                  </div>
                  <p className="room-description">{room.description || 'Описание отсутствует'}</p>
                  <div className="room-price">
                    <span className="price-amount">{room.price?.toLocaleString() || 0}</span>
                    <span className="price-currency">₽</span>
                    <span className="price-period">/сутки</span>
                  </div>
                  <div className="room-actions">
                    <button
                      className={`status-btn ${room.status}`}
                      onClick={() => toggleStatus(room)}
                    >
                      {room.status === 'free' ? (
                        <>
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                          </svg>
                          Забронировать
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
                          </svg>
                          Освободить
                        </>
                      )}
                    </button>
                    {isAdmin && (
                      <div className="admin-actions">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingRoom(room)
                            setShowModal(true)
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteConfirm(room)}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {showModal && (
        <RoomModal
          room={editingRoom}
          onClose={() => {
            setShowModal(false)
            setEditingRoom(null)
          }}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <motion.div
            className="confirm-dialog"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <h3>Удаление номера</h3>
            <p>Вы уверены, что хотите удалить номер "{deleteConfirm.name}"?</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>
                Отмена
              </button>
              <button className="confirm-delete-btn" onClick={() => deleteRoom(deleteConfirm.id)}>
                Удалить
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function RoomModal({ room, onClose }) {
  const [name, setName] = useState(room?.name || '')
  const [description, setDescription] = useState(room?.description || '')
  const [price, setPrice] = useState(room?.price?.toString() || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (room) {
        await updateDoc(doc(db, 'rooms', room.id), {
          name,
          description,
          price: Number(price)
        })
      } else {
        await addDoc(collection(db, 'rooms'), {
          name,
          description,
          price: Number(price),
          status: 'free'
        })
      }
      onClose()
    } catch (error) {
      console.error('Error saving room:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="room-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>{room ? 'Редактировать номер' : 'Добавить номер'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Люкс с видом на море"
              required
            />
          </div>
          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Описание номера"
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Цена (₽/сутки)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
