import { getDb } from './lib/mongodb.js'

// MercadoPago llama a este endpoint cada vez que cambia el estado de un pago
export default async function handler(req, res) {
  // MP hace un GET de verificación al configurar el webhook
  if (req.method === 'GET') return res.status(200).send('ok')
  if (req.method !== 'POST') return res.status(405).end()

  const { type, data } = req.body || {}
  if (type !== 'payment' || !data?.id) return res.status(200).end()

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) return res.status(500).end()

  try {
    // Consultar el pago en la API de MP
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    const payment = await payRes.json()

    const { status, external_reference } = payment
    if (!external_reference) return res.status(200).end()

    const statusMap = {
      approved:   'pagado',
      rejected:   'rechazado',
      pending:    'pendiente_pago',
      in_process: 'en_proceso',
      refunded:   'reembolsado',
      cancelled:  'cancelado',
    }

    const db = await getDb()
    await db.collection('orders').updateOne(
      { orderId: external_reference },
      {
        $set: {
          status:      statusMap[status] || status,
          mpPaymentId: String(data.id),
          mpStatus:    status,
          updatedAt:   new Date().toISOString(),
        },
      }
    )

    return res.status(200).end()
  } catch (err) {
    console.error('[mp-webhook]', err)
    return res.status(500).end()
  }
}
