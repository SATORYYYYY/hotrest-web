import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { db } from '../firebase/config'
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import './Restaurant.css'

export default function Restaurant() {
  const { logout, isAdmin, userData } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dishes, setDishes] = useState([])
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('menu')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedTable, setSelectedTable] = useState(1)
  const [loading, setLoading] = useState(true)

  // Dish management state
  const [showDishModal, setShowDishModal] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Check if user can manage menu (admin or manager)
  const canManageMenu = userData?.role === 'admin' || userData?.role === 'manager'

  useEffect(() => {
    // Simple query without orderBy for faster loading
    const dishesUnsubscribe = onSnapshot(collection(db, 'dishes'), (snapshot) => {
      const dishesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort locally
      dishesData.sort((a, b) => {
        const catCompare = (a.category || '').localeCompare(b.category || '')
        return catCompare !== 0 ? catCompare : (a.name || '').localeCompare(b.name || '')
      })
      setDishes(dishesData)
    }, (error) => {
      console.error('Error fetching dishes:', error)
    })

    const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Sort locally by createdAt
      ordersData.sort((a, b) => {
        const timeA = a.createdAt || ''
        const timeB = b.createdAt || ''
        return timeB.localeCompare(timeA)
      })
      setOrders(ordersData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching orders:', error)
      setLoading(false)
    })

    return () => {
      dishesUnsubscribe()
      ordersUnsubscribe()
    }
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function addToCart(dish) {
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dish.id)
      if (existing) {
        return prev.map(item =>
          item.dishId === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1
      }]
    })
  }

  function removeFromCart(dishId) {
    setCart(prev => prev.filter(item => item.dishId !== dishId))
  }

  function updateQuantity(dishId, delta) {
    setCart(prev => prev.map(item => {
      if (item.dishId === dishId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  async function placeOrder() {
    if (cart.length === 0) return

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const orderData = {
      tableNumber: selectedTable,
      dishes: cart,
      totalPrice: total,
      status: 'processing',
      createdAt: new Date().toISOString()
    }

    await addDoc(collection(db, 'orders'), orderData)
    setCart([])
    setShowCart(false)
    setSelectedTable(1)
  }

  async function updateOrderStatus(order, newStatus) {
    await updateDoc(doc(db, 'orders', order.id), { status: newStatus })
  }

  async function deleteOrder(orderId) {
    await deleteDoc(doc(db, 'orders', orderId))
  }

  // Dish management functions
  async function addDish(dishData) {
    await addDoc(collection(db, 'dishes'), {
      ...dishData,
      isAvailable: true
    })
    setShowDishModal(false)
    setEditingDish(null)
  }

  async function updateDish(dishId, dishData) {
    await updateDoc(doc(db, 'dishes', dishId), dishData)
    setShowDishModal(false)
    setEditingDish(null)
  }

  async function deleteDish(dishId) {
    await deleteDoc(doc(db, 'dishes', dishId))
    setDeleteConfirm(null)
  }

  async function toggleDishAvailability(dish) {
    await updateDoc(doc(db, 'dishes', dish.id), {
      isAvailable: !dish.isAvailable
    })
  }

  function openAddDishModal() {
    setEditingDish(null)
    setShowDishModal(true)
  }

  function openEditDishModal(dish) {
    setEditingDish(dish)
    setShowDishModal(true)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Filter dishes by search query
  const filteredDishes = dishes.filter(dish =>
    dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedDishes = filteredDishes.reduce((acc, dish) => {
    if (!acc[dish.category]) acc[dish.category] = []
    acc[dish.category].push(dish)
    return acc
  }, {})

  return (
    <div className="restaurant-page">
      <header className="page-header restaurant-header">
        <div className="header-left">
          <Link to="/" className="back-btn">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <div className="header-logo">
            <svg viewBox="0 0 100 100" width="36" height="36">
              <defs>
                <linearGradient id="restGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF6D00' }} />
                  <stop offset="100%" style={{ stopColor: '#FFB300' }} />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="20" fill="url(#restGrad)" />
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="white" />
            </svg>
            <span>Ресторан</span>
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
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
              </svg>
              Заказы
              {orders.length > 0 && <span className="badge">{orders.length}</span>}
            </button>
          )}
          {!isAdmin && cart.length > 0 && (
            <button className="cart-btn cart-btn-primary" onClick={() => setShowCart(true)}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
              Корзина
              <span className="badge">{cart.length}</span>
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        </div>
      </header>

      {canManageMenu && (
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
            </svg>
            Меню
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            Заказы
            {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
          </button>
        </div>
      )}

      <main className="page-content">
        {/* Search bar */}
        <div className="search-bar">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск блюд..."
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

        {/* Add dish button for admin */}
        {isAdmin && activeTab === 'menu' && (
          <button className="add-dish-btn" onClick={openAddDishModal}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Добавить блюдо
          </button>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
          </div>
        ) : (
          <>
            {(activeTab === 'menu' || !canManageMenu) && (
              <div className="menu-section">
                {Object.keys(groupedDishes).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon restaurant">
                      <svg viewBox="0 0 24 24" width="64" height="64">
                        <path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                      </svg>
                    </div>
                    <h2>Меню пустое</h2>
                    <p>Добавьте блюда в меню</p>
                  </div>
                ) : (
                  <>
                    {Object.entries(groupedDishes).map(([category, categoryDishes]) => {
                      // Filter dishes for non-managers (show only available)
                      const visibleDishes = canManageMenu ? categoryDishes : categoryDishes.filter(d => d.isAvailable !== false)
                      if (visibleDishes.length === 0) return null
                      return (
                        <div key={category} className="menu-category">
                          <h2 className="category-title">{category}</h2>
                          <div className="dishes-grid">
                            <AnimatePresence>
                              {visibleDishes.map((dish, index) => (
                                <motion.div
                                  key={dish.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className={`dish-card ${!dish.isAvailable ? 'dish-unavailable' : ''}`}
                                >
                                  <div className="dish-info">
                                    <h3>{dish.name}</h3>
                                    {dish.description && <p>{dish.description}</p>}
                                    <span className="dish-price">{dish.price?.toLocaleString() || 0} ₽</span>
                                    {!dish.isAvailable && <span className="stop-list-badge">В стоп-листе</span>}
                                  </div>

                                  {/* Admin/Manager controls */}
                                  {canManageMenu ? (
                                    <div className="dish-admin-actions">
                                      {/* Stop list toggle */}
                                      <button
                                        className={`availability-btn ${dish.isAvailable ? 'available' : 'unavailable'}`}
                                        onClick={() => toggleDishAvailability(dish)}
                                        title={dish.isAvailable ? 'В стоп-лист' : 'В меню'}
                                      >
                                        {dish.isAvailable ? (
                                          <svg viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                          </svg>
                                        ) : (
                                          <svg viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                                          </svg>
                                        )}
                                      </button>

                                      {/* Edit button (admin only) */}
                                      {isAdmin && (
                                        <button
                                          className="edit-btn"
                                          onClick={() => openEditDishModal(dish)}
                                          title="Редактировать"
                                        >
                                          <svg viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                          </svg>
                                        </button>
                                      )}

                                      {/* Delete button (admin only) */}
                                      {isAdmin && (
                                        <button
                                          className="delete-btn"
                                          onClick={() => setDeleteConfirm(dish)}
                                          title="Удалить"
                                        >
                                          <svg viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <button className="add-to-cart-btn" onClick={() => addToCart(dish)}>
                                      <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                      </svg>
                                    </button>
                                  )}
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}

            {canManageMenu && activeTab === 'orders' && (
              <div className="orders-section">
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg viewBox="0 0 24 24" width="64" height="64">
                        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                      </svg>
                    </div>
                    <h2>Нет активных заказов</h2>
                    <p>Заказы появятся здесь</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    <AnimatePresence>
                      {orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="order-card"
                        >
                          <div className="order-header">
                            <div className="order-table">
                              <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M12 5.5A2.5 2.5 0 0 1 14.5 8a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 8 2.5 2.5 0 0 1 12 5.5M18 10a4 4 0 0 0-4-4h-1a3.5 3.5 0 0 0-6.63.45A3.5 3.5 0 0 0 4.5 10H4v10h16V10h-.5z" />
                              </svg>
                              <span>Стол {order.tableNumber}</span>
                            </div>
                            <span className={`order-status ${order.status}`}>
                              {order.status === 'processing' ? 'Готовится' : 'Готов'}
                            </span>
                          </div>
                          <div className="order-items">
                            {order.dishes?.map((item, i) => (
                              <div key={i} className="order-item">
                                <span>{item.name} x{item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-footer">
                            <span className="order-total">Итого: {order.totalPrice?.toLocaleString() || 0} ₽</span>
                            <div className="order-actions">
                              {order.status === 'processing' && (
                                <button
                                  className="ready-btn"
                                  onClick={() => updateOrderStatus(order, 'ready')}
                                >
                                  <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                  </svg>
                                  Готов
                                </button>
                              )}
                              <button
                                className="delete-order-btn"
                                onClick={() => deleteOrder(order.id)}
                              >
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {showCart && (
        <CartModal
          cart={cart}
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onPlaceOrder={placeOrder}
          onClose={() => setShowCart(false)}
          isAdmin={isAdmin}
          orders={isAdmin ? orders : []}
        />
      )}

      {/* Dish Modal for adding/editing */}
      {showDishModal && (
        <DishModal
          dish={editingDish}
          onClose={() => {
            setShowDishModal(false)
            setEditingDish(null)
          }}
          onSave={editingDish
            ? (data) => updateDish(editingDish.id, data)
            : addDish
          }
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <motion.div
            className="confirm-dialog"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="confirm-icon delete">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
            <h3>Удаление блюда</h3>
            <p>Вы уверены, что хотите удалить "{deleteConfirm.name}"?</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>
                Отмена
              </button>
              <button className="confirm-delete-btn" onClick={() => deleteDish(deleteConfirm.id)}>
                Удалить
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function CartModal({ cart, selectedTable, onTableChange, onUpdateQuantity, onRemove, onPlaceOrder, onClose, isAdmin, orders }) {
  const [view, setView] = useState(isAdmin ? 'orders' : 'cart')

  const displayOrders = isAdmin ? orders : cart
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="cart-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="cart-header">
          <h2>{isAdmin ? 'Заказы' : 'Корзина'}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {isAdmin && (
          <div className="cart-tabs">
            <button
              className={`cart-tab ${view === 'orders' ? 'active' : ''}`}
              onClick={() => setView('orders')}
            >
              Заказы ({orders.length})
            </button>
            <button
              className={`cart-tab ${view === 'cart' ? 'active' : ''}`}
              onClick={() => setView('cart')}
            >
              Корзина ({cart.length})
            </button>
          </div>
        )}

        <div className="cart-content">
          {view === 'orders' || isAdmin ? (
            <div className="cart-items">
              {(isAdmin ? orders : cart).length === 0 ? (
                <p className="empty-cart">Пусто</p>
              ) : (
                (isAdmin ? orders : cart).map((item, index) => (
                  <div key={index} className="cart-item">
                    {isAdmin ? (
                      <>
                        <div className="cart-item-info">
                          <strong>Стол {item.tableNumber}</strong>
                          <span>{item.dishes?.map(d => `${d.name}x${d.quantity}`).join(', ')}</span>
                          <span className="item-total">{item.totalPrice?.toLocaleString() || 0} ₽</span>
                        </div>
                        <span className={`order-status ${item.status}`}>
                          {item.status === 'processing' ? 'Готовится' : 'Готов'}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="cart-item-info">
                          <strong>{item.name}</strong>
                          <span>{item.price} ₽ x {item.quantity}</span>
                        </div>
                        <div className="quantity-controls">
                          <button onClick={() => onUpdateQuantity(item.dishId, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.dishId, 1)}>+</button>
                        </div>
                        <button className="remove-btn" onClick={() => onRemove(item.dishId)}>
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {!isAdmin && (
                <>
                  <div className="table-selection">
                    <label>Выберите стол:</label>
                    <div className="table-options">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(table => (
                        <button
                          key={table}
                          className={`table-btn ${selectedTable === table ? 'selected' : ''}`}
                          onClick={() => onTableChange(table)}
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cart-items">
                    {cart.length === 0 ? (
                      <p className="empty-cart">Корзина пуста</p>
                    ) : (
                      cart.map((item, index) => (
                        <div key={index} className="cart-item">
                          <div className="cart-item-info">
                            <strong>{item.name}</strong>
                            <span>{item.price} ₽ x {item.quantity}</span>
                          </div>
                          <div className="quantity-controls">
                            <button onClick={() => onUpdateQuantity(item.dishId, -1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.dishId, 1)}>+</button>
                          </div>
                          <button className="remove-btn" onClick={() => onRemove(item.dishId)}>
                            <svg viewBox="0 0 24 24" width="18" height="18">
                              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {!isAdmin && cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Итого:</span>
              <strong>{total.toLocaleString()} ₽</strong>
            </div>
            <button className="checkout-btn" onClick={onPlaceOrder}>
              Оформить заказ
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function DishModal({ dish, onClose, onSave }) {
  const [name, setName] = useState(dish?.name || '')
  const [category, setCategory] = useState(dish?.category || 'Основное')
  const [price, setPrice] = useState(dish?.price?.toString() || '')
  const [description, setDescription] = useState(dish?.description || '')

  const categories = ['Основное', 'Закуски', 'Напитки', 'Десерты', 'Супы', 'Салаты']

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      name,
      category,
      price: Number(price),
      description
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="dish-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="dish-modal-header">
          <h2>{dish ? 'Редактировать блюдо' : 'Добавить блюдо'}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dish-form">
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Борщ"
              required
            />
          </div>

          <div className="form-group">
            <label>Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Цена (₽)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Описание блюда"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="submit-btn" disabled={!name || !price}>
              Сохранить
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
