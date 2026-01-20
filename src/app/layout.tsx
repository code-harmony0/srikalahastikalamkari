import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/shared/providers"
import AppWrapper from "./AppWrapper"
import { InventoryProvider } from "@/shared/contexts/InventoryContext"

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
  title: "Shri Kailash Kalamkari - Traditional Handcrafted Art",
  description:
    "Authentic Kalamkari sarees and fabrics, handcrafted with traditional techniques",
  keywords: [
    "kalamkari",
    "sarees",
    "traditional",
    "handcrafted",
    "indian fabric",
  ],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🎨</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <InventoryProvider>
            <AppWrapper>{children}</AppWrapper>
          </InventoryProvider>
        </Providers>
      </body>
    </html>
  )
}
