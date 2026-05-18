import { useState, useRef, useEffect } from 'react'

/* ─────────── CONFIG ─────────── */
const TIPOS = [
  { id: 'calabaza', label: 'Calabaza' },
  { id: 'porongo',  label: 'Porongo'  },
  { id: 'ceramica', label: 'Cerámica' },
  { id: 'acero',    label: 'Acero'    },
]
const CUERPOS = [
  { id: 'natural',    label: 'Madera natural',  hex: '#B5723A', hex2: '#8B5E3C', rough: 0.85, metal: 0.0 },
  { id: 'oscuro',     label: 'Madera oscura',   hex: '#3B1F0A', hex2: '#2E1503', rough: 0.8,  metal: 0.0 },
  { id: 'negro',      label: 'Cuero negro',     hex: '#1A1A1A', hex2: '#111111', rough: 0.7,  metal: 0.0 },
  { id: 'marron',     label: 'Cuero marrón',    hex: '#5C3317', hex2: '#3D200A', rough: 0.75, metal: 0.0 },
  { id: 'ceramica_b', label: 'Cerámica blanca', hex: '#F0EDE4', hex2: '#DDD9CE', rough: 0.35, metal: 0.0 },
  { id: 'ceramica_g', label: 'Cerámica gris',   hex: '#9B9B9B', hex2: '#7A7A7A', rough: 0.4,  metal: 0.0 },
  { id: 'verde',      label: 'Verde mate',      hex: '#3A5E3A', hex2: '#2A4A2A', rough: 0.7,  metal: 0.0 },
  { id: 'azul',       label: 'Azul cobalto',    hex: '#1E3A72', hex2: '#162B55', rough: 0.65, metal: 0.0 },
]
const AROS = [
  { id: 'alpaca', label: 'Alpaca',     hex: '#D8D8D0', rough: 0.25, metal: 0.85 },
  { id: 'dorado', label: 'Dorado',     hex: '#CFB53B', rough: 0.2,  metal: 1.0  },
  { id: 'acero',  label: 'Acero',      hex: '#8A9AA8', rough: 0.2,  metal: 0.95 },
  { id: 'plata',  label: 'Plata lisa', hex: '#E8E8E0', rough: 0.15, metal: 1.0  },
]
const DISEÑOS_VIROLA = [
  { id: 'ninguno',    label: 'Sin diseño',  cat: '' },
  // Naturaleza
  { id: 'estrellas',  label: '✦ Estrellas', cat: 'Naturaleza' },
  { id: 'flores',     label: '🌸 Flores',   cat: 'Naturaleza' },
  { id: 'sol',        label: '☀ Sol',       cat: 'Naturaleza' },
  { id: 'luna',       label: '🌙 Luna',     cat: 'Naturaleza' },
  { id: 'hoja',       label: '🍃 Hojas',    cat: 'Naturaleza' },
  { id: 'ola',        label: '🌊 Olas',     cat: 'Naturaleza' },
  { id: 'copo',       label: '❄ Copos',     cat: 'Naturaleza' },
  // Símbolos
  { id: 'corazon',    label: '❤ Corazones', cat: 'Símbolos' },
  { id: 'diamante',   label: '◆ Diamantes', cat: 'Símbolos' },
  { id: 'ancla',      label: '⚓ Anclas',   cat: 'Símbolos' },
  { id: 'infinito',   label: '∞ Infinito',  cat: 'Símbolos' },
  { id: 'corona',     label: '♛ Coronas',  cat: 'Símbolos' },
  // Abstracto
  { id: 'geometrico', label: '◈ Étnico',    cat: 'Abstracto' },
  { id: 'espiral',    label: '🌀 Espirales',cat: 'Abstracto' },
  { id: 'zigzag',     label: '⋀ Zigzag',   cat: 'Abstracto' },
  { id: 'tribal',     label: '⬟ Tribal',   cat: 'Abstracto' },
  { id: 'puntos',     label: '· Puntos',    cat: 'Abstracto' },
  // Temáticos
  { id: 'ruteamos',   label: '🛣 Ruteamos', cat: 'Temáticos' },
  { id: 'patas',      label: '🐾 Patas',    cat: 'Temáticos' },
  { id: 'musical',    label: '🎵 Musical',  cat: 'Temáticos' },
]

const FUENTES = [
  // Serif
  { id: 'georgia',    label: 'Georgia',     font: 'Georgia, serif',                        cat: 'Serif',   preview: 'Ag' },
  { id: 'playfair',   label: 'Playfair',    font: '"Playfair Display", Georgia, serif',    cat: 'Serif',   preview: 'Ag' },
  { id: 'cinzel',     label: 'Cinzel',      font: '"Cinzel", Georgia, serif',              cat: 'Serif',   preview: 'Ag' },
  { id: 'cormorant',  label: 'Cormorant',   font: '"Cormorant Garamond", Georgia, serif',  cat: 'Serif',   preview: 'Ag' },
  // Sans
  { id: 'montserrat', label: 'Montserrat',  font: '"Montserrat", sans-serif',              cat: 'Sans',    preview: 'Ag' },
  { id: 'poppins',    label: 'Poppins',     font: '"Poppins", sans-serif',                 cat: 'Sans',    preview: 'Ag' },
  { id: 'raleway',    label: 'Raleway',     font: '"Raleway", sans-serif',                 cat: 'Sans',    preview: 'Ag' },
  { id: 'oswald',     label: 'Oswald',      font: '"Oswald", sans-serif',                  cat: 'Sans',    preview: 'Ag' },
  // Script
  { id: 'dancing',    label: 'Dancing',     font: '"Dancing Script", cursive',             cat: 'Script',  preview: 'Ag' },
  { id: 'pacifico',   label: 'Pacifico',    font: '"Pacifico", cursive',                   cat: 'Script',  preview: 'Ag' },
  { id: 'great',      label: 'Great Vibes', font: '"Great Vibes", cursive',                cat: 'Script',  preview: 'Ag' },
  { id: 'sacramento', label: 'Sacramento',  font: '"Sacramento", cursive',                 cat: 'Script',  preview: 'Ag' },
  { id: 'satisfy',    label: 'Satisfy',     font: '"Satisfy", cursive',                    cat: 'Script',  preview: 'Ag' },
  { id: 'caveat',     label: 'Caveat',      font: '"Caveat", cursive',                     cat: 'Script',  preview: 'Ag' },
  // Display
  { id: 'bebas',      label: 'Bebas Neue',  font: '"Bebas Neue", sans-serif',              cat: 'Display', preview: 'AG' },
  { id: 'lobster',    label: 'Lobster',     font: '"Lobster", cursive',                    cat: 'Display', preview: 'Ag' },
  { id: 'abril',      label: 'Abril',       font: '"Abril Fatface", serif',                cat: 'Display', preview: 'Ag' },
]

/* ─────────── UTILIDADES ─────────── */
function adjustHex(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}


/* ═══════════════════════════════════
   DIBUJO DEL CANVAS — funciones
═══════════════════════════════════ */
function drawCircularText(ctx, text, cx, cy, radius, startAngle, endAngle) {
  if (!text.trim()) return
  const chars = text.split('')
  const totalArc = endAngle - startAngle
  const charWidths = chars.map(c => ctx.measureText(c).width)
  const totalW = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * 1.5
  const arcNeeded = totalW / radius
  if (arcNeeded > totalArc * 1.1) {
    // Texto muy largo: reducir fuente
    ctx.font = ctx.font.replace(/\d+px/, f => Math.max(10, parseInt(f) - 2) + 'px')
  }
  let currentAngle = startAngle + (totalArc - arcNeeded) / 2
  chars.forEach((char, i) => {
    const charAngle = currentAngle + charWidths[i] / 2 / radius
    ctx.save()
    ctx.translate(cx + radius * Math.cos(charAngle), cy + radius * Math.sin(charAngle))
    ctx.rotate(charAngle + Math.PI / 2)
    ctx.fillText(char, 0, 0)
    ctx.restore()
    currentAngle += charWidths[i] / radius + 1.5 / radius
  })
}

function drawStar(ctx, x, y, outerR, innerR, points) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
    else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
  }
  ctx.closePath()
}

/* ── Naturaleza ── */
function drawFlor(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2); ctx.fill()
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a)*r*0.38, cy + Math.sin(a)*r*0.38, r*0.22, 0, Math.PI*2)
    ctx.fill()
  }
}
function drawSol(ctx, x, y, size, color) {
  ctx.fillStyle = color; ctx.strokeStyle = color
  ctx.beginPath(); ctx.arc(x, y, size * 0.27, 0, Math.PI * 2); ctx.fill()
  ctx.lineWidth = size * 0.1; ctx.lineCap = 'round'
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a)*size*0.36, y + Math.sin(a)*size*0.36)
    ctx.lineTo(x + Math.cos(a)*size*0.52, y + Math.sin(a)*size*0.52)
    ctx.stroke()
  }
}
function drawLuna(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, size * 0.38, 0, Math.PI * 2, false)
  ctx.arc(x + size * 0.19, y - size * 0.07, size * 0.29, 0, Math.PI * 2, true)
  ctx.fill('evenodd')
}
function drawHoja(ctx, x, y, size, color) {
  ctx.fillStyle = color; ctx.strokeStyle = color
  ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 4)
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.48)
  ctx.bezierCurveTo(size*0.38, -size*0.28, size*0.38, size*0.28, 0, size*0.48)
  ctx.bezierCurveTo(-size*0.38, size*0.28, -size*0.38, -size*0.28, 0, -size*0.48)
  ctx.fill()
  ctx.strokeStyle = adjustHex(color, 50); ctx.lineWidth = 0.9
  ctx.beginPath(); ctx.moveTo(0, -size*0.42); ctx.lineTo(0, size*0.42); ctx.stroke()
  ctx.restore()
}
function drawOla(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.12; ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - size*0.48, y + size*0.08)
  ctx.bezierCurveTo(x-size*0.22, y-size*0.32, x+size*0.06, y+size*0.34, x+size*0.28, y-size*0.04)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - size*0.28, y + size*0.24)
  ctx.bezierCurveTo(x-size*0.04, y-size*0.12, x+size*0.24, y+size*0.28, x+size*0.48, y+size*0.1)
  ctx.stroke()
}
function drawCopo(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.1; ctx.lineCap = 'round'
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a)*size*0.44, y + Math.sin(a)*size*0.44); ctx.stroke()
    const mx = x + Math.cos(a)*size*0.24, my = y + Math.sin(a)*size*0.24
    const perp = a + Math.PI / 2
    ctx.beginPath()
    ctx.moveTo(mx + Math.cos(perp)*size*0.13, my + Math.sin(perp)*size*0.13)
    ctx.lineTo(mx - Math.cos(perp)*size*0.13, my - Math.sin(perp)*size*0.13)
    ctx.stroke()
  }
}

/* ── Símbolos ── */
function drawCorazon(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.save(); ctx.translate(x, y)
  const s = size * 0.028
  ctx.beginPath()
  ctx.moveTo(0, s * 6)
  ctx.bezierCurveTo(-s*2, s*4, -s*8, 0, -s*8, -s*5)
  ctx.bezierCurveTo(-s*8, -s*10, -s*2, -s*12, 0, -s*8)
  ctx.bezierCurveTo(s*2, -s*12, s*8, -s*10, s*8, -s*5)
  ctx.bezierCurveTo(s*8, 0, s*2, s*4, 0, s*6)
  ctx.fill(); ctx.restore()
}
function drawDiamante(ctx, x, y, size, color) {
  ctx.fillStyle = color
  const w = size * 0.38, h = size * 0.5
  ctx.beginPath()
  ctx.moveTo(x, y - h/2)
  ctx.lineTo(x + w/2, y - h*0.08)
  ctx.lineTo(x, y + h/2)
  ctx.lineTo(x - w/2, y - h*0.08)
  ctx.closePath(); ctx.fill()
  ctx.strokeStyle = adjustHex(color, 50); ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(x - w/2, y - h*0.08); ctx.lineTo(x, y - h/2); ctx.lineTo(x + w/2, y - h*0.08)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - w/3, y - h*0.08); ctx.lineTo(x, y - h*0.32); ctx.lineTo(x + w/3, y - h*0.08)
  ctx.stroke()
}
function drawAncla(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'
  ctx.lineWidth = size * 0.1
  ctx.beginPath(); ctx.moveTo(x, y - size*0.42); ctx.lineTo(x, y + size*0.42); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - size*0.30, y - size*0.26); ctx.lineTo(x + size*0.30, y - size*0.26); ctx.stroke()
  ctx.lineWidth = size * 0.09
  ctx.beginPath(); ctx.arc(x, y - size*0.34, size*0.10, 0, Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.arc(x, y + size*0.08, size*0.34, 0.05, Math.PI - 0.05); ctx.stroke()
  ctx.lineWidth = size * 0.08
  ctx.beginPath(); ctx.moveTo(x - size*0.34, y + size*0.08); ctx.lineTo(x - size*0.24, y - size*0.04); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + size*0.34, y + size*0.08); ctx.lineTo(x + size*0.24, y - size*0.04); ctx.stroke()
}
function drawInfinito(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.12; ctx.lineCap = 'round'
  const w = size * 0.44, h = size * 0.22
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.bezierCurveTo(x - w*0.5, y - h*2, x - w, y - h, x - w*0.5, y)
  ctx.bezierCurveTo(x - w, y + h, x - w*0.5, y + h*2, x, y)
  ctx.bezierCurveTo(x + w*0.5, y - h*2, x + w, y - h, x + w*0.5, y)
  ctx.bezierCurveTo(x + w, y + h, x + w*0.5, y + h*2, x, y)
  ctx.stroke()
}
function drawCorona(ctx, x, y, size, color) {
  ctx.fillStyle = color
  const w = size * 0.52, h = size * 0.38
  ctx.beginPath()
  ctx.moveTo(x - w/2, y + h/2)
  ctx.lineTo(x + w/2, y + h/2)
  ctx.lineTo(x + w/2,  y - h*0.05)
  ctx.lineTo(x + w*0.28, y + h*0.12)
  ctx.lineTo(x + w*0.14, y - h/2)
  ctx.lineTo(x, y + h*0.08)
  ctx.lineTo(x - w*0.14, y - h/2)
  ctx.lineTo(x - w*0.28, y + h*0.12)
  ctx.lineTo(x - w/2, y - h*0.05)
  ctx.closePath(); ctx.fill()
  ;[x + w*0.14, x - w*0.14, x].forEach((px, i) => {
    const py = i < 2 ? y - h/2 : y + h*0.08
    ctx.beginPath(); ctx.arc(px, py, size*0.07, 0, Math.PI*2); ctx.fill()
  })
}

/* ── Abstracto ── */
function drawMontania(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y-size*0.7); ctx.lineTo(x-size*0.6, y+size*0.4); ctx.lineTo(x+size*0.6, y+size*0.4)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle = adjustHex(color, 90)
  ctx.beginPath()
  ctx.moveTo(x, y-size*0.7); ctx.lineTo(x-size*0.18, y-size*0.35); ctx.lineTo(x+size*0.18, y-size*0.35)
  ctx.closePath(); ctx.fill()
}
function drawCarpa(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y-size*0.55); ctx.lineTo(x-size*0.55, y+size*0.4); ctx.lineTo(x+size*0.55, y+size*0.4)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle = adjustHex(color, 55)
  ctx.beginPath()
  ctx.moveTo(x-size*0.12, y+size*0.4)
  ctx.arc(x, y+size*0.25, size*0.2, Math.PI, 0)
  ctx.lineTo(x+size*0.12, y+size*0.4); ctx.closePath(); ctx.fill()
}
function drawColectivo(ctx, x, y, size, color) {
  const w = size*1.0, h = size*0.55
  ctx.fillStyle = color
  ctx.beginPath(); ctx.roundRect(x-w/2, y-h/2, w, h, size*0.12); ctx.fill()
  ctx.fillStyle = adjustHex(color, 70)
  ;[-0.28, 0.02, 0.28].forEach(dx => {
    ctx.beginPath()
    ctx.roundRect(x+dx*w-size*0.12, y-h*0.3, size*0.22, size*0.22, 2); ctx.fill()
  })
  ctx.fillStyle = adjustHex(color, -20)
  ;[-0.28, 0.28].forEach(dx => {
    ctx.beginPath(); ctx.arc(x+dx*w, y+h*0.45, size*0.14, 0, Math.PI*2); ctx.fill()
  })
}
function drawBrujula(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.arc(x, y, size*0.42, 0, Math.PI*2); ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y-size*0.32); ctx.lineTo(x-size*0.1, y); ctx.lineTo(x, y+size*0.32)
  ctx.lineTo(x+size*0.1, y); ctx.closePath(); ctx.fill()
}
function drawEspiral(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.1; ctx.lineCap = 'round'
  ctx.beginPath()
  const turns = 2.5, steps = 64
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * turns * Math.PI * 2
    const r = size * 0.04 + t * size * 0.34
    const px = x + r * Math.cos(a), py = y + r * Math.sin(a)
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.stroke()
}
function drawZigzag(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.1; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const n = 4, w = size * 0.9, h = size * 0.3
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const px = x - w/2 + (i / n) * w
    const py = y + (i % 2 === 0 ? h/2 : -h/2)
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.stroke()
}
function drawTribal(ctx, x, y, size, color) {
  ctx.fillStyle = color
  const d = size * 0.4
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4)
  ctx.beginPath(); ctx.rect(-d/2, -d/2, d, d); ctx.fill()
  ctx.strokeStyle = adjustHex(color, 55); ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(-d/4, 0); ctx.lineTo(0, -d/4); ctx.lineTo(d/4, 0); ctx.lineTo(0, d/4)
  ctx.closePath(); ctx.stroke()
  ctx.restore()
}
function drawPuntos(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(x, y, size * 0.15, 0, Math.PI * 2); ctx.fill()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const r = size * 0.3
    ctx.beginPath()
    ctx.arc(x + Math.cos(a)*r, y + Math.sin(a)*r, size * 0.11, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI/6
    const r = size * 0.46
    ctx.beginPath()
    ctx.arc(x + Math.cos(a)*r, y + Math.sin(a)*r, size * 0.07, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ── Temáticos ── */
function drawPatas(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath(); ctx.ellipse(x, y + size*0.1, size*0.2, size*0.17, 0, 0, Math.PI*2); ctx.fill()
  const toes = [
    { dx: -size*0.22, dy: -size*0.08 },
    { dx: -size*0.07, dy: -size*0.22 },
    { dx:  size*0.07, dy: -size*0.22 },
    { dx:  size*0.22, dy: -size*0.08 },
  ]
  toes.forEach(({ dx, dy }) => {
    ctx.beginPath(); ctx.ellipse(x+dx, y+dy, size*0.1, size*0.09, 0, 0, Math.PI*2); ctx.fill()
  })
}
function drawMusical(ctx, x, y, size, color) {
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineCap = 'round'
  // Cabeza de nota izquierda
  ctx.save(); ctx.translate(x - size*0.14, y + size*0.25); ctx.rotate(-Math.PI/7)
  ctx.beginPath(); ctx.ellipse(0, 0, size*0.15, size*0.11, 0, 0, Math.PI*2); ctx.fill()
  ctx.restore()
  // Palo izquierdo
  ctx.lineWidth = size * 0.07
  ctx.beginPath()
  ctx.moveTo(x - size*0.14 + size*0.11, y + size*0.22)
  ctx.lineTo(x - size*0.14 + size*0.11, y - size*0.22)
  ctx.stroke()
  // Cabeza de nota derecha
  ctx.save(); ctx.translate(x + size*0.14, y + size*0.3); ctx.rotate(-Math.PI/7)
  ctx.beginPath(); ctx.ellipse(0, 0, size*0.15, size*0.11, 0, 0, Math.PI*2); ctx.fill()
  ctx.restore()
  // Palo derecho
  ctx.beginPath()
  ctx.moveTo(x + size*0.14 + size*0.11, y + size*0.27)
  ctx.lineTo(x + size*0.14 + size*0.11, y - size*0.17)
  ctx.stroke()
  // Barra de ligadura
  ctx.lineWidth = size * 0.07
  ctx.beginPath()
  ctx.moveTo(x - size*0.03, y - size*0.22)
  ctx.lineTo(x + size*0.25, y - size*0.17)
  ctx.stroke()
}

// zona: 'full' | 'top' | 'bottom'
function drawDesignOnRing(ctx, cx, cy, innerR, outerR, diseño, aroHex, offset, scale = 1, zona = 'full') {
  const ringMid = (innerR + outerR) / 2
  const ringW   = outerR - innerR
  const s       = scale
  const darkColor = adjustHex(aroHex, -65)
  ctx.fillStyle   = darkColor
  ctx.strokeStyle = darkColor
  ctx.lineWidth   = 1.5

  // Rango angular según zona
  const zStart = zona === 'bottom' ?  0         : (zona === 'top' ? -Math.PI : 0)
  const zSpan  = zona === 'full'   ?  Math.PI*2 : Math.PI

  // Helper: ángulo para elemento i de n, dentro de la zona
  const ang    = (i, n) => zStart + (i / n) * zSpan + offset
  // Helper para dibujar n repeticiones de un ícono rotado
  const repeat = (n, sz, fn) => {
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      const rx = cx + ringMid * Math.cos(a), ry = cy + ringMid * Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a + Math.PI / 2)
      fn(ctx, 0, 0, sz, darkColor)
      ctx.restore()
    }
  }
  const nFull = (nF, nH) => zona === 'full' ? nF : nH

  /* ══ Naturaleza ══ */
  if (diseño === 'estrellas') {
    const n = nFull(12, 6)
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      const rx = cx + ringMid * Math.cos(a), ry = cy + ringMid * Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a)
      drawStar(ctx, 0, 0, ringW*0.22*s, ringW*0.10*s, 6); ctx.fill()
      ctx.restore()
    }
  }
  if (diseño === 'flores') {
    const n = nFull(8, 4)
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      drawFlor(ctx, cx + ringMid*Math.cos(a), cy + ringMid*Math.sin(a), ringW*0.3*s, darkColor)
    }
  }
  if (diseño === 'sol')    repeat(nFull(8,  4), ringW*0.36*s, drawSol)
  if (diseño === 'luna')   repeat(nFull(7,  4), ringW*0.36*s, drawLuna)
  if (diseño === 'hoja')   repeat(nFull(10, 5), ringW*0.34*s, drawHoja)
  if (diseño === 'ola')    repeat(nFull(6,  3), ringW*0.38*s, drawOla)
  if (diseño === 'copo')   repeat(nFull(7,  4), ringW*0.38*s, drawCopo)

  /* ══ Símbolos ══ */
  if (diseño === 'corazon')  repeat(nFull(9,  5), ringW*0.36*s, drawCorazon)
  if (diseño === 'diamante') repeat(nFull(10, 5), ringW*0.34*s, drawDiamante)
  if (diseño === 'ancla')    repeat(nFull(7,  4), ringW*0.40*s, drawAncla)
  if (diseño === 'infinito') repeat(nFull(6,  3), ringW*0.36*s, drawInfinito)
  if (diseño === 'corona')   repeat(nFull(7,  4), ringW*0.38*s, drawCorona)

  /* ══ Abstracto ══ */
  if (diseño === 'geometrico') {
    const n = nFull(20, 10)
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      const rx = cx + ringMid*Math.cos(a), ry = cy + ringMid*Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a + Math.PI/4)
      const sz = ringW * 0.22 * s
      ctx.beginPath()
      ctx.moveTo(0,-sz); ctx.lineTo(sz*0.6,0); ctx.lineTo(0,sz); ctx.lineTo(-sz*0.6,0)
      ctx.closePath(); ctx.fill()
      ctx.restore()
    }
    if (zona === 'full') {
      ctx.beginPath(); ctx.arc(cx, cy, innerR+ringW*0.15, 0, Math.PI*2)
      ctx.lineWidth = 1.2; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, outerR-ringW*0.15, 0, Math.PI*2); ctx.stroke()
    }
  }
  if (diseño === 'espiral') repeat(nFull(6,  3), ringW*0.38*s, drawEspiral)
  if (diseño === 'zigzag') {
    const n = nFull(8, 4)
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      const rx = cx + ringMid * Math.cos(a), ry = cy + ringMid * Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a + Math.PI / 2)
      drawZigzag(ctx, 0, 0, ringW*0.30*s, darkColor)
      ctx.restore()
    }
  }
  if (diseño === 'tribal')  repeat(nFull(10, 5), ringW*0.34*s, drawTribal)
  if (diseño === 'puntos')  repeat(nFull(8,  4), ringW*0.38*s, drawPuntos)

  /* ══ Temáticos ══ */
  if (diseño === 'ruteamos') {
    const iconosFull = [
      { t: 0.55, fn: drawMontania }, { t: 0.72, fn: drawCarpa    },
      { t: 0.88, fn: drawColectivo}, { t: 1.05, fn: drawBrujula  },
      { t: 1.22, fn: drawMontania }, { t: 1.38, fn: drawCarpa    },
    ]
    const iconosHalf = [
      { t: 0.2, fn: drawMontania }, { t: 0.5, fn: drawColectivo }, { t: 0.8, fn: drawCarpa },
    ]
    const iconos = zona === 'full' ? iconosFull : iconosHalf
    iconos.forEach(({ t, fn }) => {
      const a = zStart + t * zSpan + offset
      const rx = cx + ringMid*Math.cos(a), ry = cy + ringMid*Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a + Math.PI/2)
      fn(ctx, 0, 0, ringW*0.35*s, darkColor)
      ctx.restore()
    })
    const estrellaTs = zona === 'full' ? [0.62,0.78,0.95,1.12,1.28,1.44] : [0.35,0.65]
    estrellaTs.forEach(t => {
      const a = zStart + t * zSpan + offset + 0.09
      ctx.save(); ctx.translate(cx + (ringMid+ringW*0.1)*Math.cos(a), cy + (ringMid+ringW*0.1)*Math.sin(a))
      drawStar(ctx, 0, 0, ringW*0.08*s, ringW*0.04*s, 4); ctx.fill()
      ctx.restore()
    })
  }
  if (diseño === 'patas')   repeat(nFull(8,  4), ringW*0.36*s, drawPatas)
  if (diseño === 'musical') repeat(nFull(7,  4), ringW*0.40*s, drawMusical)
}

/* ─────────── EFECTO DE GRABADO (canvas offscreen) ─────────── */
function applyEngravingEffect(img, engravingHex, sensitivity = 148) {
  const S   = 360
  const ofc = document.createElement('canvas')
  ofc.width = ofc.height = S
  const octx = ofc.getContext('2d', { willReadFrequently: true })
  octx.drawImage(img, 0, 0, S, S)
  const imageData = octx.getImageData(0, 0, S, S)
  const d = imageData.data

  /* ── 1. Detectar color de fondo muestreando esquinas y bordes ── */
  const sampleIdxs = []
  const edge = 6  // píxeles desde el borde
  for (let e = 0; e < edge; e++) {
    sampleIdxs.push((e * S + e) * 4)               // top-left diagonal
    sampleIdxs.push((e * S + (S - 1 - e)) * 4)    // top-right diagonal
    sampleIdxs.push(((S-1-e) * S + e) * 4)         // bottom-left diagonal
    sampleIdxs.push(((S-1-e) * S + (S-1-e)) * 4)  // bottom-right diagonal
  }

  let bgR = 0, bgG = 0, bgB = 0, bgN = 0
  sampleIdxs.forEach(idx => {
    if (idx >= 0 && idx < d.length - 3 && d[idx + 3] > 200) {
      bgR += d[idx]; bgG += d[idx + 1]; bgB += d[idx + 2]; bgN++
    }
  })
  if (bgN === 0) { bgR = bgG = bgB = 255 }   // default blanco
  else { bgR /= bgN; bgG /= bgN; bgB /= bgN }

  /* Tolerancia dinámica según sensibilidad del slider (60 → 220) */
  const bgTol = 18 + (sensitivity / 220) * 55   // 18–73

  /* ── 2. Color del grabado ── */
  const hx = engravingHex.replace('#', '')
  const eR = parseInt(hx.slice(0, 2), 16)
  const eG = parseInt(hx.slice(2, 4), 16)
  const eB = parseInt(hx.slice(4, 6), 16)

  /* ── 3. Procesar píxel a píxel ── */
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]
    if (a < 20) { d[i + 3] = 0; continue }

    // Distancia Euclidiana al color de fondo detectado
    const dr = r - bgR, dg = g - bgG, db = b - bgB
    const distBg = Math.sqrt(dr * dr + dg * dg + db * db)

    if (distBg < bgTol) {
      // Píxel similar al fondo → totalmente transparente
      d[i + 3] = 0
    } else {
      // Píxel del sujeto → convertir a grabado
      const lum      = 0.299 * r + 0.587 * g + 0.114 * b
      const presence = Math.min(1, (distBg - bgTol) / 40)   // fade de borde suave
      const darkness = lum < 230 ? Math.pow(1 - lum / 230, 0.65) : 0
      const intensity = presence * Math.max(darkness, 0.25)  // mínimo para contornos claros

      d[i]     = eR
      d[i + 1] = eG
      d[i + 2] = eB
      d[i + 3] = Math.min(255, Math.round(intensity * 245 * (a / 255)))
    }
  }

  octx.putImageData(imageData, 0, 0)
  return ofc
}

/* ─────────── COMPONENTE VISTA SUPERIOR INTERACTIVO ─────────── */
function VirolaTopView({ aro, diseño, textoVirola, offset, onOffsetChange,
                         scale = 1, textFont = 'Georgia, serif',
                         textoCompleto = false, distribucion = 'auto',
                         customImageSrc = null, imageRepeat = 1,
                         engThreshold = 148, size = 400 }) {
  const canvasRef  = useRef()
  const isDragging = useRef(false)
  const lastAngle  = useRef(0)
  const [dragging, setDragging] = useState(false)

  /* Dibuja cada vez que cambia alguna prop */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Función principal de dibujo — recibe el objeto Image ya cargado (o null)
    const paint = (loadedImg) => {
    const ctx = canvas.getContext('2d')
    const W = size, cx = W/2, cy = W/2
    const outerR = W * 0.46
    const innerR = W * 0.29
    const ringMid = (outerR + innerR) / 2
    const ringW   = outerR - innerR

    ctx.clearRect(0, 0, W, W)

    /* Sombra exterior */
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = W*0.05; ctx.shadowOffsetY = W*0.015
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI*2)
    ctx.fillStyle = '#bbb'; ctx.fill()
    ctx.restore()

    /* Base del aro */
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI*2)
    ctx.fillStyle = aro.hex; ctx.fill()

    /* Degradado metálico */
    const grad = ctx.createLinearGradient(cx-outerR, cy-outerR, cx+outerR*0.5, cy+outerR*0.5)
    grad.addColorStop(0,   'rgba(255,255,255,0.50)')
    grad.addColorStop(0.25,'rgba(255,255,255,0.18)')
    grad.addColorStop(0.55,'rgba(0,0,0,0.04)')
    grad.addColorStop(1,   'rgba(0,0,0,0.28)')
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI*2)
    ctx.fillStyle = grad; ctx.fill()

    /* Textura granulada */
    ctx.save(); ctx.globalAlpha = 0.035
    for (let i = 0; i < 500; i++) {
      const a = Math.random()*Math.PI*2
      const r = innerR + Math.random()*(outerR-innerR)
      ctx.beginPath(); ctx.arc(cx+r*Math.cos(a), cy+r*Math.sin(a), 0.8, 0, Math.PI*2)
      ctx.fillStyle = Math.random()>0.5?'#fff':'#000'; ctx.fill()
    }
    ctx.restore()

    /* Bordes del aro */
    ctx.beginPath(); ctx.arc(cx, cy, innerR+4, 0, Math.PI*2)
    ctx.strokeStyle = adjustHex(aro.hex, -50); ctx.lineWidth = 3.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, innerR+1, 0, Math.PI*2)
    ctx.strokeStyle = adjustHex(aro.hex, 30); ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, outerR-3, 0, Math.PI*2)
    ctx.strokeStyle = adjustHex(aro.hex, -35); ctx.lineWidth = 2.5; ctx.stroke()

    /* ── Calcular zonas según distribución ── */
    const hayDiseño = diseño !== 'ninguno'
    const hayTexto  = textoVirola.trim().length > 0
    let zonaD = 'full', textStart, textEnd

    if (hayDiseño && hayTexto && distribucion !== 'auto') {
      // Segundo grabado: diseño y texto en mitades opuestas
      if (distribucion === 'diseño-arriba') {
        zonaD     = 'top'            // diseño en mitad superior
        textStart = offset           // texto en mitad inferior
        textEnd   = offset + Math.PI
      } else {                       // 'texto-arriba'
        zonaD     = 'bottom'         // diseño en mitad inferior
        textStart = offset - Math.PI // texto en mitad superior
        textEnd   = offset
      }
    } else if (hayDiseño && hayTexto) {
      // Auto: texto arriba, diseño llena todo el aro
      zonaD     = 'full'
      textStart = -Math.PI * 1.15 + offset
      textEnd   =  Math.PI * 0.15 + offset
    } else {
      // Solo texto, sin diseño
      textStart = textoCompleto ? (offset - Math.PI) : (-Math.PI * 1.15 + offset)
      textEnd   = textoCompleto ? (offset + Math.PI) : ( Math.PI * 0.15 + offset)
    }

    /* Diseños */
    if (hayDiseño) drawDesignOnRing(ctx, cx, cy, innerR, outerR, diseño, aro.hex, offset, scale, zonaD)

    /* Texto circular */
    if (hayTexto) {
      const textR    = ringMid + (outerR-innerR)*0.1
      const fontSize = Math.max(W * 0.037 * scale, 9)
      ctx.font      = `bold ${fontSize}px ${textFont}`
      ctx.fillStyle = adjustHex(aro.hex, -78)
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      drawCircularText(ctx, textoVirola, cx, cy, textR, textStart, textEnd)
    }

    /* Interior del mate */
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI*2)
    const intGrad = ctx.createRadialGradient(cx-innerR*0.2, cy-innerR*0.2, 0, cx, cy, innerR)
    intGrad.addColorStop(0, '#4a2a10'); intGrad.addColorStop(0.4,'#2e1808'); intGrad.addColorStop(1,'#1a0c04')
    ctx.fillStyle = intGrad; ctx.fill()

    /* Reflejo interior */
    ctx.save(); ctx.globalAlpha = 0.12
    ctx.beginPath(); ctx.ellipse(cx-innerR*0.22, cy-innerR*0.28, innerR*0.45, innerR*0.22, -Math.PI/4, 0, Math.PI*2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.restore()

    /* ── Imagen propia — con efecto grabado y fondo removido ── */
    if (loadedImg) {
      const imgSz    = ringW * 1.55 * scale
      const ringMidR = (outerR + innerR) / 2

      // Procesar imagen: quitar fondo + convertir a grabado del color del aro
      const engCanvas = applyEngravingEffect(loadedImg, adjustHex(aro.hex, -72), engThreshold)

      ctx.save()
      // Clip al anillo (donut)
      ctx.beginPath()
      ctx.arc(cx, cy, outerR - 1, 0, Math.PI * 2)
      ctx.arc(cx, cy, innerR + 1, 0, Math.PI * 2, true)
      ctx.clip()

      for (let i = 0; i < imageRepeat; i++) {
        const a = offset - Math.PI / 2 + (i / imageRepeat) * Math.PI * 2
        const ix = cx + ringMidR * Math.cos(a)
        const iy = cy + ringMidR * Math.sin(a)
        ctx.save()
        ctx.translate(ix, iy)
        ctx.rotate(a + Math.PI / 2)
        ctx.drawImage(engCanvas, -imgSz / 2, -imgSz / 2, imgSz, imgSz)
        ctx.restore()
      }
      ctx.restore()
    }

    /* Indicador de posición — pequeño triángulo en el "frente" del diseño */
    if (diseño !== 'ninguno' || textoVirola.trim() || loadedImg) {
      const indicAngle = offset - Math.PI/2  // arriba por defecto
      const indR = outerR + 12
      const ix = cx + indR * Math.cos(indicAngle)
      const iy = cy + indR * Math.sin(indicAngle)
      ctx.save()
      ctx.translate(ix, iy); ctx.rotate(indicAngle + Math.PI/2)
      ctx.fillStyle = adjustHex(aro.hex, -30)
      ctx.beginPath()
      ctx.moveTo(0, -7); ctx.lineTo(5, 3); ctx.lineTo(-5, 3); ctx.closePath(); ctx.fill()
      ctx.restore()
    }

    } // fin de paint()

    // Cargar imagen si hay src, si no pintar directamente
    if (customImageSrc) {
      const img = new Image()
      img.onload  = () => paint(img)
      img.onerror = () => paint(null)
      img.src = customImageSrc
    } else {
      paint(null)
    }

  }, [aro, diseño, textoVirola, offset, scale, textFont, textoCompleto, distribucion, customImageSrc, imageRepeat, engThreshold, size])

  /* ── Helpers para calcular ángulo ── */
  const getAngle = (clientX, clientY) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = size / rect.width
    const scaleY = size / rect.height
    const x = (clientX - rect.left) * scaleX - size / 2
    const y = (clientY - rect.top)  * scaleY - size / 2
    return Math.atan2(y, x)
  }

  /* ── Mouse ── */
  const onMouseDown = e => {
    isDragging.current = true
    setDragging(true)
    lastAngle.current = getAngle(e.clientX, e.clientY)
    e.preventDefault()
  }
  const onMouseMove = e => {
    if (!isDragging.current) return
    const a = getAngle(e.clientX, e.clientY)
    let delta = a - lastAngle.current
    if (delta >  Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    onOffsetChange(delta)
    lastAngle.current = a
    e.preventDefault()
  }
  const onMouseUp = () => { isDragging.current = false; setDragging(false) }

  /* ── Touch ── */
  const onTouchStart = e => {
    isDragging.current = true
    setDragging(true)
    lastAngle.current = getAngle(e.touches[0].clientX, e.touches[0].clientY)
    e.preventDefault()
  }
  const onTouchMove = e => {
    if (!isDragging.current) return
    const a = getAngle(e.touches[0].clientX, e.touches[0].clientY)
    let delta = a - lastAngle.current
    if (delta >  Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    onOffsetChange(delta)
    lastAngle.current = a
    e.preventDefault()
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        width: '100%', height: '100%', display: 'block',
        borderRadius: '50%',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none', touchAction: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    />
  )
}



/* ─────────── PÁGINA ─────────── */
export default function Personalizar() {
  const [tipo,          setTipo]          = useState('calabaza')
  const [cuerpo,        setCuerpo]        = useState(CUERPOS[0])
  const [aro,           setAro]           = useState(AROS[0])
  const [diseño,        setDiseño]        = useState('ninguno')
  const [textoVirola,   setTextoVirola]   = useState('')
  const [offset,        setOffset]        = useState(0)
  const [designScale,   setDesignScale]   = useState(1)
  const [textFont,      setTextFont]      = useState(FUENTES[0].font)
  const [textoCompleto, setTextoCompleto] = useState(false)
  const [distribucion,  setDistribucion]  = useState('auto')
  const [customImageSrc,setCustomImageSrc]= useState(null)
  const [imageRepeat,   setImageRepeat]   = useState(1)
  const [engThreshold,  setEngThreshold]  = useState(148)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCustomImageSrc(ev.target.result)
    reader.readAsDataURL(file)
  }
  const clearImage = () => setCustomImageSrc(null)

  const waMsg = encodeURIComponent(
    `Hola! Me interesa un mate personalizado:\n` +
    `• Forma: ${TIPOS.find(t => t.id === tipo)?.label}\n` +
    `• Material: ${cuerpo.label}\n` +
    `• Aro: ${aro.label}\n` +
    `• Grabado: ${DISEÑOS_VIROLA.find(d => d.id === diseño)?.label}` +
    (textoVirola ? `\n• Texto: "${textoVirola}"` : '') +
    (customImageSrc ? `\n• Imagen propia: sí (te la envío aparte)` : '')
  )

  const hasGrabado = diseño !== 'ninguno' || textoVirola.trim() || !!customImageSrc

  return (
    <main className="page-content">
      <section className="inner-hero" style={{ paddingBottom: '2rem' }}>
        <span className="section-pretitle">Tu mate, tu estilo</span>
        <h1 className="inner-hero-title">Personalizador de virola</h1>
        <p className="inner-hero-sub">Elegí cada detalle y consultanos para hacer el tuyo a medida.</p>
      </section>

      <div className="personalizador-layout">

        {/* ── Preview ── */}
        <div className="personalizador-preview">
          <div className="mate-canvas-wrap">
            <div className="virola-top-wrap">
              <VirolaTopView
                aro={aro}
                diseño={diseño}
                textoVirola={textoVirola}
                offset={offset}
                onOffsetChange={delta => setOffset(prev => prev + delta)}
                scale={designScale}
                textFont={textFont}
                textoCompleto={textoCompleto}
                distribucion={distribucion}
                customImageSrc={customImageSrc}
                imageRepeat={imageRepeat}
                engThreshold={engThreshold}
                size={370}
              />
              {hasGrabado && (
                <p className="canvas-hint" style={{ bottom:14 }}>
                  ✋ Arrastrá para rotar el grabado
                </p>
              )}
            </div>
          </div>

          {/* Controles de posición y tamaño */}
          {hasGrabado && (
            <div className="posicion-controls">
              <span className="posicion-label">Posición del grabado</span>
              <div className="posicion-btns">
                <button className="pos-btn"
                  onClick={() => setOffset(p => p - Math.PI/8)}>◁ Izquierda</button>
                <button className="pos-btn reset-btn"
                  onClick={() => setOffset(0)}>⟳ Centrar</button>
                <button className="pos-btn"
                  onClick={() => setOffset(p => p + Math.PI/8)}>Derecha ▷</button>
              </div>

              <span className="posicion-label" style={{ marginTop: '0.5rem' }}>
                Tamaño — {Math.round(designScale * 100)}%
              </span>
              <div className="tamanio-slider-wrap">
                <span className="tamanio-icon">A</span>
                <input
                  type="range"
                  className="tamanio-slider"
                  min={40} max={160} step={5}
                  value={Math.round(designScale * 100)}
                  onChange={e => setDesignScale(Number(e.target.value) / 100)}
                />
                <span className="tamanio-icon" style={{ fontSize: '1.25rem' }}>A</span>
                <button className="pos-btn reset-btn" style={{ marginLeft: '0.25rem', padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => setDesignScale(1)}>Reset</button>
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="design-summary">
            <div className="design-summary-row">
              <span>Forma</span><strong>{TIPOS.find(t=>t.id===tipo)?.label}</strong>
            </div>
            <div className="design-summary-row">
              <span>Material</span><strong>{cuerpo.label}</strong>
            </div>
            <div className="design-summary-row">
              <span>Aro</span><strong>{aro.label}</strong>
            </div>
            <div className="design-summary-row">
              <span>Grabado</span><strong>{DISEÑOS_VIROLA.find(d=>d.id===diseño)?.label}</strong>
            </div>
            {textoVirola && (
              <div className="design-summary-row">
                <span>Texto</span>
                <strong style={{fontSize:'0.8rem',maxWidth:'60%',textAlign:'right'}}>"{textoVirola}"</strong>
              </div>
            )}
            {customImageSrc && (
              <div className="design-summary-row">
                <span>Imagen propia</span>
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                  <img src={customImageSrc} alt="" style={{width:28,height:28,objectFit:'contain',borderRadius:4,border:'1px solid var(--crema-oscuro)'}} />
                  <strong style={{fontSize:'0.8rem'}}>{imageRepeat > 1 ? `× ${imageRepeat}` : 'Una vez'}</strong>
                </div>
              </div>
            )}
          </div>

          <a href={`https://wa.me/5492236359767?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary full-width"
            style={{ display:'block', textAlign:'center', marginTop:'1rem' }}>
            💬 Consultar este diseño por WhatsApp
          </a>
        </div>

        {/* ── Controles ── */}
        <div className="personalizador-controls">

          <div className="ctrl-group">
            <h3>Forma del mate</h3>
            <div className="ctrl-grid">
              {TIPOS.map(t => (
                <button key={t.id} className={`ctrl-chip ${tipo===t.id?'active':''}`}
                  onClick={() => setTipo(t.id)}>{t.label}</button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h3>Material del cuerpo</h3>
            <div className="ctrl-colors">
              {CUERPOS.map(c => (
                <button key={c.id}
                  className={`ctrl-color-btn ${cuerpo.id===c.id?'active':''}`}
                  style={{ background:c.hex }} title={c.label}
                  onClick={() => setCuerpo(c)}>
                  {cuerpo.id===c.id && <span className="color-check">✓</span>}
                </button>
              ))}
            </div>
            <p className="ctrl-selected">Seleccionado: <strong>{cuerpo.label}</strong></p>
          </div>

          <div className="ctrl-group">
            <h3>Aro y bombilla</h3>
            <div className="ctrl-grid">
              {AROS.map(a => (
                <button key={a.id} className={`ctrl-chip ${aro.id===a.id?'active':''}`}
                  onClick={() => setAro(a)}>
                  <span style={{ width:12,height:12,borderRadius:'50%',background:a.hex,
                    display:'inline-block',border:'1px solid rgba(0,0,0,0.25)',
                    boxShadow:'0 0 3px rgba(255,255,255,0.5)' }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h3>Diseño en virola</h3>
            <p className="ctrl-hint">Elegí un grabado para el aro metálico</p>

            {/* Opción "Sin diseño" separada */}
            <button
              className={`ctrl-chip ${diseño==='ninguno'?'active':''}`}
              style={{ marginBottom: '0.5rem' }}
              onClick={() => setDiseño('ninguno')}
            >Sin diseño</button>

            {/* Categorías */}
            {['Naturaleza','Símbolos','Abstracto','Temáticos'].map(cat => (
              <div key={cat}>
                <p className="ctrl-diseño-cat">{cat}</p>
                <div className="ctrl-diseño-grid">
                  {DISEÑOS_VIROLA.filter(d => d.cat === cat).map(d => (
                    <button key={d.id}
                      className={`ctrl-diseño-btn ${diseño===d.id?'active':''}`}
                      onClick={() => { setDiseño(d.id) }}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="ctrl-group">
            <h3>Texto en la virola</h3>
            <p className="ctrl-hint">Tu mensaje grabado en el aro — hasta 45 caracteres</p>
            <div className="ctrl-text-wrap">
              <input type="text" className="ctrl-text-input"
                placeholder='Ej: "Ruta, mates y viajar a cualquier lado con vos"'
                maxLength={45}
                value={textoVirola}
                onChange={e => { setTextoVirola(e.target.value) }}
              />
              <span className="ctrl-char-count">{textoVirola.length}/45</span>
            </div>
            {textoVirola && (
              <button className="ctrl-chip" style={{ marginTop:'0.5rem' }}
                onClick={() => setTextoVirola('')}>✕ Borrar texto</button>
            )}
          </div>

          {/* ── Tu diseño propio ── */}
          <div className="ctrl-group">
            <h3>Tu propio diseño</h3>
            <p className="ctrl-hint">Subí una imagen (PNG, JPG, SVG) y aparece grabada en el aro</p>

            <label className="upload-zone" onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file && file.type.startsWith('image/')) {
                  const fake = { target: { files: [file] } }
                  handleImageUpload(fake)
                  setVista('top')
                }
              }}
            >
              <input type="file" accept="image/*" hidden onChange={e => { handleImageUpload(e) }} />
              {customImageSrc ? (
                <img src={customImageSrc} className="upload-preview" alt="diseño" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">🖼</span>
                  <span className="upload-text">Hacé clic o arrastrá tu imagen aquí</span>
                  <span className="upload-hint">PNG, JPG, SVG · Fondo transparente recomendado</span>
                </div>
              )}
            </label>

            {customImageSrc && (
              <>
                {/* Sensibilidad del grabado */}
                <div style={{ marginTop: '0.75rem' }}>
                  <p className="ctrl-hint" style={{ marginBottom: '0.4rem' }}>
                    Sensibilidad del grabado —&nbsp;
                    <strong>{engThreshold < 100 ? 'Suave' : engThreshold < 160 ? 'Normal' : 'Intenso'}</strong>
                  </p>
                  <div className="tamanio-slider-wrap">
                    <span className="tamanio-icon" style={{ fontSize: '0.7rem' }}>Suave</span>
                    <input type="range" className="tamanio-slider"
                      min={60} max={220} step={8}
                      value={engThreshold}
                      onChange={e => { setEngThreshold(Number(e.target.value)) }}
                    />
                    <span className="tamanio-icon" style={{ fontSize: '0.7rem' }}>Intenso</span>
                  </div>
                  <p className="ctrl-hint" style={{ marginTop: '0.3rem' }}>
                    ← Más suave muestra solo trazos finos · Más intenso incluye más detalle
                  </p>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <p className="ctrl-hint" style={{ marginBottom: '0.4rem' }}>Repeticiones en el aro</p>
                  <div className="ctrl-grid">
                    {[
                      { n: 1, label: 'Una vez' },
                      { n: 2, label: '× 2' },
                      { n: 4, label: '× 4' },
                      { n: 6, label: '× 6' },
                    ].map(({ n, label }) => (
                      <button key={n}
                        className={`ctrl-chip ${imageRepeat === n ? 'active' : ''}`}
                        onClick={() => { setImageRepeat(n) }}
                      >{label}</button>
                    ))}
                  </div>
                </div>
                <button className="ctrl-chip" style={{ marginTop: '0.6rem', borderColor: '#c0392b', color: '#c0392b' }}
                  onClick={clearImage}>✕ Eliminar imagen</button>
              </>
            )}
          </div>

          {/* Fuente del texto */}
          {textoVirola && (
            <div className="ctrl-group">
              <h3>Fuente del texto</h3>
              {['Serif','Sans','Script','Display'].map(cat => (
                <div key={cat}>
                  <p className="ctrl-font-cat">{cat}</p>
                  <div className="ctrl-font-grid">
                    {FUENTES.filter(f => f.cat === cat).map(f => (
                      <button key={f.id}
                        className={`ctrl-font-btn ${textFont === f.font ? 'active' : ''}`}
                        onClick={() => { setTextFont(f.font) }}
                      >
                        <span className="font-preview" style={{ fontFamily: f.font }}>{f.preview}</span>
                        <span className="font-label" style={{ fontFamily: f.font }}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className={`ctrl-chip ${textoCompleto ? 'active' : ''}`}
                style={{ marginTop: '0.75rem' }}
                onClick={() => { setTextoCompleto(v => !v) }}
              >
                {textoCompleto ? '◎ Vuelta completa' : '◑ Vuelta completa'}
              </button>
            </div>
          )}

          {/* Distribución — segundo grabado */}
          {diseño !== 'ninguno' && textoVirola && (
            <div className="ctrl-group">
              <h3>Distribución</h3>
              <p className="ctrl-hint">Ubicá diseño y texto en zonas distintas del aro</p>
              <div className="ctrl-grid">
                {[
                  { id: 'auto',         label: 'Automático' },
                  { id: 'diseño-arriba',label: '↑ Diseño / ↓ Texto' },
                  { id: 'texto-arriba', label: '↑ Texto / ↓ Diseño' },
                ].map(op => (
                  <button key={op.id}
                    className={`ctrl-chip ${distribucion === op.id ? 'active' : ''}`}
                    onClick={() => { setDistribucion(op.id) }}
                  >{op.label}</button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
