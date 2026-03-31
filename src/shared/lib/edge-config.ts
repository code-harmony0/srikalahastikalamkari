/**
 * Edge runtime configuration for Vercel Edge Functions
 * Deploys API routes at the edge for global low latency
 */

export const config = {
  runtime: "edge",
  regions: ["bom1", "sin1", "syd1"], // Mumbai, Singapore, Sydney for APAC
}

// Edge cache configuration
export const edgeCacheConfig = {
  // Cache dashboard data at edge for 5 minutes
  dashboard: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 86400, // 24 hours
  },
  // Cache product catalog for 1 hour
  products: {
    ttl: 3600, // 1 hour
    staleWhileRevalidate: 86400,
  },
  // Cache static product data for 24 hours
  productDetail: {
    ttl: 86400, // 24 hours
    staleWhileRevalidate: 604800, // 7 days
  },
}

interface CacheConfig {
  ttl: number
  staleWhileRevalidate: number
}

// Edge API handler with caching
export function withEdgeCache(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (request: Request) => Promise<Response>,
  cacheConfig: CacheConfig,
) {
  return async (request: Request): Promise<Response> => {
    const cacheKey = new URL(request.url).pathname

    // Check cache
    const cached = await caches
      .open("edge-cache")
      .then((c) => c.match(cacheKey))
    if (cached) {
      return cached
    }

    // Execute handler
    const response = await handler(request)

    // Cache the response
    if (cacheConfig.ttl) {
      response.headers.set(
        "Cache-Control",
        `public, s-maxage=${cacheConfig.ttl}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`,
      )
      caches.open("edge-cache").then((c) => c.put(cacheKey, response.clone()))
    }

    return response
  }
}
