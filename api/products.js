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
    const col = db.collection('products')

    // GET → listar todos
    if (req.method === 'GET') {
      const products = await col.find({}).toArray()
      return res.status(200).json(products.map(p => ({ ...p, id: p._id.toString(), _id: undefined })))
    }

    // POST → crear nuevo
    if (req.method === 'POST') {
      const { name, description, price, stock, category, image } = req.body
      if (!name || !price) return res.status(400).json({ error: 'Faltan campos obligatorios' })
      const doc = {
        name,
        description: description || '',
        price: Number(price),
        stock: Number(stock) || 0,
        category: category || 'otros',
        image: image || '',
        createdAt: new Date().toISOString(),
      }
      const result = await col.insertOne(doc)
      return res.status(201).json({ ...doc, id: result.insertedId.toString(), _id: undefined })
    }

    // PUT → actualizar
    if (req.method === 'PUT') {
      const { id, ...fields } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      if (fields.price) fields.price = Number(fields.price)
      if (fields.stock) fields.stock = Number(fields.stock)
      await col.updateOne({ _id: new ObjectId(id) }, { $set: fields })
      return res.status(200).json({ ok: true })
    }

    // DELETE → eliminar
    if (req.method === 'DELETE') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      await col.deleteOne({ _id: new ObjectId(id) })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error('[products]', err)
    return res.status(500).json({ error: err.message })
  }
}
