/**
 * React Query hooks for products
 * Replaces direct Wix Data API calls with TanStack Query
 */

import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/backend/products";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => productsService.getAll(),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsService.getFeatured(),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: !!slug,
  });
}
