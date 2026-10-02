/**
 * Backfill Script — generates human-readable SKUs for all existing products.
 *
 * Usage:  node scripts/backfill-skus.mjs
 *
 * SKU format: {CATEGORY}-{MATERIAL}-{SEQ}  e.g. SAR-TSK-001
 *
 * The script:
 *  1. Fetches all categories and products
 *  2. Derives a prefix from category name + product name
 *  3. Assigns a unique sequence number per prefix-pair
 *  4. Writes the SKU into both `sku` and `barcode` columns (merge strategy)
 *  5. Prints a summary
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// ─── Inline SKU logic (matches src/shared/lib/sku-generator.ts) ─────────────

const CATEGORY_PREFIXES = {
  sarees: "SAR", saree: "SAR",
  duppattas: "DUP", duppatta: "DUP", dupatta: "DUP",
  "running fabrics": "FAB", fabric: "FAB",
  "wall paintings": "ART", painting: "ART", canvas: "ART",
  "men's wear": "MEN", pancha: "MEN", "pancha kanduva": "MEN",
};

const MATERIAL_PREFIXES = {
  "tussar silk": "TSK", tussar: "TSK", "moonga tussar": "MTK",
  "bangalore silk": "BSK", "banglore silk": "BSK",
  "kanchi silk": "KSK", kanchipuram: "KSK", kanchipattu: "KPT",
  "crepe silk": "CSK", "semi crepe silk": "SCS", "pure crepe silk": "PCS",
  "satin silk": "STK", "dola silk": "DSK", "tissue silk": "TSL",
  pochampalli: "PCH", "semi silk": "SSK", "pure silk": "PSK",
  "soft silk": "SFK", "pythani pattu": "PPT",
  chanderi: "CHD", chandari: "CHD",
  cotton: "CTN", linen: "LIN", "linen tissue": "LTI",
  organza: "ORG", georgette: "GEO", "raw silk": "RSK",
};

function getCategoryPrefix(categoryName) {
  if (!categoryName) return "SKK";
  const lower = categoryName.toLowerCase().trim();
  if (CATEGORY_PREFIXES[lower]) return CATEGORY_PREFIXES[lower];
  for (const [key, prefix] of Object.entries(CATEGORY_PREFIXES)) {
    if (lower.includes(key)) return prefix;
  }
  return lower.replace(/[^a-z]/g, "").substring(0, 3).toUpperCase() || "SKK";
}

function getMaterialPrefix(productName, categoryName, material) {
  const sources = [material, categoryName, productName].filter(Boolean).map((s) => s.toLowerCase().trim());
  const sortedKeys = Object.keys(MATERIAL_PREFIXES).sort((a, b) => b.length - a.length);
  for (const source of sources) {
    for (const key of sortedKeys) {
      if (source.includes(key)) return MATERIAL_PREFIXES[key];
    }
  }
  return "GEN";
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏷️  SKU Backfill Script");
  console.log("═".repeat(60));

  // 1. Fetch categories
  const { data: categories, error: catErr } = await supabase.from("categories").select("id, name");
  if (catErr) { console.error("❌ Failed to load categories:", catErr); process.exit(1); }
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  console.log(`📂 Loaded ${categories.length} categories`);

  // 2. Fetch all products (ordered by creation date for stable sequencing)
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, sku, barcode, category_id, material")
    .order("created_at", { ascending: true });
  if (prodErr) { console.error("❌ Failed to load products:", prodErr); process.exit(1); }
  console.log(`📦 Loaded ${products.length} products`);

  // 3. Generate SKUs
  const seqCounters = new Map(); // "SAR-TSK" → next number
  const updates = [];
  let skipped = 0;

  for (const product of products) {
    // Skip products that already have a human-readable SKU
    if (product.sku && /^[A-Z]{2,4}-[A-Z]{2,4}-\d{3,}$/.test(product.sku)) {
      skipped++;
      continue;
    }

    const categoryName = catMap.get(product.category_id) || null;
    const catPrefix = getCategoryPrefix(categoryName);
    const matPrefix = getMaterialPrefix(product.name, categoryName, product.material);
    const prefixKey = `${catPrefix}-${matPrefix}`;

    const seq = (seqCounters.get(prefixKey) || 0) + 1;
    seqCounters.set(prefixKey, seq);

    const sku = `${prefixKey}-${String(seq).padStart(3, "0")}`;
    updates.push({ id: product.id, sku, name: product.name });
  }

  console.log(`\n⏭️  Skipped ${skipped} products (already have SKU)`);
  console.log(`🏷️  Generated ${updates.length} new SKUs\n`);

  // Print preview of first 15
  console.log("Preview (first 15):");
  console.log("─".repeat(60));
  updates.slice(0, 15).forEach((u) => {
    console.log(`  ${u.sku.padEnd(14)} │ ${u.name.substring(0, 50)}`);
  });
  if (updates.length > 15) console.log(`  ... and ${updates.length - 15} more`);
  console.log("─".repeat(60));

  // Print prefix distribution
  console.log("\nSKU Prefix Distribution:");
  const prefixCounts = {};
  updates.forEach((u) => {
    const prefix = u.sku.split("-").slice(0, 2).join("-");
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
  });
  Object.entries(prefixCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([prefix, count]) => {
      console.log(`  ${prefix.padEnd(10)} → ${count} products`);
    });

  // 4. Write to database in batches
  console.log(`\n💾 Writing ${updates.length} SKUs to database...`);
  let success = 0;
  let errors = 0;

  for (const update of updates) {
    const { error } = await supabase
      .from("products")
      .update({ sku: update.sku, barcode: update.sku }) // Merge: barcode = sku
      .eq("id", update.id);

    if (error) {
      console.error(`  ❌ Failed: ${update.sku} (${update.name.substring(0, 30)}): ${error.message}`);
      errors++;
    } else {
      success++;
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`✅ Success: ${success}`);
  if (errors > 0) console.log(`❌ Errors:  ${errors}`);
  console.log(`📊 Total:   ${products.length} products`);
  console.log(`${"═".repeat(60)}`);
}

main().catch(console.error);
