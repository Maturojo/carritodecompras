import { useState } from 'react'
import SEO from '../components/SEO'
import { useContent } from '../context/ContentContext'

/* ── SVG Icons ── */
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
)

export default function Contacto() {
  const { content } = useContent()
  const c = content.contacto

  const WA_URL = `https://wa.me/${c.whatsapp}?text=` + encodeURIComponent('Hola! Tengo una consulta 🧉')
  const IG_URL = c.instagram

  const [form, setForm]   = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 900)
  }

  return (
    <>
    <SEO
      title="Contacto — Escribinos"
      canonical="/contacto"
      description="Contactate con Mate&Co por WhatsApp, Instagram o email. Respondemos en el día. Mar del Plata, Argentina."
    />
    <main className="page-content">

      {/* ── Hero ── */}
      <section className="inner-hero">
        <span className="section-pretitle">Contacto</span>
        <h1 className="inner-hero-title">¿Tenés alguna duda?<br />Escribinos</h1>
        <p className="inner-hero-sub">
          Respondemos todos los mensajes en menos de 24 horas hábiles. ¡No te quedes con la duda!
        </p>
      </section>

      <div className="contacto-layout">

        {/* ── Info ── */}
        <div className="contacto-info">
          <h2>Información de contacto</h2>
          <div className="contact-items">

            <a href={`mailto:${c.email}`} className="contact-item contact-item-link">
              <span className="contact-icon"><IconMail /></span>
              <div>
                <strong>Email</strong>
                <p>{c.email}</p>
              </div>
            </a>

            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="contact-item contact-item-link">
              <span className="contact-icon contact-icon-wa"><IconWhatsApp /></span>
              <div>
                <strong>WhatsApp</strong>
                <p>+54 9 223 635-9767</p>
              </div>
            </a>

            <div className="contact-item">
              <span className="contact-icon"><IconPin /></span>
              <div>
                <strong>Ubicación</strong>
                <p>{c.ciudad}<br />(envíos a todo el país)</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon"><IconClock /></span>
              <div>
                <strong>Horario de atención</strong>
                <p>{c.horario}</p>
              </div>
            </div>

          </div>

          {/* ── Redes ── */}
          <div className="social-links">
            <h3>Seguinos</h3>
            <div className="social-row">
              <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="social-btn social-ig">
                <IconInstagram /> Instagram
              </a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="social-btn social-wa">
                <IconWhatsApp /> WhatsApp
              </a>
              <a href={c.tiktok} target="_blank" rel="noopener noreferrer" className="social-btn social-tk">
                <IconTikTok /> TikTok
              </a>
            </div>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="contacto-form-wrap">
          {sent ? (
            <div className="form-success">
              <div className="success-icon">✅</div>
              <h3>¡Mensaje enviado!</h3>
              <p>Gracias por contactarnos. Te respondemos pronto.</p>
              <button className="btn-primary" onClick={() => setSent(false)}>Enviar otro mensaje</button>
            </div>
          ) : (
            <form className="contacto-form" onSubmit={handleSubmit}>
              <h2>Envianos un mensaje</h2>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" />
              </div>
              <div className="form-group">
                <label>Asunto</label>
                <select name="asunto" value={form.asunto} onChange={handleChange} required className="form-select">
                  <option value="">Seleccioná un asunto</option>
                  <option value="pedido">Consulta sobre un pedido</option>
                  <option value="producto">Consulta sobre un producto</option>
                  <option value="envio">Información de envío</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mensaje</label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  required
                  placeholder="Contanos en qué te podemos ayudar..."
                  rows={5}
                  className="form-textarea"
                />
              </div>
              <button type="submit" className="btn-primary full-width" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <h2 className="section-title centered">Preguntas frecuentes</h2>
        <div className="faq-grid">
          {c.faq.map((f, i) => (
            <div key={i} className="faq-card">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
    </>
  )
}
