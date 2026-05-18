import { getDb } from './lib/mongodb.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db  = await getDb()
    const col = db.collection('settings')

    // GET → traer contenido por key
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      const { key } = req.query
      if (key) {
        const doc = await col.findOne({ key })
        return res.status(200).json(doc || {})
      }
      const all = await col.find({}).toArray()
      return res.status(200).json(all)
    }

    // PUT → guardar contenido
    if (req.method === 'PUT') {
      const { key, _id, ...data } = req.body   // _id se descarta — no se puede modificar en MongoDB
      if (!key) return res.status(400).json({ error: 'Falta key' })
      await col.updateOne({ key }, { $set: { key, ...data } }, { upsert: true })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error('[content]', err)
    return res.status(500).json({ error: err.message })
  }
}
