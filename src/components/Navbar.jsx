import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import SearchOverlay from './SearchOverlay'

export default function Navbar() {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const links = [
    { to: '/',          label: 'Inicio' },
    { to: '/tienda',    label: 'Tienda' },
    { to: '/nosotros',  label: 'Nosotros' },
    { to: '/contacto',  label: 'Contacto' },
  ]

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const close = () => { setMenuOpen(false); setUserMenuOpen(false) }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={close}>
            <span className="logo-icon">🧉</span>
            <span className="logo-text">MateShop</span>
          </Link>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={isActive(l.to) ? 'nav-link active' : 'nav-link'}
                onClick={close}
              >{l.label}</Link>
            ))}
          </div>

          <div className="navbar-actions">
            {/* Buscador */}
            <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} title="Buscar">
              🔍
            </button>

            {/* Modo oscuro */}
            <button className="nav-icon-btn" onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'}>
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Usuario */}
            <div className="user-menu-wrap">
              <button className="nav-icon-btn" onClick={() => setUserMenuOpen(v => !v)} title="Mi cuenta">
                {user ? <span className="user-avatar-mini">{user.nombre?.[0]?.toUpperCase()}</span> : '👤'}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  {user ? (
                    <>
                      <p className="user-drop-name">Hola, {user.nombre.split(' ')[0]}</p>
                      <Link to="/mi-cuenta" className="user-drop-item" onClick={close}>📦 Mis pedidos</Link>
                      <Link to="/mi-cuenta" className="user-drop-item" onClick={close}>👤 Mi perfil</Link>
                      <button className="user-drop-item user-drop-logout" onClick={() => { logout(); close() }}>🚪 Salir</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login"   className="user-drop-item" onClick={close}>Iniciar sesión</Link>
                      <Link to="/registro" className="user-drop-item" onClick={close}>Crear cuenta</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <Link
              to="/carrito"
              className={location.pathname === '/carrito' ? 'nav-link nav-cart active' : 'nav-link nav-cart'}
              onClick={close}
            >
              🛒 {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menú">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
