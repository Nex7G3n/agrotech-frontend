import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { DollarSign, FileBarChart2, History, LayoutDashboard, Leaf, Target, TrendingUp, Users } from 'lucide-react'
import { useAuth } from '../../modules/auth/context/AuthContext'
import { AuthSessionBridge } from '../../modules/auth/components/AuthSessionBridge'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard',      label: 'Inicio',                  icon: LayoutDashboard },
  { to: '/admin/users',    label: 'Usuarios',                icon: Users,         adminOnly: true },
  { to: '/simulator',      label: 'Rentabilidad',            icon: DollarSign,    badge: 'S-01' },
  { to: '/control-cases',  label: 'Simulador de campañas',   icon: Target,        badge: 'S-02' },
  { to: '/prediction',     label: 'Predicción',              icon: TrendingUp,    badge: 'S-03' },
  { to: '/historical',     label: 'Histórico',               icon: History,       badge: 'S-04'   }, 
  { to: '/reports',        label: 'Reportes',                icon: FileBarChart2, badge: 'S-05' },
  { to: '/campaigns',      label: 'Campañas',                icon: Leaf,            },
]

export function AppShell() {
  const navigate = useNavigate()
  const { user, role, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    return !item.role || item.role === role
  })
  const initials = (user?.name || 'Usuario')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground lg:flex">
      <AuthSessionBridge />
      <aside className="sticky top-0 z-50 flex w-full max-h-screen flex-col border-b border-border bg-card lg:h-screen lg:w-72 lg:max-h-none lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ag-green-600 text-lg text-white">🌿</div>
          <div>
            <div className="text-base font-semibold tracking-[-0.3px]">AgroPredict</div>
            <div className="text-[11px] text-muted-foreground">La Libertad, Perú</div>
          </div>
        </div>

        <div className="shrink-0 px-4 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Navegación</div>

        <nav className="nav-scroll flex min-h-0 shrink gap-0.5 overflow-x-auto px-3 py-2 lg:flex-1 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-all lg:w-full',
                  isActive
                    ? 'bg-ag-green-50 text-ag-green-700'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-ag-green-100 text-ag-green-700' : 'bg-muted text-muted-foreground'
                  )}>
                    {item.icon ? <item.icon className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className={cn(
                      'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                      isActive ? 'bg-ag-green-100 text-ag-green-700' : 'bg-muted text-muted-foreground'
                    )}>{item.badge}</span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 border-t border-border px-4 py-3 lg:block">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ag-green-600 text-[11px] font-semibold text-white">{initials}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-foreground">{user?.name || 'Usuario'}</div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ag-green-500" />
                <span className="text-[11px] text-muted-foreground capitalize">{role || 'usuario'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="text-sm leading-none">↩</span>
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4 lg:hidden">
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
