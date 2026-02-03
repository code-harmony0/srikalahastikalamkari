import { Metadata } from "next";
import ContactPage from "@/features/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Srikalahasti Kalamkari",
  description: "Get in touch with us for custom orders, queries, or to learn more about our Srikalahasti Kalamkari products",
};

export default function Contact() {
  return <ContactPage />;
}
