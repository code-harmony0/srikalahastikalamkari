#!/usr/bin/env node
/**
 * Update Database Image Paths
 * Replaces .blob extensions with correct extensions (.jpg/.png/.webp)
 * Uses raw /object/public/ URLs (no transformations)
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "products";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const stats = {
  total: 0,
  updated: 0,
  skipped: 0,
  failed: 0,
  errors: [],
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

/**
 * List all files in storage bucket
 */
async function listAllFiles() {
  const files = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(undefined, { limit, offset });

    if (error) {
      log("error", `Failed to list files: ${error.message}`);
      break;
    }

    if (!data || data.length === 0) break;

    files.push(...data);
    offset += limit;
  }

  return files;
}

/**
 * Build mapping of old .blob names to new extension names
 */
function buildFileMapping(files) {
  const mapping = {};

  for (const file of files) {
    const name = file.name;
    if (!name) continue;

    // If it's a .blob file, find its replacement
    if (name.endsWith(".blob")) {
      const baseName = name.replace(".blob", "");
      // Look for matching file with new extension
      const replacement = files.find(
        (f) =>
          f.name.startsWith(baseName) &&
          !f.name.endsWith(".blob") &&
          (f.name.endsWith(".jpg") ||
            f.name.endsWith(".png") ||
            f.name.endsWith(".webp"))
      );

      if (replacement) {
        mapping[name] = replacement.name;
      }
    }
  }

  return mapping;
}

/**
 * Update product images in database
 */
async function updateProductImages(fileMapping) {
  log("info", "Fetching all products...");

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, images");

  if (error) {
    log("error", `Failed to fetch products: ${error.message}`);
    return;
  }

  log("info", `Found ${products.length} products`);

  for (const product of products) {
    stats.total++;

    if (!product.images || !Array.isArray(product.images)) {
      stats.skipped++;
      continue;
    }

    const originalImages = [...product.images];
    const updatedImages = product.images.map((url) => {
      if (typeof url !== "string") return url;

      // Check if URL contains a .blob file
      const blobMatch = url.match(/([^/]+\.blob)(\?.*)?$/);
      if (!blobMatch) return url;

      const blobName = blobMatch[1];
      const newName = fileMapping[blobName];

      if (!newName) {
        log("warn", `No mapping found for ${blobName} in product ${product.id}`);
        return url;
      }

      // Replace .blob with new extension
      return url.replace(blobName, newName).split("?")[0]; // Remove query params
    });

    // Check if any changes were made
    const hasChanges = originalImages.some(
      (orig, idx) => orig !== updatedImages[idx]
    );

    if (!hasChanges) {
      stats.skipped++;
      continue;
    }

    // Update the product
    const { error: updateError } = await supabase
      .from("products")
      .update({ images: updatedImages })
      .eq("id", product.id);

    if (updateError) {
      log("error", `Failed to update product ${product.id}: ${updateError.message}`);
      stats.failed++;
      stats.errors.push({
        product: product.id,
        error: updateError.message,
      });
    } else {
      log("success", `Updated product ${product.id}: ${product.name}`);
      stats.updated++;
    }
  }
}

/**
 * Main execution
 */
async function main() {
  log("info", "=".repeat(60));
  log("info", "Database Image Path Update");
  log("info", "=".repeat(60));
  log("info", `Supabase URL: ${SUPABASE_URL}`);
  log("info", `Bucket: ${BUCKET_NAME}`);
  log("info", "");

  // List all files in storage
  log("info", "Listing files in storage...");
  const files = await listAllFiles();
  log("info", `Found ${files.length} files in bucket`);

  // Build mapping
  log("info", "Building file mapping...");
  const fileMapping = buildFileMapping(files);
  const mappingCount = Object.keys(fileMapping).length;
  log("info", `Mapped ${mappingCount} .blob files to new extensions`);

  if (mappingCount === 0) {
    log("warn", "No .blob files found that need updating");
    return;
  }

  // Show sample mappings
  log("info", "Sample mappings:");
  Object.entries(fileMapping)
    .slice(0, 5)
    .forEach(([old, new_]) => {
      log("info", `  ${old} → ${new_}`);
    });

  // Update database
  log("info", "");
  log("info", "Updating database...");
  await updateProductImages(fileMapping);

  // Summary
  log("info", "");
  log("info", "=".repeat(60));
  log("info", "SUMMARY");
  log("info", "=".repeat(60));
  log("info", `Total products checked: ${stats.total}`);
  log("info", `Products updated: ${stats.updated}`);
  log("info", `Products skipped (no changes): ${stats.skipped}`);
  log("info", `Products failed: ${stats.failed}`);

  if (stats.errors.length > 0) {
    log("info", "");
    log("info", "Errors:");
    stats.errors.forEach((e) => {
      log("error", `  ${e.product}: ${e.error}`);
    });
  }

  log("info", "");
  log("info", "✅ Database update complete!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
