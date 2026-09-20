"use client"

import React from "react"
import { FaWhatsapp } from "react-icons/fa"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppButton({
  phoneNumber = "917288848881", // Replace with actual number
  message,
}: WhatsAppButtonProps) {
  const pathname = usePathname()

  // Generate dynamic message based on current page
  const generateMessage = () => {
    if (message) return message

    const currentUrl = typeof window !== "undefined" ? window.location.href : ""

    // Check if we're on a product page
    if (pathname?.startsWith("/products/")) {
      // Try to get product info from window.__PRODUCT_DATA if available
      // This will be set by product pages
      if (typeof window !== "undefined" && (window as any).__PRODUCT_DATA) {
        const productData = (window as any).__PRODUCT_DATA
        const productName = productData.name
        const productPrice = productData.price
        const productId = productData.id

        if (productName) {
          let productMessage = `Hi! I'm interested in "${productName}"`
          if (productPrice) {
            productMessage += ` (priced at ₹${productPrice})`
          }
          productMessage += `. Could you please provide more information about this product?`

          if (productId) {
            productMessage += ` Product ID: ${productId}`
          }

          productMessage += `\n\nProduct Link: ${currentUrl}`

          return productMessage
        }
      }

      // Fallback: extract product name from URL slug
      const slug = pathname.split("/")[2]
      if (slug) {
        // Convert slug to readable name (e.g., "kalamkari-saree" -> "Kalamkari Saree")
        const productName = slug
          .split("-")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")

        return `Hi! I'm interested in the "${productName}". Could you please provide more information about this product?\n\nProduct Link: ${currentUrl}`
      }

      // If no slug, use generic with URL
      return `Hi! I have a question about your products.\n\nCurrent Page: ${currentUrl}`
    }

    // For non-product pages
    if (pathname === "/") {
      return "Hi! I'm interested in your Kalamkari products. Could you please provide more information?"
    }

    return `Hi! I have a question about your products.\n\nCurrent Page: ${currentUrl}`
  }

  const handleClick = () => {
    const dynamicMessage = generateMessage()
    const encodedMessage = encodeURIComponent(dynamicMessage)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <motion.button
      onClick={handleClick}
      className="floating-dock floating-dock--chat fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center hover:bg-[#20BD5B] transition-colors group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 400 }}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7 text-white" />

      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with us
      </span>

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </motion.button>
  )
}
