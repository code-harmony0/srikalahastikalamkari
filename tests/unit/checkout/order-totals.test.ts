import { getOrderTotals } from "@/shared/lib/order-totals"

describe("getOrderTotals", () => {
  it("charges the subtotal as-is, because listed prices already include tax", () => {
    expect(getOrderTotals({ subtotal: 12999 })).toEqual({
      subtotal: 12999,
      discount: 0,
      shipping: 0,
      total: 12999,
    })
  })

  it("takes a coupon discount off the total", () => {
    expect(getOrderTotals({ subtotal: 12999, discount: 1000 }).total).toBe(11999)
  })

  it("never lets a discount push the total below zero", () => {
    expect(getOrderTotals({ subtotal: 500, discount: 800 }).total).toBe(0)
  })
})
