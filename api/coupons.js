import { getDb } from '../lib/mongodb.js'
import { ObjectId } from 'mongodb'
import { getCouponDiscount, normalizeCouponCode, validateCouponRules } from '../src/data/coupons.js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const serialize = ({ _id, ...coupon }) => ({ ...coupon, id: _id.toString() })

function generateCode(prefix = 'MATE') {
  const cleanPrefix = normalizeCouponCode(prefix).replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'MATE'
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${cleanPrefix}-${random}`
}

function normalizeCouponDoc(body = {}) {
  const type = body.type === 'fixed' ? 'fixed' : 'percent'
  return {
    code: normalizeCouponCode(body.code || generateCode(body.prefix)),
    label: body.label?.trim() || (type === 'percent' ? `${Number(body.value) || 0}% OFF` : 'Cupón de descuento'),
    description: body.description?.trim() || '',
    type,
    value: Math.max(0, Number(body.value) || 0),
    minSubtotal: Math.max(0, Number(body.minSubtotal) || 0),
    maxDiscount: body.maxDiscount === '' || body.maxDiscount == null ? null : Math.max(0, Number(body.maxDiscount) || 0),
    usageLimit: body.usageLimit === '' || body.usageLimit == null ? null : Math.max(1, Number(body.usageLimit) || 1),
    expiresAt: body.expiresAt || null,
    active: body.active !== false,
  }
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = await getDb()
    const col = db.collection('coupons')

    if (req.method === 'GET') {
      const code = normalizeCouponCode(req.query.code || '')
      if (code) {
        const subtotal = Number(req.query.subtotal) || 0
        const coupon = await col.findOne({ code })
        const result = validateCouponRules(coupon, subtotal)
        if (!result.ok) return res.status(400).json({ error: result.error })
        return res.status(200).json({
          coupon: serialize(coupon),
          discount: getCouponDiscount(coupon, subtotal),
        })
      }

      const coupons = await col.find({}).sort({ createdAt: -1 }).toArray()
      return res.status(200).json(coupons.map(serialize))
    }

    if (req.method === 'POST') {
      const doc = {
        ...normalizeCouponDoc(req.body),
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      if (!doc.code) return res.status(400).json({ error: 'Falta el código' })
      if (!doc.value) return res.status(400).json({ error: 'El descuento debe ser mayor a 0' })

      const exists = await col.findOne({ code: doc.code })
      if (exists) return res.status(409).json({ error: 'Ya existe un cupón con ese código' })

      const result = await col.insertOne(doc)
      return res.status(201).json({ ...doc, id: result.insertedId.toString() })
    }

    if (req.method === 'PUT') {
      const { id, ...fields } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      const update = {
        ...normalizeCouponDoc(fields),
        updatedAt: new Date().toISOString(),
      }
      await col.updateOne({ _id: new ObjectId(id) }, { $set: update })
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      await col.deleteOne({ _id: new ObjectId(id) })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error('[coupons]', err)
    return res.status(500).json({ error: err.message })
  }
}
