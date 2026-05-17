import { useAnalytics } from '../../context/AnalyticsContext'
import { useStore } from '../../context/StoreContext'

const PAGE_LABELS = {
  '/': 'Inicio',
  '/tienda': 'Tienda',
  '/nosotros': 'Nosotros',
  '/contacto': 'Contacto',
  '/carrito': 'Carrito',
  '/checkout': 'Checkout',
}

export default function AdminAnalytics() {
  const { data, resetAnalytics } = useAnalytics()
  const { products } = useStore()

  const pageViews = data.pageViews || {}
  const productClicks = data.productClicks || {}

  const totalViews = Object.values(pageViews).reduce((a, b) => a + b, 0)
  const totalClicks = Object.values(productClicks).reduce((a, b) => a + b, 0)

  const sortedPages = Object.entries(pageViews)
    .sort(([, a], [, b]) => b - a)

  const sortedProducts = Object.entries(productClicks)
    .sort(([, a], [, b]) => b - a)
    .map(([id, clicks]) => ({
      product: products.find(p => p.id === Number(id)),
      clicks,
    }))
    .filter(e => e.product)

  const maxPageViews = sortedPages[0]?.[1] || 1
  const maxClicks = sortedProducts[0]?.clicks || 1

  const pct = (val, max) => Math.round((val / max) * 100)

  return (
    <div className="admin-analytics">
      {/* Summary */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon">👁️</span>
          <div>
            <p className="kpi-label">Total de visitas</p>
            <p className="kpi-value">{data.totalVisits || 0}</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">📄</span>
          <div>
            <p className="kpi-label">Páginas vistas</p>
            <p className="kpi-value">{totalViews}</p>
          </div>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🖱️</span>
          <div>
            <p className="kpi-label">Clicks en productos</p>
            <p className="kpi-value">{totalClicks}</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Page views */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Visitas por página</h3>
            <span className="admin-badge">{totalViews} total</span>
          </div>
          {sortedPages.length === 0 ? (
            <p className="admin-empty">Todavía no hay datos de visitas.</p>
          ) : (
            <div className="bar-chart">
              {sortedPages.map(([path, count]) => (
                <div key={path} className="bar-row">
                  <span className="bar-label">{PAGE_LABELS[path] || path}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct(count, maxPageViews)}%` }} />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product clicks */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Clicks por producto</h3>
            <span className="admin-badge">{totalClicks} total</span>
          </div>
          {sortedProducts.length === 0 ? (
            <p className="admin-empty">Todavía no hay clicks en productos.</p>
          ) : (
            <div className="bar-chart">
              {sortedProducts.map(({ product, clicks }) => (
                <div key={product.id} className="bar-row">
                  <span className="bar-label">{product.name}</span>
                  <div className="bar-track">
                    <div className="bar-fill product-bar" style={{ width: `${pct(clicks, maxClicks)}%` }} />
                  </div>
                  <span className="bar-count">{clicks}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '1rem' }}>
        <div className="admin-card-header">
          <h3>⚠️ Resetear analytics</h3>
        </div>
        <p style={{ fontSize: '0.87rem', color: '#888', marginBottom: '1rem' }}>
          Esto borrará todos los datos de visitas y clicks. No se puede deshacer.
        </p>
        <button className="admin-btn-danger" onClick={() => { if (window.confirm('¿Seguro que querés resetear los datos?')) resetAnalytics() }}>
          Resetear todos los datos
        </button>
      </div>
    </div>
  )
}
