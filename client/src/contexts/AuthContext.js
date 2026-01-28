import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext({ user: null, setUser: () => {}, authLoading: false })

const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const checkAuth = async () => {
      try {
        const res = await api.get('/id')
        if (mounted) setUser(res.data.user || null)
      } catch (err) {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setAuthLoading(true)
      }
    }
    checkAuth()
    return () => { mounted = false }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, loginModalOpen, setLoginModalOpen}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
