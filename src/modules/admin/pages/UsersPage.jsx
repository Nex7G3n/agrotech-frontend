import { useState } from 'react'
import { BadgeCheck, Download, Edit3, Filter, Mail, Search, Shield, UserPlus, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const users = [
  { initials: 'JS', name: 'Jorge Sánchez', place: 'Trujillo, La Libertad', email: 'jorge.s@agropredict.pe', role: 'Productor', roleTone: 'green', status: 'Activo', lastAccess: 'Hoy, 09:34' },
  { initials: 'MR', name: 'María Ríos', place: 'Virú, La Libertad', email: 'm.rios@agropredict.pe', role: 'Asesor', roleTone: 'blue', status: 'Activo', lastAccess: 'Ayer, 15:21' },
  { initials: 'CA', name: 'César Aranda', place: 'Trujillo, La Libertad', email: 'c.aranda@agropredict.pe', role: 'Admin', roleTone: 'amber', status: 'Activo', lastAccess: 'Hoy, 08:12' },
  { initials: 'LP', name: 'Luis Pérez', place: 'Chao, La Libertad', email: 'l.perez@agropredict.pe', role: 'Productor', roleTone: 'green', status: 'Inactivo', lastAccess: '03 May, 11:45' },
]

export function UsersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-02</span>
        <span className="text-sm font-medium text-foreground">Gestión de usuarios</span>
        <span className="ml-auto text-xs text-muted-foreground">Permite crear, listar y editar usuarios del sistema</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total usuarios" value="63" sub="Registrados" icon={Users} />
        <Metric label="Productores" value="48" sub="76% del total" icon={BadgeCheck} />
        <Metric label="Asesores" value="12" sub="Técnicos" icon={Mail} />
        <Metric label="Administradores" value="3" sub="Activos" icon={Shield} />
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="gap-4 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nombre, correo o rol..." className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="gap-2"><Filter className="h-4 w-4" />Filtros</Button>
                <Button variant="secondary" className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
                <Button className="gap-2"><UserPlus className="h-4 w-4" />Nuevo usuario</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill active>Todos</Pill>
              <Pill>Productores</Pill>
              <Pill>Asesores</Pill>
              <Pill>Admins</Pill>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {users.map((user) => (
                    <tr key={user.email} className="align-middle">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ag-green-50 text-sm font-semibold text-ag-green-700">{user.initials}</div>
                          <div>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.place}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <RoleBadge tone={user.roleTone}>{user.role}</RoleBadge>
                      </td>
                      <td className="px-4 py-4">
                        {user.status === 'Activo' ? <StatusBadge tone="green">Activo</StatusBadge> : <StatusBadge tone="gray">Inactivo</StatusBadge>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" className="gap-2" onClick={() => setDialogOpen(true)}><Edit3 className="h-4 w-4" />Editar</Button>
                          <Button variant="secondary" size="sm" className="text-red-600">Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Mostrando 4 de 63 usuarios</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="secondary" size="sm">Anterior</Button>
                <span className="rounded-lg bg-ag-green-600 px-3 py-1 text-white">1</span>
                <Button variant="secondary" size="sm">Siguiente</Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setDialogOpen(false)}>
          <Card className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
            <CardContent className="gap-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">Editar usuario</h3>
                  <p className="text-xs text-muted-foreground">Diálogo simulado para edición rápida</p>
                </div>
                <button type="button" className="rounded-lg border border-border p-2 text-muted-foreground" onClick={() => setDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-secondary p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ag-green-600 text-sm font-semibold text-white">JS</div>
                  <div>
                    <div className="font-medium">Jorge Sánchez</div>
                    <div className="text-xs text-muted-foreground">Productor · Trujillo</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5 text-sm">
                  <Line label="Correo" value="jorge.s@agropredict.pe" />
                  <Line label="Rol" value="Productor" />
                  <Line label="Estado" value="Activo" />
                  <Line label="Último acceso" value="Hoy, 09:34" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="gap-2"><Edit3 className="h-4 w-4" />Guardar cambios</Button>
                <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function Metric({ label, value, sub, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-4 p-5">
        <div className="rounded-xl bg-ag-green-50 p-3 text-ag-green-600"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function Pill({ children, active = false }) {
  return (
    <button
      type="button"
      className={active ? 'rounded-full border border-ag-green-200 bg-ag-green-50 px-3 py-1.5 text-xs font-medium text-ag-green-700' : 'rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground'}
    >
      {children}
    </button>
  )
}

function RoleBadge({ tone, children }) {
  const tones = {
    green: 'bg-ag-green-50 text-ag-green-700 border-ag-green-100',
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  }

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

function StatusBadge({ tone, children }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    gray: 'bg-muted text-muted-foreground border-border',
  }

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}
