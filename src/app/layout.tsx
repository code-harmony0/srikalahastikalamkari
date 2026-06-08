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
  title: {
    default: "Srikalahasti Kalamkari - Authentic Handcrafted Sarees & Fabrics",
    template: "%s | Srikalahasti Kalamkari",
  },
  description:
    "Buy authentic Srikalahasti Kalamkari sarees, dupattas and fabrics handcrafted using traditional pen-work techniques. Direct from Srikalahasti artisans.",
  keywords: [
    "srikalahasti kalamkari",
    "srikalahastikalamkari",
    "kalamkari sarees",
    "kalamkari fabric",
    "handcrafted sarees",
    "traditional kalamkari",
    "pen kalamkari",
    "andhra pradesh sarees",
    "indian handloom sarees",
    "buy kalamkari sarees online",
    "srikalahasti",
  ],
  authors: [{ name: "Srikalahasti Kalamkari" }],
  creator: "Srikalahasti Kalamkari",
  metadataBase: new URL("https://srikalahastikalamkari.in"),
  alternates: {
    canonical: "https://srikalahastikalamkari.in",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://srikalahastikalamkari.in",
    siteName: "Srikalahasti Kalamkari",
    title: "Srikalahasti Kalamkari - Authentic Handcrafted Sarees & Fabrics",
    description:
      "Buy authentic Srikalahasti Kalamkari sarees, dupattas and fabrics handcrafted using traditional pen-work techniques. Direct from Srikalahasti artisans.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Srikalahasti Kalamkari - Authentic Handcrafted Sarees",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Srikalahasti Kalamkari - Authentic Handcrafted Sarees & Fabrics",
    description:
      "Buy authentic Srikalahasti Kalamkari sarees handcrafted using traditional pen-work techniques.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://srikalahastikalamkari.in/#organization",
      name: "Srikalahasti Kalamkari",
      url: "https://srikalahastikalamkari.in",
      logo: "https://srikalahastikalamkari.in/images/logo.jpg",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-72888-48881",
        contactType: "customer service",
        availableLanguage: ["English", "Telugu"],
      },
      sameAs: [],
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://srikalahastikalamkari.in/#localbusiness",
      name: "Srikalahasti Kalamkari",
      description:
        "Authentic Srikalahasti Kalamkari sarees and fabrics handcrafted using traditional pen-work techniques by skilled artisans.",
      url: "https://srikalahastikalamkari.in",
      telephone: "+91-72888-48881",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Srikalahasti",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 13.7497,
        longitude: 79.6988,
      },
      priceRange: "₹₹",
      image: "https://srikalahastikalamkari.in/images/logo.jpg",
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                      console.log('Stale service worker unregistered');
                    }
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    for (var i = 0; i < keys.length; i++) {
                      caches.delete(keys[i]);
                      console.log('Cache purged:', keys[i]);
                    }
                  });
                }
              }
            `
          }}
        />
      </head>
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
