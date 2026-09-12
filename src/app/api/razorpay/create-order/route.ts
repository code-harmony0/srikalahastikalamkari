import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import environment from "@/shared/config/environment";
import { getServiceClient } from "@/lib/supabase/service";
import {
  priceOrder,
  type CartLine,
  type PricingCoupon,
} from "@/shared/lib/order-pricing";

// The browser only says what it wants to buy. What that costs is worked out here
// from database prices, stock and coupon rules. This route used to charge
// whatever `amount` the page sent, so anyone could edit the request and pay ₹1.

const MAX_LINES = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readCartLines(value: unknown): CartLine[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINES) {
    return null;
  }
  const lines: CartLine[] = [];
  for (const entry of value) {
    if (
      !entry ||
      typeof entry.productId !== "string" ||
      !UUID.test(entry.productId) ||
      typeof entry.quantity !== "number"
    ) {
      return null;
    }
    lines.push({ productId: entry.productId, quantity: entry.quantity });
  }
  return lines;
}

export async function POST(req: NextRequest) {
  // Use process.env directly to bypass build-time NEXT_PUBLIC_ inlining if set,
  // falling back to environment config which handles local vs production setup.
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || environment.razorpay.keyId;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || environment.razorpay.keySecret;

  const body = await req.json().catch(() => null);
  const items = readCartLines(body?.items);
  if (!items) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }
  const couponCode =
    typeof body?.couponCode === "string" && body.couponCode.trim()
      ? body.couponCode.trim().toUpperCase()
      : null;

  try {
    const db = getServiceClient();

    const productIds = [...new Set(items.map((item) => item.productId))];
    const { data: products, error: productsError } = await db
      .from("products")
      .select("id, price, is_visible, stock_quantity")
      .in("id", productIds);
    if (productsError) throw productsError;

    let coupon: PricingCoupon | null = null;
    if (couponCode) {
      const { data, error } = await db
        .from("coupons")
        .select("id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, starts_at, expires_at, is_active")
        .eq("code", couponCode)
        .maybeSingle();
      if (error) throw error;
      coupon = data as PricingCoupon | null;
    }

    const pricing = priceOrder({
      items,
      products: products ?? [],
      coupon,
      couponCode,
      now: new Date(),
    });
    if (!pricing.ok) {
      return NextResponse.json({ error: pricing.reason }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: Math.round(pricing.total * 100), // rupees → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { coupon: couponCode ?? "" },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // Return the resolved Key ID to the client
      total: pricing.total,
    });
  } catch (error) {
    // Internal details stay in the server log, not in the response.
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
