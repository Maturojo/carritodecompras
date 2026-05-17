import { getDb } from './lib/mongodb.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Faltan campos' })

    const db = await getDb()
    const user = await db.collection('users').findOne({ email, password })

    if (!user) return res.status(401).json({ error: 'Email o contraseña incorrectos.' })

    const { password: _, _id, ...safeUser } = user
    return res.status(200).json({ ok: true, user: { ...safeUser, id: _id.toString() } })
  } catch (err) {
    console.error('[auth-login]', err)
    return res.status(500).json({ error: err.message })
  }
}
