import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider }    from 'react-helmet-async'
import { CartProvider }      from './context/CartContext'
import { AnalyticsProvider } from './context/AnalyticsContext'
import { StoreProvider }     from './context/StoreContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { ThemeProvider }     from './context/ThemeContext'
import { ContentProvider }   from './context/ContentContext'
import { AuthProvider }      from './context/AuthContext'
import Navbar          from './components/Navbar'
import Footer          from './components/Footer'
import ScrollToTop     from './components/ScrollToTop'
import WhatsAppButton  from './components/WhatsAppButton'
import Landing       from './pages/Landing'
import Tienda        from './pages/Home'
import Nosotros      from './pages/Nosotros'
import Contacto      from './pages/Contacto'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import ProductDetail from './pages/ProductDetail'
import Login         from './pages/Login'
import Register      from './pages/Register'
import MiCuenta      from './pages/MiCuenta'
import AdminPanel    from './pages/admin/AdminPanel'
import PagoExitoso  from './pages/PagoExitoso'
import PagoFallido  from './pages/PagoFallido'
import PagoPendiente from './pages/PagoPendiente'

function PublicSite() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/tienda"    element={<Tienda />} />
        <Route path="/tienda/:id" element={<ProductDetail />} />
        <Route path="/nosotros"  element={<Nosotros />} />
        <Route path="/contacto"  element={<Contacto />} />
        <Route path="/carrito"   element={<Cart />} />
        <Route path="/checkout"  element={<Checkout />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/registro"  element={<Register />} />
        <Route path="/mi-cuenta"     element={<MiCuenta />} />
        <Route path="/pago-exitoso"   element={<PagoExitoso />} />
        <Route path="/pago-fallido"   element={<PagoFallido />} />
        <Route path="/pago-pendiente" element={<PagoPendiente />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
      <ContentProvider>
      <AnalyticsProvider>
        <StoreProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/admin/*" element={<AdminPanel />} />
                    <Route path="/*"       element={<PublicSite />} />
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </StoreProvider>
      </AnalyticsProvider>
      </ContentProvider>
    </ThemeProvider>
    </HelmetProvider>
  )
}
