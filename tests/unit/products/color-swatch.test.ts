import { getColorSwatch, hasSelectableColors } from "@/shared/lib/color-swatch"

describe("getColorSwatch", () => {
  it("resolves common color names to hex", () => {
    expect(getColorSwatch("Red")).toBe("#DC2626")
    expect(getColorSwatch("black")).toBe("#111111")
  })

  it("is case and whitespace insensitive", () => {
    expect(getColorSwatch("  INDIGO  ")).toBe(getColorSwatch("indigo"))
  })

  it("resolves traditional Kalamkari palette names", () => {
    expect(getColorSwatch("Terracotta")).toBeTruthy()
    expect(getColorSwatch("Mustard")).toBeTruthy()
    expect(getColorSwatch("Off White")).toBeTruthy()
  })

  it("normalises separators so 'off-white' and 'Off White' match", () => {
    expect(getColorSwatch("off-white")).toBe(getColorSwatch("Off White"))
    expect(getColorSwatch("off_white")).toBe(getColorSwatch("Off White"))
  })

  it("accepts raw hex values as-is", () => {
    expect(getColorSwatch("#A1B2C3")).toBe("#A1B2C3")
    expect(getColorSwatch("#abc")).toBe("#abc")
  })

  it("matches multi-word names by their base color", () => {
    expect(getColorSwatch("Deep Maroon")).toBe(getColorSwatch("Maroon"))
  })

  it("returns null for unknown names", () => {
    expect(getColorSwatch("Kalamkari Special")).toBeNull()
    expect(getColorSwatch("")).toBeNull()
  })
})

describe("hasSelectableColors", () => {
  it("is false when there is nothing to choose between", () => {
    expect(hasSelectableColors(undefined)).toBe(false)
    expect(hasSelectableColors([])).toBe(false)
    expect(hasSelectableColors(["Red"])).toBe(false)
  })

  it("ignores blank entries", () => {
    expect(hasSelectableColors(["Red", "  ", ""])).toBe(false)
  })

  it("is true with two or more real options", () => {
    expect(hasSelectableColors(["Red", "Blue"])).toBe(true)
  })

  it("tolerates non-array input", () => {
    expect(hasSelectableColors("Red" as unknown as string[])).toBe(false)
  })
})

import { parseColorEntry, formatColorEntry } from "@/shared/lib/color-swatch"

describe("parseColorEntry", () => {
  it("splits the stored 'Name|#hex' format", () => {
    expect(parseColorEntry("Deep Maroon|#7B1E23")).toEqual({
      name: "Deep Maroon",
      hex: "#7B1E23",
    })
  })

  it("never shows a bare hex code as the customer-facing name", () => {
    expect(parseColorEntry("#DC2626").name).not.toContain("#")
  })

  it("recovers a friendly name for legacy hex-only values", () => {
    expect(parseColorEntry("#DC2626")).toEqual({ name: "Red", hex: "#DC2626" })
  })

  it("falls back to 'Colour' for an unrecognised legacy hex", () => {
    expect(parseColorEntry("#123456")).toEqual({ name: "Colour", hex: "#123456" })
  })

  it("resolves a legacy plain name to its swatch", () => {
    expect(parseColorEntry("Indigo")).toEqual({ name: "Indigo", hex: "#2B3A67" })
  })

  it("keeps an unknown plain name with no swatch", () => {
    expect(parseColorEntry("Peacock Motif")).toEqual({
      name: "Peacock Motif",
      hex: null,
    })
  })

  it("trims whitespace around both halves", () => {
    expect(parseColorEntry("  Rust  |  #B7410E  ")).toEqual({
      name: "Rust",
      hex: "#B7410E",
    })
  })

  it("round-trips through formatColorEntry", () => {
    expect(parseColorEntry(formatColorEntry("Mustard", "#C9A227"))).toEqual({
      name: "Mustard",
      hex: "#C9A227",
    })
  })
})

describe("legacy dashboard palette", () => {
  it.each([
    ["#FFA500", "Orange"],
    ["#F5F5DC", "Beige"],
    ["#800000", "Maroon"],
    ["#D2691E", "Terracotta"],
    ["#E6E6FA", "Lavender"],
    ["#C0C0C0", "Silver"],
  ])("names the old hex %s as %s", (hex, name) => {
    expect(parseColorEntry(hex).name).toBe(name)
  })

  it("never falls back to the generic label for a legacy palette colour", () => {
    const legacy = ["#FF0000", "#00FF00", "#0000FF", "#FFC0CB", "#A52A2A", "#F0E68C"]
    for (const hex of legacy) {
      expect(parseColorEntry(hex).name).not.toBe("Colour")
    }
  })
})

describe("legacy hex names are unambiguous", () => {
  it("distinguishes the two legacy greens", () => {
    const a = parseColorEntry("#00FF00").name
    const b = parseColorEntry("#008000").name
    expect(a).not.toBe(b)
  })

  it("resolves both to a usable swatch", () => {
    expect(parseColorEntry("#00FF00").hex).toBeTruthy()
    expect(parseColorEntry("#008000").hex).toBeTruthy()
  })
})
