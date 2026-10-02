/**
 * SKU Generator — produces human-readable product identifiers.
 *
 * Format: {CATEGORY_PREFIX}-{MATERIAL_PREFIX}-{SEQ}
 *   e.g.  SAR-TSK-001, DUP-CTN-003, FAB-ORG-001
 *
 * The generator is stateless: callers must supply the next sequence number.
 */

// ─── Category → 3-letter prefix ─────────────────────────────────────────────

const CATEGORY_PREFIXES: Record<string, string> = {
  // Main product types
  sarees: "SAR",
  saree: "SAR",
  duppattas: "DUP",
  duppatta: "DUP",
  dupatta: "DUP",
  "running fabrics": "FAB",
  fabric: "FAB",
  "wall paintings": "ART",
  painting: "ART",
  canvas: "ART",
  "men's wear": "MEN",
  pancha: "MEN",
  "pancha kanduva": "MEN",
}

// ─── Material → 3-letter prefix ─────────────────────────────────────────────

const MATERIAL_PREFIXES: Record<string, string> = {
  // Silk types
  "tussar silk": "TSK",
  tussar: "TSK",
  "moonga tussar": "MTK",
  "bangalore silk": "BSK",
  "banglore silk": "BSK",
  "kanchi silk": "KSK",
  "kanchipuram": "KSK",
  "kanchipattu": "KPT",
  "crepe silk": "CSK",
  "semi crepe silk": "SCS",
  "pure crepe silk": "PCS",
  "satin silk": "STK",
  "dola silk": "DSK",
  "tissue silk": "TSL",
  "pochampalli": "PCH",
  "semi silk": "SSK",
  "pure silk": "PSK",
  "soft silk": "SFK",
  "pythani pattu": "PPT",
  chanderi: "CHD",
  chandari: "CHD",
  // Non-silk
  cotton: "CTN",
  linen: "LIN",
  "linen tissue": "LTI",
  organza: "ORG",
  georgette: "GEO",
  "raw silk": "RSK",
}

/**
 * Derive a 3-letter category prefix from a category name.
 * Falls back to the first 3 uppercase letters if no mapping exists.
 */
export function getCategoryPrefix(categoryName: string | null | undefined): string {
  if (!categoryName) return "SKK" // Srikalahasti Kalamkari (uncategorized)

  const lower = categoryName.toLowerCase().trim()

  // Exact match first
  if (CATEGORY_PREFIXES[lower]) return CATEGORY_PREFIXES[lower]

  // Partial match — does the category name contain a known key?
  for (const [key, prefix] of Object.entries(CATEGORY_PREFIXES)) {
    if (lower.includes(key)) return prefix
  }

  // Generate from first 3 consonants or characters
  const cleaned = lower.replace(/[^a-z]/g, "")
  return cleaned.substring(0, 3).toUpperCase() || "SKK"
}

/**
 * Derive a 3-letter material prefix from a product name + category name.
 * Examines both fields for material keywords.
 */
export function getMaterialPrefix(
  productName: string | null | undefined,
  categoryName: string | null | undefined,
  materialField: string | null | undefined,
): string {
  // Priority: explicit material field → category name → product name
  const sources = [materialField, categoryName, productName]
    .filter(Boolean)
    .map((s) => s!.toLowerCase().trim())

  for (const source of sources) {
    // Try exact match on material prefixes (longest key first for specificity)
    const sortedKeys = Object.keys(MATERIAL_PREFIXES).sort(
      (a, b) => b.length - a.length,
    )
    for (const key of sortedKeys) {
      if (source.includes(key)) return MATERIAL_PREFIXES[key]
    }
  }

  return "GEN" // Generic fallback
}

/**
 * Build a complete SKU string.
 *
 * @param categoryName - The product's category name (e.g. "Sarees", "Duppattas")
 * @param productName  - The product's display name (used to extract material hint)
 * @param material     - The explicit material field, if available
 * @param sequence     - The next sequential number for this category+material combo
 *
 * @returns e.g. "SAR-TSK-001"
 */
export function buildSku(
  categoryName: string | null | undefined,
  productName: string | null | undefined,
  material: string | null | undefined,
  sequence: number,
): string {
  const catPrefix = getCategoryPrefix(categoryName)
  const matPrefix = getMaterialPrefix(productName, categoryName, material)
  const seq = String(sequence).padStart(3, "0")
  return `${catPrefix}-${matPrefix}-${seq}`
}

/**
 * Parse an existing SKU into its parts.
 * Returns null if the SKU doesn't match the expected format.
 */
export function parseSku(sku: string): {
  category: string
  material: string
  sequence: number
} | null {
  const match = sku.match(/^([A-Z]{2,4})-([A-Z]{2,4})-(\d{3,})$/)
  if (!match) return null
  return {
    category: match[1],
    material: match[2],
    sequence: parseInt(match[3], 10),
  }
}
