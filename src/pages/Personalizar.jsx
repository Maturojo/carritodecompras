import { useState } from 'react'
import { Link } from 'react-router-dom'

const TIPOS = [
  { id: 'calabaza',  label: 'Calabaza',  emoji: '🟤' },
  { id: 'madera',    label: 'Madera',    emoji: '🪵' },
  { id: 'ceramica',  label: 'Cerámica',  emoji: '⚪' },
  { id: 'acero',     label: 'Acero',     emoji: '⚙️' },
]

const COLORES = [
  { id: 'natural',  label: 'Natural',   hex: '#8B5E3C' },
  { id: 'oscuro',   label: 'Oscuro',    hex: '#3D1F0D' },
  { id: 'claro',    label: 'Claro',     hex: '#D4A574' },
  { id: 'verde',    label: 'Verde',     hex: '#4A7C59' },
  { id: 'azul',     label: 'Azul',      hex: '#2C5F8A' },
  { id: 'rojo',     label: 'Rojo',      hex: '#8B2020' },
  { id: 'negro',    label: 'Negro',     hex: '#1A1A1A' },
  { id: 'blanco',   label: 'Blanco',    hex: '#F5F0E8' },
]

const BOMBILLAS = [
  { id: 'alpaca',   label: 'Alpaca',    color: '#C0C0C0' },
  { id: 'oro',      label: 'Dorada',    color: '#DAA520' },
  { id: 'acero',    label: 'Acero',     color: '#708090' },
  { id: 'cana',     label: 'Caña',      color: '#D2B48C' },
]

const GRABADOS = [
  { id: 'ninguno',  label: 'Sin grabado' },
  { id: 'flores',   label: '🌸 Flores' },
  { id: 'geometrico', label: '◈ Geométrico' },
  { id: 'nombre',   label: '✏️ Nombre' },
  { id: 'inicial',  label: 'A Inicial' },
]

// SVG del mate que cambia dinámicamente
function MateSVG({ tipo, color, bombillaColor, grabado, texto }) {
  const bodyColor   = color.hex
  const rimColor    = adjustColor(color.hex, -30)
  const shadowColor = adjustColor(color.hex, -50)

  return (
    <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" className="mate-svg">
      <defs>
        <radialGradient id="bodyGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={adjustColor(bodyColor, 30)} />
          <stop offset="60%" stopColor={bodyColor} />
          <stop offset="100%" stopColor={shadowColor} />
        </radialGradient>
        <radialGradient id="rimGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={adjustColor(rimColor, 20)} />
          <stop offset="100%" stopColor={rimColor} />
        </radialGradient>
        <filter id="shadow">
          <feDropShadow dx="3" dy="6" stdDeviation="6" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>

      {/* Sombra base */}
      <ellipse cx="100" cy="245" rx="45" ry="8" fill="rgba(0,0,0,0.15)" />

      {/* Cuerpo del mate */}
      {tipo === 'calabaza' && (
        <>
          <path d="M55 180 Q45 140 50 110 Q55 75 100 65 Q145 75 150 110 Q155 140 145 180 Q130 210 100 215 Q70 210 55 180Z"
            fill="url(#bodyGrad)" filter="url(#shadow)" />
          {/* Líneas de la calabaza */}
          <path d="M70 90 Q68 130 67 175" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.4"/>
          <path d="M100 67 Q98 130 98 212" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.4"/>
          <path d="M130 90 Q132 130 133 175" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.4"/>
        </>
      )}
      {tipo === 'madera' && (
        <>
          <path d="M60 190 Q50 150 52 110 Q56 72 100 65 Q144 72 148 110 Q150 150 140 190 Q128 215 100 218 Q72 215 60 190Z"
            fill="url(#bodyGrad)" filter="url(#shadow)" />
          {/* Veta de madera */}
          <path d="M70 85 Q80 120 75 170" stroke={shadowColor} strokeWidth="2" fill="none" opacity="0.25"/>
          <path d="M90 68 Q95 130 92 208" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.2"/>
          <path d="M115 70 Q118 130 115 205" stroke={shadowColor} strokeWidth="1.5" fill="none" opacity="0.2"/>
          <path d="M135 85 Q130 120 133 168" stroke={shadowColor} strokeWidth="2" fill="none" opacity="0.25"/>
        </>
      )}
      {tipo === 'ceramica' && (
        <>
          <path d="M58 185 Q48 148 50 108 Q55 70 100 63 Q145 70 150 108 Q152 148 142 185 Q130 213 100 216 Q70 213 58 185Z"
            fill="url(#bodyGrad)" filter="url(#shadow)" />
          {/* Brillo cerámica */}
          <ellipse cx="80" cy="100" rx="12" ry="18" fill="white" opacity="0.15" transform="rotate(-20,80,100)"/>
        </>
      )}
      {tipo === 'acero' && (
        <>
          <path d="M62 188 Q54 150 56 110 Q60 73 100 66 Q140 73 144 110 Q146 150 138 188 Q126 214 100 217 Q74 214 62 188Z"
            fill="url(#bodyGrad)" filter="url(#shadow)" />
          {/* Líneas acero */}
          <path d="M65 90 L65 190" stroke="white" strokeWidth="1" opacity="0.1"/>
          <path d="M135 90 L135 190" stroke="white" strokeWidth="1" opacity="0.1"/>
          <ellipse cx="82" cy="105" rx="8" ry="14" fill="white" opacity="0.12" transform="rotate(-15,82,105)"/>
        </>
      )}

      {/* Borde superior (aro) */}
      <ellipse cx="100" cy="75" rx="28" ry="10" fill="url(#rimGrad)" />
      <ellipse cx="100" cy="70" rx="26" ry="8" fill={adjustColor(rimColor, 15)} />

      {/* Grabado decorativo */}
      {grabado === 'flores' && (
        <g opacity="0.5" transform="translate(100,145)">
          <circle r="3" fill={adjustColor(bodyColor, -60)} />
          {[0,60,120,180,240,300].map(a => (
            <ellipse key={a} cx={Math.cos(a*Math.PI/180)*10} cy={Math.sin(a*Math.PI/180)*10}
              rx="4" ry="6" fill={adjustColor(bodyColor, -40)}
              transform={`rotate(${a},${Math.cos(a*Math.PI/180)*10},${Math.sin(a*Math.PI/180)*10})`} />
          ))}
        </g>
      )}
      {grabado === 'geometrico' && (
        <g opacity="0.4" transform="translate(100,145)">
          <polygon points="0,-18 15,9 -15,9" stroke={adjustColor(bodyColor,-60)} strokeWidth="2" fill="none"/>
          <polygon points="0,18 15,-9 -15,-9" stroke={adjustColor(bodyColor,-60)} strokeWidth="2" fill="none"/>
        </g>
      )}
      {grabado === 'nombre' && texto && (
        <text x="100" y="152" textAnchor="middle" fontSize="12" fontFamily="serif"
          fill={adjustColor(bodyColor, -60)} opacity="0.65" fontStyle="italic">
          {texto.slice(0,10)}
        </text>
      )}
      {grabado === 'inicial' && texto && (
        <text x="100" y="158" textAnchor="middle" fontSize="32" fontFamily="serif"
          fill={adjustColor(bodyColor, -60)} opacity="0.5" fontWeight="bold">
          {texto[0]?.toUpperCase()}
        </text>
      )}

      {/* Bombilla */}
      <line x1="100" y1="68" x2="118" y2="10" stroke={bombillaColor} strokeWidth="4" strokeLinecap="round"/>
      <line x1="118" y1="10" x2="122" y2="2" stroke={bombillaColor} strokeWidth="3" strokeLinecap="round"/>
      {/* Filtro bombilla */}
      <ellipse cx="100" cy="75" rx="5" ry="4" fill={adjustColor(bombillaColor, -20)} />
      {/* Detalle bombilla */}
      <line x1="103" y1="55" x2="117" y2="18" stroke={adjustColor(bombillaColor, 30)} strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
    </svg>
  )
}

// Ajustar brillo de color hex
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#',''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`
}

export default function Personalizar() {
  const [tipo,     setTipo]     = useState('calabaza')
  const [color,    setColor]    = useState(COLORES[0])
  const [bombilla, setBombilla] = useState(BOMBILLAS[0])
  const [grabado,  setGrabado]  = useState('ninguno')
  const [texto,    setTexto]    = useState('')

  const resumen = `${TIPOS.find(t=>t.id===tipo)?.label} ${color.label} con bombilla ${bombilla.label}${grabado !== 'ninguno' ? ` y grabado ${GRABADOS.find(g=>g.id===grabado)?.label}` : ''}`

  return (
    <main className="page-content">
      <section className="inner-hero" style={{paddingBottom:'2rem'}}>
        <span className="section-pretitle">Diseñá tu mate</span>
        <h1 className="inner-hero-title">Personalizador<br />de mates</h1>
        <p className="inner-hero-sub">Elegí cada detalle y mirá cómo queda antes de pedir el tuyo.</p>
      </section>

      <div className="personalizador-layout">

        {/* ── Preview ── */}
        <div className="personalizador-preview">
          <div className="mate-preview-card">
            <MateSVG tipo={tipo} color={color} bombillaColor={bombilla.color} grabado={grabado} texto={texto} />
            <p className="mate-preview-desc">{resumen}</p>
          </div>
          <Link
            to={`/contacto`}
            className="btn-primary full-width"
            style={{marginTop:'1rem', display:'block', textAlign:'center'}}
          >
            Consultar este diseño por WhatsApp
          </Link>
        </div>

        {/* ── Controles ── */}
        <div className="personalizador-controls">

          {/* Tipo */}
          <div className="ctrl-group">
            <h3>Tipo de mate</h3>
            <div className="ctrl-grid">
              {TIPOS.map(t => (
                <button key={t.id}
                  className={`ctrl-chip ${tipo === t.id ? 'active' : ''}`}
                  onClick={() => setTipo(t.id)}
                >
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="ctrl-group">
            <h3>Color</h3>
            <div className="ctrl-colors">
              {COLORES.map(c => (
                <button key={c.id}
                  className={`ctrl-color-btn ${color.id === c.id ? 'active' : ''}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  onClick={() => setColor(c)}
                >
                  {color.id === c.id && <span className="color-check">✓</span>}
                </button>
              ))}
            </div>
            <p className="ctrl-selected">Seleccionado: <strong>{color.label}</strong></p>
          </div>

          {/* Bombilla */}
          <div className="ctrl-group">
            <h3>Bombilla</h3>
            <div className="ctrl-grid">
              {BOMBILLAS.map(b => (
                <button key={b.id}
                  className={`ctrl-chip ${bombilla.id === b.id ? 'active' : ''}`}
                  onClick={() => setBombilla(b)}
                >
                  <span style={{width:12,height:12,borderRadius:'50%',background:b.color,display:'inline-block',border:'1px solid rgba(0,0,0,0.2)'}}/>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grabado */}
          <div className="ctrl-group">
            <h3>Grabado</h3>
            <div className="ctrl-grid">
              {GRABADOS.map(g => (
                <button key={g.id}
                  className={`ctrl-chip ${grabado === g.id ? 'active' : ''}`}
                  onClick={() => setGrabado(g.id)}
                >
                  {g.label}
                </button>
              ))}
            </div>
            {(grabado === 'nombre' || grabado === 'inicial') && (
              <input
                className="ctrl-text-input"
                placeholder={grabado === 'nombre' ? 'Escribí el nombre...' : 'Escribí la inicial...'}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                maxLength={grabado === 'inicial' ? 1 : 10}
              />
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
