import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const StoreContext = createContext(null)

const API = '/api'

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)

  // ── Carga inicial desde MongoDB ──
  useEffect(() => {
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/orders`).then(r => r.json()),
    ]).then(([prods, ords]) => {
      setProducts(Array.isArray(prods) ? prods : [])
      setOrders(Array.isArray(ords) ? ords : [])
    }).catch(err => console.error('Error cargando datos:', err))
      .finally(() => setLoading(false))
  }, [])

  // ── Products CRUD ──
  const addProduct = useCallback(async (product) => {
    const res = await fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
    const newProduct = await res.json()
    setProducts(prev => [...prev, newProduct])
    return newProduct
  }, [])

  const updateProduct = useCallback(async (id, data) => {
    await fetch(`${API}/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, ...data, price: Number(data.price), stock: Number(data.stock) } : p
    ))
  }, [])

  const deleteProduct = useCallback(async (id) => {
    await fetch(`${API}/products`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  // ── Orders ──
  const addOrder = useCallback(async (order) => {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
    const newOrder = await res.json()
    setOrders(prev => [newOrder, ...prev])
    return newOrder
  }, [])

  const updateOrderStatus = useCallback(async (id, status) => {
    await fetch(`${API}/orders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }, [])

  return (
    <StoreContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      orders, addOrder, updateOrderStatus,
      loading,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}
