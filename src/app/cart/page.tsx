import { Metadata } from "next";
import CartPage from "@/features/cart/CartPage";

export const metadata: Metadata = {
  title: "Shopping Cart | Srikalahasti Kalamkari",
  description: "Review your selected Srikalahasti Kalamkari products and proceed to checkout",
};

export default function Cart() {
  return <CartPage />;
}
