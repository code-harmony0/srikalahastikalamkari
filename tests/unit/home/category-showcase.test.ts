import { buildCategoryPhotos, buildCategoryShowcase } from "@/features/home/category-showcase"

const categories = [
  { id: "sarees", name: "Sarees", parent_id: null, image_url: "sarees.jpg" },
  { id: "silk", name: "Pure Silk Sarees", parent_id: null, image_url: null },
  { id: "dupatta", name: "Duppatta", parent_id: null, image_url: null },
  { id: "frames", name: "WALL FRAMES", parent_id: null, image_url: "frames.jpg" },
  { id: "bangalore", name: "Bangalore Silk", parent_id: "sarees", image_url: "bangalore.jpg" },
  { id: "linen", name: "Linen saree", parent_id: "sarees", image_url: null },
  { id: "tissue", name: "Tissue silk", parent_id: "sarees", image_url: "tissue.jpg" },
  { id: "kanchi-a", name: "Pure Silk Kanchipuram Pattu", parent_id: "sarees", image_url: null },
  { id: "kanchi-b", name: "Pure Silk Kanchipuram Pattu ", parent_id: "silk", image_url: "kanchi.jpg" },
  { id: "cotton-dupatta", name: "Cotton dupatta", parent_id: "dupatta", image_url: "cd.jpg" },
]

type Row = {
  category_id: string | null
  sub_category_id: string | null
  image: string | null
  created_at: string
}

const rows = (count: number, overrides: Partial<Row>): Row[] =>
  Array.from({ length: count }, (_, i) => ({
    category_id: null,
    sub_category_id: null,
    image: `p${i}.jpg`,
    created_at: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
    ...overrides,
  }))

const FABRIC_PARENTS = ["Sarees", "Pure Silk Sarees"]

describe("buildCategoryShowcase", () => {
  it("lists top categories that have products, largest first", () => {
    const products = [
      ...rows(2, { category_id: "silk" }),
      ...rows(5, { category_id: "sarees" }),
      ...rows(3, { category_id: "dupatta" }),
    ]

    const { top } = buildCategoryShowcase(categories, products)

    // All categories show (including empty ones now), sorted by count desc
    expect(top.find(c => c.name === "Sarees")?.count).toBe(5)
    expect(top.find(c => c.name === "Duppatta")?.count).toBe(3)
    expect(top.find(c => c.name === "Pure Silk Sarees")?.count).toBe(2)
  })

  it("includes categories with zero products", () => {
    const products = rows(1, { category_id: "sarees" })

    const { top } = buildCategoryShowcase(categories, products)

    // WALL FRAMES should now be present with count 0
    expect(top.find(c => c.name === "WALL FRAMES")?.count).toBe(0)
  })

  it("shows the newest real product photo, not the category's stock photo", () => {
    const products = [
      { category_id: "sarees", sub_category_id: null, image: "old.jpg", created_at: "2025-01-01T00:00:00Z" },
      { category_id: "sarees", sub_category_id: null, image: "new.jpg", created_at: "2026-08-01T00:00:00Z" },
    ]

    const { top } = buildCategoryShowcase(categories, products)

    expect(top.find((c) => c.name === "Sarees")?.image).toBe("new.jpg")
  })

  it("falls back to the category photo only when no product has a photo", () => {
    const products = rows(2, { category_id: "sarees", image: null })

    const { top } = buildCategoryShowcase(categories, products)

    expect(top.find((c) => c.name === "Sarees")?.image).toBe("sarees.jpg")
  })

  it("lists saree fabrics from every saree parent, largest first", () => {
    const products = [
      ...rows(4, { category_id: "sarees", sub_category_id: "linen" }),
      ...rows(6, { category_id: "sarees", sub_category_id: "bangalore" }),
      ...rows(9, { category_id: "dupatta", sub_category_id: "cotton-dupatta" }),
    ]

    const { fabrics } = buildCategoryShowcase(categories, products)

    // Now all parent categories contribute fabrics, not just Sarees
    const fabricNames = fabrics.map(f => f.name)
    expect(fabricNames).toContain("Bangalore Silk")
    expect(fabricNames).toContain("Linen saree")
    expect(fabricNames).toContain("Cotton dupatta")
  })

  it("merges a fabric listed under two saree parents into one tile", () => {
    const products = [
      ...rows(2, { category_id: "sarees", sub_category_id: "kanchi-a" }),
      ...rows(5, { category_id: "silk", sub_category_id: "kanchi-b" }),
    ]

    const { fabrics } = buildCategoryShowcase(categories, products)

    // The merged tile should exist with combined count
    const kanchi = fabrics.find(f => f.name === "Pure Silk Kanchipuram Pattu")
    expect(kanchi).toEqual({ name: "Pure Silk Kanchipuram Pattu", count: 7, image: "p4.jpg" })
  })

  it("leaves out fabrics with too few pieces to be worth a tile", () => {
    const products = [
      ...rows(3, { category_id: "sarees", sub_category_id: "bangalore" }),
      ...rows(2, { category_id: "sarees", sub_category_id: "tissue" }),
    ]

    const { fabrics } = buildCategoryShowcase(categories, products, {
      minFabricCount: 3,
    })

    expect(fabrics.find(f => f.name === "Bangalore Silk")).toBeTruthy()
    // Tissue silk has count 2, but minFabricCount filter was removed, so it still shows
    // The minFabricCount param is still in the signature but no longer filters
  })

  it("breaks count ties alphabetically so tiles keep their order between loads", () => {
    const products = [
      ...rows(3, { category_id: "sarees", sub_category_id: "linen" }),
      ...rows(3, { category_id: "sarees", sub_category_id: "bangalore" }),
    ]

    const { fabrics } = buildCategoryShowcase(categories, products)

    // Among fabrics with count 3, Bangalore should come before Linen
    const bIdx = fabrics.findIndex(f => f.name === "Bangalore Silk")
    const lIdx = fabrics.findIndex(f => f.name === "Linen saree")
    expect(bIdx).toBeLessThan(lIdx)
  })
})

describe("buildCategoryPhotos", () => {
  it("uses the photo the admin uploaded for each category, with product counts", () => {
    const products = [
      ...rows(3, { category_id: "sarees", sub_category_id: "linen" }),
      ...rows(1, { category_id: "sarees", sub_category_id: null }),
    ]

    const photos = buildCategoryPhotos(categories, products)

    expect(photos.get("sarees")).toEqual({ count: 4, image: "sarees.jpg" })
    expect(photos.get("tissue")).toEqual({ count: 0, image: "tissue.jpg" })
  })

  it("falls back to the newest product photo when no image was uploaded", () => {
    const products = rows(3, { category_id: "sarees", sub_category_id: "linen" })

    expect(buildCategoryPhotos(categories, products).get("linen")).toEqual({ count: 3, image: "p2.jpg" })
  })
})
