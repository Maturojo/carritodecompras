const ENVIO = {
  proveedor: 'convenir',
  nombre: 'Envío a convenir',
  precio: 0,
  diasEstimados: 'A coordinar',
}

export default function ShippingQuote({ codigoPostal, selected, onSelect }) {
  // Preseleccionar automáticamente al ingresar el CP
  if (codigoPostal && codigoPostal.length >= 4 && !selected) {
    onSelect(ENVIO)
  }

  if (!codigoPostal || codigoPostal.length < 4) return null

  return (
    <div className="shipping-quote">
      <div className="shipping-header">
        <span className="shipping-logo">🚚</span>
        <span>Envío</span>
      </div>
      <div className="shipping-options">
        <label className="shipping-option selected">
          <input type="radio" name="shipping" checked readOnly onChange={() => onSelect(ENVIO)} />
          <div className="shipping-option-info">
            <div className="shipping-option-top">
              <span className="shipping-option-name">Envío a convenir</span>
            </div>
            <span className="shipping-option-days">📦 El costo de envío queda a cargo del comprador</span>
          </div>
          <span className="shipping-option-price">A convenir</span>
        </label>
      </div>
    </div>
  )
}
