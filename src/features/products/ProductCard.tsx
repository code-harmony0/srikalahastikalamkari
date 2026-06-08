"use client"

import React, { memo, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Star, Heart, ShoppingBag } from "lucide-react"
import { useWishlistStore } from "@/shared/wishlist-store"
import { useCartStore } from "@/shared/cart-store"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { useCategories } from "@/shared/hooks/use-categories"
import { Product } from "@/shared/types"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { getResponsiveSizes } from "@/lib/image-utils"
import { getImageTier } from "@/lib/image-tiers"

interface ProductCardProps {
  product: Product
  index?: number
  viewMode?: "grid" | "list"
  priority?: boolean
}

export const ProductCard = memo(
  ({
    product,
    index = 0,
    viewMode = "grid",
    priority = false,
  }: ProductCardProps) => {
    // Memoized field mapping for better performance and type safety
    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        description: product.description || null,
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        images: product.images || [],
        image:
          getImageTier(product?.images, "thumb", 0) ||
          product.mainImage ||
          product.images?.[0] ||
          "/images/products/product-placeholder.png",
        slug: product.slug,
      }),
      [product],
    )

    const { data: categories } = useCategories()
    const categoryName = useMemo(() => {
      if (!categories?.data || !product.category_id) return "Uncategorized"
      const category = categories.data.find(
        (c: any) => c.id === product.category_id,
      )
      return category?.name || "Uncategorized"
    }, [categories, product.category_id])

    const wishlist = useWishlistStore()
    const cart = useCartStore()
    const isWishlisted = wishlist.items.includes(product.id)

    const toggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isWishlisted) {
        wishlist.removeItem(product.id)
        toast.success("Removed from wishlist")
      } else {
        wishlist.addItem(product.id)
        toast.success("Added to wishlist")
      }
    }

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!product.in_stock) {
        toast.error("Out of stock")
        return
      }

      const maxStock = product.stock_quantity ?? product.quantity ?? 0
      const existingItem = cart.items.find((i) => i.productId === product.id)
      const currentQty = existingItem?.quantity ?? 0

      if (currentQty >= maxStock) {
        toast.error(`Only ${maxStock} in stock`)
        return
      }

      cart.addItem(product, 1)
      toast.success("Added to cart")
    }

    const isList = viewMode === "list"

    const productUrl = `/products/${product.slug || product.id}`

    // Responsive sizes for different layouts
    const imageSizes = isList ? "180px" : getResponsiveSizes("grid")

    const cardVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, delay: index * 0.04 },
      },
    }

    return (
      <motion.div
        layout
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className={cn(
          "group relative bg-card border border-[#C19A5B]/20 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#C19A5B]/40",
          // 🛠 Compact List View: Fixed height 180px, Flex Row
          isList
            ? "rounded-lg flex flex-row h-[180px]"
            : "rounded-xl flex flex-col h-full",
        )}
      >
        {/* 1️⃣ IMAGE SECTION */}
        <div
          className={cn(
            "relative overflow-hidden bg-[#1A1512]/5",
            // 🛠 Compact List View: Width 180px
            isList ? "w-[180px] h-full shrink-0" : "w-full aspect-[4/5]",
          )}
        >
          <Link href={productUrl} className="block w-full h-full">
            {/* Secondary Image (Hover) */}
            {productData.images && productData.images.length > 1 && (
              <OptimizedImage
                src={
                  getImageTier(product?.images, "thumb", 1) ||
                  "/images/products/product-placeholder.png"
                }
                alt={`${productData.name} alternate`}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                sizes={imageSizes}
                imageType={isList ? "productCardCompact" : "productCard"}
                priority={false}
                loading="lazy"
              />
            )}

            {/* Main Image */}
            <OptimizedImage
              src={productData.image}
              alt={productData.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out group-hover:scale-105",
                productData.images && productData.images.length > 1
                  ? "group-hover:opacity-0"
                  : "",
                !product.in_stock && "grayscale-[30%] brightness-95",
              )}
              sizes={imageSizes}
              imageType={isList ? "productCardCompact" : "productCard"}
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          </Link>

          {/* OUT OF STOCK - Subtle overlay + bottom strip */}
          {!product.in_stock && (
            <>
              <div className="absolute inset-0 bg-[#1A1512]/15 z-15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                <div className="bg-[#1A1512]/80 backdrop-blur-[2px] py-1.5 px-3 flex items-center justify-center gap-1.5">
                  <span className="text-[#C19A5B] text-[10px] font-semibold tracking-[0.12em] uppercase">
                    Out of Stock
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Wishlist Button (Grid View Only - List view has it in content) */}
          {!isList && (
            <button
              onClick={toggleWishlist}
              className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-white/90 text-[#1A1512] hover:bg-[#C19A5B] hover:text-white flex items-center justify-center shadow-sm transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
              title="Wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-[#C19A5B] text-[#C19A5B]" : ""}`}
              />
            </button>
          )}
        </div>

        {/* 2️⃣ CONTENT SECTION */}
        <div
          className={cn(
            "flex flex-col flex-1",
            // 🛠 Compact List View: Less Padding
            isList ? "p-4 justify-between" : "p-4 justify-between",
          )}
        >
          <div>
            <Link href={productUrl} className="space-y-1 block group/text">
              <span className="font-playfair italic text-[#C19A5B] text-[11px] block">
                {categoryName}
              </span>

              <h3
                className={cn(
                  "font-inter font-bold text-[#1A1512] leading-tight group-hover/text:text-[#C19A5B] transition-colors",
                  isList
                    ? "text-[15px] line-clamp-1"
                    : "text-[14px] line-clamp-2",
                )}
              >
                {productData.name}
              </h3>

              {/* Description: Only show in List view, limit to 2 lines */}
              {isList && (
                <p className="font-inter text-[12px] text-[#1A1512]/60 leading-relaxed mt-1.5 line-clamp-2 pr-4">
                  {productData.description || "Handcrafted with natural dyes."}
                </p>
              )}
            </Link>
          </div>

          {/* Price & Actions */}
          <div
            className={cn(
              "flex items-end border-t border-[#C19A5B]/10 pt-3 mt-3",
              isList ? "justify-between" : "justify-between",
            )}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="font-inter font-bold text-[15px] text-[#1A1512]">
                  ₹{productData.price.toLocaleString()}
                </p>
                {product.original_price &&
                  productData.originalPrice &&
                  productData.originalPrice > productData.price && (
                    <>
                      <span className="text-[11px] text-[#1A1512]/40 line-through decoration-[#C19A5B]/40">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                        -
                        {Math.round(
                          ((productData.originalPrice - productData.price) /
                            productData.originalPrice) *
                            100,
                        )}
                        %
                      </span>
                    </>
                  )}
              </div>
              {product.stock_quantity && product.stock_quantity > 0 ? (
                <span className="text-[11px] font-medium text-[#1A1512]/70 mt-0.5">
                  {product.stock_quantity} in stock
                </span>
              ) : null}

              {!isList && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#C19A5B] text-[#C19A5B]" />
                  <span className="text-[11px] font-medium text-[#1A1512]/70">
                    4.8
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 relative z-10">
              {isList && (
                <button
                  onClick={toggleWishlist}
                  className="w-8 h-8 rounded-full border border-[#C19A5B]/20 text-[#1A1512] hover:bg-[#C19A5B]/10 flex items-center justify-center transition-colors"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isWishlisted ? "fill-[#C19A5B] text-[#C19A5B]" : ""}`}
                  />
                </button>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className={cn(
                  "transition-all shadow-sm flex items-center justify-center gap-2",
                  product.in_stock
                    ? "bg-[#1A1512] text-white hover:shadow-md hover:bg-[#C19A5B]"
                    : "bg-[#E8DDD0] text-[#9B8B7E] cursor-not-allowed",
                  // 🛠 Compact Button sizing
                  isList
                    ? "h-8 px-4 rounded-md text-[11px] font-bold uppercase tracking-wide"
                    : "w-8 h-8 rounded-full",
                )}
                title={product.in_stock ? "Add to Cart" : "Out of Stock"}
              >
                {isList ? (
                  <>{product.in_stock ? "Add" : "Unavailable"}</>
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  },
)

ProductCard.displayName = "ProductCard"
