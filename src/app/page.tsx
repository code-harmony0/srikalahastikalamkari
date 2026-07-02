import { Metadata } from "next";
import HomePage from "@/features/home/HomePage";

export const metadata: Metadata = {
  title: "Srikalahasti Kalamkari | Shri Kalahasti Kalamkari - Authentic Handcrafted Sarees",
  description:
    "Srikalahasti Kalamkari (Shri Kalahasti Kalamkari) - Buy authentic handcrafted Kalamkari sarees, dupattas and fabrics using traditional pen-work. Direct from artisans of Srikalahasti, Andhra Pradesh.",
  keywords: [
    "srikalahasti kalamkari",
    "shri kalahasti kalamkari",
    "srikalahastikalamkari",
    "kalahasti kalamkari sarees",
    "kalamkari sarees online",
    "handcrafted kalamkari sarees",
    "traditional pen kalamkari",
    "andhra pradesh kalamkari",
    "buy kalamkari sarees online",
    "authentic kalamkari fabric",
  ],
  alternates: {
    canonical: "https://srikalahastikalamkari.in",
  },
  openGraph: {
    title: "Srikalahasti Kalamkari | Shri Kalahasti Kalamkari - Authentic Handcrafted Sarees",
    description:
      "Buy authentic Srikalahasti Kalamkari sarees, dupattas and fabrics handcrafted with traditional pen-work techniques. Direct from artisans.",
    type: "website",
    url: "https://srikalahastikalamkari.in",
    images: [
      {
        url: "/images/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Srikalahasti Kalamkari - Authentic Handcrafted Sarees",
      },
    ],
  },
};

export default function Home() {
  return <HomePage />;
}
// hmr watch test
