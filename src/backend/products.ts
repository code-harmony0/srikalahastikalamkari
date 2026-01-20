import { supabase } from "@/backend/supabase/client"
import type { Product } from "@/shared/types";

const sanitizePayload = (payload: Partial<Product>) => {
  const p: any = { ...payload }
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k])

  if (p.price !== undefined) p.price = p.price === "" ? null : Number(p.price)
  if (p.originalPrice !== undefined)
    p.originalPrice = p.originalPrice === "" ? null : Number(p.originalPrice)

  const toNullableInt = (v: any) => {
    if (v === undefined || v === null || v === "") return null
    if (typeof v === "boolean") return null
    if (typeof v === "string") {
      const trimmed = v.trim()
      if (trimmed === "true" || trimmed === "false") return null
      const n = Number(trimmed)
      return Number.isNaN(n) ? null : n
    }
    if (typeof v === "number") return Number.isFinite(v) ? v : null
    return null
  }

  if (p.category !== undefined) p.category = toNullableInt(p.category)
  if (p.subCategory !== undefined) p.subCategory = toNullableInt(p.subCategory)

  if (p.colors !== undefined) {
    if (typeof p.colors === "string") {
      p.colors = p.colors
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
    } else if (!Array.isArray(p.colors)) {
      p.colors = [String(p.colors)]
    }
  }

  if (p.inStock !== undefined) p.inStock = Boolean(p.inStock)

  if (p.id !== undefined) delete p.id

  const keyMap: Record<string, string> = {
    originalPrice: "original_price",
    inStock: "in_stock",
    isVisible: "is_visible",
    subCategory: "sub_category_id",
    category: "category_id",
    quantity: "stock_quantity",
    images: "images",
  }

  if (p.specifications !== undefined && typeof p.specifications === 'string') {
    try {
      p.specifications = JSON.parse(p.specifications)
    } catch (e) {
      console.error("Error parsing specifications JSON:", e)
      p.specifications = {}
    }
  }

  const mapped: any = {}
  Object.keys(p).forEach((k) => {
    const mappedKey = keyMap[k] ?? k
    if (mappedKey.endsWith("_id") && k !== 'product_id') { // Don't coerce product_id if it's already a UUID
      const val = p[k]
      if (val === null || val === undefined) {
        mapped[mappedKey] = null
      } else if (typeof val === "number") {
        mapped[mappedKey] = Number.isFinite(val) ? val : null
      } else if (typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
        // It's a UUID, pass it as is
        mapped[mappedKey] = val
      } else {
        const coerced = Number(val)
        mapped[mappedKey] = Number.isNaN(coerced) ? null : coerced
      }
    } else {
      mapped[mappedKey] = p[k]
    }
  })

  return mapped as Partial<Product>
}

const findInvalidIdField = (obj: Record<string, any>) => {
  for (const key of Object.keys(obj)) {
    if (key.endsWith("_id")) {
      const v = obj[key]
      if (v !== null && typeof v !== "number") {
        return { field: key, value: v }
      }
    }
  }
  return null
}

export const getProducts = async (): Promise<{
  data: Product[] | null
  error: any
}> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .order('created_at', { ascending: false })

    if (error) {
      // If product_variants join fails (PGRST204 or missing relationship/table)
      // code 42P01 is table does not exist
      if (error.code === '42P01' || error.message?.includes('product_variants')) {
        console.warn("Variants table not found, falling back to products only join");
        const { data: productsOnly, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order('created_at', { ascending: false });
        return { data: (productsOnly as Product[]) ?? null, error: productsError };
      }
      return { data: null, error }
    }

    // Map product_variants to variants
    const mapped = data?.map(p => ({
      ...p,
      variants: (p as any).product_variants
    }))
    return { data: (mapped as Product[]) ?? null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const getProductById = async (
  id: string
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      if (error.code === '42P01' || error.message?.includes('product_variants')) {
        console.warn("Variants table not found, falling back to product only join");
        const { data: productOnly, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        return { data: (productOnly as Product) ?? null, error: productError };
      }
      return { data: null, error };
    }

    if (!data) {
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      }
    }

    if (data) {
      data.variants = (data as any).product_variants
    }
    return { data: (data as Product) ?? null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const createProduct = async (
  payload: Partial<Product>
): Promise<{ data: Product | null; error: any }> => {
  const sanitized = sanitizePayload(payload)
  const invalid = findInvalidIdField(sanitized as Record<string, any>)
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(
      invalid.value
    )}`
    return {
      data: null,
      error: {
        message,
        details: null,
        hint: "Ensure *_id fields are numeric or null",
        code: "VALIDATION",
        status: 400,
      },
    }
  }
  const attemptInsert = async (obj: any) =>
    await supabase.from("products").insert([obj]).select().single()

  const { variants, ...productPayload } = sanitized as any
  const { data: product, error, status } = await attemptInsert(productPayload)
  if (error) {
    // Handle missing columns fallback logic
    // ... (omitting existing fallback logic for brevity in this tool call, will keep it in actual file)
  }

  if (!error && product && variants && Array.isArray(variants)) {
    const variantsWithId = variants.map(v => ({
      ...v,
      product_id: product.id
    }))
    const { error: variantError } = await supabase.from("product_variants").insert(variantsWithId)
    if (variantError) console.error("Error inserting variants:", variantError)
  }

  if (!error) return { data: (product as Product) ?? null, error: null }

  const missingMatch =
    typeof error?.message === "string" &&
    error.message.match(/Could not find the '(.+?)' column/)
  if (missingMatch) {
    const missingCol = missingMatch[1]
    const fallbacks: Array<{ desc: string; mapper: (src: any) => any }> = []

    if ((sanitized as any).category !== undefined) {
      fallbacks.push({
        desc: "map category -> category_id",
        mapper: (src) => {
          const copy = { ...src }
          const val = copy.category
          delete copy.category
          const coerced = Number(val)
          copy["category_id"] = Number.isNaN(coerced) ? null : coerced
          return copy
        },
      })

      fallbacks.push({
        desc: "map category -> category_name",
        mapper: (src) => {
          const copy = { ...src }
          copy["category_name"] = copy.category
          delete copy.category
          return copy
        },
      })
    }

    fallbacks.push({
      desc: `remove ${missingCol}`,
      mapper: (src) => {
        const copy = { ...src }
        if (copy[missingCol] !== undefined) delete copy[missingCol]
        return copy
      },
    })

    for (const fb of fallbacks) {
      try {
        const attemptPayload = fb.mapper(sanitized)
        const r = await attemptInsert(attemptPayload)
        if (!r.error) {
          return { data: (r.data as Product) ?? null, error: null }
        }
      } catch (err) {
      }
    }
  }

  return {
    data: null,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
    },
  }
}

export const updateProduct = async (
  id: string,
  payload: Partial<Product>
): Promise<{ data: Product | null; error: any }> => {
  const sanitized = sanitizePayload(payload)
  const invalid = findInvalidIdField(sanitized as Record<string, any>)
  if (invalid) {
    const message = `Invalid id for column ${invalid.field}: ${JSON.stringify(
      invalid.value
    )}`
    return {
      data: null,
      error: {
        message,
        details: null,
        hint: "Ensure *_id fields are numeric or null",
        code: "VALIDATION",
        status: 400,
      },
    }
  }
  const attemptUpdate = async (obj: any) =>
    await supabase
      .from("products")
      .update(obj)
      .eq("id", id)
      .select()
      .maybeSingle()

  const { variants, ...productPayload } = sanitized as any
  const { data: product, error, status } = await attemptUpdate(productPayload)
  
  if (!error && product && variants && Array.isArray(variants)) {
    // Basic sync: delete old and insert new (could be improved to upsert)
    // For now, let's do a more robust approach if IDs exist
    const { data: existingVariants } = await supabase.from("product_variants").select("id").eq("product_id", id)
    const existingIds = existingVariants?.map(v => v.id) || []
    
    const toUpdate = variants.filter(v => v.id && existingIds.includes(v.id))
    const toInsert = variants.filter(v => !v.id).map(v => ({ ...v, product_id: id }))
    const providedIds = variants.filter(v => v.id).map(v => v.id)
    const toDelete = existingIds.filter(id => !providedIds.includes(id))

    if (toDelete.length > 0) {
      await supabase.from("product_variants").delete().in("id", toDelete)
    }
    if (toUpdate.length > 0) {
      for (const v of toUpdate) {
        await supabase.from("product_variants").update(v).eq("id", v.id)
      }
    }
    if (toInsert.length > 0) {
      await supabase.from("product_variants").insert(toInsert)
    }
  }

  if (!error) {
    if (!product)
      return {
        data: null,
        error: { message: "Product not found", code: "NOT_FOUND", status: 404 },
      }
    return { data: (product as Product) ?? null, error: null }
  }

  const missingMatch =
    typeof error?.message === "string" &&
    error.message.match(/Could not find the '(.+?)' column/)
  if (missingMatch) {
    const missingCol = missingMatch[1]
    const fallbacks: Array<{ desc: string; mapper: (src: any) => any }> = []

    if ((sanitized as any).category !== undefined) {
      fallbacks.push({
        desc: "map category -> category_id",
        mapper: (src) => {
          const copy = { ...src }
          const val = copy.category
          delete copy.category
          const coerced = Number(val)
          copy["category_id"] = Number.isNaN(coerced) ? null : coerced
          return copy
        },
      })

      fallbacks.push({
        desc: "map category -> category_name",
        mapper: (src) => {
          const copy = { ...src }
          copy["category_name"] = copy.category
          delete copy.category
          return copy
        },
      })
    }

    fallbacks.push({
      desc: `remove ${missingCol}`,
      mapper: (src) => {
        const copy = { ...src }
        if (copy[missingCol] !== undefined) delete copy[missingCol]
        return copy
      },
    })

    for (const fb of fallbacks) {
      try {
        const attemptPayload = fb.mapper(sanitized)
        const r = await attemptUpdate(attemptPayload)
        if (!r.error) {
          return { data: (r.data as Product) ?? null, error: null }
        }
      } catch (err) {
      }
    }
  }

  return {
    data: null,
    error: {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      status,
    },
  }
}

export const deleteProduct = async (
  id: string
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase.from("products").delete().eq("id", id)
  return { data, error }
}

export const uploadImage = async (
  file: File
): Promise<{ url: string | null; error: any }> => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()
      .toString(36)
      .substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from("products").getPublicUrl(filePath)
    return { url: data.publicUrl, error: null }
  } catch (error: any) {
    return { url: null, error }
  }
}

export const findProductByName = async (
  name: string,
  excludeId?: number | string
): Promise<{ data: Product | null; error: any }> => {
  try {
    const trimmedName = name.trim().toLowerCase()
    let query = supabase.from("products").select("*").ilike("name", trimmedName)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data: (data as Product) ?? null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const findProductByBarcode = async (
  barcode: string,
  excludeId?: number | string
): Promise<{ data: Product | null; error: any }> => {
  try {
    if (!barcode || barcode.trim() === "") {
      return { data: null, error: null }
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode.trim())

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data: (data as Product) ?? null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const checkDuplicateProduct = async (
  name: string,
  barcode?: string,
  excludeId?: number | string
): Promise<{
  data: Product | null
  error: any
  duplicateType?: "name" | "barcode"
}> => {
  try {
    const nameCheck = await findProductByName(name, excludeId)
    if (nameCheck.error) {
      return { data: null, error: nameCheck.error }
    }
    if (nameCheck.data) {
      return { data: nameCheck.data, error: null, duplicateType: "name" }
    }

    if (barcode && barcode.trim() !== "") {
      const barcodeCheck = await findProductByBarcode(barcode, excludeId)
      if (barcodeCheck.error) {
        return { data: null, error: barcodeCheck.error }
      }
      if (barcodeCheck.data) {
        return {
          data: barcodeCheck.data,
          error: null,
          duplicateType: "barcode",
        }
      }
    }

    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateProductStock = async (
  productId: number | string,
  additionalQuantity: number
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data: product, error: fetchError } = await getProductById(
      productId.toString()
    )

    if (fetchError || !product) {
      return {
        data: null,
        error: fetchError || { message: "Product not found" },
      }
    }

    const currentStock = (product as any).quantity || 0
    const newStock = currentStock + additionalQuantity

    if (newStock < 0) {
      return {
        data: null,
        error: { message: "Stock cannot be negative", code: "INVALID_STOCK" },
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data: (data as Product) ?? null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Service for storefront - legacy support
export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data } = await getProducts()
    return (data || []) as Product[]
  },
  async getFeatured(): Promise<Product[]> {
    const { data } = await getProducts()
    return ((data || []) as Product[]).filter((p: any) => p.isFeatured)
  },
  async getById(id: string): Promise<Product | null> {
    const { data } = await getProductById(id)
    return data
  },
  async getBySlug(slug: string): Promise<Product | null> {
    return null
  },
  async search(query: string): Promise<Product[]> {
    const { data } = await getProducts()
    if (!data) return []
    const lowerQuery = query.toLowerCase()
    return (data as Product[]).filter(
      (p: any) =>
        p.name?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
    )
  },
}
