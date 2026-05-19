import { Link, useSearchParams } from 'react-router-dom'

export default function PagoPendiente() {
  const [params] = useSearchParams()
  const orderId = params.get('external_reference')

  return (
    <main className="checkout-page">
      <div className="order-success">
        <div className="success-icon" style={{ fontSize: '3.5rem' }}>⏳</div>
        <h2>Pago en proceso</h2>
        <p>Tu pago está siendo procesado. Puede tardar unos minutos. Te avisamos por email cuando se confirme.</p>

        {orderId && (
          <div className="tracking-box">
            <p className="tracking-label">Número de pedido</p>
            <span className="tracking-number">{orderId}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link to="/tienda" className="btn-primary">Volver a la tienda</Link>
          <Link to="/mi-cuenta" className="btn-outline">Ver mis pedidos</Link>
        </div>
      </div>
    </main>
  )
}
