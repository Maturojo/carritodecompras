import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

const EMPTY_FORM = {
  code: '',
  prefix: 'MATE',
  label: '',
  description: '',
  type: 'percent',
  value: '',
  minSubtotal: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  active: true,
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCoupons = async () => {
    setLoading(true)
    const res = await fetch('/api/products?resource=coupons').catch(() => null)
    const data = res?.ok ? await res.json() : []
    setCoupons(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchCoupons() }, [])

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const handleEdit = (coupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code || '',
      prefix: 'MATE',
      label: coupon.label || '',
      description: coupon.description || '',
      type: coupon.type || 'percent',
      value: coupon.value || '',
      minSubtotal: coupon.minSubtotal || '',
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      active: coupon.active !== false,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editingId ? 'PUT' : 'POST'
    const payload = editingId ? { id: editingId, ...form } : form
    const res = await fetch('/api/products?resource=coupons', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      Swal.fire({ title: 'No se pudo guardar', text: data.error || 'Revisa los datos del cupon.', icon: 'error', confirmButtonColor: '#9c664d' })
      return
    }
    resetForm()
    await fetchCoupons()
    Swal.fire({ title: editingId ? 'Cupon actualizado' : 'Cupon creado', icon: 'success', timer: 1400, showConfirmButton: false })
  }

  const handleToggle = async (coupon) => {
    await fetch('/api/products?resource=coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...coupon, active: coupon.active === false }),
    })
    fetchCoupons()
  }

  const handleDelete = async (coupon) => {
    const ok = await Swal.fire({
      title: `Eliminar ${coupon.code}?`,
      text: 'El cupon dejara de poder usarse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e63946',
    })
    if (!ok.isConfirmed) return
    await fetch('/api/products?resource=coupons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id }),
    })
    fetchCoupons()
  }

  return (
    <div className="admin-coupons">
      <div className="admin-card form-card">
        <div className="admin-card-header">
          <h3>{editingId ? 'Editar cupon' : 'Crear cupon'}</h3>
          {editingId && <button className="admin-btn-secondary small" onClick={resetForm}>Cancelar edicion</button>}
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="admin-form-group">
              <label>Codigo</label>
              <input className="admin-input" name="code" value={form.code} onChange={handleChange} placeholder="Vacio para autogenerar" />
            </div>
            <div className="admin-form-group">
              <label>Prefijo autogenerado</label>
              <input className="admin-input" name="prefix" value={form.prefix} onChange={handleChange} disabled={!!editingId} />
            </div>
          </div>

          <div className="form-row">
            <div className="admin-form-group">
              <label>Nombre visible</label>
              <input className="admin-input" name="label" value={form.label} onChange={handleChange} placeholder="10% OFF" />
            </div>
            <div className="admin-form-group">
              <label>Tipo</label>
              <select className="admin-input" name="type" value={form.type} onChange={handleChange}>
                <option value="percent">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="admin-form-group">
              <label>Valor</label>
              <input className="admin-input" name="value" type="number" min="0" value={form.value} onChange={handleChange} required placeholder={form.type === 'percent' ? '10' : '5000'} />
            </div>
            <div className="admin-form-group">
              <label>Compra minima</label>
              <input className="admin-input" name="minSubtotal" type="number" min="0" value={form.minSubtotal} onChange={handleChange} placeholder="30000" />
            </div>
          </div>

          <div className="form-row">
            <div className="admin-form-group">
              <label>Tope descuento</label>
              <input className="admin-input" name="maxDiscount" type="number" min="0" value={form.maxDiscount} onChange={handleChange} placeholder="Solo para porcentajes" />
            </div>
            <div className="admin-form-group">
              <label>Limite de usos</label>
              <input className="admin-input" name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={handleChange} placeholder="Sin limite" />
            </div>
          </div>

          <div className="form-row">
            <div className="admin-form-group">
              <label>Vence</label>
              <input className="admin-input" name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} />
            </div>
            <label className="admin-toggle-row">
              <input className="admin-toggle-checkbox" name="active" type="checkbox" checked={form.active} onChange={handleChange} />
              Cupon activo
            </label>
          </div>

          <div className="admin-form-group">
            <label>Descripcion</label>
            <input className="admin-input" name="description" value={form.description} onChange={handleChange} placeholder="Texto que vera el cliente" />
          </div>

          <div className="form-actions">
            <button className="admin-btn-primary" type="submit">{editingId ? 'Guardar cambios' : 'Crear cupon'}</button>
            <button className="admin-btn-secondary" type="button" onClick={() => setForm(prev => ({ ...prev, code: '' }))}>Autogenerar codigo</button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Cupones creados</h3>
          <span className="admin-badge">{coupons.length} total</span>
        </div>

        {loading ? (
          <p className="admin-empty">Cargando cupones...</p>
        ) : coupons.length === 0 ? (
          <p className="admin-empty">Todavia no hay cupones.</p>
        ) : (
          <div className="products-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Descuento</th>
                  <th>Condicion</th>
                  <th>Uso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon.id}>
                    <td className="product-name-cell">{coupon.code}</td>
                    <td>{coupon.type === 'percent' ? `${coupon.value}%` : formatPrice(coupon.value)}</td>
                    <td>{coupon.minSubtotal ? `Desde ${formatPrice(coupon.minSubtotal)}` : 'Sin minimo'}</td>
                    <td>{coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                    <td>
                      <span className={coupon.active === false ? 'stock-low' : 'cat-tag'}>
                        {coupon.active === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => handleEdit(coupon)}>Editar</button>
                        <button className="action-btn edit" onClick={() => handleToggle(coupon)}>
                          {coupon.active === false ? 'Activar' : 'Pausar'}
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(coupon)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
