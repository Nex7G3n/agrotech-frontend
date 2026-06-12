import { useAuth } from '../../auth/context/AuthContext'
import { BarChart3, BellRing, Leaf, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">Inicio</span>
        <span className="text-sm font-medium text-foreground">Panel principal</span>
        <span className="ml-auto text-xs text-muted-foreground">Resumen general de tu cuenta AgroPredict</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Leaf} label="Campaña activa" value="2026 - Q2" sub="Ventana comercial" />
        <Metric icon={TrendingUp} label="Precio FOB predicho" value="US$ 3.15" sub="4 semanas" />
        <Metric icon={Users} label="Usuarios activos" value="63" sub="En el sistema" />
        <Metric icon={BellRing} label="Alertas hoy" value="7" sub="3 sin leer" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card>
          <CardContent className="gap-4 p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Bienvenido, {user?.name || 'usuario'}</h2>
              <p className="text-sm text-muted-foreground">Esta es la vista privada principal del sistema.</p>
            </div>

            <div className="rounded-2xl border border-ag-green-100 bg-ag-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-3 text-ag-green-700"><BarChart3 className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-ag-green-800">Actividad reciente</p>
                  <p className="text-xs text-ag-green-700">Predicción, histórico, simulación y alertas están disponibles desde el sidebar.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-3 p-6">
            <h3 className="text-base font-semibold">Accesos rápidos</h3>
            <QuickLink title="Predicción" desc="Ver precio FOB" />
            <QuickLink title="Simulador" desc="Calcular rentabilidad" />
            <QuickLink title="Usuarios" desc="Gestionar cuentas" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-4 p-5">
        <div className="rounded-xl bg-ag-green-50 p-3 text-ag-green-600"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickLink({ title, desc }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  )
}
