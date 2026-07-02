import { Metadata } from "next";
import AboutPage from "@/features/pages/AboutPage";

export const metadata: Metadata = {
  title: "About Us | Srikalahasti Kalamkari (Shri Kalahasti Kalamkari)",
  description:
    "Learn about our heritage of authentic Srikalahasti Kalamkari (Shri Kalahasti Kalamkari) craftsmanship. Traditional pen-work artistry passed down through generations of skilled artisans from Srikalahasti, Andhra Pradesh.",
  alternates: {
    canonical: "https://srikalahastikalamkari.in/about",
  },
  openGraph: {
    title: "About Srikalahasti Kalamkari | Shri Kalahasti Kalamkari",
    description:
      "25+ years of traditional Srikalahasti Kalamkari craftsmanship. Authentic pen-work sarees from Andhra Pradesh artisans.",
    url: "https://srikalahastikalamkari.in/about",
    images: [{ url: "/images/logo.jpg", alt: "Srikalahasti Kalamkari" }],
  },
};

export default function About() {
  return <AboutPage />;
}
