import { lazy, type ComponentType } from "react"

// Type for lazy-loaded component
type LazyComponentType<T> = ComponentType<T>

// Lazy load heavy components - only loaded when needed
// Use dynamic imports with proper typing

// Charts - heavy library, only load when viewing analytics
export const LazyRecharts: LazyComponentType<Record<string, unknown>> = lazy(
  () =>
    import("recharts").then((module) => ({
      default: module as unknown as ComponentType<Record<string, unknown>>,
    })),
)

// Dialog components - load on demand
export const LazyDialog = lazy(() =>
  import("@radix-ui/react-dialog").then((module) => ({
    default: module.Root,
  })),
)

// Checkout flow - only when user initiates checkout
export const LazyCheckout = lazy(() =>
  import("@/features/checkout/CheckoutPage").then((mod) => ({
    default: mod.default,
  })),
)
