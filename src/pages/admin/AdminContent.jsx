import { useState } from 'react'
import { useContent } from '../../context/ContentContext'
import Swal from 'sweetalert2'

const TABS = [
  { id: 'landing',  label: '🏠 Inicio' },
  { id: 'nosotros', label: '👥 Nosotros' },
  { id: 'contacto', label: '📬 Contacto' },
]

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
        text: err.message || 'No se pudo conectar con la base de datos. Revisá la configuración de Vercel.',
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
        <p>Editá los textos e imágenes de tu sitio sin tocar código.</p>
      </div>

      {/* Tabs */}
      <div className="content-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`content-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── LANDING ── */}
      {tab === 'landing' && (
        <div className="content-section">
          <h3>Hero (portada)</h3>
          <div className="content-field">
            <label>Imagen de fondo</label>
            <input value={form.landing.heroImage} onChange={e => set('landing','heroImage', e.target.value)} placeholder="/hero.jpeg o URL de imagen" />
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
                <input value={item.year} onChange={e => setArr('nosotros', 'timeline', i, 'year', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Evento</label>
                <input value={item.event} onChange={e => setArr('nosotros', 'timeline', i, 'event', e.target.value)} />
              </div>
            </div>
          ))}

          <h3>El equipo</h3>
          {form.nosotros.team.map((m, i) => (
            <div key={i} className="content-row" style={{ alignItems: 'flex-end', gap: '12px' }}>
              <div className="content-field" style={{ flex: '0 0 60px' }}>
                <label>Emoji</label>
                <input value={m.emoji} onChange={e => setArr('nosotros', 'team', i, 'emoji', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Nombre</label>
                <input value={m.name} onChange={e => setArr('nosotros', 'team', i, 'name', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Rol</label>
                <input value={m.role} onChange={e => setArr('nosotros', 'team', i, 'role', e.target.value)} />
              </div>
            </div>
          ))}

          <h3>Nuestros valores</h3>
          {form.nosotros.values.map((v, i) => (
            <div key={i} className="content-row" style={{ alignItems: 'flex-end', gap: '12px' }}>
              <div className="content-field" style={{ flex: '0 0 60px' }}>
                <label>Ícono</label>
                <input value={v.icon} onChange={e => setArr('nosotros', 'values', i, 'icon', e.target.value)} />
              </div>
              <div className="content-field" style={{ flex: '0 0 140px' }}>
                <label>Título</label>
                <input value={v.title} onChange={e => setArr('nosotros', 'values', i, 'title', e.target.value)} />
              </div>
              <div className="content-field">
                <label>Descripción</label>
                <input value={v.desc} onChange={e => setArr('nosotros', 'values', i, 'desc', e.target.value)} />
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
              <input value={f.q} onChange={e => setArr('contacto', 'faq', i, 'q', e.target.value)} />
              <label style={{ marginTop: '6px' }}>Respuesta</label>
              <textarea rows={2} value={f.a} onChange={e => setArr('contacto', 'faq', i, 'a', e.target.value)} />
            </div>
          ))}

          <button className="admin-btn-primary" onClick={() => handleSave('contacto')} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
