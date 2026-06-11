import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const roles = [
  { id: 'productor', emoji: '🌾', label: 'Productor' },
  { id: 'asesor', emoji: '👨‍💼', label: 'Asesor' },
  { id: 'admin', emoji: '⚙️', label: 'Administrador' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [keepSession, setKeepSession] = useState(true)
  const [selectedRole, setSelectedRole] = useState('productor')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <header className="bg-ag-green-800 px-6 py-3 flex items-center gap-4 sticky top-0 z-50 shadow-[0_2px_20px_rgba(4,52,44,0.3)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 bg-ag-green-400 rounded-[9px] flex items-center justify-center text-lg">🌿</div>
          <div>
            <div className="text-base font-semibold text-white tracking-[-0.3px]">AgroPredict</div>
            <div className="text-[11px] text-ag-green-100 -mt-px">La Libertad, Perú</div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 max-w-275 mx-auto w-full">
        <div className="max-w-105 mx-auto pt-5 flex flex-col gap-3">
          <div className="relative overflow-hidden bg-gradient-to-br from-ag-green-800 to-primary rounded-xl px-6 py-8 text-center shadow-[0_4px_24px_rgba(29,158,117,0.25)]">
            <div className="w-15 h-15 bg-white rounded-2xl mx-auto mb-3.5 flex items-center justify-center text-3xl">🌿</div>
            <h1 className="text-[22px] font-bold text-white mb-1.5">AgroPredict</h1>
            <p className="text-[13px] text-white/75 leading-relaxed">
              Sistema predictivo de precios FOB de palta Hass
              <br />
              Productores agrícolas · La Libertad, Perú
            </p>
          </div>

          <Card>
            <CardContent>
              <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <div className="text-sm font-semibold">Iniciar sesión</div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">📧 Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="productor@ejemplo.pe"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">🔒 Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                    <Checkbox
                      checked={keepSession}
                      onCheckedChange={(value) => setKeepSession(Boolean(value))}
                    />
                    Mantener sesión
                  </label>
                  <a href="#" className="text-primary hover:underline" onClick={(e) => e.preventDefault()}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                {error ? <p className="text-xs text-ag-red-600">{error}</p> : null}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Ingresando...' : '🔑 Ingresar al sistema'}
                </Button>

                <div className="h-px bg-border" />

                <p className="text-xs font-semibold">Selecciona tu rol de acceso</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {roles.map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        'rounded-lg border-[1.5px] border-input bg-card px-2.5 py-3.5 text-center transition-all hover:border-ag-green-200 hover:bg-ag-green-50',
                        selectedRole === role.id &&
                          'border-primary bg-ag-green-50 shadow-[0_0_0_3px_rgba(29,158,117,0.15)]'
                      )}
                    >
                      <div className="text-2xl mb-1.5">{role.emoji}</div>
                      <div className="text-xs font-medium text-muted-foreground">{role.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-start rounded-(--radius) border border-ag-green-100 bg-ag-green-50 px-3.5 py-2.5">
                  <span className="text-base">🛡️</span>
                  <p className="text-[11px] leading-relaxed text-ag-green-600">
                    Acceso seguro con autenticación por rol. Cada perfil tiene permisos diferenciados según sus
                    responsabilidades en el sistema.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
