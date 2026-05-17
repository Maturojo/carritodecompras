import { useState } from 'react'

const ADMIN_PASS = 'mateshop2025'

export default function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pass === ADMIN_PASS) {
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <span className="admin-login-icon">🧉</span>
        <h1>MateShop Admin</h1>
        <p>Ingresá la contraseña para acceder al panel</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className={error ? 'admin-input error' : 'admin-input'}
            autoFocus
          />
          {error && <p className="admin-error">Contraseña incorrecta</p>}
          <button type="submit" className="admin-btn-primary">Ingresar</button>
        </form>
      </div>
    </div>
  )
}
