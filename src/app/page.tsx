import { Metadata } from "next";
import { SITE_OFFLINE } from "@/shared/config/site-status";
import UnavailablePage from "@/features/pages/UnavailablePage";
// import ComingSoonPage from "@/features/home/ComingSoonPage";
import HomePage from "@/features/home/HomePage";

// export const metadata: Metadata = {
//   title: "Coming Soon | Shri Kalahasti Kalamkari",
//   description:
//     "We are weaving together something magnificent. Srikalahasti Kalamkari (Shri Kalahasti Kalamkari) - Buy authentic handcrafted Kalamkari sarees, dupattas and fabrics.",
//   keywords: [
//     "srikalahasti kalamkari",
//     "shri kalahasti kalamkari",
//     "srikalahastikalamkari",
//     "kalahasti kalamkari sarees",
//   ],
//   alternates: {
//     canonical: "https://srikalahastikalamkari.in",
//   },
// };

// export default function Home() {
//   return <ComingSoonPage />;
// }


// --- ORIGINAL HOMEPAGE CONTENT (COMMENTED FOR FUTURE USE) ---

const brandMetadata: Metadata = {
  title: "Srikalahasti Kalamkari | Shri Kalahasti Kalamkari - Authentic Handcrafted Sarees",
  description:
    "Srikalahasti Kalamkari (Shri Kalahasti Kalamkari) - Buy authentic handcrafted Kalamkari sarees, dupattas and fabrics using traditional pen-work. Direct from artisans of Srikalahasti, Andhra Pradesh.",
  keywords: [
    "srikalahasti kalamkari",
    "shri kalahasti kalamkari",
    "srikalahastikalamkari",
    "kalahasti kalamkari sarees",
    "kalamkari sarees online",
    "handcrafted kalamkari sarees",
    "traditional pen kalamkari",
    "andhra pradesh kalamkari",
    "buy kalamkari sarees online",
    "authentic kalamkari fabric",
  ],
  alternates: {
    canonical: "https://srikalahastikalamkari.in",
  },
  openGraph: {
    title: "Srikalahasti Kalamkari | Shri Kalahasti Kalamkari - Authentic Handcrafted Sarees",
    description:
      "Buy authentic Srikalahasti Kalamkari sarees, dupattas and fabrics handcrafted with traditional pen-work techniques. Direct from artisans.",
    type: "website",
    url: "https://srikalahastikalamkari.in",
    images: [
      {
        url: "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo/full",
        width: 1200,
        height: 630,
        alt: "Srikalahasti Kalamkari - Authentic Handcrafted Sarees",
      },
    ],
  },
};

export default function Home() {
  if (SITE_OFFLINE) return <UnavailablePage />;
  return <HomePage />;
}


const offlineMetadata: Metadata = {
  title: "Temporarily unavailable",
  description: "This site is temporarily unavailable.",
  robots: { index: false, follow: false },
};

export const metadata: Metadata = SITE_OFFLINE ? offlineMetadata : brandMetadata;
