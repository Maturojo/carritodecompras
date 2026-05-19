import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ShippingQuote from '../components/ShippingQuote'

export default function Checkout() {
  const { items, totalPrice } = useCart()

  const [loading, setLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState(null)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    direccion: '', ciudad: '', provincia: '', codigoPostal: '',
  })

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const totalConEnvio = totalPrice + (selectedShipping?.precio || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedShipping) {
      alert('Por favor seleccioná una opción de envío antes de continuar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/mp?action=preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items,
          envio:    selectedShipping,
          subtotal: totalPrice,
          total:    totalConEnvio,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al conectar con MercadoPago')

      // Redirigir al checkout de MercadoPago
      window.location.href = data.init_point
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="empty-cart">
          <span className="empty-icon">🧉</span>
          <h2>No tenés productos en el carrito</h2>
          <Link to="/tienda" className="btn-primary">Ver productos</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="checkout-page">
      <h1 className="page-title">Finalizar compra</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>

          <h2>Datos de contacto</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre completo</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Juan García" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="juan@email.com" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input name="telefono" value={form.telefono} onChange={handleChange} required placeholder="+54 9 11 1234-5678" />
            </div>
          </div>

          <h2>Dirección de envío</h2>
          <div className="form-grid">
            <div className="form-group full">
              <label>Dirección</label>
              <input name="direccion" value={form.direccion} onChange={handleChange} required placeholder="Av. Corrientes 1234, Piso 3" />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input name="ciudad" value={form.ciudad} onChange={handleChange} required placeholder="Buenos Aires" />
            </div>
            <div className="form-group">
              <label>Provincia</label>
              <input name="provincia" value={form.provincia} onChange={handleChange} required placeholder="CABA" />
            </div>
            <div className="form-group">
              <label>Código Postal</label>
              <input
                name="codigoPostal"
                value={form.codigoPostal}
                onChange={handleChange}
                required
                placeholder="1001"
                maxLength={8}
                pattern="[0-9A-Z]{4,8}"
              />
            </div>
          </div>

          {/* Cotizador de envío */}
          <div>
            <h2>Envío</h2>
            <ShippingQuote
              codigoPostal={form.codigoPostal}
              selected={selectedShipping}
              onSelect={setSelectedShipping}
            />
            {!form.codigoPostal && (
              <p className="shipping-hint">Ingresá tu código postal para ver las opciones de envío.</p>
            )}
          </div>

          {/* Pago */}
          <div className="payment-section">
            <h2>Método de pago</h2>
            <div className="mp-badge">
              <span>💳</span>
              <div>
                <strong>Mercado Pago</strong>
                <p>Tarjeta de crédito/débito, transferencia o efectivo</p>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary full-width btn-large"
            disabled={loading || !selectedShipping}
          >
            {loading
              ? 'Redirigiendo a MercadoPago...'
              : !selectedShipping
              ? 'Seleccioná un envío para continuar'
              : '🔒 Pagar con MercadoPago'}
          </button>
        </form>

        {/* Resumen */}
        <div className="checkout-summary">
          <h2>Tu pedido</h2>
          {items.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Envío {selectedShipping ? `(${selectedShipping.nombre})` : ''}</span>
            <span>{selectedShipping ? formatPrice(selectedShipping.precio) : '—'}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totalConEnvio)}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
