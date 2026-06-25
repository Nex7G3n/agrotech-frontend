import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BrainCircuit, Loader2, Plus, Sparkles, Star, TrendingUp, Trash2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ShareResultsMenu } from '@/shared/components/ShareResultsMenu'
import { profitabilityService } from '@/modules/profitability/services/profitabilityService'
import { predictionService } from '@/modules/prediction/services/predictionService'
import { useAuth } from '@/modules/auth/context/AuthContext'

const AUTO_SCENARIO_NAMES = ['Cálculo Rentabilidad', 'Escenario Alto', 'Escenario Medio', 'Escenario Bajo']
const AUTO_SCENARIO_ORDER = { 'Cálculo Rentabilidad': 0, 'Escenario Alto': 1, 'Escenario Medio': 2, 'Escenario Bajo': 3 }
const AUTO_VARIANT_TONE = {
  'Cálculo Rentabilidad': 'border-sky-300 bg-sky-50/40 text-sky-800',
  'Escenario Alto': 'border-ag-green-200 bg-ag-green-50/60',
  'Escenario Medio': 'border-amber-200 bg-amber-50/60',
  'Escenario Bajo': 'border-red-200 bg-red-50/60',
}

const SCENARIO_TONE = {
  Alto: 'bg-ag-green-50 text-ag-green-700',
  Medio: 'bg-amber-50 text-amber-600',
  Bajo: 'bg-red-50 text-red-600',
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

const NEW_SIM = {
  name: 'Caso A',
  precio_fob_usd_kg: 2.0,
  costo_soles_kg: 4.0,
  tipo_cambio: 3.75,
  region: 'LA LIBERTAD',
  provincia: 'VIRU',
  tipo_conduccion_cultivo: 'Homogeneo',
  sequia: 'No',
  plagas_enfermedades: 'No',
  hectares: 5,
  margen_objetivo_soles: 0,
}

const PREDICTION_DEFAULTS = {
  destination: 'UNITED STATES',
  horizon: 4,
  reference_date: '',
}

export function SimulationCasesPage() {
  const { role, isAdmin } = useAuth()
  const canEdit = isAdmin || role === 'admin' || role === 'analista' || role === 'user'

  const [options, setOptions] = useState(null)
  const [predictOptions, setPredictOptions] = useState(null)
  const [models, setModels] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [simulations, setSimulations] = useState([])
  const [draft, setDraft] = useState(NEW_SIM)
  const [prediction, setPrediction] = useState(PREDICTION_DEFAULTS)
  const [usePredictedFob, setUsePredictedFob] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [autoGenerating, setAutoGenerating] = useState(false)
  const [fobBands, setFobBands] = useState(null)
  const [suggestedBestId, setSuggestedBestId] = useState(null)
  const [error, setError] = useState('')
  const [prediccionPreview, setPrediccionPreview] = useState(null)

  useEffect(() => {
    profitabilityService.getOptions().then(setOptions).catch((err) => setError(err.message))
    profitabilityService.getModels().then(setModels).catch(() => {})
    predictionService
      .getInputOptions()
      .then((data) => {
        setPredictOptions(data)
        setPrediction((current) => ({
          ...current,
          destination: data.destinations?.[0] || current.destination,
        }))
      })
      .catch(() => {})
    profitabilityService
      .listCampaigns()
      .then((data) => {
        setCampaigns(data)
        if (data.length) setSelectedCampaign(String(data[0].id))
      })
      .catch((err) => setError(err.message))
  }, [])

  const loadSimulations = async (campaignId) => {
    if (!campaignId) return
    setLoading(true)
    try {
      const data = await profitabilityService.listSimulations(campaignId)
      setSimulations(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSimulations(selectedCampaign)
  }, [selectedCampaign])

  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const setPredField = (key, value) => {
    setPrediccionPreview(null)
    setPrediction((current) => ({ ...current, [key]: value }))
  }

  const addSimulation = async () => {
    if (!selectedCampaign) {
      setError('Crea o selecciona una campaña primero (módulo Campañas).')
      return
    }
    if (usePredictedFob && (!prediction.destination || !prediction.horizon)) {
      setError('Completa destino, horizonte y fecha de referencia.')
      return
    }
    setSaving(true)
    setError('')
    setPrediccionPreview(null)
    try {
      let precioFob = Number(draft.precio_fob_usd_kg)
      if (usePredictedFob) {
        const preview = await profitabilityService.calculateWithPrediction({
          ...draft,
          costo_soles_kg: Number(draft.costo_soles_kg),
          tipo_cambio: Number(draft.tipo_cambio),
          hectares: Number(draft.hectares),
          margen_objetivo_soles: Number(draft.margen_objetivo_soles),
          use_predicted_fob: true,
          destination: prediction.destination,
          horizon: Number(prediction.horizon),
          reference_date: prediction.reference_date || undefined,
        })
        precioFob = preview.precio_fob_usado
        setPrediccionPreview(preview.prediccion_resumen)
      }

      const payload = {
        ...draft,
        precio_fob_usd_kg: precioFob,
        costo_soles_kg: Number(draft.costo_soles_kg),
        tipo_cambio: Number(draft.tipo_cambio),
        hectares: Number(draft.hectares),
        margen_objetivo_soles: Number(draft.margen_objetivo_soles),
      }
      await profitabilityService.createSimulation(selectedCampaign, payload)
      await loadSimulations(selectedCampaign)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeSimulation = async (id) => {
    setError('')
    try {
      await profitabilityService.deleteSimulation(id)
      await loadSimulations(selectedCampaign)
    } catch (err) {
      setError(err.message)
    }
  }

  const markBest = async (id) => {
    setError('')
    try {
      await profitabilityService.markBest(id)
      await loadSimulations(selectedCampaign)
    } catch (err) {
      setError(err.message)
    }
  }

  const buildBasePayload = () => ({
    costo_soles_kg: Number(draft.costo_soles_kg),
    tipo_cambio: Number(draft.tipo_cambio),
    region: draft.region,
    provincia: draft.provincia,
    tipo_conduccion_cultivo: draft.tipo_conduccion_cultivo,
    sequia: draft.sequia,
    plagas_enfermedades: draft.plagas_enfermedades,
    hectares: Number(draft.hectares),
    margen_objetivo_soles: Number(draft.margen_objetivo_soles),
    use_predicted_fob: usePredictedFob,
    destination: prediction.destination,
    horizon: Number(prediction.horizon),
    reference_date: prediction.reference_date || undefined,
    ...(usePredictedFob ? {} : { precio_fob_usd_kg: Number(draft.precio_fob_usd_kg) }),
  })

  const generateAutoScenarios = async () => {
    if (!selectedCampaign) {
      setError('Crea o selecciona una campaña primero (módulo Campañas).')
      return
    }
    if (usePredictedFob && (!prediction.destination || !prediction.horizon)) {
      setError('Completa destino, horizonte y fecha de referencia.')
      return
    }
    setAutoGenerating(true)
    setError('')
    try {
      const result = await profitabilityService.generateAutoScenarios(selectedCampaign, buildBasePayload())
      setFobBands(result.fob_bands)
      setSuggestedBestId(result.suggested_best_id)
      await loadSimulations(selectedCampaign)
    } catch (err) {
      setError(err.message)
    } finally {
      setAutoGenerating(false)
    }
  }

  const autoScenarios = useMemo(
    () =>
      AUTO_SCENARIO_NAMES.map((name) => simulations.find((item) => item.name === name))
        .filter(Boolean)
        .sort((a, b) => AUTO_SCENARIO_ORDER[a.name] - AUTO_SCENARIO_ORDER[b.name]),
    [simulations],
  )

  const manualCases = useMemo(
    () => [...simulations].filter((item) => !AUTO_SCENARIO_NAMES.includes(item.name)).sort((a, b) => (b.ganancia_total || 0) - (a.ganancia_total || 0)),
    [simulations],
  )

  const totals = useMemo(
    () => ({
      count: simulations.length,
      profit: simulations.reduce((acc, item) => acc + (item.ganancia_total || 0), 0),
      best: simulations.find((item) => item.is_best),
    }),
    [simulations],
  )

  const chartData = useMemo(() => {
    return simulations
      .map((item) => ({
        name: item.name,
        Ganancia: Math.round(item.ganancia_total || 0),
        Margen: Number((item.margen_predicho || 0).toFixed(2)),
      }))
      .sort((a, b) => {
        const orderA = AUTO_SCENARIO_ORDER[a.name] ?? 99
        const orderB = AUTO_SCENARIO_ORDER[b.name] ?? 99
        return orderA - orderB
      })
  }, [simulations])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">Simulador</span>
        <span className="text-sm font-medium text-foreground">Simulador de escenarios de campaña</span>
        <span className="ml-auto text-xs text-muted-foreground">Crea escenarios, clasifícalos y marca el mejor</span>
      </div>

      {!canEdit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Modo Lectura: No tienes permisos para crear, eliminar o marcar como mejor ningún escenario de simulación.</span>
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      ) : null}

      <Card>
        <CardContent className="gap-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5 lg:max-w-md">
              <label className="text-xs font-medium text-muted-foreground">Campaña</label>
              <select
                className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm"
                value={selectedCampaign}
                onChange={(event) => setSelectedCampaign(event.target.value)}
              >
                {campaigns.length === 0 ? <option value="">No hay campañas — crea una en el módulo Campañas</option> : null}
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.region} / {campaign.district}</option>
                ))}
              </select>
            </div>
            <Button onClick={generateAutoScenarios} disabled={!canEdit || autoGenerating || !selectedCampaign || (usePredictedFob && (!prediction.destination || !prediction.horizon))} className="gap-2">
              {autoGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generar escenarios automáticos
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Genera Alto, Medio y Bajo variando FOB, costo productivo, sequía y plagas según el contrato del modelo.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Escenarios</p><p className="text-2xl font-semibold">{totals.count}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Ganancia total</p><p className="text-2xl font-semibold text-ag-green-700">S/ {Math.round(totals.profit).toLocaleString('es-PE')}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Mejor escenario</p><p className="text-2xl font-semibold">{totals.best ? totals.best.name : '—'}</p></CardContent></Card>
      </div>

      {simulations.length > 0 && selectedCampaign ? (
        <Card className="border-ag-green-100">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Comparativo de Proyecciones vs. Escenarios</h3>
                <p className="text-xs text-muted-foreground">Comparación de la proyección pura y los escenarios simulados en ganancia y margen</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#0F6E56" tickFormatter={(v) => `S/ ${v.toLocaleString('es-PE')}`} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#BA7517" tickFormatter={(v) => `S/ ${v}/kg`} tick={{ fontSize: 10 }} />
                  <RechartsTooltip formatter={(value, name) => {
                    if (name === "Ganancia") return [`S/ ${value.toLocaleString('es-PE')}`, "Ganancia Total"]
                    if (name === "Margen") return [`S/ ${value}/kg`, "Margen Predicho"]
                    return [value, name]
                  }} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="Ganancia" name="Ganancia Total (S/)" fill="#0F6E56" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Margen" name="Margen Predicho (S/ kg)" fill="#BA7517" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {simulations.length > 0 && selectedCampaign ? (
        <ShareResultsMenu
          module="scenarios"
          buildPayload={() => ({
            campaign_id: Number(selectedCampaign),
            fob_bands: fobBands,
            suggested_best_id: suggestedBestId,
          })}
        />
      ) : null}

      {canEdit && (
        <Card className="border-ag-green-100 bg-gradient-to-br from-ag-green-50 to-white">
          <CardContent className="gap-4 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-ag-green-600">Nuevo escenario</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">Agregar simulación a la campaña</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Nombre" value={draft.name} onChange={(v) => setField('name', v)} />
              <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-border bg-white p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={usePredictedFob}
                    onChange={(e) => { setUsePredictedFob(e.target.checked); setPrediccionPreview(null) }}
                    className="h-4 w-4 rounded accent-ag-green-600"
                  />
                  Usar precio FOB proyectado
                </label>
                {usePredictedFob ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <SelectField label="Destino" value={prediction.destination} onChange={(v) => setPredField('destination', v)} options={predictOptions?.destinations} />
                    <SelectField label="Horizonte (sem.)" value={prediction.horizon} onChange={(v) => setPredField('horizon', v)} options={[4, 6, 8]} />
                    {/* <Field label="Fecha de referencia" type="date" required value={prediction.reference_date} onChange={(v) => setPredField('reference_date', v)} /> */}
                  </div>
                ) : (
                  <div className="mt-3">
                    <Field label="Precio FOB (US$/kg)" type="number" value={draft.precio_fob_usd_kg} onChange={(v) => setField('precio_fob_usd_kg', v)} />
                  </div>
                )}
              </div>
              <Field label="Costo productivo (S//kg)" type="number" value={draft.costo_soles_kg} onChange={(v) => setField('costo_soles_kg', v)} />
              <Field label="Tipo de cambio (S//US$)" type="number" value={draft.tipo_cambio} onChange={(v) => setField('tipo_cambio', v)} />
              <Field label="Hectáreas" type="number" value={draft.hectares} onChange={(v) => setField('hectares', v)} />
              <Field label="Ganancia mínima deseada (S/)" type="number" value={draft.margen_objetivo_soles} onChange={(v) => setField('margen_objetivo_soles', v)} />
              <SelectField label="Región" value={draft.region} onChange={(v) => setField('region', v)} options={options?.regions} />
              <SelectField label="Provincia" value={draft.provincia} onChange={(v) => setField('provincia', v)} options={options?.provincias} />
              <SelectField label="Tipo de conducción" value={draft.tipo_conduccion_cultivo} onChange={(v) => setField('tipo_conduccion_cultivo', v)} options={options?.tipos_conduccion} />
              <SelectField label="Sequía" value={draft.sequia} onChange={(v) => setField('sequia', v)} options={options?.sequia} />
              <SelectField label="Plagas/enfermedades" value={draft.plagas_enfermedades} onChange={(v) => setField('plagas_enfermedades', v)} options={options?.plagas_enfermedades} />
              {prediccionPreview ? (
                <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-3 rounded-xl border border-ag-green-200 bg-ag-green-50 px-4 py-3">
                  <div className="rounded-full bg-ag-green-100 p-1.5 text-ag-green-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ag-green-600">Precio FOB proyectado</p>
                    <p className="text-sm font-semibold text-ag-green-800">
                      US$ {prediccionPreview.precio_fob_proyectado?.toFixed(3)}/kg
                      {prediccionPreview.tendencia ? (
                        <span className="ml-2 text-xs font-normal text-ag-green-600">· Tendencia: {prediccionPreview.tendencia}</span>
                      ) : null}
                      {prediccionPreview.confianza != null ? (
                        <span className="ml-2 text-xs font-normal text-ag-green-600">· Confianza: {(prediccionPreview.confianza * 100).toFixed(0)}%</span>
                      ) : null}
                    </p>
                    {prediccionPreview.modelos_usados?.length ? (
                      <p className="mt-0.5 text-[10px] text-ag-green-500">
                        Modelos: {prediccionPreview.modelos_usados.join(', ')} · {prediccionPreview.horizonte_semanas} sem. · {prediccionPreview.destino}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="flex items-end">
                <Button onClick={addSimulation} disabled={saving || !selectedCampaign || (usePredictedFob && (!prediction.destination || !prediction.horizon))} className="w-full gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Agregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {autoScenarios.length ? (
        <Card className="border-ag-green-100">
          <CardContent className="gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">Cálculo Base y Escenarios Automáticos</h3>
                <p className="text-xs text-muted-foreground">
                  Generados con FOB{' '}
                  {fobBands
                    ? `${fobBands.fob_lower_usd_kg} – ${fobBands.fob_upper_usd_kg} US$/kg (${fobBands.fob_origen === 'prediccion' ? 'intervalo predictivo' : '±10%'})`
                    : 'según predicción o precio base'}
                </p>
              </div>
              {suggestedBestId ? (
                <span className="rounded-full bg-ag-green-50 px-3 py-1 text-xs font-medium text-ag-green-700">
                  Sugerido: {autoScenarios.find((item) => item.id === suggestedBestId)?.name || '—'}
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {autoScenarios.map((item) => (
                <ScenarioCard
                  key={item.id}
                  item={item}
                  tone={AUTO_VARIANT_TONE[item.name] || 'border-border bg-card'}
                  suggested={item.id === suggestedBestId}
                  onMarkBest={markBest}
                  onRemove={removeSimulation}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Escenarios manuales</h3>
              <p className="text-xs text-muted-foreground">Casos personalizados agregados a la campaña.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>
          ) : manualCases.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {autoScenarios.length ? 'No hay escenarios manuales adicionales.' : 'Genera escenarios automáticos o agrega uno manualmente.'}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {manualCases.map((item, index) => (
                <ScenarioCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  onMarkBest={markBest}
                  onRemove={removeSimulation}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {models.length ? (
        <Card>
          <CardContent className="gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-ag-green-50 p-2.5 text-ag-green-600"><BrainCircuit className="h-5 w-5" /></div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Modelos usados en las simulaciones</h3>
                <p className="text-xs text-muted-foreground">Cada escenario se evalúa con {models.length} modelos de Machine Learning y sus métricas.</p>
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

function ScenarioCard({ item, rank, tone, suggested, onMarkBest, onRemove, canEdit }) {
  const cardTone = item.is_best ? 'border-ag-green-300 bg-ag-green-50' : tone || 'border-border bg-card'

  return (
    <div className={`rounded-2xl border p-4 ${cardTone}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        {rank ? <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">#{rank}</span> : <span />}
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SCENARIO_TONE[item.escenario_clase] || 'bg-muted text-muted-foreground'}`}>
          Clase {item.escenario_clase}
        </span>
      </div>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {item.is_best ? <Star className="h-4 w-4 fill-ag-green-500 text-ag-green-600" /> : null}
        {item.name}
        {suggested && !item.is_best ? (
          <span className="rounded-full bg-ag-green-100 px-2 py-0.5 text-[10px] font-medium text-ag-green-700">Sugerido</span>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        FOB US$ {item.precio_fob_usd_kg?.toFixed(2)}/kg · {item.sequia === 'Si' || item.plagas_enfermedades === 'Si' ? 'condiciones adversas' : 'condiciones normales'}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Stat label="Ganancia/kg" value={`US$ ${(item.ganancia_unitaria_usd ?? 0).toFixed(2)}`} />
        <Stat label="Equilibrio" value={`US$ ${(item.punto_equilibrio_usd_kg ?? 0).toFixed(2)}/kg`} />
        <Stat label="Margen ML" value={`S/ ${(item.margen_predicho ?? 0).toFixed(2)}/kg`} />
        <Stat label="ROI" value={`${(item.roi ?? 0).toFixed(0)}%`} />
        <Stat label="Ganancia" value={`S/ ${Math.round(item.ganancia_total || 0).toLocaleString('es-PE')}`} />
        <Stat label="Riesgo" value={`${((item.riesgo_prob ?? 0) * 100).toFixed(0)}%`} />
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] font-medium text-muted-foreground">
        Recomendación: <span className="font-semibold text-foreground">{item.recomendacion || '—'}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant={item.is_best ? 'secondary' : 'default'} size="sm" className="flex-1 gap-1" onClick={() => onMarkBest(item.id)} disabled={item.is_best || !canEdit}>
          <Star className="h-3.5 w-3.5" />{item.is_best ? 'Mejor' : 'Marcar mejor'}
        </Button>
        <Button variant="secondary" size="sm" className="text-red-600" onClick={() => onRemove(item.id)} disabled={!canEdit}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        {(options || [value]).map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
