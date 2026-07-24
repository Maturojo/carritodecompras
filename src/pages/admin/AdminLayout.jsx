import { useState } from 'react'
import AdminDashboard from './AdminDashboard'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminAnalytics from './AdminAnalytics'
import AdminClientes from './AdminClientes'
import AdminCoupons from './AdminCoupons'
import AdminContent from './AdminContent'
import AdminConfig from './AdminConfig'

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'products', label: 'Productos', icon: 'P' },
  { id: 'orders', label: 'Pedidos', icon: 'O' },
  { id: 'analytics', label: 'Analytics', icon: 'A' },
  { id: 'clientes', label: 'Clientes', icon: 'C' },
  { id: 'coupons', label: 'Cupones', icon: '$' },
  { id: 'content', label: 'Contenido', icon: 'T' },
  { id: 'config', label: 'Config', icon: '*' },
]

export default function AdminLayout({ onLogout }) {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderSection = () => {
    switch (active) {
      case 'dashboard': return <AdminDashboard setSection={setActive} />
      case 'products': return <AdminProducts />
      case 'orders': return <AdminOrders />
      case 'analytics': return <AdminAnalytics />
      case 'clientes': return <AdminClientes />
      case 'coupons': return <AdminCoupons />
      case 'content': return <AdminContent />
      case 'config': return <AdminConfig />
      default: return null
    }
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <span className="admin-logo">Mate&amp;Co</span>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>x</button>
        </div>
        <nav className="admin-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`admin-nav-item ${active === s.id ? 'active' : ''}`}
              onClick={() => { setActive(s.id); setSidebarOpen(false) }}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <a href="/" target="_blank" className="admin-nav-item secondary">
            <span>W</span><span>Ver sitio</span>
          </a>
          <button className="admin-nav-item secondary" onClick={onLogout}>
            <span>X</span><span>Salir</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <h2 className="admin-section-title">
            {SECTIONS.find(s => s.id === active)?.icon}{' '}
            {SECTIONS.find(s => s.id === active)?.label}
          </h2>
          <button className="admin-logout-btn" onClick={onLogout}>Salir</button>
        </header>
        <div className="admin-content">
          {renderSection()}
        </div>
      </div>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}
