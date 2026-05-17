import { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminLayout from './AdminLayout'
import '../../admin.css'

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('ms_admin') === '1')

  const handleLogin = () => {
    sessionStorage.setItem('ms_admin', '1')
    setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('ms_admin')
    setAuthed(false)
  }

  if (!authed) return <AdminLogin onLogin={handleLogin} />
  return <AdminLayout onLogout={handleLogout} />
}
