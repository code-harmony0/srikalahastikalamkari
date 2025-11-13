/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
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
            fontFamily: {
                heading: ["cormorantgaramond"],
                paragraph: ["open sans"]
            },
            colors: {
                // Modern Luxury Pastel Theme
                "accent-color": "#E6D7FF", // Soft lavender
                "light-brown": "#F8F6F3", // Clay beige light
                destructive: "#FF6B9D", // Soft pink destructive
                "destructive-foreground": "#FFFFFF",
                background: "#F8F6F3", // Clay beige background
                secondary: "#B8E6E1", // Pastel teal
                foreground: "#6B7280", // Warm grey text
                "secondary-foreground": "#6B7280",
                "primary-foreground": "#FFFFFF",
                primary: "#E6D7FF", // Soft lavender primary
                softgraytext: "#9CA3AF", // Soft grey text
                creamhighlight: "#F8F6F3", // Clay beige highlight
                pastelblue: "#B8D4F0", // Powder blue
                foregroungd: "#6B7280",
                footerbackground: "#6B7280", // Warm grey footer
                linkcolor: "#E6D7FF", // Soft lavender links
                buttonborder: "#E6D7FF", // Soft lavender borders
                "soft-lavender": "#E6D7FF",
                "pastel-teal": "#B8E6E1", 
                "powder-blue": "#B8D4F0",
                "clay-beige": "#F8F6F3",
                "warm-grey": "#6B7280",
                "soft-gold": "#F4E4BC"
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
