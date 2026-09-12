import { buildSareeShowcase } from "@/features/home/saree-showcase"

const subCategories = [
  { id: "bangalore", name: "Bangalore Silk" },
  { id: "kanchi", name: "Pure Silk Kanchipuram Patty" },
  { id: "linen", name: "Linen saree" },
  { id: "tissue", name: "Tissue silk" },
]

type Row = {
  id: string
  price: number | null
  sub_category_id: string | null
  created_at: string
  is_featured?: boolean
}

let sequence = 0
const saree = (overrides: Partial<Row> = {}): Row => ({
  id: `p${++sequence}`,
  price: 10000,
  sub_category_id: null,
  created_at: "2026-01-01T00:00:00Z",
  ...overrides,
})
const sarees = (count: number, overrides: Partial<Row> = {}) =>
  Array.from({ length: count }, () => saree(overrides))

beforeEach(() => {
  sequence = 0
})

describe("buildSareeShowcase", () => {
  it("lists the newest sarees first, capped at the requested count", () => {
    const january = saree({ created_at: "2026-01-01T00:00:00Z" })
    const may = saree({ created_at: "2026-05-01T00:00:00Z" })
    const august = saree({ created_at: "2026-08-14T00:00:00Z" })

    const { newest } = buildSareeShowcase([january, august, may], subCategories, {
      newestLimit: 2,
    })

    expect(newest.map((p) => p.id)).toEqual([august.id, may.id])
  })

  it("puts featured sarees first, newest first within each group", () => {
    const oldFeatured = saree({ created_at: "2026-01-01T00:00:00Z", is_featured: true })
    const newPlain = saree({ created_at: "2026-08-01T00:00:00Z" })
    const newFeatured = saree({ created_at: "2026-07-01T00:00:00Z", is_featured: true })

    const { newest } = buildSareeShowcase([newPlain, oldFeatured, newFeatured], subCategories)

    expect(newest.map((p) => p.id)).toEqual([newFeatured.id, oldFeatured.id, newPlain.id])
  })

  it("starts the price at the cheapest priced saree, ignoring unpriced ones", () => {
    const rows = [
      saree({ price: 13999 }),
      saree({ price: 4999 }),
      saree({ price: null }),
      saree({ price: 0 }),
    ]

    expect(buildSareeShowcase(rows, subCategories).startingPrice).toBe(4999)
  })

  it("has no starting price when nothing is priced", () => {
    const rows = [saree({ price: null })]

    expect(buildSareeShowcase(rows, subCategories).startingPrice).toBeNull()
  })

  it("counts every saree in the total", () => {
    expect(buildSareeShowcase(sarees(3), subCategories).total).toBe(3)
  })

  it("groups sarees by fabric and orders collections by size", () => {
    const rows = [
      ...sarees(5, { sub_category_id: "linen" }),
      ...sarees(7, { sub_category_id: "bangalore" }),
      ...sarees(6, { sub_category_id: "kanchi" }),
    ]

    const { collections } = buildSareeShowcase(rows, subCategories)

    expect(collections.map((c) => [c.name, c.count])).toEqual([
      ["Bangalore Silk", 7],
      ["Pure Silk Kanchipuram Patty", 6],
      ["Linen saree", 5],
    ])
  })

  it("leaves out collections too small to fill a tile", () => {
    const rows = [
      ...sarees(5, { sub_category_id: "bangalore" }),
      ...sarees(4, { sub_category_id: "tissue" }),
    ]

    const { collections } = buildSareeShowcase(rows, subCategories)

    expect(collections.map((c) => c.name)).toEqual(["Bangalore Silk"])
  })

  it("ignores sarees with no fabric or a fabric that no longer exists", () => {
    const rows = [
      ...sarees(5, { sub_category_id: "bangalore" }),
      ...sarees(6, { sub_category_id: null }),
      ...sarees(6, { sub_category_id: "deleted-sub-category" }),
    ]

    const { collections } = buildSareeShowcase(rows, subCategories)

    expect(collections.map((c) => c.id)).toEqual(["bangalore"])
  })

  it("uses the newest saree in each collection as its cover", () => {
    const newest = saree({
      sub_category_id: "bangalore",
      created_at: "2026-08-14T00:00:00Z",
    })
    const rows = [
      ...sarees(4, { sub_category_id: "bangalore", created_at: "2025-01-01T00:00:00Z" }),
      newest,
    ]

    const { collections } = buildSareeShowcase(rows, subCategories)

    expect(collections[0].cover.id).toBe(newest.id)
  })

  it("caps the number of collections", () => {
    const rows = [
      ...sarees(8, { sub_category_id: "bangalore" }),
      ...sarees(7, { sub_category_id: "kanchi" }),
      ...sarees(6, { sub_category_id: "linen" }),
    ]

    const { collections } = buildSareeShowcase(rows, subCategories, {
      collectionLimit: 2,
    })

    expect(collections.map((c) => c.id)).toEqual(["bangalore", "kanchi"])
  })

  it("drops a trailing 'saree' from the tile label but keeps the name for filtering", () => {
    const fabrics = [
      { id: "bangalore", name: "Bangalore Silk" },
      { id: "chandari", name: "Chandar I sarees" },
      { id: "linen", name: "Linen saree" },
    ]
    const rows = [
      ...sarees(7, { sub_category_id: "bangalore" }),
      ...sarees(6, { sub_category_id: "chandari" }),
      ...sarees(5, { sub_category_id: "linen" }),
    ]

    const { collections } = buildSareeShowcase(rows, fabrics)

    expect(collections.map((c) => [c.name, c.label])).toEqual([
      ["Bangalore Silk", "Bangalore Silk"],
      ["Chandar I sarees", "Chandar I"],
      ["Linen saree", "Linen"],
    ])
  })

  it("keeps the full name as the label when stripping would leave nothing", () => {
    const rows = sarees(5, { sub_category_id: "only" })

    const { collections } = buildSareeShowcase(rows, [{ id: "only", name: "Sarees" }])

    expect(collections[0].label).toBe("Sarees")
  })

  it("breaks ties alphabetically so tiles do not reshuffle between loads", () => {
    const rows = [
      ...sarees(5, { sub_category_id: "linen" }),
      ...sarees(5, { sub_category_id: "bangalore" }),
    ]

    const { collections } = buildSareeShowcase(rows, subCategories)

    expect(collections.map((c) => c.name)).toEqual(["Bangalore Silk", "Linen saree"])
  })
})
