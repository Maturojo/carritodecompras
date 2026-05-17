import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ProductCard'

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
  const featured = products.filter(p => [1, 2, 8, 9].includes(p.id)).slice(0, 4)
  return (
    <main className="landing">

      {/* ── Hero ── */}
      <section className="landing-hero" style={{ backgroundImage: 'url(/hero.jpeg)' }}>
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <span className="hero-pretitle">Industria Argentina</span>
          <h1 className="landing-hero-title">
            El mate perfecto<br />empieza acá
          </h1>
          <p className="landing-hero-subtitle">
            Mates artesanales, bombillas de alpaca, yerbas seleccionadas y termos premium.
            Todo lo que necesitás para tu ritual del mate.
          </p>
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
            <h2 className="section-title">Más que una tienda,<br />una pasión</h2>
            <p>
              MateShop nació de una mesa familiar un domingo a la tarde, con mate en mano y la pregunta de siempre: ¿dónde conseguir buenos mates artesanales sin tener que ir hasta una feria?
            </p>
            <p>
              Hoy trabajamos con artesanos de todo el país para traerte productos únicos que respetan la tradición mateadora. Cada pieza que vendemos la elegimos como si fuera para nuestra propia mesa.
            </p>
            <Link to="/nosotros" className="btn-secondary">Leer más sobre nosotros</Link>
          </div>
          <div className="about-visual">
            <div className="about-card-stack">
              <div className="about-stat">
                <span className="stat-number">+500</span>
                <span className="stat-label">Clientes felices</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">30+</span>
                <span className="stat-label">Artesanos asociados</span>
              </div>
              <div className="about-stat">
                <span className="stat-number">3</span>
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
  )
}
