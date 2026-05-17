import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function CartSuggestions() {
  const { items, addItem } = useCart()
  const { products } = useStore()

  if (items.length === 0) return null

  const cartIds = new Set(items.map(i => i.id))
  const cartCategories = [...new Set(items.map(i => i.category))]

  // Sugerir productos de las mismas categorías que no están en el carrito
  const suggestions = products
    .filter(p => !cartIds.has(p.id) && cartCategories.includes(p.category))
    .slice(0, 3)

  // Si no hay suficientes de las mismas categorías, completar con otros
  if (suggestions.length < 3) {
    const extra = products
      .filter(p => !cartIds.has(p.id) && !suggestions.find(s => s.id === p.id))
      .slice(0, 3 - suggestions.length)
    suggestions.push(...extra)
  }

  if (suggestions.length === 0) return null

  return (
    <div className="cart-suggestions">
      <h3 className="cart-suggestions-title">🧉 Compraron juntos</h3>
      <div className="cart-suggestions-list">
        {suggestions.map(p => (
          <div key={p.id} className="cart-suggestion-card">
            <Link to={`/tienda/${p.id}`}>
              <img src={p.image} alt={p.name} className="sugg-img" />
            </Link>
            <div className="sugg-info">
              <Link to={`/tienda/${p.id}`} className="sugg-name">{p.name}</Link>
              <span className="sugg-price">{formatPrice(p.price)}</span>
            </div>
            <button className="sugg-add-btn" onClick={() => addItem(p)}>+ Agregar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
