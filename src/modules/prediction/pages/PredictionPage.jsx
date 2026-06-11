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
import { predictionService } from '../services/predictionService'

const MODEL_OPTIONS = [
  { id: 'sarimax', label: 'SARIMAX', color: '#1D9E75' },
  { id: 'svr', label: 'SVR', color: '#378ADD' },
  { id: 'lstm', label: 'LSTM', color: '#EF9F27' },
]

const FALLBACK_DESTINATIONS = ['UNITED STATES', 'NETHERLANDS', 'SPAIN', 'CHINA', 'UNITED KINGDOM']
const FALLBACK_SEASONS = ['Invierno', 'Otoño', 'Primavera', 'Verano']

const DEFAULT_FORM = {
  current_price: '',
  volume_exported: 18500,
  operations: 128,
  destination: 'UNITED STATES',
  season: 'Invierno',
  start_date: new Date().toISOString().slice(0, 10),
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
  return response?.ensemble?.final_price ?? response?.models?.find((item) => item.status === 'ok')?.final_price ?? null
}

export function PredictionPage() {
  const [horizon, setHorizon] = useState(4)
  const [selectedModels, setSelectedModels] = useState(MODEL_OPTIONS.map((item) => item.id))
  const [form, setForm] = useState(DEFAULT_FORM)
  const [modelStatus, setModelStatus] = useState([])
  const [inputOptions, setInputOptions] = useState({ destinations: FALLBACK_DESTINATIONS, seasons: FALLBACK_SEASONS, ranges: {}, latest_observations: {} })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [priceLoading, setPriceLoading] = useState(false)
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
    const payload = formPayload?.current_price === undefined ? form : formPayload

    setLoading(true)
    setError('')

    try {
      const response = await predictionService.compare({
        ...payload,
        current_price: payload.current_price === '' ? undefined : Number(payload.current_price),
        volume_exported: Number(payload.volume_exported),
        operations: Number(payload.operations),
        horizon,
        models: selectedModels,
      })
      if (payload.current_price === '' && response.current_price) {
        setForm((current) => ({ ...current, current_price: response.current_price }))
      }
      setResult(response)
    } catch (err) {
      setError(err.message || 'No se pudo ejecutar la prediccion')
    } finally {
      setLoading(false)
    }
  }

  const handleDestinationChange = async (destination) => {
    setPriceLoading(true)
    setError('')
    setResult(null)
    setForm((current) => ({ ...current, destination }))

    try {
      const latest = await predictionService.getLatestObservation(destination)
      setForm((current) => ({
        ...current,
        destination,
        current_price: latest.precio,
      }))
    } catch (err) {
      const cachedLatest = inputOptions.latest_observations?.[destination]
      if (cachedLatest) {
        setForm((current) => ({
          ...current,
          destination,
          current_price: cachedLatest.precio,
        }))
      } else {
        setError(err.message || 'No se pudo consultar el ultimo FOB historico')
      }
    } finally {
      setPriceLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    Promise.all([predictionService.getModels(), predictionService.getInputOptions()])
      .then(([modelsResponse, optionsResponse]) => {
        if (!mounted) return

        setModelStatus(modelsResponse)
        setInputOptions({
          destinations: optionsResponse.destinations?.length ? optionsResponse.destinations : FALLBACK_DESTINATIONS,
          seasons: optionsResponse.seasons?.length ? optionsResponse.seasons : FALLBACK_SEASONS,
          ranges: optionsResponse.ranges || {},
          latest_observations: optionsResponse.latest_observations || {},
        })

        const latest = optionsResponse.latest_observations?.[DEFAULT_FORM.destination]
        let nextForm

        if (latest) {
          nextForm = {
            ...DEFAULT_FORM,
            current_price: latest.precio,
          }
        } else {
          nextForm = {
            ...DEFAULT_FORM,
            current_price: 2.91,
          }
        }

        setForm(nextForm)
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'No se pudo consultar el estado de los modelos')
      })
      .finally(() => {
        if (mounted) setStatusLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const toggleModel = (model) => {
    setSelectedModels((current) => {
      if (current.includes(model) && current.length > 1) {
        return current.filter((item) => item !== model)
      }
      if (!current.includes(model)) {
        return [...current, model]
      }
      return current
    })
  }

  return (
    <PagePlaceholder
      id="F-03"
      title="Modelo predictivo de precios FOB"
      description="Comparacion de SARIMAX, SVR y LSTM para horizontes de 4, 6 y 8 semanas"
    >
      <div className="flex flex-col gap-4">
        <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
          <PriceSummary result={selectedResult} currentPrice={Number(form.current_price)} horizon={horizon} loading={loading} />
          <ControlPanel
            form={form}
            horizon={horizon}
            selectedModels={selectedModels}
            modelMap={modelMap}
            inputOptions={inputOptions}
            statusLoading={statusLoading}
            priceLoading={priceLoading}
            loading={loading}
            onFormChange={setForm}
            onDestinationChange={handleDestinationChange}
            onHorizonChange={setHorizon}
            onToggleModel={toggleModel}
            onRun={runPrediction}
          />
        </section>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-ag-red-100 bg-ag-red-50 px-4 py-3 text-sm text-ag-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        <ForecastChart result={result} currentPrice={Number(form.current_price)} />

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <ModelComparison result={result} modelMap={modelMap} />
          <AnalysisPanel result={result} currentPrice={Number(form.current_price)} />
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
          <MetricTile label={`Proyeccion ${horizon} sem.`} value={loading ? '...' : `${formatMoney(finalPrice)}/kg`} />
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
  selectedModels,
  modelMap,
  inputOptions,
  statusLoading,
  priceLoading,
  loading,
  onFormChange,
  onDestinationChange,
  onHorizonChange,
  onToggleModel,
  onRun,
}) {
  const updateField = (field, value) => {
    onFormChange((current) => ({ ...current, [field]: value }))
  }

  const priceRange = inputOptions.ranges?.precio_fob_por_kilogramo || {}
  const volumeRange = inputOptions.ranges?.volumen_exportado || {}
  const operationsRange = inputOptions.ranges?.operaciones || {}

  return (
    <Card>
      <CardContent className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Parametros predictivos</h2>
            <p className="text-xs text-muted-foreground">FOB semanal de palta Hass, destino y actividad exportadora.</p>
          </div>
          <Button type="button" onClick={() => onRun()} disabled={loading || priceLoading || selectedModels.length === 0} size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Ejecutar
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="FOB actual">
            <div className="relative">
              <Input
                type="number"
                min={priceRange.min}
                max={priceRange.max}
                step="0.01"
                value={form.current_price}
                onChange={(event) => updateField('current_price', Number(event.target.value))}
                disabled={priceLoading}
                className={priceLoading ? 'pr-9' : undefined}
              />
              {priceLoading ? <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" /> : null}
            </div>
          </Field>
          <Field label="Volumen exportado">
            <Input type="number" min={volumeRange.min} max={volumeRange.max} value={form.volume_exported} onChange={(event) => updateField('volume_exported', Number(event.target.value))} />
          </Field>
          <Field label="Operaciones">
            <Input type="number" min={operationsRange.min} max={operationsRange.max} value={form.operations} onChange={(event) => updateField('operations', Number(event.target.value))} />
          </Field>
          <Field label="Destino">
            <Select value={form.destination} onChange={(event) => onDestinationChange(event.target.value)}>
              {inputOptions.destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Temporada">
            <Select value={form.season} onChange={(event) => updateField('season', event.target.value)}>
              {inputOptions.seasons.map((season) => (
                <option key={season}>{season}</option>
              ))}
            </Select>
          </Field>
          <Field label="Semana inicial">
            <Input type="date" value={form.start_date} onChange={(event) => updateField('start_date', event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-2 text-xs font-semibold text-foreground">Horizonte</div>
            <div className="grid grid-cols-3 rounded-lg border border-border bg-secondary p-1">
              {[4, 6, 8].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onHorizonChange(item)}
                  className={cn(
                    'h-8 rounded-md text-xs font-semibold transition-colors',
                    horizon === item ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item} sem.
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-foreground">Modelos</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODEL_OPTIONS.map((model) => {
                const status = modelMap.get(model.id)
                const selected = selectedModels.includes(model.id)
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => onToggleModel(model.id)}
                    className={cn(
                      'flex h-16 items-center justify-between rounded-lg border px-3 text-left transition-colors',
                      selected ? 'border-primary bg-ag-green-50 text-ag-green-800' : 'border-border bg-card text-foreground hover:bg-secondary'
                    )}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{model.label}</span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        {statusLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : status?.available ? (
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-ag-red-400" />
                        )}
                        {statusLoading ? 'Consultando' : status?.available ? 'Disponible' : 'Pendiente'}
                      </span>
                    </span>
                    <span className={cn('h-3 w-3 rounded-full border', selected ? 'border-primary bg-primary' : 'border-input')} />
                  </button>
                )
              })}
            </div>
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

    return [...history, ...forecast]
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
