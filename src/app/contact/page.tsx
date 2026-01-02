import { Metadata } from "next";
import ContactPage from "@/storefront/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Shri Kailash Kalamkari",
  description: "Get in touch with us for custom orders, queries, or to learn more about our Kalamkari products",
};

export default function Contact() {
  return <ContactPage />;
}
