import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import Lightbox from '../components/Lightbox'
import SEO from '../components/SEO'

export default function ProductDetail() {
  const { id } = useParams()
  const { products } = useStore()
  const { addItem, items } = useCart()
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedImageIdx, setSelectedImageIdx]     = useState(0)
  const [lightboxOpen, setLightboxOpen]             = useState(false)
  const [added, setAdded] = useState(false)

  const product = products.find(p => String(p.id) === String(id))

  if (!product) {
    return (
      <main className="page-content">
        <div className="empty-cart">
          <span className="empty-icon">😕</span>
          <h2>Producto no encontrado</h2>
          <Link to="/tienda" className="btn-primary">Volver a la tienda</Link>
        </div>
      </main>
    )
  }

  // Soporte para productos con y sin variantes
  const variants = product.variants?.length
    ? product.variants
    : [{ id: 'default', name: 'Única', price: product.price, stock: product.stock, images: [product.image].filter(Boolean) }]

  const variant = variants[selectedVariantIdx]
  const images  = variant.images?.length ? variant.images : [product.image].filter(Boolean)
  const currentImage = images[selectedImageIdx] || ''

  const cartKey = `${product.id}_${variant.id}`
  const inCart  = items.find(i => (i.cartKey || String(i.id)) === cartKey)

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)

  const minPrice = Math.min(...variants.map(v => v.price))
  const maxPrice = Math.max(...variants.map(v => v.price))
  const priceLabel = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`

  const handleVariantChange = (idx) => {
    setSelectedVariantIdx(idx)
    setSelectedImageIdx(0)
  }

  const handleAdd = () => {
    addItem({
      cartKey,
      productId: product.id,
      variantId: variant.id,
      variantName: variants.length > 1 ? variant.name : null,
      name:  product.name,
      price: variant.price,
      image: images[0] || '',
      stock: variant.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const related = products
    .filter(p => p.category === product.category && String(p.id) !== String(id))
    .slice(0, 3)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images[0] || '',
    brand: { '@type': 'Brand', name: 'Mate&Co' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: 'ARS',
      availability: variant.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Mate&Co' },
    },
  }

  return (
    <>
    <SEO
      title={product.name}
      canonical={`/tienda/${product.id}`}
      description={`${product.name} — ${product.description} Comprá online con envío a todo Argentina.`}
      image={images[0] || undefined}
      type="product"
      schema={productSchema}
    />
    <main className="page-content">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Inicio</Link><span>›</span>
        <Link to="/tienda">Tienda</Link><span>›</span>
        <span>{product.name}</span>
      </div>

      {/* Detalle */}
      <section className="detail-section">

        {/* ── Galería ── */}
        <div className="detail-gallery">
          <div className="gallery-main" onClick={() => currentImage && setLightboxOpen(true)} style={{ cursor: currentImage ? 'zoom-in' : 'default' }}>
            {currentImage
              ? <>
                  <img src={currentImage} alt={product.name} className="detail-image" />
                  <div className="gallery-zoom-hint">🔍 Click para ampliar</div>
                </>
              : <div className="gallery-placeholder">Sin imagen</div>
            }
            {variant.stock <= 5 && variant.stock > 0 && (
              <span className="stock-badge">¡{variant.stock === 1 ? 'Última unidad' : `Últimas ${variant.stock} unidades`}!</span>
            )}
            {variant.stock === 0 && (
              <span className="stock-badge out">Sin stock</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${selectedImageIdx === i ? 'active' : ''}`}
                  onClick={() => setSelectedImageIdx(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="detail-info">

          {/* Categoría + nombre */}
          <div className="detail-header">
            <span className="detail-category-tag">{product.category}</span>
            {variant.stock > 0 && variant.stock <= 5 && (
              <span className="detail-urgency">🔥 ¡Últimas {variant.stock}!</span>
            )}
          </div>
          <h1 className="detail-title">{product.name}</h1>

          {/* Precio */}
          <div className="detail-price-block">
            <div className="detail-price">
              {variants.length > 1 && minPrice !== maxPrice && (
                <span className="price-from">Desde</span>
              )}
              <span className="price-amount">{formatPrice(variant.price)}</span>
            </div>
            {inCart && (
              <span className="detail-in-cart-badge">🛒 {inCart.quantity} en carrito</span>
            )}
          </div>

          <div className="detail-divider" />

          {/* Selector de variantes */}
          {variants.length > 1 && (
            <div className="variant-selector">
              <p className="variant-selector-label">
                Elegí tu variante: <strong>{variant.name}</strong>
              </p>
              <div className="variant-btns">
                {variants.map((v, idx) => (
                  <button
                    key={v.id}
                    className={`variant-btn ${selectedVariantIdx === idx ? 'active' : ''} ${v.stock === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => handleVariantChange(idx)}
                    disabled={v.stock === 0}
                    title={v.stock === 0 ? 'Sin stock' : `$${v.price}`}
                  >
                    {v.name}
                    {v.stock === 0 && <span className="variant-no-stock-tag">Sin stock</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Descripción */}
          {product.description && (
            <p className="detail-description">{product.description}</p>
          )}

          <div className="detail-divider" />

          {/* Meta chips */}
          <div className="detail-chips">
            <div className="detail-chip">
              <span className="chip-icon">📦</span>
              <div>
                <span className="chip-label">Stock</span>
                <span className={`chip-value ${variant.stock <= 5 ? 'low' : ''}`}>
                  {variant.stock} {variant.stock === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
            </div>
            <div className="detail-chip">
              <span className="chip-icon">🏷️</span>
              <div>
                <span className="chip-label">Categoría</span>
                <span className="chip-value capitalize">{product.category}</span>
              </div>
            </div>
            <div className="detail-chip">
              <span className="chip-icon">🚚</span>
              <div>
                <span className="chip-label">Envío</span>
                <span className="chip-value free">Gratis</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="detail-actions">
            <button
              className={`btn-add-detail ${added ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={variant.stock === 0}
            >
              {variant.stock === 0
                ? '❌ Sin stock'
                : added
                  ? '✓ ¡Agregado al carrito!'
                  : '🛒 Agregar al carrito'}
            </button>
            {inCart && (
              <Link to="/carrito" className="btn-ver-carrito">
                Ver carrito ({inCart.quantity}) →
              </Link>
            )}
          </div>

          {/* Perks */}
          <div className="detail-perks">
            <div className="perk"><span>🚚</span><span>Envío gratis en compras mayores a $3.000</span></div>
            <div className="perk"><span>🔄</span><span>Devolución gratis hasta 15 días</span></div>
            <div className="perk"><span>🛡️</span><span>Garantía de satisfacción</span></div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          index={selectedImageIdx}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setSelectedImageIdx(i => Math.max(0, i - 1))}
          onNext={(i) => {
            if (typeof i === 'number') setSelectedImageIdx(i)
            else setSelectedImageIdx(idx => Math.min(images.length - 1, idx + 1))
          }}
        />
      )}

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="related-section">
          <h2 className="section-title">También te puede interesar</h2>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </main>
    </>
  )
}
