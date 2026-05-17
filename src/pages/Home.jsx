import { useState, useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import { useStore } from '../context/StoreContext'
import { categories } from '../data/products'

const SORT_OPTIONS = [
  { value: 'default',    label: 'Destacados' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'newest',     label: 'Más nuevos' },
  { value: 'name',       label: 'Nombre A-Z' },
]

export default function Home() {
  const { products } = useStore()
  const [activeCategory, setActiveCategory] = useState('todos')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  const prices = products.map(p => p.price)
  const globalMin = Math.min(...prices)
  const globalMax = Math.max(...prices)
  const [priceMin, setPriceMin] = useState(globalMin)
  const [priceMax, setPriceMax] = useState(globalMax)

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = activeCategory === 'todos' || (p.category || '').toLowerCase() === activeCategory.toLowerCase()
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchPrice = p.price >= priceMin && p.price <= priceMax
      return matchCat && matchSearch && matchPrice
    })

    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'newest':     return [...list].sort((a, b) => b.id - a.id)
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
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={activeCategory === cat.id ? 'cat-btn active' : 'cat-btn'}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
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
  )
}
