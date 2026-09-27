// @ts-nocheck
"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import JSZip from "jszip"
import { useDropzone } from "react-dropzone"
import { Button } from "@/shared/ui/button"
import { useToast } from "@/shared/ui/use-toast"
import { useInventory } from "@/shared/contexts/InventoryContext"
import { createProduct } from "@/services/products"
import { getCategories, getSubCategories } from "@/services/categories"
import { formatColorEntry, getColorSwatch } from "@/shared/lib/color-swatch"
import { generateBarcode } from "@/shared/utils/barcodeUtils"
import imageCompression from "browser-image-compression"
import {
  uploadImagesConcurrently,
  onOnlineStatusChange,
  saveImportSession,
  clearImportSession,
} from "@/shared/lib/upload-with-retry"
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  WifiOff,
  Wifi,
  MonitorSmartphone,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedProduct {
  rowNumber: number
  name: string
  description: string
  price: number
  originalPrice: number | null
  categoryName: string
  subCategoryName: string
  material: string
  sku: string | null
  colors: string[]
  stockQuantity: number
  specifications: Record<string, string>
  variants: any[]
  // resolved IDs
  categoryId: string | null
  subCategoryId: string | null
  // images from ZIP — lazy: only extracted on demand
  imageFiles: File[]
  imagePreviews: string[]
  /** Lazy ZIP entries — extracted only when uploading this product */
  zipEntries?: Array<{ path: string; entry: any }>
  // status
  errors: string[]
  status: "pending" | "uploading" | "success" | "error"
  statusMessage: string
}

type ImportStep = "upload" | "review" | "importing" | "done"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_COLORS = [
  "Red", "Maroon", "Rust", "Terracotta", "Pink", "Rose", "Peach", "Orange",
  "Mustard", "Gold", "Yellow", "Turmeric",
  "Green", "Olive", "Bottle Green", "Teal",
  "Blue", "Indigo", "Navy", "Sky Blue",
  "Purple", "Lavender",
  "Brown", "Coffee", "Beige", "Cream", "Off White", "White",
  "Grey", "Charcoal", "Black", "Natural",
]

const VALID_COLORS_LOWER = VALID_COLORS.map((c) => c.toLowerCase())

const normalizeColorName = (raw: string): string | null => {
  const trimmed = raw.trim()
  const idx = VALID_COLORS_LOWER.indexOf(trimmed.toLowerCase())
  return idx >= 0 ? VALID_COLORS[idx] : null
}

const parseColors = (raw: string): string[] => {
  if (!raw) return []
  return raw
    .split(",")
    .map((c) => {
      const name = normalizeColorName(c)
      if (!name) return null
      const hex = getColorSwatch(name) || "#000000"
      return formatColorEntry(name, hex)
    })
    .filter(Boolean) as string[]
}

const parseSpecifications = (raw: string): Record<string, string> => {
  if (!raw) return {}
  const specs: Record<string, string> = {}
  raw.split("|").forEach((pair) => {
    const [key, ...rest] = pair.split(":")
    if (key?.trim() && rest.length > 0) {
      specs[key.trim()] = rest.join(":").trim()
    }
  })
  return specs
}

const parseVariants = (raw: string): any[] => {
  if (!raw) return []
  return raw.split("|").map(v => {
    const props = v.split(",")
    const variant: any = { size: "", color: "", sku: "", stock_quantity: 0, price_modifier: 0 }
    props.forEach(p => {
      const [k, ...rest] = p.split(":")
      const val = rest.join(":").trim()
      const key = k.trim().toLowerCase()
      if (key === "size") variant.size = val
      if (key === "color") {
        const swatchHex = getColorSwatch(val) || "#000000"
        variant.color = formatColorEntry(val, swatchHex)
      }
      if (key === "sku") variant.sku = val
      if (key === "stock" || key === "qty") variant.stock_quantity = parseInt(val) || 0
      if (key === "price") variant.price_modifier = parseFloat(val) || 0
    })
    return variant
  }).filter(v => v.size || v.color || v.sku)
}

/** Convert a 1-based column index to Excel column letter(s). e.g. 1→A, 26→Z, 27→AA, 28→AB */
const getExcelColumn = (n: number): string => {
  let result = ""
  let num = n
  while (num > 0) {
    const mod = (num - 1) % 26
    result = String.fromCharCode(65 + mod) + result
    num = Math.floor((num - 1) / 26)
  }
  return result
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ZIP_SIZE_WARN_MB = 200
const CONCURRENT_UPLOADS = 3
const MAX_UPLOAD_RETRIES = 3

// ─── Component ───────────────────────────────────────────────────────────────

export default function BulkImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { fetchData } = useInventory()

  // Step state
  const [step, setStep] = useState<ImportStep>("upload")

  // Data
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [products, setProducts] = useState<ParsedProduct[]>([])

  // Upload state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [zipSizeWarning, setZipSizeWarning] = useState(false)

  // Network state
  const [isOnline, setIsOnline] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  // Import progress
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importLog, setImportLog] = useState<
    { row: number; name: string; status: "success" | "error"; message: string }[]
  >([])
  const abortRef = useRef(false)

  // Keep a ref to the loaded JSZip instance for lazy extraction
  const zipRef = useRef<any>(null)

  // ── Online/offline detection ──────────────────────────────────────────────

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const cleanup = onOnlineStatusChange((online) => {
      setIsOnline(online)
      if (online && isPaused) {
        toast({ title: "Back online ✅", description: "Resuming uploads..." })
      } else if (!online && step === "importing") {
        toast({
          title: "Network lost ⚠️",
          description: "Uploads paused — will resume automatically when back online",
          variant: "destructive",
        })
      }
    })
    return cleanup
  }, [isPaused, step, toast])

  // Fetch categories on mount
  useEffect(() => {
    const load = async () => {
      const [catRes, subRes] = await Promise.all([
        getCategories(),
        getSubCategories(),
      ])
      if (catRes.data) setCategories(catRes.data)
      if (subRes.data) setSubCategories(subRes.data)
    }
    load()
  }, [])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      products.forEach((p) =>
        p.imagePreviews.forEach((url) => {
          try { URL.revokeObjectURL(url) } catch {}
        }),
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── CSV Dropzone ──────────────────────────────────────────────────────────

  const onCsvDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast({
        title: "Invalid file",
        description: "Please upload a .csv, .xlsx, or .xls file",
        variant: "destructive",
      })
      return
    }
    setCsvFile(file)
  }, [toast])

  const csvDropzone = useDropzone({
    onDrop: onCsvDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    multiple: false,
  })

  // ── ZIP Dropzone ──────────────────────────────────────────────────────────

  const onZipDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    if (!file.name.endsWith(".zip")) {
      toast({
        title: "Invalid file",
        description: "Please upload a .zip file containing product image folders",
        variant: "destructive",
      })
      return
    }
    // ZIP size warning
    const sizeMB = file.size / 1024 / 1024
    if (sizeMB > ZIP_SIZE_WARN_MB) {
      setZipSizeWarning(true)
    } else {
      setZipSizeWarning(false)
    }
    setZipFile(file)
  }, [toast])

  const zipDropzone = useDropzone({
    onDrop: onZipDrop,
    accept: { "application/zip": [".zip"] },
    maxFiles: 1,
    multiple: false,
  })

  // ── Parse & Match (LAZY ZIP extraction) ───────────────────────────────────

  const handleParseAndMatch = async () => {
    if (!csvFile) {
      toast({ title: "Missing CSV", description: "Please upload an Excel/CSV file", variant: "destructive" })
      return
    }

    setParsing(true)

    try {
      // 1. Parse spreadsheet
      const data = await csvFile.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })

      if (rows.length === 0) {
        toast({ title: "Empty file", description: "The spreadsheet has no data rows", variant: "destructive" })
        setParsing(false)
        return
      }

      // 2. LAZY ZIP scanning — only read file listing, don't extract blobs yet
      //    We store ZIP entry references and extract per-product during upload
      const zipEntryMap = new Map<number, Array<{ path: string; entry: any }>>()
      // For preview, extract only the FIRST image per product (lightweight)
      const previewMap = new Map<number, { previews: string[]; count: number }>()

      if (zipFile) {
        const zip = await JSZip.loadAsync(zipFile)
        zipRef.current = zip // Keep reference for lazy extraction later

        const allEntries = Object.entries(zip.files).filter(
          ([, f]) => !f.dir && /\.(jpe?g|png|webp)$/i.test(f.name),
        )

        // Group entries by row number (extracted from filename prefix)
        // E.g. "1-1.jpg" -> Row 1, "2_front.jpg" -> Row 2, "15.jpg" -> Row 15
        for (const [path, entry] of allEntries) {
          if (path.startsWith("__MACOSX") || path.startsWith(".")) continue

          const fileName = path.split("/").pop() || ""
          
          // Match leading numbers before an optional hyphen, underscore, or dot
          const match = fileName.match(/^(\d+)[-_\.]?/)
          if (!match) continue
          
          const rowNum = parseInt(match[1], 10)
          if (isNaN(rowNum) || rowNum <= 0) continue

          if (!zipEntryMap.has(rowNum)) {
            zipEntryMap.set(rowNum, [])
          }
          zipEntryMap.get(rowNum)!.push({ path, entry })
        }

        // Sort entries within each folder by filename
        zipEntryMap.forEach((entries) => {
          entries.sort((a, b) => {
            const nameA = a.path.split("/").pop() || ""
            const nameB = b.path.split("/").pop() || ""
            return nameA.localeCompare(nameB, undefined, { numeric: true })
          })
        })

        // Extract ONLY the first image per product for preview (saves memory)
        for (const [folderNum, entries] of zipEntryMap) {
          if (entries.length > 0) {
            const firstEntry = entries[0]
            const blob = await firstEntry.entry.async("blob")
            const preview = URL.createObjectURL(blob)
            previewMap.set(folderNum, { previews: [preview], count: entries.length })
          }
        }
      }

      // 3. Parse each row into a ParsedProduct
      const parsed: ParsedProduct[] = rows.map((row, idx) => {
        const rowNum = idx + 1
        const errors: string[] = []

        // Read fields (flexible header matching)
        const name = String(row["Product Name"] ?? row["name"] ?? "").trim()
        const description = String(row["Description"] ?? row["description"] ?? "").trim()
        const priceRaw = String(row["Selling Price (₹)"] ?? row["Selling Price"] ?? row["price"] ?? "").replace(/,/g, "")
        const mrpRaw = String(row["MRP / Original Price (₹)"] ?? row["MRP"] ?? row["Original Price"] ?? row["original_price"] ?? "").replace(/,/g, "")
        const categoryName = String(row["Category"] ?? row["category"] ?? "").trim()
        const subCategoryName = String(row["Subcategory"] ?? row["Sub Category"] ?? row["subcategory"] ?? "").trim()
        const material = String(row["Material"] ?? row["material"] ?? "").trim()
        const skuRaw = String(row["SKU / Barcode"] ?? row["SKU"] ?? row["sku"] ?? row["Barcode"] ?? row["barcode"] ?? "").trim()
        const colorsRaw = String(row["Colors"] ?? row["colors"] ?? "").trim()
        const stockRaw = String(row["Stock Quantity"] ?? row["Stock"] ?? row["stock_quantity"] ?? row["Quantity"] ?? "1").replace(/,/g, "")
        const specsRaw = String(row["Specifications"] ?? row["specifications"] ?? "").trim()
        const variantsRaw = String(row["Variants"] ?? row["variants"] ?? "").trim()
        const parsedSpecs = parseSpecifications(specsRaw)

        // Capture specs from Attribute Label/Value columns
        for (let i = 1; i <= 5; i++) {
          const label = String(row[`Attribute ${i} Label`] ?? "").trim()
          const value = String(row[`Attribute ${i} Value`] ?? "").trim()
          if (label && value) {
            parsedSpecs[label] = value
          }
        }

        // Capture any extra unknown columns as specifications
        const standardKeys = [
          "Product Name", "name",
          "Description", "description",
          "Selling Price (₹)", "Selling Price", "price",
          "MRP / Original Price (₹)", "MRP", "Original Price", "original_price",
          "Category", "category",
          "Subcategory", "Sub Category", "subcategory",
          "Material", "material",
          "SKU / Barcode", "SKU", "sku", "Barcode", "barcode",
          "Colors", "colors",
          "Stock Quantity", "Stock", "stock_quantity", "Quantity",
          "Variants", "variants",
          "Attribute 1 Label", "Attribute 1 Value",
          "Attribute 2 Label", "Attribute 2 Value",
          "Attribute 3 Label", "Attribute 3 Value",
          "Attribute 4 Label", "Attribute 4 Value",
          "Attribute 5 Label", "Attribute 5 Value"
        ]
        Object.keys(row).forEach((key) => {
          if (!standardKeys.includes(key) && String(row[key]).trim()) {
            parsedSpecs[key.trim()] = String(row[key]).trim()
          }
        })

        // Validate
        if (!name) errors.push("Product name is required")
        if (!description) errors.push("Description is required")
        const price = parseFloat(priceRaw)
        if (isNaN(price) || price <= 0) errors.push("Valid selling price is required")
        const originalPrice = mrpRaw ? parseFloat(mrpRaw) : null
        if (originalPrice !== null && originalPrice <= price) errors.push("MRP must be greater than selling price")
        if (!categoryName) errors.push("Category is required")
        const stockQuantity = parseInt(stockRaw, 10)
        if (isNaN(stockQuantity) || stockQuantity < 0) errors.push("Valid stock quantity is required")

        // Resolve category
        const cat = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
        )
        if (categoryName && !cat) errors.push(`Category "${categoryName}" not found — use the dropdown`)

        // Resolve subcategory
        let subCat = null
        if (subCategoryName && cat) {
          subCat = subCategories.find(
            (s) =>
              s.name.toLowerCase() === subCategoryName.toLowerCase() &&
              String(s.category_id) === String(cat.id),
          )
          if (!subCat) errors.push(`Subcategory "${subCategoryName}" not valid under "${categoryName}" — use the dropdown`)
        }

        // Parse colors
        const colors = parseColors(colorsRaw)
        const invalidColors = colorsRaw
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c && !normalizeColorName(c))
        if (invalidColors.length > 0) errors.push(`Invalid colors: ${invalidColors.join(", ")} — use values from Colors dropdown`)

        // Get images from ZIP (lazy — entries only, no full extraction yet)
        const zipEntries = zipEntryMap.get(rowNum) ?? []
        const previewData = previewMap.get(rowNum) ?? { previews: [], count: 0 }
        if (zipEntries.length === 0 && zipFile) {
          errors.push(`No image folder "${rowNum}" found in ZIP`)
        }

        return {
          rowNumber: rowNum,
          name,
          description,
          price: isNaN(price) ? 0 : price,
          originalPrice,
          categoryName,
          subCategoryName,
          material,
          sku: skuRaw || null,
          colors,
          stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity,
          specifications: parsedSpecs,
          variants: parseVariants(variantsRaw),
          categoryId: cat?.id ?? null,
          subCategoryId: subCat?.id ?? null,
          imageFiles: [], // populated lazily during upload
          imagePreviews: previewData.previews,
          zipEntries, // lazy references
          errors,
          status: "pending" as const,
          statusMessage: "",
        }
      })

      setProducts(parsed)
      setStep("review")

      const errorCount = parsed.filter((p) => p.errors.length > 0).length
      const noImageCount = parsed.filter((p) => (p.zipEntries?.length ?? 0) === 0 && p.imageFiles.length === 0).length

      toast({
        title: `${parsed.length} products parsed`,
        description: `${errorCount > 0 ? `${errorCount} with errors. ` : ""}${noImageCount > 0 && zipFile ? `${noImageCount} missing images.` : zipFile ? "All have images ✅" : "No ZIP uploaded — images will be empty."}`,
        variant: errorCount > 0 ? "destructive" : "default",
      })
    } catch (err: any) {
      console.error("Parse error:", err)
      toast({
        title: "Parse failed",
        description: err.message || "Failed to parse the uploaded files",
        variant: "destructive",
      })
    } finally {
      setParsing(false)
    }
  }

  // ── Lazy extract images for a single product from ZIP ──────────────────────

  const extractProductImages = async (product: ParsedProduct): Promise<File[]> => {
    const entries = product.zipEntries ?? []
    if (entries.length === 0) return product.imageFiles

    const files: File[] = []
    for (const { path, entry } of entries) {
      const blob = await entry.async("blob")
      const fileName = path.split("/").pop() || "image.jpg"
      files.push(new File([blob], fileName, { type: blob.type || "image/jpeg" }))
    }
    return files
  }

  // ── Compress images before upload ─────────────────────────────────────────

  const compressImages = async (files: File[]): Promise<File[]> => {
    const compressed: File[] = []
    for (const file of files) {
      try {
        const result = await imageCompression(file, {
          maxSizeMB: 4,
          maxWidthOrHeight: 2400,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.92,
        })
        compressed.push(result)
      } catch {
        compressed.push(file) // Use original if compression fails
      }
    }
    return compressed
  }

  // ── Import All (with retry, concurrency, lazy extraction) ─────────────────

  const handleImportAll = async () => {
    const validProducts = products.filter((p) => p.errors.length === 0)
    if (validProducts.length === 0) {
      toast({ title: "No valid products", description: "Fix all errors before importing", variant: "destructive" })
      return
    }

    setStep("importing")
    abortRef.current = false
    setImportProgress({ current: 0, total: validProducts.length })
    setImportLog([])

    const sessionId = `import_${Date.now()}`
    const session = {
      sessionId,
      startedAt: new Date().toISOString(),
      completedRows: [] as number[],
      failedRows: [] as number[],
      uploadedImages: {} as Record<number, string[]>,
    }

    for (let i = 0; i < validProducts.length; i++) {
      if (abortRef.current) break

      const product = validProducts[i]
      setImportProgress({ current: i + 1, total: validProducts.length })

      // Update product status
      setProducts((prev) =>
        prev.map((p) =>
          p.rowNumber === product.rowNumber
            ? { ...p, status: "uploading", statusMessage: "Extracting images from ZIP..." }
            : p,
        ),
      )

      try {
        // 1. LAZY extract images from ZIP for this product only
        setProducts((prev) =>
          prev.map((p) =>
            p.rowNumber === product.rowNumber
              ? { ...p, statusMessage: "Extracting images..." }
              : p,
          ),
        )
        const rawFiles = await extractProductImages(product)

        // 2. Compress images
        setProducts((prev) =>
          prev.map((p) =>
            p.rowNumber === product.rowNumber
              ? { ...p, statusMessage: `Compressing ${rawFiles.length} images...` }
              : p,
          ),
        )
        const compressedFiles = await compressImages(rawFiles)

        // 3. Upload images concurrently with retry
        const uploadResults = await uploadImagesConcurrently(compressedFiles, {
          concurrency: CONCURRENT_UPLOADS,
          maxRetries: MAX_UPLOAD_RETRIES,
          abortSignal: abortRef,
          onProgress: (completed, total) => {
            setProducts((prev) =>
              prev.map((p) =>
                p.rowNumber === product.rowNumber
                  ? { ...p, statusMessage: `Uploading image ${completed}/${total}...` }
                  : p,
              ),
            )
          },
        })

        // Check for upload failures
        const failedUploads = uploadResults.filter((r) => r.error)
        const imageIds = uploadResults.filter((r) => r.url).map((r) => r.url!)

        if (failedUploads.length > 0 && imageIds.length === 0) {
          throw new Error(
            `All ${failedUploads.length} image uploads failed: ${failedUploads[0].error?.message}`,
          )
        }

        if (failedUploads.length > 0) {
          console.warn(
            `⚠️ ${failedUploads.length}/${compressedFiles.length} images failed for row ${product.rowNumber}`,
          )
        }

        // 4. Generate barcode
        const uniqueId = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        const barcode = product.sku || generateBarcode(uniqueId)

        // 5. Build product payload
        setProducts((prev) =>
          prev.map((p) =>
            p.rowNumber === product.rowNumber
              ? { ...p, statusMessage: "Creating product..." }
              : p,
          ),
        )

        const payload: any = {
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.categoryId,
          subCategory: product.subCategoryId,
          colors: product.colors,
          quantity: product.stockQuantity,
          images: imageIds,
          specifications: product.specifications,
          material: product.material || null,
          barcode,
          isVisible: true,
          isCustomDesign: false,
          inStock: product.stockQuantity > 0,
          variants: product.variants,
        }

        // 6. Create product DIRECTLY — no fetchData() per product!
        const result = await createProduct(payload)
        if (result.error) {
          throw new Error(result.error.message || "Failed to create product")
        }

        // Track success in session
        session.completedRows.push(product.rowNumber)
        session.uploadedImages[product.rowNumber] = imageIds
        saveImportSession(session)

        // Success
        const imgMsg = failedUploads.length > 0
          ? `✅ Created with ${imageIds.length} images (${failedUploads.length} failed)`
          : `✅ Created with ${imageIds.length} images`

        setProducts((prev) =>
          prev.map((p) =>
            p.rowNumber === product.rowNumber
              ? { ...p, status: "success", statusMessage: imgMsg }
              : p,
          ),
        )
        setImportLog((prev) => [
          ...prev,
          { row: product.rowNumber, name: product.name, status: "success", message: `${imageIds.length} images` },
        ])
      } catch (err: any) {
        console.error(`Import failed for row ${product.rowNumber}:`, err)

        session.failedRows.push(product.rowNumber)
        saveImportSession(session)

        setProducts((prev) =>
          prev.map((p) =>
            p.rowNumber === product.rowNumber
              ? { ...p, status: "error", statusMessage: `❌ ${err.message}` }
              : p,
          ),
        )
        setImportLog((prev) => [
          ...prev,
          { row: product.rowNumber, name: product.name, status: "error", message: err.message },
        ])
      }
    }

    // Single fetchData() at the end — not per product!
    await fetchData()
    clearImportSession()
    setStep("done")
  }

  // ── Download Sample Template ──────────────────────────────────────────────

  const downloadTemplate = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default
      const FileSaver = await import("file-saver")
      const saveAs = FileSaver.saveAs || FileSaver.default

      const workbook = new ExcelJS.Workbook()
      
      // ── Build Main Sheet ──
      const ws = workbook.addWorksheet("Products")
      
      ws.columns = [
        { header: "Product Name", key: "name", width: 45 },
        { header: "Description", key: "desc", width: 60 },
        { header: "Category", key: "cat", width: 22 },
        { header: "Subcategory", key: "subcat", width: 28 },
        { header: "Selling Price (₹)", key: "price", width: 18 },
        { header: "MRP / Original Price (₹)", key: "mrp", width: 22 },
        { header: "Material", key: "material", width: 18 },
        { header: "Stock Quantity", key: "stock", width: 15 },
        { header: "Attribute 1 Label", key: "attr1l", width: 20 },
        { header: "Attribute 1 Value", key: "attr1v", width: 25 },
        { header: "Attribute 2 Label", key: "attr2l", width: 20 },
        { header: "Attribute 2 Value", key: "attr2v", width: 25 },
        { header: "Attribute 3 Label", key: "attr3l", width: 20 },
        { header: "Attribute 3 Value", key: "attr3v", width: 25 },
        { header: "Attribute 4 Label", key: "attr4l", width: 20 },
        { header: "Attribute 4 Value", key: "attr4v", width: 25 },
        { header: "Attribute 5 Label", key: "attr5l", width: 20 },
        { header: "Attribute 5 Value", key: "attr5v", width: 25 },
      ]

      // Format header row
      ws.getRow(1).font = { bold: true }
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }

      const categoryNames = categories.map((c) => c.name)
      const allSubCategoryNames = subCategories.map((s) => s.name)
      const uniqueSubCategoryNames = [...new Set(allSubCategoryNames)]

      // Add Sample Rows
      ws.addRow({
        name: "Tussar Silk Kalamkari Saree – Peacock Motif",
        desc: "Hand-painted pen Kalamkari on pure Tussar silk with peacock and floral motifs",
        cat: categoryNames.includes("Sarees") ? "Sarees" : (categoryNames[0] || ""),
        subcat: "Tussar Silk",
        price: 8500,
        mrp: 12000,
        material: "Tussar Silk",
        stock: 1,
        attr1l: "Wash Care",
        attr1v: "Dry Clean Only",
        attr2l: "Dimensions",
        attr2v: "6.5 meters",
        attr3l: "Craft",
        attr3v: "Pen Kalamkari"
      })

      ws.addRow({
        name: "Mangalagiri Cotton Dupatta – Temple Border",
        desc: "Lightweight cotton dupatta with Kalamkari temple border design",
        cat: categoryNames.includes("Dupattas") ? "Dupattas" : (categoryNames[1] || ""),
        subcat: "Mangalagiri Cotton",
        price: 1800,
        mrp: 2500,
        material: "Cotton",
        stock: 3,
        attr1l: "Wash Care",
        attr1v: "Hand Wash",
        attr2l: "Dimensions",
        attr2v: "2.5 meters"
      })

      // ── Data Validation with Cascading Subcategory Dropdown ──
      // Category dropdown uses a flat list in hidden column Z.
      // Subcategory dropdown is CASCADING — shows only subcategories
      // belonging to the selected category.
      //
      // Implementation: One hidden column per category (starting at AB),
      // each containing only that category's subcategories. The Subcategory
      // validation uses INDIRECT() to reference the column matching the
      // selected category name.

      // Hide reference columns
      ws.getColumn('Z').hidden = true
      ws.getColumn('AA').hidden = true

      // Populate category list in column Z
      categoryNames.forEach((cat, index) => {
        ws.getCell(`Z${index + 1}`).value = cat
      })

      // Build per-category subcategory lists in hidden columns (AB, AC, AD...)
      // and create Named Ranges for INDIRECT() lookup
      const catSubMap = new Map<string, string[]>()
      subCategories.forEach((sub) => {
        const parentCat = categories.find((c) => String(c.id) === String(sub.category_id))
        if (parentCat) {
          if (!catSubMap.has(parentCat.name)) catSubMap.set(parentCat.name, [])
          const arr = catSubMap.get(parentCat.name)!
          if (!arr.includes(sub.name)) arr.push(sub.name)
        }
      })

      // Write subcategory lists into hidden columns and create named ranges
      let colOffset = 0 // starting from column AB (index 28)
      const namedRangeMap = new Map<string, string>() // category name → range address

      for (const [catName, subcats] of catSubMap) {
        const colLetter = getExcelColumn(28 + colOffset) // AB, AC, AD...
        const col = ws.getColumn(colLetter)
        col.hidden = true

        subcats.forEach((subName, idx) => {
          ws.getCell(`${colLetter}${idx + 1}`).value = subName
        })

        // Create a named range using sanitized category name
        // Excel named ranges can't have spaces or special chars
        const safeName = catName.replace(/[^a-zA-Z0-9]/g, "_")
        const rangeAddr = `Products!$${colLetter}$1:$${colLetter}$${Math.max(1, subcats.length)}`
        namedRangeMap.set(catName, safeName)

        // Add named range to workbook
        workbook.definedNames.add(rangeAddr, safeName)

        colOffset++
      }

      // Also populate ALL subcategories in column AA as fallback
      uniqueSubCategoryNames.forEach((subcat, index) => {
        ws.getCell(`AA${index + 1}`).value = subcat
      })

      const catFormula = `$Z$1:$Z$${Math.max(2, categoryNames.length)}`
      const allSubCatFormula = `$AA$1:$AA$${Math.max(2, uniqueSubCategoryNames.length)}`

      // Apply to rows 2 through 200
      for (let i = 2; i <= 200; i++) {
        // Category dropdown — flat list
        ws.getCell(`C${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [catFormula],
          showErrorMessage: true,
          errorTitle: 'Invalid Category',
          error: 'Please select a category from the dropdown list'
        }

        // Subcategory dropdown — cascading via INDIRECT
        // INDIRECT(SUBSTITUTE(C2, " ", "_")) maps the category name to the named range
        // Falls back to all subcategories if INDIRECT fails
        const indirectFormula = `INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(C${i}," ","_"),"&","_"),"-","_"))`
        ws.getCell(`D${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [indirectFormula],
          showErrorMessage: true,
          errorTitle: 'Invalid Subcategory',
          error: 'Please select a subcategory that belongs to the chosen category'
        }
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      saveAs(blob, "product-import-template.xlsx")

      toast({
        title: "Template downloaded ✅",
        description: "Google Sheets natively supports this file format. Drop it into Drive to see dropdowns!",
      })
    } catch (err) {
      console.error("Error creating Excel file:", err)
      toast({
        title: "Error creating template",
        description: "Failed to generate Excel file.",
        variant: "destructive"
      })
    }
  }

  // ── Download Error Report ─────────────────────────────────────────────────

  const downloadErrorReport = () => {
    const errorRows = importLog.filter((l) => l.status === "error")
    if (errorRows.length === 0) return

    const data = [["Row #", "Product Name", "Error"]]
    errorRows.forEach((r) => data.push([String(r.row), r.name, r.message]))

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Errors")
    XLSX.writeFile(wb, "import-errors.xlsx")
  }

  // ── Toggle expand row ─────────────────────────────────────────────────────

  const toggleRow = (rowNum: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      next.has(rowNum) ? next.delete(rowNum) : next.add(rowNum)
      return next
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const validCount = products.filter((p) => p.errors.length === 0).length
  const errorCount = products.filter((p) => p.errors.length > 0).length
  const withImages = products.filter((p) => (p.zipEntries?.length ?? 0) > 0 || p.imageFiles.length > 0).length
  const successCount = importLog.filter((l) => l.status === "success").length
  const failCount = importLog.filter((l) => l.status === "error").length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/products")}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Bulk Product Import</h1>
          <p className="text-sm text-slate-500">Upload an Excel sheet + a ZIP of images to add products in bulk</p>
        </div>
      </div>

      {/* Network status banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span className="font-medium">No internet connection</span>
          <span className="text-red-500">— uploads will pause and resume automatically when you're back online</span>
        </div>
      )}

      {/* Tab visibility warning during import */}
      {step === "importing" && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          <MonitorSmartphone className="h-4 w-4 shrink-0" />
          <span>Keep this tab active during import — switching tabs may slow down uploads</span>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(["upload", "review", "importing"] as ImportStep[]).map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className="h-px w-6 bg-slate-300" />}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                step === s || (step === "done" && s === "importing")
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span>{i + 1}</span>
              <span className="hidden sm:inline">
                {s === "upload" ? "Upload Files" : s === "review" ? "Review & Match" : "Importing"}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Upload ─────────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Download template */}
          <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Need the template?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download the Excel template with sample data, category list, and color palette
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 shrink-0">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          {/* CSV Dropzone */}
          <div
            {...csvDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              csvDropzone.isDragActive
                ? "border-blue-500 bg-blue-50"
                : csvFile
                  ? "border-green-400 bg-green-50/50"
                  : "border-slate-300 hover:border-slate-400 bg-white"
            }`}
          >
            <input {...csvDropzone.getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  csvFile ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              {csvFile ? (
                <div>
                  <p className="font-medium text-green-700">{csvFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(csvFile.size / 1024).toFixed(1)} KB — Click or drop to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-slate-700">Drop your Excel / CSV file here</p>
                  <p className="text-xs text-slate-500 mt-1">Supports .xlsx, .xls, .csv</p>
                </div>
              )}
            </div>
          </div>

          {/* ZIP Dropzone */}
          <div
            {...zipDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              zipDropzone.isDragActive
                ? "border-blue-500 bg-blue-50"
                : zipFile
                  ? "border-green-400 bg-green-50/50"
                  : "border-slate-300 hover:border-slate-400 bg-white"
            }`}
          >
            <input {...zipDropzone.getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  zipFile ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                <FolderArchive className="h-6 w-6" />
              </div>
              {zipFile ? (
                <div>
                  <p className="font-medium text-green-700">{zipFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(zipFile.size / 1024 / 1024).toFixed(1)} MB — Click or drop to replace
                  </p>
                  {zipSizeWarning && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      ⚠️ Large file! Consider compressing images first with Caesium (free desktop app) for faster upload.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium text-slate-700">Drop your images ZIP file here</p>
                  <div className="text-xs text-slate-500 mt-3 space-y-2 text-left bg-white border border-slate-200 rounded-lg p-3 inline-block">
                    <p><strong>1. Folders = Excel Rows:</strong> Folder <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">1</code> matches Row 1 in Excel, Folder <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">2</code> matches Row 2, etc.</p>
                    <p><strong>2. Image Names:</strong> Inside folder <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">1</code>, name the images <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">1.jpg</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">2.jpg</code>, etc.</p>
                    <p className="text-amber-600 font-medium">✨ The image named 1.jpg is always the main thumbnail.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parse button */}
          <div className="flex justify-end">
            <Button
              onClick={handleParseAndMatch}
              disabled={!csvFile || parsing}
              className="gap-2"
            >
              {parsing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Parse & Match
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Review ─────────────────────────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              <p className="text-xs text-slate-500">Total Products</p>
            </div>
            <div className="bg-white border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
              <p className="text-xs text-slate-500">Ready to Import</p>
            </div>
            <div className="bg-white border rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${errorCount > 0 ? "text-red-600" : "text-slate-400"}`}>{errorCount}</p>
              <p className="text-xs text-slate-500">With Errors</p>
            </div>
            <div className="bg-white border rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${withImages === products.length ? "text-green-600" : "text-amber-600"}`}>
                {withImages}/{products.length}
              </p>
              <p className="text-xs text-slate-500">Have Images</p>
            </div>
          </div>

          {/* Product list */}
          <div className="border rounded-xl overflow-hidden bg-white">
            <div className="max-h-[60vh] overflow-y-auto">
              {products.map((product) => {
                const hasErrors = product.errors.length > 0
                const isExpanded = expandedRows.has(product.rowNumber)

                return (
                  <div
                    key={product.rowNumber}
                    className={`border-b last:border-b-0 ${hasErrors ? "bg-red-50/50" : ""}`}
                  >
                    {/* Row summary */}
                    <button
                      onClick={() => toggleRow(product.rowNumber)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Row number */}
                      <span className="h-7 w-7 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-mono text-slate-600">
                        {product.rowNumber}
                      </span>

                      {/* Image thumbnails */}
                      <div className="flex -space-x-1.5 shrink-0">
                        {product.imagePreviews.length > 0 ? (
                          product.imagePreviews.slice(0, 3).map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="h-8 w-8 rounded-md object-cover border-2 border-white"
                            />
                          ))
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        )}
                        {(product.zipEntries?.length ?? 0) > 1 && (
                          <span className="h-8 w-8 rounded-md bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-600">
                            +{(product.zipEntries?.length ?? 1) - 1}
                          </span>
                        )}
                      </div>

                      {/* Name & meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name || "(no name)"}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {product.categoryName}
                          {product.subCategoryName ? ` → ${product.subCategoryName}` : ""} · ₹
                          {product.price.toLocaleString("en-IN")} · {product.zipEntries?.length ?? product.imageFiles.length} images
                        </p>
                      </div>

                      {/* Status icon */}
                      {hasErrors ? (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      )}

                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3">
                        {/* Errors */}
                        {hasErrors && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                            {product.errors.map((err, i) => (
                              <p key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                {err}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">Price:</span>{" "}
                            <span className="font-medium">₹{product.price.toLocaleString("en-IN")}</span>
                            {product.originalPrice && (
                              <span className="text-slate-400 line-through ml-1">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-500">Stock:</span>{" "}
                            <span className="font-medium">{product.stockQuantity}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Material:</span>{" "}
                            <span className="font-medium">{product.material || "—"}</span>
                          </div>
                          {product.colors.length > 0 && (
                            <div className="col-span-2 sm:col-span-3">
                              <span className="text-slate-500">Colors: </span>
                              {product.colors.map((c) => (
                                <span key={c} className="inline-block px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 mr-1 mb-1">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Image previews */}
                        {(product.imagePreviews.length > 0 || (product.zipEntries?.length ?? 0) > 0) && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1.5">
                              Images ({product.zipEntries?.length ?? product.imagePreviews.length}) — first = thumbnail:
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {product.imagePreviews.map((src, i) => (
                                <div key={i} className="relative shrink-0">
                                  <img
                                    src={src}
                                    alt={`Image ${i + 1}`}
                                    className={`h-16 w-16 rounded-lg object-cover border-2 ${
                                      i === 0 ? "border-blue-400" : "border-slate-200"
                                    }`}
                                  />
                                  {i === 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                      MAIN
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button variant="outline" onClick={() => { setStep("upload"); setProducts([]) }} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </Button>
            <div className="flex items-center gap-3">
              {errorCount > 0 && (
                <p className="text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                  {errorCount} products with errors will be skipped
                </p>
              )}
              <Button
                onClick={handleImportAll}
                disabled={validCount === 0}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Import {validCount} Products
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Importing / Done ───────────────────────────────────────── */}
      {(step === "importing" || step === "done") && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-white border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900">
                {step === "done"
                  ? "Import Complete"
                  : `Importing product ${importProgress.current} of ${importProgress.total}...`}
              </span>
              <span className="text-slate-500">
                {Math.round((importProgress.current / Math.max(importProgress.total, 1)) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${step === "done" ? "bg-green-500" : "bg-blue-500"}`}
                style={{
                  width: `${(importProgress.current / Math.max(importProgress.total, 1)) * 100}%`,
                }}
              />
            </div>

            {step === "done" && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{successCount}</p>
                  <p className="text-xs text-green-600">Imported Successfully</p>
                </div>
                <div className={`border rounded-lg p-3 text-center ${failCount > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                  <p className={`text-2xl font-bold ${failCount > 0 ? "text-red-700" : "text-slate-400"}`}>{failCount}</p>
                  <p className={`text-xs ${failCount > 0 ? "text-red-600" : "text-slate-500"}`}>Failed</p>
                </div>
              </div>
            )}
          </div>

          {/* Import log */}
          <div className="border rounded-xl overflow-hidden bg-white">
            <div className="p-3 border-b bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Import Log</h3>
            </div>
            <div className="max-h-[40vh] overflow-y-auto divide-y">
              {/* Currently uploading product */}
              {step === "importing" && (
                <div className="flex items-center gap-3 p-3 bg-blue-50/50">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-blue-700 truncate">
                      {products.find((p) => p.status === "uploading")?.name || "Processing..."}
                    </p>
                    <p className="text-xs text-blue-500">
                      {products.find((p) => p.status === "uploading")?.statusMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed entries */}
              {importLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  {entry.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 truncate">
                      <span className="text-slate-400 mr-1.5">#{entry.row}</span>
                      {entry.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs shrink-0 ${entry.status === "success" ? "text-green-600" : "text-red-600"}`}
                  >
                    {entry.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {step === "done" && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              {failCount > 0 && (
                <Button variant="outline" onClick={downloadErrorReport} className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Download Error Report
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("upload")
                    setProducts([])
                    setCsvFile(null)
                    setZipFile(null)
                    setImportLog([])
                  }}
                >
                  Import More
                </Button>
                <Button onClick={() => router.push("/dashboard/products")} className="gap-1.5">
                  <Package className="h-4 w-4" />
                  View Products
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
