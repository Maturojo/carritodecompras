import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(form)
    if (result.ok) {
      await Swal.fire({
        title: `¡Hola de nuevo, ${result.user?.nombre?.split(' ')[0] || ''}! 👋`,
        text: 'Iniciaste sesión correctamente.',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#9c664d',
        background: '#FDF9F0',
        color: '#1a1209',
        iconColor: '#9c664d',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      })
      navigate(from)
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🧉</span>
          <h1>Iniciar sesión</h1>
          <p>Bienvenido de nuevo</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" required placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password" required placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-switch">
          ¿No tenés cuenta? <Link to="/registro" className="auth-link">Registrate gratis</Link>
        </p>
      </div>
    </main>
  )
}
