import { Metadata } from "next";
import ProductDetail from "@/storefront/components/products/ProductDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // In production, fetch product data here for SEO
  return {
    title: `Product Details | Shri Kailash Kalamkari`,
    description: "View detailed information about this Kalamkari product",
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
