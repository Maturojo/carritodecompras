import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAnalytics } from '../context/AnalyticsContext'
import FavoriteBtn from './FavoriteBtn'
import Swal from 'sweetalert2'

export default function ProductCard({ product }) {
  const { addItem, items } = useCart()
  const { trackProductClick } = useAnalytics()

  // Soporte para productos con y sin variantes
  const firstVariant = product.variants?.[0]
  const price  = firstVariant?.price  ?? product.price
  const stock  = firstVariant?.stock  ?? product.stock
  const image  = firstVariant?.images?.[0] ?? product.image ?? ''
  const cartKey = `${product.id}_${firstVariant?.id || 'default'}`

  const hasVariants = product.variants?.length > 1
  const minPrice = hasVariants ? Math.min(...product.variants.map(v => v.price)) : price
  const maxPrice = hasVariants ? Math.max(...product.variants.map(v => v.price)) : price

  const inCart = items.find(i => (i.cartKey || String(i.id)) === cartKey)

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const handleAdd = () => {
    const result = addItem({
      cartKey,
      productId: product.id,
      variantId: firstVariant?.id || 'default',
      variantName: hasVariants ? firstVariant?.name : null,
      name:  product.name,
      price,
      image,
      stock,
    })
    if (!result.ok) {
      Swal.fire({
        title: 'Stock insuficiente',
        text: `Solo hay ${result.stock} unidad${result.stock === 1 ? '' : 'es'} disponibles de este producto.`,
        icon: 'warning',
        confirmButtonColor: '#9c664d',
        confirmButtonText: 'Entendido',
        background: '#FDF9F0',
        color: '#1a1209',
      })
    }
  }

  return (
    <div className="product-card">
      <Link to={`/tienda/${product.id}`} className="product-image-wrapper"
        onClick={() => trackProductClick(product.id)}>
        <img src={image || 'https://placehold.co/300x300/e8e0d5/888?text=Sin+imagen'} alt={product.name} className="product-image" />
        {stock <= 5 && stock > 0 && <span className="stock-badge">¡{stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`}!</span>}
        {stock === 0 && <span className="stock-badge out">Sin stock</span>}
        <div className="product-image-overlay"><span>Ver producto</span></div>
      </Link>
      <FavoriteBtn productId={product.id} className="product-fav-btn" />
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/tienda/${product.id}`} className="product-name-link" onClick={() => trackProductClick(product.id)}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-price">
            {hasVariants && minPrice !== maxPrice
              ? <><span className="price-from-sm">Desde</span> {formatPrice(minPrice)}</>
              : formatPrice(price)
            }
          </div>
          {hasVariants
            ? <Link to={`/tienda/${product.id}`} className="btn-add">Ver variantes</Link>
            : <button className={inCart ? 'btn-add added' : 'btn-add'} onClick={handleAdd} disabled={stock === 0}>
                {stock === 0 ? 'Sin stock' : inCart ? `En carrito (${inCart.quantity})` : '+ Carrito'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
