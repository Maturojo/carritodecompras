import { useState } from 'react'
import { useContent } from '../../context/ContentContext'
import Swal from 'sweetalert2'

const TABS = [
  { id: 'landing',  label: '🏠 Inicio' },
  { id: 'nosotros', label: '👥 Nosotros' },
  { id: 'contacto', label: '📬 Contacto' },
]

/* ─────────────────────────────────────────────
   Preview components (render en tiempo real)
───────────────────────────────────────────── */
const P = {
  wrap:    { fontFamily: 'Georgia, serif', color: '#2d1a0e' },
  label:   { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#9c664d', marginBottom: 6 },
  section: { marginBottom: 18 },
  card:    { background: '#f8f4ef', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  row:     { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  divider: { borderBottom: '1px solid #e8dfd4', marginBottom: 12, paddingBottom: 12 },
}

function PreviewHero({ image, pretitle, title, subtitle }) {
  return (
    <div style={{
      background: `linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.48)), url(${image || '/hero.jpeg'}) center/cover no-repeat`,
      padding: '28px 18px', borderRadius: 10, color: '#fff', marginBottom: 14,
    }}>
      {pretitle && <p style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5, opacity: .75 }}>{pretitle}</p>}
      <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{title || '—'}</p>
      {subtitle && <p style={{ fontSize: 11, lineHeight: 1.5, opacity: .85 }}>{subtitle}</p>}
    </div>
  )
}

function PreviewStat({ value, label }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', background: '#f8f4ef', borderRadius: 8, padding: '10px 4px' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#9c664d' }}>{value}</div>
      <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function LandingPreview({ c }) {
  return (
    <div style={P.wrap}>
      <PreviewHero image={c.heroImage} pretitle={c.heroPretitle} title={c.heroTitle} subtitle={c.heroSubtitle} />

      <div style={P.section}>
        <p style={P.label}>Nuestra historia</p>
        <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{c.aboutTitle}</p>
        <p style={{ fontSize: 11, color: '#555', lineHeight: 1.6, marginBottom: 5 }}>{c.aboutText1}</p>
        <p style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>{c.aboutText2}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <PreviewStat value={c.statClientes}  label="Clientes" />
          <PreviewStat value={c.statArtesanos} label="Artesanos" />
          <PreviewStat value={c.statAnios}     label="Años" />
        </div>
      </div>

      <div style={P.section}>
        <p style={P.label}>Beneficios</p>
        <div style={P.grid2}>
          {c.features?.map((f, i) => (
            <div key={i} style={P.card}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{f.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3 }}>{f.title}</div>
              <div style={{ fontSize: 9, color: '#666', lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={P.section}>
        <p style={P.label}>Testimonios</p>
        {c.testimonials?.map((t, i) => (
          <div key={i} style={P.card}>
            <p style={{ fontSize: 10, fontStyle: 'italic', color: '#444', lineHeight: 1.5, marginBottom: 5 }}>"{t.text}"</p>
            <p style={{ fontSize: 9, fontWeight: 700 }}>{t.name} <span style={{ color: '#999', fontWeight: 400 }}>· {t.city}</span></p>
          </div>
        ))}
      </div>
    </div>
  )
}

function NosotrosPreview({ c }) {
  return (
    <div style={P.wrap}>
      <PreviewHero image={c.heroImage} title={c.heroTitle} subtitle={c.heroSubtitle} />

      <div style={P.section}>
        <p style={P.label}>Historia</p>
        <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{c.storyTitle}</p>
        {[c.storyText1, c.storyText2, c.storyText3].filter(Boolean).map((t, i) => (
          <p key={i} style={{ fontSize: 10, color: '#555', lineHeight: 1.6, marginBottom: 5 }}>{t}</p>
        ))}
      </div>

      <div style={P.section}>
        <p style={P.label}>Línea de tiempo</p>
        {c.timeline?.map((item, i) => (
          <div key={i} style={P.row}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9c664d', minWidth: 34 }}>{item.year}</span>
            <span style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{item.event}</span>
          </div>
        ))}
      </div>

      <div style={P.section}>
        <p style={{ ...P.label, textAlign: 'center', marginBottom: 10 }}>El equipo</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {c.team?.map((m, i) => (
            <div key={i} style={{ ...P.card, flex: '1 1 70px', textAlign: 'center', marginBottom: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: 26, lineHeight: 1 }}>{m.emoji}</div>
              <div style={{ fontSize: 9, fontWeight: 700, marginTop: 6, color: '#2d1a0e' }}>{m.name || '—'}</div>
              <div style={{ fontSize: 8, color: '#9c664d', marginTop: 2 }}>{m.role}</div>
            </div>
          ))}
          {(!c.team || c.team.length === 0) && (
            <p style={{ fontSize: 10, color: '#aaa', fontStyle: 'italic' }}>Sin integrantes aún</p>
          )}
        </div>
      </div>

      <div style={P.section}>
        <p style={P.label}>Valores</p>
        <div style={P.grid2}>
          {c.values?.map((v, i) => (
            <div key={i} style={P.card}>
              <div style={{ fontSize: 17, marginBottom: 3 }}>{v.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2 }}>{v.title}</div>
              <div style={{ fontSize: 9, color: '#666', lineHeight: 1.4 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactoPreview({ c }) {
  return (
    <div style={P.wrap}>
      <div style={P.section}>
        <p style={P.label}>Datos de contacto</p>
        {[['✉️', 'Email', c.email], ['📱', 'WhatsApp', c.whatsapp], ['📍', 'Ubicación', c.ciudad], ['🕐', 'Horario', c.horario]].map(([icon, label, val]) => (
          <div key={label} style={{ ...P.row, ...P.divider }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9c664d', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11 }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={P.section}>
        <p style={P.label}>Redes sociales</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {c.instagram && <span style={{ fontSize: 10, background: '#f8f4ef', padding: '4px 10px', borderRadius: 20 }}>📸 Instagram</span>}
          {c.tiktok    && <span style={{ fontSize: 10, background: '#f8f4ef', padding: '4px 10px', borderRadius: 20 }}>🎵 TikTok</span>}
          {c.whatsapp  && <span style={{ fontSize: 10, background: '#f8f4ef', padding: '4px 10px', borderRadius: 20 }}>💬 WhatsApp</span>}
        </div>
      </div>

      <div style={P.section}>
        <p style={P.label}>Preguntas frecuentes</p>
        {c.faq?.map((f, i) => (
          <div key={i} style={P.card}>
            <p style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{f.q}</p>
            <p style={{ fontSize: 9, color: '#666', lineHeight: 1.5 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function AdminContent() {
  const { content, saveContent } = useContent()
  const [tab, setTab]       = useState('landing')
  const [form, setForm]     = useState(content)
  const [saving, setSaving] = useState(false)

  const set = (page, field, value) =>
    setForm(f => ({ ...f, [page]: { ...f[page], [field]: value } }))

  const setArr = (page, field, index, key, value) =>
    setForm(f => ({
      ...f,
      [page]: {
        ...f[page],
        [field]: f[page][field].map((item, i) =>
          i === index ? { ...item, [key]: value } : item
        ),
      },
    }))

  const handleSave = async (page) => {
    setSaving(true)
    try {
      await saveContent(page, form[page])
      Swal.fire({
        title: '¡Guardado!',
        text: 'Los cambios se aplicaron en el sitio.',
        icon: 'success',
        confirmButtonColor: '#9c664d',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      })
    } catch (err) {
      Swal.fire({
        title: 'Error al guardar',
        text: err.message || 'No se pudo conectar con la base de datos.',
        icon: 'error',
        confirmButtonColor: '#9c664d',
        confirmButtonText: 'Entendido',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-content-editor">
      <div className="admin-page-header">
        <h2>Editor de contenido</h2>
        <p>Editá los textos e imágenes · la vista previa se actualiza mientras escribís.</p>
      </div>

      <div className="content-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`content-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      <div className="editor-split">

        {/* ── FORMULARIO ── */}
        <div className="editor-form-pane">

          {/* ── LANDING ── */}
          {tab === 'landing' && (
            <div className="content-section">
              <h3>Hero (portada)</h3>
              <div className="content-field">
                <label>Imagen de fondo</label>
                <input value={form.landing.heroImage} onChange={e => set('landing','heroImage', e.target.value)} placeholder="/hero.jpeg o URL" />
                {form.landing.heroImage && <img src={form.landing.heroImage} alt="preview" className="content-img-preview" />}
              </div>
              <div className="content-field">
                <label>Pretítulo (texto pequeño arriba)</label>
                <input value={form.landing.heroPretitle} onChange={e => set('landing','heroPretitle', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Título principal</label>
                <input value={form.landing.heroTitle} onChange={e => set('landing','heroTitle', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Subtítulo</label>
                <textarea rows={3} value={form.landing.heroSubtitle} onChange={e => set('landing','heroSubtitle', e.target.value)} />
              </div>

              <h3>Sección "Nuestra historia"</h3>
              <div className="content-field">
                <label>Título</label>
                <input value={form.landing.aboutTitle} onChange={e => set('landing','aboutTitle', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Párrafo 1</label>
                <textarea rows={3} value={form.landing.aboutText1} onChange={e => set('landing','aboutText1', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Párrafo 2</label>
                <textarea rows={3} value={form.landing.aboutText2} onChange={e => set('landing','aboutText2', e.target.value)} />
              </div>

              <h3>Estadísticas</h3>
              <div className="content-row">
                <div className="content-field">
                  <label>Clientes</label>
                  <input value={form.landing.statClientes} onChange={e => set('landing','statClientes', e.target.value)} />
                </div>
                <div className="content-field">
                  <label>Artesanos</label>
                  <input value={form.landing.statArtesanos} onChange={e => set('landing','statArtesanos', e.target.value)} />
                </div>
                <div className="content-field">
                  <label>Años</label>
                  <input value={form.landing.statAnios} onChange={e => set('landing','statAnios', e.target.value)} />
                </div>
              </div>

              <h3>Beneficios (4 tarjetas)</h3>
              {form.landing.features.map((f, i) => (
                <div key={i} className="content-row" style={{ alignItems: 'flex-end', gap: '10px' }}>
                  <div className="content-field" style={{ flex: '0 0 60px' }}>
                    <label>Ícono</label>
                    <input value={f.icon} onChange={e => setArr('landing','features', i, 'icon', e.target.value)} />
                  </div>
                  <div className="content-field" style={{ flex: '0 0 150px' }}>
                    <label>Título</label>
                    <input value={f.title} onChange={e => setArr('landing','features', i, 'title', e.target.value)} />
                  </div>
                  <div className="content-field">
                    <label>Descripción</label>
                    <input value={f.desc} onChange={e => setArr('landing','features', i, 'desc', e.target.value)} />
                  </div>
                </div>
              ))}

              <h3>Testimonios (3 clientes)</h3>
              {form.landing.testimonials.map((t, i) => (
                <div key={i} className="content-field">
                  <label>Cliente {i + 1} — Nombre</label>
                  <input value={t.name} onChange={e => setArr('landing','testimonials', i, 'name', e.target.value)} />
                  <label style={{ marginTop: 6 }}>Ciudad</label>
                  <input value={t.city} onChange={e => setArr('landing','testimonials', i, 'city', e.target.value)} />
                  <label style={{ marginTop: 6 }}>Reseña</label>
                  <textarea rows={2} value={t.text} onChange={e => setArr('landing','testimonials', i, 'text', e.target.value)} />
                </div>
              ))}

              <button className="admin-btn-primary" onClick={() => handleSave('landing')} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          )}

          {/* ── NOSOTROS ── */}
          {tab === 'nosotros' && (
            <div className="content-section">
              <h3>Hero</h3>
              <div className="content-field">
                <label>Imagen de fondo</label>
                <input value={form.nosotros.heroImage} onChange={e => set('nosotros','heroImage', e.target.value)} placeholder="/nosotros.jpeg o URL" />
                {form.nosotros.heroImage && <img src={form.nosotros.heroImage} alt="preview" className="content-img-preview" />}
              </div>
              <div className="content-field">
                <label>Título</label>
                <input value={form.nosotros.heroTitle} onChange={e => set('nosotros','heroTitle', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Subtítulo</label>
                <textarea rows={2} value={form.nosotros.heroSubtitle} onChange={e => set('nosotros','heroSubtitle', e.target.value)} />
              </div>

              <h3>Historia</h3>
              <div className="content-field">
                <label>Título sección</label>
                <input value={form.nosotros.storyTitle} onChange={e => set('nosotros','storyTitle', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Párrafo 1</label>
                <textarea rows={3} value={form.nosotros.storyText1} onChange={e => set('nosotros','storyText1', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Párrafo 2</label>
                <textarea rows={3} value={form.nosotros.storyText2} onChange={e => set('nosotros','storyText2', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Párrafo 3</label>
                <textarea rows={3} value={form.nosotros.storyText3} onChange={e => set('nosotros','storyText3', e.target.value)} />
              </div>

              <h3>Línea de tiempo</h3>
              {form.nosotros.timeline.map((item, i) => (
                <div key={i} className="content-row" style={{ alignItems: 'flex-end', gap: '12px' }}>
                  <div className="content-field" style={{ flex: '0 0 90px' }}>
                    <label>Año {i + 1}</label>
                    <input value={item.year} onChange={e => setArr('nosotros','timeline', i, 'year', e.target.value)} />
                  </div>
                  <div className="content-field">
                    <label>Evento</label>
                    <input value={item.event} onChange={e => setArr('nosotros','timeline', i, 'event', e.target.value)} />
                  </div>
                </div>
              ))}

              <h3>El equipo</h3>
              {form.nosotros.team.map((m, i) => (
                <div key={i} className="content-row" style={{ alignItems: 'flex-end', gap: '12px' }}>
                  <div className="content-field" style={{ flex: '0 0 60px' }}>
                    <label>Emoji</label>
                    <input value={m.emoji} onChange={e => setArr('nosotros','team', i, 'emoji', e.target.value)} />
                  </div>
                  <div className="content-field">
                    <label>Nombre</label>
                    <input value={m.name} onChange={e => setArr('nosotros','team', i, 'name', e.target.value)} />
                  </div>
                  <div className="content-field">
                    <label>Rol</label>
                    <input value={m.role} onChange={e => setArr('nosotros','team', i, 'role', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '2px' }}>
                    <button type="button" title="Subir" disabled={i === 0}
                      onClick={() => setForm(f => { const arr = [...f.nosotros.team]; [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; return { ...f, nosotros: { ...f.nosotros, team: arr } } })}
                      style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1, padding: '2px 6px' }}>▲</button>
                    <button type="button" title="Bajar" disabled={i === form.nosotros.team.length - 1}
                      onClick={() => setForm(f => { const arr = [...f.nosotros.team]; [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; return { ...f, nosotros: { ...f.nosotros, team: arr } } })}
                      style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', cursor: i === form.nosotros.team.length - 1 ? 'default' : 'pointer', opacity: i === form.nosotros.team.length - 1 ? 0.3 : 1, padding: '2px 6px' }}>▼</button>
                  </div>
                  <button type="button" title="Eliminar"
                    onClick={() => setForm(f => ({ ...f, nosotros: { ...f.nosotros, team: f.nosotros.team.filter((_,j) => j !== i) } }))}
                    style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', padding: '6px 10px', marginBottom: '2px' }}>🗑️</button>
                </div>
              ))}
              <button type="button"
                onClick={() => setForm(f => ({ ...f, nosotros: { ...f.nosotros, team: [...f.nosotros.team, { emoji: '🧑', name: '', role: '' }] } }))}
                style={{ marginTop: '6px', background: 'none', border: '1px dashed #9c664d', borderRadius: '8px', color: '#9c664d', cursor: 'pointer', padding: '6px 14px', fontSize: '0.85rem' }}>
                + Agregar integrante
              </button>

              <h3>Nuestros valores</h3>
              {form.nosotros.values.map((v, i) => (
                <div key={i} className="content-row" style={{ alignItems: 'flex-end', gap: '12px' }}>
                  <div className="content-field" style={{ flex: '0 0 60px' }}>
                    <label>Ícono</label>
                    <input value={v.icon} onChange={e => setArr('nosotros','values', i, 'icon', e.target.value)} />
                  </div>
                  <div className="content-field" style={{ flex: '0 0 140px' }}>
                    <label>Título</label>
                    <input value={v.title} onChange={e => setArr('nosotros','values', i, 'title', e.target.value)} />
                  </div>
                  <div className="content-field">
                    <label>Descripción</label>
                    <input value={v.desc} onChange={e => setArr('nosotros','values', i, 'desc', e.target.value)} />
                  </div>
                </div>
              ))}

              <button className="admin-btn-primary" onClick={() => handleSave('nosotros')} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          )}

          {/* ── CONTACTO ── */}
          {tab === 'contacto' && (
            <div className="content-section">
              <h3>Información de contacto</h3>
              <div className="content-field">
                <label>Email</label>
                <input value={form.contacto.email} onChange={e => set('contacto','email', e.target.value)} />
              </div>
              <div className="content-field">
                <label>WhatsApp (solo números, ej: 5492236359767)</label>
                <input value={form.contacto.whatsapp} onChange={e => set('contacto','whatsapp', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Ciudad / Ubicación</label>
                <input value={form.contacto.ciudad} onChange={e => set('contacto','ciudad', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Horario de atención</label>
                <input value={form.contacto.horario} onChange={e => set('contacto','horario', e.target.value)} />
              </div>

              <h3>Redes sociales</h3>
              <div className="content-field">
                <label>Instagram (URL completa)</label>
                <input value={form.contacto.instagram} onChange={e => set('contacto','instagram', e.target.value)} />
              </div>
              <div className="content-field">
                <label>TikTok (URL completa)</label>
                <input value={form.contacto.tiktok} onChange={e => set('contacto','tiktok', e.target.value)} />
              </div>

              <h3>Preguntas frecuentes (FAQ)</h3>
              {form.contacto.faq.map((f, i) => (
                <div key={i} className="content-field">
                  <label>Pregunta {i + 1}</label>
                  <input value={f.q} onChange={e => setArr('contacto','faq', i, 'q', e.target.value)} />
                  <label style={{ marginTop: 6 }}>Respuesta</label>
                  <textarea rows={2} value={f.a} onChange={e => setArr('contacto','faq', i, 'a', e.target.value)} />
                </div>
              ))}

              <button className="admin-btn-primary" onClick={() => handleSave('contacto')} disabled={saving}>
                {saving ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {/* ── PREVIEW ── */}
        <div className="editor-preview-pane">
          <div className="preview-pane-header">
            <span>👁 Vista previa</span>
            <span className="preview-pane-live">en vivo</span>
          </div>
          <div className="preview-pane-body">
            {tab === 'landing'  && <LandingPreview  c={form.landing}  />}
            {tab === 'nosotros' && <NosotrosPreview c={form.nosotros} />}
            {tab === 'contacto' && <ContactoPreview c={form.contacto} />}
          </div>
        </div>

      </div>
    </div>
  )
}
