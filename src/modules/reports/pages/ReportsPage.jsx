import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BarChart3, Download, Globe2, LineChart, Loader2, PieChart, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { historicalService } from '@/modules/historical/services/historicalService'
import { reportsService } from '@/modules/reports/services/reportsService'

const TONE_DOT = {
  green: 'bg-ag-green-500',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
}

const RESULT_TONE = {
  'Muy bueno': 'text-ag-green-700',
  Bueno: 'text-ag-green-600',
  Regular: 'text-amber-600',
  Débil: 'text-red-600',
  'Sin referencia': 'text-muted-foreground',
}

export function ReportsPage() {
  const [filterOptions, setFilterOptions] = useState(null)
  const [filters, setFilters] = useState({
    yearFrom: '',
    yearTo: '',
    continent: 'Todos',
    destination: 'Todos',
  })
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
        setFilters((current) => ({
          ...current,
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
      const data = await reportsService.getCyclesReport({
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        destination: filters.destination,
        continent: filters.continent,
      })
      setReport(data)
    } catch (err) {
      setError(err.message)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (filters.yearFrom && filters.yearTo) {
      loadReport()
    }
  }, [filters.yearFrom, filters.yearTo, filters.destination, filters.continent, loadReport])

  const updateFilter = (key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value }
      if (key === 'continent') next.destination = 'Todos'
      return next
    })
  }

  const downloadPdf = async () => {
    setDownloading(true)
    setError('')
    try {
      await reportsService.downloadCyclesPdf({
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        destination: filters.destination,
        continent: filters.continent,
      })
    } catch (err) {
      setError(err.message || 'No se pudo descargar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-07</span>
        <span className="text-sm font-medium text-foreground">Generación de reportes de ciclos</span>
        <span className="ml-auto text-xs text-muted-foreground">Patrones históricos reales desde la base de precios FOB</span>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : null}

      <Card>
        <CardContent className="gap-4 p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <FilterField label="Año desde">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.yearFrom} onChange={(e) => updateFilter('yearFrom', e.target.value)}>
                {(filterOptions?.years || []).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Año hasta">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.yearTo} onChange={(e) => updateFilter('yearTo', e.target.value)}>
                {(filterOptions?.years || []).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Continente">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.continent} onChange={(e) => updateFilter('continent', e.target.value)}>
                <option value="Todos">Todos</option>
                {(filterOptions?.continents || []).map((continent) => (
                  <option key={continent} value={continent}>{continent}</option>
                ))}
              </select>
            </FilterField>
            <FilterField label="Mercado">
              <select className="h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm" value={filters.destination} onChange={(e) => updateFilter('destination', e.target.value)}>
                <option value="Todos">Todos</option>
                {destinationsForContinent.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </FilterField>
            <div className="flex items-end gap-2">
              <Button onClick={loadReport} disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Actualizar reporte
              </Button>
              <Button
                variant="secondary"
                onClick={downloadPdf}
                disabled={downloading || !report}
                className="w-full gap-2 whitespace-nowrap"
                title={report ? 'Descargar reporte en PDF' : 'Genera el reporte primero'}
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Descargar PDF
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
        <div className="py-16 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ReportMetric
              label="Semanas analizadas"
              value={report.summary.semanas_analizadas.toLocaleString('es-PE')}
              sub={report.summary.periodo_label}
              icon={BarChart3}
            />
            <ReportMetric
              label="Precio promedio"
              value={`US$ ${report.summary.precio_promedio_usd_kg.toFixed(2)}`}
              sub="US$/kg histórico"
              icon={LineChart}
            />
            <ReportMetric
              label="Ciclos detectados"
              value={String(report.summary.ciclos_detectados)}
              sub="Patrones estacionales"
              icon={PieChart}
            />
            <ReportMetric
              label="Años analizados"
              value={String(report.summary.anos_analizados)}
              sub={report.summary.mercado_label}
              icon={Globe2}
            />
          </div>

          <Card>
            <CardContent className="gap-4 p-6">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-ag-green-600" />
                <h3 className="text-base font-semibold">Ciclos históricos detectados</h3>
              </div>
              {report.cycles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay suficientes datos para detectar ciclos en el filtro seleccionado.</p>
              ) : (
                <div className="space-y-3">
                  {report.cycles.map((cycle) => (
                    <CycleRow
                      key={cycle.title}
                      title={cycle.title}
                      desc={`${cycle.description} · Detectado en ${cycle.recurrence_pct}% de campañas analizadas`}
                      pct={`${cycle.recurrence_pct}%`}
                      tone={cycle.tone}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-4 p-6">
              <h3 className="text-base font-semibold">Comparativo de campañas (trimestral)</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Campaña</th>
                      <th className="px-4 py-3">Precio promedio</th>
                      <th className="px-4 py-3">Volumen exportado</th>
                      <th className="px-4 py-3">Ingreso estimado</th>
                      <th className="px-4 py-3">vs anterior</th>
                      <th className="px-4 py-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {report.campaign_comparison.map((row) => (
                      <tr key={row.campaign}>
                        <td className="px-4 py-3 font-medium text-foreground">{row.campaign}</td>
                        <td className="px-4 py-3">US$ {row.avg_price_usd_kg.toFixed(2)}/kg</td>
                        <td className="px-4 py-3">{row.total_volume_tons.toLocaleString('es-PE')} t</td>
                        <td className="px-4 py-3">US$ {Math.round(row.total_revenue_usd).toLocaleString('es-PE')}</td>
                        <td className="px-4 py-3">{row.vs_previous_label}</td>
                        <td className={`px-4 py-3 font-medium ${RESULT_TONE[row.result_label] || 'text-foreground'}`}>{row.result_label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-4 p-6">
              <h3 className="text-base font-semibold">Patrones mensuales</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {report.monthly_patterns.map((item) => (
                  <div key={item.month_num} className="rounded-xl border border-border px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.month_name}</p>
                      <p className="text-sm font-medium text-ag-green-700">US$ {item.avg_price_usd_kg.toFixed(2)}/kg</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pico {item.recurrence_as_peak_pct}% · Caída {item.recurrence_as_trough_pct}%
                    </p>
                  </div>
                ))}
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

function CycleRow({ title, desc, pct, tone = 'green' }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-4 md:flex-row md:items-center">
      <span className={`h-2.5 w-2.5 rounded-full ${TONE_DOT[tone] || TONE_DOT.green}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{pct}</span>
    </div>
  )
}
