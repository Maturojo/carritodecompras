import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const { products } = useStore()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const results = query.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  const goTo = (id) => { navigate(`/tienda/${id}`); onClose() }
  const goToTienda = () => { navigate(`/tienda`); onClose() }

  if (!open) return null

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <span className="search-icon-big">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Buscá mates, bombillas, yerbas..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="search-close-btn" onClick={onClose}>✕</button>
        </div>

        {query.length >= 2 && (
          <div className="search-results">
            {results.length === 0 ? (
              <p className="search-empty">No encontramos resultados para "<strong>{query}</strong>"</p>
            ) : (
              <>
                <p className="search-results-label">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
                {results.map(p => (
                  <button key={p.id} className="search-result-item" onClick={() => goTo(p.id)}>
                    <img src={p.image} alt={p.name} className="search-result-img" />
                    <div className="search-result-info">
                      <span className="search-result-name">{p.name}</span>
                      <span className="search-result-cat">{p.category}</span>
                    </div>
                    <span className="search-result-price">{formatPrice(p.price)}</span>
                  </button>
                ))}
                <button className="search-see-all" onClick={goToTienda}>
                  Ver todos los productos →
                </button>
              </>
            )}
          </div>
        )}

        {query.length < 2 && (
          <div className="search-hints">
            <p>Sugerencias:</p>
            <div className="search-tags">
              {['Mate calabaza', 'Bombilla alpaca', 'Yerba premium', 'Termo Stanley', 'Kit regalo'].map(s => (
                <button key={s} className="search-tag" onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
