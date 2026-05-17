import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI no configurada en las variables de entorno.')

let client
let clientPromise

// En desarrollo reutilizamos la conexión para no abrir una nueva en cada hot-reload
if (process.env.NODE_ENV !== 'production') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDb() {
  const c = await clientPromise
  return c.db('mateshop')
}
