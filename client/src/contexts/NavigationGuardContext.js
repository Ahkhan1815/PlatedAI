import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Modal, Button } from 'react-bootstrap'

const NavigationGuardContext = createContext({
  isDirty: false,
  setUnsavedChanges: () => {},
  requestNavigation: () => true,
})

export function NavigationGuardProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [isDirty, setIsDirty] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const pendingActionRef = useRef(null)
  const suppressNextPopRef = useRef(false)
  const guardPathRef = useRef(null)

  const setUnsavedChanges = useCallback((dirty) => {
    setIsDirty(Boolean(dirty))
  }, [])

  const runAction = useCallback((target) => {
    if (typeof target === 'function') {
      target()
      return
    }
    navigate(target)
  }, [navigate])

  const requestNavigation = useCallback((target) => {
    if (!isDirty) {
      runAction(target)
      return true
    }

    pendingActionRef.current = () => runAction(target)
    setShowLeaveModal(true)
    return false
  }, [isDirty, runAction])

  useEffect(() => {
    if (!isDirty) {
      guardPathRef.current = null
      return
    }

    if (guardPathRef.current !== location.pathname) {
      window.history.pushState({ platedGuard: true }, '', location.pathname)
      guardPathRef.current = location.pathname
    }
  }, [isDirty, location.pathname])

  useEffect(() => {
    const onPopState = () => {
      if (!isDirty) return
      if (suppressNextPopRef.current) {
        suppressNextPopRef.current = false
        return
      }

      window.history.pushState({ platedGuard: true }, '', location.pathname)
      pendingActionRef.current = () => {
        suppressNextPopRef.current = true
        window.history.back()
      }
      setShowLeaveModal(true)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [isDirty, location.pathname])

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const stayOnPage = () => {
    setShowLeaveModal(false)
    pendingActionRef.current = null
  }

  const leavePage = () => {
    setShowLeaveModal(false)
    const action = pendingActionRef.current
    pendingActionRef.current = null
    if (typeof action === 'function') action()
  }

  return (
    <NavigationGuardContext.Provider value={{ isDirty, setUnsavedChanges, requestNavigation }}>
      {children}

      <Modal show={showLeaveModal} onHide={stayOnPage} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unsaved changes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to leave this page? All unsaved changes will be lost.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={stayOnPage}>Stay</Button>
          <Button variant="danger" onClick={leavePage}>Leave</Button>
        </Modal.Footer>
      </Modal>
    </NavigationGuardContext.Provider>
  )
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext)
}

export default NavigationGuardContext
