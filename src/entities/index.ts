/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

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
 * Collection ID: products
 * Interface for Products
 */
export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
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
