import type { MetadataRoute } from "next"
import { getProducts } from "@/services/products"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://srikalahastikalamkari.in"

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: products } = await getProducts()
    if (products) {
      productRoutes = products
        .filter((p) => p.slug)
        .map((p) => ({
          url: `${baseUrl}/products/${p.slug}`,
          lastModified: new Date(p.updated_at || p.created_at || Date.now()),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
    }
  } catch {
    // If DB is unavailable during build, skip product routes
  }

  return [...staticRoutes, ...productRoutes]
}
