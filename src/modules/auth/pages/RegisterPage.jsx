import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      await register({ name: form.name, email: form.email, password: form.password })
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
        <p className="eyebrow">Registro nuevo</p>
        <h1>Crear cuenta</h1>
        <p className="muted">Completa tus datos para generar un usuario nuevo.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Tu nombre" />
          </label>
          <label>
            Email
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="usuario@correo.com" />
          </label>
          <label>
            Contraseña
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" />
          </label>
          <label>
            Confirmar contraseña
            <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" placeholder="••••••••" />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrarme'}</button>
        </form>
        <p className="auth-link-row">
          ¿Ya tienes cuenta? <Link to="/login">Volver al login</Link>
        </p>
      </section>
    </main>
  )
}
