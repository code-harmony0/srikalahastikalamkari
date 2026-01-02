import { Metadata } from "next";
import WishlistPage from "@/storefront/pages/WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist | Shri Kailash Kalamkari",
  description: "Your saved Kalamkari products",
};

export default function Wishlist() {
  return <WishlistPage />;
}
