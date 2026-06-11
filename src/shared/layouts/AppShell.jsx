import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/admin/users', label: 'F-02 Usuarios', role: 'admin' },
  { to: '/prediction', label: 'F-03 Predicción' },
  { to: '/historical', label: 'F-04 Histórico' },
  { to: '/simulator', label: 'F-05 Simulador' },
  { to: '/recommendation', label: 'F-06 Recomendación' },
  { to: '/reports', label: 'F-07 Reportes' },
  { to: '/alerts', label: 'F-08 Alertas' },
]

export function AppShell() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleItems = navItems.filter((item) => !item.role || item.role === role)
  const initials = (user?.name || 'Usuario')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <header className="bg-ag-green-800 px-6 py-3 flex flex-wrap items-center gap-4 sticky top-0 z-50 shadow-[0_2px_20px_rgba(4,52,44,0.3)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 bg-ag-green-400 rounded-[9px] flex items-center justify-center text-lg">🌿</div>
          <div>
            <div className="text-base font-semibold text-white tracking-[-0.3px]">AgroPredict</div>
            <div className="text-[11px] text-ag-green-100 -mt-px">La Libertad, Perú</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-wrap justify-center gap-1.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-ag-green-100 transition-all hover:bg-white/10 hover:text-white',
                  isActive && 'border-ag-green-400 bg-ag-green-400 text-white shadow-[0_0_0_3px_rgba(29,158,117,0.3)]'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pr-3 pl-1">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-ag-green-200 text-[10px] font-semibold text-ag-green-800">
              {initials}
            </div>
            <span className="hidden text-xs text-white sm:inline">{user?.name || 'Usuario'}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-ag-green-100 transition-all hover:bg-white/10 hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-275 flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
