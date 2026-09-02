import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }], // 13px
        sm: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }], // 14px
        base: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],   // 16px - Inter Body
        lg: ["1.125rem", { lineHeight: "1.6", fontWeight: "500" }],  // 18px
        xl: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],   // 20px - H3
        "2xl": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }], // 24px
        "3xl": ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }], // 28px - H2
        "4xl": ["2.5rem", { lineHeight: "1.2", fontWeight: "600" }],  // 40px - H1
        "5xl": ["3rem", { lineHeight: "1.2", fontWeight: "700" }],     // 48px
        "6xl": ["3.75rem", { lineHeight: "1.1", fontWeight: "700" }], // 60px
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        paragraph: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
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
          secondary: "hsl(var(--accent-secondary))", // Added secondary accent
        },
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
        },
        text: {
          heading: "hsl(var(--text-heading))",
          body: "hsl(var(--text-body))",
          muted: "hsl(var(--text-muted))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Legacy/Custom colors mapped to variables or kept for backward compatibility
        "accent-color": "hsl(var(--accent))",
        "light-brown": "hsl(var(--background))", // Mapping to background (Beige)
        footerbackground: "#333333", // Keeping fixed for now
        linkcolor: "hsl(var(--primary))",
        buttonborder: "hsl(var(--primary))",
        softgraytext: "hsl(var(--accent))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        DEFAULT: "0 2px 8px rgba(0, 0, 0, 0.06)", // Unified shadow
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
  plugins: [tailwindcssAnimate],
};

export default config;
