import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/shared/providers";
import Header from "@/storefront/components/layout/Header";
import Footer from "@/storefront/components/layout/Footer";
import FloatingAdminButton from "@/storefront/components/layout/FloatingAdminButton";

// ORIGINAL WIX FONTS
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-paragraph",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Shri Kailash Kalamkari - Traditional Handcrafted Art",
  description: "Authentic Kalamkari sarees and fabrics, handcrafted with traditional techniques",
  keywords: ["kalamkari", "sarees", "traditional", "handcrafted", "indian fabric"],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🎨</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.className} ${cormorant.variable} ${openSans.variable}`}>
        <Providers>
          <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingAdminButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}
