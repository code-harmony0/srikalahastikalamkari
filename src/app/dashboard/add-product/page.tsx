"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Checkbox } from "@/shared/ui/checkbox"
import { useToast } from "@/shared/ui/use-toast"
import {
  Loader2,
  Upload,
  X,
  ArrowLeft,
  AlertTriangle,
  Package,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  FolderTree,
  Palette,
  Image,
  Boxes,
} from "lucide-react"
import { getCategories, getSubCategories } from "@/services/categories"
import {
  uploadImage,
  checkDuplicateProduct,
  updateProductStock,
} from "@/services/products"
import { useInventory } from "@/shared/contexts/InventoryContext"

import imageCompression from "browser-image-compression"
import Barcode from "react-barcode"
import { generateBarcode } from "@/shared/utils/barcodeUtils"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import {
  getProductImageDebugInfo,
  isProductImageDebugEnabled,
} from "@/lib/cloudflare-images"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"

// Indian number formatting helper
const formatIndianNumber = (num: string | number): string => {
  if (!num) return ""
  const numStr = num.toString().replace(/,/g, "")
  const parts = numStr.split(".")
  const intPart = parts[0]
  const decPart = parts[1] ? `.${parts[1]}` : ""

  // Indian formatting: last 3 digits, then groups of 2
  const lastThree = intPart.substring(intPart.length - 3)
  const otherNumbers = intPart.substring(0, intPart.length - 3)
  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
    (otherNumbers ? "," : "") +
    lastThree

  return formatted + decPart
}

const summarizeImageRef = (ref: string) => {
  if (ref.startsWith("data:")) return `data-url:${ref.slice(0, 32)}...`
  if (ref.startsWith("blob:")) return `blob-url:${ref.slice(0, 48)}...`
  return ref
}

// Collapsible Section Component
const FormSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-8 w-8 md:h-9 md:w-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
          <span className="text-sm md:text-base font-semibold text-slate-900 text-left line-clamp-1">
            {title}
          </span>
          {badge && (
            <span className="shrink-0 px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center">
              {badge}
            </span>
          )}
        </div>
        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 ml-2">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 pt-2 md:p-6 md:pt-2 border-t border-slate-100 bg-slate-50/30">
          {children}
        </div>
      )}
    </div>
  )
}

const AddProduct = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { addProduct, updateProduct } = useInventory()

  // Check if we are in edit mode - get product data from URL params or session storage
  const editingProductId = searchParams.get("edit")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const isEditMode = !!editingProductId

  // Track if we're in the initial edit mode population
  const isInitialPopulation = useRef(false)
  const targetSubCategoryId = useRef<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    subCategory: "",
    colors: "",
    quantity: "",
    inStock: true,
    isVisible: true,
  })

  // UI state
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [compressionStats, setCompressionStats] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [generatedBarcode, setGeneratedBarcode] = useState<string | null>(null)

  // Duplicate prevention state
  const [duplicateProduct, setDuplicateProduct] = useState<any | null>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateType, setDuplicateType] = useState<"name" | "barcode" | null>(
    null,
  )
  const [stockToAdd, setStockToAdd] = useState("")

  // Predefined color palette
  const colorPalette = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#FFA500",
    "#FFC0CB",
    "#A52A2A",
    "#DDA0DD",
    "#F0E68C",
    "#E6E6FA",
    "#000000",
    "#FFFFFF",
    "#808080",
    "#C0C0C0",
    "#D2691E",
    "#F5F5DC",
  ]

  // Specifications state
  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([])
  const [newSpec, setNewSpec] = useState({ key: "", value: "" })

  // Variants state
  const [variants, setVariants] = useState<any[]>([])
  const [showVariants, setShowVariants] = useState(false)

  useEffect(() => {
    if (!isProductImageDebugEnabled()) return

    console.info("[image-debug][dashboard-product-form:state]", {
      mode: isEditMode ? "edit" : "create",
      editingProductId,
      pendingUploadFiles: imageFiles.map((file) => ({
        name: file.name,
        type: file.type,
        sizeBytes: file.size,
      })),
      previewCount: imagePreviews.length,
      previews: imagePreviews.map((ref, index) => ({
        index,
        ref: summarizeImageRef(ref),
        debug: ref.startsWith("data:") || ref.startsWith("blob:")
          ? { sourceType: "local-preview" }
          : getProductImageDebugInfo(ref, "thumb"),
      })),
    })
  }, [editingProductId, imageFiles, imagePreviews, isEditMode])

  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "", color: "", sku: "", stock_quantity: 0, price_modifier: 0 },
    ])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const addSpec = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setSpecifications([
        ...specifications,
        { key: newSpec.key.trim(), value: newSpec.value.trim() },
      ])
      setNewSpec({ key: "", value: "" })
    }
  }

  const removeSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  // Fetch categories on mount
  useEffect(() => {
    const fetchData = async () => {
      let { data: cats } = await getCategories()

      // Auto-seed if no categories exist (Disabled broken call)
      if (!cats || cats.length === 0) {
        console.log(
          "No categories found. Please seed the database manually or through the SQL editor.",
        )
        // await seedCategories(); // This was broken
        const { data: newCats } = await getCategories()
        cats = newCats
      }

      const { data: subCats } = await getSubCategories()

      if (cats) {
        setCategories(cats)
      }
      if (subCats) setSubCategories(subCats)
    }
    fetchData()
  }, [])

  // Load product data if in edit mode
  useEffect(() => {
    if (editingProductId && !editingProduct) {
      // Try to load from session storage
      const stored = sessionStorage.getItem(`product_${editingProductId}`)
      if (stored) {
        setEditingProduct(JSON.parse(stored))
      }
    }
  }, [editingProductId])

  // Populate form if editing - runs when product loads AND when categories/subcategories load
  useEffect(() => {
    if (
      isEditMode &&
      editingProduct &&
      categories.length > 0 &&
      subCategories.length > 0
    ) {
      console.log("🔄 Populating edit form with:", editingProduct)
      isInitialPopulation.current = true

      // Helper to get value from either camelCase or snake_case
      const getVal = (camel: string, snake: string) => {
        return editingProduct[camel] !== undefined
          ? editingProduct[camel]
          : editingProduct[snake]
      }

      const categoryId = getVal("category", "category_id")
      const subCategoryId = getVal("subCategory", "sub_category_id")
      const price = editingProduct.price
      const originalPrice = getVal("originalPrice", "original_price")
      const quantity = getVal("quantity", "stock_quantity")
      const inStock = getVal("inStock", "in_stock")

      console.log(
        "📂 Category ID:",
        categoryId,
        "Subcategory ID:",
        subCategoryId,
      )

      // Store the target subcategory to be set later when options are ready
      if (subCategoryId) {
        targetSubCategoryId.current = subCategoryId.toString()
      }

      // Set everything EXCEPT subCategory
      setFormData((prev) => ({
        ...prev,
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: price?.toString() || "",
        originalPrice: originalPrice?.toString() || "",
        category: categoryId?.toString() || "",
        subCategory: "", // Will be set by the effect below
        colors: "",
        quantity: quantity?.toString() || "1",
        inStock: inStock ?? true,
      }))

      // Handle colors - they might be array, JSON string, or comma-separated string
      let colorsToSet: string[] = []
      const rawColors = editingProduct.colors

      console.log("🎨 Raw colors from DB:", rawColors, typeof rawColors)

      if (rawColors) {
        if (Array.isArray(rawColors)) {
          colorsToSet = rawColors
        } else if (typeof rawColors === "string") {
          try {
            // Try parsing as JSON first
            const parsed = JSON.parse(rawColors)
            colorsToSet = Array.isArray(parsed) ? parsed : [rawColors]
          } catch {
            // If not JSON, treat as comma-separated
            colorsToSet = rawColors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          }
        }
      }

      console.log("🎨 Setting colors:", colorsToSet)
      setSelectedColors(colorsToSet)

      // Handle specifications
      if (editingProduct.specifications) {
        try {
          const specs =
            typeof editingProduct.specifications === "string"
              ? JSON.parse(editingProduct.specifications)
              : editingProduct.specifications

          if (specs && typeof specs === "object") {
            const specsArray = Object.entries(specs).map(([key, value]) => ({
              key,
              value: String(value),
            }))
            setSpecifications(specsArray)
          }
        } catch (e) {
          console.error("Error parsing specifications:", e)
        }
      }

      // Set barcode if editing
      if (editingProduct.barcode) {
        setGeneratedBarcode(editingProduct.barcode)
      }

      // Handle existing images
      const existingImages = []
      if (editingProduct.images && Array.isArray(editingProduct.images)) {
        existingImages.push(...editingProduct.images)
      } else if (editingProduct.image) {
        existingImages.push(editingProduct.image)
      }

      if (existingImages.length > 0) {
        setImagePreviews(existingImages)
      }

      // Clear the flag after a short delay
      setTimeout(() => {
        isInitialPopulation.current = false
      }, 500)
    }
  }, [isEditMode, editingProduct, categories, subCategories])

  // Apply target subcategory when options are ready
  useEffect(() => {
    if (targetSubCategoryId.current && filteredSubCategories.length > 0) {
      const target = targetSubCategoryId.current
      const exists = filteredSubCategories.find(
        (s) => s.id.toString() === target,
      )

      if (exists) {
        console.log("🎯 Applying target subcategory:", target)
        setFormData((prev) => ({ ...prev, subCategory: target }))
        targetSubCategoryId.current = null // Clear it so we don't keep setting it
      }
    }
  }, [filteredSubCategories])

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      // Compare as strings since category_id is UUID
      const filtered = subCategories.filter(
        (sub) => String(sub.category_id) === String(formData.category),
      )
      setFilteredSubCategories(filtered)
      console.log("📋 Filtered subcategories:", filtered)

      // Only reset subcategory if it's not valid for the new category
      // BUT: Don't reset if we're in the initial edit mode population
      if (
        !isInitialPopulation.current &&
        formData.subCategory &&
        !filtered.find((s) => String(s.id) === String(formData.subCategory))
      ) {
        console.log("⚠️ Subcategory not in filtered list, clearing")
        setFormData((prev) => ({ ...prev, subCategory: "" }))
      }
    } else {
      setFilteredSubCategories([])
    }
  }, [formData.category, subCategories])

  // Handle multiple image uploads with compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    await processFiles(files)
  }

  // Process multiple files
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return

    if (isProductImageDebugEnabled()) {
      console.info("[image-debug][dashboard-product-form:files-selected]", {
        selectedCount: files.length,
        existingPreviewCount: imagePreviews.length,
        existingUploadFileCount: imageFiles.length,
        files: files.map((file) => ({
          name: file.name,
          type: file.type,
          sizeBytes: file.size,
        })),
      })
    }

    // Check image limit (max 5)
    const remainingSlots = 5 - imageFiles.length
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: "You can upload a maximum of 5 images per product",
        variant: "destructive",
      })
      return
    }

    // Limit files to remaining slots
    const filesToProcess = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      toast({
        title: "Image limit",
        description: `Only adding ${remainingSlots} image(s). Maximum is 5 images per product.`,
      })
    }

    setCompressing(true)
    const newPreviews: string[] = []
    const newCompressedFiles: File[] = []
    const newStats: string[] = []

    for (const file of filesToProcess) {
      // Show preview immediately
      const reader = new FileReader()
      const previewPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
      const preview = await previewPromise
      newPreviews.push(preview)

      // High-quality WebP conversion — preserves handcraft detail for zooming
      try {
        const options = {
          maxSizeMB: 4, // Allow up to 4MB — WebP will naturally be far smaller
          maxWidthOrHeight: 2400, // Full resolution for zoom detail
          useWebWorker: true,
          fileType: "image/webp", // WebP: ~35% smaller than JPEG at same visual quality
          initialQuality: 0.92, // Near-lossless — every brushstroke preserved
        }

        const compressedFile = await imageCompression(file, options)
        const originalSize = (file.size / 1024 / 1024).toFixed(2)
        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2)
        const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(0)

        newStats.push(`${originalSize}MB → ${compressedSize}MB (-${savings}%)`)
        newCompressedFiles.push(compressedFile)

        if (isProductImageDebugEnabled()) {
          console.info("[image-debug][dashboard-product-form:compressed]", {
            name: file.name,
            originalType: file.type,
            originalSizeBytes: file.size,
            compressedType: compressedFile.type,
            compressedSizeBytes: compressedFile.size,
            stat: `${originalSize}MB -> ${compressedSize}MB (-${savings}%)`,
          })
        }
      } catch (error) {
        console.error("Compression failed:", error)
        newStats.push("Failed, using original")
        newCompressedFiles.push(file)
      }
    }

    setImageFiles((prev) => [...prev, ...newCompressedFiles])
    setImagePreviews((prev) => [...prev, ...newPreviews])
    setCompressionStats((prev) => [...prev, ...newStats])
    setCompressing(false)
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    )
    await processFiles(files)
  }

  // Handle box click
  const handleBoxClick = () => {
    document.getElementById("image")?.click()
  }

  // Remove single image
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setCompressionStats((prev) => prev.filter((_, i) => i !== index))
  }

  // Clear all images
  const clearAllImages = () => {
    setImageFiles([])
    setImagePreviews([])
    setCompressionStats([])
  }

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Real-time validation for original price
    if (field === "originalPrice" && value) {
      const originalPrice = parseFloat(value)
      const sellingPrice = parseFloat(formData.price)
      if (
        originalPrice > 0 &&
        sellingPrice > 0 &&
        originalPrice <= sellingPrice
      ) {
        setErrors((prev) => ({
          ...prev,
          originalPrice: "Original price must be greater than selling price",
        }))
      } else {
        setErrors((prev) => ({ ...prev, originalPrice: "" }))
      }
    }

    // Also validate when price changes if original price exists
    if (field === "price" && formData.originalPrice) {
      const sellingPrice = parseFloat(value)
      const originalPrice = parseFloat(formData.originalPrice)
      if (
        originalPrice > 0 &&
        sellingPrice > 0 &&
        originalPrice <= sellingPrice
      ) {
        setErrors((prev) => ({
          ...prev,
          originalPrice: "Original price must be greater than selling price",
        }))
      } else {
        setErrors((prev) => ({ ...prev, originalPrice: "" }))
      }
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Color picker functions
  const addColor = (color: string) => {
    if (!selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color])
    }
  }

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== color))
  }

  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? "#000000" : "#FFFFFF"
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim())
      newErrors.description = "Description is required"
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required"

    // Validate original price must be greater than selling price
    if (formData.originalPrice && parseFloat(formData.originalPrice) > 0) {
      if (parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
        newErrors.originalPrice =
          "Original price must be greater than selling price"
      }
    }

    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.quantity || parseInt(formData.quantity) < 0)
      newErrors.quantity = "Valid quantity is required"

    // Mandatory image validation
    if (imagePreviews.length === 0) {
      newErrors.images = "At least one product image is required"
      toast({
        title: "Missing Product Image",
        description: "Please upload at least one image for the product",
        variant: "destructive",
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let imageUrls: string[] = []

      // 1. Keep existing persisted refs that haven't been removed.
      // New file previews are data/blob URLs and are uploaded below.
      const existingUrls = imagePreviews.filter(
        (url) => !url.startsWith("data:") && !url.startsWith("blob:"),
      )

      if (isProductImageDebugEnabled()) {
        console.info("[image-debug][dashboard-product-form:submit-start]", {
          mode: isEditMode ? "edit" : "create",
          editingProductId,
          existingPersistedRefs: existingUrls.map((ref, index) => ({
            index,
            ref: summarizeImageRef(ref),
            debug: getProductImageDebugInfo(ref, "thumb"),
          })),
          newUploadFiles: imageFiles.map((file) => ({
            name: file.name,
            type: file.type,
            sizeBytes: file.size,
          })),
        })
      }

      // 2. Upload all files in `imageFiles`
      const newUploadPromises = imageFiles.map((file) => uploadImage(file))
      const uploadResults = await Promise.all(newUploadPromises)

      if (isProductImageDebugEnabled()) {
        console.info("[image-debug][dashboard-product-form:upload-results]", {
          results: uploadResults.map((result, index) => ({
            index,
            hasError: Boolean(result.error),
            errorMessage: result.error?.message,
            storedRef: result.url,
            debug: getProductImageDebugInfo(result.url, "thumb"),
          })),
        })
      }

      // Check for errors
      const failedUploads = uploadResults.filter((r) => r.error)
      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} images`)
      }

      const newUrls = uploadResults.map((r) => r.url as string)

      // 3. Combine
      imageUrls = [...existingUrls, ...newUrls]

      if (isProductImageDebugEnabled()) {
        console.info("[image-debug][dashboard-product-form:final-images]", {
          refsWrittenToProduct: imageUrls.map((ref, index) => ({
            index,
            ref,
            thumb: getProductImageDebugInfo(ref, "thumb"),
            medium: getProductImageDebugInfo(ref, "medium"),
            full: getProductImageDebugInfo(ref, "full"),
          })),
        })
      }

      // Generate unique barcode for new products
      let barcode = editingProduct?.barcode // Keep existing barcode if updating
      if (!isEditMode) {
        const uniqueId = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        barcode = generateBarcode(uniqueId)
        setGeneratedBarcode(barcode) // Store for display
      }

      // CHECK FOR DUPLICATES (only when creating new product)
      if (!isEditMode) {
        const duplicateCheck = await checkDuplicateProduct(
          formData.name.trim(),
          barcode,
        )

        if (duplicateCheck.error) {
          throw new Error("Error checking for duplicates")
        }

        // If duplicate found, show dialog and stop submission
        if (duplicateCheck.data) {
          setDuplicateProduct(duplicateCheck.data)
          setDuplicateType(duplicateCheck.duplicateType || null)
          setShowDuplicateDialog(true)
          setLoading(false)
          return // Stop here, don't create product
        }
      }

      // Convert specifications array to object
      const specsObject = specifications.reduce(
        (acc, curr) => {
          if (curr.key.trim()) {
            acc[curr.key.trim()] = curr.value.trim()
          }
          return acc
        },
        {} as Record<string, string>,
      )

      // Extract material from specifications if present (case-insensitive)
      const materialSpec = specifications.find(
        (s) => s.key.trim().toLowerCase() === "material",
      )
      const materialValue = materialSpec ? materialSpec.value.trim() : null

      // Prepare product data
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : null,
        category: formData.category, // Keep as UUID string
        subCategory: formData.subCategory || null, // Keep as UUID string
        colors: selectedColors, // Use the selectedColors array
        specifications: specsObject, // Add specifications
        quantity: parseInt(formData.quantity),
        inStock: formData.inStock,
        isVisible: formData.isVisible,
        images: imageUrls, // All images (array)
        barcode: barcode, // Add barcode to product data
        material: materialValue, // Add material from specifications
        variants: showVariants ? variants : [], // Add variants if enabled
      }

      if (isEditMode && editingProduct) {
        const result = await updateProduct(editingProduct.id, productData)
        if (result.error) {
          throw new Error(result.error.message || "Failed to update product")
        }
        toast({
          title: "Success!",
          description: "Product updated successfully",
        })

        // Clear the session storage for this product
        sessionStorage.removeItem(`product_${editingProduct.id}`)

        // Navigate back immediately - the context has already refreshed
        router.push("/dashboard/products")
      } else {
        const result = await addProduct(productData)
        if (result.error) {
          throw new Error(result.error.message || "Failed to create product")
        }
        toast({
          title: "Success!",
          description: "Product created successfully",
        })

        // Navigate back after a short delay for new products
        setTimeout(() => {
          router.push("/dashboard/products")
        }, 500)
      }
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle stock update from duplicate dialog
  const handleStockUpdate = async () => {
    if (!duplicateProduct || !stockToAdd || parseInt(stockToAdd) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity to add",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const quantity = parseInt(stockToAdd)
      const { data, error } = await updateProductStock(
        duplicateProduct.id,
        quantity,
      )

      if (error) {
        throw new Error(error.message || "Failed to update stock")
      }

      const currentStock =
        duplicateProduct.stock_quantity || duplicateProduct.quantity || 0
      const newStock = currentStock + quantity

      toast({
        title: "Stock Updated!",
        description: `Stock increased from ${currentStock} to ${newStock} units`,
      })

      setShowDuplicateDialog(false)
      setDuplicateProduct(null)
      setStockToAdd("")

      // Navigate to products list
      setTimeout(() => {
        router.push("/dashboard/products")
      }, 1000)
    } catch (error: any) {
      console.error("Error updating stock:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle edit product from duplicate dialog
  const handleEditDuplicate = () => {
    setShowDuplicateDialog(false)
    // Store product in session storage and navigate
    sessionStorage.setItem(
      `product_${duplicateProduct.id}`,
      JSON.stringify(duplicateProduct),
    )
    router.push(`/dashboard/add-product?edit=${duplicateProduct.id}`)
  }

  return (
    <div className="px-0 py-4 md:p-8 min-h-screen bg-slate-50/50 font-sans">
      <Button
        variant="ghost"
        className="mb-4 md:mb-6 mt-4 md:mt-0 ml-4 hover:bg-white rounded-xl h-11 px-2 md:px-4"
        onClick={() => router.push("/dashboard/products")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-none md:rounded-2xl shadow-sm border-y md:border border-slate-100 overflow-hidden max-w-4xl mx-auto">
          <div className="px-4 py-6 md:p-8 border-b border-slate-100">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">
              {isEditMode
                ? "Update the product details below"
                : "Fill in the details to add a new product to your inventory"}
            </p>
          </div>
          <div className="px-4 py-6 md:p-6 space-y-4 md:space-y-6">
            {/* Section 1: Basic Details */}
            <FormSection
              title="Basic Details"
              icon={<FileText className="h-4 w-4" />}
              badge="Required"
            >
              <div className="space-y-3 md:space-y-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`h-10 md:h-11 rounded-lg md:rounded-xl ${errors.name ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-slate-700 font-medium"
                  >
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className={`rounded-lg md:rounded-xl text-sm md:text-base ${errors.description ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Section 2: Pricing & Inventory */}
            <FormSection
              title="Pricing & Inventory"
              icon={<DollarSign className="h-4 w-4" />}
              badge="Required"
            >
              <div className="space-y-3 md:space-y-4">
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-slate-700 font-medium"
                    >
                      Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className={`h-10 md:h-11 rounded-lg md:rounded-xl focus:border-slate-400 ${errors.price ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="originalPrice"
                      className="text-slate-700 font-medium"
                    >
                      Original Price (₹)
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00 (optional - for showing discount)"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        handleChange("originalPrice", e.target.value)
                      }
                      className={`h-10 md:h-11 rounded-lg md:rounded-xl focus:border-slate-400 ${errors.originalPrice ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label
                      htmlFor="quantity"
                      className="text-slate-700 font-medium"
                    >
                      Stock Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      className={`h-10 md:h-11 rounded-lg md:rounded-xl focus:border-slate-400 ${errors.quantity ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Stock Status
                    </Label>
                    <div className="flex items-center gap-3 h-10 md:h-11 px-4 rounded-lg md:rounded-xl border border-slate-200 bg-white">
                      <Checkbox
                        id="inStock"
                        checked={formData.inStock}
                        onCheckedChange={(checked) =>
                          handleChange("inStock", checked)
                        }
                      />
                      <Label
                        htmlFor="inStock"
                        className="cursor-pointer text-slate-600 font-normal"
                      >
                        Product is in stock and available
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Section 3: Categorization */}
            <FormSection
              title="Categorization"
              icon={<FolderTree className="h-4 w-4" />}
              badge="Required"
            >
              <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-slate-700 font-medium"
                  >
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger
                      className={`h-10 md:h-11 rounded-lg md:rounded-xl ${errors.category ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label
                    htmlFor="subCategory"
                    className="text-slate-700 font-medium"
                  >
                    Sub Category
                  </Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) =>
                      handleChange("subCategory", value)
                    }
                    disabled={
                      !formData.category || filteredSubCategories.length === 0
                    }
                  >
                    <SelectTrigger className="h-10 md:h-11 rounded-lg md:rounded-xl border-slate-200">
                      <SelectValue
                        placeholder={
                          !formData.category
                            ? "Select category first"
                            : "Select sub category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {filteredSubCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            {/* Section 4: Attributes (Colors & Specifications) */}
            <FormSection
              title="Attributes"
              icon={<Palette className="h-4 w-4" />}
              defaultOpen={false}
            >
              {/* Product Colors - Modern Color Picker */}
              <div className="space-y-4">
                <Label className="text-slate-700 font-medium text-base">
                  Product Colors
                </Label>

                {/* Selected Colors Display */}
                {selectedColors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Selected Colors ({selectedColors.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedColors.map((color) => (
                        <div
                          key={color}
                          className="group relative flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow"
                          style={{ borderColor: color }}
                        >
                          <div
                            className="w-6 h-6 rounded-md border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono text-gray-600">
                            {color}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="ml-1 p-1 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove color"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Palette - Modern Swatches */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">
                      Click to Select Colors
                    </p>
                    {selectedColors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedColors([])}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2.5 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    {colorPalette.map((color) => {
                      const isSelected = selectedColors.includes(color)
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            isSelected ? removeColor(color) : addColor(color)
                          }
                          className={`
                          relative w-10 h-10 rounded-lg cursor-pointer
                          transform transition-all duration-200 ease-out
                          ${
                            isSelected
                              ? "scale-110 ring-3 ring-[#D49217] ring-offset-2 shadow-lg"
                              : "hover:scale-105 hover:shadow-md ring-1 ring-gray-300"
                          }
                        `}
                          style={{ backgroundColor: color }}
                          title={`${color}${isSelected ? " (Selected)" : " - Click to select"}`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 drop-shadow-lg"
                                fill="white"
                                stroke="white"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M5 13l4 4L19 7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    💡 Tip: Click a color to add it, click again to remove it
                  </p>
                </div>

                {/* Custom Color Input - Modern Design */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Custom Color
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          id="custom-color"
                          type="text"
                          placeholder="#FF5733"
                          className="pl-10 font-mono uppercase placeholder:normal-case"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              const input = e.target as HTMLInputElement
                              if (input.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                addColor(input.value.toUpperCase())
                                input.value = ""
                                toast({
                                  title: "Color Added!",
                                  description: `${input.value} has been added to your color selection`,
                                })
                              } else {
                                toast({
                                  title: "Invalid Color",
                                  description:
                                    "Please enter a valid hex color (e.g., #FF5733)",
                                  variant: "destructive",
                                })
                              }
                            }
                          }}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Press Enter to add
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <div className="relative group">
                        <input
                          id="color-picker"
                          type="color"
                          defaultValue="#000000"
                          onBlur={(e) => {
                            // Handle color change on blur as well
                            const val = e.target.value.toUpperCase()
                            // No automatic add anymore to avoid duplicates
                          }}
                          className="w-20 h-11 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-[#D49217] transition-colors shadow-sm"
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-600 group-hover:text-[#D49217] transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                          </svg>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const picker = document.getElementById(
                            "color-picker",
                          ) as HTMLInputElement
                          if (picker) {
                            addColor(picker.value.toUpperCase())
                            toast({
                              title: "Color Added!",
                              description: picker.value.toUpperCase(),
                            })
                          }
                        }}
                        className="mt-1.5 h-7 px-2 text-[10px] font-bold uppercase bg-slate-900 border-0"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications - within Attributes section */}
              <div className="space-y-4 mt-8 pt-6 border-t border-slate-200">
                <Label className="text-slate-700 font-medium text-base">
                  Product Specifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add details like Material, Origin, Craft, Dimensions, etc.
                </p>

                {/* Existing Specs */}
                {specifications.length > 0 && (
                  <div className="grid gap-3 md:grid-cols-2">
                    {specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            {spec.key}
                          </p>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {spec.value}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpec(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Spec */}
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="spec-key" className="text-xs">
                      Label (e.g. Material)
                    </Label>
                    <Input
                      id="spec-key"
                      placeholder="Material"
                      value={newSpec.key}
                      onChange={(e) =>
                        setNewSpec({ ...newSpec, key: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="spec-value" className="text-xs">
                      Value (e.g. Cotton Silk)
                    </Label>
                    <Input
                      id="spec-value"
                      placeholder="Cotton Silk"
                      value={newSpec.value}
                      onChange={(e) =>
                        setNewSpec({ ...newSpec, value: e.target.value })
                      }
                      className="h-10"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSpec()
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addSpec}
                    disabled={!newSpec.key.trim() || !newSpec.value.trim()}
                    className="h-10 bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </FormSection>

            {/* Section 5: Media (Image Upload) */}
            <FormSection
              title="Product Images"
              icon={<Image className="h-4 w-4" />}
              badge="Required"
            >
              <div className="space-y-2">
                <p className="text-sm text-slate-500 mb-4">
                  Upload up to 5 product images. The first image will be the
                  main display image.
                </p>
                {imagePreviews.length === 0 ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? "border-[#D49217] bg-[#D49217]/10 scale-105"
                        : "border-gray-300 hover:border-[#D49217] hover:bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBoxClick}
                  >
                    <Upload
                      className={`mx-auto h-12 w-12 mb-4 ${isDragging ? "text-[#D49217]" : "text-muted-foreground"}`}
                    />
                    <div className="space-y-2">
                      <p className="text-[#D49217] font-medium">
                        {isDragging
                          ? "Drop images here"
                          : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, WEBP (Multiple files supported)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image Previews Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative border rounded-lg overflow-hidden bg-gray-50"
                        >
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full z-10 shadow-md"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="aspect-square bg-white relative">
                            {preview.startsWith("data:") ||
                            preview.startsWith("blob:") ? (
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <OptimizedImage
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-contain p-2"
                                imageType="thumbnail"
                                sizes="120px"
                                placeholder="empty"
                              />
                            )}
                          </div>
                          {/* WebP conversion stats */}
                          {compressionStats[index] && (
                            <div className="mt-1 text-center">
                              <p className="text-xs text-green-600 truncate">
                                WebP: {compressionStats[index]}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add More Button */}
                    {imageFiles.length < 5 && (
                      <div
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-[#D49217] transition-colors"
                        onClick={handleBoxClick}
                      >
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-[#D49217]">
                          Add more images ({imageFiles.length}/5)
                        </p>
                      </div>
                    )}

                    {/* Max images message */}
                    {imageFiles.length >= 5 && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Maximum of 5 images reached
                        </p>
                      </div>
                    )}

                    {/* Compressing Indicator */}
                    {compressing && (
                      <div className="text-center">
                        <Loader2 className="inline mr-2 h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-500">
                          Compressing images...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden file input - always present */}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </FormSection>

            {/* Section 6: Product Variants */}
            <FormSection
              title="Product Variants"
              icon={<Boxes className="h-4 w-4" />}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-100/50 rounded-xl">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">
                      Enable variant options
                    </p>
                    <p className="text-xs text-slate-500">
                      Add size, color, and SKU variants for this product
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="show-variants"
                      className="text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      Enable
                    </Label>
                    <Checkbox
                      id="show-variants"
                      checked={showVariants}
                      onCheckedChange={(checked) => setShowVariants(!!checked)}
                    />
                  </div>
                </div>

                {showVariants && (
                  <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                    {variants.length > 0 && (
                      <div className="space-y-4">
                        {variants.map((variant, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group"
                          >
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity border border-red-200"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Size
                              </Label>
                              <Input
                                placeholder="e.g. XL"
                                value={variant.size}
                                onChange={(e) =>
                                  updateVariant(index, "size", e.target.value)
                                }
                                className="h-10 border-slate-200 focus-visible:ring-slate-900"
                              />
                            </div>
                            <div className="space-y-1.5 flex flex-col">
                              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Color Swatch
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="relative group/color shrink-0">
                                  <input
                                    type="color"
                                    value={
                                      variant.color &&
                                      variant.color.startsWith("#")
                                        ? variant.color
                                        : "#000000"
                                    }
                                    onChange={(e) =>
                                      updateVariant(
                                        index,
                                        "color",
                                        e.target.value.toUpperCase(),
                                      )
                                    }
                                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200"
                                  />
                                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
                                    <Plus className="w-3 h-3 text-white mix-blend-difference" />
                                  </div>
                                </div>
                                <Input
                                  placeholder="Color Name"
                                  value={variant.color}
                                  onChange={(e) =>
                                    updateVariant(
                                      index,
                                      "color",
                                      e.target.value,
                                    )
                                  }
                                  className="h-10 border-slate-200 focus-visible:ring-slate-900 font-mono text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                SKU
                              </Label>
                              <Input
                                placeholder="SKU-123"
                                value={variant.sku}
                                onChange={(e) =>
                                  updateVariant(index, "sku", e.target.value)
                                }
                                className="h-10 border-slate-200 focus-visible:ring-slate-900"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Stock
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={variant.stock_quantity}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "stock_quantity",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="h-10 border-slate-200 focus-visible:ring-slate-900"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Price +/-
                              </Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variant.price_modifier}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "price_modifier",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="h-10 border-slate-200 focus-visible:ring-slate-900"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addVariant}
                      className="w-full border-dashed border-2 border-slate-300 hover:border-slate-900 hover:bg-slate-100 h-12 rounded-xl text-slate-600 transition-all font-medium"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Variant
                    </Button>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
              <Button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white h-11 md:h-12 px-8 rounded-lg md:rounded-xl font-semibold shadow-lg shadow-slate-900/10"
                disabled={loading || compressing}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : compressing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Compressing Images...
                  </>
                ) : isEditMode ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/products")}
                disabled={loading}
                className="h-11 md:h-12 px-8 rounded-lg md:rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Barcode Display Section - Shows after product creation */}
      {generatedBarcode && (
        <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <span className="text-2xl">✓</span> Product Barcode Generated
            </CardTitle>
            <CardDescription>
              Your product has been assigned a unique barcode. You can print
              this for inventory management.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-6 rounded-lg border-2 border-green-300 shadow-md">
              <Barcode value={generatedBarcode} />
            </div>
            <p className="text-sm text-gray-600">
              Barcode:{" "}
              <span className="font-mono font-bold text-green-700">
                {generatedBarcode}
              </span>
            </p>
            <Button
              variant="outline"
              onClick={() => {
                // Create a temporary canvas to download the barcode
                const svg = document.querySelector("svg")
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg)
                  const canvas = document.createElement("canvas")
                  const ctx = canvas.getContext("2d")
                  const img = document.createElement("img")
                  img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    ctx?.drawImage(img, 0, 0)
                    const pngFile = canvas.toDataURL("image/png")
                    const downloadLink = document.createElement("a")
                    downloadLink.download = `barcode-${generatedBarcode}.png`
                    downloadLink.href = pngFile
                    downloadLink.click()
                  }
                  img.src = "data:image/svg+xml;base64," + btoa(svgData)
                }
              }}
            >
              Download Barcode
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Product Dialog */}
      <AlertDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Product Already Exists
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {duplicateType === "name" &&
                "A product with this name already exists."}
              {duplicateType === "barcode" &&
                "A product with this barcode already exists."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {duplicateProduct && (
            <div className="space-y-4 py-4">
              {/* Existing Product Details */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Existing Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{duplicateProduct.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Barcode:</span>
                      <p className="font-mono font-medium">
                        {duplicateProduct.barcode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Current Stock:
                      </span>
                      <p className="font-bold text-lg text-[#D49217]">
                        {duplicateProduct.stock_quantity ||
                          duplicateProduct.quantity ||
                          0}{" "}
                        units
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span>
                      <p className="font-medium">
                        ₹{duplicateProduct.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">
                      Description:
                    </span>
                    <p className="text-sm line-clamp-2">
                      {duplicateProduct.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Update Form */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label htmlFor="stock-add" className="text-base font-semibold">
                  Quick Stock Update
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add more stock to this existing product instead of creating a
                  duplicate.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="stock-add"
                      type="number"
                      min="1"
                      placeholder="Quantity to add"
                      value={stockToAdd}
                      onChange={(e) => setStockToAdd(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="flex items-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm text-muted-foreground">
                      New Stock:
                    </span>
                    <span className="ml-2 font-bold text-green-700 text-lg">
                      {(duplicateProduct.stock_quantity ||
                        duplicateProduct.quantity ||
                        0) + (parseInt(stockToAdd) || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDuplicateDialog(false)
                setDuplicateProduct(null)
                setStockToAdd("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleEditDuplicate}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Edit Product
            </Button>
            <AlertDialogAction
              onClick={handleStockUpdate}
              disabled={!stockToAdd || parseInt(stockToAdd) <= 0 || loading}
              className="bg-[#D49217] hover:bg-[#B87D15]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Update Stock (+{stockToAdd || 0})</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AddProduct
