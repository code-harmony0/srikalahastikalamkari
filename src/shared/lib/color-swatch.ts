import palette from "./color-palette.json"

/**
 * Maps human-entered colour names (as typed by admins in the product form)
 * to a hex value so the storefront can render a visual swatch instead of
 * raw text.
 */

const COLOR_SWATCHES: Record<string, string> = palette.swatches

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalise(name: string) {
  return name.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ")
}

/**
 * Returns a hex colour for a colour name, or null when it cannot be resolved
 * (the caller should then fall back to showing the name as text).
 */
export function getColorSwatch(name: string | null | undefined): string | null {
  if (!name) return null

  const raw = name.trim()
  if (HEX_PATTERN.test(raw)) return raw

  const key = normalise(raw)
  if (!key) return null
  if (COLOR_SWATCHES[key]) return COLOR_SWATCHES[key]

  // "Deep Maroon" / "Light Blue" -> fall back to the base colour word.
  const words = key.split(" ")
  for (let i = words.length - 1; i >= 0; i--) {
    const candidate = COLOR_SWATCHES[words[i]]
    if (candidate) return candidate
  }

  return null
}

/**
 * A colour picker is only meaningful when the customer has an actual choice.
 */
export function hasSelectableColors(colors: string[] | null | undefined): boolean {
  if (!Array.isArray(colors)) return false
  return colors.filter((color) => typeof color === "string" && color.trim().length > 0).length > 1
}

export type ColorEntry = { name: string; hex: string | null }

/**
 * The dashboard's original palette stored raw hex with no name. Mapping those
 * exact values back to friendly names means existing products read correctly
 * without anyone re-entering them.
 */
const LEGACY_HEX_NAMES: Record<string, string> = palette.legacyHexNames

/** Reverse lookup so legacy hex-only values still get a readable name. */
const HEX_TO_NAME: Record<string, string> = Object.entries(COLOR_SWATCHES).reduce(
  (acc, [name, hex]) => {
    const key = hex.toLowerCase()
    if (!acc[key]) {
      acc[key] = name.replace(/\b\w/g, (c) => c.toUpperCase())
    }
    return acc
  },
  { ...LEGACY_HEX_NAMES } as Record<string, string>,
)

/** Storage format written by the dashboard: "Deep Maroon|#7B1E23". */
export function formatColorEntry(name: string, hex: string) {
  return `${name.trim()}|${hex.trim()}`
}

/**
 * Turns a stored colour value into a display name plus swatch. Customers must
 * never see a raw hex code, so a legacy hex-only value is mapped back to a
 * friendly name (or a generic label when unrecognised).
 */
export function parseColorEntry(value: string): ColorEntry {
  const raw = (value ?? "").trim()

  if (raw.includes("|")) {
    const [namePart, hexPart] = raw.split("|")
    const name = namePart.trim()
    const hex = hexPart?.trim() || ""
    return {
      name: name || HEX_TO_NAME[hex.toLowerCase()] || "Colour",
      hex: HEX_PATTERN.test(hex) ? hex : getColorSwatch(name),
    }
  }

  if (HEX_PATTERN.test(raw)) {
    return { name: HEX_TO_NAME[raw.toLowerCase()] || "Colour", hex: raw }
  }

  return { name: raw, hex: getColorSwatch(raw) }
}
