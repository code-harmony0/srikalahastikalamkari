/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: orders
 * Interface for Orders
 */
export interface Orders {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType text */
  customerEmail?: string;
  /** @wixFieldType text */
  orderedItemsSummary?: string;
  /** @wixFieldType number */
  totalAmount?: number;
  /** @wixFieldType text */
  orderStatus?: string;
  /** @wixFieldType text */
  shippingAddress?: string;
  /** @wixFieldType datetime */
  orderDate?: Date | string;
}


/**
 * Collection ID: productcategories
 * Interface for ProductCategories
 */
export interface ProductCategories {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  name?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType image */
  image?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
  /** @wixFieldType number */
  displayOrder?: number;
}


/**
 * Collection ID: productreviews
 * Interface for ProductReviews
 */
export interface ProductReviews {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  productName?: string;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType number */
  rating?: number;
  /** @wixFieldType text */
  reviewText?: string;
  /** @wixFieldType datetime */
  reviewDate?: Date | string;
  /** @wixFieldType boolean */
  isVerifiedPurchase?: boolean;
}


/**
 * Collection ID: products
 * Interface for Products
 */
export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  sku?: string;
  /** @wixFieldType number */
  stockQuantity?: number;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType number */
  price?: number;
  /** @wixFieldType image */
  mainImage?: string;
  /** @wixFieldType text */
  availableSizes?: string;
  /** @wixFieldType boolean */
  isFeatured?: boolean;
}


/**
 * Collection ID: productvariants
 * Interface for ProductVariants
 */
export interface ProductVariants {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  productId?: string;
  /** @wixFieldType text */
  variantName?: string;
  /** @wixFieldType text */
  color?: string;
  /** @wixFieldType text */
  pattern?: string;
  /** @wixFieldType image */
  variantImage?: string;
  /** @wixFieldType number */
  priceModifier?: number;
  /** @wixFieldType text */
  sku?: string;
}


/**
 * Collection ID: promotions
 * Interface for Promotions
 */
export interface Promotions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType image */
  bannerImage?: string;
  /** @wixFieldType url */
  callToActionUrl?: string;
  /** @wixFieldType date */
  startDate?: Date | string;
  /** @wixFieldType date */
  endDate?: Date | string;
  /** @wixFieldType boolean */
  isActive?: boolean;
}


/**
 * Collection ID: wishlistitem
 * Interface for WishlistItem
 */
export interface WishlistItem {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  customerId?: string;
  /** @wixFieldType text */
  productId?: string;
  /** @wixFieldType datetime */
  dateAdded?: Date | string;
  /** @wixFieldType number */
  quantity?: number;
  /** @wixFieldType text */
  customerNote?: string;
}
