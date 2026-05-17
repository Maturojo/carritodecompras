import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const SESSION_KEY = 'ms_session'

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSession)

  useEffect(() => {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_KEY)
  }, [user])

  const register = async ({ nombre, email, password }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Error al registrarse.' }
      setUser(data)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Error de conexión. Intentá de nuevo.' }
    }
  }

  const login = async ({ email, password }) => {
    try {
      const res = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Error al iniciar sesión.' }
      setUser(data.user)
      return { ok: true, user: data.user }
    } catch {
      return { ok: false, error: 'Error de conexión. Intentá de nuevo.' }
    }
  }

  const logout = () => setUser(null)

  const updateUser = async (data) => {
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...data }),
      })
      setUser(prev => ({ ...prev, ...data }))
    } catch (err) {
      console.error('Error actualizando usuario:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
