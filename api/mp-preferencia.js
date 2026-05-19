import { getDb } from './lib/mongodb.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const BASE_URL = 'https://www.mateandcomdp.com.ar'

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN no configurado en Vercel' })
  }

  const {
    items, envio, total, subtotal,
    nombre, email, telefono,
    direccion, ciudad, provincia, codigoPostal,
  } = req.body

  const orderId = `MC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  // Armar ítems para MercadoPago
  const mpItems = items.map(i => ({
    id:         String(i.id),
    title:      i.name,
    quantity:   Number(i.quantity),
    unit_price: Number(i.price),
    currency_id: 'ARS',
  }))

  if (envio?.precio > 0) {
    mpItems.push({
      id:         'envio',
      title:      `Envío — ${envio.nombre}`,
      quantity:   1,
      unit_price: Number(envio.precio),
      currency_id: 'ARS',
    })
  }

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
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
        notification_url: `${BASE_URL}/api/mp-webhook`,
      }),
    })

    const mpData = await mpRes.json()
    if (!mpRes.ok) {
      throw new Error(mpData.message || 'Error al crear preferencia en MercadoPago')
    }

    // Guardar pedido como pendiente en MongoDB
    const db = await getDb()
    await db.collection('orders').insertOne({
      orderId,
      nombre, email, telefono,
      direccion, ciudad, provincia, codigoPostal,
      items,
      envio,
      subtotal: Number(subtotal),
      total:    Number(total),
      status:   'pendiente_pago',
      mpPreferenciaId: mpData.id,
      date: new Date().toISOString(),
    })

    return res.status(200).json({ init_point: mpData.init_point, orderId })
  } catch (err) {
    console.error('[mp-preferencia]', err)
    return res.status(500).json({ error: err.message })
  }
}
