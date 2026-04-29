export type CfImageVariant = "thumb" | "medium" | "full"

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/products/product-placeholder.png"

const warned = new Set<string>()

const isBrowserDev = () =>
  process.env.NODE_ENV !== "production" && typeof window !== "undefined"

const warnOnce = (key: string, message: string, meta?: unknown) => {
  if (!isBrowserDev() || warned.has(key)) return
  warned.add(key)
  console.warn(message, meta)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SLUG_RE = /^[a-zA-Z0-9_-]{24,64}$/

const normalizeBase = (base: string) => base.replace(/\/+$/, "")

const allowSlugIds = () =>
  process.env.NEXT_PUBLIC_CF_IMAGES_ALLOW_SLUG_IDS?.trim().toLowerCase() ===
  "true"

const allowLegacySupabaseUrls = () =>
  process.env.NEXT_PUBLIC_CF_IMAGES_ALLOW_SUPABASE_LEGACY_URLS
    ?.trim()
    .toLowerCase() !== "false"

export function isLikelyCfImageId(ref: string): boolean {
  const trimmed = ref.trim()
  if (!trimmed) return false
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return false
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return false
  }
  if (/[/?#.]/.test(trimmed)) return false
  if (UUID_RE.test(trimmed)) return true

  const ok = allowSlugIds() && SLUG_RE.test(trimmed) && /[-_]/.test(trimmed)
  if (ok) {
    warnOnce(
      `cf_slug_id:${trimmed}`,
      "[cloudflare-images] Non-UUID Cloudflare image id detected. Prefer Cloudflare UUID ids to reduce migration ambiguity.",
      { ref: trimmed },
    )
  }
  return ok
}

export function isCloudflareImageId(ref: string): boolean {
  return isLikelyCfImageId(ref)
}

export function isLegacyImageUrl(ref: string): boolean {
  const trimmed = ref.trim()
  return trimmed.startsWith("https://") || trimmed.startsWith("http://")
}

export function isLocalOrPreviewImage(ref: string): boolean {
  const trimmed = ref.trim()
  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  )
}

export function resolveCloudflareImageUrl(
  imageId: string,
  variant: CfImageVariant,
): string {
  const trimmedId = imageId.trim()
  if (!isLikelyCfImageId(trimmedId)) return PRODUCT_IMAGE_PLACEHOLDER

  const accountHash = process.env.NEXT_PUBLIC_CF_IMAGES_HASH?.trim()
  if (!accountHash) {
    warnOnce(
      "cf_missing_hash",
      "[cloudflare-images] Missing NEXT_PUBLIC_CF_IMAGES_HASH. Cloudflare image ids will render as the product placeholder.",
      { imageId: trimmedId, variant },
    )
    return PRODUCT_IMAGE_PLACEHOLDER
  }

  return `${normalizeBase(`https://imagedelivery.net/${accountHash}`)}/${trimmedId}/${variant}`
}

export function resolveProductImageSrc(
  imageRef: string | null | undefined,
  variant: CfImageVariant,
): string {
  const trimmed = (imageRef ?? "").trim()
  if (!trimmed) return PRODUCT_IMAGE_PLACEHOLDER

  if (isLikelyCfImageId(trimmed)) {
    return resolveCloudflareImageUrl(trimmed, variant)
  }

  if (isLocalOrPreviewImage(trimmed)) return trimmed

  if (isLegacyImageUrl(trimmed)) {
    if (trimmed.includes("/storage/v1/render/image/")) {
      warnOnce(
        `render_image:${trimmed}`,
        "[cloudflare-images] Supabase /render/image URL detected. Migrate this product image ref to a Cloudflare Image ID.",
        { ref: trimmed, variant },
      )
    }

    if (
      trimmed.includes("supabase.co/storage") &&
      !allowLegacySupabaseUrls()
    ) {
      warnOnce(
        `blocked_supabase_storage:${trimmed}`,
        "[cloudflare-images] Supabase Storage image URL blocked. Migrate this ref to a Cloudflare Image ID.",
        { ref: trimmed, variant },
      )
      return PRODUCT_IMAGE_PLACEHOLDER
    }

    return trimmed
  }

  warnOnce(
    `unhandled_ref:${trimmed}`,
    "[cloudflare-images] Unhandled product image ref. Rendering the product placeholder.",
    { ref: trimmed, variant },
  )
  return PRODUCT_IMAGE_PLACEHOLDER
}

export function isCloudflareDeliveryUrl(src: string): boolean {
  return src.startsWith("https://imagedelivery.net/")
}
