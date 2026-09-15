import { pickGalleryPieces } from "@/features/home/gallery-pieces"

type Row = { id: string; categoryName: string; created_at: string; image: string | null }

const piece = (id: string, categoryName: string, day: number, image: string | null = `${id}.jpg`): Row => ({
  id,
  categoryName,
  created_at: `2026-08-${String(day).padStart(2, "0")}T00:00:00Z`,
  image,
})

describe("pickGalleryPieces", () => {
  it("mixes categories instead of showing one kind of work", () => {
    const rows = [
      piece("s1", "Sarees", 20),
      piece("s2", "Sarees", 19),
      piece("s3", "Sarees", 18),
      piece("d1", "Duppatta", 10),
      piece("w1", "Wall Paintings", 5),
    ]

    const picked = pickGalleryPieces(rows, { limit: 4 })

    expect(picked.map((p) => p.id)).toEqual(["s1", "d1", "w1", "s2"])
  })

  it("takes the newest piece first within each category", () => {
    const rows = [piece("old", "Sarees", 1), piece("new", "Sarees", 25), piece("mid", "Sarees", 12)]

    expect(pickGalleryPieces(rows, { limit: 3 }).map((p) => p.id)).toEqual(["new", "mid", "old"])
  })

  it("starts with the kinds of work the shop has most of", () => {
    const rows = [
      piece("w1", "Wall Paintings", 28),
      piece("d1", "Duppatta", 9),
      piece("d2", "Duppatta", 8),
      piece("s1", "Sarees", 6),
      piece("s2", "Sarees", 5),
      piece("s3", "Sarees", 4),
    ]

    expect(pickGalleryPieces(rows, { limit: 3 }).map((p) => p.id)).toEqual(["s1", "d1", "w1"])
  })

  it("skips pieces without a photo and pieces already shown elsewhere", () => {
    const rows = [piece("s1", "Sarees", 20, null), piece("s2", "Sarees", 19), piece("d1", "Duppatta", 18)]

    const picked = pickGalleryPieces(rows, { limit: 5, exclude: ["d1"] })

    expect(picked.map((p) => p.id)).toEqual(["s2"])
  })

  it("stops at the limit", () => {
    const rows = Array.from({ length: 20 }, (_, i) => piece(`s${i}`, "Sarees", i + 1))

    expect(pickGalleryPieces(rows, { limit: 8 })).toHaveLength(8)
  })
})
