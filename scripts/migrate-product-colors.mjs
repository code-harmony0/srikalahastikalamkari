/**
 * Normalises products.colors from raw hex to the "Name|#hex" format the
 * storefront reads, so the catalogue carries real colour names in the data
 * rather than the app inferring them on every render.
 *
 * The colour tables come from src/shared/lib/color-palette.json — the same
 * file the app uses — so this script can never drift from the storefront.
 *
 *   node scripts/migrate-product-colors.mjs                 # dry run
 *   node scripts/migrate-product-colors.mjs --preview=f.json # full list to file
 *   node scripts/migrate-product-colors.mjs --apply          # write
 *   node scripts/migrate-product-colors.mjs --revert=bak.json
 */
import fs from "node:fs/promises"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import palette from "../src/shared/lib/color-palette.json" with { type: "json" }

dotenv.config({ path: ".env.local" })
dotenv.config()

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const arg = (n, d) => {
  const f = argv.find((a) => a.startsWith(`${n}=`))
  return f ? f.slice(n.length + 1) : d
}
const apply = has("--apply")
const previewPath = arg("--preview", null)
const revertPath = arg("--revert", null)
const backupPath = arg("--backup", "product-colors-backup.json")
const CHUNK = 100

for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[k]) { console.error(`Missing ${k} in .env.local`); process.exit(1) }
}
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

/** Writes rows back in chunks rather than one request per product. */
async function writeRows(rows) {
  let ok = 0, failed = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK)
    const { error } = await db.from("products").upsert(slice, { onConflict: "id" })
    if (error) { failed += slice.length; console.error(`  chunk ${i / CHUNK + 1}: ${error.message}`) }
    else { ok += slice.length; process.stdout.write(`  ${ok}/${rows.length}\r`) }
  }
  return { ok, failed }
}

// --- revert path: restore straight from a backup file ---
if (revertPath) {
  const backup = JSON.parse(await fs.readFile(revertPath, "utf8"))
  console.log(`\nReverting ${backup.length} product(s) from ${revertPath}`)
  const { ok, failed } = await writeRows(backup.map((b) => ({ id: b.id, colors: b.colors })))
  console.log(`\nReverted ${ok}, failed ${failed}\n`)
  process.exit(failed ? 1 : 0)
}

const { swatches, legacyHexNames } = palette
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const norm = (n) => n.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ")

const swatchFor = (name) => {
  const k = norm(name)
  if (swatches[k]) return swatches[k]
  const w = k.split(" ")
  for (let i = w.length - 1; i >= 0; i--) if (swatches[w[i]]) return swatches[w[i]]
  return null
}

/** Normalised value, or null when it cannot be improved. */
const normalise = (v) => {
  const raw = (v ?? "").trim()
  if (!raw || raw.includes("|")) return null            // already migrated
  if (HEX.test(raw)) {
    const name = legacyHexNames[raw.toLowerCase()]
    return name ? `${name}|${raw.toUpperCase()}` : null // unknown hex: leave for a human
  }
  const hex = swatchFor(raw)
  return hex ? `${raw}|${hex}` : null
}

const { data: products, error } = await db
  .from("products").select("id, name, colors").not("colors", "is", null)
if (error) { console.error("Fetch failed:", error.message); process.exit(1) }

const changes = []
let unknown = 0
for (const p of products) {
  const colors = Array.isArray(p.colors) ? p.colors : []
  if (!colors.length) continue
  let touched = false
  const after = colors.map((c) => {
    const out = normalise(c)
    if (out) { touched = true; return out }
    if (typeof c === "string" && HEX.test(c.trim())) unknown++
    return c
  })
  // A product showing the same name twice is worse than showing hex.
  const names = after.map((c) => String(c).split("|")[0].toLowerCase())
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  if (touched) changes.push({ id: p.id, name: p.name, before: colors, after, dupes: [...new Set(dupes)] })
}

const withDupes = changes.filter((c) => c.dupes.length)
console.log(`\nProducts with colours : ${products.length}`)
console.log(`Products to update    : ${changes.length}`)
console.log(`Unknown hex left as-is: ${unknown}`)
console.log(`Duplicate name warning: ${withDupes.length}\n`)

for (const c of changes.slice(0, 8)) {
  console.log(`  ${(c.name || c.id).slice(0, 44)}`)
  console.log(`    ${JSON.stringify(c.before)}`)
  console.log(` -> ${JSON.stringify(c.after)}`)
}
if (changes.length > 8) console.log(`  ... and ${changes.length - 8} more`)

if (withDupes.length) {
  console.log(`\n  Products where two swatches would share a name:`)
  for (const c of withDupes.slice(0, 10))
    console.log(`    ${(c.name || c.id).slice(0, 44)} -> ${c.dupes.join(", ")}`)
}

if (previewPath) {
  await fs.writeFile(previewPath, JSON.stringify(changes, null, 2))
  console.log(`\nFull list written to ${previewPath} (nothing changed in the database)\n`)
  process.exit(0)
}

if (!apply) {
  console.log("\nDRY RUN - nothing written. Re-run with --apply to save.\n")
  process.exit(0)
}

await fs.writeFile(backupPath, JSON.stringify(
  changes.map(({ id, name, before }) => ({ id, name, colors: before })), null, 2))
console.log(`Backup -> ${backupPath}`)
console.log(`Writing in chunks of ${CHUNK}...`)
const { ok, failed } = await writeRows(changes.map((c) => ({ id: c.id, colors: c.after })))
console.log(`\nUpdated ${ok}, failed ${failed}`)
console.log(`Revert with: node scripts/migrate-product-colors.mjs --revert=${backupPath}\n`)
