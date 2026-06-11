import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
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
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Acceso seguro</p>
        <h1>Iniciar sesión</h1>
        <p className="muted">Usa tu email y contraseña para entrar al panel privado.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="usuario@correo.com" />
          </label>
          <label>
            Contraseña
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="auth-link-row">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </section>
    </main>
  )
}
