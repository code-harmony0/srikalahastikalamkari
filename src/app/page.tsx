import { Metadata } from "next";
import HomePage from "@/features/home/HomePage";

export const metadata: Metadata = {
  title: "Srikalahasti Kalamkari - Authentic Handcrafted Kalamkari Sarees",
  description: "Discover authentic Srikalahasti Kalamkari sarees and fabrics, handcrafted with traditional techniques. Premium quality traditional Indian textiles.",
  keywords: ["srikalahasti kalamkari sarees", "handcrafted sarees", "traditional indian fabric", "kalamkari art"],
  openGraph: {
    title: "Srikalahasti Kalamkari",
    description: "Authentic Handcrafted Kalamkari Sarees",
    type: "website",
  },
};

export default function Home() {
  return <HomePage />;
}
