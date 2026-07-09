import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import environment from "@/shared/config/environment";

export async function POST(req: NextRequest) {
  // Use process.env directly to bypass build-time NEXT_PUBLIC_ inlining if set,
  // falling back to environment config which handles local vs production setup.
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || environment.razorpay.keyId;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || environment.razorpay.keySecret;

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert rupees → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Return the resolved Key ID to the client
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({
      error: "Failed to create payment order",
      details: error.message || String(error),
    }, { status: 500 });
  }
}
