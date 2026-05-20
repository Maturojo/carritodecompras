import { useState, useEffect } from 'react'
import { useStore } from '../../context/StoreContext'
import { exportToExcel, importFromExcel } from '../../utils/excel'

// ── Generador de SKU ──────────────────────────────────────────────
// Formato: [CAT]-[NOM]-[NNN]  ej: MAT-CAL-001, BOM-SIL-003
function generateSku(name, category, products, editingId) {
  const prefix = (cat) => {
    const MAP = {
      mates: 'MAT', bombillas: 'BOM', yerbas: 'YER',
      termos: 'TER', kits: 'KIT',
    }
    return MAP[cat] || (cat || 'PRO').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
  }
  const nameSlug = (name || '')
    .trim()
    .split(/\s+/)[0]                     // primera palabra
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // sin tildes
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase() || 'PRO'

  const base = `${prefix(category)}-${nameSlug}`

  const existingSkus = new Set(
    products
      .filter(p => p.id !== editingId)
      .map(p => (p.sku || '').toUpperCase())
      .filter(Boolean)
  )

  let n = 1
  let sku = `${base}-${String(n).padStart(3, '0')}`
  while (existingSkus.has(sku)) {
    n++
    sku = `${base}-${String(n).padStart(3, '0')}`
  }
  return sku
}

function skuIsDuplicate(sku, products, editingId) {
  if (!sku?.trim()) return false
  return products
    .filter(p => p.id !== editingId)
    .some(p => (p.sku || '').toUpperCase() === sku.trim().toUpperCase())
}

const newVariant = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2),
  name: '',
  price: '',
  stock: '',
  images: [''],
})

const emptyForm = (firstCat = 'mates') => ({
  name: '',
  sku: '',
  description: '',
  category: firstCat,
  variants: [newVariant()],
})

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, updateCategory, deleteCategory } = useStore()
  const [showForm, setShowForm]           = useState(false)
  const [editingId, setEditingId]         = useState(null)
  const [form, setForm]                   = useState(emptyForm())
  const [search, setSearch]               = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [importMsg, setImportMsg]         = useState(null)
  const [openVariant, setOpenVariant]     = useState(0)
  const [showCats, setShowCats]           = useState(false)
  const [newCatLabel, setNewCatLabel]     = useState('')
  const [editingCat, setEditingCat]       = useState(null) // { id, label }
  const [skuError, setSkuError]           = useState('')

  // Validar SKU en tiempo real cuando cambia el form
  useEffect(() => {
    if (!form.sku?.trim()) { setSkuError(''); return }
    if (skuIsDuplicate(form.sku, products, editingId)) {
      setSkuError('⚠️ Este código ya está en uso por otro producto.')
    } else {
      setSkuError('')
    }
  }, [form.sku, products, editingId])

  const formatPrice = (n) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  /* ── Export / Import Excel ── */
  const handleExport = () => {
    // Una fila por variante
    const rows = products.flatMap(p => {
      const variants = p.variants?.length ? p.variants : [{ name: 'Única', price: p.price, stock: p.stock, images: [p.image] }]
      return variants.map(v => ({
        'Nombre':       p.name,
        'Código':       p.sku || '',
        'Descripción':  p.description,
        'Categoría':    p.category,
        'Variante':     v.name,
        'Precio':       v.price,
        'Stock':        v.stock,
        'Imágenes':     (v.images || []).join(' | '),
      }))
    })
    exportToExcel(rows, 'Productos', 'mateshop-productos')
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportMsg('⏳ Importando productos...')
    try {
      const rows = await importFromExcel(file)

      // Agrupar filas por nombre de producto
      const map = new Map()
      rows.forEach(r => {
        const nombre = String(r['Nombre'] || '').trim()
        if (!nombre) return
        if (!map.has(nombre)) {
          map.set(nombre, {
            name:        nombre,
            skuFromExcel: String(r['Código'] || '').trim().toUpperCase(), // SKU opcional desde Excel
            description: r['Descripción'] || '',
            category:    (r['Categoría'] || 'otros').toLowerCase().trim(),
            variants:    [],
          })
        }
        map.get(nombre).variants.push({
          id:     Date.now().toString() + Math.random().toString(36).slice(2),
          name:   String(r['Variante'] || 'Única').trim(),
          price:  Number(r['Precio']) || 0,
          stock:  Number(r['Stock'])  || 0,
          images: r['Imágenes'] ? String(r['Imágenes']).split(' | ').map(s => s.trim()).filter(Boolean) : [],
        })
      })

      // Asignar SKU único a cada producto
      // usedSkus = los ya existentes en BD + los que vamos generando en este lote
      const usedSkus = new Set(products.map(p => (p.sku || '').toUpperCase()).filter(Boolean))

      const getUniqueSku = (name, category, preferred) => {
        // Si vino un código del Excel y no está repetido, usarlo
        if (preferred && !usedSkus.has(preferred)) return preferred

        // Generar base: CAT-NOM
        const prefix = (cat) => {
          const MAP = { mates:'MAT', bombillas:'BOM', yerbas:'YER', termos:'TER', kits:'KIT' }
          return MAP[cat] || (cat||'PRO').replace(/[^a-zA-Z]/g,'').slice(0,3).toUpperCase()
        }
        const nameSlug = (name||'').trim().split(/\s+/)[0]
          .normalize('NFD').replace(/[̀-ͯ]/g,'')
          .replace(/[^a-zA-Z]/g,'').slice(0,3).toUpperCase() || 'PRO'
        const base = `${prefix(category)}-${nameSlug}`

        let n = 1
        let sku = `${base}-${String(n).padStart(3,'0')}`
        while (usedSkus.has(sku)) { n++; sku = `${base}-${String(n).padStart(3,'0')}` }
        return sku
      }

      const productos = Array.from(map.values()).map(({ skuFromExcel, ...p }) => {
        const sku = getUniqueSku(p.name, p.category, skuFromExcel)
        usedSkus.add(sku) // reservar para los siguientes del lote
        return { ...p, sku }
      })

      // Guardar TODOS en MongoDB
      await Promise.all(productos.map(p => addProduct(p)))
      setImportMsg(`✅ ${productos.length} productos importados correctamente`)
    } catch (err) {
      console.error('Error importando:', err)
      setImportMsg('❌ Error al importar. Revisá el archivo Excel.')
    }
    setTimeout(() => setImportMsg(null), 5000)
    e.target.value = ''
  }

  /* ── Form base ── */
  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  /* ── Variants ── */
  const addVariant = () => {
    const v = newVariant()
    setForm(f => ({ ...f, variants: [...f.variants, v] }))
    setOpenVariant(form.variants.length)
  }

  const removeVariant = (vid) =>
    setForm(f => ({ ...f, variants: f.variants.filter(v => v.id !== vid) }))

  const updateVariant = (vid, field, value) =>
    setForm(f => ({
      ...f,
      variants: f.variants.map(v => v.id === vid ? { ...v, [field]: value } : v),
    }))

  /* ── Images per variant ── */
  const addImage   = (vid) =>
    setForm(f => ({ ...f, variants: f.variants.map(v => v.id === vid ? { ...v, images: [...v.images, ''] } : v) }))

  const removeImage = (vid, idx) =>
    setForm(f => ({ ...f, variants: f.variants.map(v => v.id === vid ? { ...v, images: v.images.filter((_, i) => i !== idx) } : v) }))

  const updateImage = (vid, idx, value) =>
    setForm(f => ({
      ...f,
      variants: f.variants.map(v =>
        v.id === vid ? { ...v, images: v.images.map((img, i) => i === idx ? value : img) } : v
      ),
    }))

  /* ── Categories ── */
  const handleAddCat = async () => {
    if (!newCatLabel.trim()) return
    await addCategory(newCatLabel.trim())
    setNewCatLabel('')
  }
  const handleSaveCat = async () => {
    if (!editingCat?.label?.trim()) return
    await updateCategory(editingCat.id, editingCat.label)
    setEditingCat(null)
  }
  const handleDeleteCat = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await deleteCategory(id)
  }

  /* ── Edit ── */
  const handleEdit = (product) => {
    const variants = product.variants?.length
      ? product.variants.map(v => ({
          ...v,
          price:  String(v.price),
          stock:  String(v.stock),
          images: v.images?.length ? v.images : [''],
        }))
      : [{ ...newVariant(), name: 'Única', price: String(product.price || ''), stock: String(product.stock || ''), images: [product.image || ''] }]

    setForm({ name: product.name, sku: product.sku || '', description: product.description || '', category: product.category || 'mates', variants })
    setEditingId(product.id)
    setOpenVariant(0)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault()
    if (skuError) return
    const cleanVariants = form.variants.map(v => ({
      ...v,
      price:  Number(v.price),
      stock:  Number(v.stock),
      images: v.images.filter(img => img.trim() !== ''),
    }))
    const data = {
      ...form,
      variants: cleanVariants,
      price: cleanVariants[0]?.price  || 0,
      stock: cleanVariants[0]?.stock  || 0,
      image: cleanVariants[0]?.images[0] || '',
    }
    if (editingId) updateProduct(editingId, data)
    else           addProduct(data)
    setForm(emptyForm())
    setEditingId(null)
    setShowForm(false)
  }

  const handleCancel = () => { setForm(emptyForm()); setEditingId(null); setShowForm(false) }
  const handleDelete = (id) => { deleteProduct(id); setConfirmDelete(null) }

  /* ── Asignar SKU a productos sin código ── */
  const handleAsignarSkus = async () => {
    const sinSku = products.filter(p => !p.sku?.trim())
    if (!sinSku.length) { setImportMsg('✅ Todos los productos ya tienen código.'); setTimeout(() => setImportMsg(null), 3000); return }

    setImportMsg(`⏳ Asignando códigos a ${sinSku.length} productos...`)

    const usedSkus = new Set(products.map(p => (p.sku || '').toUpperCase()).filter(Boolean))

    for (const p of sinSku) {
      const sku = generateSku(p.name, p.category, [], null).replace(/-\d+$/, '')
      let n = 1
      let newSku = `${sku}-${String(n).padStart(3, '0')}`
      while (usedSkus.has(newSku)) { n++; newSku = `${sku}-${String(n).padStart(3, '0')}` }
      usedSkus.add(newSku)
      await updateProduct(p.id, { ...p, sku: newSku })
    }

    setImportMsg(`✅ ${sinSku.length} productos actualizados con código.`)
    setTimeout(() => setImportMsg(null), 4000)
  }

  const catOptions = categories.filter(c => c.id !== 'todos')
  const filtered   = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="admin-products">

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input className="admin-search" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="toolbar-actions">
          <a className="admin-btn-secondary" href="/plantilla-productos.xlsx" download>📋 Plantilla</a>
          <button className="admin-btn-secondary" onClick={handleExport}>⬇️ Exportar</button>
          <label className="admin-btn-secondary" style={{ cursor: 'pointer' }}>
            ⬆️ Importar
            <input type="file" accept=".xlsx,.xls,.json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          {products.some(p => !p.sku?.trim()) && (
            <button className="admin-btn-secondary" onClick={handleAsignarSkus} title="Generar códigos para productos que no tienen">
              🏷️ Asignar códigos faltantes ({products.filter(p => !p.sku?.trim()).length})
            </button>
          )}
          <button className="admin-btn-primary" onClick={() => { setForm(emptyForm()); setEditingId(null); setOpenVariant(0); setShowForm(true) }}>
            + Nuevo producto
          </button>
        </div>
      </div>

      {importMsg && <div className="import-msg">{importMsg}</div>}

      {/* ── Gestor de categorías ── */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <div className="cat-manager-header" onClick={() => setShowCats(v => !v)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>🏷️ Categorías</h3>
          <span>{showCats ? '▲' : '▼'}</span>
        </div>
        {showCats && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {catOptions.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingCat?.id === c.id ? (
                  <>
                    <input className="admin-input" style={{ flex: 1 }} value={editingCat.label} onChange={e => setEditingCat(ec => ({ ...ec, label: e.target.value }))} />
                    <button className="admin-btn-primary small" onClick={handleSaveCat}>Guardar</button>
                    <button className="admin-btn-secondary small" onClick={() => setEditingCat(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{c.label} <span style={{ fontSize: '0.75rem', color: '#888' }}>({c.id})</span></span>
                    <button className="action-btn edit" onClick={() => setEditingCat({ id: c.id, label: c.label })}>✏️</button>
                    <button className="action-btn delete" onClick={() => handleDeleteCat(c.id)}>🗑️</button>
                  </>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input className="admin-input" style={{ flex: 1 }} placeholder="Nueva categoría..." value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCat()} />
              <button className="admin-btn-primary" onClick={handleAddCat}>+ Agregar</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Formulario ── */}
      {showForm && (
        <div className="admin-card form-card">
          <h3>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
          <form className="product-form" onSubmit={handleSubmit}>

            {/* Base */}
            <div className="form-row">
              <div className="admin-form-group">
                <label>Nombre *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="admin-input" placeholder="Mate de calabaza..." />
              </div>
              <div className="admin-form-group">
                <label>Código / SKU</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    className={`admin-input${skuError ? ' input-error' : ''}`}
                    placeholder="MAT-CAL-001"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    className="admin-btn-secondary small"
                    title="Generar código automático"
                    onClick={() => {
                      const sku = generateSku(form.name, form.category, products, editingId)
                      setForm(f => ({ ...f, sku }))
                    }}
                  >
                    ✨ Generar
                  </button>
                </div>
                {skuError && <span className="sku-error-msg">{skuError}</span>}
                {!skuError && form.sku && (
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px', display: 'block' }}>
                    ✓ Código disponible
                  </span>
                )}
              </div>
              <div className="admin-form-group">
                <label>Categoría *</label>
                <select name="category" value={form.category} onChange={handleChange} className="admin-input">
                  {catOptions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-group">
              <label>Descripción *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required className="admin-input admin-textarea" rows={3} placeholder="Descripción del producto..." />
            </div>

            {/* ── Variantes ── */}
            <div className="variants-section">
              <div className="variants-header">
                <h4>Variantes <span className="variant-count">{form.variants.length}</span></h4>
                <button type="button" className="admin-btn-secondary small" onClick={addVariant}>+ Agregar variante</button>
              </div>

              {form.variants.map((v, idx) => (
                <div key={v.id} className={`variant-card ${openVariant === idx ? 'open' : ''}`}>
                  <div className="variant-card-header" onClick={() => setOpenVariant(openVariant === idx ? -1 : idx)}>
                    <span className="variant-toggle">{openVariant === idx ? '▼' : '▶'}</span>
                    <span className="variant-label">{v.name || `Variante ${idx + 1}`}</span>
                    {v.price && <span className="variant-price-preview">{formatPrice(Number(v.price))}</span>}
                    {form.variants.length > 1 && (
                      <button type="button" className="variant-remove-btn" onClick={e => { e.stopPropagation(); removeVariant(v.id) }}>✕</button>
                    )}
                  </div>

                  {openVariant === idx && (
                    <div className="variant-body">
                      <div className="form-row">
                        <div className="admin-form-group">
                          <label>Nombre de la variante *</label>
                          <input value={v.name} onChange={e => updateVariant(v.id, 'name', e.target.value)} required className="admin-input" placeholder="Ej: Natural 250ml, Rojo, Grande..." />
                        </div>
                        <div className="admin-form-group">
                          <label>Precio (ARS) *</label>
                          <input type="number" value={v.price} onChange={e => updateVariant(v.id, 'price', e.target.value)} required min="0" className="admin-input" placeholder="2500" />
                        </div>
                        <div className="admin-form-group">
                          <label>Stock *</label>
                          <input type="number" value={v.stock} onChange={e => updateVariant(v.id, 'stock', e.target.value)} required min="0" className="admin-input" placeholder="10" />
                        </div>
                      </div>

                      {/* Imágenes */}
                      <div className="admin-form-group">
                        <label>Imágenes (URLs)</label>
                        <div className="images-list">
                          {v.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="image-row">
                              <input
                                value={img}
                                onChange={e => updateImage(v.id, imgIdx, e.target.value)}
                                className="admin-input"
                                placeholder="https://..."
                              />
                              {img && <img src={img} alt="" className="image-thumb" onError={e => e.target.style.display='none'} />}
                              {v.images.length > 1 && (
                                <button type="button" className="img-remove-btn" onClick={() => removeImage(v.id, imgIdx)}>✕</button>
                              )}
                            </div>
                          ))}
                          <button type="button" className="admin-btn-secondary small" onClick={() => addImage(v.id)}>
                            + Agregar imagen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="admin-btn-primary" disabled={!!skuError}>
                {editingId ? 'Guardar cambios' : 'Agregar producto'}
              </button>
              <button type="button" className="admin-btn-secondary" onClick={handleCancel}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="admin-card">
        <p className="admin-count">{filtered.length} productos</p>
        <div className="products-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Imagen</th><th>Nombre</th><th>Código</th><th>Categoría</th><th>Variantes</th><th>Precio desde</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const firstVariant = p.variants?.[0]
                const minPrice = p.variants?.length ? Math.min(...p.variants.map(v => v.price)) : p.price
                const img = firstVariant?.images?.[0] || p.image || ''
                return (
                  <tr key={p.id}>
                    <td><img src={img || 'https://placehold.co/48x48/e8e0d5/888?text=?'} alt={p.name} className="table-product-img" /></td>
                    <td className="product-name-cell">{p.name}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#9c664d' }}>{p.sku || '—'}</span></td>
                    <td><span className="cat-tag">{p.category}</span></td>
                    <td><span className="variant-badge">{p.variants?.length || 1} variante{(p.variants?.length || 1) !== 1 ? 's' : ''}</span></td>
                    <td className="price-cell">{formatPrice(minPrice)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => handleEdit(p)}>✏️ Editar</button>
                        <button className="action-btn delete" onClick={() => setConfirmDelete(p.id)}>🗑️ Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="admin-btn-danger" onClick={() => handleDelete(confirmDelete)}>Eliminar</button>
              <button className="admin-btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
