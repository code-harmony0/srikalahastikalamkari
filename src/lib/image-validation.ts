import { isCloudflareImageId, isLegacyImageUrl } from "@/lib/cloudflare-images"

type ValidateImageRefOptions = {
  allowLegacy?: boolean
  fieldName?: string
}

const warnedLegacyRefs = new Set<string>()

const warnLegacyRef = (fieldName: string, ref: string) => {
  if (process.env.NODE_ENV === "production") return
  const key = `${fieldName}:${ref}`
  if (warnedLegacyRefs.has(key)) return
  warnedLegacyRefs.add(key)
  console.warn(
    `[image-validation] Legacy image URL accepted for ${fieldName}. Migrate this value to a Cloudflare Image ID when safe.`,
    { fieldName, ref },
  )
}

export function validateImageRef(
  ref: unknown,
  options: ValidateImageRefOptions = {},
): string | null {
  const { allowLegacy = false, fieldName = "image ref" } = options

  if (ref === null || ref === undefined || ref === "") return null
  if (typeof ref !== "string") {
    throw new Error(`${fieldName} must be a string image reference`)
  }

  const trimmed = ref.trim()
  if (!trimmed) return null

  if (isCloudflareImageId(trimmed)) return trimmed

  if (allowLegacy && isLegacyImageUrl(trimmed)) {
    warnLegacyRef(fieldName, trimmed)
    return trimmed
  }

  throw new Error(
    `${fieldName} must be a Cloudflare Image ID${
      allowLegacy ? " or an existing legacy http(s) URL" : ""
    }`,
  )
}

export function validateImageRefArray(
  refs: unknown,
  fieldName = "images",
  options: ValidateImageRefOptions = {},
): string[] {
  if (refs === null || refs === undefined || refs === "") return []
  if (!Array.isArray(refs)) {
    throw new Error(`${fieldName} must be an array of image references`)
  }

  const seen = new Set<string>()
  const validated: string[] = []

  refs.forEach((ref, index) => {
    const value = validateImageRef(ref, {
      ...options,
      fieldName: `${fieldName}[${index}]`,
    })
    if (!value || seen.has(value)) return
    seen.add(value)
    validated.push(value)
  })

  return validated
}
