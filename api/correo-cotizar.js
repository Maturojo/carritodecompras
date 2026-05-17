/**
 * Serverless function: POST /api/correo-cotizar
 * Cotiza el costo de envío con la API de Correo Argentino.
 *
 * Variables de entorno (Vercel > Settings > Environment Variables):
 *   CORREO_USUARIO   → usuario de la API
 *   CORREO_PASSWORD  → contraseña
 *   CORREO_CLIENTE   → número de cliente / cuenta
 *   CORREO_SANDBOX   → "true" para pruebas, "false" para producción
 */

const SANDBOX = process.env.CORREO_SANDBOX !== 'false'
const BASE_URL = SANDBOX
  ? 'https://apiqa.correoargentino.com.ar'
  : 'https://apis.correoargentino.com.ar'

async function getToken() {
  const res = await fetch(`${BASE_URL}/v1/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CORREO_USUARIO,
      client_secret: process.env.CORREO_PASSWORD,
      grant_type: 'client_credentials',
    }),
  })
  if (!res.ok) throw new Error('Error al autenticar con Correo Argentino')
  const data = await res.json()
  return data.access_token
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  if (!process.env.CORREO_USUARIO) {
    return res.status(200).json(mockCotizacion(req.body))
  }

  try {
    const { codigoPostalOrigen = '1001', codigoPostalDestino, pesoGramos = 500 } = req.body

    const token = await getToken()

    const cotizRes = await fetch(`${BASE_URL}/v1/tarifas/cotizar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cuentaCliente: process.env.CORREO_CLIENTE,
        cpOrigen: codigoPostalOrigen,
        cpDestino: codigoPostalDestino,
        pesoGr: pesoGramos,
        alto: 15, ancho: 10, largo: 20,
      }),
    })

    if (!cotizRes.ok) throw new Error(await cotizRes.text())
    const data = await cotizRes.json()

    return res.status(200).json({
      ok: true,
      servicios: (data.productos || data.tarifas || [data]).map(p => ({
        nombre: p.nombre || p.descripcion || 'Encomienda Estándar',
        precio: p.precio || p.tarifaConIva || p.importe,
        diasEstimados: p.diasHabiles || p.plazoEntrega || '5-8',
        proveedor: 'correo',
      })),
    })
  } catch (error) {
    console.error('[correo-cotizar]', error)
    return res.status(200).json(mockCotizacion(req.body))
  }
}

function mockCotizacion(body) {
  const cp = parseInt(body?.codigoPostalDestino || '1000')
  const esGBA = cp >= 1000 && cp <= 1999
  const esCentro = cp >= 2000 && cp <= 5999
  return {
    ok: true,
    mock: true,
    servicios: [
      {
        nombre: 'Encomienda Estándar',
        precio: esGBA ? 540 : esCentro ? 780 : 1100,
        diasEstimados: esGBA ? '3-5' : esCentro ? '5-7' : '7-10',
        proveedor: 'correo',
      },
      {
        nombre: 'Encomienda Prioritaria',
        precio: esGBA ? 890 : esCentro ? 1250 : 1750,
        diasEstimados: esGBA ? '2-3' : esCentro ? '3-4' : '5-6',
        proveedor: 'correo',
      },
    ],
  }
}
