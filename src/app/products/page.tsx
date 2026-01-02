import { Metadata } from "next";
import ProductsPage from "@/storefront/components/products/ProductsPage";

export const metadata: Metadata = {
  title: "Shop Kalamkari Products | Shri Kailash Kalamkari",
  description: "Browse our collection of authentic handcrafted Kalamkari sarees, dress materials, and traditional fabrics.",
  openGraph: {
    title: "Shop Kalamkari Products",
    description: "Authentic handcrafted Kalamkari collection",
  },
};

export default function Products() {
  return <ProductsPage />;
}
