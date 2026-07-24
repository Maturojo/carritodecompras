export const COUPONS = [
  {
    code: 'BIENVENIDO10',
    label: '10% OFF',
    description: 'Para tu primera compra online.',
    type: 'percent',
    value: 10,
    minSubtotal: 15000,
    maxDiscount: 8000,
  },
  {
    code: 'MATE15',
    label: '15% OFF',
    description: 'Ideal para compras grandes.',
    type: 'percent',
    value: 15,
    minSubtotal: 45000,
    maxDiscount: 15000,
  },
  {
    code: 'LOCAL5000',
    label: '$5.000 OFF',
    description: 'Cupón especial para clientes de Mar del Plata.',
    type: 'fixed',
    value: 5000,
    minSubtotal: 30000,
  },
]

export function normalizeCouponCode(code = '') {
  return String(code).trim().toUpperCase().replace(/\s+/g, '')
}

export function findCoupon(code) {
  const normalized = normalizeCouponCode(code)
  return COUPONS.find(coupon => coupon.code === normalized) || null
}

export function getCouponDiscount(coupon, subtotal) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0)
  if (!coupon || safeSubtotal <= 0) return 0
  if (safeSubtotal < (coupon.minSubtotal || 0)) return 0

  const rawDiscount = coupon.type === 'percent'
    ? safeSubtotal * (coupon.value / 100)
    : coupon.value

  const capped = coupon.maxDiscount
    ? Math.min(rawDiscount, coupon.maxDiscount)
    : rawDiscount

  return Math.min(safeSubtotal, Math.round(capped))
}

export function validateCoupon(code, subtotal) {
  const coupon = findCoupon(code)
  if (!coupon) {
    return { ok: false, error: 'Ese cupón no existe o ya no está disponible.' }
  }

  if ((Number(subtotal) || 0) < (coupon.minSubtotal || 0)) {
    return {
      ok: false,
      coupon,
      error: `Este cupón requiere una compra mínima de ${formatCouponMoney(coupon.minSubtotal)}.`,
    }
  }

  return {
    ok: true,
    coupon,
    discount: getCouponDiscount(coupon, subtotal),
  }
}

export function getBestCoupon(subtotal) {
  const eligible = COUPONS
    .map(coupon => ({ coupon, discount: getCouponDiscount(coupon, subtotal) }))
    .filter(item => item.discount > 0)
    .sort((a, b) => b.discount - a.discount)

  return eligible[0]?.coupon || COUPONS[0]
}

export function formatCouponMoney(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}
