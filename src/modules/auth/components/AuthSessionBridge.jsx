import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { setUnauthorizedHandler } from '@/shared/api/authSession'
import { useAuth } from '@/modules/auth/context/AuthContext'

export function AuthSessionBridge() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
      navigate('/login?expired=1', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [logout, navigate])

  return null
}
