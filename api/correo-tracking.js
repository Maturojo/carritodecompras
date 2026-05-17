/**
 * Serverless function: GET /api/correo-tracking?numero=CA12345678
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
  const data = await res.json()
  return data.access_token
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const { numero } = req.query
  if (!numero) return res.status(400).json({ error: 'Falta el número de envío' })

  if (!process.env.CORREO_USUARIO) {
    return res.status(200).json(mockTracking(numero))
  }

  try {
    const token = await getToken()
    const trackRes = await fetch(`${BASE_URL}/v1/envios/${numero}/seguimiento`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!trackRes.ok) throw new Error(await trackRes.text())
    const data = await trackRes.json()

    const eventos = (data.eventos || data.movimientos || []).map(e => ({
      fecha: e.fecha || e.fechaHora,
      descripcion: e.descripcion || e.estado || e.situacion,
      sucursal: e.sucursal || e.localidad || '',
    }))

    return res.status(200).json({ ok: true, eventos })
  } catch (error) {
    console.error('[correo-tracking]', error)
    return res.status(200).json(mockTracking(numero))
  }
}

function mockTracking(numero) {
  return {
    ok: true,
    mock: true,
    eventos: [
      { fecha: new Date().toISOString(), descripcion: 'Pieza registrada en el sistema', sucursal: 'Buenos Aires Centro' },
      { fecha: new Date(Date.now() - 7200000).toISOString(), descripcion: 'En preparación para despacho', sucursal: 'MateShop' },
    ],
    numero,
  }
}
