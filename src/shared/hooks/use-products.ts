/**
 * React Query hooks for products
 * Replaces direct Wix Data API calls with TanStack Query
 */

import { useQuery } from "@tanstack/react-query"
import { productsService } from "@/services/products"

import { ProductFilters } from "@/services/products"

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsService.getPaginated(filters || {}),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache cleanup time (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent unnecessary refetches on window focus
    refetchOnMount: false, // Prevent refetch on component mount if data is fresh
    refetchOnReconnect: true, // Only refetch on network reconnect
  })
}

export function useAllProducts() {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: () => productsService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes - all products cache longer
    gcTime: 15 * 60 * 1000, // 15 minutes cache cleanup
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsService.getFeatured(),
    staleTime: 15 * 60 * 1000, // 15 minutes - featured products change rarely
    gcTime: 20 * 60 * 1000, // 20 minutes cache cleanup
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - individual product cache
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  })
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["products", "slug", slug],
    queryFn: () => productsService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes - product by slug cache
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  })
}
