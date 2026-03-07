import { Metadata } from "next";
import AboutPage from "@/features/pages/AboutPage";

export const metadata: Metadata = {
  title: "About Us | Sri Kalahasti Kalamkari",
  description:
    "Learn about our heritage of authentic Sri Kalahasti Kalamkari craftsmanship and traditional artistry",
  openGraph: {
    title: "About Sri Kalahasti Kalamkari",
    description:
      "25+ years of traditional Sri Kalahasti Kalamkari craftsmanship",
  },
};

export default function About() {
  return <AboutPage />;
}
