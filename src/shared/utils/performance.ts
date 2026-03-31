/**
 * Performance monitoring utility for tracking site metrics
 */

export interface PerformanceMetrics {
  ttfb: number
  fcp: number
  lcp: number
  fid: number
  cls: number
  tti: number
  pageLoadTime: number
  domContentLoaded: number
  firstPaint: number
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window === "undefined") return

  window.addEventListener("load", () => {
    setTimeout(() => {
      measurePerformance()
    }, 0)
  })
}

function measurePerformance(): void {
  // Navigation Timing API
  const navigationEntries = performance.getEntriesByType("navigation")
  if (navigationEntries.length > 0) {
    const navigation = navigationEntries[0] as PerformanceNavigationTiming

    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.startTime,
      domProcessing:
        navigation.domComplete -
          (navigation as unknown as { domInteractive: number })
            .domInteractive || 0,
      pageLoad: navigation.loadEventEnd - navigation.startTime,
    }

    console.log("📊 Performance Metrics:", metrics)

    if (metrics.pageLoad > 3000) {
      console.warn("⚠️ Slow page load detected:", metrics.pageLoad + "ms")
    }
  }

  // Paint Timing API
  const paintEntries = performance.getEntriesByType("paint")
  paintEntries.forEach((entry) => {
    console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`)
  })

  // Largest Contentful Paint
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log("🖼️ LCP:", lastEntry.startTime.toFixed(2) + "ms")
    }).observe({ entryTypes: ["largest-contentful-paint"] })
  } catch {
    // Browser doesn't support LCP
  }

  // First Input Delay
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processingStart = (entry as any).processingStart
        if (processingStart) {
          const fid = processingStart - entry.startTime
          console.log("👆 FID:", fid.toFixed(2) + "ms")
        }
      }
    }).observe({ entryTypes: ["first-input"] })
  } catch {
    // Browser doesn't support FID
  }

  // Cumulative Layout Shift
  try {
    new PerformanceObserver((list) => {
      let cls = 0
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hadRecentInput = (entry as any).hadRecentInput
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (entry as any).value
        if (!hadRecentInput) {
          cls += value
        }
      }
      console.log("📐 CLS:", cls.toFixed(4))
    }).observe({ entryTypes: ["layout-shift"] })
  } catch {
    // Browser doesn't support CLS
  }
}

export function measureRenderTime(componentName: string): () => number {
  const start = performance.now()

  return () => {
    const end = performance.now()
    const duration = end - start
    console.log(`⏱️ ${componentName} render: ${duration.toFixed(2)}ms`)
    return duration
  }
}

export function preloadCriticalResources(): void {
  if (typeof window === "undefined") return

  const criticalResources = [
    { rel: "preload", href: "/images/hero-saree.webp", as: "image" as const },
    { rel: "preconnect", href: process.env.NEXT_PUBLIC_SUPABASE_URL || "" },
    { rel: "dns-prefetch", href: "https://checkout.razorpay.com" },
  ]

  criticalResources.forEach((resource) => {
    const link = document.createElement("link")
    link.rel = resource.rel
    link.href = resource.href
    if (resource.as) link.as = resource.as
    document.head.appendChild(link)
  })
}

export function loadScriptAsync(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })
}
