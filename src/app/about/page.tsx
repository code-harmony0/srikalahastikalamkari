import { Metadata } from "next";
import AboutPage from "@/features/pages/AboutPage";

export const metadata: Metadata = {
  title: "About Us | Srikalahasti Kalamkari",
  description: "Learn about our heritage of authentic Srikalahasti Kalamkari craftsmanship and traditional artistry",
  openGraph: {
    title: "About Srikalahasti Kalamkari",
    description: "25+ years of traditional Srikalahasti Kalamkari craftsmanship",
  },
};

export default function About() {
  return <AboutPage />;
}
