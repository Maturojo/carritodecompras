import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────── CONFIGURACIÓN ─────────── */
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

/* ─────────── UTILIDADES ─────────── */
function adjustHex(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/* ─────────── PERFIL DEL MATE ─────────── */
function getMateProfile(tipo) {
  if (tipo === 'calabaza') return [
    [0.00, -0.95], [0.18, -0.93], [0.50, -0.82], [0.76, -0.60],
    [0.90, -0.28], [0.94, 0.08],  [0.90, 0.42],  [0.78, 0.68],
    [0.60, 0.84],  [0.44, 0.93],  [0.36, 1.00],  [0.34, 1.04],
    [0.34, 1.10],  [0.18, 1.14],  [0.00, 1.16],
  ]
  if (tipo === 'porongo') return [
    [0.00, -0.98], [0.22, -0.96], [0.52, -0.82], [0.72, -0.52],
    [0.82, -0.12], [0.84, 0.22],  [0.82, 0.50],  [0.76, 0.72],
    [0.64, 0.86],  [0.50, 0.94],  [0.40, 1.00],  [0.38, 1.06],
    [0.38, 1.12],  [0.20, 1.16],  [0.00, 1.18],
  ]
  if (tipo === 'ceramica') return [
    [0.00, -0.96], [0.28, -0.94], [0.58, -0.80], [0.78, -0.50],
    [0.88, -0.10], [0.88, 0.28],  [0.85, 0.58],  [0.78, 0.80],
    [0.64, 0.92],  [0.46, 1.00],  [0.38, 1.06],  [0.38, 1.12],
    [0.20, 1.16],  [0.00, 1.18],
  ]
  return [
    [0.00, -0.95], [0.30, -0.92], [0.60, -0.82], [0.76, -0.62],
    [0.80, -0.30], [0.80, 0.32],  [0.80, 0.62],  [0.76, 0.82],
    [0.62, 0.94],  [0.46, 1.02],  [0.40, 1.07],  [0.40, 1.12],
    [0.22, 1.16],  [0.00, 1.18],
  ]
}

/* ═══════════════════════════════════════════════════════
   VISTA SUPERIOR — Canvas 2D de la virola
═══════════════════════════════════════════════════════ */
function drawCircularText(ctx, text, cx, cy, radius, startAngle, endAngle) {
  if (!text.trim()) return
  const chars = text.split('')
  const totalArc = endAngle - startAngle
  // Medir ancho total aproximado del texto
  const charWidths = chars.map(c => ctx.measureText(c).width)
  const totalW = charWidths.reduce((a, b) => a + b, 0) + (chars.length - 1) * 1.5
  const arcNeeded = totalW / radius
  const start = startAngle + (totalArc - arcNeeded) / 2

  let currentAngle = start
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

function drawDesignOnRing(ctx, cx, cy, innerR, outerR, diseño, aroHex) {
  const ringMid = (innerR + outerR) / 2
  const ringW = outerR - innerR
  const darkColor = adjustHex(aroHex, -60)
  ctx.fillStyle = darkColor
  ctx.strokeStyle = darkColor
  ctx.lineWidth = 1.5

  if (diseño === 'estrellas') {
    // Estrellas de 6 puntas distribuidas por el aro
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const rx = cx + ringMid * Math.cos(angle)
      const ry = cy + ringMid * Math.sin(angle)
      ctx.save()
      ctx.translate(rx, ry)
      ctx.rotate(angle)
      drawStar(ctx, 0, 0, ringW * 0.22, ringW * 0.10, 6)
      ctx.fill()
      ctx.restore()
    }
  }

  if (diseño === 'flores') {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const rx = cx + ringMid * Math.cos(angle)
      const ry = cy + ringMid * Math.sin(angle)
      drawFlor(ctx, rx, ry, ringW * 0.28, darkColor)
    }
  }

  if (diseño === 'geometrico') {
    // Franja de rombos
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const rx = cx + ringMid * Math.cos(angle)
      const ry = cy + ringMid * Math.sin(angle)
      ctx.save()
      ctx.translate(rx, ry)
      ctx.rotate(angle + Math.PI / 4)
      const s = ringW * 0.22
      ctx.beginPath()
      ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, 0)
      ctx.lineTo(0, s);  ctx.lineTo(-s * 0.6, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    // Dos círculos borde
    ctx.beginPath()
    ctx.arc(cx, cy, innerR + ringW * 0.15, 0, Math.PI * 2)
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, outerR - ringW * 0.15, 0, Math.PI * 2)
    ctx.stroke()
  }

  if (diseño === 'ruteamos') {
    // Iconos de viaje en la mitad inferior del aro
    const positions = [
      { angle: Math.PI * 0.55, fn: drawMontania },
      { angle: Math.PI * 0.72, fn: drawCarpa },
      { angle: Math.PI * 0.88, fn: drawColectivo },
      { angle: Math.PI * 1.05, fn: drawBrujula },
      { angle: Math.PI * 1.22, fn: drawMontania },
      { angle: Math.PI * 1.38, fn: drawCarpa },
    ]
    positions.forEach(({ angle, fn }) => {
      const rx = cx + ringMid * Math.cos(angle)
      const ry = cy + ringMid * Math.sin(angle)
      ctx.save()
      ctx.translate(rx, ry)
      ctx.rotate(angle + Math.PI / 2)
      fn(ctx, 0, 0, ringW * 0.35, darkColor)
      ctx.restore()
    })
    // Estrellas pequeñas en los huecos
    ;[0.62, 0.78, 0.95, 1.12, 1.28, 1.44].forEach(a => {
      const angle = Math.PI * a + 0.09
      const rx = cx + (ringMid + ringW * 0.1) * Math.cos(angle)
      const ry = cy + (ringMid + ringW * 0.1) * Math.sin(angle)
      ctx.save()
      ctx.translate(rx, ry)
      drawStar(ctx, 0, 0, ringW * 0.08, ringW * 0.04, 4)
      ctx.fill()
      ctx.restore()
    })
  }
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
  // Centro
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2); ctx.fill()
  // Pétalos
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(
      cx + Math.cos(angle) * r * 0.38,
      cy + Math.sin(angle) * r * 0.38,
      r * 0.22, 0, Math.PI * 2
    )
    ctx.fill()
  }
}

function drawMontania(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.7)
  ctx.lineTo(x - size * 0.6, y + size * 0.4)
  ctx.lineTo(x + size * 0.6, y + size * 0.4)
  ctx.closePath(); ctx.fill()
  // Nieve
  ctx.fillStyle = adjustHex(color, 80)
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.7)
  ctx.lineTo(x - size * 0.18, y - size * 0.35)
  ctx.lineTo(x + size * 0.18, y - size * 0.35)
  ctx.closePath(); ctx.fill()
}

function drawCarpa(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.55)
  ctx.lineTo(x - size * 0.55, y + size * 0.4)
  ctx.lineTo(x + size * 0.55, y + size * 0.4)
  ctx.closePath(); ctx.fill()
  // Entrada
  ctx.fillStyle = adjustHex(color, 60)
  ctx.beginPath()
  ctx.moveTo(x - size * 0.12, y + size * 0.4)
  ctx.arc(x, y + size * 0.25, size * 0.2, Math.PI, 0)
  ctx.lineTo(x + size * 0.12, y + size * 0.4)
  ctx.closePath(); ctx.fill()
}

function drawColectivo(ctx, x, y, size, color) {
  ctx.fillStyle = color
  const w = size * 1.0, h = size * 0.55
  // Cuerpo
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - h / 2, w, h, size * 0.12)
  ctx.fill()
  // Ventanas
  ctx.fillStyle = adjustHex(color, 70)
  ;[-0.28, 0.02, 0.28].forEach(dx => {
    ctx.beginPath()
    ctx.roundRect(x + dx * w - size * 0.12, y - h * 0.3, size * 0.22, size * 0.22, 2)
    ctx.fill()
  })
  // Ruedas
  ctx.fillStyle = adjustHex(color, -20)
  ;[-0.28, 0.28].forEach(dx => {
    ctx.beginPath()
    ctx.arc(x + dx * w, y + h * 0.45, size * 0.14, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawBrujula(ctx, x, y, size, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.arc(x, y, size * 0.42, 0, Math.PI * 2); ctx.stroke()
  // Agujas N/S
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.32); ctx.lineTo(x - size * 0.1, y); ctx.lineTo(x, y + size * 0.32)
  ctx.lineTo(x + size * 0.1, y); ctx.closePath(); ctx.fill()
}

/* ─────────── COMPONENTE VISTA SUPERIOR ─────────── */
function VirolaTopView({ aro, diseño, textoVirola, size = 400 }) {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = size, cx = W / 2, cy = W / 2
    const outerR = W * 0.46
    const innerR = W * 0.29
    const ringMid = (outerR + innerR) / 2

    ctx.clearRect(0, 0, W, W)

    // Sombra exterior
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = W * 0.05
    ctx.shadowOffsetY = W * 0.015
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.fillStyle = '#bbb'; ctx.fill()
    ctx.restore()

    // Base del aro (color del metal)
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.fillStyle = aro.hex; ctx.fill()

    // Degradado metálico
    const grad = ctx.createLinearGradient(cx - outerR, cy - outerR, cx + outerR * 0.5, cy + outerR * 0.5)
    grad.addColorStop(0,   'rgba(255,255,255,0.50)')
    grad.addColorStop(0.25,'rgba(255,255,255,0.20)')
    grad.addColorStop(0.55,'rgba(0,0,0,0.04)')
    grad.addColorStop(1,   'rgba(0,0,0,0.28)')
    ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
    ctx.fillStyle = grad; ctx.fill()

    // Textura granulada leve (alpaca)
    ctx.save()
    ctx.globalAlpha = 0.04
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = innerR + Math.random() * (outerR - innerR)
      const px = cx + r * Math.cos(angle)
      const py = cy + r * Math.sin(angle)
      ctx.beginPath(); ctx.arc(px, py, 0.8, 0, Math.PI * 2)
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'; ctx.fill()
    }
    ctx.restore()

    // Borde interior del aro (surco metálico)
    ctx.beginPath(); ctx.arc(cx, cy, innerR + 4, 0, Math.PI * 2)
    ctx.strokeStyle = adjustHex(aro.hex, -50); ctx.lineWidth = 3.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, innerR + 1, 0, Math.PI * 2)
    ctx.strokeStyle = adjustHex(aro.hex, 30); ctx.lineWidth = 1.5; ctx.stroke()

    // Borde exterior
    ctx.beginPath(); ctx.arc(cx, cy, outerR - 3, 0, Math.PI * 2)
    ctx.strokeStyle = adjustHex(aro.hex, -35); ctx.lineWidth = 2.5; ctx.stroke()

    // Diseños en el aro
    drawDesignOnRing(ctx, cx, cy, innerR, outerR, diseño, aro.hex)

    // Texto circular en la virola
    if (textoVirola.trim()) {
      const textR = ringMid + (outerR - innerR) * 0.12
      const fontSize = Math.max(W * 0.038, 13)
      ctx.font = `bold ${fontSize}px 'Georgia', serif`
      ctx.fillStyle = adjustHex(aro.hex, -75)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Si hay diseño en la parte de abajo, texto solo arriba (~240°)
      // Si no hay diseño, texto va por todo el aro
      const hasDesignBelow = ['ruteamos', 'flores', 'estrellas', 'geometrico'].includes(diseño)
      const textStartAngle = hasDesignBelow ? -Math.PI * 1.12 : -Math.PI
      const textEndAngle   = hasDesignBelow ?  Math.PI * 0.12  :  Math.PI

      drawCircularText(ctx, textoVirola, cx, cy, textR, textStartAngle, textEndAngle)
    }

    // Interior del mate (fondo oscuro con degradado)
    ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    const intGrad = ctx.createRadialGradient(cx - innerR * 0.2, cy - innerR * 0.2, 0, cx, cy, innerR)
    intGrad.addColorStop(0,   '#4a2a10')
    intGrad.addColorStop(0.4, '#2e1808')
    intGrad.addColorStop(1,   '#1a0c04')
    ctx.fillStyle = intGrad; ctx.fill()

    // Reflejo tenue del interior
    ctx.save()
    ctx.globalAlpha = 0.12
    ctx.beginPath(); ctx.ellipse(cx - innerR * 0.22, cy - innerR * 0.28, innerR * 0.45, innerR * 0.22, -Math.PI / 4, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.restore()

  }, [aro, diseño, textoVirola, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: '100%', height: '100%', display: 'block', borderRadius: '50%' }}
    />
  )
}

/* ─────────── MODELO 3D ─────────── */
function MateModel({ tipo, cuerpo, aro, diseño, autoRotate }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += delta * 0.35
  })

  const profile = getMateProfile(tipo)
  const allPoints = profile.map(([x, y]) => new THREE.Vector2(x, y))
  const maxR = Math.max(...profile.map(([x]) => x))
  const neckY = profile[profile.length - 5][1]
  const neckR = profile[profile.length - 5][0]

  const bodyColor = new THREE.Color(cuerpo.hex)
  const aroColor  = new THREE.Color(aro.hex)
  const darkAro   = new THREE.Color(adjustHex(aro.hex, -40))

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {/* Cuerpo */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[allPoints, 80]} />
        <meshStandardMaterial color={bodyColor} roughness={cuerpo.rough} metalness={cuerpo.metal} />
      </mesh>

      {/* Aro — banda */}
      <mesh position={[0, neckY + 0.04, 0]} castShadow>
        <cylinderGeometry args={[neckR + 0.010, neckR + 0.007, 0.24, 64]} />
        <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} envMapIntensity={2.2} />
      </mesh>
      {/* Aro — borde superior */}
      <mesh position={[0, neckY + 0.15, 0]}>
        <torusGeometry args={[neckR + 0.007, 0.024, 20, 64]} />
        <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} envMapIntensity={2.5} />
      </mesh>
      {/* Aro — borde inferior */}
      <mesh position={[0, neckY - 0.09, 0]}>
        <torusGeometry args={[neckR + 0.007, 0.016, 16, 64]} />
        <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} envMapIntensity={2.5} />
      </mesh>

      {/* Diseños en 3D */}
      {diseño === 'estrellas' && Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        const r = neckR + 0.02
        return (
          <mesh key={i} position={[Math.cos(a) * r, neckY + 0.04, Math.sin(a) * r]}>
            <sphereGeometry args={[0.018, 6, 6]} />
            <meshStandardMaterial color={darkAro} roughness={0.3} metalness={aro.metal * 0.7} />
          </mesh>
        )
      })}
      {diseño === 'flores' && Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const r = neckR + 0.018
        return (
          <mesh key={i} position={[Math.cos(a) * r, neckY + 0.04, Math.sin(a) * r]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color={darkAro} roughness={0.35} metalness={aro.metal * 0.6} />
          </mesh>
        )
      })}
      {diseño === 'geometrico' && [0.05, -0.06].map((yOff, j) => (
        <mesh key={j} position={[0, neckY + yOff, 0]}>
          <torusGeometry args={[neckR + 0.01, 0.010, 4, 6]} />
          <meshStandardMaterial color={darkAro} roughness={0.3} metalness={aro.metal * 0.8} />
        </mesh>
      ))}
      {diseño === 'ruteamos' && Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r = neckR + 0.018
        const yOff = i % 2 === 0 ? 0.05 : -0.04
        return (
          <mesh key={i} position={[Math.cos(a) * r, neckY + yOff, Math.sin(a) * r]}>
            <boxGeometry args={[0.03, 0.03, 0.01]} />
            <meshStandardMaterial color={darkAro} roughness={0.25} metalness={aro.metal * 0.75} />
          </mesh>
        )
      })}

      {/* Interior */}
      <mesh position={[0, neckY + 0.02, 0]}>
        <cylinderGeometry args={[neckR - 0.025, neckR - 0.025, 0.04, 40]} />
        <meshStandardMaterial color="#1a0f06" roughness={0.95} metalness={0} />
      </mesh>

      {/* Bombilla */}
      <group position={[neckR * 0.35, neckY + 0.02, 0]} rotation={[0, 0, -0.28]}>
        <mesh>
          <cylinderGeometry args={[0.022, 0.022, 1.55, 12]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
        <mesh position={[0.04, 0.79, 0]} rotation={[0, 0, 0.45]}>
          <cylinderGeometry args={[0.018, 0.018, 0.28, 10]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.046, 16, 16]} />
          <meshStandardMaterial color={new THREE.Color(adjustHex(aro.hex, -20))} roughness={0.35} metalness={aro.metal} />
        </mesh>
      </group>
    </group>
  )
}

function Scene({ tipo, cuerpo, aro, diseño, autoRotate }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]}  intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#ffeedd" />
      <directionalLight position={[0, -3, 3]}  intensity={0.2} color="#c8d8e8" />
      <pointLight position={[2, 4, 3]} intensity={0.6} color="#fff8f0" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <MateModel tipo={tipo} cuerpo={cuerpo} aro={aro} diseño={diseño} autoRotate={autoRotate} />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.55} scale={3.5} blur={2.5} far={1.5} />
      </Suspense>
    </>
  )
}

/* ─────────── PÁGINA ─────────── */
export default function Personalizar() {
  const [tipo,         setTipo]         = useState('calabaza')
  const [cuerpo,       setCuerpo]       = useState(CUERPOS[0])
  const [aro,          setAro]          = useState(AROS[0])
  const [diseño,       setDiseño]       = useState('ninguno')
  const [textoVirola,  setTextoVirola]  = useState('')
  const [autoRotate,   setAutoRotate]   = useState(true)
  const [vista,        setVista]        = useState('3d')  // '3d' | 'top'

  const waMsg = encodeURIComponent(
    `Hola! Me interesa un mate personalizado:\n` +
    `• Forma: ${TIPOS.find(t => t.id === tipo)?.label}\n` +
    `• Material: ${cuerpo.label}\n` +
    `• Aro: ${aro.label}\n` +
    `• Grabado virola: ${DISEÑOS_VIROLA.find(d => d.id === diseño)?.label}` +
    (textoVirola ? `\n• Texto: "${textoVirola}"` : '')
  )

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

          {/* Toggle vista */}
          <div className="vista-toggle">
            <button
              className={`vista-btn ${vista === '3d' ? 'active' : ''}`}
              onClick={() => setVista('3d')}
            >Vista 3D</button>
            <button
              className={`vista-btn ${vista === 'top' ? 'active' : ''}`}
              onClick={() => setVista('top')}
            >Vista superior</button>
          </div>

          <div className="mate-canvas-wrap">
            {vista === '3d' ? (
              <>
                <Canvas
                  camera={{ position: [0, 0.6, 3.2], fov: 38 }}
                  shadows
                  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
                >
                  <Scene tipo={tipo} cuerpo={cuerpo} aro={aro} diseño={diseño} autoRotate={autoRotate} />
                  <OrbitControls
                    enableZoom={false}
                    minPolarAngle={Math.PI / 5}
                    maxPolarAngle={Math.PI / 1.7}
                    onStart={() => setAutoRotate(false)}
                  />
                </Canvas>
                <p className="canvas-hint">🖱 Arrastrá para girar</p>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <VirolaTopView
                  aro={aro}
                  diseño={diseño}
                  textoVirola={textoVirola}
                  size={380}
                />
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="design-summary">
            <div className="design-summary-row">
              <span>Forma</span>
              <strong>{TIPOS.find(t => t.id === tipo)?.label}</strong>
            </div>
            <div className="design-summary-row">
              <span>Material</span>
              <strong>{cuerpo.label}</strong>
            </div>
            <div className="design-summary-row">
              <span>Aro</span>
              <strong>{aro.label}</strong>
            </div>
            <div className="design-summary-row">
              <span>Grabado</span>
              <strong>{DISEÑOS_VIROLA.find(d => d.id === diseño)?.label}</strong>
            </div>
            {textoVirola && (
              <div className="design-summary-row">
                <span>Texto</span>
                <strong style={{ fontSize: '0.82rem', maxWidth: '60%', textAlign: 'right' }}>"{textoVirola}"</strong>
              </div>
            )}
          </div>

          <a
            href={`https://wa.me/5492236359767?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary full-width"
            style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}
          >
            💬 Consultar este diseño por WhatsApp
          </a>
        </div>

        {/* ── Controles ── */}
        <div className="personalizador-controls">

          <div className="ctrl-group">
            <h3>Forma del mate</h3>
            <div className="ctrl-grid">
              {TIPOS.map(t => (
                <button key={t.id}
                  className={`ctrl-chip ${tipo === t.id ? 'active' : ''}`}
                  onClick={() => setTipo(t.id)}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h3>Material del cuerpo</h3>
            <div className="ctrl-colors">
              {CUERPOS.map(c => (
                <button key={c.id}
                  className={`ctrl-color-btn ${cuerpo.id === c.id ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  onClick={() => setCuerpo(c)}
                >
                  {cuerpo.id === c.id && <span className="color-check">✓</span>}
                </button>
              ))}
            </div>
            <p className="ctrl-selected">Seleccionado: <strong>{cuerpo.label}</strong></p>
          </div>

          <div className="ctrl-group">
            <h3>Aro y bombilla</h3>
            <div className="ctrl-grid">
              {AROS.map(a => (
                <button key={a.id}
                  className={`ctrl-chip ${aro.id === a.id ? 'active' : ''}`}
                  onClick={() => setAro(a)}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', background: a.hex,
                    display: 'inline-block', border: '1px solid rgba(0,0,0,0.25)',
                    boxShadow: '0 0 3px rgba(255,255,255,0.5)'
                  }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diseño en virola */}
          <div className="ctrl-group">
            <h3>Diseño en virola</h3>
            <p className="ctrl-hint">Elegí un grabado para el aro metálico</p>
            <div className="ctrl-grid">
              {DISEÑOS_VIROLA.map(d => (
                <button key={d.id}
                  className={`ctrl-chip ${diseño === d.id ? 'active' : ''}`}
                  onClick={() => { setDiseño(d.id); setVista('top') }}
                >{d.label}</button>
              ))}
            </div>
          </div>

          {/* Texto personalizado */}
          <div className="ctrl-group">
            <h3>Texto en la virola</h3>
            <p className="ctrl-hint">Tu mensaje grabado en el aro — hasta 45 caracteres</p>
            <div className="ctrl-text-wrap">
              <input
                type="text"
                className="ctrl-text-input"
                placeholder='Ej: "Ruta, mates y viajar a cualquier lado con vos"'
                maxLength={45}
                value={textoVirola}
                onChange={e => { setTextoVirola(e.target.value); setVista('top') }}
              />
              <span className="ctrl-char-count">{textoVirola.length}/45</span>
            </div>
            {textoVirola && (
              <button className="ctrl-chip" style={{ marginTop: '0.5rem' }}
                onClick={() => setTextoVirola('')}>✕ Borrar texto</button>
            )}
          </div>

          {vista === '3d' && (
            <div className="ctrl-group">
              <button
                className={`ctrl-chip ${autoRotate ? 'active' : ''}`}
                onClick={() => setAutoRotate(v => !v)}
              >
                {autoRotate ? '⏸ Pausar rotación' : '▶ Rotar automático'}
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
