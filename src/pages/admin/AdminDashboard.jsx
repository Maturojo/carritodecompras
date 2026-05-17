import { useStore } from '../../context/StoreContext'
import { useAnalytics } from '../../context/AnalyticsContext'

const STATUS_LABEL = { pendiente: '🟡 Pendiente', enviado: '🔵 Enviado', entregado: '🟢 Entregado', cancelado: '🔴 Cancelado' }

function getClientCount() {
  try { return JSON.parse(localStorage.getItem('ms_users') || '[]').length } catch { return 0 }
}

export default function AdminDashboard({ setSection }) {
  const { orders, products } = useStore()
  const { data: analytics } = useAnalytics()
  const clientCount = getClientCount()

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const pendingOrders = orders.filter(o => o.status === 'pendiente').length
  const totalClicks = Object.values(analytics.productClicks || {}).reduce((a, b) => a + b, 0)

  const recentOrders = orders.slice(0, 5)

  const topProducts = Object.entries(analytics.productClicks || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, clicks]) => ({
      product: products.find(p => p.id === Number(id)),
      clicks,
    }))
    .filter(e => e.product)

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const formatDate = (iso) => new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  return (
    <div className="admin-dashboard">
      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon">💰</span>
          <div>
            <p className="kpi-label">Ingresos totales</p>
            <p className="kpi-value">{formatPrice(totalRevenue)}</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">📦</span>
          <div>
            <p className="kpi-label">Pedidos totales</p>
            <p className="kpi-value">{orders.length}</p>
          </div>
        </div>
        <div className="kpi-card warn" onClick={() => setSection('orders')} style={{ cursor: 'pointer' }}>
          <span className="kpi-icon">⏳</span>
          <div>
            <p className="kpi-label">Pedidos pendientes</p>
            <p className="kpi-value">{pendingOrders}</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">👁️</span>
          <div>
            <p className="kpi-label">Visitas al sitio</p>
            <p className="kpi-value">{analytics.totalVisits || 0}</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🖱️</span>
          <div>
            <p className="kpi-label">Clicks en productos</p>
            <p className="kpi-value">{totalClicks}</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🛍️</span>
          <div>
            <p className="kpi-label">Productos en catálogo</p>
            <p className="kpi-value">{products.length}</p>
          </div>
        </div>
        <div className="kpi-card" onClick={() => setSection('clientes')} style={{ cursor: 'pointer' }}>
          <span className="kpi-icon">👥</span>
          <div>
            <p className="kpi-label">Clientes registrados</p>
            <p className="kpi-value">{clientCount}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Últimos pedidos */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Últimos pedidos</h3>
            <button className="admin-link" onClick={() => setSection('orders')}>Ver todos →</button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="admin-empty">Aún no hay pedidos.</p>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Cliente</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.nombre}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td>{formatDate(o.date)}</td>
                    <td><span className="status-tag">{STATUS_LABEL[o.status] || o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top productos */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Productos más vistos</h3>
            <button className="admin-link" onClick={() => setSection('analytics')}>Ver analytics →</button>
          </div>
          {topProducts.length === 0 ? (
            <p className="admin-empty">Todavía no hay clicks registrados.</p>
          ) : (
            <div className="top-products">
              {topProducts.map(({ product, clicks }, i) => (
                <div key={product.id} className="top-product-row">
                  <span className="top-rank">#{i + 1}</span>
                  <img src={product.image} alt={product.name} className="top-product-img" />
                  <div className="top-product-info">
                    <span>{product.name}</span>
                    <span className="top-clicks">{clicks} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
