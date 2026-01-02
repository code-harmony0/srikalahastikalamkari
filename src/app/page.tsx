import { Metadata } from "next";
import HomePage from "@/storefront/components/home/HomePage";

export const metadata: Metadata = {
  title: "Shri Kailash Kalamkari - Authentic Handcrafted Kalamkari Sarees",
  description: "Discover authentic Kalamkari sarees and fabrics, handcrafted with traditional techniques. Premium quality traditional Indian textiles.",
  keywords: ["kalamkari sarees", "handcrafted sarees", "traditional indian fabric", "kalamkari art"],
  openGraph: {
    title: "Shri Kailash Kalamkari",
    description: "Authentic Handcrafted Kalamkari Sarees",
    type: "website",
  },
};

export default function Home() {
  return <HomePage />;
}
