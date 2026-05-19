import { getDb } from './lib/mongodb.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const BASE_URL = 'https://www.mateandcomdp.com.ar'

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  // ── PREFERENCIA: POST /api/mp?action=preferencia ──
  if (action === 'preferencia') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado en Vercel' })

    const {
      items, envio, total, subtotal,
      nombre, email, telefono,
      direccion, ciudad, provincia, codigoPostal,
    } = req.body

    const orderId = `MC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const mpItems = items.map(i => ({
      id:          String(i.id),
      title:       i.name,
      quantity:    Number(i.quantity),
      unit_price:  Number(i.price),
      currency_id: 'ARS',
    }))

    if (envio?.precio > 0) {
      mpItems.push({
        id: 'envio', title: `Envío — ${envio.nombre}`,
        quantity: 1, unit_price: Number(envio.precio), currency_id: 'ARS',
      })
    }

    try {
      const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: mpItems,
          payer: { email, name: nombre },
          back_urls: {
            success: `${BASE_URL}/pago-exitoso`,
            failure: `${BASE_URL}/pago-fallido`,
            pending: `${BASE_URL}/pago-pendiente`,
          },
          auto_return: 'approved',
          external_reference: orderId,
          statement_descriptor: 'MATE&CO',
          notification_url: `${BASE_URL}/api/mp?action=webhook`,
        }),
      })

      const mpData = await mpRes.json()
      if (!mpRes.ok) throw new Error(mpData.message || 'Error al crear preferencia en MercadoPago')

      const db = await getDb()
      await db.collection('orders').insertOne({
        orderId, nombre, email, telefono,
        direccion, ciudad, provincia, codigoPostal,
        items, envio,
        subtotal: Number(subtotal),
        total:    Number(total),
        status:   'pendiente_pago',
        mpPreferenciaId: mpData.id,
        date: new Date().toISOString(),
      })

      return res.status(200).json({ init_point: mpData.init_point, orderId })
    } catch (err) {
      console.error('[mp:preferencia]', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // ── WEBHOOK: POST /api/mp?action=webhook ──
  if (action === 'webhook') {
    if (req.method === 'GET') return res.status(200).send('ok')

    const { type, data } = req.body || {}
    if (type !== 'payment' || !data?.id) return res.status(200).end()

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) return res.status(500).end()

    try {
      const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      const payment = await payRes.json()
      const { status, external_reference } = payment
      if (!external_reference) return res.status(200).end()

      const statusMap = {
        approved: 'pagado', rejected: 'rechazado',
        pending: 'pendiente_pago', in_process: 'en_proceso',
        refunded: 'reembolsado', cancelled: 'cancelado',
      }

      const db = await getDb()
      await db.collection('orders').updateOne(
        { orderId: external_reference },
        { $set: { status: statusMap[status] || status, mpPaymentId: String(data.id), mpStatus: status, updatedAt: new Date().toISOString() } }
      )

      return res.status(200).end()
    } catch (err) {
      console.error('[mp:webhook]', err)
      return res.status(500).end()
    }
  }

  return res.status(400).json({ error: 'Acción no válida. Usá ?action=preferencia o ?action=webhook' })
}
