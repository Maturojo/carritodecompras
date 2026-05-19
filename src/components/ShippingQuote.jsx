import { useEffect } from 'react'
import { useShipping } from '../hooks/useShipping'

const PROVEEDORES = {
  andreani: { nombre: 'Andreani',          color: '#e63946', emoji: '🟥' },
  correo:   { nombre: 'Correo Argentino',  color: '#2d6a4f', emoji: '🟩' },
}

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

// Códigos postales de Mar del Plata (7600–7609)
const MDP_ENVIO = {
  proveedor: 'local',
  nombre: 'Envío a convenir',
  precio: 0,
  diasEstimados: 'A coordinar',
  local: true,
}
const isMdp = (cp) => /^760\d$/.test(cp?.trim())

export default function ShippingQuote({ codigoPostal, selected, onSelect }) {
  const { opciones, loading, error, cotizar } = useShipping()
  const hasMock = opciones.some(o => o.mock)
  const esLocal = isMdp(codigoPostal)

  useEffect(() => {
    if (!codigoPostal || codigoPostal.length < 4) return
    onSelect(null)
    if (isMdp(codigoPostal)) {
      onSelect(MDP_ENVIO)   // lo preseleccionamos automáticamente
    } else {
      cotizar({ codigoPostal })
    }
  }, [codigoPostal])

  if (!codigoPostal || codigoPostal.length < 4) return null

  // ── CP de Mar del Plata: mostrar solo "Envío a convenir" ──
  if (esLocal) {
    return (
      <div className="shipping-quote">
        <div className="shipping-header">
          <span className="shipping-logo">🏠</span>
          <span>Envío local — Mar del Plata</span>
        </div>
        <div className="shipping-options">
          <label className="shipping-option selected">
            <input type="radio" name="shipping" checked readOnly />
            <div className="shipping-option-info">
              <div className="shipping-option-top">
                <span className="shipping-option-name">Envío a convenir</span>
                <span className="shipping-prov-badge" style={{ background: '#9c664d' }}>Local</span>
              </div>
              <span className="shipping-option-days">📍 Nos contactamos para coordinar la entrega</span>
            </div>
            <span className="shipping-option-price">A convenir</span>
          </label>
        </div>
      </div>
    )
  }

  // ── Resto del país ──
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
