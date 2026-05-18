import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartSuggestions from '../components/CartSuggestions'
import Swal from 'sweetalert2'

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  const formatPrice = (price) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price)

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
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span className="free-shipping">Gratis</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
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
