import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowRight, BarChart3, CheckCircle2, Leaf, LineChart, Loader2, Sparkles, Target, TrendingUp } from 'lucide-react'

import { useAuth } from '../../auth/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { systemService } from '@/shared/services/systemService'

const STATUS_TONE = {
  ok: 'bg-ag-green-50 text-ag-green-700 border-ag-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
}

const MODULE_OBJECTIVE = {
  predictivo: 'Objetivo 2 — Predictivo',
  prescriptivo: 'Objetivo 1 — Prescriptivo',
  descriptivo: 'Objetivo 3 — Descriptivo',
}

const QUICK_LINKS = [
  { to: '/prediction', label: 'Prediccion FOB', icon: TrendingUp },
  { to: '/simulator', label: 'Rentabilidad', icon: Target },
  { to: '/control-cases', label: 'Escenarios', icon: BarChart3 },
  { to: '/reports', label: 'Reportes', icon: LineChart },
  { to: '/historical', label: 'Historico', icon: Leaf },
]

export function DashboardPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    systemService
      .getStatus()
      .then(setStatus)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const predictModule = status?.modules?.find((item) => item.id === 'predict')
  const profitModule = status?.modules?.find((item) => item.id === 'profitability')
  const reportsModule = status?.modules?.find((item) => item.id === 'reports')

  const moduleSummary = useMemo(() => {
    if (!status?.modules) return { ok: 0, warning: 0, error: 0 }
    return status.modules.reduce(
      (acc, module) => {
        acc[module.status] = (acc[module.status] || 0) + 1
        return acc
      },
      { ok: 0, warning: 0, error: 0 },
    )
  }, [status])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">Inicio</span>
        <span className="text-sm font-medium text-foreground">Panel principal</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {status?.overall === 'ok' ? 'Sistema listo para demo end-to-end' : 'Revisa el estado de los modulos'}
        </span>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : null}

      {loading ? (
        <div className="py-16 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : null}

      {status ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric icon={Leaf} label="Registros historicos" value={status.database_records.toLocaleString('es-PE')} sub={status.historical_years.length ? `${status.historical_years[0]}–${status.historical_years.at(-1)}` : 'Sin anos'} />
            <Metric icon={BarChart3} label="Prediccion FOB" value={predictModule?.message?.split('·')[0]?.replace('Consenso ', '') || '—'} sub="Consenso 4 sem." />
            <Metric icon={Sparkles} label="Asesor IA" value={status.ai_advisor_enabled ? 'Activo' : 'Reglas'} sub={status.ai_provider || 'Sin clave API'} />
            <Metric icon={CheckCircle2} label="Rentabilidad" value={profitModule?.message?.split('·')[0]?.replace('Recomendacion: ', '') || '—'} sub="Escenario de prueba" />
            <Metric icon={LineChart} label="Modulos OK" value={`${moduleSummary.ok}/${status.modules.length}`} sub={`${moduleSummary.warning} aviso · ${moduleSummary.error} error`} />
          </div>

          <Card>
            <CardContent className="gap-3 p-5">
              <h3 className="text-sm font-semibold text-foreground">Accesos rapidos</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {QUICK_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-ag-green-200 hover:bg-ag-green-50/60"
                  >
                    <item.icon className="h-4 w-4 text-ag-green-600" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="gap-4 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Bienvenido, {user?.name || 'usuario'}</h2>
                  <p className="text-sm text-muted-foreground">Flujo integrado de la tesis: prediccion → rentabilidad → escenarios → reportes historicos.</p>
                </div>

                <div className="rounded-xl border border-ag-green-100 bg-ag-green-50/60 px-4 py-3 text-sm text-ag-green-800">
                  <p className="font-semibold">Resumen descriptivo</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    {reportsModule?.message || 'Reportes de ciclos disponibles desde F-07.'}
                  </p>
                </div>

                <div className="space-y-3">
                  {status.demo_flow.map((step) => (
                    <Link
                      key={step.step}
                      to={step.route}
                      className="group flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:border-ag-green-200 hover:bg-ag-green-50/50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ag-green-100 text-sm font-bold text-ag-green-700">{step.step}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ag-green-700">{MODULE_OBJECTIVE[step.module] || step.module}</p>
                        <p className="text-sm font-semibold text-foreground">{step.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-ag-green-600" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="gap-3 p-6">
                <h3 className="text-base font-semibold">Estado del sistema</h3>
                <p className="text-xs text-muted-foreground">Verificacion automatica de modulos para demo y defensa.</p>
                <div className="space-y-2">
                  {status.modules.map((module) => (
                    <div key={module.id} className={`rounded-xl border px-3 py-2.5 text-xs ${STATUS_TONE[module.status] || STATUS_TONE.warning}`}>
                      <p className="font-semibold">{module.name}</p>
                      <p className="mt-0.5 opacity-90">{module.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-4 p-5">
        <div className="rounded-xl bg-ag-green-50 p-3 text-ag-green-600"><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}
