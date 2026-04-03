"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when viewport width is < 1024px (lg breakpoint).
 * Safe for SSR — returns false on server to avoid hydration mismatch.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)")
    setIsMobile(mql.matches)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [])

  return isMobile
}
