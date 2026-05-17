const team = [
  { name: 'Sofía Martínez', role: 'Fundadora & Curadora', emoji: '👩‍🌾' },
  { name: 'Tomás Herrera', role: 'Artesano principal', emoji: '🧑‍🎨' },
  { name: 'Paula Gómez', role: 'Logística & Envíos', emoji: '👩‍💼' },
]

const timeline = [
  { year: '2022', event: 'Primera venta desde la cocina de casa con 5 mates artesanales.' },
  { year: '2023', event: 'Sumamos 10 artesanos de Misiones, Corrientes y Entre Ríos.' },
  { year: '2024', event: 'Lanzamos la línea de yerbas seleccionadas y superamos los 300 clientes.' },
  { year: '2025', event: 'Abrimos Mate&Co online para llegar a todo el país.' },
]

export default function Nosotros() {
  return (
    <main className="page-content">

      <section className="inner-hero nosotros-hero" style={{ backgroundImage: 'url(/nosotros.jpeg)' }}>
        <div className="inner-hero-overlay" />
        <div className="inner-hero-content">
          <span className="section-pretitle">Quiénes somos</span>
          <h1 className="inner-hero-title">Una historia de mates<br />y pasión artesanal</h1>
          <p className="inner-hero-sub">
            Somos un equipo chico con un amor enorme por la cultura del mate. Creemos que un buen mate empieza con los productos correctos.
          </p>
        </div>
      </section>

      <section className="nosotros-story">
        <div className="story-content">
          <h2>¿Cómo empezó todo?</h2>
          <p>
            Todo comenzó un domingo de 2022. Sofía, nuestra fundadora, estaba cebando unos mates con una calabaza heredada de su abuela y se preguntó por qué era tan difícil encontrar mates de calidad sin tener que ir a una feria artesanal. Ese mismo día empezó a llamar artesanos.
          </p>
          <p>
            Lo que empezó como una venta entre amigos se convirtió rápidamente en algo más grande. Hoy trabajamos con más de 30 artesanos de distintas provincias, cada uno con su técnica y materiales propios.
          </p>
          <p>
            Nuestra misión es simple: acercar el trabajo de los artesanos argentinos a la mesa de cada familia. Que cada mate tenga historia, que cada bombilla tenga alma.
          </p>
        </div>
      </section>

      <section className="timeline-section">
        <h2 className="section-title centered">Nuestro camino</h2>
        <div className="timeline">
          {timeline.map(item => (
            <div key={item.year} className="timeline-item">
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
          {team.map(m => (
            <div key={m.name} className="team-card">
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
          {[
            { icon: '🌿', title: 'Autenticidad', desc: 'Solo vendemos lo que nosotros mismos usaríamos.' },
            { icon: '🤝', title: 'Comunidad', desc: 'Apoyamos a artesanos locales y al comercio justo.' },
            { icon: '♻️', title: 'Sustentabilidad', desc: 'Embalajes reciclables y materiales naturales siempre que es posible.' },
            { icon: '💬', title: 'Cercanía', desc: 'Respondemos cada consulta como si fuera la de un amigo.' },
          ].map(v => (
            <div key={v.title} className="value-card">
              <span className="value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
