"use client"

import React, { memo, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MessageCircle, ShoppingBag } from "lucide-react"
import { useWishlistStore } from "@/shared/wishlist-store"
import { useCartStore } from "@/shared/cart-store"
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { useCategories } from "@/shared/hooks/use-categories"
import { Product } from "@/shared/types"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { getImageTier } from "@/lib/image-tiers"
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  getStockQuantity,
  isMadeToOrder,
} from "@/shared/lib/inventory"
import { getProductInquiryWhatsAppUrl } from "@/shared/lib/whatsapp"

interface ProductCardProps {
  product: Product
  index?: number
  /** The shop grid uses ProductCardCompact; this card is the list row. */
  viewMode?: "list"
  priority?: boolean
  actionMode?: "commerce" | "whatsapp-inquiry"
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
const actionButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-colors"

/**
 * Shop list row: the grid card's look laid sideways. Photo in a thin gold
 * frame, then category, name, short description, price and the actions.
 */
export const ProductCard = memo(
  ({ product, index = 0, priority = false, actionMode = "commerce" }: ProductCardProps) => {
    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        description: product.description || null,
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        image:
          getImageTier(product?.images, "medium", 0) ||
          product.mainImage ||
          product.images?.[0] ||
          "/images/products/product-placeholder.png",
      }),
      [product],
    )

    const { data: categories } = useCategories()
    const categoryName = useMemo(() => {
      if (product.categoryName) return product.categoryName
      if (!categories?.data || !product.category_id) return null
      return categories.data.find((c: any) => c.id === product.category_id)?.name || null
    }, [categories, product.categoryName, product.category_id])
    const subCategoryName = product.subCategoryName || undefined

    const wishlist = useWishlistStore()
    const cart = useCartStore()
    const isWishlisted = wishlist.items.includes(product.id)
    const stockQuantity = getStockQuantity(product)
    const madeToOrder = isMadeToOrder(product) || (product as any).is_custom_design
    const purchasableLimit = getPurchasableQuantityLimit(product)
    const inquiryOnly = actionMode === "whatsapp-inquiry"
    const [siteOrigin, setSiteOrigin] = useState(
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "",
    )

    useEffect(() => {
      if (!siteOrigin && typeof window !== "undefined") {
        setSiteOrigin(window.location.origin)
      }
    }, [siteOrigin])

    const toggleWishlist = useAuthGuardedAction(() => {
      if (isWishlisted) {
        wishlist.removeItem(product.id)
        toast.success("Removed from wishlist")
      } else {
        wishlist.addItem(product.id)
        toast.success("Added to wishlist")
      }
    })

    const handleAddToCart = useAuthGuardedAction(() => {
      const existingItem = cart.items.find((i) => i.productId === product.id)
      const currentQty = existingItem?.quantity ?? 0

      if (currentQty >= purchasableLimit) {
        toast.error(
          madeToOrder
            ? `Made-to-order quantity is limited to ${purchasableLimit}`
            : `Only ${stockQuantity} in stock`,
        )
        return
      }

      cart.addItem(product, 1)
      toast.success("Added to cart", {
        description: madeToOrder ? `Made to order. Delivery in ${MADE_TO_ORDER_DAYS}.` : undefined,
      })
    })

    const productUrl = `/products/${product.slug || product.id}`
    const inquiryUrl = getProductInquiryWhatsAppUrl(
      { ...product, name: productData.name, categoryName: categoryName || undefined, subCategoryName },
      { siteOrigin },
    )

    const hasDiscount = !!productData.originalPrice && productData.originalPrice > productData.price
    const discountPercent = hasDiscount
      ? Math.round(((productData.originalPrice! - productData.price) / productData.originalPrice!) * 100)
      : 0

    const categoryLine = [categoryName, subCategoryName].filter(Boolean).join(" · ")
    const statusLine = madeToOrder
      ? inquiryOnly
        ? "Custom request"
        : `Made to order · ${MADE_TO_ORDER_DAYS}`
      : stockQuantity > 0 && stockQuantity <= 5
        ? `Only ${stockQuantity} left`
        : null

    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: Math.min(index, 12) * 0.03 } }}
        className={cn(
          "group relative flex w-full overflow-hidden rounded-lg bg-white",
          "ring-1 ring-[hsl(var(--brand-gold)/0.35)] shadow-[0_10px_24px_-20px_rgba(33,30,36,0.45)]",
          "transition-shadow duration-300 hover:shadow-[0_20px_36px_-22px_rgba(33,30,36,0.5)]",
        )}
      >
        <Link
          href={productUrl}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block w-[176px] shrink-0 self-stretch lg:w-[200px]"
        >
          <span className="relative block h-full min-h-[235px] overflow-hidden bg-[hsl(var(--brand-indigo-tint))] lg:min-h-[267px]">
            <OptimizedImage
              src={productData.image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              imageType="productHero"
              sizes="200px"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[7px] z-20 rounded-[3px] border border-[hsl(var(--brand-gold-soft)/0.85)]"
            />
            {discountPercent > 0 && (
              <span className="absolute left-3.5 top-3.5 z-30 rounded-full bg-white/95 px-2 py-0.5 font-sans text-[12px] font-semibold uppercase leading-5 tracking-[0.04em] text-[hsl(var(--brand-ink))] tabular-nums shadow-[0_4px_10px_-6px_rgba(33,30,36,0.5)]">
                {discountPercent}% off
              </span>
            )}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col border-l border-[hsl(var(--brand-gold)/0.45)] p-5 lg:p-6">
          <Link href={productUrl} className={cn("block rounded-sm", focusRing)}>
            {categoryLine && (
              <span className="block truncate font-sans text-[12px] leading-4 text-[hsl(var(--brand-muted))]">
                {categoryLine}
              </span>
            )}
            <h3 className="mt-1 font-sans text-[16px] font-medium leading-snug text-[hsl(var(--brand-ink))] line-clamp-2 lg:text-[17px]">
              {productData.name}
            </h3>
            {productData.description && (
              <p className="mt-2 max-w-[62ch] font-sans text-[14px] leading-relaxed text-[hsl(var(--brand-ink-soft))] line-clamp-2">
                {productData.description}
              </p>
            )}
          </Link>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
            <div>
              <p className="flex flex-wrap items-baseline gap-x-2 font-sans tabular-nums">
                <span className="text-[18px] font-semibold text-[hsl(var(--brand-ink))]">
                  ₹{productData.price.toLocaleString("en-IN")}
                </span>
                {hasDiscount && (
                  <span className="text-[13px] text-[hsl(var(--brand-muted))] line-through">
                    ₹{productData.originalPrice!.toLocaleString("en-IN")}
                  </span>
                )}
              </p>
              {statusLine && (
                <p
                  className={cn(
                    "mt-0.5 font-sans text-[13px] font-medium",
                    madeToOrder ? "text-[hsl(var(--brand-midnight))]" : "text-[#8E2A1B]",
                  )}
                >
                  {statusLine}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!inquiryOnly && (
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-pressed={isWishlisted}
                  aria-label={
                    isWishlisted
                      ? `Remove ${productData.name} from wishlist`
                      : `Add ${productData.name} to wishlist`
                  }
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--brand-ink)/0.25)] bg-white text-[hsl(var(--brand-ink))] transition-colors hover:border-[hsl(var(--brand-ink))]",
                    focusRing,
                  )}
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                </button>
              )}

              {inquiryOnly ? (
                <a
                  href={inquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(actionButton, "bg-[#1F7A4D] hover:bg-[#17603C]", focusRing)}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask on WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={cn(
                    actionButton,
                    "bg-[hsl(var(--brand-midnight))] hover:bg-[hsl(var(--brand-midnight-hover))]",
                    focusRing,
                  )}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  {madeToOrder ? "Preorder" : "Add to cart"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    )
  },
)

ProductCard.displayName = "ProductCard"
