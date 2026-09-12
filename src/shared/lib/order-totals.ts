/**
 * The one place an order total is worked out. The cart and checkout used to
 * compute it separately and disagreed: the cart added 5% GST on top of prices
 * the product page advertises as tax-inclusive, while checkout — and therefore
 * Razorpay — charged the plain subtotal.
 */

export interface OrderTotals {
  subtotal: number
  discount: number
  shipping: number
  total: number
}

// Every order ships free; checkout has never charged for delivery.
const SHIPPING = 0

export function getOrderTotals({
  subtotal,
  discount = 0,
}: {
  subtotal: number
  discount?: number
}): OrderTotals {
  return {
    subtotal,
    discount,
    shipping: SHIPPING,
    total: Math.max(0, subtotal - discount + SHIPPING),
  }
}
