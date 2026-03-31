import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/shared/providers"
import AppWrapper from "./AppWrapper"
import { InventoryProvider } from "@/shared/contexts/InventoryContext"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

// Srikalahasti Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-paragraph",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Srikalahasti Kalamkari - Traditional Handcrafted Art",
  description:
    "Authentic Srikalahasti Kalamkari sarees and fabrics, handcrafted with traditional techniques",
  keywords: [
    "srikalahasti kalamkari",
    "sarees",
    "traditional",
    "handcrafted",
    "indian fabric",
  ],
  alternates: {
    canonical: "https://srikalahastikalamkari.in",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Providers>
            <InventoryProvider>
              <AppWrapper>{children}</AppWrapper>
            </InventoryProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
