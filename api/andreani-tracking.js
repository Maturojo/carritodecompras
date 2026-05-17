/**
 * Serverless function: GET /api/andreani-tracking?numero=AND12345678
 * Devuelve el estado de seguimiento de un envío.
 */

const SANDBOX = process.env.ANDREANI_SANDBOX !== 'false'
const BASE_URL = SANDBOX
  ? 'https://apisqa.andreani.com'
  : 'https://apis.andreani.com'

async function getToken() {
  const credentials = Buffer.from(
    `${process.env.ANDREANI_USUARIO}:${process.env.ANDREANI_PASSWORD}`
  ).toString('base64')
  const res = await fetch(`${BASE_URL}/v2/usuarios/login`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${credentials}` },
  })
  const data = await res.json()
  return data.token || data.access_token
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const { numero } = req.query
  if (!numero) return res.status(400).json({ error: 'Falta el número de envío' })

  if (!process.env.ANDREANI_USUARIO) {
    return res.status(200).json(mockTracking(numero))
  }

  try {
    const token = await getToken()
    const trackRes = await fetch(`${BASE_URL}/v1/envios/${numero}/eventos`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!trackRes.ok) throw new Error(await trackRes.text())
    const data = await trackRes.json()

    const eventos = (data.eventos || data).map(e => ({
      fecha: e.fecha,
      descripcion: e.descripcion || e.estado,
      sucursal: e.sucursal || e.localidad || '',
    }))

    return res.status(200).json({ ok: true, eventos })
  } catch (error) {
    console.error('[andreani-tracking]', error)
    return res.status(200).json(mockTracking(numero))
  }
}

function mockTracking(numero) {
  return {
    ok: true,
    mock: true,
    eventos: [
      { fecha: new Date().toISOString(), descripcion: 'Envío ingresado al sistema', sucursal: 'Buenos Aires' },
      { fecha: new Date(Date.now() - 3600000).toISOString(), descripcion: 'En preparación en depósito', sucursal: 'MateShop' },
    ],
    numero,
  }
}
