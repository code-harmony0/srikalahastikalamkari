import { getOrderTotals } from "./order-totals"
import { getPurchasableQuantityLimit, isMadeToOrder } from "./inventory"

/**
 * The server's view of an order. Prices, stock limits and coupon rules all come
 * from database rows passed in here — never from anything the browser sends —
 * so a shopper who edits the checkout request cannot change what they pay.
 */

export interface PricingProduct {
  id: string
  price: number | null
  is_visible?: boolean | null
  stock_quantity?: number | null
}

export interface PricingCoupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number | null
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
}

export interface CartLine {
  productId: string
  quantity: number
}

export type CouponCheck =
  | { ok: true; discount: number }
  | { ok: false; reason: string }

export type PricedOrder =
  | {
      ok: true
      lines: Array<{ productId: string; quantity: number; unitPrice: number }>
      subtotal: number
      discount: number
      shipping: number
      total: number
      couponId: string | null
    }
  | { ok: false; reason: string }

export function validateCoupon(
  coupon: PricingCoupon | null,
  subtotal: number,
  now: Date,
): CouponCheck {
  if (!coupon || !coupon.is_active) {
    return { ok: false, reason: "Invalid coupon code" }
  }
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, reason: "This coupon is not yet active" }
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, reason: "This coupon has expired" }
  }
  if (coupon.usage_limit && (coupon.used_count ?? 0) >= coupon.usage_limit) {
    return { ok: false, reason: "This coupon has reached its usage limit" }
  }
  if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
    return {
      ok: false,
      reason: `Minimum order amount is ₹${coupon.min_order_amount.toLocaleString("en-IN")}`,
    }
  }

  const raw =
    coupon.discount_type === "percentage"
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value
  const capped =
    coupon.discount_type === "percentage" && coupon.max_discount_amount
      ? Math.min(raw, coupon.max_discount_amount)
      : raw

  // Whole rupees, and never more than the order itself.
  return { ok: true, discount: Math.min(Math.round(capped), subtotal) }
}

export function priceOrder({
  items,
  products,
  coupon,
  couponCode,
  now,
}: {
  items: CartLine[]
  products: PricingProduct[]
  coupon: PricingCoupon | null
  couponCode?: string | null
  now: Date
}): PricedOrder {
  if (items.length === 0) {
    return { ok: false, reason: "Your cart is empty" }
  }

  // Repeated lines for one product count together against its stock.
  const quantities = new Map<string, number>()
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { ok: false, reason: "Invalid quantity" }
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
  }

  const productsById = new Map(products.map((product) => [product.id, product]))
  const lines: Array<{ productId: string; quantity: number; unitPrice: number }> = []

  for (const [productId, quantity] of quantities) {
    const product = productsById.get(productId)
    if (!product || product.is_visible === false || !product.price || product.price <= 0) {
      return { ok: false, reason: "An item in your cart is no longer available" }
    }

    // The same limit the cart enforces: stock on hand, or the made-to-order cap.
    const stock = { stock_quantity: product.stock_quantity ?? undefined }
    const limit = getPurchasableQuantityLimit(stock)
    if (quantity > limit) {
      return {
        ok: false,
        reason: isMadeToOrder(stock)
          ? `Made-to-order quantity is limited to ${limit}`
          : `Only ${limit} in stock`,
      }
    }

    lines.push({ productId, quantity, unitPrice: product.price })
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)

  let discount = 0
  let couponId: string | null = null
  if (couponCode) {
    const check = validateCoupon(coupon, subtotal, now)
    if (!check.ok) return check
    discount = check.discount
    couponId = coupon?.id ?? null
  }

  return { ok: true, lines, ...getOrderTotals({ subtotal, discount }), couponId }
}
