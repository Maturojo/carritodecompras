import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function PagoExitoso() {
  const [params] = useSearchParams()
  const orderId     = params.get('external_reference')
  const paymentId   = params.get('payment_id')
  const [done, setDone] = useState(false)

  // Marcar el pedido como pagado usando el external_reference
  useEffect(() => {
    if (!orderId) return
    fetch('/api/mp-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment',
        data: { id: paymentId },
      }),
    }).finally(() => setDone(true))
  }, [orderId])

  return (
    <main className="checkout-page">
      <div className="order-success">
        <div className="success-icon" style={{ fontSize: '3.5rem' }}>✅</div>
        <h2>¡Pago confirmado!</h2>
        <p>Tu pedido fue procesado con éxito. En breve te enviamos la confirmación por email.</p>

        {orderId && (
          <div className="tracking-box">
            <p className="tracking-label">Número de pedido</p>
            <span className="tracking-number">{orderId}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <Link to="/tienda" className="btn-primary">Seguir comprando</Link>
          <Link to="/mi-cuenta" className="btn-outline">Ver mis pedidos</Link>
        </div>
      </div>
    </main>
  )
}
