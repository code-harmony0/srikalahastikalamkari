/**
 * Design System Tokens for Modern Dashboard Redesign
 * 
 * This file contains all design tokens following the strict implementation contract.
 * Only the spacing values defined here may be used throughout the application.
 */

// Color Palette
export const colors = {
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    primary: "#16A34A",
    secondary: "#2563EB",
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    gray: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
    accent: {
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
      info: "#38BDF8",
    },
  },
  dark: {
    background: "#0F172A",
    surface: "#1E293B",
    primary: "#4ADE80",
    secondary: "#60A5FA",
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    gray: {
      900: "#0F172A",
      800: "#1E293B",
      700: "#334155",
      600: "#475569",
      400: "#94A3B8",
      100: "#F1F5F9",
    },
    accent: {
      success: "#4ADE80",
      warning: "#FBBF24",
      danger: "#F87171",
      info: "#38BDF8",
    },
  },
} as const;

// Typography
export const typography = {
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing Scale (ONLY these values may be used)
export const spacing = {
  mobile: "16px",
  tablet: "20px",
  desktop: "24px",
  section: {
    mobile: "20px",
    tablet: "24px",
    desktop: "32px",
  },
  card: {
    padding: "20px",
    gap: "20px",
  },
} as const;

// Layout Dimensions
export const layout = {
  topBar: {
    height: "72px",
  },
  sidebar: {
    desktop: "260px",
    tablet: "220px",
  },
  content: {
    maxWidth: "1440px",
  },
} as const;

// Component Specifications
export const components = {
  kpiCard: {
    maxHeight: "140px",
    padding: "20px",
    borderRadius: "14px",
    icon: {
      size: "36px",
      borderRadius: "10px",
    },
    sparkline: {
      height: "40px",
      opacity: 0.6,
    },
  },
  chartCard: {
    maxHeight: "320px",
    padding: "20px",
    borderRadius: "14px",
  },
  table: {
    rowHeight: "56px",
    cellPadding: "12px",
  },
} as const;

// Breakpoints
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
} as const;

// Shadows
export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px rgba(0, 0, 0, 0.1)",
} as const;

// Export complete design system
export const designSystem = {
  colors,
  typography,
  spacing,
  layout,
  components,
  breakpoints,
  shadows,
} as const;

export type DesignSystem = typeof designSystem;
export type ColorMode = "light" | "dark";
