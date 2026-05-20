import { getDb } from './lib/mongodb.js'
import { ObjectId } from 'mongodb'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const DEFAULT_CATS = [
  { id: 'mates',     label: 'Mates' },
  { id: 'bombillas', label: 'Bombillas' },
  { id: 'yerbas',    label: 'Yerbas' },
  { id: 'termos',    label: 'Termos' },
  { id: 'kits',      label: 'Kits' },
]

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { resource } = req.query

  // ── CATEGORÍAS: /api/products?resource=categories ──
  if (resource === 'categories') {
    try {
      const db  = await getDb()
      const col = db.collection('categories')

      if (req.method === 'GET') {
        let cats = await col.find({}).sort({ order: 1, label: 1 }).toArray()
        // Sembrar solo si la colección está completamente vacía (primera vez)
        if (cats.length === 0) {
          await col.insertMany(DEFAULT_CATS.map((c, i) => ({ id: c.id, label: c.label, order: i })))
          cats = await col.find({}).sort({ order: 1, label: 1 }).toArray()
        }
        return res.status(200).json(
          cats.map(c => ({ id: c._id.toString(), slug: c.id || '', label: c.label }))
        )
      }
      if (req.method === 'POST') {
        const { label } = req.body
        if (!label?.trim()) return res.status(400).json({ error: 'Falta el nombre' })
        const slug = label.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        const result = await col.insertOne({ id: slug, label: label.trim(), order: Date.now() })
        // id = ObjectId para operaciones, slug = texto legible
        return res.status(201).json({ id: result.insertedId.toString(), slug, label: label.trim() })
      }
      if (req.method === 'PUT') {
        const { _id, label } = req.body
        if (!_id) return res.status(400).json({ error: 'Falta el id' })
        await col.updateOne({ _id: new ObjectId(_id) }, { $set: { label } })
        return res.status(200).json({ ok: true })
      }
      if (req.method === 'DELETE') {
        const { id } = req.query
        if (!id) return res.status(400).json({ error: 'Falta el id' })
        await col.deleteOne({ _id: new ObjectId(id) })
        return res.status(200).json({ ok: true })
      }
    } catch (err) {
      console.error('[categories]', err)
      return res.status(500).json({ error: err.message })
    }
  }

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
