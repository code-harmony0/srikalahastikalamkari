import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/client";
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
    const orderItems = cartItems.map((item: { productId: string; price: number; quantity: number }) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_purchase: item.price, // already in rupees
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Razorpay verify-payment error:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
