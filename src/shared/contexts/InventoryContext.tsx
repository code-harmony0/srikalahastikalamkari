"use client"

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react"
import type { Category, SubCategory, Product } from "@/shared/types"
import {
  getCategories,
  getSubCategories,
} from "@/backend/categories"
import {
  getProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from "@/backend/products"

// Updated Context Type
interface InventoryContextType {
  categories: Category[]
  products: Product[] // Added flat products list
  loading: boolean
  error: string | null
  // Operations
  fetchData: () => Promise<void>
  updateProduct: (
    productId: string,
    updatedProduct: Partial<Product>
  ) => Promise<void>
  deleteProduct: (productId: string) => Promise<void>
  addProduct: (product: any) => Promise<void>
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
)

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data from server
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [catsResult, subCatsResult, prodsResult] = await Promise.all([
        getCategories(),
        getSubCategories(),
        getProducts(),
      ])

      console.log("📦 Inventory Data Fetched:", {
        categories: catsResult.data?.length,
        subCategories: subCatsResult.data?.length,
        products: prodsResult.data?.length,
      })

      // Handle errors gracefully - tables may not exist yet or have RLS restrictions
      if (catsResult.error) {
        console.warn("⚠️ Categories fetch error:", catsResult.error.message)
        // Only throw if it's a critical error (not missing table or auth)
        if (
          !catsResult.error.message.includes("Could not find the table") &&
          !catsResult.error.message.includes("JWT") &&
          catsResult.error.code !== "PGRST301" // Missing table
        ) {
          setError(`Categories: ${catsResult.error.message}`)
        }
      }

      if (subCatsResult.error) {
        console.warn("⚠️ SubCategories fetch error:", subCatsResult.error.message)
        // Only throw if it's a critical error (not missing table or auth)
        if (
          !subCatsResult.error.message.includes("Could not find the table") &&
          !subCatsResult.error.message.includes("JWT") &&
          subCatsResult.error.code !== "PGRST301" // Missing table
        ) {
          setError(`SubCategories: ${subCatsResult.error.message}`)
        }
      }

      if (prodsResult.error) {
        console.warn("⚠️ Products fetch error:", prodsResult.error.message)
        // Only throw for products if it's a critical error
        if (
          !prodsResult.error.message.includes("Could not find the table") &&
          !prodsResult.error.message.includes("JWT")
        ) {
          throw new Error(prodsResult.error.message)
        }
      }

      const rawCats = catsResult.data || []
      const rawSubCats = subCatsResult.data || []
      const rawProds = (prodsResult.data || []) as any[]

      const categoryMap = new Map(
        rawCats.map((cat: any) => [String(cat.id), cat.name])
      )

      // Transform products to match Product interface
      const transformedProds: Product[] = rawProds.map((p: any) => ({
        id: String(p.id),
        name: p.name || "",
        price: typeof p.price === "string" ? parseFloat(p.price) : p.price || 0,
        originalPrice: p.original_price
          ? typeof p.original_price === "string"
            ? parseFloat(p.original_price)
            : p.original_price
          : undefined,
        image: p.image || "",
        category: p.category_id ? String(p.category_id) : undefined,
        categoryName: p.category_id
          ? categoryMap.get(String(p.category_id))
          : undefined,
        subCategory: p.sub_category_id ? String(p.sub_category_id) : undefined,
        description: p.description || "",
        colors: Array.isArray(p.colors)
          ? p.colors
          : typeof p.colors === "string"
          ? p.colors.startsWith("[")
            ? JSON.parse(p.colors)
            : [p.colors]
          : [],
        sizes: Array.isArray(p.sizes)
          ? p.sizes
          : typeof p.sizes === "string"
          ? p.sizes.startsWith("[")
            ? JSON.parse(p.sizes)
            : [p.sizes]
          : [],
        material: p.material || undefined,
        stock: typeof p.stock === "string" ? parseInt(p.stock) : p.stock || 0,
        images: Array.isArray(p.images)
          ? p.images
          : typeof p.images === "string"
          ? p.images.startsWith("[")
            ? JSON.parse(p.images)
            : [p.images]
          : p.image
          ? [p.image]
          : [],
        badge: p.badge || undefined,
        isFeatured: Boolean(p.is_featured),
        isNew: Boolean(p.is_new),
        discount:
          typeof p.discount === "string" ? parseFloat(p.discount) : p.discount,
      }))

      // Build category hierarchy with subcategories
      const structuredCategories: Category[] = rawCats.map((cat: any) => ({
        id: String(cat.id),
        name: cat.name,
        description: cat.description || undefined,
        subCategories: rawSubCats
          .filter((sub: any) => sub.category_id === cat.id)
          .map((sub: any) => ({
            id: String(sub.id),
            name: sub.name || sub.subCatName,
            description: sub.description || undefined,
            products: transformedProds.filter(
              (prod) => prod.subCategory === String(sub.id)
            ),
            image_url: sub.image_url || undefined,
          })),
      }))

      setCategories(structuredCategories)
      setProducts(transformedProds)
      console.log("✅ Inventory Context Updated")
    } catch (err: any) {
      console.error("Error fetching inventory:", err)
      setError(err.message || "Failed to fetch inventory")
    } finally {
      setLoading(false)
    }
  }

  // Update product in state and backend
  const updateProduct = async (
    productId: string,
    updatedProduct: Partial<Product>
  ) => {
    try {
      await apiUpdateProduct(productId, updatedProduct as any)
      await fetchData()
    } catch (err: any) {
      console.error("Error updating product:", err)
      setError(err.message)
    }
  }

  // Delete product from state and backend
  const deleteProduct = async (productId: string) => {
    try {
      await apiDeleteProduct(productId)
      await fetchData()
    } catch (err: any) {
      console.error("Error deleting product:", err)
      setError(err.message)
    }
  }

  // Add new product
  const addProduct = async (product: any) => {
    try {
      await apiCreateProduct(product)
      await fetchData()
    } catch (err: any) {
      console.error("Error adding product:", err)
      setError(err.message)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <InventoryContext.Provider
      value={{
        categories,
        products,
        loading,
        error,
        fetchData,
        updateProduct,
        deleteProduct,
        addProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

export const useInventory = () => {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
