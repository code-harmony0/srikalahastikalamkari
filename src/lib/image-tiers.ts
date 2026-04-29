import { ProductImageTiers } from "@/shared/types"

/**
 * Image tier utilities for backward compatibility and migration
 */

/**
 * Get image URL from either old string format or new ProductImageTiers format
 * @param images - Product images (string[] or ProductImageTiers[])
 * @param tier - Which image tier to retrieve
 * @param index - Optional index for accessing specific image in array
 * @returns Image URL string or null
 */
export function getImageTier(
  images: string[] | ProductImageTiers[] | null | undefined,
  tier: keyof ProductImageTiers,
  index: number = 0,
): string | null {
  if (!images || images.length === 0) return null

  // Check if new format (ProductImageTiers[])
  if (
    Array.isArray(images) &&
    images.length > 0 &&
    typeof images[0] === "object" &&
    images[0] !== null
  ) {
    const tiers = images as ProductImageTiers[]
    return tiers[index]?.[tier] || null
  }

  // Old format - return first image for all tiers (backward compatibility)
  const stringImages = images as string[]
  const imageIndex = index !== undefined ? index : 0
  return stringImages[imageIndex] || null
}

/**
 * Check if product has new image tier format
 */
export function hasImageTiers(
  images: string[] | ProductImageTiers[] | null | undefined,
): boolean {
  return (
    Array.isArray(images) && images.length > 0 && typeof images[0] === "object"
  )
}

/**
 * Get all available image tiers from product
 */
export function getAllImageTiers(
  images: string[] | ProductImageTiers[] | null | undefined,
): ProductImageTiers | null {
  if (hasImageTiers(images)) {
    return (images as ProductImageTiers[])[0] || null
  }

  // Fallback: create tiers from a single legacy ref. Rendering still goes
  // through the central resolver, so this does not construct delivery URLs.
  const imageUrl = images?.[0]
  if (!imageUrl || typeof imageUrl !== "string") return null

  return {
    thumb: imageUrl,
    medium: imageUrl,
    full: imageUrl,
  }
}
