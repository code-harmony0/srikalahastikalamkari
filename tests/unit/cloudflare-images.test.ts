import {
  isCloudflareImageId,
  resolveProductImageSrc,
} from "@/lib/cloudflare-images"

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
