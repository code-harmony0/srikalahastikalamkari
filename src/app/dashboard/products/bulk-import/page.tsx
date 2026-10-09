// @ts-nocheck
"use client"

import { getSubcategorySortIndex } from "@/shared/lib/category-order";

import React, { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import * as XLSX from "xlsx"
import JSZip from "jszip"
import { useDropzone } from "react-dropzone"
import { Button } from "@/shared/ui/button"
import { useToast } from "@/shared/ui/use-toast"
import { useInventory } from "@/shared/contexts/InventoryContext"
import { createProduct, updateProduct } from "@/services/products"
import { getCategories, getSubCategories } from "@/services/categories"
import { formatColorEntry, getColorSwatch } from "@/shared/lib/color-swatch"
import { getCategoryPrefix, getMaterialPrefix } from "@/shared/lib/sku-generator"
import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabase/client"
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
  UploadCloud,
  Pencil,
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
  existingImageIds: string[]
  // status
  errors: string[]
  skipped?: boolean
  warnings: string[]
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

// Everything that must be fixed before a row can be imported
function getRowIssues(p: ParsedProduct, subCategories: any[]): string[] {
  if (p.skipped) return []
  const issues = [...p.errors]
  if (!p.categoryId && !issues.some((e) => e.toLowerCase().includes("category"))) issues.push("Category is required")
  const hasSubs = p.categoryId && subCategories.some((s) => String(s.category_id) === String(p.categoryId))
  if (hasSubs && !p.subCategoryId && !issues.some((e) => e.toLowerCase().includes("subcategory"))) issues.push("Subcategory is required")
  if (!(p.price > 0)) issues.push("Selling price is required")
  return issues
}

export default function BulkImportPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
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
  const [reviewFilter, setReviewFilter] = useState<"all" | "fix" | "ready" | "skipped">("all")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
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
      "application/octet-stream": [".xlsx", ".xls", ".csv"],
      "application/zip": [".zip"]
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
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })
      
      if (rawRows.length === 0) {
        toast({ title: "Empty file", description: "The spreadsheet has no data rows", variant: "destructive" })
        setParsing(false)
        return
      }

      // Pre-process rows into a lowercase-keyed map to make parsing case-insensitive
      const allNormalizedRows = rawRows.map(r => {
        const lower: Record<string, any> = {}
        Object.keys(r).forEach(k => {
          lower[k.trim().toLowerCase()] = r[k]
        })
        return { original: r, lower }
      })

      // Filter out rows that are effectively empty (e.g. have a S.No but no name or price)
      const normalizedRows = allNormalizedRows.filter(({ lower }) => {
        const name = String(lower["product name"] ?? lower["name"] ?? lower["title"] ?? "").trim()
        const price = String(lower["selling price (₹)"] ?? lower["selling price"] ?? lower["price"] ?? "").trim()
        const mrp = String(lower["mrp / original price (₹)"] ?? lower["mrp"] ?? lower["original price"] ?? lower["original_price"] ?? "").trim()
        
        // Only keep rows that have at least a name or a price
        return name !== "" || price !== "" || mrp !== ""
      })

      if (normalizedRows.length === 0) {
        toast({ title: "Empty file", description: "No valid products found in the spreadsheet", variant: "destructive" })
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

        // Build a lookup map of filename -> entry
        const fileMap = new Map<string, { path: string; entry: any }>()
        for (const [path, entry] of allEntries) {
          if (path.startsWith("__MACOSX") || path.startsWith(".")) continue
          const fileName = path.split("/").pop() || ""
          fileMap.set(fileName, { path, entry })
          const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
          if (!fileMap.has(nameWithoutExt)) {
            fileMap.set(nameWithoutExt, { path, entry })
          }
        }

        // Map entries to rows based on explicit filenames or row number fallback
        for (let idx = 0; idx < normalizedRows.length; idx++) {
          const { lower: lowerRow } = normalizedRows[idx]
          const rowNum = idx + 1
          const imageFileNamesRaw = String(lowerRow["image file name"] ?? lowerRow["image / photo shoot no."] ?? lowerRow["images"] ?? "").trim()
          
          const entries: Array<{ path: string; entry: any; isThumb?: boolean }> = []
          
          if (imageFileNamesRaw) {
            const names = imageFileNamesRaw.split(",").map(s => s.trim()).filter(Boolean)
            for (const rawName of names) {
              const isThumb = rawName.toLowerCase().includes("t")
              const cleanName = rawName.replace(/t/gi, "").trim()

              // First try looking for the exact cleaned number (without 't')
              let entry = fileMap.get(cleanName)
              if (!entry && !cleanName.includes(".")) {
                entry = fileMap.get(cleanName + ".png") || fileMap.get(cleanName + ".jpg") || fileMap.get(cleanName + ".jpeg") || fileMap.get(cleanName + ".webp")
              }
              
              // Fallback to rawName in case the file actually has 't' in its filename
              if (!entry) {
                entry = fileMap.get(rawName)
                if (!entry && !rawName.includes(".")) {
                  entry = fileMap.get(rawName + ".png") || fileMap.get(rawName + ".jpg") || fileMap.get(rawName + ".jpeg") || fileMap.get(rawName + ".webp")
                }
              }

              if (entry) entries.push({ ...entry, isThumb })
            }
          } else {
            // Fallback to prefix matching based on rowNum
            for (const [path, entry] of allEntries) {
              if (path.startsWith("__MACOSX") || path.startsWith(".")) continue
              const fileName = path.split("/").pop() || ""
              const match = fileName.match(/^(\d+)[-_\.]?/)
              if (match && parseInt(match[1], 10) === rowNum) {
                const isThumb = fileName.toLowerCase().includes("t")
                entries.push({ path, entry, isThumb })
              }
            }
          }

          if (entries.length > 0) {
            // Sort entries: files flagged as thumbnail go first
            entries.sort((a, b) => {
              if (a.isThumb && !b.isThumb) return -1
              if (!a.isThumb && b.isThumb) return 1
              
              // If neither or both are thumbs, sort alphabetically ONLY if we used fallback matching.
              // If they provided explicit comma-separated names, we want to preserve their order.
              if (!imageFileNamesRaw) {
                const aName = a.path.split("/").pop()?.toLowerCase() || ""
                const bName = b.path.split("/").pop()?.toLowerCase() || ""
                return aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
              }
              return 0;
            })

            // Filter out the 'isThumb' property so zipEntryMap stays consistent if needed
            zipEntryMap.set(rowNum, entries.map(e => ({ path: e.path, entry: e.entry })))
            const firstEntry = entries[0]
            const blob = await firstEntry.entry.async("blob")
            const preview = URL.createObjectURL(blob)
            previewMap.set(rowNum, { previews: [preview], count: entries.length })
          } else if (imageFileNamesRaw && !zipFile) {
            // If they didn't upload a ZIP but have comma-separated UUIDs/URLs, show a placeholder preview
            const ids = imageFileNamesRaw.split(",").map(s => s.trim()).filter(Boolean)
            if (ids.length > 0) {
              previewMap.set(rowNum, { previews: [], count: ids.length })
            }
          }
        }
      } else {
        // No zip file, but try to capture existing images for preview count
        for (let idx = 0; idx < normalizedRows.length; idx++) {
          const { lower: lowerRow } = normalizedRows[idx]
          const rowNum = idx + 1
          const imageFileNamesRaw = String(lowerRow["image file name"] ?? lowerRow["image / photo shoot no."] ?? lowerRow["images"] ?? "").trim()
          if (imageFileNamesRaw) {
            const ids = imageFileNamesRaw.split(",").map(s => s.trim()).filter(Boolean)
            if (ids.length > 0) {
              previewMap.set(rowNum, { previews: [], count: ids.length })
            }
          }
        }
      }

      // 3. Parse each row into a ParsedProduct
      const parsed: ParsedProduct[] = normalizedRows.map(({ original: row, lower: lowerRow }, idx) => {
        const rowNum = idx + 1
        const errors: string[] = []

        // Read fields (flexible header matching, case-insensitive)
        const name = String(lowerRow["product name"] ?? lowerRow["name"] ?? lowerRow["title"] ?? "").trim()
        const description = String(lowerRow["description"] ?? lowerRow["long description"] ?? lowerRow["short description"] ?? "").trim()
        const priceRaw = String(lowerRow["selling price (₹)"] ?? lowerRow["selling price"] ?? lowerRow["price"] ?? "").replace(/,/g, "")
        const mrpRaw = String(lowerRow["mrp / original price (₹)"] ?? lowerRow["mrp"] ?? lowerRow["original price"] ?? lowerRow["original_price"] ?? "").replace(/,/g, "")
        const rawCategory = String(lowerRow["category"] ?? "").trim()
        
        let categoryName = rawCategory;
        let subCategoryName = String(lowerRow["subcategory"] ?? lowerRow["sub category"] ?? "").trim()

        // Handle "saree>organja" format
        if (rawCategory.includes(">")) {
          const parts = rawCategory.split(">");
          categoryName = parts[0].trim();
          if (!subCategoryName && parts.length > 1) {
            subCategoryName = parts[1].trim();
          }
        }

        const material = String(lowerRow["material"] ?? "").trim()
        const skuRaw = String(lowerRow["sku / barcode"] ?? lowerRow["sku"] ?? lowerRow["barcode"] ?? "").trim()
        const colorsRaw = String(lowerRow["colors"] ?? "").trim()
        const stockRaw = String(lowerRow["stock quantity"] ?? lowerRow["stock"] ?? lowerRow["stock_quantity"] ?? lowerRow["quantity"] ?? "1").replace(/,/g, "")
        const specsRaw = String(lowerRow["specifications"] ?? "").trim()
        const variantsRaw = String(lowerRow["variants"] ?? "").trim()
        const parsedSpecs = parseSpecifications(specsRaw)

        // Capture specs from Attribute Label/Value columns
        for (let i = 1; i <= 5; i++) {
          const label = String(lowerRow[`attribute ${i} label`] ?? "").trim()
          const value = String(lowerRow[`attribute ${i} value`] ?? "").trim()
          if (label && value) {
            parsedSpecs[label] = value
          }
        }

        // We no longer capture unknown columns as specifications to prevent accidental sheet data (like scratch columns or misaligned headers) from appearing on the frontend.

        // Validate (lax rules for user specific format)
        if (!name) errors.push("Product name is required (use 'Product Name' or 'Title')")
        
        let price = parseFloat(priceRaw)
        if (isNaN(price) || price <= 0) price = 0; // Default to 0 instead of failing
        
        const originalPrice = mrpRaw ? parseFloat(mrpRaw) : null
        
        let stockQuantity = parseInt(stockRaw, 10)
        if (isNaN(stockQuantity) || stockQuantity < 0) stockQuantity = 1; // Default to 1

        // Resolve category
        const cat = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase(),
        )
        if (categoryName && !cat) {
          errors.push(`Category "${categoryName}" not found in admin. Please select an existing category.`)
        }

        // Resolve subcategory
        let subCat = null
        if (subCategoryName && cat) {
          subCat = subCategories.find(
            (s) =>
              s.name.toLowerCase() === subCategoryName.toLowerCase() &&
              String(s.category_id) === String(cat.id),
          )
          if (!subCat) {
            errors.push(`Subcategory "${subCategoryName}" not found under "${cat.name}". Please select an existing subcategory.`)
          }
        }

        // Parse colors
        const colors = parseColors(colorsRaw)

        // Get images from ZIP (lazy — entries only, no full extraction yet)
        const zipEntries = zipEntryMap.get(rowNum) ?? []
        const previewData = previewMap.get(rowNum) ?? { previews: [], count: 0 }
        
        const imageFileNamesRaw = String(lowerRow["image file name"] ?? lowerRow["image / photo shoot no."] ?? lowerRow["images"] ?? "").trim()
        const existingImageIds = imageFileNamesRaw 
          ? imageFileNamesRaw.split(",").map(s => s.trim()).filter(s => s.length > 15) // UUIDs or URLs
          : [];

        if (zipEntries.length === 0 && zipFile) {
          errors.push(`No images found in ZIP for this product. Ensure filenames match the "Image File Name" column or follow the "rowNumber-1.jpg" naming convention.`)
        }

        const warnings: string[] = []
        if (zipEntries.length === 0 && !zipFile && existingImageIds.length === 0) {
          warnings.push("No images provided for this product.");
        }

                if (!description) warnings.push("No description — add it here or edit after import")

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
          existingImageIds,
          errors,
          warnings,
          status: "pending" as const,
          statusMessage: "",
        }
      })

      setProducts(parsed)
      setStep("review")

      const errorCount = parsed.filter((p) => getRowIssues(p, subCategories).length > 0).length
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
    const manualFiles = product.imageFiles ?? []
    
    if (entries.length === 0) return manualFiles

    const files: File[] = []
    for (const { path, entry } of entries) {
      const blob = await entry.async("blob")
      const fileName = path.split("/").pop() || "image.jpg"
      files.push(new File([blob], fileName, { type: blob.type || "image/jpeg" }))
    }
    return [...files, ...manualFiles]
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
    const validProducts = products.filter((p) => !p.skipped && getRowIssues(p, subCategories).length === 0)
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

        // 4. Generate human-readable SKU
        let sku = product.sku ? product.sku.trim().toUpperCase().replace(/\s+/g, "-") : null
        
        let existingProductId = null;
        if (sku) {
           const { data: existingProd } = await supabase.from("products").select("id").eq("sku", sku).maybeSingle();
           if (existingProd) existingProductId = existingProd.id;
        }

        if (!sku) {
          const catPrefix = getCategoryPrefix(product.categoryName)
          const matPrefix = getMaterialPrefix(product.name, product.categoryName, product.material)
          const skuPrefix = `${catPrefix}-${matPrefix}`

          // Find the next available sequence for this prefix
          const { data: existingSkus } = await supabase
            .from("products")
            .select("sku")
            .ilike("sku", `${skuPrefix}-%`)
            .order("sku", { ascending: false })
            .limit(1)

          let nextSeq = 1
          if (existingSkus && existingSkus.length > 0 && existingSkus[0].sku) {
            const lastPart = existingSkus[0].sku.split("-").pop()
            nextSeq = (parseInt(lastPart || "0", 10) || 0) + 1
          }
          sku = `${skuPrefix}-${String(nextSeq).padStart(3, "0")}`
        }

        // 5. Build product payload
        setProducts((prev) =>
          prev.map((p) =>
            p.rowNumber === product.rowNumber
              ? { ...p, statusMessage: existingProductId ? "Updating product..." : "Creating product..." }
              : p,
          ),
        )

        const finalCategoryId = product.categoryId;
        const finalSubCategoryId = product.subCategoryId;

        const payload: any = {
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          category: finalCategoryId,
          subCategory: finalSubCategoryId,
          colors: product.colors,
          quantity: product.stockQuantity,
          specifications: product.specifications,
          material: product.material || null,
          sku,
          barcode: sku, // Merge: barcode = sku
          isVisible: true,
          isCustomDesign: false,
          inStock: product.stockQuantity > 0,
          variants: product.variants,
        }

        if (imageIds.length > 0) {
          payload.images = imageIds;
        } else if (product.existingImageIds && product.existingImageIds.length > 0) {
          payload.images = product.existingImageIds;
        }

        // 6. Create or Update product DIRECTLY
        let result;
        let actionWord = "Created";
        if (existingProductId) {
          // Exclude certain fields that shouldn't be overwritten blindly if empty in update
          result = await updateProduct(existingProductId, payload);
          actionWord = "Updated";
        } else {
          result = await createProduct(payload);
        }

        if (result.error) {
          throw new Error(result.error.message || `Failed to ${existingProductId ? 'update' : 'create'} product`)
        }

        // Track success in session
        session.completedRows.push(product.rowNumber)
        session.uploadedImages[product.rowNumber] = imageIds
        saveImportSession(session)

        // Success
        const imgMsg = failedUploads.length > 0
          ? `✅ ${actionWord} with ${imageIds.length || product.existingImageIds.length} images (${failedUploads.length} failed)`
          : `✅ ${actionWord} with ${imageIds.length || product.existingImageIds.length} images`

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
        { header: "Description", key: "desc", width: 70 },
        { header: "Category", key: "cat", width: 22 },
        { header: "Subcategory", key: "subcat", width: 28 },
        { header: "Selling Price (₹)", key: "price", width: 18 },
        { header: "MRP / Original Price (₹)", key: "mrp", width: 22 },
        { header: "Stock Quantity", key: "stock", width: 15 },
        { header: "SKU", key: "sku", width: 22 },
        { header: "Image / Photo Shoot No.", key: "imagefile", width: 35 },
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

      // Use same sort order as admin: Sarees first, then alphabetical
      const sortedCategories = [...categories].sort((a, b) => {
        if (a.name.toLowerCase() === 'sarees') return -1;
        if (b.name.toLowerCase() === 'sarees') return 1;
        return a.name.localeCompare(b.name);
      });
      const categoryNames = sortedCategories.map((c) => c.name)
      const allSubCategoryNames = [...subCategories].sort((a, b) => {
        const iA = getSubcategorySortIndex(a.name);
        const iB = getSubcategorySortIndex(b.name);
        if (iA !== iB) return iA - iB;
        return a.name.localeCompare(b.name);
      }).map((s) => s.name)
      const uniqueSubCategoryNames = [...new Set(allSubCategoryNames)]

      // Add Sample Rows
      ws.addRow({
        name: "Tussar Silk Kalamkari Saree – Peacock Motif",
        desc: "A stunning hand-painted pen Kalamkari saree crafted on pure Tussar silk. Features intricate peacock and floral motifs created by skilled artisans from Srikalahasti.",
        cat: categoryNames.includes("Sarees") ? "Sarees" : (categoryNames[0] || ""),
        subcat: "Tussar Silk",
        price: 8500,
        mrp: 12000,
        stock: 1,
        sku: "SAR-TSK-001",
        imagefile: "2234, 2235t, 2236",
        attr1l: "Wash Care",
        attr1v: "Dry Clean Only",
        attr2l: "Dimensions",
        attr2v: "6.5 meters",
        attr3l: "Craft",
        attr3v: "Pen Kalamkari"
      })

      ws.addRow({
        name: "Mangalagiri Cotton Dupatta – Temple Border",
        desc: "A lightweight Mangalagiri cotton dupatta featuring a beautiful Kalamkari temple border design. Perfect for casual and semi-formal occasions.",
        cat: categoryNames.includes("Dupattas") ? "Dupattas" : (categoryNames[1] || ""),
        subcat: "Mangalagiri Cotton",
        price: 1800,
        mrp: 2500,
        stock: 3,
        sku: "DUP-MCT-001",
        imagefile: "2245, 2246t, 2247",
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
        // Category dropdown — flat list (column C)
        ws.getCell(`C${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [catFormula],
          showErrorMessage: true,
          errorTitle: 'Invalid Category',
          error: 'Please select a category from the dropdown list'
        }

        // Subcategory dropdown — cascading via INDIRECT (column D)
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

  const skippedCount = products.filter((p) => p.skipped).length
  const validCount = products.filter((p) => !p.skipped && getRowIssues(p, subCategories).length === 0).length
  const errorCount = products.filter((p) => getRowIssues(p, subCategories).length > 0).length
  const rowStatus = (p: ParsedProduct) =>
    p.skipped ? "skipped" : getRowIssues(p, subCategories).length > 0 ? "fix" : "ready"
  const visibleRows = reviewFilter === "all" ? products : products.filter((p) => rowStatus(p) === reviewFilter)
  const selectedVisible = visibleRows.filter((p) => selectedRows.has(p.rowNumber)).length
  const setSkipForSelected = (skipped: boolean) => {
    setProducts((prev) => prev.map((p) => (selectedRows.has(p.rowNumber) ? { ...p, skipped } : p)))
    setSelectedRows(new Set())
  }
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
          onClick={() => router.push("/dashboard/add-product")}
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
                    <p><strong>1. Match by Image Name:</strong> The numbers in your <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">Image / Photo Shoot No.</code> column must match the image file names in your ZIP.</p>
                    <p><strong>2. Thumbnails:</strong> Add a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">t</code> to any number in your Excel sheet (like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">2235t</code>) to automatically make it the main thumbnail!</p>
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
          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter products">
            {([
              ["all", "All", products.length],
              ["fix", "Needs fixing", errorCount],
              ["ready", "Ready", validCount],
              ["skipped", "Skipped", skippedCount],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={reviewFilter === key}
                onClick={() => setReviewFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  reviewFilter === key
                    ? "bg-[#0B2A55] border-[#0B2A55] text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label} <span className="tabular-nums">{count}</span>
              </button>
            ))}
          </div>

          {/* Product list */}
          <div className="border rounded-xl overflow-hidden bg-white">
            {/* Selection toolbar */}
            <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 border-b bg-slate-50">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#0B2A55]"
                  checked={visibleRows.length > 0 && selectedVisible === visibleRows.length}
                  ref={(el) => { if (el) el.indeterminate = selectedVisible > 0 && selectedVisible < visibleRows.length }}
                  onChange={(e) =>
                    setSelectedRows((prev) => {
                      const next = new Set(prev)
                      visibleRows.forEach((p) => (e.target.checked ? next.add(p.rowNumber) : next.delete(p.rowNumber)))
                      return next
                    })
                  }
                  disabled={visibleRows.length === 0}
                />
                {selectedRows.size > 0 ? `${selectedRows.size} selected` : "Select all"}
              </label>
              {selectedRows.size > 0 ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setSkipForSelected(true)}>Skip selected</Button>
                  <Button size="sm" variant="outline" onClick={() => setSkipForSelected(false)}>Include selected</Button>
                  <button type="button" onClick={() => setSelectedRows(new Set())} className="text-sm text-slate-600 underline underline-offset-2">Clear</button>
                </>
              ) : errorCount > 0 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProducts((prev) => prev.map((p) => (!p.skipped && getRowIssues(p, subCategories).length > 0 ? { ...p, skipped: true } : p)))}
                >
                  Skip all {errorCount} needing fixes
                </Button>
              ) : null}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {visibleRows.length === 0 && (
                <p className="p-6 text-sm text-slate-600 text-center">No products in this view.</p>
              )}
              {visibleRows.map((product) => {
                const issues = getRowIssues(product, subCategories)
                const hasErrors = issues.length > 0
                const isExpanded = expandedRows.has(product.rowNumber)

                return (
                  <div
                    key={product.rowNumber}
                    className={`border-b last:border-b-0 ${hasErrors ? "bg-red-50/50" : ""} ${product.skipped ? "opacity-50" : ""}`}
                  >
                    {/* Row summary */}
                    <div className="flex items-center">
                    <input
                      type="checkbox"
                      aria-label={`Select product ${product.rowNumber}`}
                      className="ml-3 h-4 w-4 shrink-0 accent-[#0B2A55]"
                      checked={selectedRows.has(product.rowNumber)}
                      onChange={() =>
                        setSelectedRows((prev) => {
                          const next = new Set(prev)
                          if (!next.delete(product.rowNumber)) next.add(product.rowNumber)
                          return next
                        })
                      }
                    />
                    <button
                      onClick={() => toggleRow(product.rowNumber)}
                      className="flex-1 min-w-0 flex items-center gap-3 p-3 text-left hover:bg-slate-50/50 transition-colors"
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
                          {product.categoryId ? (
                            <span className="text-green-600">{product.categoryName}</span>
                          ) : product.categoryName ? (
                            <span className="text-red-500">⚠ {product.categoryName}</span>
                          ) : (
                            <span className="text-slate-400">No category</span>
                          )}
                          {product.subCategoryName ? (
                            product.subCategoryId ? (
                              <span className="text-green-600"> → {product.subCategoryName}</span>
                            ) : (
                              <span className="text-red-500"> → ⚠ {product.subCategoryName}</span>
                            )
                          ) : ""} · ₹
                          {product.price.toLocaleString("en-IN")} · {product.zipEntries?.length ?? product.imageFiles.length} images
                        </p>
                      </div>

                      {/* Status icon */}
                      {hasErrors ? (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      ) : (product.warnings?.length ?? 0) > 0 ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      )}

                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProducts(prev => prev.map(p => p.rowNumber === product.rowNumber ? { ...p, skipped: !p.skipped } : p))}
                      className="mr-3 shrink-0 text-xs px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      {product.skipped ? "Include" : "Skip"}
                    </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3">
                        {/* Errors */}
                        {hasErrors && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                            {issues.map((err, i) => (
                              <p key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                {err}
                              </p>
                            ))}
                            {issues.some(e => e.toLowerCase().includes("image")) && (
                              <div className="mt-2 ml-5">
                                <label className="text-xs bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded shadow-sm cursor-pointer hover:bg-slate-50 inline-flex items-center gap-1.5 font-medium transition-colors">
                                  <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                                  Upload Missing Images
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    multiple 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || [])
                                      if (files.length === 0) return
                                      
                                      setProducts(prev => prev.map(p => {
                                        if (p.rowNumber !== product.rowNumber) return p
                                        
                                        const newPreviews = files.map(f => URL.createObjectURL(f))
                                        const newErrors = p.errors.filter(err => !err.toLowerCase().includes("image"))
                                        
                                        return {
                                          ...p,
                                          imageFiles: [...(p.imageFiles || []), ...files],
                                          imagePreviews: [...(p.imagePreviews || []), ...newPreviews],
                                          errors: newErrors
                                        }
                                      }))
                                    }}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Warnings */}
                        {(product.warnings?.length ?? 0) > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                            {product.warnings.map((w, i) => (
                              <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                {w}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Editable details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {/* Category dropdown */}
                          <div>
                            <label className="text-slate-500 block mb-1">Category</label>
                            <select
                              className={`w-full px-2 py-1.5 border rounded text-sm font-medium ${!product.categoryId ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}
                              value={product.categoryId || ""}
                              onChange={(e) => {
                                const catId = e.target.value || null
                                const cat = categories.find(c => c.id === catId)
                                setProducts(prev => prev.map(p => {
                                  if (p.rowNumber !== product.rowNumber) return p
                                  // Clear subcategory when category changes
                                  const newErrors = p.errors
                                    .filter(err => !err.toLowerCase().includes('category'))
                                  if (!catId) newErrors.push('Category is required')
                                  return {
                                    ...p,
                                    categoryId: catId,
                                    categoryName: cat?.name || '',
                                    subCategoryId: null,
                                    subCategoryName: '',
                                    errors: newErrors,
                                  }
                                }))
                              }}
                            >
                              <option value="">Select category...</option>
                              {categories
                                .sort((a, b) => {
                                  if (a.name.toLowerCase() === 'sarees') return -1;
                                  if (b.name.toLowerCase() === 'sarees') return 1;
                                  return a.name.localeCompare(b.name);
                                })
                                .map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          {/* Subcategory dropdown */}
                          <div>
                            <label className="text-slate-500 block mb-1">Subcategory</label>
                            <select
                              className={`w-full px-2 py-1.5 border rounded text-sm font-medium ${issues.some(e => e.toLowerCase().includes("subcategory")) ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}
                              value={product.subCategoryId || ""}
                              disabled={!product.categoryId}
                              onChange={(e) => {
                                const subId = e.target.value || null
                                const sub = subCategories.find(s => s.id === subId)
                                setProducts(prev => prev.map(p => {
                                  if (p.rowNumber !== product.rowNumber) return p
                                  const newErrors = p.errors.filter(err => !err.toLowerCase().includes('subcategory'))
                                  return {
                                    ...p,
                                    subCategoryId: subId,
                                    subCategoryName: sub?.name || '',
                                    errors: newErrors,
                                  }
                                }))
                              }}
                            >
                              <option value="">None / All</option>
                              {subCategories
                                .filter(s => String(s.category_id) === String(product.categoryId))
                                .sort((a, b) => {
                                  const cat = categories.find(c => String(c.id) === String(product.categoryId))
                                  if (cat && cat.name.toLowerCase() === 'sarees') {
                                    const iA = getSubcategorySortIndex(a.name);
                                    const iB = getSubcategorySortIndex(b.name);
                                    if (iA !== iB) return iA - iB;
                                  }
                                  return a.name.localeCompare(b.name);
                                })
                                .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-1">Selling Price (₹)</label>
                            <input
                              type="number"
                              className={`w-full px-2 py-1.5 border rounded text-sm font-medium ${product.price <= 0 ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}
                              value={product.price || ""}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                setProducts(prev => prev.map(p =>
                                  p.rowNumber === product.rowNumber
                                    ? { ...p, price: val, warnings: p.warnings.filter(w => !w.includes("Price")) }
                                    : p
                                ))
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-1">MRP / Original Price (₹)</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-medium bg-white"
                              value={product.originalPrice || ""}
                              placeholder="Optional"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || null
                                setProducts(prev => prev.map(p =>
                                  p.rowNumber === product.rowNumber
                                    ? { ...p, originalPrice: val }
                                    : p
                                ))
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-1">Stock</label>
                            <input
                              type="number"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-medium bg-white"
                              value={product.stockQuantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                setProducts(prev => prev.map(p =>
                                  p.rowNumber === product.rowNumber
                                    ? { ...p, stockQuantity: val }
                                    : p
                                ))
                              }}
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-slate-500 block mb-1">SKU</label>
                            <input
                              type="text"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm font-medium bg-white"
                              value={product.sku || ""}
                              placeholder="Auto-generated if empty"
                              onChange={(e) => {
                                setProducts(prev => prev.map(p =>
                                  p.rowNumber === product.rowNumber
                                    ? { ...p, sku: e.target.value || null }
                                    : p
                                ))
                              }}
                            />
                          </div>
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
          <div className="sticky bottom-0 z-20 flex items-center justify-between flex-wrap gap-3 bg-white border-t py-3">
            <Button variant="outline" onClick={() => { setStep("upload"); setProducts([]) }} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Upload
            </Button>
            <div className="flex items-center gap-3">
              {errorCount > 0 && (
                <p className="text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                  Fix {errorCount} product{errorCount > 1 ? "s" : ""} with errors: fix or skip {errorCount > 1 ? "them" : "it"}
                </p>
              )}
              <Button
                onClick={handleImportAll}
                disabled={validCount === 0 || errorCount > 0}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Import {validCount} Products{skippedCount > 0 ? ` (${skippedCount} skipped)` : ""}
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
                <Button 
                  onClick={async () => {
                    await queryClient.invalidateQueries({ queryKey: ["products"] });
                    await queryClient.invalidateQueries({ queryKey: ["home", "category-index"] });
                    router.push("/dashboard/products");
                  }} 
                  className="gap-1.5"
                >
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
