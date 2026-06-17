import { AlertCircle, BrainCircuit, CheckCircle2, Clock3, DollarSign, Leaf, Lightbulb, Loader2, Sparkles, TrendingDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { profitabilityService } from '@/modules/profitability/services/profitabilityService'
import { predictionService } from '@/modules/prediction/services/predictionService'

const INITIAL_FORM = {
  precio_fob_usd_kg: 2.0,
  rendimiento_kg_ha: 8500,
  porcentaje_vendido: 95,
  costo_produccion_usd_kg: 0.85,
  flete_usd_kg: 0.30,
  region: 'LA LIBERTAD',
  provincia: 'VIRU',
  tipo_conduccion_cultivo: 'Homogeneo',
  sequia: 'No',
  plagas_enfermedades: 'No',
  hectares: 5,
}

const PREDICTION_DEFAULTS = {
  destination: 'UNITED STATES',
  season: 'Invierno',
  horizon: 4,
  volume_exported: 18500,
  operations: 128,
}

const SCENARIO_TONE = {
  Alto: 'bg-ag-green-50 text-ag-green-700',
  Medio: 'bg-amber-50 text-amber-600',
  Bajo: 'bg-red-50 text-red-600',
}

const RECOMMENDATION_ICON = {
  SEMBRAR: CheckCircle2,
  'REDUCIR ÁREA': TrendingDown,
  MANTENER: Clock3,
  ESPERAR: Clock3,
}

const METRIC_LABELS = {
  r2: 'R²',
  mae: 'MAE',
  accuracy: 'Accuracy',
  precision: 'Precisión',
  recall: 'Recall',
  roc_auc: 'ROC-AUC',
}

const TARGET_LABELS = {
  margen_exportador_soles_kg: 'Margen del exportador (S//kg)',
  riesgo_margen_bajo: 'Riesgo de margen bajo',
}

export function SimulatorPage() {
  const [options, setOptions] = useState(null)
  const [predictOptions, setPredictOptions] = useState(null)
  const [models, setModels] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [prediction, setPrediction] = useState(PREDICTION_DEFAULTS)
  const [usePredictedFob, setUsePredictedFob] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    profitabilityService
      .getOptions()
      .then(setOptions)
      .catch((err) => setError(err.message))
    profitabilityService
      .getModels()
      .then(setModels)
      .catch(() => {})
    predictionService
      .getInputOptions()
      .then((data) => {
        setPredictOptions(data)
        const latest = data.latest_observations?.['UNITED STATES']
        setPrediction((current) => ({
          ...current,
          destination: data.destinations?.[0] || current.destination,
          season: data.seasons?.[0] || current.season,
          volume_exported: latest?.volumen_exportado || current.volume_exported,
          operations: latest?.operaciones || current.operations,
        }))
      })
      .catch(() => {})
  }, [])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updatePrediction = (key, value) => setPrediction((current) => ({ ...current, [key]: value }))

  const calculate = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        rendimiento_kg_ha: Number(form.rendimiento_kg_ha),
        porcentaje_vendido: Number(form.porcentaje_vendido),
        costo_produccion_usd_kg: Number(form.costo_produccion_usd_kg),
        flete_usd_kg: Number(form.flete_usd_kg),
        hectares: Number(form.hectares),
        use_predicted_fob: usePredictedFob,
        destination: prediction.destination,
        season: prediction.season,
        horizon: Number(prediction.horizon),
        volume_exported: Number(prediction.volume_exported),
        operations: Number(prediction.operations),
      }
      if (!usePredictedFob) {
        payload.precio_fob_usd_kg = Number(form.precio_fob_usd_kg)
      }
      const data = await profitabilityService.calculateWithPrediction(payload)
      setResult(data)
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const RecIcon = result ? RECOMMENDATION_ICON[result.recomendacion] || Lightbulb : Lightbulb

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-05</span>
        <span className="text-sm font-medium text-foreground">Modelo de cálculo de rentabilidad</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {options?.ai_advisor_enabled
            ? `Recomendación con IA (${options.ai_provider || 'Gemini/OpenAI'})`
            : 'Recomendación por reglas — agrega GEMINI_API_KEY en agrotech-backend/.env'}
        </span>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      ) : null}

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
              <div className="sm:col-span-2 rounded-xl border border-ag-green-100 bg-white p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={usePredictedFob}
                    onChange={(e) => setUsePredictedFob(e.target.checked)}
                    className="h-4 w-4 rounded border-ag-green-200 accent-ag-green-600"
                  />
                  Usar precio FOB proyectado (SARIMAX / SVR / LSTM)
                </label>
                {usePredictedFob ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <SelectField label="Destino exportación" value={prediction.destination} onChange={(v) => updatePrediction('destination', v)} options={predictOptions?.destinations} />
                    <SelectField label="Temporada" value={prediction.season} onChange={(v) => updatePrediction('season', v)} options={predictOptions?.seasons} />
                    <Field label="Horizonte (semanas)" value={prediction.horizon} onChange={(v) => updatePrediction('horizon', v)} type="number" />
                    <Field label="Volumen exportado" value={prediction.volume_exported} onChange={(v) => updatePrediction('volume_exported', v)} type="number" />
                  </div>
                ) : (
                  <Field label="Precio FOB (US$/kg)" value={form.precio_fob_usd_kg} onChange={(v) => update('precio_fob_usd_kg', v)} type="number" />
                )}
              </div>
              <Field label="Rendimiento (kg/ha)" value={form.rendimiento_kg_ha} onChange={(v) => update('rendimiento_kg_ha', v)} type="number" />
              <Field label="% vendido" value={form.porcentaje_vendido} onChange={(v) => update('porcentaje_vendido', v)} type="number" />
              <Field label="Costo producción (US$/kg)" value={form.costo_produccion_usd_kg} onChange={(v) => update('costo_produccion_usd_kg', v)} type="number" />
              <Field label="Flete (US$/kg)" value={form.flete_usd_kg} onChange={(v) => update('flete_usd_kg', v)} type="number" />
              <Field label="Hectáreas" value={form.hectares} onChange={(v) => update('hectares', v)} type="number" />
              <SelectField label="Región" value={form.region} onChange={(v) => update('region', v)} options={options?.regions} />
              <SelectField label="Provincia" value={form.provincia} onChange={(v) => update('provincia', v)} options={options?.provincias} />
              <SelectField label="Tipo de conducción" value={form.tipo_conduccion_cultivo} onChange={(v) => update('tipo_conduccion_cultivo', v)} options={options?.tipos_conduccion} />
              <SelectField label="Sequía" value={form.sequia} onChange={(v) => update('sequia', v)} options={options?.sequia} />
              <SelectField label="Plagas/enfermedades" value={form.plagas_enfermedades} onChange={(v) => update('plagas_enfermedades', v)} options={options?.plagas_enfermedades} />
            </div>

            <Button className="w-full gap-2" onClick={calculate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Calcular rentabilidad
            </Button>
          </CardContent>
        </Card>

        {result ? (
          <Card>
            <CardContent className="gap-4 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Resumen de campaña</p>
                  <p className="text-xs text-muted-foreground">Resultado calculado con los modelos de margen y riesgo</p>
                </div>
                <div className="rounded-xl bg-ag-green-50 p-3 text-ag-green-600"><DollarSign className="h-5 w-5" /></div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="Ganancia unitaria" value={`US$ ${result.ganancia_unitaria_usd.toFixed(2)}`} sub="/kg" accent={result.ganancia_unitaria_usd >= 0 ? 'green' : 'red'} />
                <Metric label="Ganancia unitaria" value={`S/ ${result.ganancia_unitaria_soles.toFixed(2)}`} sub="/kg" />
                <Metric label="Margen predicho (ML)" value={`S/ ${result.margen_predicho.toFixed(2)}`} sub="/kg" />
                <Metric label="Ganancia estimada" value={`S/ ${Math.round(result.ganancia_total).toLocaleString('es-PE')}`} />
                <Metric label="ROI" value={`${result.roi >= 0 ? '+' : ''}${result.roi.toFixed(1)}%`} accent={result.roi >= 0 ? 'green' : 'red'} />
                <Metric label="Producción total" value={`${Math.round(result.produccion_total_kg).toLocaleString('es-PE')} kg`} />
              </div>

              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Costos y punto de equilibrio</p>
                <p className="mt-1 text-foreground">
                  Costo prod. <span className="font-semibold">US$ {result.costo_produccion_usd_kg.toFixed(2)}/kg</span>
                  {' · '}Flete <span className="font-semibold">US$ {result.flete_usd_kg.toFixed(2)}/kg</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Punto de equilibrio: US$ {result.punto_equilibrio_usd_kg.toFixed(2)}/kg
                  {result.precio_fob_usado != null ? ` · Precio FOB usado: US$ ${result.precio_fob_usado.toFixed(2)}/kg` : ''}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Precio FOB usado</p>
                <p className="mt-1 font-semibold text-foreground">
                  US$ {result.precio_fob_usado?.toFixed(2)}/kg
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({result.precio_fob_origen === 'prediccion' ? 'proyectado' : 'manual'})
                  </span>
                </p>
                {result.prediccion_resumen ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Consenso a {result.prediccion_resumen.horizonte_semanas} sem. · {result.prediccion_resumen.destino}
                    {result.prediccion_resumen.confianza != null ? ` · Confianza ${result.prediccion_resumen.confianza}%` : ''}
                  </p>
                ) : null}
              </div>

              <div className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium ${SCENARIO_TONE[result.escenario_clase] || 'bg-muted text-muted-foreground'}`}>
                <span>Clasificación del escenario</span>
                <span className="text-base font-bold">{result.escenario_clase}</span>
              </div>
              <p className="text-xs text-muted-foreground">Probabilidad de margen bajo (riesgo): {(result.riesgo_prob * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="items-center justify-center gap-2 p-10 text-center">
              <p className="text-sm font-medium text-foreground">Sin cálculo realizado</p>
              <p className="max-w-sm text-xs text-muted-foreground">Completa los datos y presiona "Calcular rentabilidad" para ver margen, ganancia, escenario y recomendación.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {result ? (
        <Card className="overflow-hidden border-ag-green-100 bg-gradient-to-r from-ag-green-50 to-white">
          <CardContent className="gap-5 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-ag-green-100 p-3 text-ag-green-700"><RecIcon className="h-6 w-6" /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-ag-green-600">Recomendación automática</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">{result.recomendacion}</h2>
                  {result.recomendacion_origen === 'ia' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                      <Sparkles className="h-3.5 w-3.5" />Análisis IA
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Análisis por reglas</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Justificación del resultado</h3>
              <div className="space-y-3">
                {result.justificacion.map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ag-green-50 text-ag-green-600"><CheckCircle2 className="h-4 w-4" /></div>
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {models.length ? (
        <Card>
          <CardContent className="gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-ag-green-50 p-2.5 text-ag-green-600"><BrainCircuit className="h-5 w-5" /></div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Modelos usados en el cálculo</h3>
                <p className="text-xs text-muted-foreground">Se emplean {models.length} modelos de Machine Learning con sus métricas de evaluación.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {models.map((model) => (
                <div key={model.model} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-foreground">{model.model}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${model.available ? 'bg-ag-green-50 text-ag-green-700' : 'bg-red-50 text-red-600'}`}>
                      {model.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Objetivo: {TARGET_LABELS[model.target] || model.target}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(model.metrics || {}).map(([key, value]) => (
                      <span key={key} className="rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground">
                        {METRIC_LABELS[key] || key}: <span className="font-semibold">{Number(value).toFixed(3)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ag-green-700">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="border-ag-green-100 bg-white text-foreground" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-ag-green-700">{label}</label>
      <select
        className="h-9 w-full rounded-(--radius) border border-ag-green-100 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {(options || [value]).map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function Metric({ label, value, sub, accent }) {
  const accentClass = accent === 'green' ? 'text-ag-green-700' : accent === 'red' ? 'text-red-600' : 'text-foreground'
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${accentClass}`}>{value}{sub ? <span className="text-xs text-muted-foreground"> {sub}</span> : null}</p>
    </div>
  )
}
