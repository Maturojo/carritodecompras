import { getDb } from './lib/mongodb.js'
import { ObjectId } from 'mongodb'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const db = await getDb()
    const col = db.collection('users')

    // GET → listar todos (solo para admin, sin passwords)
    if (req.method === 'GET') {
      const users = await col.find({}).sort({ createdAt: -1 }).toArray()
      return res.status(200).json(
        users.map(({ password: _, _id, ...u }) => ({ ...u, id: _id.toString() }))
      )
    }

    // POST → registrar nuevo usuario
    if (req.method === 'POST') {
      const { nombre, email, password } = req.body
      if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan campos' })

      const exists = await col.findOne({ email })
      if (exists) return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' })

      const newUser = {
        nombre,
        email,
        password, // En producción real deberías hashear con bcrypt
        createdAt: new Date().toISOString(),
      }
      const result = await col.insertOne(newUser)
      const { password: _, ...safeUser } = newUser
      return res.status(201).json({ ...safeUser, id: result.insertedId.toString() })
    }

    // PUT → actualizar perfil
    if (req.method === 'PUT') {
      const { id, nombre, email } = req.body
      if (!id) return res.status(400).json({ error: 'Falta el id' })
      await col.updateOne({ _id: new ObjectId(id) }, { $set: { nombre, email } })
      return res.status(200).json({ ok: true })
    }

    // DELETE ?action=reset → borrar todos los clientes
    if (req.method === 'DELETE' && req.query.action === 'reset') {
      await col.deleteMany({})
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (err) {
    console.error('[users]', err)
    return res.status(500).json({ error: err.message })
  }
}
