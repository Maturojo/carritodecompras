import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import CartSuggestions from '../components/CartSuggestions'
import Swal from 'sweetalert2'


export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    coupon,
    discountAmount,
    discountedTotal,
    applyCoupon,
    removeCoupon,
    generateCoupon,
  } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState('')

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    const result = applyCoupon(couponCode)
    if (!result.ok) {
      setCouponMessage(result.error)
      return
    }
    setCouponCode('')
    setCouponMessage(`Cupón ${result.coupon.code} aplicado.`)
  }

  const handleGenerateCoupon = () => {
    const result = generateCoupon()
    if (!result.ok) {
      setCouponMessage(result.error)
      return
    }
    setCouponCode('')
    setCouponMessage(`Te generamos ${result.coupon.code}.`)
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <span className="empty-icon">🧉</span>
          <h2>Tu carrito está vacío</h2>
          <p>Todavía no agregaste ningún producto. ¡Dale una vuelta a la tienda!</p>
          <Link to="/tienda" className="btn-primary">Ver productos</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <h1 className="page-title">Tu carrito</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                {item.variantName && <p className="cart-item-variant">{item.variantName}</p>}
                <p className="cart-item-price">{formatPrice(item.price)} c/u</p>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => updateQuantity(item.cartKey || String(item.id), item.quantity - 1)}>−</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => {
                  const stock = item.stock ?? 999
                  if (item.quantity >= stock) {
                    Swal.fire({
                      title: 'Stock insuficiente',
                      text: `Solo hay ${stock} unidad${stock === 1 ? '' : 'es'} disponibles de este producto.`,
                      icon: 'warning',
                      confirmButtonColor: '#9c664d',
                      confirmButtonText: 'Entendido',
                      background: '#FDF9F0',
                      color: '#1a1209',
                    })
                  } else {
                    updateQuantity(item.cartKey || String(item.id), item.quantity + 1)
                  }
                }}>+</button>
              </div>
              <div className="cart-item-subtotal">
                {formatPrice(item.price * item.quantity)}
              </div>
              <button className="remove-btn" onClick={() => removeItem(item.cartKey || String(item.id))} title="Eliminar">✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumen del pedido</h2>
          <div className="summary-row">
            <span>Subtotal productos</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          {coupon && discountAmount > 0 && (
            <div className="summary-row coupon-discount-row">
              <span>Cupón {coupon.code}</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Envío</span>
            <span>A convenir</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(discountedTotal)}</span>
          </div>
          <div className="coupon-box">
            <div className="coupon-box-header">
              <div>
                <h3>Cupones</h3>
                <p>Generá uno o ingresá tu código.</p>
              </div>
              <button type="button" className="coupon-generate-btn" onClick={handleGenerateCoupon}>
                Generar
              </button>
            </div>

            {coupon && (
              <div className="coupon-active">
                <div>
                  <strong>{coupon.label}</strong>
                  <span>{coupon.description}</span>
                </div>
                <button type="button" onClick={() => { removeCoupon(); setCouponMessage('Cupón quitado.') }}>
                  Quitar
                </button>
              </div>
            )}

            <form className="coupon-form" onSubmit={handleApplyCoupon}>
              <input
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Ej: BIENVENIDO10"
                aria-label="Código de cupón"
              />
              <button type="submit">Aplicar</button>
            </form>
            {couponMessage && <p className="coupon-message">{couponMessage}</p>}
          </div>
          <Link to="/checkout" className="btn-primary full-width">
            Finalizar compra
          </Link>
          <Link to="/tienda" className="btn-secondary full-width">
            Seguir comprando
          </Link>
        </div>
      </div>
      <CartSuggestions />
    </main>
  )
}
