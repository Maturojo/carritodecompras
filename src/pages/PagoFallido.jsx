import { Link, useSearchParams } from 'react-router-dom'

export default function PagoFallido() {
  const [params] = useSearchParams()
  const orderId = params.get('external_reference')

  return (
    <main className="checkout-page">
      <div className="order-success">
        <div className="success-icon" style={{ fontSize: '3.5rem' }}>❌</div>
        <h2>El pago no se procesó</h2>
        <p>Hubo un problema con tu pago. Podés intentarlo de nuevo o elegir otro método.</p>

        {orderId && (
          <div className="tracking-box">
            <p className="tracking-label">Número de pedido</p>
            <span className="tracking-number">{orderId}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link to="/checkout" className="btn-primary">Intentar de nuevo</Link>
          <Link to="/contacto" className="btn-outline">Contactarnos</Link>
        </div>
      </div>
    </main>
  )
}
