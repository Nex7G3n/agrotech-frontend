import { BarChart3, Download, Globe2, LineChart, PieChart, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const rows = [
  ['2024 - Q2', 'US$ 3.41/kg', '5,200 t', '$17,732,000', '📈 +18%', 'Muy bueno'],
  ['2023 - Q2', 'US$ 3.15/kg', '4,800 t', '$15,120,000', 'Base', 'Bueno'],
  ['2022 - Q2', 'US$ 3.58/kg', '4,500 t', '$16,110,000', '📈 +14%', 'Muy bueno'],
  ['2021 - Q2', 'US$ 2.80/kg', '4,200 t', '$11,760,000', '📉 -8%', 'Regular'],
]

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-07</span>
        <span className="text-sm font-medium text-foreground">Generación de reportes de ciclos</span>
        <span className="ml-auto text-xs text-muted-foreground">Analiza patrones históricos y genera informe comparativo con campañas anteriores</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Generar reporte</Button>
        <Button variant="secondary"><Download className="mr-2 h-4 w-4" />Descargar PDF</Button>
        <Button variant="secondary">Exportar Excel</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetric label="Semanas analizadas" value="156" sub="2021 - 2024" icon={BarChart3} />
        <ReportMetric label="Precio promedio" value="US$ 3.08" sub="US$/kg histórico" icon={LineChart} />
        <ReportMetric label="Ciclos detectados" value="3" sub="Patrones recurrentes" icon={PieChart} />
        <ReportMetric label="Precisión modelo" value="91%" sub="Detección ciclos" icon={Sparkles} />
      </div>

      <Card>
        <CardContent className="gap-4 p-6">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-ag-green-600" />
            <h3 className="text-base font-semibold">Ciclos históricos detectados</h3>
          </div>
          <div className="space-y-3">
            <CycleRow title="Pico Jul-Ago · Ventana de exportación principal" desc="Promedio histórico US$ 3.80/kg · Detectado en 3 de 3 campañas analizadas" pct="100%" />
            <CycleRow title="Caída Dic-Feb · Sobreoferta estacional" desc="Promedio US$ 2.10/kg · Alta concentración de exportaciones peruanas" pct="100%" tone="red" />
            <CycleRow title="Recuperación Abr-Jun · Alza progresiva" desc="Promedio US$ 3.20/kg · Apertura de ventana comercial Q2" pct="67%" tone="amber" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="gap-4 p-6">
          <h3 className="text-base font-semibold">Comparativo de campañas</h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Campaña</th><th className="px-4 py-3">Precio promedio</th><th className="px-4 py-3">Volumen exportado</th><th className="px-4 py-3">Ingreso total</th><th className="px-4 py-3">vs anterior</th><th className="px-4 py-3">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
                      <td key={index} className="px-4 py-3 text-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
  const toneMap = {
    green: 'bg-ag-green-500',
    amber: 'bg-amber-400',
    red: 'bg-red-500',
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-4 md:flex-row md:items-center">
      <span className={`h-2.5 w-2.5 rounded-full ${toneMap[tone]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{pct}</span>
    </div>
  )
}
