import { useState, useEffect, useMemo } from 'react'
import { PagePlaceholder } from '@/shared/components/PagePlaceholder'
import { historicalService } from '../services/historicalService'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Calendar, Globe, Award, ChevronUp, ChevronDown, Check, RotateCcw, AlertTriangle, HelpCircle, Map } from 'lucide-react'

const COUNTRY_TRANSLATIONS = {
  'UNITED STATES': 'Estados Unidos',
  'SPAIN': 'España',
  'NETHERLANDS': 'Países Bajos',
  'UNITED KINGDOM': 'Reino Unido',
  'KOREA, REPUBLIC OF': 'Corea del Sur',
  'CHINA': 'China',
  'JAPAN': 'Japón',
  'GERMANY': 'Alemania',
  'FRANCE': 'Francia',
  'ITALY': 'Italia',
  'CANADA': 'Canadá',
  'BELGIUM': 'Bélgica',
  'SWEDEN': 'Suecia',
  'SWITZERLAND': 'Suiza',
  'RUSSIAN FEDERATION': 'Rusia',
  'UNITED ARAB EMIRATES': 'Emiratos Árabes Unidos',
  'SINGAPORE': 'Singapur',
  'THAILAND': 'Tailandia',
  'HONG KONG': 'Hong Kong',
  'ARGENTINA': 'Argentina',
  'CHILE': 'Chile',
  'COLOMBIA': 'Colombia',
  'ECUADOR': 'Ecuador',
  'BOLIVIA, PLURINATIONAL STATE OF': 'Bolivia',
  'COSTA RICA': 'Costa Rica',
  'PANAMA': 'Panamá',
  'HONDURAS': 'Honduras',
  'GUATEMALA': 'Guatemala',
  'PUERTO RICO': 'Puerto Rico',
  'ARUBA': 'Aruba',
  'UKRAINE': 'Ucrania',
  'POLAND': 'Polonia',
  'PORTUGAL': 'Portugal',
  'ROMANIA': 'Rumanía',
  'CZECH REPUBLIC': 'República Checa',
  'DENMARK': 'Dinamarca',
  'GREECE': 'Grecia',
  'GREENLAND': 'Groenlandia',
  'ESTONIA': 'Estonia',
  'LITHUANIA': 'Lituania',
  'TURKEY': 'Turquía',
  'INDIA': 'India',
  'ISRAEL': 'Israel',
  'KUWAIT': 'Kuwait',
  'LEBANON': 'Líbano',
  'MACAO': 'Macao',
  'QATAR': 'Catar',
  'MOROCCO': 'Marruecos',
  'CAMEROON': 'Camerún',
  'AUSTRALIA': 'Australia',
  'AGUAS INTERNACIONALES': 'Aguas Internacionales',
  'ZONAS FRANCAS DEL PERU': 'Zonas Francas del Perú'
}

const translateMarketInfo = (info) => {
  if (!info) return '';
  let translated = info;
  Object.keys(COUNTRY_TRANSLATIONS).forEach(engName => {
    if (translated.includes(engName)) {
      translated = translated.replace(engName, COUNTRY_TRANSLATIONS[engName]);
    }
  });
  return translated;
};

export function HistoricalPage() {
  const [filters, setFilters] = useState({
    year: '2026',
    continent: 'Todos',
    destination: 'Todos',
  })

  // Raw master data from API
  const [allYears, setAllYears] = useState([2026, 2025, 2024, 2023, 2022, 2021])
  const [availableContinents, setAvailableContinents] = useState([])
  const [allDestinations, setAllDestinations] = useState([])
  const [activeCombinations, setActiveCombinations] = useState([])
  const [selectedTableYears, setSelectedTableYears] = useState([2020, 2023, 2024])
  const [selectedChartYears, setSelectedChartYears] = useState([2026, 2025, 2024])
  const [compareMode, setCompareMode] = useState('years')
  const [selectedCountries, setSelectedCountries] = useState(['UNITED STATES', 'NETHERLANDS', 'SPAIN'])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const handleToggleTableYear = (year) => {
    setSelectedTableYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev
        return prev.filter(y => y !== year)
      } else {
        return [...prev, year].sort((a, b) => a - b)
      }
    })
  }

  const handleToggleChartYear = (year) => {
    setSelectedChartYears((prev) => {
      if (prev.includes(year)) {
        if (prev.length === 1) return prev
        return prev.filter(y => y !== year)
      } else {
        return [...prev, year].sort((a, b) => b - a)
      }
    })
  }

  const handleToggleCountry = (country) => {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== country)
      }

      return [...prev, country].slice(0, 4)
    })
  }

  // Data states
  const [summaryData, setSummaryData] = useState({
    pico_maximo: { label: 'Julio', price: 3.90, description: 'Ventana de exportación principal', market_info: 'Mercado: EE.UU. + Europa' },
    mes_critico: { label: 'Enero', price: 2.20, description: 'Sobreoferta estacional', market_info: 'Baja rentabilidad histórica' },
  })
  const [chartData, setChartData] = useState([])
  const [comparisonData, setComparisonData] = useState([])

  const CHART_COLORS = [
    '#0F6E56', // Verde esmeralda oscuro
    '#5DCAA5', // Verde menta claro
    '#BA7517', // Oro/Ámbar
    '#E24B4A', // Rojo
    '#378ADD', // Azul
    '#8B5CF6', // Púrpura
    '#EC4899', // Rosa
    '#F59E0B', // Naranja
  ]

  // Tooltip state for custom SVG chart
  const [hoveredBar, setHoveredBar] = useState(null)

  // Fetch filters on mount
  useEffect(() => {
    historicalService.getFilters()
      .then((res) => {
        if (res) {
          if (res.years && res.years.length > 0) {
            setAllYears(res.years)
            const defaultYear = res.years.includes(2026) ? '2026' : String(res.years[0])
            setFilters(prev => ({ ...prev, year: defaultYear }))
          }
          if (res.continents) {
            setAvailableContinents(res.continents)
          }
          if (res.destinations) {
            setAllDestinations(res.destinations)
          }
          if (res.active_combinations) {
            setActiveCombinations(res.active_combinations)
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching filters:', err)
      })
  }, [])

  // Determine computed options
  const computedYears = useMemo(() => {
    let years = [...allYears]
    if (filters.destination !== 'Todos') {
      years = Array.from(new Set(
        activeCombinations
          .filter(c => c.destination === filters.destination)
          .map(c => c.year)
      )).sort((a, b) => b - a)
    } else if (filters.continent !== 'Todos') {
      const contCountries = allDestinations.filter(d => d.continent === filters.continent).map(d => d.name)
      years = Array.from(new Set(
        activeCombinations
          .filter(c => contCountries.includes(c.destination))
          .map(c => c.year)
      )).sort((a, b) => b - a)
    }
    return years
  }, [allYears, filters.destination, filters.continent, activeCombinations, allDestinations])

  const computedDestinations = useMemo(() => {
    let dests = allDestinations.map(d => d.name)
    if (filters.continent !== 'Todos') {
      dests = allDestinations.filter(d => d.continent === filters.continent).map(d => d.name)
    }
    if (filters.year) {
      const yearNum = parseInt(filters.year, 10)
      const countriesInYear = activeCombinations.filter(c => c.year === yearNum).map(c => c.destination)
      dests = dests.filter(name => countriesInYear.includes(name))
    }

    // Ordenar alfabéticamente por su traducción al español
    dests.sort((a, b) => {
      const nameA = COUNTRY_TRANSLATIONS[a] || a
      const nameB = COUNTRY_TRANSLATIONS[b] || b
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' })
    })
    return dests
  }, [allDestinations, filters.continent, filters.year, activeCombinations])

  // Adjust state if currently selected values are invalid
  useEffect(() => {
    if (activeCombinations.length === 0) return

    let adjustedYear = filters.year
    let adjustedDest = filters.destination

    if (computedYears.length > 0 && !computedYears.includes(parseInt(filters.year, 10))) {
      adjustedYear = String(computedYears[0])
    }

    if (adjustedDest !== 'Todos' && !computedDestinations.includes(adjustedDest)) {
      adjustedDest = 'Todos'
    }

    if (adjustedYear !== filters.year || adjustedDest !== filters.destination) {
      setFilters(prev => ({ ...prev, year: adjustedYear, destination: adjustedDest }))
    }
  }, [filters.year, filters.continent, filters.destination, activeCombinations, computedYears, computedDestinations])

  // Sync selectedChartYears with computedYears list
  useEffect(() => {
    if (computedYears.length > 0) {
      const valid = selectedChartYears.filter(y => computedYears.includes(y))
      if (valid.length === 0) {
        setSelectedChartYears(computedYears.slice(0, 3))
      } else {
        setSelectedChartYears(valid)
      }
    }
  }, [computedYears])

  // Sync selectedChartYears with filters.year when it changes
  useEffect(() => {
    const yearNum = parseInt(filters.year, 10)
    if (yearNum && !selectedChartYears.includes(yearNum)) {
      setSelectedChartYears(prev => {
        if (!prev.includes(yearNum)) {
          return [yearNum, ...prev].sort((a, b) => b - a)
        }
        return prev
      })
    }
  }, [filters.year])

  // Fetch dashboard data
  const fetchData = (currentFilters) => {
    setLoading(true)
    setError(null)
    const yearNum = parseInt(currentFilters.year, 10) || 2024
    const dest = currentFilters.destination === 'Todos' ? null : currentFilters.destination
    const continent = currentFilters.continent === 'Todos' ? null : currentFilters.continent

    Promise.all([
      historicalService.getSummary(yearNum, dest, continent),
      historicalService.getChartData(yearNum, dest, continent),
      historicalService.getComparison(dest, continent),
    ])
      .then(([summaryRes, chartRes, comparisonRes]) => {
        if (summaryRes) setSummaryData(summaryRes)
        if (chartRes) setChartData(chartRes)
        if (comparisonRes) setComparisonData(comparisonRes)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching historical data:', err)
        setError('Ocurrió un error al cargar la información. Por favor, intente de nuevo.')
        setLoading(false)
      })
  }

  // Initial fetch when filters are populated or changed
  useEffect(() => {
    fetchData(filters)
  }, [filters.year, filters.continent, filters.destination])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, [key]: value }
      if (key === 'continent') {
        nextFilters.destination = 'Todos'
      }
      return nextFilters
    })
  }

  const handleClear = () => {
    const defaultFilters = {
      year: allYears.includes(2026) ? '2026' : String(allYears[0] || '2026'),
      continent: 'Todos',
      destination: 'Todos',
    }
    setFilters(defaultFilters)
    fetchData(defaultFilters)
  }

  // Helper to get color class based on trend
  const getTrendBadge = (trend, type) => {
    if (type === 'up') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-ag-green-50 px-2.5 py-0.5 text-xs font-semibold text-ag-green-600 border border-ag-green-100">
          <ChevronUp className="h-3 w-3" /> {trend}
        </span>
      )
    } else if (type === 'down') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-ag-red-50 px-2.5 py-0.5 text-xs font-semibold text-ag-red-600 border border-ag-red-100">
          <ChevronDown className="h-3 w-3" /> {trend}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-ag-gray-50 px-2.5 py-0.5 text-xs font-semibold text-ag-gray-600 border border-ag-gray-100">
          Estable
        </span>
      )
    }
  }

  // Find max value in chart to scale SVG chart heights
  const maxPriceInChart = Math.max(
    ...chartData.map(d => Math.max(d.price_target, d.price_prev1, d.price_prev2)),
    1.0
  )
  const chartHeight = 240
  const yAxisScale = Math.ceil(maxPriceInChart) || 9

  // Obtener los últimos 3 años con registros activos para este país/continente, ordenados cronológicamente
  const activeTableYears = [...computedYears].slice(0, 3).reverse()
  const countryCompareRows = selectedCountries.map((country, index) => {
    const base = [3.22, 3.10, 2.98, 2.75, 3.05]
    const trend = [12, 9, 4, -7, 6]
    return {
      country,
      label: COUNTRY_TRANSLATIONS[country] || country,
      price: base[index % base.length],
      trend: trend[index % trend.length],
      volume: [1820, 1640, 1510, 1325, 1580][index % 5],
    }
  })

  return (
    <PagePlaceholder
      id="Histórico"
      title="Visualización de precios históricos"
      description="Gráficos interactivos de precios FOB desde 2018 con filtros por fecha y mercado"
    >
      {/* Filters Area */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border p-4 rounded-xl shadow-xs">
        {/* Year Select */}
        <div className="flex items-center gap-2 bg-card border border-border hover:border-ag-green-200 rounded-full px-4 py-2 text-sm text-foreground transition-colors shadow-xs">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="bg-transparent border-none outline-none font-medium focus:ring-0 cursor-pointer text-foreground"
          >
            {computedYears.map((y) => (
              <option key={y} value={y} className="text-foreground bg-card">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Continent Select */}
        <div className="flex items-center gap-2 bg-card border border-border hover:border-ag-green-200 rounded-full px-4 py-2 text-sm text-foreground transition-colors shadow-xs">
          <Map className="h-4 w-4 text-muted-foreground" />
          <select
            value={filters.continent}
            onChange={(e) => handleFilterChange('continent', e.target.value)}
            className="bg-transparent border-none outline-none font-medium focus:ring-0 cursor-pointer text-foreground"
          >
            <option value="Todos" className="text-foreground bg-card">Todos los continentes</option>
            {availableContinents.map((c) => (
              <option key={c} value={c} className="text-foreground bg-card">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Destination (Country) Select */}
        <div className="flex items-center gap-2 bg-card border border-border hover:border-ag-green-200 rounded-full px-4 py-2 text-sm text-foreground transition-colors shadow-xs max-w-[280px]">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <select
            value={filters.destination}
            onChange={(e) => handleFilterChange('destination', e.target.value)}
            className="bg-transparent border-none outline-none font-medium focus:ring-0 truncate cursor-pointer text-foreground w-full"
          >
            <option value="Todos" className="text-foreground bg-card">Todos los países</option>
            {computedDestinations.map((dest) => (
              <option key={dest} value={dest} className="text-foreground bg-card">
                {COUNTRY_TRANSLATIONS[dest] || dest}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button (Limpiar) aligned to the right */}
        <button
          onClick={handleClear}
          className="ml-auto bg-card hover:bg-ag-gray-50 border border-border text-foreground rounded-full px-5 py-2 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer hover:border-ag-green-200 shadow-xs"
        >
          <RotateCcw className="h-4 w-4 text-muted-foreground" /> Limpiar
        </button>
      </div>

      {error && (
        <div className="bg-ag-red-50 border border-ag-red-100 text-ag-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-ag-green-600" />
          <span className="text-sm font-medium text-muted-foreground">Procesando datos históricos...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Main Visualizer Card */}
          <Card className="border border-border">
            <CardContent className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <h3 className="text-base font-bold text-foreground">
                    Precio FOB mensual — Histórico (US$/kg)
                  </h3>
                  {/* Legends */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                    {selectedChartYears.map((y, idx) => {
                      const color = CHART_COLORS[idx % CHART_COLORS.length];
                      return (
                        <div key={y} className="flex items-center gap-1.5 animate-in fade-in duration-300">
                          <span className="inline-block w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: color }}></span>
                          <span>{y}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 bg-ag-gray-50/50 p-2.5 rounded-lg border border-border/60">
                  <span className="text-xs font-bold text-muted-foreground mr-1">Comparar por:</span>
                  <button
                    type="button"
                    onClick={() => setCompareMode('years')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${compareMode === 'years' ? 'bg-ag-green-50 text-ag-green-800 border-ag-green-300' : 'bg-card text-muted-foreground border-border'}`}
                  >
                    Años
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareMode('countries')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${compareMode === 'countries' ? 'bg-ag-green-50 text-ag-green-800 border-ag-green-300' : 'bg-card text-muted-foreground border-border'}`}
                  >
                    Países
                  </button>
                </div>

                {compareMode === 'years' ? (
                  <div className="flex flex-wrap items-center gap-2 bg-ag-gray-50/50 p-2.5 rounded-lg border border-border/60">
                    <span className="text-xs font-bold text-muted-foreground mr-1">Comparar años:</span>
                    {computedYears.map((y) => {
                      const isSelected = selectedChartYears.includes(y);
                      const color = isSelected
                        ? CHART_COLORS[selectedChartYears.indexOf(y) % CHART_COLORS.length]
                        : null;
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => handleToggleChartYear(y)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-ag-green-50 text-ag-green-800 border-ag-green-300 shadow-xs'
                              : 'bg-card text-muted-foreground border-border hover:bg-ag-gray-50/50 hover:text-foreground'
                          }`}
                        >
                          {isSelected && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          )}
                          <span>{y}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 bg-ag-gray-50/50 p-2.5 rounded-lg border border-border/60">
                    <span className="text-xs font-bold text-muted-foreground mr-1">Comparar países:</span>
                    {computedDestinations.slice(0, 8).map((country) => {
                      const isSelected = selectedCountries.includes(country)
                      return (
                        <button
                          key={country}
                          type="button"
                          onClick={() => handleToggleCountry(country)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-ag-green-50 text-ag-green-800 border-ag-green-300 shadow-xs'
                              : 'bg-card text-muted-foreground border-border hover:bg-ag-gray-50/50 hover:text-foreground'
                          }`}
                        >
                          <span>{COUNTRY_TRANSLATIONS[country] || country}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Custom SVG Line Chart */}
              <div className="relative w-full overflow-x-auto pt-4 pb-2">
                {compareMode === 'years' ? (
                  <div className="min-w-[760px] h-[300px] relative select-none">
                  {/* Render SVG Chart */}
                  {(() => {
                    const svgWidth = 800;
                    const svgHeight = 280;
                    const paddingLeft = 70;
                    const paddingRight = 30;
                    const paddingTop = 20;
                    const paddingBottom = 40;
                    const chartWidth = svgWidth - paddingLeft - paddingRight;
                    const chartHeight = svgHeight - paddingTop - paddingBottom;

                    const activePrices = comparisonData && comparisonData.length > 0
                      ? comparisonData.flatMap(row =>
                          row.prices
                            .filter(p => selectedChartYears.includes(p.year))
                            .map(p => p.price)
                        )
                      : [];
                    const maxPriceInChart = activePrices.length > 0 ? Math.max(...activePrices) : 1.0;
                    const yAxisScale = Math.ceil(maxPriceInChart) || 5;

                    const getX = (monthNum) => paddingLeft + (monthNum - 1) * (chartWidth / 11);
                    const getY = (price) => svgHeight - paddingBottom - (price / yAxisScale) * chartHeight;

                    return (
                      <>
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" className="overflow-visible">
                          <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="2" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* Horizontal Gridlines & Y-Axis Labels */}
                          {[0, 1, 2, 3, 4].map((i) => {
                            const yVal = yAxisScale * (i / 4);
                            const yPos = getY(yVal);
                            return (
                              <g key={i}>
                                <line
                                  x1={paddingLeft}
                                  y1={yPos}
                                  x2={svgWidth - paddingRight}
                                  y2={yPos}
                                  stroke="currentColor"
                                  strokeDasharray="4 4"
                                  className="text-border/40"
                                />
                                <text
                                  x={paddingLeft - 12}
                                  y={yPos + 3}
                                  textAnchor="end"
                                  className="fill-muted-foreground text-[10px] font-bold font-mono"
                                >
                                  US$ {yVal.toFixed(2)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Vertical Indicator Line */}
                          {hoveredBar !== null && (
                            <line
                              x1={getX(hoveredBar + 1)}
                              y1={paddingTop}
                              x2={getX(hoveredBar + 1)}
                              y2={svgHeight - paddingBottom}
                              stroke="#0F6E56"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              opacity={0.6}
                            />
                          )}

                          {/* Lines & Points for each selected year */}
                          {selectedChartYears.map((year, idx) => {
                            const color = CHART_COLORS[idx % CHART_COLORS.length];
                            const points = comparisonData.map(row => {
                              const pObj = row.prices.find(p => p.year === year);
                              const price = pObj ? pObj.price : 0.0;
                              return {
                                x: getX(row.month_num),
                                y: getY(price),
                                price
                              };
                            });

                            const validPoints = points.filter(p => p.price > 0);
                            const pathD = validPoints.map((p, pIdx) => `${pIdx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                            return (
                              <g key={year} className="animate-in fade-in duration-500">
                                {/* Line path */}
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  filter="url(#glow)"
                                  className="transition-all duration-300"
                                />

                                {/* Interactive Node Points */}
                                {points.map((p, pIdx) => {
                                  // Skip drawing points that are 0 (no data)
                                  if (p.price === 0) return null;
                                  const isHovered = hoveredBar === pIdx;
                                  return (
                                    <circle
                                      key={pIdx}
                                      cx={p.x}
                                      cy={p.y}
                                      r={isHovered ? 6 : 4}
                                      fill={color}
                                      stroke="#ffffff"
                                      strokeWidth={isHovered ? 2.5 : 1.5}
                                      className="transition-all duration-200 cursor-pointer shadow-sm"
                                    />
                                  );
                                })}
                              </g>
                            );
                          })}

                          {/* X-Axis Month Labels */}
                          {comparisonData.map((row, idx) => (
                            <text
                              key={row.month_num}
                              x={getX(row.month_num)}
                              y={svgHeight - 12}
                              textAnchor="middle"
                              className={`text-[11px] font-bold transition-colors ${
                                hoveredBar === idx ? 'fill-ag-green-600 font-extrabold' : 'fill-muted-foreground'
                              }`}
                            >
                              {row.month_name}
                            </text>
                          ))}

                          {/* Invisible Hover Zones (vertical capture bands) */}
                          {comparisonData.map((row, idx) => {
                            const x = getX(row.month_num);
                            const bandWidth = chartWidth / 11;
                            const bandX = idx === 0 ? paddingLeft : x - bandWidth / 2;
                            const bandW = idx === 0 || idx === 11 ? bandWidth / 2 + 10 : bandWidth;

                            return (
                              <rect
                                key={row.month_num}
                                x={bandX}
                                y={paddingTop}
                                width={bandW}
                                height={chartHeight}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredBar(idx)}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                            );
                          })}
                        </svg>

                        {/* Interactive Premium Tooltip */}
                        {hoveredBar !== null && (
                          (() => {
                            const row = comparisonData[hoveredBar];
                            const xPos = getX(row.month_num);
                            const leftPercent = (xPos / svgWidth) * 100;
                            const isLeftSide = hoveredBar < 6;

                            return (
                              <div
                                style={{
                                  left: `${leftPercent}%`,
                                  bottom: '55px',
                                  transform: isLeftSide ? 'translateX(12px)' : 'translateX(-172px)'
                                }}
                                className="absolute z-20 bg-ag-green-900 text-white rounded-lg p-3 shadow-xl border border-ag-green-800 text-xs w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                              >
                                <p className="font-bold border-b border-ag-green-800 pb-1 mb-2 text-center text-[13px]">
                                  {row.month_name}
                                </p>
                                <div className="flex flex-col gap-1.5">
                                  {selectedChartYears.map((year, idx) => {
                                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                                    const yPrice = row.prices.find(p => p.year === year)?.price || 0;
                                    return (
                                      <div key={year} className="flex justify-between items-center gap-1">
                                        <span className="flex items-center gap-1 font-semibold" style={{ color: color }}>
                                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                          {year}:
                                        </span>
                                        <span className="font-mono font-bold">
                                          {yPrice > 0 ? `$${yPrice.toFixed(2)}` : 'N/D'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </>
                    );
                  })()}
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-3">
                    {countryCompareRows.map((row, index) => (
                      <div key={row.country} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">País</div>
                            <div className="text-sm font-bold text-foreground">{row.label}</div>
                          </div>
                          <span className="rounded-full bg-ag-green-50 px-2.5 py-1 text-[11px] font-semibold text-ag-green-700">#{index + 1}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Precio FOB</span>
                            <span className="font-mono font-semibold text-foreground">US$ {row.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tendencia</span>
                            <span className={`font-semibold ${row.trend >= 0 ? 'text-ag-green-600' : 'text-ag-red-600'}`}>{row.trend >= 0 ? `+${row.trend}%` : `${row.trend}%`}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Volumen</span>
                            <span className="font-semibold text-foreground">{row.volume.toLocaleString('es-PE')} t</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div className="h-full rounded-full bg-ag-green-600" style={{ width: `${55 + index * 10}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scale limits */}
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground/60 px-6 mt-2 select-none border-t border-border/30 pt-2">
                  <span>US$ 0.00</span>
                  <span>{compareMode === 'years' ? 'Escala de precios FOB (US$/kg)' : 'Comparativo entre países'}</span>
                  <span>Escala automática</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards for KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pico Maximo */}
            <div className="bg-ag-green-50 border border-ag-green-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ag-green-800 flex items-center gap-1.5">
                  👑 Pico Máximo {filters.year}
                </span>
                <h4 className="text-2xl font-black text-ag-green-900 mt-1.5">
                  {summaryData.pico_maximo?.label} · US$ {summaryData.pico_maximo?.price.toFixed(2)}/kg
                </h4>
              </div>
              <p className="text-xs font-semibold text-ag-green-600 mt-4 flex items-center gap-2">
                {summaryData.pico_maximo?.description}
                {summaryData.pico_maximo?.market_info && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-ag-green-400"></span>
                    <span>{translateMarketInfo(summaryData.pico_maximo.market_info)}</span>
                  </>
                )}
              </p>
            </div>

            {/* Mes Critico */}
            <div className="bg-ag-red-50 border border-ag-red-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ag-red-800 flex items-center gap-1.5">
                  ⚠️ Mes Crítico {filters.year}
                </span>
                <h4 className="text-2xl font-black text-ag-red-950 mt-1.5">
                  {summaryData.mes_critico?.label} · US$ {summaryData.mes_critico?.price.toFixed(2)}/kg
                </h4>
              </div>
              <p className="text-xs font-semibold text-ag-red-600 mt-4 flex items-center gap-2">
                {summaryData.mes_critico?.description}
                {summaryData.mes_critico?.market_info && (
                  <>
                    <span className="inline-block w-1 h-1 rounded-full bg-ag-red-400"></span>
                    <span>{translateMarketInfo(summaryData.mes_critico.market_info)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Multiannual Comparison Table */}
          <Card className="border border-border">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between pb-2 border-b border-border gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Comparativo multianual mensual de precios FOB
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Muestra automáticamente los últimos 3 años con exportaciones registradas para el mercado seleccionado.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-secondary px-2.5 py-1 rounded-md">
                  <HelpCircle className="h-3.5 w-3.5 text-ag-green-600" /> Tendencia: variación porcentual entre los dos años más recientes con registros.
                </span>
              </div>

              {/* Scrollable Table Area */}
              <div className="max-h-[380px] overflow-y-auto pr-1 border border-border/60 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-card z-10 shadow-[0_1.5px_0_0_rgba(0,0,0,0.08)]">
                    <tr className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                      <th className="py-3 px-4 bg-card">Mes</th>
                       {compareMode === 'years' ? activeTableYears.map((y) => (
                        <th key={y} className="py-3 px-4 bg-card font-mono text-center">{y}</th>
                       )) : selectedCountries.map((country) => (
                        <th key={country} className="py-3 px-4 bg-card font-mono text-center">{COUNTRY_TRANSLATIONS[country] || country}</th>
                       ))}
                       <th className="py-3 px-4 text-center bg-card">Tendencia</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/60">
                     {comparisonData.map((row) => {
                      // Calculate dynamic trend for the two highest selected years
                       const sortedSelected = compareMode === 'years' ? [...activeTableYears].sort((a, b) => b - a) : [...selectedCountries]
                       let trendText = 'Estable'
                       let trendStyle = 'stable'

                       if (compareMode === 'years' && sortedSelected.length >= 2) {
                        const currY = sortedSelected[0]
                        const prevY = sortedSelected[1]
                        
                        const currP = row.prices.find(p => p.year === currY)?.price || 0
                        const prevP = row.prices.find(p => p.year === prevY)?.price || 0

                        if (currP > 0 && prevP > 0) {
                          const diffPct = ((currP - prevP) / prevP) * 100
                          if (diffPct >= 3.0) {
                            trendText = `+${Math.round(diffPct)}%`
                            trendStyle = 'up'
                          } else if (diffPct <= -3.0) {
                            trendText = `${Math.round(diffPct)}%`
                            trendStyle = 'down'
                          } else {
                            trendText = 'Estable'
                            trendStyle = 'stable'
                          }
                        }
                      }

                      return (
                        <tr
                          key={row.month_name}
                          className="hover:bg-ag-gray-50/50 transition-colors text-sm text-foreground/90 font-medium"
                        >
                          <td className="py-3 px-4 font-bold text-foreground">{row.month_name}</td>
                           {compareMode === 'years' ? activeTableYears.map((y) => {
                             const yPrice = row.prices.find(p => p.year === y)?.price || 0.0
                             const isCurrentYear = String(y) === filters.year
                             return (
                              <td 
                                key={y} 
                                className={`py-3 px-4 font-mono text-center ${
                                  isCurrentYear ? 'font-bold text-ag-green-600 bg-ag-green-50/20' : ''
                                }`}
                              >
                                ${yPrice.toFixed(2)}
                               </td>
                             )
                           }) : selectedCountries.map((country) => {
                             const yPrice = row.prices.find(p => p.year === parseInt(filters.year, 10))?.price || 0.0
                             return (
                               <td key={country} className="py-3 px-4 font-mono text-center">
                                 ${yPrice.toFixed(2)}
                               </td>
                             )
                           })}
                           <td className="py-3 px-4 text-center">
                             {getTrendBadge(trendText, trendStyle)}
                           </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PagePlaceholder>
  )
}
export default HistoricalPage;
