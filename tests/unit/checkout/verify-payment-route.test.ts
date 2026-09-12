/** @jest-environment node */
import crypto from "crypto"

const SECRET = "test-razorpay-secret"
const insertedTables: string[] = []

jest.mock("@/shared/config/environment", () => ({
  __esModule: true,
  default: { razorpay: { keySecret: "test-razorpay-secret" } },
}))

jest.mock("@/lib/supabase/service", () => ({
  getServiceClient: jest.fn(),
}))

jest.mock("@/lib/supabase/client", () => ({
  supabaseAdmin: {
    from: (table: string) => ({
      insert: () => {
        insertedTables.push(table)
        return {
          select: () => ({ single: async () => ({ data: { id: "order-1" }, error: null }) }),
          then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
        }
      },
    }),
  },
}))

import { POST } from "@/app/api/razorpay/verify-payment/route"

const signedRequest = (body: Record<string, unknown>) => {
  const razorpay_order_id = "order_test"
  const razorpay_payment_id = "pay_test"
  const razorpay_signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  return new Request("http://localhost/api/razorpay/verify-payment", {
    method: "POST",
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData: { firstName: "A", lastName: "B", email: "a@b.in", phone: "9999999999" },
      totalAmount: 16999,
      ...body,
    }),
  })
}

beforeEach(() => {
  insertedTables.length = 0
  process.env.RAZORPAY_KEY_SECRET = SECRET
})

describe("verify-payment route", () => {
  it("never saves an order that has no items", async () => {
    const response = await POST(signedRequest({ cartItems: [] }) as never)

    expect(response.status).toBe(400)
    expect(insertedTables).toEqual([])
  })

  it("saves the order and every item it was given", async () => {
    const response = await POST(
      signedRequest({ cartItems: [{ productId: "p1", price: 16999, quantity: 1 }] }) as never,
    )

    expect(response.status).toBe(200)
    expect(insertedTables).toEqual(["orders", "order_items"])
  })
})
