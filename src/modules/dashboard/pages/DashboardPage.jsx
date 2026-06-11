import { useAuth } from '../../auth/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { PagePlaceholder } from '@/shared/components/PagePlaceholder'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <PagePlaceholder title="Inicio" description="Resumen general de tu cuenta AgroPredict">
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-foreground">Bienvenido, {user?.name || 'usuario'}</h2>
          <p className="text-sm text-muted-foreground">Esta es la vista privada principal del sistema.</p>
        </CardContent>
      </Card>
    </PagePlaceholder>
  )
}
