import { useAuth } from '../../auth/context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="panel-card">
      <p className="eyebrow">Inicio</p>
      <h2>Bienvenido, {user?.name || 'usuario'}</h2>
      <p className="muted">Esta es la vista privada principal del sistema.</p>
    </section>
  )
}
