import Swal from 'sweetalert2'

const ADMIN_PASS = 'mateshop2025'
const API = '/api'

async function confirmarConPassword(titulo, texto, colorBoton) {
  const { value: pass } = await Swal.fire({
    title: titulo,
    text: texto,
    input: 'password',
    inputLabel: 'Ingresá la contraseña del admin para confirmar',
    inputPlaceholder: 'Contraseña',
    inputAttributes: { autocomplete: 'current-password' },
    showCancelButton: true,
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Confirmar reset',
    confirmButtonColor: colorBoton || '#e63946',
    background: '#261710',
    color: '#F0EBE3',
    inputAttributes: { style: 'background:#321E15;color:#F0EBE3;border:1px solid #4A2C1E;padding:8px 12px;border-radius:8px;width:100%' },
  })
  if (!pass) return false
  if (pass !== ADMIN_PASS) {
    Swal.fire({ title: '❌ Contraseña incorrecta', icon: 'error', background: '#261710', color: '#F0EBE3', confirmButtonColor: '#9c664d' })
    return false
  }
  return true
}

async function resetEstadisticas() {
  const ok = await confirmarConPassword('¿Resetear estadísticas?', 'Se borrarán todos los datos de analytics. No se puede deshacer.')
  if (!ok) return
  localStorage.removeItem('ms_analytics')
  Swal.fire({ title: '✅ Estadísticas reseteadas', icon: 'success', background: '#261710', color: '#F0EBE3', confirmButtonColor: '#9c664d' })
}

async function resetPedidos() {
  const ok = await confirmarConPassword('¿Resetear pedidos?', 'Se eliminarán TODOS los pedidos de la base de datos. No se puede deshacer.')
  if (!ok) return
  await fetch(`${API}/orders?action=reset`, { method: 'DELETE' })
  Swal.fire({ title: '✅ Pedidos reseteados', icon: 'success', background: '#261710', color: '#F0EBE3', confirmButtonColor: '#9c664d' })
}

async function resetClientes() {
  const ok = await confirmarConPassword('¿Resetear clientes?', 'Se eliminarán TODOS los clientes registrados. No se puede deshacer.')
  if (!ok) return
  await fetch(`${API}/users?action=reset`, { method: 'DELETE' })
  Swal.fire({ title: '✅ Clientes reseteados', icon: 'success', background: '#261710', color: '#F0EBE3', confirmButtonColor: '#9c664d' })
}

export default function AdminConfig() {
  return (
    <div className="admin-config">
      <div className="admin-card" style={{ maxWidth: 600 }}>
        <h3 style={{ marginTop: 0, color: '#F0EBE3' }}>⚙️ Configuración general</h3>
        <p style={{ color: '#A89080', fontSize: '0.9rem' }}>
          Contraseña del panel: se configura directamente en el código fuente.
        </p>
      </div>

      <div className="admin-card danger-zone" style={{ maxWidth: 600, border: '1px solid #7f1d1d', marginTop: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#fca5a5' }}>⚠️ Zona de peligro</h3>
        <p style={{ color: '#A89080', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Estas acciones son irreversibles. Se te pedirá la contraseña del admin para confirmar cada una.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(127,29,29,0.15)', borderRadius: '10px', border: '1px solid rgba(127,29,29,0.4)' }}>
            <div>
              <strong style={{ color: '#F0EBE3' }}>Resetear estadísticas</strong>
              <p style={{ margin: '2px 0 0', color: '#A89080', fontSize: '0.8rem' }}>Borra todos los datos de analytics y visitas</p>
            </div>
            <button className="admin-btn-danger" onClick={resetEstadisticas}>🗑️ Resetear</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(127,29,29,0.15)', borderRadius: '10px', border: '1px solid rgba(127,29,29,0.4)' }}>
            <div>
              <strong style={{ color: '#F0EBE3' }}>Resetear pedidos</strong>
              <p style={{ margin: '2px 0 0', color: '#A89080', fontSize: '0.8rem' }}>Elimina todos los pedidos de la base de datos</p>
            </div>
            <button className="admin-btn-danger" onClick={resetPedidos}>🗑️ Resetear</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(127,29,29,0.15)', borderRadius: '10px', border: '1px solid rgba(127,29,29,0.4)' }}>
            <div>
              <strong style={{ color: '#F0EBE3' }}>Resetear clientes</strong>
              <p style={{ margin: '2px 0 0', color: '#A89080', fontSize: '0.8rem' }}>Elimina todos los usuarios registrados</p>
            </div>
            <button className="admin-btn-danger" onClick={resetClientes}>🗑️ Resetear</button>
          </div>

        </div>
      </div>
    </div>
  )
}
