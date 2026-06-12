import { BellRing, Mail, MessageCircle, Radar, ShieldAlert, SunMedium } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const alerts = [
  {
    tone: 'red', icon: ShieldAlert, title: 'Sobreoferta detectada', time: 'Hace 3 horas', tag: '🔴 Riesgo', text: 'El volumen exportado en la última semana superó las proyecciones en un 18%.'
  },
  {
    tone: 'green', icon: Radar, title: 'Ventana favorable EE.UU.', time: 'Ayer, 14:30', tag: '🟢 Oportunidad', text: 'La demanda en EE.UU. muestra tendencia alcista del 12% para las próximas 2 semanas.'
  },
  {
    tone: 'blue', icon: SunMedium, title: 'Riesgo climático moderado', time: 'Hace 5 horas', tag: '🔵 Clima', text: 'Se esperan lluvias intensas en la zona norte de La Libertad durante los próximos 5 días.'
  },
]

export function AlertsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-08</span>
        <span className="text-sm font-medium text-foreground">Envío de alertas y resúmenes</span>
        <span className="ml-auto text-xs text-muted-foreground">Envía vía WhatsApp o correo el pronóstico de precios y la recomendación al productor</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MiniMetric label="Sin leer" value="3" tone="red" />
        <MiniMetric label="Total hoy" value="7" />
        <MiniMetric label="WhatsApp" value="5" tone="green" />
        <MiniMetric label="Email" value="12" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary">Todas</Button>
        <Button variant="secondary" className="text-red-600">🔴 Riesgo</Button>
        <Button variant="secondary" className="text-ag-green-700">🟢 Oportunidad</Button>
        <Button variant="secondary" className="text-sky-600">🔵 Clima</Button>
        <Button variant="secondary">📊 Predicción</Button>
        <div className="ml-auto" />
        <Button variant="secondary">Marcar todas como leídas</Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon
          return (
              <Card key={alert.title} className="border-border">
                <CardContent className="gap-4 p-5 md:flex-row">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${alert.tone === 'red' ? 'bg-red-50 text-red-500' : alert.tone === 'green' ? 'bg-ag-green-50 text-ag-green-600' : 'bg-sky-50 text-sky-500'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className={`rounded-full px-2.5 py-1 ${alert.tone === 'red' ? 'bg-red-50 text-red-600' : alert.tone === 'green' ? 'bg-ag-green-50 text-ag-green-700' : 'bg-sky-50 text-sky-600'}`}>{alert.tag}</span>
                    <span>{alert.time}</span>
                    <span className="ml-auto rounded-full bg-red-50 px-2.5 py-1 text-[10px] text-red-600">No leído</span>
                  </div>
                  <p className="text-sm font-semibold">{alert.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary"><Mail className="mr-2 h-4 w-4" />Enviar email</Button>
                    <Button variant="secondary"><MessageCircle className="mr-2 h-4 w-4" />Enviar WhatsApp</Button>
                    <Button variant="secondary">Marcar leído</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="gap-4 p-6">
          <h3 className="text-base font-semibold">Configuración de envío</h3>
          <ConfigRow icon={MessageCircle} title="WhatsApp" detail="+51 944 123 456" checked />
          <ConfigRow icon={Mail} title="Correo electrónico" detail="jorge.s@agropredict.pe" checked />
          <ConfigRow icon={BellRing} title="Frecuencia de resumen" detail="Semanal (lunes)" selector />
          <ConfigRow icon={ShieldAlert} title="Alertas de riesgo inmediatas" detail="Sobreoferta, caídas >15%, clima adverso" checked />
        </CardContent>
      </Card>
    </div>
  )
}

function MiniMetric({ label, value, tone }) {
  return (
    <Card>
      <CardContent className="gap-1 p-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${tone === 'red' ? 'text-red-500' : tone === 'green' ? 'text-ag-green-600' : 'text-foreground'}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function ConfigRow({ icon: Icon, title, detail, checked, selector }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      {selector ? (
        <div className="rounded-md border border-input bg-secondary px-3 py-2 text-sm">Semanal (lunes)</div>
      ) : (
        <div className="flex items-center gap-2">
          <Checkbox defaultChecked={checked} />
          <span className="text-xs text-muted-foreground">Activo</span>
        </div>
      )}
    </div>
  )
}
