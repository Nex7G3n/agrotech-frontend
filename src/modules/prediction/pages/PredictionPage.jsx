import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  LineChart,
  Loader2,
  Play,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend as RechartsLegend,
  Line,
  LineChart as RechartsLineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PagePlaceholder } from '@/shared/components/PagePlaceholder'
import { ShareResultsMenu } from '@/shared/components/ShareResultsMenu'
import { predictionService } from '../services/predictionService'

const HORIZON_OPTIONS = [
  { value: 4, label: '4 sem.' },
  { value: 6, label: '6 sem.' },
  { value: 8, label: '8 sem.' },
]

const HORIZON_LABELS = Object.fromEntries(HORIZON_OPTIONS.map((item) => [item.value, item.label]))
const FALLBACK_DESTINATIONS = ['UNITED STATES', 'NETHERLANDS', 'SPAIN', 'CHINA', 'UNITED KINGDOM']
const DEFAULT_FORM = {
  destination: 'UNITED STATES',
  reference_date: '',
}

function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/D'
  return `US$ ${Number(value).toFixed(2)}`
}

function formatPercent(value) {
  if (value === null || value === undefined) return 'N/D'
  return `${Number(value).toFixed(0)}%`
}

function trendLabel(trend) {
  if (trend === 'up') return 'Alza'
  if (trend === 'down') return 'Baja'
  return 'Estable'
}

function trendIcon(trend) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4" />
  return <Activity className="h-4 w-4" />
}

function selectFinal(response) {
  return response?.models?.find((item) => item.model === 'ridge' && item.status === 'ok')?.final_price
    ?? response?.ensemble?.final_price
    ?? response?.models?.find((item) => item.status === 'ok')?.final_price
    ?? null
}

export function PredictionPage() {
  const [horizon, setHorizon] = useState(4)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [modelStatus, setModelStatus] = useState([])
  const [inputOptions, setInputOptions] = useState({ destinations: FALLBACK_DESTINATIONS, latest_observations: {} })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedResult = useMemo(() => {
    if (!result) return null
    return {
      finalPrice: selectFinal(result),
      confidence: result.ensemble?.confidence ?? Math.max(...result.models.map((item) => item.confidence || 0)),
      trend: result.ensemble?.trend ?? result.models.find((item) => item.status === 'ok')?.trend,
    }
  }, [result])

  const modelMap = useMemo(() => new Map(modelStatus.map((item) => [item.model, item])), [modelStatus])

  const runPrediction = async (formPayload) => {
    const payload = formPayload || form
    if (!payload.destination || !horizon || !payload.reference_date) {
      setError('Completa destino, horizonte y fecha de referencia.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await predictionService.compare({
        destination: payload.destination,
        reference_date: payload.reference_date || undefined,
        horizon,
      })
      setResult(response)
    } catch (err) {
      setError(err.message || 'No se pudo ejecutar la prediccion')
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationChange = async (destination) => {
    setError('')
    setResult(null)
    setForm((current) => ({ ...current, destination }))
  }

  useEffect(() => {
    let mounted = true

    Promise.all([predictionService.getModels(), predictionService.getInputOptions()])
      .then(([modelsResponse, optionsResponse]) => {
        if (!mounted) return

        setModelStatus(modelsResponse)
        setInputOptions({
          destinations: optionsResponse.destinations?.length ? optionsResponse.destinations : FALLBACK_DESTINATIONS,
          latest_observations: optionsResponse.latest_observations || {},
        })
        setForm(DEFAULT_FORM)
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'No se pudo consultar el estado de los modelos')
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <PagePlaceholder
      id="Predicción"
      title="Modelo predictivo de precios FOB"
      description="Comparación de Ridge, Random Forest y HistGradientBoosting para horizontes de 4, 6 y 8 semanas"
    >
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <PriceSummary result={selectedResult} currentPrice={result?.current_price || 0} horizon={horizon} loading={loading} />
          <ControlPanel
            form={form}
            horizon={horizon}
            modelMap={modelMap}
            inputOptions={inputOptions}
            loading={loading}
            onFormChange={setForm}
            onDestinationChange={handleDestinationChange}
            onHorizonChange={setHorizon}
            onRun={runPrediction}
          />
        </section>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-ag-red-100 bg-ag-red-50 px-4 py-3 text-sm text-ag-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        <ForecastChart result={result} currentPrice={result?.current_price || 0} />

        {result?.historical_comparison ? (
          <HistoricalComparisonPanel comparison={result.historical_comparison} />
        ) : null}

        <ModelMetricsPanel modelStatus={modelStatus} />

        {result?.models?.some((item) => item.status !== 'ok' && item.error_analysis?.length) ? (
          <ErrorAnalysisPanel models={result.models} />
        ) : null}

        {result ? (
          <ShareResultsMenu
            module="prediction"
            buildPayload={() => ({
              destination: form.destination,
              reference_date: form.reference_date || undefined,
              horizon,
            })}
          />
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <ModelComparison result={result} modelMap={modelMap} />
          <AnalysisPanel result={result} currentPrice={result?.current_price || 0} />
        </section>
      </div>
    </PagePlaceholder>
  )
}

function PriceSummary({ result, currentPrice, horizon, loading }) {
  const finalPrice = result?.finalPrice
  const variation = finalPrice ? ((finalPrice - currentPrice) / currentPrice) * 100 : 0
  const trend = result?.trend || 'stable'

  return (
    <Card className="bg-ag-green-800 text-white">
      <CardContent className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ag-green-100">Precio FOB actual</div>
            <div className="mt-1 flex items-end gap-1 text-4xl font-bold leading-none">
              {formatMoney(currentPrice)}
              <span className="mb-1 text-sm font-medium text-ag-green-100">/kg</span>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold',
              trend === 'down' ? 'bg-ag-red-50 text-ag-red-600' : 'bg-white/15 text-white'
            )}
          >
            {trendIcon(trend)}
            {variation >= 0 ? '+' : ''}
            {variation.toFixed(1)}%
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile label={`Proyeccion ${HORIZON_LABELS[horizon] || `${horizon} sem.`}`} value={loading ? '...' : `${formatMoney(finalPrice)}/kg`} />
          <MetricTile label="Confianza" value={loading ? '...' : formatPercent(result?.confidence)} />
          <MetricTile label="Tendencia" value={loading ? '...' : trendLabel(trend)} />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricTile({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ag-green-100">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function ControlPanel({
  form,
  horizon,
  inputOptions,
  loading,
  onFormChange,
  onDestinationChange,
  onHorizonChange,
  onRun,
}) {
  const updateField = (field, value) => {
    onFormChange((current) => ({ ...current, [field]: value }))
  }

  return (
    <Card>
      <CardContent className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Parametros predictivos</h2>
            <p className="text-xs text-muted-foreground">El histórico y las variables temporales se obtienen automáticamente.</p>
          </div>
          <Button type="button" onClick={() => onRun()} disabled={loading || !form.destination || !horizon || !form.reference_date} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Ejecutar
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Destino">
            <Select value={form.destination} onChange={(event) => onDestinationChange(event.target.value)}>
              {inputOptions.destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha de referencia">
            <Input type="date" required value={form.reference_date} onChange={(event) => updateField('reference_date', event.target.value)} />
          </Field>
          <div>
            <div className="mb-2 text-xs font-semibold text-foreground">Horizonte predictivo</div>
            <select
              className="flex h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary"
              value={horizon}
              onChange={(event) => onHorizonChange(Number(event.target.value))}
            >
              {HORIZON_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-muted-foreground">Horizontes validados: 4, 6 y 8 semanas calendario.</p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  )
}

function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'flex h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-primary/15',
        className
      )}
      {...props}
    />
  )
}

function ForecastChart({ result, currentPrice }) {
  const chartData = useMemo(() => {
    if (!result) {
      return []
    }

    const history = result.historical.map((item, index) => ({
      label: `H${index + 1}`,
      date: item.date,
      historical: item.value,
      value: item.value,
      type: 'Historico',
    }))

    const forecast = (result.ensemble?.forecast || result.models.find((item) => item.status === 'ok')?.forecast || []).map((item) => ({
      label: `S${item.week}`,
      date: item.date,
      forecast: item.value,
      value: item.value,
      type: 'Prediccion',
    }))

    const chart = [...history, ...forecast]

    if (history.length > 0 && forecast.length > 0) {
      chart[history.length - 1] = {
        ...chart[history.length - 1],
        bridge: history[history.length - 1].historical,
      }
      chart[history.length] = {
        ...chart[history.length],
        bridge: forecast[0].forecast,
      }
    }

    return chart
  }, [result])

  const values = chartData.flatMap((item) => [item.historical, item.forecast]).filter((value) => Number.isFinite(value))
  const min = Math.max(0, Math.min(...values, currentPrice) - 0.15)
  const max = Math.max(...values, currentPrice) + 0.15

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Precio FOB historico + prediccion</h2>
          </div>
          <p className="text-xs text-muted-foreground">Tooltip y animacion de la serie historica + consenso</p>
        </div>

        <div className="mt-3 h-72 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="#E8E6DF" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#5C5A54', fontSize: 11 }} axisLine={{ stroke: '#CCCAC0' }} tickLine={false} />
              <YAxis
                domain={[min, max]}
                tickFormatter={(value) => value.toFixed(2)}
                tick={{ fill: '#5C5A54', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<ForecastTooltip />} cursor={{ stroke: '#0F6E56', strokeDasharray: '4 4' }} />
              <RechartsLegend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
              <ReferenceLine y={currentPrice} stroke="#9A9890" strokeDasharray="5 5" ifOverflow="extendDomain" />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historico"
                stroke="#9FE1CB"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: '#1D9E75' }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#1D9E75', stroke: '#FFFFFF' }}
                connectNulls={false}
                isAnimationActive
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="bridge"
                name="Transicion"
                stroke="#7A7C73"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Consenso"
                stroke="#1D9E75"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: '#0F6E56' }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#0F6E56', stroke: '#FFFFFF' }}
                connectNulls={false}
                isAnimationActive
                animationBegin={150}
                animationDuration={900}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const point = payload.find((item) => item.payload)?.payload
  const value = point?.forecast ?? point?.historical ?? point?.value

  return (
    <div className="min-w-42 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{label}</div>
      <div className="mt-1 text-muted-foreground">{point?.date || point?.type || 'Punto'}</div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-muted-foreground">FOB</span>
        <span className="font-mono font-semibold text-foreground">{formatMoney(value)}/kg</span>
      </div>
    </div>
  )
}

function ModelComparison({ result, modelMap }) {
  const rows = result?.models || []

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Comparativo de modelos</h2>
        </div>

        <div className="mt-2 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Modelo</th>
                <th className="px-3 py-2 font-semibold">Precio</th>
                <th className="px-3 py-2 font-semibold">Confianza</th>
                <th className="px-3 py-2 font-semibold">Tendencia</th>
                <th className="px-3 py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={5}>
                    Sin ejecucion registrada
                  </td>
                </tr>
              ) : (
                rows.map((item) => {
                  const status = modelMap.get(item.model)
                  return (
                    <tr key={item.model}>
                      <td className="px-3 py-3 font-semibold text-foreground">{item.label}</td>
                      <td className="px-3 py-3 font-mono text-foreground">{formatMoney(item.final_price)}</td>
                      <td className="px-3 py-3 text-foreground">{formatPercent(item.confidence)}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-foreground">
                          {trendIcon(item.trend)}
                          {trendLabel(item.trend)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          title={item.message || status?.message || ''}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
                            item.status === 'ok' ? 'bg-ag-green-50 text-ag-green-600' : 'bg-ag-red-50 text-ag-red-600'
                          )}
                        >
                          {item.status === 'ok' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          {item.status === 'ok' ? 'OK' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelMetricsPanel({ modelStatus }) {
  if (!modelStatus?.length) return null

  return (
    <Card className="border-border">
      <CardContent>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Metricas de evaluacion (hold-out)</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">MAE y RMSE en US$/kg sobre el conjunto de prueba semanal FOB.</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {modelStatus.map((item) => {
            const metrics = item.metadata?.metrics || item.metadata || {}
            return (
              <div key={item.model} className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{item.available ? 'Disponible' : 'No disponible'}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">MAE</p>
                    <p className="font-mono font-semibold text-foreground">{metrics.mae != null ? metrics.mae.toFixed(3) : 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RMSE</p>
                    <p className="font-mono font-semibold text-foreground">{metrics.rmse != null ? metrics.rmse.toFixed(3) : 'N/D'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorAnalysisPanel({ models }) {
  const failed = models.filter((item) => item.status !== 'ok' && item.error_analysis?.length)

  if (!failed.length) return null

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardContent>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <h2 className="text-base font-semibold text-foreground">Analisis de errores</h2>
        </div>
        <div className="mt-3 space-y-3">
          {failed.map((item) => (
            <div key={item.model} className="rounded-xl border border-amber-200 bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
                {item.error_analysis.map((line) => (
                  <li key={line} className="leading-relaxed">• {line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HistoricalComparisonPanel({ comparison }) {
  const rows = [
    {
      label: 'Precio predicho (consenso)',
      value: comparison.precio_predicho_usd_kg,
      delta: comparison.variacion_predicho_vs_promedio_mes_pct,
      ref: `vs prom. ${comparison.mes_referencia}`,
    },
    {
      label: 'Precio actual (último FOB)',
      value: comparison.precio_actual_usd_kg,
      delta: comparison.variacion_actual_vs_promedio_mes_pct,
      ref: `vs prom. ${comparison.mes_referencia}`,
    },
    {
      label: `Promedio histórico de ${comparison.mes_referencia}`,
      value: comparison.promedio_historico_mes_usd_kg,
      delta: null,
      ref: `${comparison.anios_con_datos_mes} años con datos`,
    },
    {
      label: 'Promedio móvil 12 meses',
      value: comparison.promedio_12_meses_usd_kg,
      delta: comparison.variacion_predicho_vs_promedio_12m_pct,
      ref: 'vs predicho',
    },
    {
      label: `Mismo mes ${comparison.fecha_objetivo?.slice?.(0, 4) ? Number(comparison.fecha_objetivo.slice(0, 4)) - 1 : 'año ant.'}`,
      value: comparison.promedio_mismo_mes_anio_anterior_usd_kg,
      delta: null,
      ref: 'año anterior',
    },
  ].filter((row) => row.value != null)

  return (
    <Card className="border-ag-green-100">
      <CardContent>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-ag-green-600" />
              <h2 className="text-base font-semibold text-foreground">Predicho vs histórico</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {comparison.destino} · mes objetivo {comparison.mes_referencia} (horizonte de predicción)
            </p>
          </div>
          {comparison.variacion_predicho_vs_actual_pct != null ? (
            <span className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              comparison.variacion_predicho_vs_actual_pct >= 0 ? 'bg-ag-green-50 text-ag-green-700' : 'bg-red-50 text-red-600',
            )}
            >
              Predicho {comparison.variacion_predicho_vs_actual_pct >= 0 ? '+' : ''}{comparison.variacion_predicho_vs_actual_pct}% vs actual
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{row.label}</p>
              <p className="mt-1 font-mono text-xl font-semibold text-foreground">{formatMoney(row.value)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {row.delta != null ? (
                  <span className={row.delta >= 0 ? 'text-ag-green-600' : 'text-red-600'}>
                    {row.delta >= 0 ? '+' : ''}{row.delta}% {row.ref}
                  </span>
                ) : (
                  row.ref
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {(comparison.interpretacion || []).map((item) => (
            <p key={item} className="rounded-lg border border-ag-green-100 bg-ag-green-50 px-3 py-2 text-sm leading-relaxed text-ag-green-800">
              {item}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalysisPanel({ result, currentPrice }) {
  const finalPrice = selectFinal(result)
  const delta = finalPrice ? ((finalPrice - currentPrice) / currentPrice) * 100 : 0

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Analisis predictivo</h2>
        </div>

        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-secondary px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Consenso
            </div>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{formatMoney(finalPrice)}</div>
            <div className={cn('mt-1 text-xs font-medium', delta >= 0 ? 'text-ag-green-600' : 'text-ag-red-600')}>
              {delta >= 0 ? '+' : ''}
              {delta.toFixed(1)}% vs. actual
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modelos activos</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
              {(result?.models || []).filter((item) => item.status === 'ok').length}/{result?.models?.length || 0}
            </div>
            <div className="mt-1 text-xs font-medium text-muted-foreground">SARIMAX, SVR, LSTM</div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {(result?.analysis || ['Ejecuta la prediccion para generar el analisis comparativo.']).map((item) => (
            <p key={item} className="rounded-lg border border-ag-green-100 bg-ag-green-50 px-3 py-2 text-sm leading-relaxed text-ag-green-800">
              {item}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
