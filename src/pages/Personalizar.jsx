import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

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
  { id: 'ninguno',    label: 'Sin diseño'   },
  { id: 'ruteamos',   label: '🛣 Ruteamos'  },
  { id: 'flores',     label: '🌸 Flores'    },
  { id: 'geometrico', label: '◈ Étnico'     },
  { id: 'estrellas',  label: '✦ Estrellas'  },
]
const FUENTES = [
  { id: 'serif',  label: 'Clásica',  font: 'Georgia, serif',              preview: 'Ag' },
  { id: 'sans',   label: 'Moderna',  font: '"Helvetica Neue", sans-serif', preview: 'Ag' },
  { id: 'script', label: 'Cursiva',  font: '"Brush Script MT", "Comic Sans MS", cursive', preview: 'Ag' },
]

/* ─────────── UTILIDADES ─────────── */
function adjustHex(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/* ─────────── PERFIL LATHE ─────────── */
function getMateProfile(tipo) {
  if (tipo === 'calabaza') return [
    [0.00,-0.95],[0.18,-0.93],[0.50,-0.82],[0.76,-0.60],
    [0.90,-0.28],[0.94, 0.08],[0.90, 0.42],[0.78, 0.68],
    [0.60, 0.84],[0.44, 0.93],[0.36, 1.00],[0.34, 1.04],
    [0.34, 1.10],[0.18, 1.14],[0.00, 1.16],
  ]
  if (tipo === 'porongo') return [
    [0.00,-0.98],[0.22,-0.96],[0.52,-0.82],[0.72,-0.52],
    [0.82,-0.12],[0.84, 0.22],[0.82, 0.50],[0.76, 0.72],
    [0.64, 0.86],[0.50, 0.94],[0.40, 1.00],[0.38, 1.06],
    [0.38, 1.12],[0.20, 1.16],[0.00, 1.18],
  ]
  if (tipo === 'ceramica') return [
    [0.00,-0.96],[0.28,-0.94],[0.58,-0.80],[0.78,-0.50],
    [0.88,-0.10],[0.88, 0.28],[0.85, 0.58],[0.78, 0.80],
    [0.64, 0.92],[0.46, 1.00],[0.38, 1.06],[0.38, 1.12],
    [0.20, 1.16],[0.00, 1.18],
  ]
  return [
    [0.00,-0.95],[0.30,-0.92],[0.60,-0.82],[0.76,-0.62],
    [0.80,-0.30],[0.80, 0.32],[0.80, 0.62],[0.76, 0.82],
    [0.62, 0.94],[0.46, 1.02],[0.40, 1.07],[0.40, 1.12],
    [0.22, 1.16],[0.00, 1.18],
  ]
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
  const ang = (i, n) => zStart + (i / n) * zSpan + offset

  if (diseño === 'estrellas') {
    const n = zona === 'full' ? 12 : 6
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      const rx = cx + ringMid * Math.cos(a), ry = cy + ringMid * Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a)
      drawStar(ctx, 0, 0, ringW*0.22*s, ringW*0.10*s, 6); ctx.fill()
      ctx.restore()
    }
  }
  if (diseño === 'flores') {
    const n = zona === 'full' ? 8 : 4
    for (let i = 0; i < n; i++) {
      const a = ang(i, n)
      drawFlor(ctx, cx + ringMid*Math.cos(a), cy + ringMid*Math.sin(a), ringW*0.28*s, darkColor)
    }
  }
  if (diseño === 'geometrico') {
    const n = zona === 'full' ? 20 : 10
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
    // Bordes sólo en full
    if (zona === 'full') {
      ctx.beginPath(); ctx.arc(cx, cy, innerR+ringW*0.15, 0, Math.PI*2)
      ctx.lineWidth = 1.2; ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, outerR-ringW*0.15, 0, Math.PI*2); ctx.stroke()
    }
  }
  if (diseño === 'ruteamos') {
    // Iconos en la mitad elegida o distribuidos en todo el aro
    const iconosFull = [
      { t: 0.55, fn: drawMontania }, { t: 0.72, fn: drawCarpa    },
      { t: 0.88, fn: drawColectivo}, { t: 1.05, fn: drawBrujula  },
      { t: 1.22, fn: drawMontania }, { t: 1.38, fn: drawCarpa    },
    ]
    const iconosHalf = [
      { t: 0.2,  fn: drawMontania }, { t: 0.5,  fn: drawColectivo},
      { t: 0.8,  fn: drawCarpa    },
    ]
    const iconos = zona === 'full' ? iconosFull : iconosHalf
    iconos.forEach(({ t, fn }) => {
      const a = zStart + t * zSpan + offset
      const rx = cx + ringMid*Math.cos(a), ry = cy + ringMid*Math.sin(a)
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a + Math.PI/2)
      fn(ctx, 0, 0, ringW*0.35*s, darkColor)
      ctx.restore()
    })
    const estrellaTs = zona === 'full'
      ? [0.62, 0.78, 0.95, 1.12, 1.28, 1.44]
      : [0.35, 0.65]
    estrellaTs.forEach(t => {
      const a = zStart + t * zSpan + offset + 0.09
      const rx = cx + (ringMid+ringW*0.1)*Math.cos(a)
      const ry = cy + (ringMid+ringW*0.1)*Math.sin(a)
      ctx.save(); ctx.translate(rx, ry)
      drawStar(ctx, 0, 0, ringW*0.08*s, ringW*0.04*s, 4); ctx.fill()
      ctx.restore()
    })
  }
}

/* ─────────── COMPONENTE VISTA SUPERIOR INTERACTIVO ─────────── */
function VirolaTopView({ aro, diseño, textoVirola, offset, onOffsetChange,
                         scale = 1, textFont = 'Georgia, serif',
                         textoCompleto = false, distribucion = 'auto',
                         customImage = null, imageRepeat = 1, size = 400 }) {
  const canvasRef  = useRef()
  const isDragging = useRef(false)
  const lastAngle  = useRef(0)
  const [dragging, setDragging] = useState(false)

  /* Dibuja cada vez que cambia alguna prop */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = size, cx = W/2, cy = W/2
    const outerR = W * 0.46
    const innerR = W * 0.29
    const ringMid = (outerR + innerR) / 2

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

    /* ── Imagen propia sobre el aro ── */
    if (customImage) {
      const imgSz   = ringW * 1.5 * scale          // tamaño = ancho del aro × escala
      const ringMidR = (outerR + innerR) / 2

      ctx.save()
      // Recortar al anillo (donut clip)
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
        ctx.globalAlpha = 0.9
        ctx.drawImage(customImage, -imgSz / 2, -imgSz / 2, imgSz, imgSz)
        ctx.restore()
      }
      ctx.restore()
    }

    /* Indicador de posición — pequeño triángulo en el "frente" del diseño */
    if (diseño !== 'ninguno' || textoVirola.trim() || customImage) {
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

  }, [aro, diseño, textoVirola, offset, scale, textFont, textoCompleto, distribucion, customImage, imageRepeat, size])

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

/* ─────────── MODELO 3D ─────────── */
function MateModel({ tipo, cuerpo, aro, diseño, autoRotate }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.35
  })
  const profile   = getMateProfile(tipo)
  const allPoints = profile.map(([x, y]) => new THREE.Vector2(x, y))
  const neckY  = profile[profile.length - 5][1]
  const neckR  = profile[profile.length - 5][0]
  const bodyColor = new THREE.Color(cuerpo.hex)
  const aroColor  = new THREE.Color(aro.hex)
  const darkAro   = new THREE.Color(adjustHex(aro.hex, -40))

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[allPoints, 80]} />
        <meshStandardMaterial color={bodyColor} roughness={cuerpo.rough} metalness={cuerpo.metal} />
      </mesh>
      <mesh position={[0, neckY+0.04, 0]} castShadow>
        <cylinderGeometry args={[neckR+0.010, neckR+0.007, 0.24, 64]} />
        <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} envMapIntensity={2.2} />
      </mesh>
      <mesh position={[0, neckY+0.15, 0]}>
        <torusGeometry args={[neckR+0.007, 0.024, 20, 64]} />
        <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} envMapIntensity={2.5} />
      </mesh>
      <mesh position={[0, neckY-0.09, 0]}>
        <torusGeometry args={[neckR+0.007, 0.016, 16, 64]} />
        <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} envMapIntensity={2.5} />
      </mesh>
      {diseño === 'estrellas' && Array.from({length:10}).map((_,i) => {
        const a = (i/10)*Math.PI*2
        return <mesh key={i} position={[Math.cos(a)*(neckR+0.02), neckY+0.04, Math.sin(a)*(neckR+0.02)]}>
          <sphereGeometry args={[0.018,6,6]} />
          <meshStandardMaterial color={darkAro} roughness={0.3} metalness={aro.metal*0.7} />
        </mesh>
      })}
      {diseño === 'flores' && Array.from({length:8}).map((_,i) => {
        const a = (i/8)*Math.PI*2
        return <mesh key={i} position={[Math.cos(a)*(neckR+0.018), neckY+0.04, Math.sin(a)*(neckR+0.018)]}>
          <sphereGeometry args={[0.022,8,8]} />
          <meshStandardMaterial color={darkAro} roughness={0.35} metalness={aro.metal*0.6} />
        </mesh>
      })}
      {diseño === 'geometrico' && [0.05,-0.06].map((yOff,j) => (
        <mesh key={j} position={[0, neckY+yOff, 0]}>
          <torusGeometry args={[neckR+0.01, 0.010, 4, 6]} />
          <meshStandardMaterial color={darkAro} roughness={0.3} metalness={aro.metal*0.8} />
        </mesh>
      ))}
      {diseño === 'ruteamos' && Array.from({length:12}).map((_,i) => {
        const a = (i/12)*Math.PI*2
        return <mesh key={i} position={[Math.cos(a)*(neckR+0.018), neckY+(i%2===0?0.05:-0.04), Math.sin(a)*(neckR+0.018)]}>
          <boxGeometry args={[0.03,0.03,0.01]} />
          <meshStandardMaterial color={darkAro} roughness={0.25} metalness={aro.metal*0.75} />
        </mesh>
      })}
      <mesh position={[0, neckY+0.02, 0]}>
        <cylinderGeometry args={[neckR-0.025, neckR-0.025, 0.04, 40]} />
        <meshStandardMaterial color="#1a0f06" roughness={0.95} metalness={0} />
      </mesh>
      <group position={[neckR*0.35, neckY+0.02, 0]} rotation={[0,0,-0.28]}>
        <mesh>
          <cylinderGeometry args={[0.022,0.022,1.55,12]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
        <mesh position={[0.04, 0.79, 0]} rotation={[0,0,0.45]}>
          <cylinderGeometry args={[0.018,0.018,0.28,10]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
        <mesh position={[0,-0.68,0]}>
          <sphereGeometry args={[0.046,16,16]} />
          <meshStandardMaterial color={new THREE.Color(adjustHex(aro.hex,-20))} roughness={0.35} metalness={aro.metal} />
        </mesh>
      </group>
    </group>
  )
}

function Scene({ tipo, cuerpo, aro, diseño, autoRotate }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5,8,5]}   intensity={1.4} castShadow shadow-mapSize={[2048,2048]} />
      <directionalLight position={[-4,3,-3]} intensity={0.5} color="#ffeedd" />
      <directionalLight position={[0,-3,3]}  intensity={0.2} color="#c8d8e8" />
      <pointLight position={[2,4,3]} intensity={0.6} color="#fff8f0" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <MateModel tipo={tipo} cuerpo={cuerpo} aro={aro} diseño={diseño} autoRotate={autoRotate} />
        <ContactShadows position={[0,-1.15,0]} opacity={0.55} scale={3.5} blur={2.5} far={1.5} />
      </Suspense>
    </>
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
  const [customImageObj,setCustomImageObj]= useState(null)
  const [imageRepeat,   setImageRepeat]   = useState(1)
  const [autoRotate,    setAutoRotate]    = useState(true)
  const [vista,         setVista]         = useState('3d')

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const src = ev.target.result
      setCustomImageSrc(src)
      const img = new Image()
      img.onload = () => setCustomImageObj(img)
      img.src = src
    }
    reader.readAsDataURL(file)
  }
  const clearImage = () => { setCustomImageSrc(null); setCustomImageObj(null) }

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
        <h1 className="inner-hero-title">Personalizador 3D</h1>
        <p className="inner-hero-sub">Elegí cada detalle y consultanos para hacer el tuyo a medida.</p>
      </section>

      <div className="personalizador-layout">

        {/* ── Preview ── */}
        <div className="personalizador-preview">
          <div className="vista-toggle">
            <button className={`vista-btn ${vista==='3d'  ? 'active':''}`} onClick={() => setVista('3d')}>Vista 3D</button>
            <button className={`vista-btn ${vista==='top' ? 'active':''}`} onClick={() => setVista('top')}>Vista superior</button>
          </div>

          <div className="mate-canvas-wrap">
            {vista === '3d' ? (
              <>
                <Canvas
                  camera={{ position:[0,0.6,3.2], fov:38 }}
                  shadows
                  gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.1 }}
                >
                  <Scene tipo={tipo} cuerpo={cuerpo} aro={aro} diseño={diseño} autoRotate={autoRotate} />
                  <OrbitControls enableZoom={false} minPolarAngle={Math.PI/5} maxPolarAngle={Math.PI/1.7}
                    onStart={() => setAutoRotate(false)} />
                </Canvas>
                <p className="canvas-hint">🖱 Arrastrá para girar</p>
              </>
            ) : (
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
                  customImage={customImageObj}
                  imageRepeat={imageRepeat}
                  size={370}
                />
                {hasGrabado && (
                  <p className="canvas-hint" style={{ bottom:14 }}>
                    ✋ Arrastrá para rotar el grabado
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Controles de posición y tamaño — solo en vista top con grabado */}
          {vista === 'top' && hasGrabado && (
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
            <div className="ctrl-grid">
              {DISEÑOS_VIROLA.map(d => (
                <button key={d.id}
                  className={`ctrl-chip ${diseño===d.id?'active':''}`}
                  onClick={() => { setDiseño(d.id); setVista('top') }}>{d.label}</button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h3>Texto en la virola</h3>
            <p className="ctrl-hint">Tu mensaje grabado en el aro — hasta 45 caracteres</p>
            <div className="ctrl-text-wrap">
              <input type="text" className="ctrl-text-input"
                placeholder='Ej: "Ruta, mates y viajar a cualquier lado con vos"'
                maxLength={45}
                value={textoVirola}
                onChange={e => { setTextoVirola(e.target.value); setVista('top') }}
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
              <input type="file" accept="image/*" hidden onChange={e => { handleImageUpload(e); setVista('top') }} />
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
                        onClick={() => { setImageRepeat(n); setVista('top') }}
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
              <div className="ctrl-font-grid">
                {FUENTES.map(f => (
                  <button key={f.id}
                    className={`ctrl-font-btn ${textFont === f.font ? 'active' : ''}`}
                    onClick={() => { setTextFont(f.font); setVista('top') }}
                  >
                    <span className="font-preview" style={{ fontFamily: f.font }}>{f.preview}</span>
                    <span className="font-label">{f.label}</span>
                  </button>
                ))}
              </div>
              <button
                className={`ctrl-chip ${textoCompleto ? 'active' : ''}`}
                style={{ marginTop: '0.6rem' }}
                onClick={() => { setTextoCompleto(v => !v); setVista('top') }}
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
                    onClick={() => { setDistribucion(op.id); setVista('top') }}
                  >{op.label}</button>
                ))}
              </div>
            </div>
          )}

          {vista === '3d' && (
            <div className="ctrl-group">
              <button className={`ctrl-chip ${autoRotate?'active':''}`}
                onClick={() => setAutoRotate(v => !v)}>
                {autoRotate ? '⏸ Pausar rotación' : '▶ Rotar automático'}
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
