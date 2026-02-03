import { Metadata } from "next";
import WishlistPage from "@/features/pages/WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist | Srikalahasti Kalamkari",
  description: "Your saved Srikalahasti Kalamkari products",
};

export default function Wishlist() {
  return <WishlistPage />;
}
