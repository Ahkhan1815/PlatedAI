import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Container, Form } from 'react-bootstrap'
import AuthContext from '../contexts/AuthContext'

const api = axios.create({ baseURL: '/api/', withCredentials: true })

function Settings() {
  const { user, setUser, authLoading, setLoginModalOpen } = useContext(AuthContext)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (authLoading && !user) {
      setLoginModalOpen(true)
    }
  }, [authLoading, user, setLoginModalOpen])

  useEffect(() => {
    const userTheme = user?.theme_preference
    const persistedTheme = localStorage.getItem('plated-theme') || document.documentElement.getAttribute('data-bs-theme') || 'light'
    const effectiveTheme = userTheme || persistedTheme
    setTheme(effectiveTheme)
    document.documentElement.setAttribute('data-bs-theme', effectiveTheme)
  }, [user])

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    localStorage.setItem('plated-theme', theme)
  }, [theme])

  const updateThemePreference = async (nextTheme) => {
    setTheme(nextTheme)
    try {
      const res = await api.put('/profile', { theme_preference: nextTheme })
      if (res.data?.user) {
        setUser(res.data.user)
      }
    } catch (err) {
      const fallbackTheme = user?.theme_preference || 'light'
      setTheme(fallbackTheme)
      console.error('Failed to persist theme preference', err)
    }
  }

  if (!authLoading || !user) return null

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '700px' }}>
        <Card.Body>
          <h2 className="text-center mb-3 text-success fw-light">Settings</h2>
          <Form.Group className="mt-2 text-start">
            <Form.Check
              type="switch"
              id="theme-mode-switch"
              label={theme === 'dark' ? 'Dark mode' : 'Light mode'}
              checked={theme === 'dark'}
              onChange={(e) => updateThemePreference(e.target.checked ? 'dark' : 'light')}
            />
          </Form.Group>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Settings
