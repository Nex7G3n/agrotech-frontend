import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext'

function SessionLoader() {
  return <div style={{ padding: '2rem' }}>Cargando sesion...</div>
}

export function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <SessionLoader />
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <SessionLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
