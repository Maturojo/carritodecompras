import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../../context/StoreContext'
import { exportToExcel } from '../../utils/excel'

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function AdminClientes() {
  const { orders } = useStore()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
  }, [])

  const enriched = useMemo(() =>
    users.map(u => {
      const userOrders = orders.filter(o => o.email === u.email)
      const totalSpent = userOrders
        .filter(o => o.status !== 'cancelado')
        .reduce((sum, o) => sum + (o.total || 0), 0)
      return { ...u, orderCount: userOrders.length, totalSpent, userOrders }
    }),
    [users, orders]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return enriched
    return enriched.filter(u =>
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  }, [enriched, search])

  const handleExportCSV = () => {
    const rows = enriched.map(u => ({
      'Nombre':        u.nombre,
      'Email':         u.email,
      'Registrado':    new Date(u.createdAt).toLocaleDateString('es-AR'),
      'Pedidos':       u.orderCount,
      'Total gastado': u.totalSpent,
    }))
    exportToExcel(rows, 'Clientes', 'mateshop-clientes')
  }

  return (
    <div className="admin-clientes">
      {/* Header bar */}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="toolbar-actions">
          <span className="admin-count">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</span>
          {enriched.length > 0 && (
            <button className="admin-btn-secondary" onClick={handleExportCSV} title="Descargar clientes en Excel/CSV">
              ⬇️ Exportar CSV
            </button>
          )}
        </div>
      </div>

      {loadingUsers ? (
        <div className="admin-empty-state"><p>Cargando clientes…</p></div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <span style={{ fontSize: '2.5rem' }}>👥</span>
          <p>{users.length === 0 ? 'Todavía no hay clientes registrados.' : 'No se encontraron resultados.'}</p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Registrado</th>
                <th>Pedidos</th>
                <th>Total gastado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="cliente-name-cell">
                      <span className="cliente-avatar">{u.nombre?.[0]?.toUpperCase()}</span>
                      <span>{u.nombre}</span>
                    </div>
                  </td>
                  <td className="cliente-email">{u.email}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`order-count-badge ${u.orderCount > 0 ? 'has-orders' : ''}`}>
                      {u.orderCount}
                    </span>
                  </td>
                  <td>{u.totalSpent > 0 ? formatPrice(u.totalSpent) : '—'}</td>
                  <td>
                    <button className="admin-btn-sm" onClick={() => setSelected(u)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="cliente-avatar large">{selected.nombre?.[0]?.toUpperCase()}</div>
              <div>
                <h3>{selected.nombre}</h3>
                <p className="cliente-email">{selected.email}</p>
              </div>
              <button className="admin-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="cliente-stats-row">
              <div className="cliente-stat">
                <span className="kpi-label">Registrado</span>
                <span className="kpi-value small">{formatDate(selected.createdAt)}</span>
              </div>
              <div className="cliente-stat">
                <span className="kpi-label">Pedidos</span>
                <span className="kpi-value small">{selected.orderCount}</span>
              </div>
              <div className="cliente-stat">
                <span className="kpi-label">Total gastado</span>
                <span className="kpi-value small">{selected.totalSpent > 0 ? formatPrice(selected.totalSpent) : '—'}</span>
              </div>
            </div>

            <h4 style={{ margin: '1.25rem 0 0.75rem' }}>Historial de pedidos</h4>
            {selected.userOrders.length === 0 ? (
              <p className="admin-empty">Este cliente aún no realizó pedidos.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Fecha</th><th>Total</th><th>Estado</th><th>Productos</th></tr>
                </thead>
                <tbody>
                  {selected.userOrders.map(o => (
                    <tr key={o.id}>
                      <td>{formatDate(o.date)}</td>
                      <td>{formatPrice(o.total)}</td>
                      <td>
                        <span className={`status-tag status-${o.status}`}>
                          {{ pendiente: '🟡 Pendiente', enviado: '🔵 Enviado', entregado: '🟢 Entregado', cancelado: '🔴 Cancelado' }[o.status] || o.status}
                        </span>
                      </td>
                      <td>{o.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
