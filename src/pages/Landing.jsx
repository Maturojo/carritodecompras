import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useContent } from '../context/ContentContext'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'

const features = [
  { icon: '🌿', title: 'Productos naturales', desc: 'Seleccionamos los mejores mates artesanales y yerbas de origen controlado.' },
  { icon: '🚚', title: 'Envíos a todo el país', desc: 'Despachamos en 24-48 horas hábiles. Seguimiento en tiempo real.' },
  { icon: '✋', title: 'Hecho a mano', desc: 'Cada mate pasa por manos artesanas antes de llegar a la tuya.' },
  { icon: '💚', title: 'Garantía de satisfacción', desc: 'Si no estás conforme, te devolvemos el dinero sin preguntas.' },
]

const testimonials = [
  { name: 'Valentina R.', city: 'Buenos Aires', text: 'El mate de madera tallado es una obra de arte. Lo uso todos los días y cada mañana lo agradezco.' },
  { name: 'Matías G.', city: 'Rosario', text: 'Compré el set completo y quedé encantado. Llegó súper bien embalado y más rápido de lo esperado.' },
  { name: 'Lucía F.', city: 'Córdoba', text: 'La yerba premium es lo mejor que probé. No vuelvo a comprar en el super, definitivamente.' },
]

export default function Landing() {
  const { products } = useStore()
  const { content } = useContent()
  const c = content.landing
  const featured = products.slice(0, 4)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mate&Co',
    url: 'https://www.mateandcomdp.com.ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.mateandcomdp.com.ar/tienda?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
    <SEO
      canonical="/"
      description="Mates artesanales y personalizados con grabado a medida. Bombillas de alpaca, yerbas seleccionadas y envíos a todo Argentina. Hacé tu mate único con Mate&Co."
      schema={schema}
    />
    <main className="landing">

      {/* ── Hero ── */}
      <section className="landing-hero" style={{ backgroundImage: `url(${c.heroImage || '/hero.jpeg'})` }}>
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <span className="hero-pretitle">{c.heroPretitle}</span>
          <h1 className="landing-hero-title">
            {c.heroTitle?.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}
          </h1>
          <p className="landing-hero-subtitle">{c.heroSubtitle}</p>
          <div className="hero-cta-group">
            <Link to="/tienda" className="btn-primary btn-large">Ver tienda</Link>
            <a href="#nosotros-section" className="btn-outline btn-large">Conocernos</a>
          </div>
        </div>
        <div className="hero-scroll-hint">Explorar</div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Nosotros ── */}
      <section className="about-section" id="nosotros-section">
        <div className="about-inner">
          <div className="about-text">
            <span className="section-pretitle">Nuestra historia</span>
            <h2 className="section-title">{c.aboutTitle}</h2>
            <p>{c.aboutText1}</p>
            <p>{c.aboutText2}</p>
            <Link to="/nosotros" className="btn-secondary">Leer más sobre nosotros</Link>
          </div>
          <div className="about-visual">
            <div className="about-card-stack">
              <div className="about-stat">
                <span className="stat-number">{c.statClientes}</span>
                <span className="stat-label">Clientes felices</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">{c.statArtesanos}</span>
                <span className="stat-label">Artesanos asociados</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">{c.statAnios}</span>
                <span className="stat-label">Años en el mercado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Productos destacados ── */}
      <section className="featured-section">
        <div className="section-header">
          <span className="section-pretitle">Lo más elegido</span>
          <h2 className="section-title">Productos destacados</h2>
        </div>
        <div className="featured-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="featured-cta">
          <Link to="/tienda" className="btn-primary">Ver todos los productos</Link>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-pretitle">Lo que dicen nuestros clientes</span>
          <h2 className="section-title">Ellos ya son parte<br />de la comunidad</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <span className="author-avatar">{t.name[0]}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Banner CTA ── */}
      <section className="cta-banner">
        <h2>¿Listo para empezar tu ritual?</h2>
        <p>Explorá nuestra tienda y encontrá el mate ideal para vos.</p>
        <Link to="/tienda" className="btn-primary btn-large">Ir a la tienda</Link>
      </section>

    </main>
    </>
  )
}
