/**
 * Design System Utilities
 * 
 * Helper functions for working with design tokens
 */

import { colors, spacing, breakpoints, type ColorMode } from "./tokens";

/**
 * Get responsive spacing value based on breakpoint
 */
export function getResponsiveSpacing(
  type: "content" | "section",
  viewport: "mobile" | "tablet" | "desktop"
): string {
  if (type === "content") {
    return spacing[viewport];
  }
  return spacing.section[viewport];
}

/**
 * Get theme-aware color
 */
export function getColor(
  path: string,
  mode: ColorMode = "light"
): string {
  const parts = path.split(".");
  let value: any = colors[mode];
  
  for (const part of parts) {
    value = value?.[part];
  }
  
  return value || "#000000";
}

/**
 * Get gray color for current mode
 */
export function getGray(
  shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  mode: ColorMode = "light"
): string {
  const grayColors = colors[mode].gray as Record<number, string>;
  return grayColors[shade] || "#000000";
}

/**
 * Get accent color for current mode
 */
export function getAccent(
  type: "success" | "warning" | "danger" | "info",
  mode: ColorMode = "light"
): string {
  return colors[mode].accent[type];
}

/**
 * Check if viewport matches breakpoint
 */
export function matchesBreakpoint(
  width: number,
  breakpoint: "mobile" | "tablet" | "desktop"
): boolean {
  switch (breakpoint) {
    case "mobile":
      return width < breakpoints.mobile;
    case "tablet":
      return width >= breakpoints.mobile && width < breakpoints.tablet;
    case "desktop":
      return width >= breakpoints.tablet;
    default:
      return false;
  }
}

/**
 * Get current breakpoint based on width
 */
export function getCurrentBreakpoint(width: number): "mobile" | "tablet" | "desktop" {
  if (width < breakpoints.mobile) return "mobile";
  if (width < breakpoints.tablet) return "tablet";
  return "desktop";
}

/**
 * Convert spacing token to number (for calculations)
 */
export function spacingToNumber(spacingValue: string): number {
  return parseInt(spacingValue.replace("px", ""), 10);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
