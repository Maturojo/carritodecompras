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

          <button className="admin-btn-primary" onClick={() => handleSave('contacto')} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}
