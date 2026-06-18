import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import imgLogin from '@/assets/img-login.jpg'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('expired') === '1'
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((c) => ({ ...c, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
    <div className="relative flex min-h-screen overflow-hidden bg-[#f8faf8] font-sans">
      {/* Panel izquierdo — imagen */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[44%]">
        <img
          src={imgLogin}
          alt="Productor sosteniendo palta Hass en La Libertad, Perú"
          className="h-full w-full object-cover"
        />
        {/* Gradiente oscuro sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Logo sobre la imagen */}
        <div className="absolute left-8 top-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg backdrop-blur-md">🌿</div>
          <div>
            <div className="text-sm font-semibold text-white drop-shadow">AgroPredict</div>
            <div className="text-[11px] text-white/70">La Libertad, Perú</div>
          </div>
        </div>

        {/* Texto en la parte inferior */}
        <div className="absolute bottom-8 left-8 right-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Sistema de análisis agrícola</p>
          <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-md">
            Predice precios.<br />Maximiza ganancias.
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            Plataforma inteligente para exportadores de palta Hass con modelos predictivos SARIMAX, SVR y LSTM.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { label: 'Registros históricos', value: '+15,000' },
              { label: 'Modelos ML activos', value: '3' },
              { label: 'Años de datos', value: '10+' },
              { label: 'Mercados analizados', value: '20+' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                <p className="text-base font-bold text-white">{item.value}</p>
                <p className="text-[11px] text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ag-green-600 text-lg text-white">🌿</div>
          <div>
            <div className="text-sm font-semibold">AgroPredict</div>
            <div className="text-[11px] text-muted-foreground">La Libertad, Perú</div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          {sessionExpired ? (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Tu sesión expiró. Vuelve a iniciar sesión.
            </div>
          ) : null}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.pe"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            ) : null}

            <Button type="submit" className="mt-1 w-full gap-2" disabled={loading} size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-ag-green-700 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
