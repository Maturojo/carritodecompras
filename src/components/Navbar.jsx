import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import SearchOverlay from './SearchOverlay'

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
)
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function Navbar() {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const links = [
    { to: '/',             label: 'Inicio' },
    { to: '/tienda',       label: 'Tienda' },
    { to: '/personalizar', label: '✨ Personalizá' },
    { to: '/nosotros',     label: 'Nosotros' },
    { to: '/contacto',     label: 'Contacto' },
  ]

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const close = () => { setMenuOpen(false); setUserMenuOpen(false) }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" onClick={close}>
            <span className="logo-text">Mate&amp;Co</span>
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
              <IconSearch />
            </button>

            {/* Modo oscuro */}
            <button className="nav-icon-btn" onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'}>
              {dark ? <IconSun /> : <IconMoon />}
            </button>

            {/* Usuario */}
            <div className="user-menu-wrap">
              <button className="nav-icon-btn" onClick={() => setUserMenuOpen(v => !v)} title="Mi cuenta">
                {user
                  ? <span className="user-avatar-mini">{user.nombre?.[0]?.toUpperCase()}</span>
                  : <IconUser />
                }
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
                      <Link to="/login"    className="user-drop-item" onClick={close}>Iniciar sesión</Link>
                      <Link to="/registro" className="user-drop-item" onClick={close}>Crear cuenta</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <Link
              to="/carrito"
              className={location.pathname === '/carrito' ? 'nav-icon-btn nav-cart active' : 'nav-icon-btn nav-cart'}
              onClick={close}
            >
              <IconCart />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menú">
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
