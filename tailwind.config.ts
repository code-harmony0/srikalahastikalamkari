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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
