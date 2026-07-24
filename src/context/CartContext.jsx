import { createContext, useContext, useReducer, useEffect } from 'react'
import { findCoupon, getBestCoupon, getCouponDiscount, validateCoupon } from '../data/coupons'

const CartContext = createContext(null)
const STORAGE_KEY = 'ms_cart'

// Clave única por producto+variante
const itemKey = (item) => item.cartKey || String(item.id)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = itemKey(action.product)
      const existing = state.items.find(i => itemKey(i) === key)
      const stock = action.product.stock ?? 999
      if (existing) {
        if (existing.quantity >= stock) return state // bloqueado por stock
        return { ...state, items: state.items.map(i => itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return { ...state, items: [...state.items, { ...action.product, cartKey: key, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => itemKey(i) !== action.cartKey) }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) return { ...state, items: state.items.filter(i => itemKey(i) !== action.cartKey) }
      const item = state.items.find(i => itemKey(i) === action.cartKey)
      const stock = item?.stock ?? 999
      const qty = Math.min(action.quantity, stock)
      return { ...state, items: state.items.map(i => itemKey(i) === action.cartKey ? { ...i, quantity: qty } : i) }
    }
    case 'APPLY_COUPON':
      return { ...state, coupon: action.coupon }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null }
    case 'CLEAR':
      return { items: [], coupon: null }
    default:
      return state
  }
}

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { items: [], coupon: null }
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed)) return { items: parsed, coupon: null }
    return { items: parsed.items || [], coupon: parsed.coupon || null }
  } catch { return { items: [], coupon: null } }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], coupon: null }, loadCart)
  const { items } = state

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

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
  const applyCoupon = (code) => {
    const result = validateCoupon(code, totalPrice)
    if (!result.ok) return result
    dispatch({ type: 'APPLY_COUPON', coupon: result.coupon })
    return result
  }
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' })
  const generateCoupon = () => {
    const coupon = getBestCoupon(totalPrice)
    dispatch({ type: 'APPLY_COUPON', coupon })
    return validateCoupon(coupon.code, totalPrice)
  }

  const totalItems    = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const activeCoupon = state.coupon ? findCoupon(state.coupon.code) : null
  const discountAmount = getCouponDiscount(activeCoupon, totalPrice)
  const discountedTotal = Math.max(0, totalPrice - discountAmount)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      coupon: activeCoupon,
      discountAmount,
      discountedTotal,
      applyCoupon,
      removeCoupon,
      generateCoupon,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
