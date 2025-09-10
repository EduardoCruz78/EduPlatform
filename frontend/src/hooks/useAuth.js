// === File: /frontend/src/hooks/useAuth.js ===
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('edu_user') || 'null'))

  useEffect(() => {
    if (user) localStorage.setItem('edu_user', JSON.stringify(user))
    else localStorage.removeItem('edu_user')
  }, [user])

  function setToken(token) {
    if (token) localStorage.setItem('edu_token', token)
    else localStorage.removeItem('edu_token')
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  return { user, setUser, setToken, logout }
}