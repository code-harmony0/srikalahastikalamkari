import { Metadata } from "next";
import AboutPage from "@/storefront/pages/AboutPage";

export const metadata: Metadata = {
  title: "About Us | Shri Kailash Kalamkari",
  description: "Learn about our heritage of authentic Kalamkari craftsmanship and traditional artistry",
  openGraph: {
    title: "About Shri Kailash Kalamkari",
    description: "25+ years of traditional Kalamkari craftsmanship",
  },
};

export default function About() {
  return <AboutPage />;
}
