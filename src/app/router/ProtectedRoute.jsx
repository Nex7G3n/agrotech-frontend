import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext'

export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '2rem' }}>Cargando sesión...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
