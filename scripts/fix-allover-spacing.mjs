import fs from "node:fs/promises"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })
dotenv.config()

for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
  if (!process.env[k]) {
    console.error(`Missing ${k} in .env.local`)
    process.exit(1)
  }
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function run() {
  const { data: products, error } = await db
    .from("products")
    .select("id, name, description")
    .or("description.ilike.%allover%,name.ilike.%allover%")

  if (error) {
    console.error("Error fetching products:", error)
    process.exit(1)
  }

  console.log(`Found ${products.length} products with 'allover'.`)

  // Save backup
  await fs.writeFile("scripts/allover-backup.json", JSON.stringify(products, null, 2), "utf8")
  console.log("Saved backup to scripts/allover-backup.json")

  const fixText = (text) => {
    if (!text) return text
    return text
      .replace(/\ballover\s+/gi, "all over ")
      .replace(/\ballover\b/gi, "all over")
  }

  let updatedCount = 0
  for (const product of products) {
    const newName = fixText(product.name)
    const newDescription = fixText(product.description)

    const updates = {}
    if (newName !== product.name) updates.name = newName
    if (newDescription !== product.description) updates.description = newDescription

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await db
        .from("products")
        .update(updates)
        .eq("id", product.id)

      if (updateError) {
        console.error(`Failed to update product ${product.id}:`, updateError)
      } else {
        updatedCount++
        console.log(`Updated product ${product.id}:`, updates)
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} products.`)
}

run().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
