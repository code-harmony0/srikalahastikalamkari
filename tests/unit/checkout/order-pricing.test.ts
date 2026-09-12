import { priceOrder, validateCoupon, type PricingCoupon } from "@/shared/lib/order-pricing"

const NOW = new Date("2026-09-13T10:00:00Z")

const products = [
  { id: "saree", price: 12999, is_visible: true, stock_quantity: 3 },
  { id: "dupatta", price: 1899, is_visible: true, stock_quantity: 20 },
  { id: "hidden", price: 5000, is_visible: false, stock_quantity: 5 },
  // Nothing in stock: made to order, which the cart allows up to 10 of.
  { id: "custom", price: 8000, is_visible: true, stock_quantity: 0 },
]

const coupon = (overrides: Partial<PricingCoupon> = {}): PricingCoupon => ({
  id: "c1",
  code: "FESTIVE",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: null,
  max_discount_amount: null,
  usage_limit: null,
  used_count: 0,
  starts_at: null,
  expires_at: null,
  is_active: true,
  ...overrides,
})

describe("priceOrder", () => {
  it("prices every line from the database, never from the browser", () => {
    const result = priceOrder({
      items: [
        { productId: "saree", quantity: 2 },
        { productId: "dupatta", quantity: 1 },
      ],
      products,
      coupon: null,
      now: NOW,
    })

    expect(result).toMatchObject({ ok: true, subtotal: 27897, discount: 0, total: 27897 })
  })

  it("merges repeated lines for the same product", () => {
    const result = priceOrder({
      items: [
        { productId: "saree", quantity: 1 },
        { productId: "saree", quantity: 1 },
      ],
      products,
      coupon: null,
      now: NOW,
    })

    expect(result).toMatchObject({
      ok: true,
      lines: [{ productId: "saree", quantity: 2, unitPrice: 12999 }],
    })
  })

  it("rejects a product that is hidden or does not exist", () => {
    expect(
      priceOrder({ items: [{ productId: "hidden", quantity: 1 }], products, coupon: null, now: NOW }).ok,
    ).toBe(false)
    expect(
      priceOrder({ items: [{ productId: "nope", quantity: 1 }], products, coupon: null, now: NOW }).ok,
    ).toBe(false)
  })

  it("rejects zero, negative and fractional quantities", () => {
    for (const quantity of [0, -1, 1.5]) {
      expect(
        priceOrder({ items: [{ productId: "saree", quantity }], products, coupon: null, now: NOW }).ok,
      ).toBe(false)
    }
  })

  it("uses the same stock limit as the cart, counting repeated lines together", () => {
    expect(
      priceOrder({
        items: [
          { productId: "saree", quantity: 2 },
          { productId: "saree", quantity: 2 },
        ],
        products,
        coupon: null,
        now: NOW,
      }),
    ).toEqual({ ok: false, reason: "Only 3 in stock" })
  })

  it("allows up to 10 of a made-to-order piece, not more", () => {
    expect(
      priceOrder({ items: [{ productId: "custom", quantity: 10 }], products, coupon: null, now: NOW }),
    ).toMatchObject({ ok: true, total: 80000 })
    expect(
      priceOrder({ items: [{ productId: "custom", quantity: 11 }], products, coupon: null, now: NOW }),
    ).toEqual({ ok: false, reason: "Made-to-order quantity is limited to 10" })
  })

  it("rejects an empty cart", () => {
    expect(priceOrder({ items: [], products, coupon: null, now: NOW }).ok).toBe(false)
  })

  it("applies a valid coupon when a code is given", () => {
    const result = priceOrder({
      items: [{ productId: "saree", quantity: 1 }],
      products,
      coupon: coupon(),
      couponCode: "FESTIVE",
      now: NOW,
    })

    expect(result).toMatchObject({ ok: true, discount: 1300, total: 11699, couponId: "c1" })
  })

  it("fails the order when the given coupon is not valid", () => {
    const result = priceOrder({
      items: [{ productId: "saree", quantity: 1 }],
      products,
      coupon: null,
      couponCode: "FAKE",
      now: NOW,
    })

    expect(result).toEqual({ ok: false, reason: "Invalid coupon code" })
  })
})

describe("validateCoupon", () => {
  it("caps a percentage discount at the maximum", () => {
    expect(validateCoupon(coupon({ max_discount_amount: 500 }), 12999, NOW)).toEqual({
      ok: true,
      discount: 500,
    })
  })

  it("never discounts more than the subtotal", () => {
    expect(
      validateCoupon(coupon({ discount_type: "fixed", discount_value: 5000 }), 1899, NOW),
    ).toEqual({ ok: true, discount: 1899 })
  })

  it.each([
    ["inactive", { is_active: false }, "Invalid coupon code"],
    ["not started", { starts_at: "2026-10-01T00:00:00Z" }, "This coupon is not yet active"],
    ["expired", { expires_at: "2026-09-01T00:00:00Z" }, "This coupon has expired"],
    ["used up", { usage_limit: 5, used_count: 5 }, "This coupon has reached its usage limit"],
    ["below minimum", { min_order_amount: 20000 }, "Minimum order amount is ₹20,000"],
  ])("rejects a coupon that is %s", (_label, overrides, reason) => {
    expect(validateCoupon(coupon(overrides as Partial<PricingCoupon>), 12999, NOW)).toEqual({
      ok: false,
      reason,
    })
  })
})
