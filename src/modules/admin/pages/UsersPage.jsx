import { useEffect, useState } from 'react'
import { BadgeCheck, Edit3, Mail, Search, Shield, UserPlus, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usersService } from '../services/usersService'

const ROLE_OPTIONS = ['user', 'admin']

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(iso) {
  if (!iso) return '—'
  const date = new Date(String(iso).replace(' ', 'T'))
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}


export function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', role: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    usersService
      .list()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openEdit = (user) => {
    setEditing(user)
    setEditForm({ name: user.name, role: user.role })
    setSaveError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const updated = await usersService.update(editing.id, editForm)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setEditing(null)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return
    try {
      await usersService.remove(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err) {
      alert(err.message)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    const matchRole = roleFilter === 'todos' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const counts = {
    total: users.length,
    activos: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.is_admin).length,
    roles: [...new Set(users.map((u) => u.role))].length,
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.25 py-0.75 font-mono text-[11px] font-medium text-ag-green-600">F-02</span>
        <span className="text-sm font-medium text-foreground">Gestión de usuarios</span>
        <span className="ml-auto text-xs text-muted-foreground">Listado conectado al backend · editar rol y estado</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total usuarios" value={counts.total} sub="Registrados" icon={Users} />
        <MetricCard label="Activos" value={counts.activos} sub={`${counts.total ? Math.round((counts.activos / counts.total) * 100) : 0}% del total`} icon={BadgeCheck} />
        <MetricCard label="Administradores" value={counts.admins} sub="Con acceso total" icon={Shield} />
        <MetricCard label="Roles distintos" value={counts.roles} sub="En el sistema" icon={Mail} />
      </div>

      <Card>
        <CardContent className="gap-4 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o rol..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button className="gap-2" disabled>
              <UserPlus className="h-4 w-4" />Nuevo usuario
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['todos', ...ROLE_OPTIONS].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={roleFilter === r
                  ? 'rounded-full border border-ag-green-200 bg-ag-green-50 px-3 py-1.5 text-xs font-medium text-ag-green-700'
                  : 'rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary'}
              >
                {r === 'todos' ? 'Todos' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Cargando usuarios...</div>
          ) : error ? (
            <div className="rounded-lg border border-ag-red-100 bg-ag-red-50 px-4 py-3 text-sm text-ag-red-600">
              Error: {error} —{' '}
              <button type="button" className="underline" onClick={load}>reintentar</button>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">Rol</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Registro</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => (
                        <tr key={user.id} className="align-middle">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ag-green-50 text-sm font-semibold text-ag-green-700">
                                {getInitials(user.name)}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <RoleBadge role={user.role} isAdmin={user.is_admin} />
                          </td>
                          <td className="px-4 py-4">
                            {user.is_active
                              ? <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Activo</span>
                              : <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Inactivo</span>}
                          </td>
                          <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(user.created_at)}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => openEdit(user)}>
                                <Edit3 className="h-3.5 w-3.5" />Editar
                              </Button>
                              <Button variant="secondary" size="sm" className="text-ag-red-600 hover:bg-ag-red-50" onClick={() => handleDelete(user)}>
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-muted-foreground">
                Mostrando {filtered.length} de {users.length} usuarios
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditing(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardContent className="gap-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">Editar usuario</h3>
                  <p className="text-xs text-muted-foreground">{editing.email}</p>
                </div>
                <button type="button" className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary" onClick={() => setEditing(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-role">Rol</Label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className="flex h-9 w-full rounded-(--radius) border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              {saveError ? <p className="text-xs text-ag-red-600">{saveError}</p> : null}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ label, value, sub, icon: Icon }) {
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

function RoleBadge({ role, isAdmin }) {
  if (isAdmin || role === 'admin') {
    return <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Admin</span>
  }
  const label = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Usuario'
  return <span className="rounded-full border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 text-xs font-medium text-ag-green-700">{label}</span>
}
