import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useAuth } from '../../modules/auth/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/admin/users', label: 'Usuarios', icon: Users, badge: 'F-02' },
  { to: '/prediction', label: 'F-03 Predicción' },
  { to: '/historical', label: 'F-04 Histórico' },
  { to: '/campaigns', label: 'Campañas' },
  { to: '/simulator', label: 'F-05 Simulador' },
  { to: '/control-cases', label: 'Centro de control' },
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
    <div className="min-h-screen bg-background font-sans text-foreground lg:flex">
      <aside className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ag-green-600 text-lg text-white">🌿</div>
          <div>
            <div className="text-base font-semibold tracking-[-0.3px]">AgroPredict</div>
            <div className="text-[11px] text-muted-foreground">La Libertad, Perú</div>
          </div>
        </div>

        <div className="px-4 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Navegación</div>

        <nav className="flex gap-2 overflow-x-auto px-4 py-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-medium transition-all lg:w-full',
                  isActive
                    ? 'border-ag-green-200 bg-ag-green-50 text-ag-green-700 shadow-sm'
                    : 'border-border bg-background text-muted-foreground hover:border-ag-green-200 hover:bg-ag-green-50 hover:text-foreground'
                )
              }
            >
              <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', item.to === '/dashboard' ? 'bg-ag-green-100 text-ag-green-700' : 'bg-muted text-muted-foreground')}>
                {item.icon ? <item.icon className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current opacity-50" />}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? <span className="rounded-full bg-ag-green-100 px-2 py-1 text-[10px] font-semibold text-ag-green-700">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-border p-4 lg:block">
          <div className="rounded-2xl border border-border bg-secondary p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ag-green-600 text-[11px] font-semibold text-white">{initials}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user?.name || 'Usuario'}</div>
                <div className="text-xs text-muted-foreground">{role || 'rol'}</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-xs text-muted-foreground">
              <span>Sesión activa</span>
              <span className="rounded-full bg-ag-green-50 px-2 py-1 text-[10px] font-medium text-ag-green-700">Online</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <span className="text-base leading-none">↩</span>
            Salir
          </button>
        </div>

        <div className="border-t border-border p-4 lg:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ag-green-600 text-[11px] font-semibold text-white">{initials}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name || 'Usuario'}</div>
              <div className="text-xs text-muted-foreground">{role || 'rol'}</div>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="mt-3 w-full rounded-2xl border border-border px-4 py-2.5 text-sm font-medium text-foreground">
            Salir
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ag-green-600 text-lg text-white">🌿</div>
            <div>
              <div className="text-sm font-semibold tracking-[-0.3px]">AgroPredict</div>
              <div className="text-[11px] text-muted-foreground">La Libertad, Perú</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground"
          >
            Salir
          </button>
        </header>

        <main className="mx-auto w-full max-w-275 flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
