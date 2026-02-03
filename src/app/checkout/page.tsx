import { Metadata } from "next";
import CheckoutPage from "@/features/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | Srikalahasti Kalamkari",
  description: "Complete your purchase of authentic Srikalahasti Kalamkari products",
};

export default function Checkout() {
  return <CheckoutPage />;
}
