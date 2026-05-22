/**
 * Image Optimization Utilities
 *
 * Provides utility functions for generating optimized image URLs
 * using Supabase Image Transformations and Next.js best practices.
 */

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  resize?: "cover" | "contain" | "fill"
}

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/products/product-placeholder.png"

const CF_IMAGES_HASH =
  process.env.NEXT_PUBLIC_CF_IMAGES_HASH || "xGnXvGVZkNr8ZNcbFxAROQ"

const CF_IMAGE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isCloudflareImageId(url: string): boolean {
  const trimmed = url.trim()
  return Boolean(trimmed) && CF_IMAGE_ID_RE.test(trimmed)
}

function getCloudflareVariant(options?: ImageOptimizationOptions): "thumb" | "medium" {
  return options?.width && options.width <= 400 ? "thumb" : "medium"
}

export function getCloudflareImageUrl(
  imageId: string,
  options?: ImageOptimizationOptions,
): string {
  return `https://imagedelivery.net/${CF_IMAGES_HASH}/${imageId.trim()}/${getCloudflareVariant(options)}`
}

/**
 * Generates an optimized image URL using Supabase Image Transformations.
 * Only applies transformations to Supabase-hosted images.
 *
 * @param url - Original image URL
 * @param options - Optimization options (width, height, quality, resize mode)
 * @returns Optimized image URL with transformation parameters
 *
 * @example
 * // Get 400px wide thumbnail
 * getOptimizedImageUrl(productImage, { width: 400, quality: 75 });
 *
 * // Get small avatar
 * getOptimizedImageUrl(avatar, { width: 80, height: 80, resize: 'cover' });
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options?: ImageOptimizationOptions,
): string {
  // Return placeholder for missing URLs
  if (!url) return PRODUCT_IMAGE_PLACEHOLDER

  const trimmedUrl = url.trim()

  if (isCloudflareImageId(trimmedUrl)) {
    return getCloudflareImageUrl(trimmedUrl, options)
  }

  if (trimmedUrl.startsWith("https://imagedelivery.net/")) {
    return trimmedUrl
  }

  // Only transform Supabase-hosted images
  if (!trimmedUrl.includes("supabase.co/storage")) {
    return trimmedUrl
  }

  // TEMPORARY FIX: Due to Supabase 403 errors with render endpoint,
  // return original URL without transformations
  // TODO: Fix Supabase storage permissions and re-enable transformations
  console.warn(
    "Using original Supabase URL due to transformation endpoint issues",
  )
  return trimmedUrl

  // Build transformation URL (DISABLED FOR NOW)
  /*
  const transformUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );
  
  const params = new URLSearchParams();
  
  if (options?.width) {
    params.set('width', options.width.toString());
  }
  
  if (options?.height) {
    params.set('height', options.height.toString());
  }
  
  if (options?.quality) {
    params.set('quality', options.quality.toString());
  }
  
  if (options?.resize) {
    params.set('resize', options.resize);
  }
  
  const paramString = params.toString();
  return paramString ? `${transformUrl}?${paramString}` : transformUrl;
  */
}

/**
 * Preset image sizes for common use cases.
 * Use these with getOptimizedImageUrl for consistency.
 */
export const IMAGE_SIZES = {
  // Product grid thumbnails
  productCard: { width: 400, quality: 80 },

  // Compact product cards
  productCardCompact: { width: 200, quality: 75 },

  // Hero/featured products
  productHero: { width: 800, quality: 85 },

  // Product detail main image
  productDetail: { width: 1200, quality: 90 },

  // Small thumbnails (subcategories, cart items)
  thumbnail: { width: 80, quality: 70 },

  // Cart item images
  cartItem: { width: 150, quality: 75 },

  // Category images
  category: { width: 300, quality: 80 },
} as const

/**
 * Generate responsive srcSet for Next.js Image component.
 * Returns sizes attribute for responsive images.
 *
 * @param layout - Layout type ('grid' | 'list' | 'detail')
 * @returns sizes attribute string
 */
export function getResponsiveSizes(
  layout: "grid" | "list" | "detail" | "hero",
): string {
  switch (layout) {
    case "grid":
      // 4 cols on desktop, 2 on tablet, 1 on mobile
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    case "list":
      // Fixed width on left, text on right
      return "(max-width: 640px) 40vw, 200px"
    case "detail":
      // Full width on mobile, half on desktop
      return "(max-width: 1024px) 100vw, 50vw"
    case "hero":
      // Always full width
      return "100vw"
    default:
      return "100vw"
  }
}

/**
 * Static blur placeholder for smooth image loading.
 * A low-quality, tiny base64 image that displays while the full image loads.
 * Uses a warm, neutral tone that complements the Kalamkari theme.
 */
export const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgcI/8QAIhAAAQMEAgIDAAAAAAAAAAAAAQIDBAAFBhEHEiExQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAeEQACAgICAwAAAAAAAAAAAAABAgADBBEhEjFBUf/aAAwDAQACEQMRAD8AmOH8hZLjGaRcbhW9l+2yJDjFhgrcaQ+txRJUtayUlCST4AHgDvvtVjtlTF1hsJmxGZaO4V0dQFj2CPo1P+UePY8u/s3GVaocm1sSCpHmRrroQPBCmygH16FXqtlllblUBj2PvTU0oWNLLsP/2Q=="

/**
 * Recommended compression settings for image uploads.
 * Use with browser-image-compression library.
 */
export const COMPRESSION_OPTIONS = {
  maxSizeMB: 4,           // Allow up to 4MB — WebP output will be far smaller than original
  maxWidthOrHeight: 2400, // Full resolution for retina + zoom
  useWebWorker: true,
  fileType: "image/webp", // ~35% smaller than JPEG at same visual quality
  initialQuality: 0.92,   // Near-lossless — critical for handcraft detail
}

/**
 * Props interface for images with blur placeholder support.
 * Use these with Next.js Image component.
 */
export interface OptimizedImageProps {
  src: string
  blurDataURL: string
  placeholder: "blur"
}

/**
 * Get image props with blur placeholder for Next.js Image component.
 *
 * @param url - Original image URL
 * @param options - Optional size optimization options
 * @returns Object with src, blurDataURL, and placeholder props
 *
 * @example
 * const imageProps = getOptimizedImageProps(product.image, IMAGE_SIZES.productCard);
 * <Image {...imageProps} alt="Product" fill />
 */
export function getOptimizedImageProps(
  url: string | null | undefined,
  options?: ImageOptimizationOptions,
): OptimizedImageProps {
  return {
    src: getOptimizedImageUrl(url, options),
    blurDataURL: BLUR_DATA_URL,
    placeholder: "blur",
  }
}
