import SEO from '../components/SEO'
import { useContent } from '../context/ContentContext'

export default function Nosotros() {
  const { content } = useContent()
  const c = content.nosotros

  return (
    <>
    <SEO
      title="Nosotros — La historia de Mate&Co"
      canonical="/nosotros"
      description="Somos una tienda de mates artesanales fundada en 2022. Trabajamos con artesanos de Misiones, Corrientes y Entre Ríos para traerte los mejores mates del país."
    />
    <main className="page-content">

      <section className="inner-hero nosotros-hero" style={{ backgroundImage: `url(${c.heroImage || '/nosotros.jpeg'})` }}>
        <div className="inner-hero-overlay" />
        <div className="inner-hero-content">
          <span className="section-pretitle">Quiénes somos</span>
          <h1 className="inner-hero-title">{c.heroTitle || 'Una historia de mates y pasión artesanal'}</h1>
          <p className="inner-hero-sub">{c.heroSubtitle}</p>
        </div>
      </section>

      <section className="nosotros-story">
        <div className="story-content">
          <h2>{c.storyTitle || '¿Cómo empezó todo?'}</h2>
          <p>{c.storyText1}</p>
          <p>{c.storyText2}</p>
          <p>{c.storyText3}</p>
        </div>
      </section>

      <section className="timeline-section">
        <h2 className="section-title centered">Nuestro camino</h2>
        <div className="timeline">
          {c.timeline.map((item, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-year">{item.year}</div>
              <div className="timeline-dot" />
              <div className="timeline-event">{item.event}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="team-section">
        <h2 className="section-title centered">El equipo</h2>
        <div className="team-grid">
          {c.team.map((m, i) => (
            <div key={i} className="team-card">
              <div className="team-avatar">{m.emoji}</div>
              <h3>{m.name}</h3>
              <span>{m.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="values-section">
        <h2 className="section-title centered">Nuestros valores</h2>
        <div className="values-grid">
          {c.values.map((v, i) => (
            <div key={i} className="value-card">
              <span className="value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
    </>
  )
}
