/**
 * Core TypeScript types for Next.js migration
 * Migrated from Wix entities - zero Wix dependencies
 */

// Re-export from supabase types
export type { Category, SubCategory } from "./supabase"

export interface ProductImageTiers {
  thumb: string // Cloudflare thumb variant - grids, lists, cart/orders
  medium: string // Cloudflare medium variant - product detail/default previews
  full: string // Cloudflare full variant - explicit zoom/modal only
}

export interface Product {
  id: string
  created_at?: string
  updated_at?: string
  sku?: string
  stock_quantity?: number
  quantity?: number // fallback/compatibility
  name: string
  title?: string // compatibility
  description: string | null
  price: number
  original_price: number | null
  originalPrice?: number // compatibility
  onSale?: boolean
  image?: string
  mainImage?: string // compatibility
  images?: string[] | ProductImageTiers[] // Support both old and new format
  imageTiers?: ProductImageTiers // New structured image format
  availableSizes?: string // legacy
  colors?: string[]
  is_featured?: boolean
  isFeatured?: boolean // compatibility
  is_visible?: boolean
  isVisible?: boolean // compatibility
  is_custom_design?: boolean
  isCustomDesign?: boolean // compatibility
  in_stock?: boolean
  slug?: string
  category_id?: string
  sub_category_id?: string | null
  categoryName?: string
  subCategoryName?: string
  specifications?: Record<string, string>
  material?: string
  barcode?: string
  variants?: ProductVariant[]
  selectedVariant?: ProductVariant
}

export interface ProductVariant {
  id: string
  product_id?: string
  name?: string
  size?: string
  color?: string
  sku?: string
  price_modifier?: number
  stock_quantity?: number
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface ProductReview {
  id: string
  _createdDate?: Date
  _updatedDate?: Date
  productName?: string
  customerName?: string
  rating?: number
  reviewText?: string
  reviewDate?: Date | string
  isVerifiedPurchase?: boolean
}

export interface Promotion {
  id: string
  _createdDate?: Date
  _updatedDate?: Date
  title?: string
  description?: string
  bannerImage?: string
  callToActionUrl?: string
  startDate?: Date | string
  endDate?: Date | string
  isActive?: boolean
}

export interface Order {
  id: string
  _createdDate?: Date
  _updatedDate?: Date
  customerName?: string
  customerEmail?: string
  orderedItemsSummary?: string
  totalAmount?: number
  orderStatus?: string
  shippingAddress?: string
  orderDate?: Date | string
}

export interface WishlistItem {
  _id: string
  _createdDate?: Date
  _updatedDate?: Date
  customerId?: string
  productId?: string
  dateAdded?: Date | string
  quantity?: number
  customerNote?: string
}

export interface CartItem {
  productId: string
  quantity: number
  variant?: string
  maxStock?: number
  selectedColor?: string
}

export interface User {
  id: string
  email?: string
  name?: string
  avatar?: string
}
