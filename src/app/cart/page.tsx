import { Metadata } from "next";
import CartPage from "@/storefront/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Shopping Cart | Shri Kailash Kalamkari",
  description: "Review your selected Kalamkari products and proceed to checkout",
};

export default function Cart() {
  return <CartPage />;
}
