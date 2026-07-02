import { Metadata } from "next";
import ProductsPage from "@/features/products/ProductsPage";

export const metadata: Metadata = {
  title: "Custom Design Archive | Srikalahasti Kalamkari",
  description:
    "Browse Srikalahasti Kalamkari designs available for custom requests through WhatsApp.",
  openGraph: {
    title: "Custom Design Archive",
    description:
      "Kalamkari designs available for custom WhatsApp inquiry.",
  },
};

export default function CustomDesignPage() {
  return <ProductsPage mode="custom-design" />;
}
