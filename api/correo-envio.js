/**
 * Serverless function: POST /api/correo-envio
 * Crea una orden de envío en Correo Argentino al confirmar el pedido.
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  if (!process.env.CORREO_USUARIO) {
    return res.status(200).json(mockEnvio(req.body))
  }

  try {
    const { orden, servicio } = req.body
    const token = await getToken()

    const body = {
      cuentaCliente: process.env.CORREO_CLIENTE,
      producto: servicio,
      remitente: {
        nombre: 'MateShop',
        calle: 'Av. Corrientes', numero: '1234',
        codigoPostal: '1043',
        localidad: 'Buenos Aires',
        provincia: 'CABA',
        email: 'hola@mateshop.com.ar',
      },
      destinatario: {
        nombre: orden.nombre,
        calle: orden.direccion,
        codigoPostal: orden.codigoPostal,
        localidad: orden.ciudad,
        provincia: orden.provincia,
        email: orden.email,
        telefono: orden.telefono,
      },
      piezas: [{
        pesoGr: 500,
        alto: 15, ancho: 10, largo: 20,
        valorDeclarado: orden.total,
        descripcion: 'Productos de mate',
      }],
    }

    const envioRes = await fetch(`${BASE_URL}/v1/envios`, {
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
      numeroEnvio: data.numeroEnvio || data.codigoEnvio || data.id,
      etiquetaUrl: data.urlEtiqueta || null,
    })
  } catch (error) {
    console.error('[correo-envio]', error)
    return res.status(200).json(mockEnvio(req.body))
  }
}

function mockEnvio() {
  return {
    ok: true,
    mock: true,
    numeroEnvio: `CA${Date.now().toString().slice(-10)}`,
    etiquetaUrl: null,
  }
}
