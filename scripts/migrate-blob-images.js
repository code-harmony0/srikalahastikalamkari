/**
 * Supabase .blob Image Migration Script
 *
 * Converts all .blob images to proper extensions (.jpg/.png/.webp)
 * Safely re-uploads and updates database without data loss
 *
 * Usage:
 * 1. Set environment variables:
 *    SUPABASE_URL=https://your-project.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 * 2. Run: node migrate-blob-images.js
 */

import { createClient } from "@supabase/supabase-js"
import fetch from "node-fetch"

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DRY_RUN = process.env.DRY_RUN === "true"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:")
  console.error("   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const BUCKET_NAME = "products"

// ============================================================================
// STATS & LOGGING
// ============================================================================

const stats = {
  total: 0,
  download: { success: 0, failed: [] },
  upload: { success: 0, failed: [] },
  verify: { success: 0, failed: [] },
  db: { success: 0, failed: [] },
  cleanup: { success: 0, failed: [] },
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString()
  const entry = `[${timestamp}] [${level}] ${message}`
  console.log(entry)
  if (data) console.log(JSON.stringify(data, null, 2))
}

// ============================================================================
// PHASE 2 — FETCH FILE LIST
// ============================================================================

async function fetchBlobFiles() {
  log("INFO", "🔍 Fetching file list from bucket...")

  const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list()

  if (error) {
    log("ERROR", "Failed to list files", error)
    throw error
  }

  const blobFiles = files.filter((f) => f.name.endsWith(".blob"))
  stats.total = blobFiles.length

  log("INFO", `📁 Found ${blobFiles.length} .blob files`)

  if (DRY_RUN) {
    log("DRY_RUN", "Files to migrate:")
    blobFiles.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name}`)
    })
  }

  return blobFiles
}

// ============================================================================
// PHASE 3 — DOWNLOAD & DETECT MIME
// ============================================================================

async function downloadAndDetect(file) {
  const oldName = file.name
  log("INFO", `📥 Downloading: ${oldName}`)

  try {
    const { data: fileData, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(oldName)

    if (error) throw new Error(`Download failed: ${error.message}`)

    stats.download.success++
    log("SUCCESS", `   ✅ Downloaded: ${oldName} (${fileData.size} bytes)`)

    // Trust MIME type from downloaded file, NOT filename
    const mimeType = fileData.type || "application/octet-stream"
    log("INFO", `   🔍 MIME type: ${mimeType}`)

    // Map MIME to extension
    let ext = "jpg" // default fallback
    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      ext = "jpg"
    } else if (mimeType === "image/png") {
      ext = "png"
    } else if (mimeType === "image/webp") {
      ext = "webp"
    } else if (mimeType.startsWith("image/")) {
      ext = "jpg" // fallback for other images
    }

    const baseName = oldName.replace(/\.blob$/, "")
    const newName = `${baseName}.${ext}`

    log("INFO", `   📝 Will rename to: ${newName}`)

    return { oldName, newName, fileData, mimeType, ext, skipped: false }
  } catch (error) {
    log("ERROR", `   ❌ Download failed: ${oldName}`, error.message)
    stats.download.failed.push({ file: oldName, error: error.message })
    return { oldName, skipped: true, error: error.message }
  }
}

// ============================================================================
// PHASE 4 — RE-UPLOAD
// ============================================================================

async function uploadFile({ oldName, newName, fileData, mimeType, ext }) {
  if (DRY_RUN) {
    log("DRY_RUN", `   Would upload: ${newName}`)
    return { oldName, newName, ext, mimeType, dryRun: true }
  }

  log("INFO", `   ⬆️  Uploading: ${newName}`)

  try {
    // Check if target exists
    const { data: existing } = await supabase.storage
      .from(BUCKET_NAME)
      .list(undefined, { search: newName })

    if (existing && existing.some((f) => f.name === newName)) {
      log("WARN", `   ⚠️  ${newName} already exists, skipping upload`)
      return { oldName, newName, ext, mimeType, skipped: true }
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(newName, fileData, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    stats.upload.success++
    log("SUCCESS", `   ✅ Uploaded: ${newName}`)

    return { oldName, newName, ext, mimeType, skipped: false }
  } catch (error) {
    log("ERROR", `   ❌ Upload failed: ${newName}`, error.message)
    stats.upload.failed.push({ file: oldName, newName, error: error.message })
    return { oldName, newName, ext, error: error.message, skipped: true }
  }
}

// ============================================================================
// PHASE 6 — UPDATE DATABASE (AFTER VERIFICATION)
// ============================================================================

async function updateDatabase({ oldName, newName, verified }) {
  if (!verified) {
    log("WARN", `   ⏭️  Skipping DB update (not verified): ${oldName}`)
    return { oldName, newName, dbUpdated: false }
  }

  if (DRY_RUN) {
    log("DRY_RUN", `   Would update DB: ${oldName} → ${newName}`)
    return { oldName, newName, dbUpdated: true, dryRun: true }
  }

  log("INFO", `   🔄 Updating DB: ${oldName} → ${newName}`)

  try {
    // Find only products containing this exact filename
    const { data: products, error: queryError } = await supabase
      .from("products")
      .select("id, name, images")
      .filter("images", "cs", `{${oldName}}`)

    if (queryError) throw new Error(`Query failed: ${queryError.message}`)

    if (!products || products.length === 0) {
      log("INFO", `   ℹ️  No products found with ${oldName}`)
      return { oldName, newName, dbUpdated: true, productsUpdated: 0 }
    }

    log("INFO", `   📋 Found ${products.length} products to update`)

    let updatedCount = 0
    for (const product of products) {
      // Update only the matching item in array, not all URLs
      const newImages = product.images.map((url) => {
        // Replace only if URL ends with the exact old filename
        if (url.endsWith(oldName)) {
          return url.replace(oldName, newName)
        }
        return url // Leave unrelated URLs unchanged
      })

      const { error: updateError } = await supabase
        .from("products")
        .update({ images: newImages })
        .eq("id", product.id)

      if (updateError) {
        log(
          "WARN",
          `   ⚠️  Failed to update product ${product.id}`,
          updateError.message,
        )
      } else {
        updatedCount++
        log("SUCCESS", `   ✅ Updated product: ${product.name || product.id}`)
      }
    }

    stats.db.success += updatedCount
    return { oldName, newName, dbUpdated: true, productsUpdated: updatedCount }
  } catch (error) {
    log("ERROR", `   ❌ DB update failed: ${oldName}`, error.message)
    stats.db.failed.push({ file: oldName, newName, error: error.message })
    return { oldName, newName, dbUpdated: false, error: error.message }
  }
}

// ============================================================================
// PHASE 5 — VERIFY (BEFORE DB UPDATE)
// ============================================================================

async function verifyFile({ oldName, newName }) {
  if (DRY_RUN) {
    log("DRY_RUN", `   Would verify: ${newName}`)
    return { oldName, newName, verified: true, dryRun: true }
  }

  log("INFO", `   🔍 Verifying: ${newName}`)

  const rawUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${newName}`
  const renderUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET_NAME}/${newName}?width=400`

  try {
    // Use GET for both checks (not HEAD)
    const rawRes = await fetch(rawUrl, { method: "GET" })
    if (!rawRes.ok) throw new Error(`RAW GET failed: ${rawRes.status}`)
    log("SUCCESS", `   ✅ RAW URL: ${rawRes.status}`)

    const renderRes = await fetch(renderUrl, { method: "GET" })
    if (!renderRes.ok) throw new Error(`RENDER GET failed: ${renderRes.status}`)
    log("SUCCESS", `   ✅ RENDER URL: ${renderRes.status}`)

    stats.verify.success++
    return { oldName, newName, verified: true, rawUrl, renderUrl }
  } catch (error) {
    log("ERROR", `   ❌ Verification failed: ${newName}`, error.message)
    stats.verify.failed.push({ file: oldName, newName, error: error.message })
    return { oldName, newName, verified: false, error: error.message }
  }
}

// ============================================================================
// PHASE 7 — CLEANUP (AFTER VERIFICATION + DB UPDATE)
// ============================================================================

async function cleanupFile({ oldName, newName, verified, dbUpdated }) {
  if (!verified || !dbUpdated) {
    log("WARN", `   ⏭️  Keeping old file (not ready): ${oldName}`)
    return false
  }

  if (DRY_RUN) {
    log("DRY_RUN", `   Would delete: ${oldName}`)
    return true
  }

  log("INFO", `   🗑️  Cleaning up: ${oldName}`)

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([oldName])

    if (error) throw new Error(`Remove failed: ${error.message}`)

    stats.cleanup.success++
    log("SUCCESS", `   ✅ Removed: ${oldName}`)
    return true
  } catch (error) {
    log("ERROR", `   ❌ Cleanup failed: ${oldName}`, error.message)
    stats.cleanup.failed.push({ file: oldName, error: error.message })
    return false
  }
}

// ============================================================================
// MAIN MIGRATION FLOW
// ============================================================================

async function runMigration() {
  log("INFO", "🚀 Starting .blob migration" + (DRY_RUN ? " (DRY RUN)" : ""))
  log("INFO", `📍 ${SUPABASE_URL}`)
  log("INFO", `📦 Bucket: ${BUCKET_NAME}`)

  try {
    const blobFiles = await fetchBlobFiles()

    if (blobFiles.length === 0) {
      log("INFO", "✅ No .blob files found. Done!")
      return
    }

    const results = []

    for (let i = 0; i < blobFiles.length; i++) {
      const file = blobFiles[i]
      log("INFO", `\n[${i + 1}/${blobFiles.length}] ${file.name}`)

      // Phase 3: Download
      const processed = await downloadAndDetect(file)
      if (processed.skipped) continue

      // Phase 4: Upload
      const uploaded = await uploadFile(processed)
      if (uploaded.skipped && !uploaded.dryRun) continue

      // Phase 5: Verify (BEFORE DB update)
      const verified = await verifyFile(uploaded)
      if (!verified.verified && !verified.dryRun) continue

      // Phase 6: Update DB (AFTER verification)
      const dbUpdated = await updateDatabase(verified)
      if (!dbUpdated.dbUpdated && !dbUpdated.dryRun) continue

      // Phase 7: Cleanup (AFTER verification + DB update)
      const cleaned = await cleanupFile(dbUpdated)

      results.push({
        oldName: file.name,
        newName: uploaded.newName,
        success:
          !processed.skipped &&
          !uploaded.skipped &&
          verified.verified &&
          dbUpdated.dbUpdated,
        cleaned,
      })
    }

    // Summary
    log("INFO", "\n" + "=".repeat(60))
    log("INFO", "📊 MIGRATION SUMMARY")
    log("INFO", "=".repeat(60))
    log("INFO", `Total files:         ${stats.total}`)
    log("INFO", `Downloaded:          ${stats.download.success}`)
    log("INFO", `Uploaded:            ${stats.upload.success}`)
    log("INFO", `Verified (both 200): ${stats.verify.success}`)
    log("INFO", `DB rows updated:     ${stats.db.success}`)
    log("INFO", `Cleaned up:          ${stats.cleanup.success}`)

    if (stats.download.failed.length > 0) {
      log("WARN", `\n❌ Download failures: ${stats.download.failed.length}`)
      stats.download.failed.forEach((f) =>
        log("WARN", `   - ${f.file}: ${f.error}`),
      )
    }
    if (stats.upload.failed.length > 0) {
      log("WARN", `\n❌ Upload failures: ${stats.upload.failed.length}`)
      stats.upload.failed.forEach((f) =>
        log("WARN", `   - ${f.file}: ${f.error}`),
      )
    }
    if (stats.verify.failed.length > 0) {
      log("WARN", `\n❌ Verification failures: ${stats.verify.failed.length}`)
      stats.verify.failed.forEach((f) =>
        log("WARN", `   - ${f.file}: ${f.error}`),
      )
    }
    if (stats.db.failed.length > 0) {
      log("WARN", `\n❌ DB update failures: ${stats.db.failed.length}`)
      stats.db.failed.forEach((f) => log("WARN", `   - ${f.file}: ${f.error}`))
    }
    if (stats.cleanup.failed.length > 0) {
      log("WARN", `\n❌ Cleanup failures: ${stats.cleanup.failed.length}`)
      stats.cleanup.failed.forEach((f) =>
        log("WARN", `   - ${f.file}: ${f.error}`),
      )
    }

    // Show working URL
    const success = results.find((r) => r.success)
    if (success) {
      const sampleUrl = `${SUPABASE_URL}/storage/v1/render/image/public/${BUCKET_NAME}/${success.newName}?width=400`
      log("INFO", "\n✅ Working sample URL:")
      log("INFO", `   ${sampleUrl}`)
    }

    log("INFO", "\n🎉 Migration complete!")
  } catch (error) {
    log("ERROR", "💥 Migration failed", error)
    process.exit(1)
  }
}

// Run migration
runMigration()
