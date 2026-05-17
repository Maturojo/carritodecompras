import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import { useShipping } from '../hooks/useShipping'
import ShippingQuote from '../components/ShippingQuote'

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { addOrder } = useStore()
  const { crearEnvio } = useShipping()

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [numeroEnvio, setNumeroEnvio] = useState(null)
  const [selectedShipping, setSelectedShipping] = useState(null)

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
    try {
      // Crear el envío en el proveedor elegido
      const envioResult = await crearEnvio({
        orden: { ...form, total: totalConEnvio },
        servicio: selectedShipping.nombre,
      })

      // Guardar pedido con número de seguimiento
      addOrder({
        ...form,
        items,
        total: totalConEnvio,
        subtotal: totalPrice,
        envio: selectedShipping,
        numeroEnvio: envioResult.numeroEnvio,
      })

      setNumeroEnvio(envioResult.numeroEnvio)
      setSubmitted(true)
      clearCart()
    } catch (err) {
      alert('Hubo un error al procesar el pedido. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !submitted) {
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

  if (submitted) {
    return (
      <main className="checkout-page">
        <div className="order-success">
          <span className="success-icon">✅</span>
          <h2>¡Pedido confirmado!</h2>
          <p>Gracias por tu compra, <strong>{form.nombre}</strong>. Te enviamos la confirmación a <strong>{form.email}</strong>.</p>
          {numeroEnvio && (
            <div className="tracking-box">
              <p className="tracking-label">Tu número de seguimiento Andreani:</p>
              <span className="tracking-number">{numeroEnvio}</span>
              <a
                href={`https://www.andreani.com/#!/informacionEnvio/${numeroEnvio}`}
                target="_blank"
                rel="noreferrer"
                className="tracking-link"
              >
                Seguir mi envío →
              </a>
            </div>
          )}
          <Link to="/tienda" className="btn-primary">Volver a la tienda</Link>
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
            <p className="mp-note">La integración con Mercado Pago se conecta aquí.</p>
          </div>

          <button
            type="submit"
            className="btn-primary full-width btn-large"
            disabled={loading || !selectedShipping}
          >
            {loading ? 'Procesando...' : !selectedShipping ? 'Seleccioná un envío para continuar' : 'Confirmar pedido'}
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
