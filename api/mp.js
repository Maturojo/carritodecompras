import { getDb } from './lib/mongodb.js'

const isMdp = (cp) => /^760\d$/.test(cp?.trim())

const formatARS = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

async function notificarDueno(order) {
  const resendKey  = process.env.RESEND_API_KEY
  const ownerEmail = process.env.OWNER_EMAIL || 'hola@mateandcomdp.com.ar'
  if (!resendKey) return

  const esLocal  = isMdp(order.codigoPostal)
  const itemsHtml = order.items
    .map(i => `<tr><td style="padding:6px 10px;border-bottom:1px solid #f0ebe4">${i.name}</td><td style="padding:6px 10px;border-bottom:1px solid #f0ebe4;text-align:center">x${i.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #f0ebe4;text-align:right">${formatARS(i.price * i.quantity)}</td></tr>`)
    .join('')

  const html = `
  <div style="font-family:sans-serif;max-width:540px;margin:0 auto;color:#2d1a0e">
    <div style="background:#9c664d;padding:22px 24px;border-radius:10px 10px 0 0">
      <h2 style="color:#fff;margin:0;font-size:20px">🧉 Nueva venta — Mate&Co</h2>
      ${esLocal ? '<p style="color:#ffe0c8;margin:6px 0 0;font-size:13px">📍 Cliente de Mar del Plata — coordinar entrega</p>' : ''}
    </div>
    <div style="border:1px solid #e8dfd4;border-top:none;padding:22px 24px;border-radius:0 0 10px 10px;background:#fff">
      <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#9c664d;margin:0 0 12px">Datos del cliente</h3>
      <p style="margin:5px 0"><b>Nombre:</b> ${order.nombre}</p>
      <p style="margin:5px 0"><b>Teléfono:</b> ${order.telefono}</p>
      <p style="margin:5px 0"><b>Email:</b> ${order.email}</p>
      <p style="margin:5px 0"><b>Dirección:</b> ${order.direccion}, ${order.ciudad} (CP ${order.codigoPostal})</p>

      <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#9c664d;margin:20px 0 12px">Productos</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr style="background:#f8f4ef"><th style="padding:8px 10px;text-align:left">Producto</th><th style="padding:8px 10px">Cant.</th><th style="padding:8px 10px;text-align:right">Subtotal</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="margin-top:16px;padding:14px 16px;background:#f8f4ef;border-radius:8px">
        <p style="margin:4px 0"><b>Envío:</b> ${order.envio?.nombre || '—'} ${order.envio?.precio > 0 ? formatARS(order.envio.precio) : '(a convenir)'}</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:700">Total: ${formatARS(order.total)}</p>
      </div>
      <p style="margin-top:16px;font-size:11px;color:#aaa">Pedido #${order.orderId}</p>
    </div>
  </div>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mate&Co Ventas <ventas@mateandcomdp.com.ar>',
      to: [ownerEmail],
      subject: `🧉 Nueva venta${esLocal ? ' 📍 MdP' : ''} — ${order.nombre} · ${formatARS(order.total)}`,
      html,
    }),
  }).catch(e => console.error('[notificarDueno]', e))
}

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

      // Notificar al dueño si el pago fue aprobado
      if (status === 'approved') {
        const order = await db.collection('orders').findOne({ orderId: external_reference })
        if (order) await notificarDueno(order)
      }

      return res.status(200).end()
    } catch (err) {
      console.error('[mp:webhook]', err)
      return res.status(500).end()
    }
  }

  return res.status(400).json({ error: 'Acción no válida. Usá ?action=preferencia o ?action=webhook' })
}
