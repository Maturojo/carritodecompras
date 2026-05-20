import { getDb } from './lib/mongodb.js'
import { ObjectId } from 'mongodb'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const DEFAULTS = [
  { id: 'mates',     label: 'Mates' },
  { id: 'bombillas', label: 'Bombillas' },
  { id: 'yerbas',    label: 'Yerbas' },
  { id: 'termos',    label: 'Termos' },
  { id: 'kits',      label: 'Kits' },
]

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db  = await getDb()
    const col = db.collection('categories')

    if (req.method === 'GET') {
      const cats = await col.find({}).sort({ order: 1, label: 1 }).toArray()
      const result = cats.length > 0
        ? cats.map(c => ({ ...c, id: c._id.toString(), _id: undefined }))
        : DEFAULTS
      return res.status(200).json(result)
    }

    if (req.method === 'POST') {
      const { label } = req.body
      if (!label?.trim()) return res.status(400).json({ error: 'Falta el nombre' })
      const id = label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      const result = await col.insertOne({ id, label: label.trim(), order: Date.now() })
      return res.status(201).json({ id: result.insertedId.toString(), label: label.trim() })
    }

    if (req.method === 'PUT') {
      const { _id, id, ...data } = req.body
      const docId = _id || id
      if (!docId) return res.status(400).json({ error: 'Falta el id' })
      await col.updateOne({ _id: new ObjectId(docId) }, { $set: data })
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      await col.deleteOne({ _id: new ObjectId(id) })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error('[categories]', err)
    return res.status(500).json({ error: err.message })
  }
}
