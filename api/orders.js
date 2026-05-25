import { getDb } from './lib/mongodb.js'
import { ObjectId } from 'mongodb'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = await getDb()
    const col = db.collection('orders')

    // GET → listar todos (más recientes primero)
    if (req.method === 'GET') {
      const { email } = req.query
      const query = email ? { email } : {}
      const orders = await col.find(query).sort({ date: -1 }).toArray()
      return res.status(200).json(orders.map(o => ({ ...o, id: o._id.toString(), _id: undefined })))
    }

    // POST → crear pedido
    if (req.method === 'POST') {
      const order = {
        ...req.body,
        status: 'pendiente',
        date: new Date().toISOString(),
      }
      const result = await col.insertOne(order)
      return res.status(201).json({ ...order, id: result.insertedId.toString(), _id: undefined })
    }

    // PUT → actualizar estado
    if (req.method === 'PUT') {
      const { id, status, numeroEnvio } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      const update = {}
      if (status) update.status = status
      if (numeroEnvio) update.numeroEnvio = numeroEnvio
      await col.updateOne({ _id: new ObjectId(id) }, { $set: update })
      return res.status(200).json({ ok: true })
    }

    // DELETE ?action=reset → borrar todos los pedidos
    if (req.method === 'DELETE' && req.query.action === 'reset') {
      await col.deleteMany({})
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error('[orders]', err)
    return res.status(500).json({ error: err.message })
  }
}
