import { useState } from 'react'
import { CalendarDays, Edit3, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const INITIAL_CAMPAIGNS = [
  { id: 'camp-2026-q2', name: 'Campaña 2026 - Q2', region: 'La Libertad', district: 'Virú', status: 'Activa', area: 5, start: '2026-04-01', end: '2026-06-30' },
  { id: 'camp-2026-q3', name: 'Campaña 2026 - Q3', region: 'Piura', district: 'Tambogrande', status: 'Planificada', area: 8, start: '2026-07-01', end: '2026-09-30' },
]

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS)
  const [draft, setDraft] = useState(INITIAL_CAMPAIGNS[0])
  const [editingId, setEditingId] = useState(INITIAL_CAMPAIGNS[0].id)

  const saveCampaign = () => {
    setCampaigns((current) => {
      if (current.some((item) => item.id === editingId)) {
        return current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item))
      }

      return [...current, { ...draft, id: `camp-${Date.now()}` }]
    })
  }

  const newCampaign = () => {
    setEditingId(null)
    setDraft({ id: '', name: 'Nueva campaña', region: 'La Libertad', district: 'Virú', status: 'Planificada', area: 4, start: '2026-01-01', end: '2026-03-31' })
  }

  const editCampaign = (campaign) => {
    setEditingId(campaign.id)
    setDraft(campaign)
  }

  const removeCampaign = (id) => {
    setCampaigns((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">Campañas</span>
        <span className="text-sm font-medium text-foreground">CRUD de campañas</span>
        <span className="ml-auto text-xs text-muted-foreground">Administra campañas simuladas para guardar escenarios</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-ag-green-100 bg-gradient-to-br from-ag-green-50 to-white">
          <CardContent className="gap-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-ag-green-600">Formulario</p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{editingId ? 'Editar campaña' : 'Nueva campaña'}</h2>
              </div>
              <div className="rounded-xl bg-ag-green-100 p-3 text-ag-green-700"><CalendarDays className="h-5 w-5" /></div>
            </div>

            <Field label="Nombre" value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value }))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Región" value={draft.region} onChange={(value) => setDraft((current) => ({ ...current, region: value }))} />
              <Field label="Distrito" value={draft.district} onChange={(value) => setDraft((current) => ({ ...current, district: value }))} />
              <Field label="Área (ha)" value={draft.area} onChange={(value) => setDraft((current) => ({ ...current, area: Number(value) }))} />
              <Field label="Estado" value={draft.status} onChange={(value) => setDraft((current) => ({ ...current, status: value }))} />
              <Field label="Inicio" value={draft.start} onChange={(value) => setDraft((current) => ({ ...current, start: value }))} />
              <Field label="Fin" value={draft.end} onChange={(value) => setDraft((current) => ({ ...current, end: value }))} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveCampaign} className="gap-2"><Edit3 className="h-4 w-4" />Guardar</Button>
              <Button variant="secondary" onClick={newCampaign} className="gap-2"><Plus className="h-4 w-4" />Nueva</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-4 p-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Campañas registradas</h3>
              <p className="text-xs text-muted-foreground">Mock CRUD, sin persistencia real.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-4 py-3">Campaña</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-4 py-4"><div className="font-medium text-foreground">{campaign.name}</div><div className="text-xs text-muted-foreground">{campaign.start} / {campaign.end}</div></td>
                      <td className="px-4 py-4 text-muted-foreground">{campaign.region} · {campaign.district}</td>
                      <td className="px-4 py-4"><span className="rounded-full bg-ag-green-50 px-2.5 py-1 text-xs font-medium text-ag-green-700">{campaign.status}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => editCampaign(campaign)}>Editar</Button>
                          <Button variant="secondary" size="sm" className="text-red-600" onClick={() => removeCampaign(campaign.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
