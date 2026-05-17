import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const input  = path.join(__dirname, '..', 'public', 'logo.jpeg')
const output = path.join(__dirname, '..', 'public', 'favicon.png')

const size = 180
const circle = Buffer.from(
  `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" /></svg>`
)

await sharp(input)
  .resize(size, size)
  .composite([{ input: circle, blend: 'dest-in' }])
  .png()
  .toFile(output)

console.log('✅ favicon.png circular generado')
