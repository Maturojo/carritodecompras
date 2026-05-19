import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../../context/StoreContext'
import { useShipping } from '../../hooks/useShipping'
import { exportToExcel } from '../../utils/excel'

const STATUSES = ['pendiente_pago', 'pendiente', 'enviado', 'entregado', 'cancelado', 'rechazado']
const STATUS_LABEL = {
  pendiente_pago: { label: '⏳ Pago pendiente', cls: 'status-waiting' },
  pagado:         { label: '💚 Pagado',         cls: 'status-paid' },
  pendiente:      { label: '🟡 Pendiente',      cls: 'status-pending' },
  enviado:        { label: '🔵 Enviado',        cls: 'status-sent' },
  entregado:      { label: '🟢 Entregado',      cls: 'status-done' },
  cancelado:      { label: '🔴 Cancelado',      cls: 'status-cancelled' },
  rechazado:      { label: '❌ Rechazado',      cls: 'status-cancelled' },
  en_proceso:     { label: '🔄 En proceso',     cls: 'status-pending' },
}

const isMdp = (cp) => /^760\d$/.test(cp?.trim())
const isNew  = (date) => Date.now() - new Date(date).getTime() < 24 * 60 * 60 * 1000

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore()
  const { trackEnvio } = useShipping()
  const [filter, setFilter]     = useState('todos')
  const [expanded, setExpanded] = useState(null)
  const [tracking, setTracking] = useState({})
  const [dbOrders, setDbOrders] = useState([])
  const [lastSeen, setLastSeen] = useState(() => Date.now())

  // Auto-refresh desde MongoDB cada 30 seg
  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders').catch(() => null)
    if (!res?.ok) return
    const data = await res.json()
    setDbOrders(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    fetchOrders()
    const id = setInterval(fetchOrders, 30_000)
    return () => clearInterval(id)
  }, [fetchOrders])

  // Mezclar pedidos del context + DB (DB tiene prioridad)
  const allOrders = dbOrders.length > 0 ? dbOrders : orders
  const newCount  = allOrders.filter(o => isNew(o.date) && (o.status === 'pagado' || o.status === 'pendiente_pago')).length

  const handleExportCSV = () => {
    const rows = orders.map(o => ({
      'ID':        o.id,
      'Fecha':     new Date(o.date).toLocaleDateString('es-AR'),
      'Cliente':   o.nombre,
      'Email':     o.email,
      'Teléfono':  o.telefono || '',
      'Estado':    o.status,
      'Total':     o.total,
      'Envío':     o.envio?.nombre || '',
      'Productos': (o.items || []).map(i => `${i.name} x${i.quantity}`).join(' | '),
    }))
    exportToExcel(rows, 'Pedidos', 'mateshop-pedidos')
  }

  const handleTracking = async (order) => {
    if (!order.numeroEnvio) return
    setTracking(t => ({ ...t, [order.id]: { loading: true } }))
    const data = await trackEnvio({ numeroEnvio: order.numeroEnvio, proveedor: order.envio?.proveedor || 'andreani' })
    setTracking(t => ({ ...t, [order.id]: { loading: false, data } }))
  }

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const filtered = filter === 'todos' ? allOrders : allOrders.filter(o => o.status === filter)

  return (
    <div className="admin-orders">
      {/* Banner nuevos pedidos */}
      {newCount > 0 && (
        <div className="new-orders-banner" onClick={() => { setFilter('todos'); setLastSeen(Date.now()) }}>
          🔔 {newCount} pedido{newCount > 1 ? 's' : ''} nuevo{newCount > 1 ? 's' : ''} — hacé clic para ver
        </div>
      )}

      {/* Filter tabs + export */}
      <div className="orders-toolbar">
        <div className="order-filters">
          {['todos', ...STATUSES].map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'todos' ? `Todos (${allOrders.length})` : `${STATUS_LABEL[s]?.label} (${allOrders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
        <button className="admin-btn-secondary" onClick={handleExportCSV} title="Descargar pedidos en Excel/CSV">
          ⬇️ Exportar CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-card">
          <p className="admin-empty">No hay pedidos {filter !== 'todos' ? `con estado "${filter}"` : 'aún'}.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => {
            const esNuevo = isNew(order.date) && (order.status === 'pagado' || order.status === 'pendiente_pago')
            const esLocal = isMdp(order.codigoPostal)
            return (
            <div key={order.id || order.orderId} className={`order-card ${esNuevo ? 'order-card-new' : ''}`}>
              <div
                className="order-card-header"
                onClick={() => setExpanded(expanded === (order.id || order.orderId) ? null : (order.id || order.orderId))}
              >
                <div className="order-info">
                  <span className="order-id">#{String(order.orderId || order.id).slice(-6)}</span>
                  {esNuevo && <span className="order-badge-new">NUEVO</span>}
                  {esLocal && <span className="order-badge-local">📍 MdP</span>}
                  <span className="order-name">{order.nombre}</span>
                  <span className="order-date">{formatDate(order.date)}</span>
                </div>
                <div className="order-right">
                  <span className="order-total">{formatPrice(order.total)}</span>
                  <select
                    className={`status-select ${STATUS_LABEL[order.status]?.cls || ''}`}
                    value={order.status}
                    onChange={e => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value) }}
                    onClick={e => e.stopPropagation()}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]?.label}</option>)}
                  </select>
                  <span className="order-chevron">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="order-detail">
                  <div className="order-detail-grid">
                    <div>
                      <h4>Datos del cliente</h4>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Teléfono:</strong> {order.telefono}</p>
                      <p><strong>Dirección:</strong> {order.direccion}, {order.ciudad}, {order.provincia} {order.codigoPostal}</p>
                      {order.numeroEnvio && (
                        <div className="tracking-admin">
                          <p><strong>N° Andreani:</strong> <span className="tracking-num">{order.numeroEnvio}</span></p>
                          <div className="tracking-actions">
                            <a
                              href={
                                order.envio?.proveedor === 'correo'
                                  ? `https://www.correoargentino.com.ar/formularios/e-commerce?id=${order.numeroEnvio}`
                                  : `https://www.andreani.com/#!/informacionEnvio/${order.numeroEnvio}`
                              }
                              target="_blank" rel="noreferrer"
                              className="action-btn edit"
                            >🔗 Ver en {order.envio?.proveedor === 'correo' ? 'Correo Arg.' : 'Andreani'}</a>
                            <button
                              className="action-btn edit"
                              onClick={() => handleTracking(order)}
                              disabled={tracking[order.id]?.loading}
                            >
                              {tracking[order.id]?.loading ? '...' : '📍 Ver tracking'}
                            </button>
                          </div>
                          {tracking[order.id]?.data?.eventos && (
                            <div className="tracking-events">
                              {tracking[order.id].data.eventos.map((ev, i) => (
                                <div key={i} className="tracking-event">
                                  <span className="tracking-dot" />
                                  <div>
                                    <strong>{ev.descripcion}</strong>
                                    {ev.sucursal && <span> — {ev.sucursal}</span>}
                                    <p>{new Date(ev.fecha).toLocaleString('es-AR')}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4>Productos</h4>
                      {(order.items || []).map(item => (
                        <div key={item.id} className="order-item-row">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="order-item-row total">
                        <strong>Total</strong>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
