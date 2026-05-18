import {
  isCloudflareImageId,
  resolveProductImageSrc,
} from "@/lib/cloudflare-images"
import { validateImageRef } from "@/lib/image-validation"

describe("cloudflare image resolver", () => {
  const originalHash = process.env.NEXT_PUBLIC_CF_IMAGES_HASH

  beforeEach(() => {
    process.env.NEXT_PUBLIC_CF_IMAGES_HASH = "xGnXvGVZkNr8ZNcbFxAROQ"
  })

  afterAll(() => {
    if (originalHash === undefined) {
      delete process.env.NEXT_PUBLIC_CF_IMAGES_HASH
    } else {
      process.env.NEXT_PUBLIC_CF_IMAGES_HASH = originalHash
    }
  })

  it("accepts Cloudflare Images IDs returned during migration", () => {
    const imageId = "9f0ec24c-c2d6-4658-4d35-c6938f066d00"

    expect(isCloudflareImageId(imageId)).toBe(true)
    expect(resolveProductImageSrc(imageId, "medium")).toBe(
      "https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/9f0ec24c-c2d6-4658-4d35-c6938f066d00/medium",
    )
  })
})

describe("image write validation", () => {
  it("blocks new legacy URLs on image writes", () => {
    expect(() =>
      validateImageRef("https://example.com/new-product.jpg", {
        fieldName: "images[0]",
      }),
    ).toThrow("must be a Cloudflare Image ID")
  })

  it("allows unchanged legacy URLs only when explicitly allow-listed", () => {
    const legacyUrl = "https://example.com/existing-product.jpg"

    expect(
      validateImageRef(legacyUrl, {
        allowLegacy: true,
        allowedLegacyRefs: [legacyUrl],
        fieldName: "images[0]",
      }),
    ).toBe(legacyUrl)

    expect(() =>
      validateImageRef("https://example.com/new-product.jpg", {
        allowLegacy: true,
        allowedLegacyRefs: [legacyUrl],
        fieldName: "images[1]",
      }),
    ).toThrow("may only be preserved unchanged")
  })
})
