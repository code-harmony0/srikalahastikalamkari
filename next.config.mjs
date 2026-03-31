/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features for faster builds
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@radix-ui/react-icons",
      "framer-motion",
    ],
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: true,

  // Output configuration - standalone for Docker/deployment
  output: "standalone",
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

      // Client-side code splitting
      if (!isServer) {
        config.optimization.splitChunks = {
          chunks: "all",
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          minSize: 20000,
          cacheGroups: {
            // Core vendors - loaded first
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: "core-vendors",
              chunks: "all",
              priority: 40,
              enforce: true,
            },
            // UI library - Radix UI components
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "radix-ui",
              chunks: "all",
              priority: 30,
            },
            // Icons
            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui\/react-icons)[\\/]/,
              name: "icons",
              chunks: "all",
              priority: 25,
            },
            // Animation - loaded on demand
            motion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: "framer-motion",
              chunks: "async",
              priority: 20,
            },
            // Charts - heavy, only when needed
            charts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: "recharts",
              chunks: "async",
              priority: 15,
            },
            // Other vendors
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
            },
            // Common shared code
            common: {
              minChunks: 2,
              chunks: "all",
              enforce: true,
              priority: 5,
            },
          },
        }
        config.optimization.runtimeChunk = { name: "runtime" }
      }
    }
    return config
  },

  // Security headers for production
  async headers() {
    return [
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
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
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
  swcMinify: true,
  compiler: {
    // Note: removeConsole is not supported by Turbopack
    // Console logs are removed via terser in production instead
    emotion: true,
  },
}

export default nextConfig
