/**
 * Core TypeScript types for Next.js migration
 * Migrated from Wix entities - zero Wix dependencies
 */

export interface Product {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  sku?: string;
  stockQuantity?: number;
  title?: string;
  description?: string;
  price?: number;
  discountedPrice?: number;
  onSale?: boolean;
  mainImage?: string;
  availableSizes?: string;
  isFeatured?: boolean;
  slug?: string; // For URL routing
}

export interface ProductCategory {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  name?: string;
  description?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ProductVariant {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  productId?: string;
  variantName?: string;
  color?: string;
  pattern?: string;
  variantImage?: string;
  priceModifier?: number;
  sku?: string;
}

export interface ProductReview {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  productName?: string;
  customerName?: string;
  rating?: number;
  reviewText?: string;
  reviewDate?: Date | string;
  isVerifiedPurchase?: boolean;
}

export interface Promotion {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  title?: string;
  description?: string;
  bannerImage?: string;
  callToActionUrl?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
}

export interface Order {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  customerName?: string;
  customerEmail?: string;
  orderedItemsSummary?: string;
  totalAmount?: number;
  orderStatus?: string;
  shippingAddress?: string;
  orderDate?: Date | string;
}

export interface WishlistItem {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  customerId?: string;
  productId?: string;
  dateAdded?: Date | string;
  quantity?: number;
  customerNote?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}
