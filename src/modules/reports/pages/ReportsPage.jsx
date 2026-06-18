import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BarChart3, Download, Globe2, LineChart, Loader2, PieChart, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { historicalService } from '@/modules/historical/services/historicalService'
import { reportsService } from '@/modules/reports/services/reportsService'

const TONE_DOT = { green: 'bg-ag-green-500', amber: 'bg-amber-400', red: 'bg-red-500' }
const TONE_BAR = { green: 'bg-ag-green-500', amber: 'bg-amber-400', red: 'bg-red-400' }
const TONE_BADGE = {
  green: 'bg-ag-green-50 text-ag-green-700 border-ag-green-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
}
const RESULT_TONE = {
  'Muy bueno': 'text-ag-green-700',
  Bueno: 'text-ag-green-600',
  Regular: 'text-amber-600',
  Débil: 'text-red-600',
  'Sin referencia': 'text-muted-foreground',
}
const VS_TONE = (label) => {
  if (!label || label === 'Base' || label === 'Estable') return 'text-muted-foreground'
  return label.startsWith('+') ? 'text-ag-green-700' : 'text-red-600'
}

export function ReportsPage() {
  const [filterOptions, setFilterOptions] = useState(null)
  const [filters, setFilters] = useState({ yearFrom: '', yearTo: '', continent: 'Todos', destination: 'Todos' })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    historicalService
      .getFilters()
      .then((data) => {
        setFilterOptions(data)
        const years = data.years || []
        setFilters((c) => ({
          ...c,
          yearFrom: years.length ? String(Math.max(years[years.length - 1], years[0] - 3)) : '',
          yearTo: years.length ? String(years[0]) : '',
        }))
      })
      .catch((err) => setError(err.message))
  }, [])

  const destinationsForContinent = useMemo(() => {
    if (!filterOptions?.destinations) return []
    if (filters.continent === 'Todos') return filterOptions.destinations
    return filterOptions.destinations.filter((item) => item.continent === filters.continent)
  }, [filterOptions, filters.continent])

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setReport(await reportsService.getCyclesReport({
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        destination: filters.destination,
        continent: filters.continent,
      }))
    } catch (err) {
      setError(err.message)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (filters.yearFrom && filters.yearTo) loadReport()
  }, [filters.yearFrom, filters.yearTo, filters.destination, filters.continent, loadReport])

  const updateFilter = (key, value) => {
    setFilters((c) => {
      const next = { ...c, [key]: value }
      if (key === 'continent') next.destination = 'Todos'
      return next
    })
  }

  const downloadPdf = async () => {
    setDownloading(true)
    setError('')
    try {
      await reportsService.downloadCyclesPdf({ yearFrom: filters.yearFrom, yearTo: filters.yearTo, destination: filters.destination, continent: filters.continent })
    } catch (err) {
      setError(err.message || 'No se pudo descargar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  const monthlyByNum = useMemo(() => {
    if (!report?.monthly_patterns) return {}
    return Object.fromEntries(report.monthly_patterns.map((m) => [m.month_num, m]))
  }, [report])

  const maxMonthlyPrice = useMemo(() => {
    if (!report?.monthly_patterns?.length) return 1
    return Math.max(...report.monthly_patterns.map((m) => m.avg_price_usd_kg))
  }, [report])

  const peakMonths = useMemo(() => new Set(report?.cycles?.find((c) => c.type === 'pico')?.months || []), [report])
  const troughMonths = useMemo(() => new Set(report?.cycles?.find((c) => c.type === 'caida')?.months || []), [report])

  const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.25 py-0.75 font-mono text-[11px] font-medium text-ag-green-600">Reportes</span>
        <span className="text-sm font-medium text-foreground">Generación de reportes de ciclos</span>
        <span className="ml-auto text-xs text-muted-foreground">Analiza datos mensuales y detecta patrones recurrentes de precios FOB</span>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : null}

      {/* Filtros */}
      <Card>
        <CardContent className="gap-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <FilterField label="Año desde">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.yearFrom} onChange={(e) => updateFilter('yearFrom', e.target.value)}>
                {(filterOptions?.years || []).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </FilterField>
            <FilterField label="Año hasta">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.yearTo} onChange={(e) => updateFilter('yearTo', e.target.value)}>
                {(filterOptions?.years || []).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </FilterField>
            <FilterField label="Continente">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.continent} onChange={(e) => updateFilter('continent', e.target.value)}>
                <option value="Todos">Todos</option>
                {(filterOptions?.continents || []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FilterField>
            <FilterField label="Mercado">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.destination} onChange={(e) => updateFilter('destination', e.target.value)}>
                <option value="Todos">Todos</option>
                {destinationsForContinent.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </FilterField>
            <div className="flex items-end gap-2">
              <Button onClick={loadReport} disabled={loading} className="flex-1 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Actualizar
              </Button>
              <Button variant="secondary" onClick={downloadPdf} disabled={downloading || !report} className="flex-1 gap-2" title={!report ? 'Genera el reporte primero' : undefined}>
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                PDF
              </Button>
            </div>
          </div>
          {report?.summary ? (
            <p className="text-xs text-muted-foreground">
              {report.summary.mercado_label} · Período {report.summary.periodo_label} · {report.summary.anos_analizados} años con datos
            </p>
          ) : null}
        </CardContent>
      </Card>

      {loading && !report ? (
        <div className="py-20 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : null}

      {report ? (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportMetric label="Semanas analizadas" value={report.summary.semanas_analizadas.toLocaleString('es-PE')} sub={report.summary.periodo_label} icon={BarChart3} />
            <ReportMetric label="Precio promedio" value={`US$ ${report.summary.precio_promedio_usd_kg.toFixed(2)}/kg`} sub="Precio FOB histórico" icon={LineChart} />
            <ReportMetric label="Ciclos detectados" value={String(report.summary.ciclos_detectados)} sub="Patrones estacionales" icon={PieChart} />
            <ReportMetric label="Años analizados" value={String(report.summary.anos_analizados)} sub={report.summary.mercado_label} icon={Globe2} />
          </div>

          {/* Gráfico de barras mensual */}
          <Card>
            <CardContent className="gap-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Precio FOB promedio por mes</h3>
                  <p className="text-xs text-muted-foreground">Precio histórico mensual · Los colores indican patrones detectados</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ag-green-500" />Pico</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" />Caída</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />Intermedio</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl bg-muted/30">
                {/* Área de barras — h fijo para que height:% funcione */}
                <div className="flex h-44 items-stretch gap-1.5 px-4 pt-4">
                  {MONTH_SHORT.map((label, idx) => {
                    const monthNum = idx + 1
                    const data = monthlyByNum[monthNum]
                    const price = data?.avg_price_usd_kg || 0
                    const heightPct = maxMonthlyPrice > 0 ? (price / maxMonthlyPrice) * 100 : 0
                    const isPeak = peakMonths.has(monthNum)
                    const isTrough = troughMonths.has(monthNum)
                    const barColor = isPeak ? 'bg-ag-green-500' : isTrough ? 'bg-red-400' : 'bg-amber-400'

                    return (
                      <div key={monthNum} className="flex h-full flex-1 flex-col justify-end">
                        <div
                          className={`group relative w-full rounded-t-md transition-all ${barColor} ${price === 0 ? 'opacity-15' : 'opacity-80 hover:opacity-100'}`}
                          style={{ height: `${Math.max(heightPct, price > 0 ? 5 : 1)}%` }}
                        >
                          {price > 0 ? (
                            <div className="absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium shadow-sm group-hover:block">
                              US$ {price.toFixed(2)}/kg
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Fila de etiquetas */}
                <div className="flex gap-1.5 px-4 pb-3 pt-1.5">
                  {MONTH_SHORT.map((label, idx) => {
                    const monthNum = idx + 1
                    const isPeak = peakMonths.has(monthNum)
                    const isTrough = troughMonths.has(monthNum)
                    return (
                      <span key={monthNum} className={`flex-1 text-center text-[10px] font-medium ${isPeak ? 'text-ag-green-700' : isTrough ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {report.monthly_patterns
                  .slice()
                  .sort((a, b) => a.month_num - b.month_num)
                  .map((item) => {
                    const isPeak = peakMonths.has(item.month_num)
                    const isTrough = troughMonths.has(item.month_num)
                    return (
                      <div key={item.month_num} className={`rounded-xl border px-3 py-2.5 ${isPeak ? 'border-ag-green-200 bg-ag-green-50' : isTrough ? 'border-red-100 bg-red-50' : 'border-border bg-card'}`}>
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold ${isPeak ? 'text-ag-green-700' : isTrough ? 'text-red-700' : 'text-foreground'}`}>{item.month_name}</p>
                          {isPeak ? <TrendingUp className="h-3 w-3 text-ag-green-600" /> : isTrough ? <TrendingDown className="h-3 w-3 text-red-500" /> : null}
                        </div>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">US$ {item.avg_price_usd_kg.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">Pico {item.recurrence_as_peak_pct}% · Caída {item.recurrence_as_trough_pct}%</p>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Ciclos detectados */}
          <Card>
            <CardContent className="gap-4 p-6">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-ag-green-600" />
                <h3 className="text-base font-semibold">Ciclos históricos detectados</h3>
              </div>
              {report.cycles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay suficientes datos para detectar ciclos en el filtro seleccionado.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {report.cycles.map((cycle) => (
                    <div key={cycle.title} className={`rounded-xl border p-4 ${TONE_BADGE[cycle.tone]?.replace('text-', 'border-').split(' ')[0]} bg-card`}>
                      <div className="flex flex-wrap items-start gap-3 md:items-center">
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${TONE_DOT[cycle.tone]}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{cycle.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{cycle.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {cycle.month_labels.map((ml) => (
                              <span key={ml} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TONE_BADGE[cycle.tone]}`}>{ml}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">US$ {cycle.avg_price_usd_kg.toFixed(2)}/kg</p>
                          <p className="text-xs text-muted-foreground">Recurrencia {cycle.recurrence_pct}%</p>
                          <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full ${TONE_BAR[cycle.tone]}`} style={{ width: `${cycle.recurrence_pct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparativo de campañas */}
          <Card>
            <CardContent className="gap-4 p-6">
              <h3 className="text-base font-semibold">Comparativo de campañas (trimestral)</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-170 text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Campaña</th>
                      <th className="px-4 py-3">Precio prom.</th>
                      <th className="px-4 py-3">Volumen</th>
                      <th className="px-4 py-3">Ingreso est.</th>
                      <th className="px-4 py-3">vs anterior</th>
                      <th className="px-4 py-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {report.campaign_comparison.map((row) => (
                      <tr key={row.campaign} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{row.campaign}</td>
                        <td className="px-4 py-3 font-mono text-sm">US$ {row.avg_price_usd_kg.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.total_volume_tons.toLocaleString('es-PE')} t</td>
                        <td className="px-4 py-3 font-mono text-sm">US$ {Math.round(row.total_revenue_usd).toLocaleString('es-PE')}</td>
                        <td className={`px-4 py-3 font-semibold ${VS_TONE(row.vs_previous_label)}`}>
                          {row.vs_previous_label.startsWith('+') ? <TrendingUp className="mr-1 inline h-3.5 w-3.5" /> : row.vs_previous_label.startsWith('-') ? <TrendingDown className="mr-1 inline h-3.5 w-3.5" /> : null}
                          {row.vs_previous_label}
                        </td>
                        <td className={`px-4 py-3 font-medium ${RESULT_TONE[row.result_label] || 'text-foreground'}`}>{row.result_label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function FilterField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function ReportMetric({ label, value, sub, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-4 p-5">
        <div className="rounded-xl bg-muted p-3 text-ag-green-600"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}
