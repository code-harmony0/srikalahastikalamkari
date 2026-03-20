import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import environment from "@/shared/config/environment";

const razorpay = new Razorpay({
  key_id: environment.razorpay.keyId,
  key_secret: environment.razorpay.keySecret,
});

export async function POST(req: NextRequest) {
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

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
