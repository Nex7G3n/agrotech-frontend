import { AlertTriangle, BarChart3, CheckCircle2, Clock3, DollarSign, Leaf, Lightbulb, TrendingDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const chartPoints = [
  { label: 'P10', value: 2.78 },
  { label: 'P25', value: 2.96 },
  { label: 'P50', value: 3.15 },
  { label: 'P75', value: 3.33 },
  { label: 'P90', value: 3.52 },
]

const EXPECTED_RENTABILITY = {
  roi: 51.3,
  risk: 'Medio',
  profit: 'S/ 29,085',
  confidence: 87,
  breakEven: 1.15,
  predictedPrice: 3.15,
}

const recommendation = EXPECTED_RENTABILITY.roi >= 25
  ? {
      label: 'SEMBRAR',
      tone: 'green',
      description: 'La rentabilidad esperada supera el umbral mínimo y el precio predicho mantiene margen sobre el punto de equilibrio.',
    }
  : EXPECTED_RENTABILITY.roi >= 5
    ? {
        label: 'REDUCIR ÁREA',
        tone: 'amber',
        description: 'La campaña aún puede ser rentable, pero el margen esperado no justifica ampliar área de siembra.',
      }
    : {
        label: 'ESPERAR',
        tone: 'red',
        description: 'La rentabilidad esperada no compensa el riesgo operativo ni la exposición al precio FOB.',
      }

const justificationItems = [
  `Precio FOB predicho (US$ ${EXPECTED_RENTABILITY.predictedPrice.toFixed(2)}/kg) supera el punto de equilibrio de US$ ${EXPECTED_RENTABILITY.breakEven.toFixed(2)}/kg.`,
  `Rentabilidad esperada positiva: ROI ${EXPECTED_RENTABILITY.roi.toFixed(1)}% y ganancia estimada ${EXPECTED_RENTABILITY.profit}.`,
  'Historial 2022-2024 muestra mejor desempeño en Q2 con ventana comercial favorable hacia julio-agosto.',
]

export function SimulatorPage() {
  const chartMax = useMemo(() => Math.max(...chartPoints.map((p) => p.value)), [])
  const [showResults, setShowResults] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-05</span>
        <span className="text-sm font-medium text-foreground">Simulador de rentabilidad por campaña</span>
        <span className="ml-auto text-xs text-muted-foreground">Permite seleccionar escenarios y calcular ganancia esperada por hectárea</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-ag-green-100 bg-gradient-to-br from-ag-green-50 to-white">
          <CardContent className="gap-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-ag-green-600">Datos de campaña</p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">Calcula rentabilidad esperada</h2>
              </div>
              <div className="rounded-xl bg-ag-green-100 p-3 text-ag-green-700"><Leaf className="h-5 w-5" /></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Hectáreas" defaultValue="5" />
              <Field label="Productividad (t/ha)" defaultValue="4.2" />
              <Field label="Costo prod. (US$/kg)" defaultValue="0.85" />
              <Field label="Flete estimado (US$/kg)" defaultValue="0.30" />
              <Field label="Precio FOB predicho" defaultValue="3.15" />
              <Field label="Campaña" defaultValue="2026 - Q2" />
              <Field label="Región" defaultValue="La Libertad" />
              <Field label="Distrito" defaultValue="Virú" />
            </div>

            <Button className="w-full" onClick={() => setShowResults(true)}>Calcular escenarios</Button>
          </CardContent>
        </Card>

        {showResults ? (
          <Card>
            <CardContent className="gap-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Resumen de campaña</p>
                  <p className="text-xs text-muted-foreground">Resultado simulado del escenario calculado</p>
                </div>
                <div className="rounded-xl bg-ag-green-50 p-3 text-ag-green-600"><DollarSign className="h-5 w-5" /></div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Producción total" value="21.0 t" />
                <Metric label="Inversión estimada" value="S/ 56,700" />
                <Metric label="Punto equilibrio" value="US$ 1.15" sub="/kg" />
                <Metric label="Riesgo" value="Medio" accent="amber" />
              </div>

              <div className="rounded-xl border border-ag-green-100 bg-ag-green-50 p-4 text-sm text-ag-green-700">
                Precio predicho US$ 3.15/kg supera ampliamente el punto de equilibrio.
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Rango de precios esperado</p>
                    <p className="text-xs text-muted-foreground">Distribución estimada para la campaña</p>
                  </div>
                  <span className="rounded-full bg-ag-green-50 px-2.5 py-1 text-[11px] font-semibold text-ag-green-700">US$ / kg</span>
                </div>
                <div className="flex h-44 items-end gap-3 rounded-xl bg-muted/30 p-4">
                  {chartPoints.map((point) => (
                    <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-xl bg-ag-green-600" style={{ height: `${(point.value / chartMax) * 100}%`, minHeight: 18 }} />
                      <div className="text-[11px] font-medium text-muted-foreground">{point.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 text-[11px] text-muted-foreground">
                  {chartPoints.map((point) => (
                    <div key={point.label} className="text-center">
                      {point.label}: {point.value.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="items-center justify-center gap-2 p-10 text-center">
              <p className="text-sm font-medium text-foreground">Sin escenario calculado</p>
              <p className="max-w-sm text-xs text-muted-foreground">Completa los datos de campaña y presiona `Calcular escenarios` para ver resumen, rango de precios y recomendación.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showResults ? (
        <Card className="overflow-hidden border-ag-green-100 bg-gradient-to-r from-ag-green-50 to-white">
          <CardContent className="gap-5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-ag-green-100 p-3 text-ag-green-700"><Lightbulb className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-ag-green-600">Recomendación automática</p>
                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{recommendation.label}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{recommendation.description}</p>
                </div>
              </div>

              <div className="grid min-w-72 grid-cols-3 gap-2">
                <RecStat label="Confianza" value={`${EXPECTED_RENTABILITY.confidence}%`} />
                <RecStat label="Riesgo" value={EXPECTED_RENTABILITY.risk} />
                <RecStat label="ROI" value={`+${EXPECTED_RENTABILITY.roi.toFixed(0)}%`} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Justificación por rentabilidad</h3>
                <div className="space-y-3">
                  {justificationItems.map((item) => (
                    <div key={item} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ag-green-50 text-ag-green-600"><CheckCircle2 className="h-4 w-4" /></div>
                      <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500"><AlertTriangle className="h-4 w-4" /></div>
                    <p className="text-sm leading-6 text-muted-foreground">Monitorear sobreoferta regional y variaciones de flete antes de confirmar expansión de área.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Opciones según resultado</h3>
                <OptionCard icon={BarChart3} title="Sembrar" status={recommendation.label === 'SEMBRAR' ? 'Recomendado' : 'Evaluado'} text="Aplica cuando ROI esperado supera 25% y el precio predicho está sobre el equilibrio." />
                <OptionCard icon={TrendingDown} title="Reducir área" status={recommendation.label === 'REDUCIR ÁREA' ? 'Recomendado' : 'No aplica'} text="Se activa con ROI bajo pero todavía positivo, para limitar exposición." />
                <OptionCard icon={Clock3} title="Esperar" status={recommendation.label === 'ESPERAR' ? 'Recomendado' : 'No aplica'} text="Se activa cuando ROI es negativo o el margen no compensa el riesgo." />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function Field({ label, defaultValue }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ag-green-700">{label}</label>
      <Input defaultValue={defaultValue} className="border-ag-green-100 bg-white text-foreground placeholder:text-muted-foreground focus-visible:bg-card" />
    </div>
  )
}

function Metric({ label, value, sub, accent }) {
  const accentClass = accent === 'amber' ? 'text-amber-600' : 'text-foreground'

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accentClass}`}>{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function RecStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-ag-green-100 bg-white p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function OptionCard({ icon: Icon, title, status, text }) {
  return (
    <div className="mb-3 rounded-xl border border-border p-3 last:mb-0">
      <div className="mb-1.5 flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="flex-1 text-sm font-medium text-foreground">{title}</p>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">{status}</span>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  )
}
