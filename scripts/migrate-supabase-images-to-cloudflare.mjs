import fs from "node:fs/promises"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })
dotenv.config()

const args = new Set(process.argv.slice(2))
const getArg = (name, fallback) => {
  const prefix = `${name}=`
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

const apply = args.has("--apply")
const verify = args.has("--verify")
const includeExternal = args.has("--include-external")
const concurrency = Number(getArg("--concurrency", "4"))
const limit = Number(getArg("--limit", "0"))

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CF_ACCOUNT_ID",
  "CF_IMAGES_TOKEN",
]

const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim())
if (missingEnv.length > 0) {
  throw new Error(`Missing required env vars: ${missingEnv.join(", ")}`)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
)

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const nowStamp = () =>
  new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_")

const classifyImageRef = (value) => {
  if (!value || typeof value !== "string") return "empty"
  const trimmed = value.trim()
  if (!trimmed) return "empty"
  if (trimmed.startsWith("https://imagedelivery.net/")) return "cloudflare-url"
  if (uuidRe.test(trimmed)) return "cloudflare-id"
  if (trimmed.includes("/storage/v1/render/image/")) return "supabase-render"
  if (trimmed.includes("supabase.co/storage")) return "supabase-storage"
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return "external-url"
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return "local-preview"
  }
  return "other"
}

const isMigratable = (value) => {
  const type = classifyImageRef(value)
  if (type === "supabase-storage" || type === "supabase-render") return true
  return includeExternal && type === "external-url"
}

const extensionForContentType = (contentType) => {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("webp")) return "webp"
  if (contentType.includes("gif")) return "gif"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg"
  return "jpg"
}

async function loadRows() {
  const [productsResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("id,name,images"),
    supabase.from("categories").select("id,name,image_url,parent_id"),
  ])

  if (productsResult.error) throw productsResult.error
  if (categoriesResult.error) throw categoriesResult.error

  return {
    products: productsResult.data ?? [],
    categories: categoriesResult.data ?? [],
  }
}

function buildMigrationPlan(rows) {
  const refs = new Map()
  const products = []
  const categories = []

  for (const product of rows.products) {
    if (!Array.isArray(product.images)) continue

    const nextImages = product.images.map((imageRef) => {
      if (!isMigratable(imageRef)) return imageRef
      refs.set(imageRef, {
        sourceUrl: imageRef,
        sourceType: classifyImageRef(imageRef),
      })
      return null
    })

    if (nextImages.some((imageRef) => imageRef === null)) {
      products.push({
        id: product.id,
        name: product.name,
        before: product.images,
        nextTemplate: nextImages,
      })
    }
  }

  for (const category of rows.categories) {
    if (!isMigratable(category.image_url)) continue
    refs.set(category.image_url, {
      sourceUrl: category.image_url,
      sourceType: classifyImageRef(category.image_url),
    })
    categories.push({
      id: category.id,
      name: category.name,
      parent_id: category.parent_id,
      before: category.image_url,
    })
  }

  return {
    refs,
    products,
    categories,
  }
}

function buildVerificationReport(rows) {
  const report = {
    products: {
      rows: rows.products.length,
    },
    categories: {
      rows: rows.categories.length,
    },
  }

  const bump = (bucket, key) => {
    bucket[key] = (bucket[key] ?? 0) + 1
  }

  for (const product of rows.products) {
    if (!Array.isArray(product.images)) {
      bump(report.products, `images:${classifyImageRef(product.images)}`)
      continue
    }

    bump(report.products, "images:arrays")
    for (const imageRef of product.images) {
      bump(report.products, `images:${classifyImageRef(imageRef)}`)
    }
  }

  for (const category of rows.categories) {
    bump(report.categories, `image_url:${classifyImageRef(category.image_url)}`)
  }

  return report
}

async function uploadToCloudflare(sourceUrl, index, total) {
  const sourceResponse = await fetch(sourceUrl)
  if (!sourceResponse.ok) {
    throw new Error(
      `Failed to fetch source image (${sourceResponse.status}): ${sourceUrl}`,
    )
  }

  const contentType =
    sourceResponse.headers.get("content-type") || "application/octet-stream"
  const bytes = await sourceResponse.arrayBuffer()
  const filename = `supabase-migration-${index + 1}-of-${total}.${extensionForContentType(
    contentType,
  )}`

  const body = new FormData()
  body.append("file", new Blob([bytes], { type: contentType }), filename)

  const uploadResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CF_IMAGES_TOKEN}`,
      },
      body,
    },
  )

  const payload = await uploadResponse.json().catch(() => ({}))
  if (!uploadResponse.ok || !payload.success || !payload.result?.id) {
    const details =
      payload.errors
        ?.map((error) => error.message)
        .filter(Boolean)
        .join(", ") || `HTTP ${uploadResponse.status}`
    throw new Error(`Cloudflare upload failed for ${sourceUrl}: ${details}`)
  }

  if ((index + 1) % 25 === 0 || index === 0 || index + 1 === total) {
    console.log(`[upload] ${index + 1}/${total}`)
  }

  return payload.result.id
}

async function runWithConcurrency(items, worker) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await worker(items[index], index, items.length)
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () =>
      runWorker(),
    ),
  )

  return results
}

async function writeBackup(data) {
  const backupDir = path.join(process.cwd(), "migration-backups")
  await fs.mkdir(backupDir, { recursive: true })
  const backupPath = path.join(
    backupDir,
    `${nowStamp()}_supabase-to-cloudflare-images.json`,
  )
  await fs.writeFile(backupPath, JSON.stringify(data, null, 2))
  return backupPath
}

async function updateDatabase(plan, uploadMap) {
  let productUpdates = 0
  let categoryUpdates = 0

  for (const product of plan.products) {
    const images = product.nextTemplate.map((imageRef, index) => {
      if (imageRef !== null) return imageRef
      const sourceUrl = product.before[index]
      return uploadMap.get(sourceUrl)
    })

    const { error } = await supabase
      .from("products")
      .update({ images })
      .eq("id", product.id)

    if (error) throw error
    productUpdates += 1
  }

  for (const category of plan.categories) {
    const imageUrl = uploadMap.get(category.before)
    const { error } = await supabase
      .from("categories")
      .update({ image_url: imageUrl })
      .eq("id", category.id)

    if (error) throw error
    categoryUpdates += 1
  }

  return {
    productUpdates,
    categoryUpdates,
  }
}

async function main() {
  console.log(verify ? "[mode] verify" : apply ? "[mode] apply" : "[mode] dry-run")
  console.log(`[scope] includeExternal=${includeExternal}`)

  const rows = await loadRows()
  if (verify) {
    console.log(JSON.stringify(buildVerificationReport(rows), null, 2))
    return
  }

  const plan = buildMigrationPlan(rows)
  const sourceUrls = Array.from(plan.refs.keys())
  const selectedSourceUrls = limit > 0 ? sourceUrls.slice(0, limit) : sourceUrls

  console.log(
    JSON.stringify(
      {
        productsScanned: rows.products.length,
        categoriesScanned: rows.categories.length,
        productRowsToUpdate: plan.products.length,
        categoryRowsToUpdate: plan.categories.length,
        uniqueSourceImagesToUpload: sourceUrls.length,
        selectedSourceImagesToUpload: selectedSourceUrls.length,
      },
      null,
      2,
    ),
  )

  if (!apply) {
    console.log("[dry-run] no uploads or database writes performed")
    return
  }

  if (limit > 0 && selectedSourceUrls.length < sourceUrls.length) {
    throw new Error("--limit is only supported in dry-run mode")
  }

  const backupPath = await writeBackup({
    createdAt: new Date().toISOString(),
    mode: "before-apply",
    products: plan.products,
    categories: plan.categories,
    refs: Array.from(plan.refs.values()),
  })
  console.log(`[backup] ${backupPath}`)

  const uploadedIds = await runWithConcurrency(selectedSourceUrls, uploadToCloudflare)
  const uploadMap = new Map(
    selectedSourceUrls.map((sourceUrl, index) => [sourceUrl, uploadedIds[index]]),
  )

  const missingUploads = selectedSourceUrls.filter((sourceUrl) => !uploadMap.get(sourceUrl))
  if (missingUploads.length > 0) {
    throw new Error(`Missing uploads for ${missingUploads.length} source URLs`)
  }

  const applyBackupPath = await writeBackup({
    createdAt: new Date().toISOString(),
    mode: "uploaded-before-db-update",
    uploads: Object.fromEntries(uploadMap),
    products: plan.products,
    categories: plan.categories,
  })
  console.log(`[backup] ${applyBackupPath}`)

  const updates = await updateDatabase(plan, uploadMap)
  console.log("[database] updated", updates)
}

main().catch((error) => {
  console.error("[failed]", error)
  process.exit(1)
})
