import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src="/logo.jpeg" alt="Mate&Co" className="footer-logo-img" />
          </Link>
          <p>Todo lo que necesitás para tu ritual del mate. Artesanal, argentino, con amor.</p>
        </div>

        <div className="footer-col">
          <h4>Tienda</h4>
          <Link to="/tienda">Todos los productos</Link>
          <Link to="/tienda">Mates</Link>
          <Link to="/tienda">Bombillas</Link>
          <Link to="/tienda">Yerbas</Link>
        </div>

        <div className="footer-col">
          <h4>Info</h4>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
          <Link to="/contacto">Preguntas frecuentes</Link>
        </div>

        <div className="footer-col">
          <h4>Seguinos</h4>
          <a href="https://www.instagram.com/by.mateandco/" target="_blank" rel="noopener noreferrer" className="footer-social-link">
            <span>📸</span> Instagram
          </a>
          <a href="https://wa.me/5492236359767" target="_blank" rel="noopener noreferrer" className="footer-social-link">
            <span>💬</span> WhatsApp
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Mate&amp;Co. Hecho con 🧉 en Argentina.</p>
      </div>
    </footer>
  )
}
