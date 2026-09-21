import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/shared/providers"
import AppWrapper from "./AppWrapper"
import { ThemeProvider } from "@/components/providers/ThemeProvider"

import { SITE_OFFLINE } from "@/shared/config/site-status";

// Srikalahasti Fonts
// Variable face: one file covering 400-900, instead of five static cuts of
// which 500 and 800 were never used.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-paragraph",
  display: "swap",
})

const brandMetadata: Metadata = {
  title: {
    default: "Srikalahasti Kalamkari (Shri Kalahasti) - Authentic Handcrafted Sarees & Fabrics",
    template: "%s | Srikalahasti Kalamkari",
  },
  description:
    "Buy authentic Srikalahasti Kalamkari sarees, dupattas and fabrics handcrafted using traditional pen-work techniques. Direct from Srikalahasti artisans. Also known as Shri Kalahasti Kalamkari.",
  keywords: [
    "srikalahasti kalamkari",
    "srikalahastikalamkari",
    "shri kalahasti kalamkari",
    "shri kalahsti kalamkari",
    "kalamkari sarees",
    "kalamkari fabric",
    "handcrafted sarees",
    "traditional kalamkari",
    "pen kalamkari",
    "andhra pradesh sarees",
    "indian handloom sarees",
    "buy kalamkari sarees online",
    "srikalahasti",
    "kalahasti kalamkari",
    "kalamkari dupatta",
    "hand painted sarees",
  ],
  authors: [{ name: "Srikalahasti Kalamkari" }],
  creator: "Srikalahasti Kalamkari",
  publisher: "Srikalahasti Kalamkari",
  verification: {
    google: "VLnIw9z4KukPOPuIIDpZD4sG30cu2GsnPd6v6-cpnrE",
  },
  metadataBase: new URL("https://srikalahastikalamkari.in"),
  alternates: {
    canonical: "https://srikalahastikalamkari.in",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://srikalahastikalamkari.in",
    siteName: "Srikalahasti Kalamkari",
    title: "Srikalahasti Kalamkari (Shri Kalahasti) - Authentic Handcrafted Sarees",
    description:
      "Buy authentic Srikalahasti Kalamkari sarees, dupattas and fabrics handcrafted using traditional pen-work techniques. Direct from Srikalahasti artisans. Also known as Shri Kalahasti Kalamkari.",
    images: [
      {
        url: "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo/full",
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
    images: ["https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo/full"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
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
  category: "shopping",
}

const offlineMetadata: Metadata = {
  title: "Temporarily unavailable",
  description: "This site is temporarily unavailable.",
  robots: { index: false, follow: false },
};

export const metadata: Metadata = SITE_OFFLINE ? offlineMetadata : brandMetadata;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://srikalahastikalamkari.in/#website",
      url: "https://srikalahastikalamkari.in",
      name: "Srikalahasti Kalamkari",
      alternateName: ["Shri Kalahasti Kalamkari", "Kalahasti Kalamkari", "SrikalahastI Kalamkari"],
      description: "Authentic Srikalahasti Kalamkari sarees and fabrics handcrafted using traditional pen-work techniques.",
      publisher: {
        "@id": "https://srikalahastikalamkari.in/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://srikalahastikalamkari.in/products?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "Organization",
      "@id": "https://srikalahastikalamkari.in/#organization",
      name: "Srikalahasti Kalamkari",
      alternateName: ["Shri Kalahasti Kalamkari", "Kalahasti Kalamkari"],
      url: "https://srikalahastikalamkari.in",
      logo: {
        "@type": "ImageObject",
        url: "https://srikalahastikalamkari.inhttps://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo/full",
        width: 512,
        height: 512,
      },
      image: "https://srikalahastikalamkari.inhttps://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo/full",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-72888-48881",
        contactType: "customer service",
        availableLanguage: ["English", "Telugu"],
      },
      sameAs: [],
    },
    {
      "@type": "Store",
      "@id": "https://srikalahastikalamkari.in/#store",
      name: "Srikalahasti Kalamkari",
      alternateName: ["Shri Kalahasti Kalamkari", "Kalahasti Kalamkari"],
      description:
        "Authentic Srikalahasti Kalamkari sarees and fabrics handcrafted using traditional pen-work techniques by skilled artisans. Also known as Shri Kalahasti Kalamkari.",
      url: "https://srikalahastikalamkari.in",
      telephone: "+91-72888-48881",
      address: {
        "@type": "PostalAddress",
        streetAddress: "# 17-68, Bharathi Nagar, Tirupati Main Road, Near Railway Station",
        addressLocality: "Srikalahasti",
        postalCode: "517640",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 13.7497,
        longitude: 79.6988,
      },
      priceRange: "₹₹",
      image: "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo/full",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Kalamkari Sarees & Fabrics",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: "Srikalahasti Kalamkari Sarees",
            },
          },
        ],
      },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_OFFLINE ? {} : jsonLd) }}
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
            <AppWrapper>{children}</AppWrapper>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
