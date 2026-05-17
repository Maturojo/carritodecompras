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
    const db  = await getDb()
    const col = db.collection('products')

    // GET → listar todos
    if (req.method === 'GET') {
      const products = await col.find({}).toArray()
      return res.status(200).json(
        products.map(p => ({ ...p, id: p._id.toString(), _id: undefined }))
      )
    }

    // POST → crear nuevo (soporta variantes)
    if (req.method === 'POST') {
      const { name, description, category, variants, price, stock, image } = req.body
      if (!name) return res.status(400).json({ error: 'Falta el nombre del producto' })

      const doc = {
        name,
        description: description || '',
        category:    category    || 'otros',
        createdAt:   new Date().toISOString(),
      }

      // Si viene con variantes → formato nuevo
      if (variants && variants.length > 0) {
        doc.variants = variants.map(v => ({
          id:     v.id || (Date.now().toString() + Math.random().toString(36).slice(2)),
          name:   v.name   || 'Única',
          price:  Number(v.price)  || 0,
          stock:  Number(v.stock)  || 0,
          images: Array.isArray(v.images) ? v.images : [],
        }))
      } else {
        // Formato viejo (sin variantes)
        doc.price = Number(price) || 0
        doc.stock = Number(stock) || 0
        doc.image = image || ''
      }

      const result = await col.insertOne(doc)
      return res.status(201).json({ ...doc, id: result.insertedId.toString(), _id: undefined })
    }

    // PUT → actualizar
    if (req.method === 'PUT') {
      const { id, ...fields } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      if (fields.price !== undefined) fields.price = Number(fields.price)
      if (fields.stock !== undefined) fields.stock = Number(fields.stock)
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
