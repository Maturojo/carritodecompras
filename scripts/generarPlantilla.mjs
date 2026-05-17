import * as XLSX from 'xlsx'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Encabezados ──
const headers = [
  'Nombre',
  'Descripción',
  'Categoría',
  'Variante',
  'Precio',
  'Stock',
  'Imágenes'
]

// ── Ejemplos de productos ──
const ejemplos = [
  // Producto con 1 sola variante
  ['Mate de calabaza artesanal', 'Mate de calabaza curado a mano, ideal para el mate amargo.', 'Mates', 'Natural', 3500, 20, 'https://ejemplo.com/imagen1.jpg'],

  // Producto con 2 variantes (mismo nombre, distintas filas)
  ['Mate de madera tallado', 'Mate de algarrobo tallado a mano por artesanos del norte.', 'Mates', 'Algarrobo', 5200, 15, 'https://ejemplo.com/imagen2.jpg | https://ejemplo.com/imagen2b.jpg'],
  ['Mate de madera tallado', 'Mate de algarrobo tallado a mano por artesanos del norte.', 'Mates', 'Quebracho', 5800, 10, 'https://ejemplo.com/imagen3.jpg'],

  // Yerba
  ['Yerba premium suave', 'Blend suave con palo, ideal para tomar todo el día.', 'Yerbas', '500g', 1800, 50, 'https://ejemplo.com/imagen4.jpg'],
  ['Yerba premium suave', 'Blend suave con palo, ideal para tomar todo el día.', 'Yerbas', '1kg', 3200, 30, 'https://ejemplo.com/imagen4.jpg'],

  // Bombilla
  ['Bombilla de alpaca', 'Bombilla pico de loro de alpaca plateada, filtro superior.', 'Accesorios', 'Pico de loro', 1200, 40, 'https://ejemplo.com/imagen5.jpg'],
  ['Bombilla de alpaca', 'Bombilla pico de loro de alpaca plateada, filtro superior.', 'Accesorios', 'Corazón', 1400, 25, 'https://ejemplo.com/imagen5.jpg | https://ejemplo.com/imagen5b.jpg'],

  // Termo
  ['Termo Stanley 1L', 'Termo Stanley clásico de 1 litro, mantiene el calor 18 hs.', 'Termos', 'Verde', 18000, 8, 'https://ejemplo.com/imagen6.jpg'],
  ['Termo Stanley 1L', 'Termo Stanley clásico de 1 litro, mantiene el calor 18 hs.', 'Termos', 'Negro', 18000, 12, 'https://ejemplo.com/imagen6b.jpg'],
  ['Termo Stanley 1L', 'Termo Stanley clásico de 1 litro, mantiene el calor 18 hs.', 'Termos', 'Beige', 19000, 5, 'https://ejemplo.com/imagen6c.jpg'],
]

// ── Crear workbook ──
const wb = XLSX.utils.book_new()

// Hoja de productos
const wsData = [headers, ...ejemplos]
const ws = XLSX.utils.aoa_to_sheet(wsData)

// Ancho de columnas
ws['!cols'] = [
  { wch: 35 },  // Nombre
  { wch: 55 },  // Descripción
  { wch: 18 },  // Categoría
  { wch: 18 },  // Variante
  { wch: 12 },  // Precio
  { wch: 10 },  // Stock
  { wch: 60 },  // Imágenes
]

XLSX.utils.book_append_sheet(wb, ws, 'Productos')

// Hoja de instrucciones
const instrucciones = [
  ['📋 INSTRUCCIONES PARA COMPLETAR LA PLANILLA'],
  [''],
  ['COLUMNAS:'],
  ['Nombre', 'Nombre del producto. Si tiene variantes, repetí el mismo nombre en cada fila.'],
  ['Descripción', 'Descripción del producto. Puede ser la misma para todas las variantes.'],
  ['Categoría', 'Una de estas: Mates / Yerbas / Accesorios / Termos / Sets / Otros'],
  ['Variante', 'Nombre de la variante: color, tamaño, material, etc. Ej: "500g", "Verde", "Algarrobo"'],
  ['Precio', 'Precio en pesos argentinos. Solo números, sin $. Ej: 3500'],
  ['Stock', 'Cantidad disponible en stock. Solo números. Ej: 20'],
  ['Imágenes', 'URL de la imagen. Para múltiples imágenes, separarlas con " | " (espacio, barra, espacio)'],
  [''],
  ['EJEMPLO DE PRODUCTO CON VARIANTES:'],
  ['Si un mate tiene versión "Natural" y "Pintado", hacés 2 filas con el mismo Nombre.'],
  [''],
  ['CATEGORÍAS DISPONIBLES:'],
  ['Mates', 'Todos los mates artesanales'],
  ['Yerbas', 'Yerbas y blends'],
  ['Accesorios', 'Bombillas, soportes, etc.'],
  ['Termos', 'Termos de todas las marcas'],
  ['Sets', 'Kits o combos de productos'],
  ['Otros', 'Cualquier otro producto'],
  [''],
  ['IMPORTANTE:'],
  ['- No modificar los nombres de las columnas (primera fila)'],
  ['- Los precios van SIN puntos ni comas. Ej: 3500 (no 3.500)'],
  ['- Las URLs de imágenes deben ser links directos a la imagen (terminar en .jpg, .png, etc.)'],
  ['- Para subir la planilla: Admin → Productos → Importar Excel'],
]

const wsInstr = XLSX.utils.aoa_to_sheet(instrucciones)
wsInstr['!cols'] = [{ wch: 25 }, { wch: 70 }]
XLSX.utils.book_append_sheet(wb, wsInstr, 'Instrucciones')

// Guardar archivo
const outputPath = path.join(__dirname, '..', 'public', 'plantilla-productos.xlsx')
XLSX.writeFile(wb, outputPath)

console.log('✅ Plantilla generada en: public/plantilla-productos.xlsx')
