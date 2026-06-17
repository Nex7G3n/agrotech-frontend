import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BadgeCheck, Download, Edit3, Filter, Loader2, Mail, Search, Shield, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/modules/auth/context/AuthContext'
import { usersService } from '../services/usersService'

const ROLE_OPTIONS = [
  { value: 'user', label: 'Productor' },
  { value: 'asesor', label: 'Asesor' },
  { value: 'admin', label: 'Administrador' },
]

function roleLabel(role, isAdmin) {
  if (isAdmin || role === 'admin') return 'Admin'
  if (role === 'asesor') return 'Asesor'
  return 'Productor'
}

function roleTone(role, isAdmin) {
  if (isAdmin || role === 'admin') return 'amber'
  if (role === 'asesor') return 'blue'
  return 'green'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function UsersPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ role: 'user', is_active: true, is_admin: false })
  const [saving, setSaving] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await usersService.list()
      setUsers(data)
    } catch (err) {
      setError(err.message || 'No se pudo cargar la lista de usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin, loadUsers])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        roleLabel(user.role, user.is_admin).toLowerCase().includes(query)

      const matchesRole =
        roleFilter === 'Todos' ||
        (roleFilter === 'Admins' && (user.is_admin || user.role === 'admin')) ||
        (roleFilter === 'Asesores' && user.role === 'asesor') ||
        (roleFilter === 'Productores' && user.role === 'user' && !user.is_admin)

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  const metrics = useMemo(() => {
    const total = users.length
    const admins = users.filter((user) => user.is_admin || user.role === 'admin').length
    const asesores = users.filter((user) => user.role === 'asesor').length
    const productores = users.filter((user) => user.role === 'user' && !user.is_admin).length
    return { total, admins, asesores, productores }
  }, [users])

  const openEdit = (user) => {
    setEditingUser(user)
    setEditForm({
      role: user.role,
      is_active: user.is_active,
      is_admin: user.is_admin,
    })
  }

  const saveEdit = async () => {
    if (!editingUser) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        role: editForm.is_admin ? 'admin' : editForm.role,
        is_active: editForm.is_active,
        is_admin: editForm.is_admin,
      }
      const updated = await usersService.update(editingUser.id, payload)
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setEditingUser(null)
    } catch (err) {
      setError(err.message || 'No se pudo guardar el usuario')
    } finally {
      setSaving(false)
    }
  }

  const removeUser = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return
    setError('')
    try {
      await usersService.remove(user.id)
      setUsers((current) => current.filter((item) => item.id !== user.id))
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario')
    }
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Card>
          <CardContent className="gap-3 p-6 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Acceso restringido</p>
            <p>La gestión de usuarios está disponible solo para administradores.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-6 py-2.5">
        <span className="rounded-md border border-ag-green-100 bg-ag-green-50 px-2.5 py-1 font-mono text-[11px] font-medium text-ag-green-600">F-02</span>
        <span className="text-sm font-medium text-foreground">Gestión de usuarios</span>
        <span className="ml-auto text-xs text-muted-foreground">Listado conectado al backend · editar rol y estado</span>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total usuarios" value={loading ? '...' : String(metrics.total)} sub="Registrados" icon={Users} />
        <Metric label="Productores" value={loading ? '...' : String(metrics.productores)} sub="Rol user" icon={BadgeCheck} />
        <Metric label="Asesores" value={loading ? '...' : String(metrics.asesores)} sub="Rol asesor" icon={Mail} />
        <Metric label="Administradores" value={loading ? '...' : String(metrics.admins)} sub="Admin / is_admin" icon={Shield} />
      </div>

      <Card>
        <CardContent className="gap-4 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nombre, correo o rol..." className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="gap-2" onClick={loadUsers} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
                Actualizar
              </Button>
              <Button variant="secondary" className="gap-2" disabled>
                <Download className="h-4 w-4" />Exportar
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Todos', 'Productores', 'Asesores', 'Admins'].map((pill) => (
              <Pill key={pill} active={roleFilter === pill} onClick={() => setRoleFilter(pill)}>
                {pill}
              </Pill>
            ))}
          </div>

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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Sin usuarios que coincidan con el filtro</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ag-green-50 text-sm font-semibold text-ag-green-700">
                            {user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <RoleBadge tone={roleTone(user.role, user.is_admin)}>{roleLabel(user.role, user.is_admin)}</RoleBadge>
                      </td>
                      <td className="px-4 py-4">
                        {user.is_active ? <StatusBadge tone="green">Activo</StatusBadge> : <StatusBadge tone="gray">Inactivo</StatusBadge>}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" className="gap-2" onClick={() => openEdit(user)}>
                            <Edit3 className="h-4 w-4" />Editar
                          </Button>
                          <Button variant="secondary" size="sm" className="text-red-600" onClick={() => removeUser(user)}>
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
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </CardContent>
      </Card>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setEditingUser(null)}>
          <Card className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
            <CardContent className="gap-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">Editar usuario</h3>
                  <p className="text-xs text-muted-foreground">{editingUser.email}</p>
                </div>
                <button type="button" className="rounded-lg border border-border p-2 text-muted-foreground" onClick={() => setEditingUser(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-semibold text-foreground">Rol</span>
                  <select
                    className="h-9 rounded-(--radius) border border-input bg-secondary px-3 text-sm"
                    value={editForm.is_admin ? 'admin' : editForm.role}
                    onChange={(event) => {
                      const value = event.target.value
                      if (value === 'admin') {
                        setEditForm({ role: 'admin', is_admin: true, is_active: editForm.is_active })
                      } else {
                        setEditForm({ ...editForm, role: value, is_admin: false })
                      }
                    }}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
                  <span>Cuenta activa</span>
                  <input type="checkbox" checked={editForm.is_active} onChange={(event) => setEditForm((current) => ({ ...current, is_active: event.target.checked }))} />
                </label>
              </div>

              <div className="flex gap-2">
                <Button className="gap-2" onClick={saveEdit} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                  Guardar cambios
                </Button>
                <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancelar</Button>
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

function Pill({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
