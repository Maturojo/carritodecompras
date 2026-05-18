import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'ms_cart'

// Clave única por producto+variante
const itemKey = (item) => item.cartKey || String(item.id)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = itemKey(action.product)
      const existing = state.find(i => itemKey(i) === key)
      const stock = action.product.stock ?? 999
      if (existing) {
        if (existing.quantity >= stock) return state // bloqueado por stock
        return state.map(i => itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...state, { ...action.product, cartKey: key, quantity: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => itemKey(i) !== action.cartKey)
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) return state.filter(i => itemKey(i) !== action.cartKey)
      const item = state.find(i => itemKey(i) === action.cartKey)
      const stock = item?.stock ?? 999
      const qty = Math.min(action.quantity, stock)
      return state.map(i => itemKey(i) === action.cartKey ? { ...i, quantity: qty } : i)
    }
    case 'CLEAR':
      return []
    default:
      return state
  }
}

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product) => {
    const key   = product.cartKey || String(product.id)
    const stock = product.stock ?? 999
    const existing = items.find(i => (i.cartKey || String(i.id)) === key)
    if (existing && existing.quantity >= stock) {
      return { ok: false, stock }
    }
    dispatch({ type: 'ADD_ITEM', product })
    return { ok: true }
  }
  const removeItem     = (cartKey)           => dispatch({ type: 'REMOVE_ITEM', cartKey })
  const updateQuantity = (cartKey, quantity)  => dispatch({ type: 'UPDATE_QUANTITY', cartKey, quantity })
  const clearCart      = ()                 => dispatch({ type: 'CLEAR' })

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
