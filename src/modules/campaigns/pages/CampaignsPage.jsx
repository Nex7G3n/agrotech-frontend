import { useEffect, useState } from 'react'
import { AlertCircle, CalendarDays, Edit3, Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { profitabilityService } from '@/modules/profitability/services/profitabilityService'

const EMPTY_DRAFT = {
  name: 'Nueva campaña',
  region: 'LA LIBERTAD',
  district: 'VIRU',
  status: 'Planificada',
  area_ha: 4,
  start_date: '2026-01-01',
  end_date: '2026-03-31',
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await profitabilityService.listCampaigns()
      setCampaigns(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  const saveCampaign = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = { ...draft, area_ha: Number(draft.area_ha) }
      if (editingId) {
        await profitabilityService.updateCampaign(editingId, payload)
      } else {
        await profitabilityService.createCampaign(payload)
      }
      await load()
      newCampaign()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const newCampaign = () => {
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
  }

  const editCampaign = (campaign) => {
    setEditingId(campaign.id)
    setDraft({
      name: campaign.name,
      region: campaign.region,
      district: campaign.district,
      status: campaign.status,
      area_ha: campaign.area_ha,
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
    })
  }

  const removeCampaign = async (id) => {
    setError('')
    try {
      await profitabilityService.deleteCampaign(id)
      if (editingId === id) newCampaign()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">Campañas</span>
        <span className="text-sm font-medium text-foreground">CRUD de campañas</span>
        <span className="ml-auto text-xs text-muted-foreground">Administra campañas guardadas en la base de datos</span>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      ) : null}

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

            <Field label="Nombre" value={draft.name} onChange={(value) => setField('name', value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Región" value={draft.region} onChange={(value) => setField('region', value)} />
              <Field label="Provincia / Distrito" value={draft.district} onChange={(value) => setField('district', value)} />
              <Field label="Área (ha)" type="number" value={draft.area_ha} onChange={(value) => setField('area_ha', value)} />
              <Field label="Estado" value={draft.status} onChange={(value) => setField('status', value)} />
              <Field label="Inicio" type="date" value={draft.start_date} onChange={(value) => setField('start_date', value)} />
              <Field label="Fin" type="date" value={draft.end_date} onChange={(value) => setField('end_date', value)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={saveCampaign} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}Guardar
              </Button>
              <Button variant="secondary" onClick={newCampaign} className="gap-2"><Plus className="h-4 w-4" />Nueva</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-4 p-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Campañas registradas</h3>
              <p className="text-xs text-muted-foreground">Persistidas en la base de datos del backend.</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-4 py-3">Campaña</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
                  ) : campaigns.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No hay campañas. Crea la primera con el formulario.</td></tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="px-4 py-4"><div className="font-medium text-foreground">{campaign.name}</div><div className="text-xs text-muted-foreground">{campaign.start_date || '—'} / {campaign.end_date || '—'}</div></td>
                        <td className="px-4 py-4 text-muted-foreground">{campaign.region} · {campaign.district}</td>
                        <td className="px-4 py-4"><span className="rounded-full bg-ag-green-50 px-2.5 py-1 text-xs font-medium text-ag-green-700">{campaign.status}</span></td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => editCampaign(campaign)}>Editar</Button>
                            <Button variant="secondary" size="sm" className="text-red-600" onClick={() => removeCampaign(campaign.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
