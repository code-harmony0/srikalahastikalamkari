/**
 * Lazy loading utilities for performance optimization
 * Heavy components are loaded only when needed
 */

import { lazy, Suspense } from "react"
import type { ReactNode, ComponentType } from "react"

// Loading fallback component
export function LoadingFallback(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C19A5B]" />
    </div>
  )
}

// Lazy load wrapper with suspense - simplified typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<T extends ComponentType<any>>(
  Component: T,
  fallback: ReactNode = <LoadingFallback />,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ComponentType<any> {
  const LazyComp = lazy(() => Promise.resolve({ default: Component }))

  // Return wrapper component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WrappedComponent = (props: any): JSX.Element => {
    return (
      <Suspense fallback={fallback}>
        <LazyComp {...props} />
      </Suspense>
    )
  }

  return WrappedComponent
}

// Preload function for critical components
export function preloadComponent(importFn: () => Promise<unknown>): void {
  if (typeof window !== "undefined") {
    // Start loading the component in background
    void importFn()
  }
}
