import { Metadata } from "next";
import CheckoutPage from "@/storefront/components/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | Shri Kailash Kalamkari",
  description: "Complete your purchase of authentic Kalamkari products",
};

export default function Checkout() {
  return <CheckoutPage />;
}
