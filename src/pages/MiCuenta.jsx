import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'
import { useShipping } from '../hooks/useShipping'

const STATUS_LABEL = {
  pendiente:  { label: '🟡 Pendiente',  cls: 'status-pending-pub' },
  enviado:    { label: '🔵 En camino',  cls: 'status-sent-pub' },
  entregado:  { label: '🟢 Entregado', cls: 'status-done-pub' },
  cancelado:  { label: '🔴 Cancelado', cls: 'status-cancelled-pub' },
}

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })

export default function MiCuenta() {
  const { user, logout, updateUser } = useAuth()
  const { orders } = useStore()
  const { trackEnvio } = useShipping()
  const navigate = useNavigate()

  const [section, setSection] = useState('pedidos')
  const [editForm, setEditForm] = useState({ nombre: user?.nombre || '' })
  const [editSaved, setEditSaved] = useState(false)
  const [tracking, setTracking] = useState({})
  const [expanded, setExpanded] = useState(null)

  // Filtrar pedidos del usuario logueado por email
  const myOrders = orders.filter(o => o.email === user?.email)

  const handleLogout = () => { logout(); navigate('/') }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    updateUser(editForm)
    setEditSaved(true)
    setTimeout(() => setEditSaved(false), 2000)
  }

  const handleTracking = async (order) => {
    if (!order.numeroEnvio) return
    setTracking(t => ({ ...t, [order.id]: { loading: true } }))
    const data = await trackEnvio({ numeroEnvio: order.numeroEnvio, proveedor: order.envio?.proveedor || 'andreani' })
    setTracking(t => ({ ...t, [order.id]: { loading: false, data } }))
  }

  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <span className="auth-icon">🔒</span>
          <h2>Necesitás iniciar sesión</h2>
          <p style={{ color: 'var(--texto-suave)', marginBottom: '1rem' }}>Para ver tu cuenta tenés que estar logueado.</p>
          <Link to="/login" className="btn-primary full-width">Iniciar sesión</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mi-cuenta-page page-content">
      <div className="mi-cuenta-layout">

        {/* ── Sidebar ── */}
        <aside className="cuenta-sidebar">
          <div className="cuenta-avatar">{user.nombre?.[0]?.toUpperCase() || '?'}</div>
          <h3 className="cuenta-name">{user.nombre}</h3>
          <p className="cuenta-email">{user.email}</p>
          <nav className="cuenta-nav">
            {[
              { id: 'pedidos', icon: '📦', label: 'Mis pedidos' },
              { id: 'perfil',  icon: '👤', label: 'Mi perfil' },
              { id: 'favoritos', icon: '❤️', label: 'Favoritos' },
            ].map(s => (
              <button
                key={s.id}
                className={`cuenta-nav-item ${section === s.id ? 'active' : ''}`}
                onClick={() => setSection(s.id)}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </nav>
          <button className="cuenta-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
        </aside>

        {/* ── Contenido ── */}
        <div className="cuenta-content">

          {/* Pedidos */}
          {section === 'pedidos' && (
            <div>
              <h2 className="cuenta-section-title">Mis pedidos</h2>
              {myOrders.length === 0 ? (
                <div className="cuenta-empty">
                  <span>📦</span>
                  <p>Todavía no realizaste ningún pedido.</p>
                  <Link to="/tienda" className="btn-primary">Ver tienda</Link>
                </div>
              ) : (
                <div className="cuenta-orders">
                  {myOrders.map(order => (
                    <div key={order.id} className="cuenta-order-card">
                      <div
                        className="cuenta-order-header"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      >
                        <div>
                          <span className="cuenta-order-id">Pedido #{String(order.id).slice(-6)}</span>
                          <span className="cuenta-order-date">{formatDate(order.date)}</span>
                        </div>
                        <div className="cuenta-order-right">
                          <span className={`cuenta-status ${STATUS_LABEL[order.status]?.cls}`}>
                            {STATUS_LABEL[order.status]?.label || order.status}
                          </span>
                          <span className="cuenta-order-total">{formatPrice(order.total)}</span>
                          <span>{expanded === order.id ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {expanded === order.id && (
                        <div className="cuenta-order-detail">
                          <div className="cuenta-order-items">
                            {(order.items || []).map(item => (
                              <div key={item.id} className="cuenta-order-item">
                                <img src={item.image} alt={item.name} />
                                <div>
                                  <p>{item.name}</p>
                                  <span>× {item.quantity} — {formatPrice(item.price * item.quantity)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {order.envio && (
                            <p className="cuenta-envio-info">
                              🚚 Enviado por <strong>{order.envio.nombre}</strong>
                              {order.numeroEnvio && ` — N° ${order.numeroEnvio}`}
                            </p>
                          )}

                          {order.numeroEnvio && (
                            <div className="cuenta-tracking">
                              <button
                                className="btn-secondary"
                                onClick={() => handleTracking(order)}
                                disabled={tracking[order.id]?.loading}
                              >
                                {tracking[order.id]?.loading ? '⏳ Buscando...' : '📍 Rastrear envío'}
                              </button>
                              {tracking[order.id]?.data?.eventos && (
                                <div className="tracking-timeline">
                                  {tracking[order.id].data.eventos.map((ev, i) => (
                                    <div key={i} className="tracking-step">
                                      <span className="tracking-dot-pub" />
                                      <div>
                                        <strong>{ev.descripcion}</strong>
                                        {ev.sucursal && <span className="tracking-sucursal"> — {ev.sucursal}</span>}
                                        <p>{new Date(ev.fecha).toLocaleString('es-AR')}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Perfil */}
          {section === 'perfil' && (
            <div>
              <h2 className="cuenta-section-title">Mi perfil</h2>
              <div className="cuenta-card">
                <form onSubmit={handleSaveProfile} className="auth-form">
                  <div className="form-group">
                    <label>Nombre completo</label>
                    <input
                      value={editForm.nombre}
                      onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input value={user.email} disabled className="input-disabled" />
                  </div>
                  {editSaved && <p className="auth-success">✓ Cambios guardados</p>}
                  <button type="submit" className="btn-primary">Guardar cambios</button>
                </form>
              </div>
            </div>
          )}

          {/* Favoritos */}
          {section === 'favoritos' && (
            <div>
              <h2 className="cuenta-section-title">Mis favoritos</h2>
              <div className="cuenta-empty">
                <span>❤️</span>
                <p>Guardá tus productos favoritos haciendo click en el corazón.</p>
                <Link to="/tienda" className="btn-primary">Ver tienda</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
