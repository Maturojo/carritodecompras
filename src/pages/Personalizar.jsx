import { useState, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Lathe } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────── CONFIGURACIÓN ─────────── */
const TIPOS = [
  { id: 'calabaza', label: 'Calabaza' },
  { id: 'porongo',  label: 'Porongo'  },
  { id: 'ceramica', label: 'Cerámica' },
  { id: 'acero',    label: 'Acero'    },
]

const CUERPOS = [
  { id: 'natural',   label: 'Madera natural',   hex: '#B5723A', hex2: '#8B5E3C', rough: 0.85, metal: 0.0 },
  { id: 'oscuro',    label: 'Madera oscura',     hex: '#3B1F0A', hex2: '#2E1503', rough: 0.8,  metal: 0.0 },
  { id: 'negro',     label: 'Cuero negro',       hex: '#1A1A1A', hex2: '#111111', rough: 0.7,  metal: 0.0 },
  { id: 'marron',    label: 'Cuero marrón',      hex: '#5C3317', hex2: '#3D200A', rough: 0.75, metal: 0.0 },
  { id: 'ceramica_b',label: 'Cerámica blanca',   hex: '#F0EDE4', hex2: '#DDD9CE', rough: 0.35, metal: 0.0 },
  { id: 'ceramica_g',label: 'Cerámica gris',     hex: '#9B9B9B', hex2: '#7A7A7A', rough: 0.4,  metal: 0.0 },
  { id: 'verde',     label: 'Verde mate',        hex: '#3A5E3A', hex2: '#2A4A2A', rough: 0.7,  metal: 0.0 },
  { id: 'azul',      label: 'Azul cobalto',      hex: '#1E3A72', hex2: '#162B55', rough: 0.65, metal: 0.0 },
]

const AROS = [
  { id: 'alpaca',  label: 'Alpaca',      hex: '#D4D4D4', rough: 0.25, metal: 0.85 },
  { id: 'dorado',  label: 'Dorado',      hex: '#CFB53B', rough: 0.2,  metal: 1.0  },
  { id: 'acero',   label: 'Acero',       hex: '#8A9AA8', rough: 0.2,  metal: 0.95 },
  { id: 'plata',   label: 'Plata lisa',  hex: '#E8E8E8', rough: 0.15, metal: 1.0  },
]

const GRABADOS = [
  { id: 'ninguno',    label: 'Sin grabado'  },
  { id: 'ruta',       label: '🛣 Ruteamos'   },
  { id: 'flores',     label: '🌸 Flores'     },
  { id: 'geometrico', label: '◈ Étnico'      },
  { id: 'lineas',     label: '— Líneas'      },
]

/* ─────────── PERFILES DEL MATE (formas reales) ─────────── */
function getMateProfile(tipo) {
  // Puntos [radio, altura] — formas cortas y anchas como los mates reales
  if (tipo === 'calabaza') return [
    [0.00, -0.95],
    [0.18, -0.93],
    [0.50, -0.82],
    [0.76, -0.60],
    [0.90, -0.28],
    [0.94,  0.08],
    [0.90,  0.42],
    [0.78,  0.68],
    [0.60,  0.84],
    [0.44,  0.93],
    [0.36,  1.00],
    [0.34,  1.04],
    [0.34,  1.10],
    [0.18,  1.14],
    [0.00,  1.16],
  ]
  if (tipo === 'porongo') return [
    [0.00, -0.98],
    [0.22, -0.96],
    [0.52, -0.82],
    [0.72, -0.52],
    [0.82, -0.12],
    [0.84,  0.22],
    [0.82,  0.50],
    [0.76,  0.72],
    [0.64,  0.86],
    [0.50,  0.94],
    [0.40,  1.00],
    [0.38,  1.06],
    [0.38,  1.12],
    [0.20,  1.16],
    [0.00,  1.18],
  ]
  if (tipo === 'ceramica') return [
    [0.00, -0.96],
    [0.28, -0.94],
    [0.58, -0.80],
    [0.78, -0.50],
    [0.88, -0.10],
    [0.88,  0.28],
    [0.85,  0.58],
    [0.78,  0.80],
    [0.64,  0.92],
    [0.46,  1.00],
    [0.38,  1.06],
    [0.38,  1.12],
    [0.20,  1.16],
    [0.00,  1.18],
  ]
  // acero — cilíndrico recto
  return [
    [0.00, -0.95],
    [0.30, -0.92],
    [0.60, -0.82],
    [0.76, -0.62],
    [0.80, -0.30],
    [0.80,  0.32],
    [0.80,  0.62],
    [0.76,  0.82],
    [0.62,  0.94],
    [0.46,  1.02],
    [0.40,  1.07],
    [0.40,  1.12],
    [0.22,  1.16],
    [0.00,  1.18],
  ]
}

/* ─────────── UTILIDADES ─────────── */
function adjustHex(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/* ─────────── MODELO 3D DEL MATE ─────────── */
function MateModel({ tipo, cuerpo, aro, grabado, autoRotate }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35
    }
  })

  const profile = getMateProfile(tipo)
  const scale = 1.0

  // Puntos del cuerpo (sin la parte superior del aro)
  const bodyPoints = profile.slice(0, -4).map(([x, y]) =>
    new THREE.Vector2(x * scale, y * scale)
  )
  // Puntos del aro superior
  const rimPoints = profile.slice(-6).map(([x, y]) =>
    new THREE.Vector2(x * scale, y * scale)
  )

  const allPoints = profile.map(([x, y]) => new THREE.Vector2(x * scale, y * scale))

  // Punto más ancho para referencia del grabado
  const maxR = Math.max(...profile.map(([x]) => x)) * scale
  // Altura del cuello (punto de transición al aro)
  const neckY = profile[profile.length - 5][1] * scale

  const bodyColor  = new THREE.Color(cuerpo.hex)
  const bodyColor2 = new THREE.Color(cuerpo.hex2)
  const aroColor   = new THREE.Color(aro.hex)

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>

      {/* ── Cuerpo principal del mate ── */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[allPoints, 80]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={cuerpo.rough}
          metalness={cuerpo.metal}
        />
      </mesh>

      {/* ── Franja inferior más oscura (efecto de profundidad) ── */}
      {(tipo !== 'acero') && (
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[maxR * 0.72, maxR * 0.55, 0.35, 48, 1, true]} />
          <meshStandardMaterial
            color={bodyColor2}
            roughness={cuerpo.rough + 0.05}
            metalness={cuerpo.metal}
            side={THREE.FrontSide}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}

      {/* ── Aro superior de alpaca/metal ── */}
      {/* Banda ancha del aro */}
      <mesh position={[0, neckY + 0.04, 0]} castShadow>
        <cylinderGeometry args={[
          profile[profile.length - 5][0] * scale + 0.008,
          profile[profile.length - 5][0] * scale + 0.005,
          0.22, 64
        ]} />
        <meshStandardMaterial
          color={aroColor}
          roughness={aro.rough}
          metalness={aro.metal}
          envMapIntensity={2}
        />
      </mesh>

      {/* Borde superior del aro (más grueso) */}
      <mesh position={[0, neckY + 0.14, 0]} castShadow>
        <torusGeometry args={[
          profile[profile.length - 5][0] * scale + 0.005,
          0.022, 20, 64
        ]} />
        <meshStandardMaterial
          color={aroColor}
          roughness={aro.rough}
          metalness={aro.metal}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Borde inferior del aro */}
      <mesh position={[0, neckY - 0.08, 0]} castShadow>
        <torusGeometry args={[
          profile[profile.length - 5][0] * scale + 0.005,
          0.016, 16, 64
        ]} />
        <meshStandardMaterial
          color={aroColor}
          roughness={aro.rough}
          metalness={aro.metal}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* ── Grabados / decoraciones ── */}
      {/* Líneas horizontales */}
      {grabado === 'lineas' && [0.1, 0.3, 0.5].map((t, i) => {
        const idx = Math.floor(t * (profile.length - 6))
        const r = profile[idx][0] * scale + 0.008
        const y = profile[idx][1] * scale
        return (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[r, 0.01, 8, 72]} />
            <meshStandardMaterial
              color={adjustHex(aro.hex, -30)}
              roughness={aro.rough + 0.1}
              metalness={aro.metal * 0.7}
            />
          </mesh>
        )
      })}

      {/* Patrón étnico — bandas con hexágonos */}
      {grabado === 'geometrico' && [0.25, 0.55].map((t, i) => {
        const idx = Math.floor(t * (profile.length - 6))
        const r = profile[idx][0] * scale + 0.009
        const y = profile[idx][1] * scale
        return (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[r, 0.015, 6, 6]} />
            <meshStandardMaterial
              color={adjustHex(aro.hex, -20)}
              roughness={0.3}
              metalness={aro.metal * 0.8}
            />
          </mesh>
        )
      })}

      {/* Flores — pequeñas esferas decorativas */}
      {grabado === 'flores' && Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const idx = Math.floor(0.38 * (profile.length - 6))
        const r = profile[idx][0] * scale + 0.02
        const y = profile[idx][1] * scale
        return (
          <mesh key={i} position={[
            Math.cos(angle) * r,
            y,
            Math.sin(angle) * r
          ]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial
              color={adjustHex(aro.hex, 20)}
              roughness={0.3}
              metalness={aro.metal * 0.6}
            />
          </mesh>
        )
      })}

      {/* Ruteamos — banda con relieves */}
      {grabado === 'ruta' && Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const idx = Math.floor(0.3 * (profile.length - 6))
        const r = profile[idx][0] * scale + 0.015
        const y = profile[idx][1] * scale + (i % 2 === 0 ? 0.04 : -0.04)
        return (
          <mesh key={i} position={[
            Math.cos(angle) * r,
            y,
            Math.sin(angle) * r
          ]}>
            <boxGeometry args={[0.04, 0.04, 0.015]} />
            <meshStandardMaterial
              color={adjustHex(aro.hex, -10)}
              roughness={0.25}
              metalness={aro.metal * 0.75}
            />
          </mesh>
        )
      })}

      {/* ── Interior visible (fondo oscuro) ── */}
      <mesh position={[0, neckY + 0.02, 0]}>
        <cylinderGeometry args={[
          profile[profile.length - 5][0] * scale - 0.025,
          profile[profile.length - 5][0] * scale - 0.025,
          0.04, 40
        ]} />
        <meshStandardMaterial color="#1a0f06" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── Base plana ── */}
      <mesh position={[0, -0.95 * scale, 0]} rotation={[Math.PI, 0, 0]}>
        <circleGeometry args={[0.16 * scale, 32]} />
        <meshStandardMaterial color={adjustHex(cuerpo.hex, -30)} roughness={0.9} />
      </mesh>

      {/* ── Bombilla ── */}
      <group position={[0.14, neckY + 0.02, 0]} rotation={[0, 0, -0.28]}>
        {/* Tubo principal */}
        <mesh>
          <cylinderGeometry args={[0.022, 0.022, 1.5, 12]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
        {/* Extremo curvado */}
        <mesh position={[0.04, 0.78, 0]} rotation={[0, 0, 0.45]}>
          <cylinderGeometry args={[0.018, 0.018, 0.28, 10]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
        {/* Filtro (base esférica) */}
        <mesh position={[0, -0.68, 0]}>
          <sphereGeometry args={[0.048, 16, 16]} />
          <meshStandardMaterial
            color={adjustHex(aro.hex, -15)}
            roughness={0.35}
            metalness={aro.metal}
          />
        </mesh>
        {/* Aro decorativo del filtro */}
        <mesh position={[0, -0.5, 0]}>
          <torusGeometry args={[0.028, 0.009, 8, 32]} />
          <meshStandardMaterial color={aroColor} roughness={aro.rough} metalness={aro.metal} />
        </mesh>
      </group>
    </group>
  )
}

/* ─────────── ESCENA 3D ─────────── */
function Scene({ tipo, cuerpo, aro, grabado, autoRotate }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]}  intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#ffeedd" />
      <directionalLight position={[0, -3, 3]}  intensity={0.2} color="#c8d8e8" />
      <pointLight position={[2, 4, 3]} intensity={0.6} color="#fff8f0" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <MateModel
          tipo={tipo}
          cuerpo={cuerpo}
          aro={aro}
          grabado={grabado}
          autoRotate={autoRotate}
        />
        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.55}
          scale={3.5}
          blur={2.5}
          far={1.5}
        />
      </Suspense>
    </>
  )
}

/* ─────────── PÁGINA PRINCIPAL ─────────── */
export default function Personalizar() {
  const [tipo,       setTipo]       = useState('calabaza')
  const [cuerpo,     setCuerpo]     = useState(CUERPOS[0])
  const [aro,        setAro]        = useState(AROS[0])
  const [grabado,    setGrabado]    = useState('ninguno')
  const [autoRotate, setAutoRotate] = useState(true)

  const waMsg = encodeURIComponent(
    `Hola! Me interesa un mate personalizado:\n` +
    `• Forma: ${TIPOS.find(t => t.id === tipo)?.label}\n` +
    `• Material: ${cuerpo.label}\n` +
    `• Aro: ${aro.label}\n` +
    `• Grabado: ${GRABADOS.find(g => g.id === grabado)?.label}`
  )

  return (
    <main className="page-content">
      <section className="inner-hero" style={{ paddingBottom: '2rem' }}>
        <span className="section-pretitle">Tu mate, tu estilo</span>
        <h1 className="inner-hero-title">Personalizador 3D</h1>
        <p className="inner-hero-sub">
          Elegí cada detalle y consultanos para hacer el tuyo a medida.
        </p>
      </section>

      <div className="personalizador-layout">

        {/* ── Canvas 3D ── */}
        <div className="personalizador-preview">
          <div className="mate-canvas-wrap">
            <Canvas
              camera={{ position: [0, 0.6, 3.2], fov: 38 }}
              shadows
              gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
            >
              <Scene
                tipo={tipo}
                cuerpo={cuerpo}
                aro={aro}
                grabado={grabado}
                autoRotate={autoRotate}
              />
              <OrbitControls
                enableZoom={false}
                minPolarAngle={Math.PI / 5}
                maxPolarAngle={Math.PI / 1.7}
                onStart={() => setAutoRotate(false)}
              />
            </Canvas>
            <p className="canvas-hint">🖱 Arrastrá para girar</p>
          </div>

          {/* Resumen del diseño */}
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
              <strong>{GRABADOS.find(g => g.id === grabado)?.label}</strong>
            </div>
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
                <button
                  key={t.id}
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
                <button
                  key={c.id}
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
                <button
                  key={a.id}
                  className={`ctrl-chip ${aro.id === a.id ? 'active' : ''}`}
                  onClick={() => setAro(a)}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: a.hex,
                    display: 'inline-block',
                    border: '1px solid rgba(0,0,0,0.25)',
                    boxShadow: '0 0 3px rgba(255,255,255,0.5)'
                  }} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <h3>Grabado</h3>
            <div className="ctrl-grid">
              {GRABADOS.map(g => (
                <button
                  key={g.id}
                  className={`ctrl-chip ${grabado === g.id ? 'active' : ''}`}
                  onClick={() => setGrabado(g.id)}
                >{g.label}</button>
              ))}
            </div>
          </div>

          <div className="ctrl-group">
            <button
              className={`ctrl-chip ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(v => !v)}
            >
              {autoRotate ? '⏸ Pausar rotación' : '▶ Rotar automático'}
            </button>
          </div>

        </div>
      </div>
    </main>
  )
}
