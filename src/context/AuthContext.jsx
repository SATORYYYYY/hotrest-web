import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (initializing) {
        console.warn('Auth initialization timeout - proceeding without auth')
        setInitializing(false)
        setAuthError('timeout')
      }
    }, 10000) // 10 seconds timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId)
      setUser(firebaseUser)

      if (firebaseUser) {
        setIsLoadingUserData(true)
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const data = userDoc.data()
            console.log('User data loaded:', data)
            setUserData(data)
          } else {
            // User document doesn't exist - this shouldn't happen for existing users
            // Don't create new document, just set basic data
            console.log('User document not found in Firestore')
            setUserData({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'manager' // Default fallback
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'manager' })
        } finally {
          setIsLoadingUserData(false)
        }
      } else {
        setUserData(null)
      }
      setInitializing(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  const register = async (email, password, role) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const userDoc = {
      uid: result.user.uid,
      email,
      role
    }
    await setDoc(doc(db, 'users', result.user.uid), userDoc)
    setUserData(userDoc)
    return result.user
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setUserData(null)
  }

  const value = useMemo(() => ({
    user,
    userData,
    loading: initializing || isLoadingUserData,
    authError,
    login,
    register,
    logout,
    isAdmin: userData?.role === 'admin'
  }), [user, userData, initializing, isLoadingUserData, authError])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
