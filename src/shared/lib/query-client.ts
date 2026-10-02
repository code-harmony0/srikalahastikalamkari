/**
 * React Query configuration for optimal dashboard data caching
 * Implements stale-while-revalidate pattern for fast UX
 */

import { QueryClient } from '@tanstack/react-query'

// Dashboard-specific query client with aggressive caching
export const dashboardQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache for 30 minutes even if inactive
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Refetch on window focus (user returns to tab)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
})

// Query keys for dashboard data - enables precise cache invalidation
export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: () => [...dashboardKeys.all, 'kpis'] as const,
  activity: (days: number) => [...dashboardKeys.all, 'activity', days] as const,
  categories: () => [...dashboardKeys.all, 'categories'] as const,
  products: () => [...dashboardKeys.all, 'products'] as const,
  orders: () => [...dashboardKeys.all, 'orders'] as const,
  sparklines: () => [...dashboardKeys.all, 'sparklines'] as const,
}

// Prefetch strategy for dashboard
