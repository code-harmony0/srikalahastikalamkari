import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ORIGINAL WIX DESIGN - Custom Typography
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "400" }],
        sm: ["0.875rem", { lineHeight: "1.25", letterSpacing: "0.025em", fontWeight: "400" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
        lg: ["1.125rem", { lineHeight: "1.75", letterSpacing: "0em", fontWeight: "400" }],
        xl: ["1.25rem", { lineHeight: "1.75", letterSpacing: "0em", fontWeight: "500" }],
        "2xl": ["1.5rem", { lineHeight: "2", letterSpacing: "-0.01em", fontWeight: "500" }],
        "3xl": ["1.875rem", { lineHeight: "2.25", letterSpacing: "-0.015em", fontWeight: "600" }],
        "4xl": ["2.25rem", { lineHeight: "2.5", letterSpacing: "-0.02em", fontWeight: "600" }],
        "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "8xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "9xl": ["8rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      // ORIGINAL WIX DESIGN - Fonts
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        paragraph: ["Open Sans", "sans-serif"],
        sans: ["Open Sans", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
      },
      // ORIGINAL WIX DESIGN - Color Palette (Exact Hex Values from Wix)
      colors: {
        // Original Wix brand colors
        "accent-color": "#B8860B", // Dark goldenrod
        "light-brown": "#F5F5DC", // Beige
        "light-brown-unused": "#DEB887",
        primary: {
          DEFAULT: "#A0522D", // Sienna brown - ORIGINAL WIX
          foreground: "#FFFFFF", // White text on primary
        },
        secondary: {
          DEFAULT: "#D2B48C", // Tan - ORIGINAL WIX
          foreground: "#333333",
        },
        background: "#F5F5DC", // Beige - ORIGINAL WIX
        foreground: "#333333", // Dark gray - ORIGINAL WIX
        footerbackground: "#333333",
        linkcolor: "#A0522D",
        buttonborder: "#A0522D",
        softgraytext: "#B8860B",
        creamhighlight: "#F5F5DC",
        pastelblue: "#F5F5DC",
        foregroungd: "#333333", // Typo from original but keeping for compatibility
        destructive: {
          DEFAULT: "#DC143C", // Crimson
          foreground: "#FFFFFF",
        },
        // shadcn/ui compatibility
        border: "#D2B48C",
        input: "#D2B48C",
        ring: "#A0522D",
        muted: {
          DEFAULT: "#F5F5DC",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#B8860B",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#333333",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#333333",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
