import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Usuarios', role: 'admin' },
]

export function AppShell() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-kicker">Tesis</span>
          <strong>Auth System</strong>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="sidebar-label">Sesión</p>
            <strong>{user?.name || 'Usuario'}</strong>
            <p className="sidebar-meta">Rol: {role || 'user'}</p>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div>
            <p className="topbar-kicker">Área privada</p>
            <h1>Panel de control</h1>
          </div>
          <button type="button" className="logout-button secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
