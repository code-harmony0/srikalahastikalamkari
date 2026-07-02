import { Metadata } from "next";
import ProductsPage from "@/features/products/ProductsPage";

export const metadata: Metadata = {
  title: "Shop Kalamkari Sarees & Fabrics | Srikalahasti Kalamkari",
  description:
    "Browse our complete collection of authentic Srikalahasti Kalamkari sarees, dupattas, dress materials and traditional fabrics. Handcrafted with traditional pen-work techniques by artisans from Srikalahasti.",
  keywords: [
    "buy kalamkari sarees online",
    "srikalahasti kalamkari sarees",
    "shri kalahasti kalamkari sarees",
    "kalamkari dupatta",
    "kalamkari dress material",
    "pen kalamkari fabric",
    "traditional kalamkari collection",
  ],
  alternates: {
    canonical: "https://srikalahastikalamkari.in/products",
  },
  openGraph: {
    title: "Shop Kalamkari Sarees & Fabrics | Srikalahasti Kalamkari",
    description:
      "Authentic Srikalahasti Kalamkari sarees and fabrics. Handcrafted traditional pen-work collection from Andhra Pradesh artisans.",
    url: "https://srikalahastikalamkari.in/products",
    images: [{ url: "/images/logo.jpg", alt: "Srikalahasti Kalamkari Sarees" }],
  },
};

export default function Products() {
  return <ProductsPage />;
}
