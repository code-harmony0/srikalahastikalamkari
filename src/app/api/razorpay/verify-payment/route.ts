import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { getServiceClient } from "@/lib/supabase/service";
import environment from "@/shared/config/environment";

export async function POST(req: NextRequest) {
  // Read at runtime to ensure Hostinger env vars are always used (not build-time inlined)
  const keySecret = process.env.RAZORPAY_KEY_SECRET || environment.razorpay.keySecret;

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData,
      cartItems,
      totalAmount,
      couponCode,
      userId,
      customerPhone,
    } = await req.json();

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // An order without its items tells the shop nothing about what to pack.
    // Refuse before writing anything, and log the payment so it can be matched by hand.
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("verify-payment: paid order arrived with no items", { razorpay_order_id, razorpay_payment_id });
      return NextResponse.json({ error: "Order items missing" }, { status: 400 });
    }

    // Save order to Supabase
    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        status: "paid",
        total_amount: totalAmount, // already in rupees
        shipping_address: shippingAddress,
        customer_email: formData.email,
        customer_phone: customerPhone || formData.phone || null,
        user_id: null,
        firebase_uid: userId || null,
        razorpay_order_id,
        razorpay_payment_id,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Save order items
    const orderItems = cartItems.map((item: { productId: string; price: number; quantity: number; selectedColor?: string }) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.price, // already in rupees
      selected_color: item.selectedColor || null,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Count the coupon use so the usage limit set in the admin panel actually
    // applies. A failure here must not undo an order that has been paid for.
    if (typeof couponCode === "string" && couponCode.trim()) {
      try {
        const db = getServiceClient();
        const { data: coupon } = await db
          .from("coupons")
          .select("id, used_count")
          .eq("code", couponCode.trim().toUpperCase())
          .maybeSingle();
        if (coupon) {
          await db
            .from("coupons")
            .update({ used_count: (coupon.used_count ?? 0) + 1 })
            .eq("id", coupon.id);
        }
      } catch (couponError) {
        console.error("Coupon usage count failed:", couponError);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Razorpay verify-payment error:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
