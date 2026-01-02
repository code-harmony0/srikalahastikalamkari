/**
 * Products Service - Mock implementation replacing Wix Data API
 * Future: Replace with real backend (Supabase, REST API, etc.)
 */

import { Product } from "@/shared/types";

// Mock product data
const mockProducts: Product[] = [
  {
    _id: "1",
    sku: "KK-001",
    title: "Traditional Kalamkari Saree",
    description: "Handcrafted traditional Kalamkari saree with intricate patterns",
    price: 12999,
    mainImage: "/images/products/product-placeholder.png",
    stockQuantity: 10,
    availableSizes: "Free Size",
    isFeatured: true,
    slug: "traditional-kalamkari-saree",
    _createdDate: new Date("2025-01-01T00:00:00.000Z"),
    _updatedDate: new Date("2025-01-01T00:00:00.000Z"),
  },
  {
    _id: "2",
    sku: "KK-002",
    title: "Kalamkari Cotton Dress Material",
    description: "Premium cotton dress material with hand-painted Kalamkari designs",
    price: 8999,
    discountedPrice: 6999,
    onSale: true,
    mainImage: "/images/products/product-placeholder.png",
    stockQuantity: 15,
    availableSizes: "3 meters",
    isFeatured: true,
    slug: "kalamkari-cotton-dress-material",
    _createdDate: new Date("2025-01-01T00:00:00.000Z"),
    _updatedDate: new Date("2025-01-01T00:00:00.000Z"),
  },
  // Add more mock products as needed
];

export const productsService = {
  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockProducts;
  },

  /**
   * Get featured products
   */
  async getFeatured(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockProducts.filter(p => p.isFeatured);
  },

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockProducts.find(p => p._id === id) || null;
  },

  /**
   * Get product by slug (for URL routing)
   */
  async getBySlug(slug: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockProducts.find(p => p.slug === slug) || null;
  },

  /**
   * Search products
   */
  async search(query: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(p =>
      p.title?.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );
  },
};
