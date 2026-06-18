import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [role, setRole] = useState(() => localStorage.getItem('role'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(Boolean(token))

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    setToken(null)
    setRole(null)
    setUser(null)
    setLoading(false)
  }

  useEffect(() => {
    if (!token) return

    let active = true
    authService
      .me()
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        setRole(currentUser.role)
        localStorage.setItem('role', currentUser.role)
        localStorage.setItem('user', JSON.stringify(currentUser))
      })
      .catch(() => logout())
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  const persistSession = (authResponse) => {
    localStorage.setItem('token', authResponse.access_token)
    localStorage.setItem('role', authResponse.user.role)
    localStorage.setItem('user', JSON.stringify(authResponse.user))
    setToken(authResponse.access_token)
    setRole(authResponse.user.role)
    setUser(authResponse.user)
  }

  const login = async (payload) => {
    const authResponse = await authService.login(payload)
    persistSession(authResponse)
    return authResponse
  }

  const register = async (payload) => {
    const authResponse = await authService.register(payload)
    persistSession(authResponse)
    return authResponse
  }

  return (
    <AuthContext.Provider value={{ token, role, user, loading, login, register, logout, isAuthenticated: Boolean(token), isAdmin: Boolean(user?.is_admin || role === 'admin') }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
