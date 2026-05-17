/**
 * Serverless function: POST /api/andreani-cotizar
 * Cotiza el costo de envío con la API de Andreani.
 *
 * Credenciales: configurar en Vercel > Settings > Environment Variables:
 *   ANDREANI_USUARIO   → usuario de la API
 *   ANDREANI_PASSWORD  → contraseña de la API
 *   ANDREANI_CLIENTE   → número de cliente Andreani
 *   ANDREANI_SANDBOX   → "true" para pruebas, "false" para producción
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
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) throw new Error('Error al autenticar con Andreani')
  const data = await res.json()
  return data.token || data.access_token
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  // Si no hay credenciales configuradas → modo simulado
  if (!process.env.ANDREANI_USUARIO) {
    return res.status(200).json(mockCotizacion(req.body))
  }

  try {
    const { codigoPostalOrigen = '1001', codigoPostalDestino, pesoTotal = 0.5, bultos = 1 } = req.body

    const token = await getToken()

    const body = {
      contrato: process.env.ANDREANI_CLIENTE,
      origen: { codigoPostal: codigoPostalOrigen },
      destino: { codigoPostal: codigoPostalDestino },
      bultos: Array(bultos).fill({ kilos: pesoTotal / bultos, valorDeclarado: 0 }),
    }

    const cotizacion = await fetch(`${BASE_URL}/v1/tarifas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!cotizacion.ok) {
      const err = await cotizacion.text()
      throw new Error(`Error Andreani: ${err}`)
    }

    const data = await cotizacion.json()

    // Normalizamos la respuesta
    return res.status(200).json({
      ok: true,
      servicios: (data.tarifas || [data]).map(t => ({
        nombre: t.nombre || t.tipoServicio || 'Estándar',
        precio: t.tarifaConIva || t.precio || t.importe,
        diasEstimados: t.diasHabiles || t.plazoEntrega || '3-5',
      })),
    })
  } catch (error) {
    console.error('[andreani-cotizar]', error)
    // Si falla la API real → devolvemos mock igual
    return res.status(200).json(mockCotizacion(req.body))
  }
}

function mockCotizacion(body) {
  const cp = parseInt(body?.codigoPostalDestino || '1000')
  // Simulamos precios según zona
  const esGBA = cp >= 1000 && cp <= 1999
  const esCentro = cp >= 2000 && cp <= 5999
  return {
    ok: true,
    mock: true,
    servicios: [
      {
        nombre: 'Andreani Estándar',
        precio: esGBA ? 850 : esCentro ? 1200 : 1800,
        diasEstimados: esGBA ? '2-3' : esCentro ? '3-5' : '5-7',
      },
      {
        nombre: 'Andreani Urgente',
        precio: esGBA ? 1400 : esCentro ? 1900 : 2800,
        diasEstimados: esGBA ? '1' : esCentro ? '2' : '3-4',
      },
    ],
  }
}
