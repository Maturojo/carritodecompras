import { useEffect } from 'react'
import { useShipping } from '../hooks/useShipping'

const PROVEEDORES = {
  andreani: { nombre: 'Andreani',          color: '#e63946', emoji: '🟥' },
  correo:   { nombre: 'Correo Argentino',  color: '#2d6a4f', emoji: '🟩' },
}

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

export default function ShippingQuote({ codigoPostal, selected, onSelect }) {
  const { opciones, loading, error, cotizar } = useShipping()
  const hasMock = opciones.some(o => o.mock)

  useEffect(() => {
    if (codigoPostal?.length >= 4) {
      onSelect(null)
      cotizar({ codigoPostal })
    }
  }, [codigoPostal])

  if (!codigoPostal || codigoPostal.length < 4) return null

  return (
    <div className="shipping-quote">
      <div className="shipping-header">
        <span className="shipping-logo">🚚</span>
        <span>Opciones de envío disponibles</span>
        {hasMock && <span className="shipping-mock-badge">Modo simulado</span>}
      </div>

      {loading && (
        <div className="shipping-loading">
          <span className="spinner" />
          Cotizando con Andreani y Correo Argentino...
        </div>
      )}

      {error && <p className="shipping-error">{error}</p>}

      {!loading && opciones.length > 0 && (
        <div className="shipping-options">
          {opciones.map((op, i) => {
            const prov = PROVEEDORES[op.proveedor] || PROVEEDORES.andreani
            const isSelected = selected?.nombre === op.nombre && selected?.proveedor === op.proveedor
            const isCheapest = i === 0
            return (
              <label key={`${op.proveedor}-${op.nombre}`} className={`shipping-option ${isSelected ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={isSelected}
                  onChange={() => onSelect(op)}
                />
                <div className="shipping-option-info">
                  <div className="shipping-option-top">
                    <span className="shipping-option-name">{op.nombre}</span>
                    <span className="shipping-prov-badge" style={{ background: prov.color }}>
                      {prov.nombre}
                    </span>
                    {isCheapest && <span className="shipping-best-badge">💰 Más económico</span>}
                  </div>
                  <span className="shipping-option-days">⏱ {op.diasEstimados} días hábiles</span>
                </div>
                <span className="shipping-option-price">{formatPrice(op.precio)}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
