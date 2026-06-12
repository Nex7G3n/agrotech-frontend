import { useMemo, useState } from 'react'
import { BarChart3, Plus, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const REGIONS = ['La Libertad', 'Lambayeque', 'Piura', 'Ica']
const MODELS = ['SARIMA + LSTM', 'XGBoost', 'Random Forest', 'SVR']
const SCENARIOS = ['Base', 'Optimista', 'Pesimista', 'Shock flete']
const PRICE_SOURCES = ['Manual', 'Predicción FOB']
const DISTRICTS = {
  'La Libertad': ['Trujillo', 'Virú', 'Chao'],
  Lambayeque: ['Olmos', 'Motupe', 'Íllimo'],
  Piura: ['Tambogrande', 'Sullana', 'Chulucanas'],
  Ica: ['Santiago', 'Paracas', 'Ocucaje'],
}

const TIME_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const DEFAULT_CASES = [
  { name: 'Caso A', region: 'La Libertad', district: 'Virú', model: 'SARIMA + LSTM', scenario: 'Base', priceSource: 'Predicción FOB', horizon: 12, hectares: 5, price: 3.15, variation: 12, cost: 0.85, freight: 0.3 },
  { name: 'Caso B', region: 'Piura', district: 'Tambogrande', model: 'XGBoost', scenario: 'Optimista', priceSource: 'Manual', horizon: 12, hectares: 8, price: 3.05, variation: 10, cost: 0.82, freight: 0.34 },
]

const CAMPAIGNS = [
  { id: 'camp-2026-q2', name: 'Campaña 2026 - Q2', region: 'La Libertad', district: 'Virú' },
  { id: 'camp-2026-q3', name: 'Campaña 2026 - Q3', region: 'Piura', district: 'Tambogrande' },
  { id: 'camp-2027-q1', name: 'Campaña 2027 - Q1', region: 'Ica', district: 'Santiago' },
]

function predictFob(caseData) {
  const modelOffset = caseData.model === 'XGBoost' ? 0.06 : caseData.model === 'Random Forest' ? 0.03 : caseData.model === 'SVR' ? -0.04 : 0.08
  const scenarioOffset = caseData.scenario === 'Optimista' ? 0.14 : caseData.scenario === 'Pesimista' ? -0.16 : caseData.scenario === 'Shock flete' ? -0.08 : 0
  const regionOffset = caseData.region === 'La Libertad' ? 0.02 : caseData.region === 'Ica' ? 0.04 : caseData.region === 'Piura' ? -0.03 : 0

  return Number((3.05 + modelOffset + scenarioOffset + regionOffset).toFixed(2))
}

function profitFor(caseData) {
  return (caseData.price - caseData.cost - caseData.freight) * caseData.hectares * 4200 * 3.78
}

export function SimulationCasesPage() {
  const [cases, setCases] = useState(DEFAULT_CASES)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedCampaign, setSelectedCampaign] = useState(CAMPAIGNS[0].id)
  const [savedByCampaign, setSavedByCampaign] = useState({ [CAMPAIGNS[0].id]: DEFAULT_CASES })
  const [saveMessage, setSaveMessage] = useState('')

  const activeCase = cases[activeIndex] || cases[0]

  const totals = useMemo(() => {
    return cases.reduce(
      (acc, item) => {
        const profit = profitFor(item)
        acc.profit += profit
        acc.hectares += item.hectares
        return acc
      },
      { profit: 0, hectares: 0 }
    )
  }, [cases])

  const rankedCases = useMemo(() => {
    return cases
      .map((item, index) => ({ ...item, originalIndex: index, profit: profitFor(item) }))
      .sort((a, b) => a.profit - b.profit)
  }, [cases])

  const updateActive = (key, value) => {
    setCases((current) => current.map((item, index) => {
      if (index !== activeIndex) return item

      const next = { ...item, [key]: value }
      if (key === 'priceSource' && value === 'Predicción FOB') {
        next.price = predictFob(next)
      }
      if ((key === 'model' || key === 'scenario' || key === 'region') && next.priceSource === 'Predicción FOB') {
        next.price = predictFob(next)
      }
      if (key === 'region') {
        next.district = DISTRICTS[value]?.[0] || next.district
      }
      return next
    }))
  }

  const addCase = () => {
    const index = cases.length + 1
    const nextCase = { name: `Caso ${String.fromCharCode(64 + index)}`, region: 'La Libertad', district: 'Virú', model: 'SARIMA + LSTM', scenario: 'Base', priceSource: 'Predicción FOB', horizon: 12, hectares: 4, price: 3.15, variation: 12, cost: 0.85, freight: 0.3 }
    setCases((current) => [...current, nextCase])
    setActiveIndex(cases.length)
  }

  const saveToCampaign = () => {
    setSavedByCampaign((current) => ({ ...current, [selectedCampaign]: cases }))
    setSaveMessage(`Simulaciones guardadas en ${CAMPAIGNS.find((item) => item.id === selectedCampaign)?.name}`)
  }

  const loadCampaignCases = (campaignId) => {
    setSelectedCampaign(campaignId)
    const savedCases = savedByCampaign[campaignId]
    if (savedCases?.length) {
      setCases(savedCases)
      setActiveIndex(0)
      setSaveMessage(`Simulaciones cargadas desde ${CAMPAIGNS.find((item) => item.id === campaignId)?.name}`)
      return
    }

    const campaign = CAMPAIGNS.find((item) => item.id === campaignId) || CAMPAIGNS[0]
    const nextCases = DEFAULT_CASES.map((item, index) => ({
      ...item,
      name: `${campaign.name} - Caso ${String.fromCharCode(65 + index)}`,
      region: campaign.region,
      district: campaign.district,
    }))
    setCases(nextCases)
    setActiveIndex(0)
    setSaveMessage('Campaña sin simulaciones guardadas; se cargó una plantilla mock')
  }

  const timeSeries = useMemo(() => {
    return cases.map((item, index) => {
      const modelBoost = item.model === 'XGBoost' ? 0.05 : item.model === 'Random Forest' ? 0.02 : item.model === 'SVR' ? -0.02 : 0.03
      const scenarioBoost = item.scenario === 'Optimista' ? 0.1 : item.scenario === 'Pesimista' ? -0.12 : item.scenario === 'Shock flete' ? -0.06 : 0
      const base = item.price + scenarioBoost
      const slope = modelBoost + index * 0.01
      return TIME_LABELS.map((_, monthIndex) => {
        const seasonal = Math.sin((monthIndex / 11) * Math.PI * 2) * 0.12
        const mean = base + seasonal + slope * (monthIndex / 11) - 0.08
        const variationFactor = Number(item.variation || 0) / 100
        return {
          month: TIME_LABELS[monthIndex],
          inferior: mean * (1 - variationFactor),
          medio: mean,
          superior: mean * (1 + variationFactor),
        }
      })
    })
  }, [cases])

  const maxSeriesValue = Math.max(...timeSeries.flat().map((point) => point.superior), 1)
  const lineColors = ['#0F6E56', '#378ADD', '#BA7517', '#8B5CF6', '#EC4899', '#F59E0B']

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">Simulaciones</span>
        <span className="text-sm font-medium text-foreground">Centro de control de simulaciones</span>
        <span className="ml-auto text-xs text-muted-foreground">Elabora casos, mueve precios, cambia modelos y predice escenarios</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Casos activos</p><p className="text-2xl font-semibold">{cases.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Hectáreas totales</p><p className="text-2xl font-semibold">{totals.hectares}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Ganancia estimada</p><p className="text-2xl font-semibold text-ag-green-700">S/ {Math.round(totals.profit).toLocaleString('es-PE')}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="gap-4 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5 lg:min-w-96">
              <label className="text-xs font-medium text-muted-foreground">Campaña para guardar/cargar simulaciones</label>
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={selectedCampaign} onChange={(event) => loadCampaignCases(event.target.value)}>
                {CAMPAIGNS.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.region} / {campaign.district}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveToCampaign}>Guardar simulaciones</Button>
              <Button variant="secondary" onClick={() => loadCampaignCases(selectedCampaign)}>Cargar campaña</Button>
            </div>
          </div>
          {saveMessage ? <p className="rounded-xl border border-ag-green-100 bg-ag-green-50 px-4 py-2 text-sm text-ag-green-700">{saveMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Ranking de casos</h3>
              <p className="text-xs text-muted-foreground">Ordenado por ganancia estimada, del peor al mejor.</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Peor → Mejor</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {rankedCases.map((item, rankIndex) => {
              const isWorst = rankIndex === 0
              const isBest = rankIndex === rankedCases.length - 1
              const isActive = item.originalIndex === activeIndex

              return (
                <button
                  key={`${item.name}-${item.originalIndex}`}
                  type="button"
                  onClick={() => setActiveIndex(item.originalIndex)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${isActive ? 'border-ag-green-200 bg-ag-green-50' : 'border-border bg-card hover:bg-secondary'}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">#{rankIndex + 1}</span>
                    {isWorst ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">Peor</span> : null}
                    {isBest ? <span className="rounded-full bg-ag-green-50 px-2.5 py-1 text-[11px] font-semibold text-ag-green-700">Mejor</span> : null}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.region} · {item.district}</p>
                  <p className={`mt-3 text-lg font-semibold ${item.profit >= 0 ? 'text-ag-green-700' : 'text-red-600'}`}>
                    S/ {Math.round(item.profit).toLocaleString('es-PE')}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-ag-green-600"
                      style={{ width: `${Math.max(8, Math.min(100, (Math.max(item.profit, 0) / Math.max(...rankedCases.map((row) => Math.max(row.profit, 1)))) * 100))}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-ag-green-100 bg-gradient-to-br from-ag-green-50 to-white">
        <CardContent className="gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-ag-green-600">Centro de control</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">Cabina de control del caso activo</h2>
              <p className="text-xs text-muted-foreground">Mueve precios, variación, costos, modelo predictivo y escenario antes de agregar o editar casos.</p>
            </div>
            <Button onClick={addCase} className="gap-2"><Plus className="h-4 w-4" />Agregar caso</Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Nombre" value={activeCase.name} onChange={(value) => updateActive('name', value)} />
            <Field label="Región" value={activeCase.region} onChange={(value) => updateActive('region', value)} options={REGIONS} />
            <Field label="Distrito" value={activeCase.district} onChange={(value) => updateActive('district', value)} options={DISTRICTS[activeCase.region] || []} />
            <Field label="Modelo predictivo" value={activeCase.model} onChange={(value) => updateActive('model', value)} options={MODELS} />
            <Field label="Escenario" value={activeCase.scenario} onChange={(value) => updateActive('scenario', value)} options={SCENARIOS} />
            <Field label="Origen del precio" value={activeCase.priceSource} onChange={(value) => updateActive('priceSource', value)} options={PRICE_SOURCES} />
            <Field label="Horizonte (meses)" value={activeCase.horizon} onChange={(value) => updateActive('horizon', Number(value))} />
            <Field label="Hectáreas" value={activeCase.hectares} onChange={(value) => updateActive('hectares', Number(value))} />
            <Field label="Precio FOB" value={activeCase.price} onChange={(value) => updateActive('price', Number(value))} disabled={activeCase.priceSource === 'Predicción FOB'} />
            <RangeField label="Variación del rango" value={activeCase.variation} onChange={(value) => updateActive('variation', Number(value))} />
            <Field label="Costo" value={activeCase.cost} onChange={(value) => updateActive('cost', Number(value))} />
            <Field label="Flete" value={activeCase.freight} onChange={(value) => updateActive('freight', Number(value))} />
            <div className="flex items-end gap-2">
              <Button variant="secondary" className="w-full gap-2"><Pencil className="h-4 w-4" />Actualizar caso</Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <ControlMetric label="Modelo activo" value={activeCase.model} />
            <ControlMetric label="Escenario activo" value={activeCase.scenario} />
            <ControlMetric label="Precio usado" value={`${activeCase.priceSource}: US$ ${activeCase.price.toFixed(2)}`} />
            <ControlMetric label="Variación" value={`±${activeCase.variation}%`} />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Predicción temporal del caso activo</p>
                <p className="text-xs text-muted-foreground">Líneas inferior, medio y superior por horizonte</p>
              </div>
              <span className="rounded-full bg-ag-green-50 px-2.5 py-1 text-[11px] font-semibold text-ag-green-700">US$ / kg</span>
            </div>
            <div className="mt-4 grid h-56 grid-cols-12 items-end gap-2 rounded-xl bg-muted/30 p-4">
              {timeSeries[activeIndex]?.map((point) => (
                <div key={point.month} className="flex h-full flex-col items-center justify-end gap-2">
                  <div className="w-full rounded-t-lg bg-ag-green-600" style={{ height: `${Math.max(18, (point.medio / maxSeriesValue) * 100)}%` }} />
                  <div className="text-[10px] text-muted-foreground">{point.month}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-4 p-5">
          <h3 className="text-base font-semibold">Comparativo temporal de todos los casos</h3>
          <div className="overflow-x-auto">
            <div className="min-w-[860px] rounded-xl border border-border bg-card p-4">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {cases.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lineColors[index % lineColors.length] }} />
                    <span>{item.name}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-dashed border-ag-green-600" />Inferior</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ag-green-600" />Medio</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-ag-green-600 bg-white" />Superior</span>
                </div>
              </div>

              <div className="relative h-72 rounded-xl bg-muted/25 p-4">
                <svg viewBox="0 0 840 240" className="h-full w-full overflow-visible">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = 20 + i * 50
                    return <line key={i} x1="40" x2="820" y1={y} y2={y} stroke="currentColor" className="text-border/60" strokeDasharray="4 4" />
                  })}

                  {TIME_LABELS.map((label, index) => (
                    <text key={label} x={40 + index * (780 / 11)} y="232" textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">
                      {label}
                    </text>
                  ))}

                  {cases.map((item, caseIndex) => {
                    const points = timeSeries[caseIndex]
                    const color = lineColors[caseIndex % lineColors.length]

                    const pathFor = (key) => points
                      .map((point, monthIndex) => {
                        const x = 40 + monthIndex * (780 / 11)
                        const y = 200 - (point[key] / maxSeriesValue) * 170
                        return `${monthIndex === 0 ? 'M' : 'L'} ${x} ${y}`
                      })
                      .join(' ')

                    return (
                      <g key={item.name}>
                        <path d={pathFor('inferior')} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
                        <path d={pathFor('medio')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={pathFor('superior')} fill="none" stroke={color} strokeWidth="1.5" opacity="0.65" />
                        {points.map((point, monthIndex) => {
                          const x = 40 + monthIndex * (780 / 11)
                          const y = 200 - (point.medio / maxSeriesValue) * 170
                          return <circle key={`${item.name}-${point.month}`} cx={x} cy={y} r="4" fill={color} stroke="#fff" strokeWidth="1.5" />
                        })}
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value, onChange, options = [], disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {options.length > 0 ? (
        <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <Input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={disabled ? 'bg-muted text-muted-foreground' : ''} />
      )}
    </div>
  )
}

function RangeField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="rounded-full bg-ag-green-50 px-2 py-0.5 text-[11px] font-semibold text-ag-green-700">±{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="35"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ag-green-100 accent-ag-green-600"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span>35%</span>
      </div>
    </div>
  )
}

function ControlMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
