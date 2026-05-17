/**
 * Serverless function: POST /api/andreani-envio
 * Crea una orden de envío en Andreani al confirmar el pedido.
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
    headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Error al autenticar con Andreani')
  const data = await res.json()
  return data.token || data.access_token
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  // Modo simulado si no hay credenciales
  if (!process.env.ANDREANI_USUARIO) {
    return res.status(200).json(mockEnvio(req.body))
  }

  try {
    const { orden, servicio } = req.body
    const token = await getToken()

    const body = {
      contrato: process.env.ANDREANI_CLIENTE,
      origen: {
        postal: { codigoPostal: '1001' }, // CP de tu depósito
      },
      destino: {
        postal: { codigoPostal: orden.codigoPostal },
        descripcion: orden.direccion,
        nombreyApellido: orden.nombre,
        email: orden.email,
        celular: orden.telefono,
      },
      remitente: {
        nombreyApellido: 'MateShop',
        email: 'hola@mateshop.com.ar',
      },
      bultos: [{
        kilos: 0.5,
        largoCm: 20, altoCm: 15, anchoCm: 10,
        valorDeclarado: orden.total,
        descripcion: 'Productos de mate',
      }],
    }

    const envioRes = await fetch(`${BASE_URL}/v1/ordenes-de-envio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!envioRes.ok) throw new Error(await envioRes.text())
    const data = await envioRes.json()

    return res.status(200).json({
      ok: true,
      numeroEnvio: data.numeroDeEnvio || data.numeroSeguimiento,
      etiquetaUrl: data.etiqueta || null,
    })
  } catch (error) {
    console.error('[andreani-envio]', error)
    return res.status(200).json(mockEnvio(req.body))
  }
}

function mockEnvio(body) {
  return {
    ok: true,
    mock: true,
    numeroEnvio: `AND${Date.now().toString().slice(-8)}`,
    etiquetaUrl: null,
    mensaje: 'Envío simulado (sin credenciales configuradas)',
  }
}
