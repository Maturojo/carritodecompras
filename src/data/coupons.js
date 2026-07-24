export function normalizeCouponCode(code = '') {
  return String(code).trim().toUpperCase().replace(/\s+/g, '')
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
  if (!normalizeCouponCode(code)) {
    return { ok: false, error: 'Ese cupón no existe o ya no está disponible.' }
  }

  return { ok: true }
}

export function validateCouponRules(coupon, subtotal) {
  if (!coupon) {
    return { ok: false, error: 'Ese cupón no existe o ya no está disponible.' }
  }
  if (coupon.active === false) {
    return { ok: false, coupon, error: 'Ese cupón está desactivado.' }
  }
  const expiresAt = coupon.expiresAt && String(coupon.expiresAt).length === 10
    ? `${coupon.expiresAt}T23:59:59.999`
    : coupon.expiresAt
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return { ok: false, coupon, error: 'Ese cupón ya venció.' }
  }
  if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
    return { ok: false, coupon, error: 'Ese cupón ya alcanzó su límite de usos.' }
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

export function formatCouponMoney(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}
