import { useState, useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import { useStore } from '../context/StoreContext'
import SEO from '../components/SEO'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Destacados' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest',     label: 'Más nuevos' },
  { value: 'name',       label: 'Nombre A-Z' },
]

export default function Home() {
  const { products, categories } = useStore()

  // Categorías visibles = las de la BD + las que usan los productos pero no están en la BD
  const visibleCategories = useMemo(() => {
    const dbSlugs = new Set(categories.map(c => (c.slug || c.id).toLowerCase()))
    const fromProducts = [...new Set(products.map(p => p.category).filter(Boolean))]
      .filter(cat => !dbSlugs.has(cat.toLowerCase()))
      .map(cat => ({ id: cat, slug: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ') }))
    return [...categories.filter(c => c.id !== 'todos'), ...fromProducts]
  }, [categories, products])
  const [activeCategory, setActiveCategory] = useState('todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  // Precio base: primer variante o precio directo
  const getPrice = (p) => p.variants?.[0]?.price ?? p.price ?? 0

  const prices = products.map(getPrice)
  const globalMin = prices.length ? Math.min(...prices) : 0
  const globalMax = prices.length ? Math.max(...prices) : 99999
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(99999)

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const precio = getPrice(p)
      // Buscar la categoría activa por slug o id para comparar de ambas formas
      const activeCat   = categories.find(c => (c.slug || c.id) === activeCategory)
      const matchCat    = activeCategory === 'todos'
        || (p.category || '').toLowerCase() === activeCategory.toLowerCase()
        || (activeCat && (p.category || '').toLowerCase() === (activeCat.slug || '').toLowerCase())
        || (activeCat && (p.category || '').toLowerCase() === activeCat.id.toLowerCase())
      const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase())
      const matchPrice  = precio >= priceMin && precio <= priceMax
      return matchCat && matchSearch && matchPrice
    })

    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => getPrice(a) - getPrice(b))
      case 'price-desc': return [...list].sort((a, b) => getPrice(b) - getPrice(a))
      case 'newest':     return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      case 'name':       return [...list].sort((a, b) => a.name.localeCompare(b.name))
      default:           return list
    }
  }, [products, activeCategory, search, priceMin, priceMax, sort])

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  const resetFilters = () => {
    setActiveCategory('todos')
    setSearch('')
    setSort('default')
    setPriceMin(globalMin)
    setPriceMax(globalMax)
  }

  const hasActiveFilters = activeCategory !== 'todos' || priceMin !== globalMin || priceMax !== globalMax || sort !== 'default'

  return (
    <>
    <SEO
      title="Tienda de Mates — Mates artesanales, bombillas y yerbas"
      canonical="/tienda"
      description="Comprá mates artesanales de calabaza, porongo, cerámica y acero. Bombillas de alpaca, yerbas seleccionadas y accesorios. Envíos a todo Argentina."
    />
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Todo lo que necesitás<br />para tu mate</h1>
          <p className="hero-subtitle">Mates artesanales, bombillas, yerbas y mucho más. Envíos a todo el país.</p>
        </div>
      </section>

      <section className="catalog">
        {/* ── Toolbar ── */}
        <div className="catalog-toolbar">
          <div className="catalog-toolbar-left">
            <div className="categories">
              <button
                className={activeCategory === 'todos' ? 'cat-btn active' : 'cat-btn'}
                onClick={() => setActiveCategory('todos')}
              >
                Todos
              </button>
              {visibleCategories.map(cat => {
                const val = cat.slug || cat.id
                return (
                  <button
                    key={cat.id}
                    className={activeCategory === val ? 'cat-btn active' : 'cat-btn'}
                    onClick={() => setActiveCategory(val)}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="catalog-toolbar-right">
            <button
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(v => !v)}
            >
              🎚 Filtros {hasActiveFilters && <span className="filter-dot" />}
            </button>
            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              type="text"
              placeholder="Buscar..."
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Panel de filtros ── */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-price">
              <div className="filter-price-header">
                <span>Precio</span>
                <span className="filter-price-range">{formatPrice(priceMin)} — {formatPrice(priceMax)}</span>
              </div>
              <div className="price-slider-wrap">
                <input
                  type="range"
                  min={globalMin} max={globalMax}
                  value={priceMin}
                  onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 100))}
                  className="price-slider price-slider-min"
                />
                <input
                  type="range"
                  min={globalMin} max={globalMax}
                  value={priceMax}
                  onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 100))}
                  className="price-slider price-slider-max"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <button className="reset-filters-btn" onClick={resetFilters}>
                ✕ Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* ── Resultados ── */}
        <div className="catalog-results-bar">
          <span>{filtered.length} productos</span>
          {hasActiveFilters && (
            <button className="reset-filters-link" onClick={resetFilters}>Limpiar filtros</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No encontramos productos que coincidan.</p>
            <button className="btn-secondary" onClick={resetFilters}>Ver todos</button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
    </>
  )
}
