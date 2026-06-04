import { useEffect, useRef } from 'react'
import { useShipping } from '../hooks/useShipping'

const LOGOS = {
  correo: '📮',
  andreani: '📦',
  local: '🏠',
}

const TIPO_LABELS = {
  domicilio: '🏠 Envío a domicilio',
  sucursal: '🏢 Retiro en sucursal',
}

export default function ShippingQuote({ codigoPostal, pesoTotal = 0.5, selected, onSelect }) {
  const { opciones, loading, error, cotizar } = useShipping()
  const lastCP = useRef(null)

  useEffect(() => {
    if (!codigoPostal || codigoPostal.length < 4) return
    if (codigoPostal === lastCP.current) return
    lastCP.current = codigoPostal
    cotizar({ codigoPostal, pesoTotal })
  }, [codigoPostal, pesoTotal, cotizar])

  if (!codigoPostal || codigoPostal.length < 4) return null

  return (
    <div className="shipping-quote">
      <div className="shipping-header">
        <span className="shipping-logo">🚚</span>
        <span>Opciones de envío</span>
      </div>

      {loading && (
        <div className="shipping-loading">
          <span className="shipping-spinner" />
          Cotizando envíos…
        </div>
      )}

      {error && !loading && opciones.length === 0 && (
        <p className="shipping-error">{error}</p>
      )}

      {!loading && opciones.length > 0 && (
        <div className="shipping-options">
          {opciones.map((op, i) => {
            const isSelected = selected?.nombre === op.nombre && selected?.proveedor === op.proveedor
            return (
              <label key={i} className={`shipping-option${isSelected ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="shipping"
                  checked={isSelected}
                  onChange={() => onSelect(op)}
                />
                <div className="shipping-option-info">
                  <div className="shipping-option-top">
                    <span className="shipping-option-logo">{LOGOS[op.proveedor] || '🚚'}</span>
                    <span className="shipping-option-name">{op.nombre}</span>
                    {op.mock && <span className="shipping-mock-badge">estimado</span>}
                  </div>
                  <span className="shipping-option-days">
                    🕐 {op.diasEstimados} días hábiles
                  </span>
                </div>
                <span className="shipping-option-price" style={op.precio === 0 ? { color: '#16a34a', fontWeight: 700 } : {}}>
                  {op.precio === 0
                    ? 'GRATIS'
                    : new Intl.NumberFormat('es-AR', {
                        style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
                      }).format(op.precio)}
                </span>
              </label>
            )
          })}
        </div>
      )}

      {!loading && opciones.length > 0 && opciones[0]?.proveedor !== 'local' && (
        <p className="shipping-disclaimer">
          * El precio puede variar según la localidad y es a cargo del comprador.
        </p>
      )}
    </div>
  )
}
