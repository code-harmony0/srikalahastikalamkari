/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development"

const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-icons",
      // framer-motion intentionally excluded: optimizePackageImports breaks
      // its internal module graph in Turbopack (use-animation.mjs not found)
    ],
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  
  turbopack: {},

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: true,

  distDir: ".next",

  // Trailing slash for SEO consistency
  trailingSlash: false,

  // Compression for static assets
  compress: true,

  // Image optimization with production settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "vovbnbmfzehlgtkvhzzj.supabase.co",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours in production
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },

  // Webpack optimization for production
  webpack: (config, { isServer, dev, nextRuntime }) => {
    // Production optimizations only
    if (!dev) {
      // Tree shaking and dead code elimination
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        providedExports: true,
        concatenateModules: true,
        minimize: true,
      }

      // Client-side code splitting disabled to let Next.js handle it with optimized defaults.
      // (Custom Webpack splitChunks overrides can cause static assets like CSS chunks to be misclassified and loaded as scripts)
    }
    return config
  },

  // Security headers for production
  async headers() {
    return [
      {
        // Keep HTML/data pages fresh so Hostinger CDN does not serve stale build chunks after deploys.
        source: "/((?!_next/|fonts/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|png|webp|avif|gif|ico)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/:all*(js|css)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:font*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        // Security headers for all pages
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Cache control for privacy and terms pages
        source: "/privacy",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        // Cache control for privacy and terms pages
        source: "/terms",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/products/:path*",
        permanent: true,
      },
    ]
  },

  reactStrictMode: true,
  compiler: {
    // Note: removeConsole is not supported by Turbopack
    // Console logs are removed via terser in production instead
    emotion: true,
  },
}

export default nextConfig
