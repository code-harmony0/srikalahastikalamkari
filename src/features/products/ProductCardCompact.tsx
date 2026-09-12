"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, ShoppingBag, Star } from "lucide-react";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import { Product } from "@/shared/types";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  getStockQuantity,
  isMadeToOrder,
} from "@/shared/lib/inventory";
import { getProductInquiryWhatsAppUrl } from "@/shared/lib/whatsapp";

interface ProductCardCompactProps {
  product: Product;
  index?: number;
  priority?: boolean;
  actionMode?: "commerce" | "whatsapp-inquiry";
}

/**
 * ProductCardCompact - A compact, efficient product card for collection/listing pages
 * Optimized for quick scanning with clear visual hierarchy:
 * 1. Product Name (primary)
 * 2. Price (secondary)
 * 3. Image (supporting)
 * 4. Stock/Rating (tertiary)
 * 5. Actions (accessible)
 */
export const ProductCardCompact = memo(
  ({
    product,
    index = 0,
    priority = false,
    actionMode = "commerce",
  }: ProductCardCompactProps) => {
    // Memoized field mapping
    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        image:
          getImageTier(product?.images, "thumb", 0) ||
          product.image ||
          product.mainImage ||
          null,
        slug: product.slug,
      }),
      [product]
    );

    const categoryName = (product as any).categoryName || null;
    const subCategoryName = (product as any).subCategoryName || null;
    const inquiryOnly = actionMode === "whatsapp-inquiry";
    const [siteOrigin, setSiteOrigin] = useState(
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || ""
    );

    useEffect(() => {
      if (!siteOrigin && typeof window !== "undefined") {
        setSiteOrigin(window.location.origin);
      }
    }, [siteOrigin]);

    const wishlist = useWishlistStore();
    const cart = useCartStore();
    const isWishlisted = wishlist.items.includes(product.id);
    const stockQuantity = getStockQuantity(product);
    const madeToOrder = isMadeToOrder(product);
    const purchasableLimit = getPurchasableQuantityLimit(product);

    const toggleWishlist = useAuthGuardedAction(() => {
      if (isWishlisted) {
        wishlist.removeItem(product.id);
        toast.success("Removed from wishlist");
      } else {
        wishlist.addItem(product.id);
        toast.success("Added to wishlist");
      }
    });

    const handleAddToCart = useAuthGuardedAction(() => {
      const existingItem = cart.items.find((i) => i.productId === product.id);
      const currentQty = existingItem?.quantity ?? 0;
      if (currentQty >= purchasableLimit) {
        toast.error(
          madeToOrder
            ? `Made-to-order quantity is limited to ${purchasableLimit}`
            : `Only ${stockQuantity} in stock`,
        );
        return;
      }

      cart.addItem(product, 1);
      toast.success("Added to cart", {
        description: madeToOrder
          ? `Made to order. Delivery in ${MADE_TO_ORDER_DAYS}.`
          : undefined,
      });
    });

    const mainImage = productData.image || "/images/products/product-placeholder.png";
    const productUrl = `/products/${product.slug || product.id}`;
    const inquiryUrl = getProductInquiryWhatsAppUrl(
      {
        ...product,
        name: productData.name,
        categoryName: categoryName || undefined,
        subCategoryName: subCategoryName || undefined,
      },
      { siteOrigin }
    );

    const discountPercent =
      productData.originalPrice && productData.originalPrice > productData.price
        ? Math.round(
            ((productData.originalPrice - productData.price) /
              productData.originalPrice) *
              100
          )
        : 0;

    const cardVariants = {
      hidden: { opacity: 0, y: 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, delay: index * 0.03 },
      },
    };

    const cardContent = (
      <>
        {/* IMAGE SECTION - Fixed 4:5 aspect ratio */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <OptimizedImage
            src={mainImage}
            alt={productData.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
              madeToOrder && "grayscale-[30%] brightness-95"
            )}
            imageType="productCardCompact"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />

          {/* Made-to-order strip indicator */}
          {madeToOrder && (
            <>
              <div className="absolute inset-0 bg-black/10 z-15 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                <div className="bg-[#1A1512]/85 py-1 flex items-center justify-center">
                  <span className="text-white text-[10px] sm:text-[10px] font-bold tracking-wider uppercase">
                    {inquiryOnly ? "Custom request" : `Made to Order · ${MADE_TO_ORDER_DAYS}`}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Wishlist Button - Top Right, always visible on mobile */}
          {!inquiryOnly && (
            <button
              onClick={toggleWishlist}
              className={cn(
                "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                "bg-background/90 backdrop-blur-sm shadow-sm",
                "md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0",
                isWishlisted
                  ? "text-primary"
                  : "text-foreground/60 hover:text-primary"
              )}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isWishlisted && "fill-current")}
              />
            </button>
          )}
        </div>

        {/* META SECTION - Compact info */}
        <div className="p-2.5 sm:p-3 space-y-1 sm:space-y-1.5">
          {/* Category / Subcategory */}
          {(categoryName || subCategoryName) && (
            <div className="flex items-center gap-1 flex-wrap">
              {categoryName && (
                <span className="font-playfair italic text-accent text-[10px] sm:text-[10px] leading-none">
                  {categoryName}
                </span>
              )}
              {categoryName && subCategoryName && (
                <span className="text-accent/40 text-[10px] sm:text-[10px] leading-none">›</span>
              )}
              {subCategoryName && (
                <span className="font-playfair italic text-accent/80 text-[10px] sm:text-[10px] leading-none">
                  {subCategoryName}
                </span>
              )}
            </div>
          )}

          {/* Product Name - Primary visual anchor, max 2 lines */}
          <h3 className="font-inter font-semibold text-foreground text-[11.5px] sm:text-[13px] leading-[1.15] sm:leading-tight line-clamp-2">
            {productData.name}
          </h3>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5">
            <span className="font-inter font-bold text-primary text-[13px] sm:text-[15px] leading-none">
              ₹{productData.price.toLocaleString()}
            </span>
            {productData.originalPrice &&
              productData.originalPrice > productData.price && (
                <>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through">
                    ₹{productData.originalPrice.toLocaleString()}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] sm:text-[10px] font-bold text-green-600 bg-green-50 px-1 sm:px-1.5 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                  )}
                </>
              )}
          </div>

          {/* Stock & Rating Row */}
          <div className="flex items-center justify-between pt-0.5 sm:pt-1">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {/* Rating */}
              <div className="flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-accent text-accent" />
                <span className="text-[10px] sm:text-[10px] font-medium text-muted-foreground">
                  4.8
                </span>
              </div>

              {/* Stock indicator */}
              {stockQuantity > 0 ? (
                <span className="truncate text-[10px] sm:text-[10px] text-muted-foreground">
                  {stockQuantity <= 5
                    ? `Only ${stockQuantity} left`
                    : "In stock"}
                </span>
              ) : (
                <span className="truncate text-[10px] sm:text-[10px] font-medium text-[#A07840]">
                  {inquiryOnly ? "Custom request" : `Made to order in ${MADE_TO_ORDER_DAYS}`}
                </span>
              )}
            </div>

            {/* Add to Cart / WhatsApp Inquiry - Compact icon button */}
            {inquiryOnly ? (
              <span
                className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
                aria-label="Ask on WhatsApp"
              />
            ) : (
              <button
                onClick={handleAddToCart}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex shrink-0 items-center justify-center transition-all duration-200",
                  "relative before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
                  !madeToOrder
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md"
                    : "bg-[#A07840] text-white shadow-sm hover:bg-[#1A1512] hover:shadow-md"
                )}
                aria-label={!madeToOrder ? "Add to cart" : "Preorder made-to-order item"}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>
      </>
    );

    return (
      <motion.article
        layout
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="group relative bg-card rounded-md sm:rounded-lg border border-accent/15 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5"
      >
        {inquiryOnly ? (
          <>
            <Link href={productUrl} className="block">
              {cardContent}
            </Link>
            <a
              href={inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-colors hover:bg-[#1A1512] sm:bottom-2.5 sm:right-2.5"
              aria-label={`Ask on WhatsApp about ${productData.name}`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </>
        ) : (
          <Link href={productUrl} className="block">
            {cardContent}
          </Link>
        )}
      </motion.article>
    );
  }
);

ProductCardCompact.displayName = "ProductCardCompact";

/**
 * Skeleton loader for ProductCardCompact
 * Use during loading states for consistent visual rhythm
 */
export const ProductCardCompactSkeleton = () => (
  <div className="bg-card rounded-md sm:rounded-lg border border-accent/10 overflow-hidden animate-pulse">
    <div className="aspect-[4/5] bg-muted" />
    <div className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
      <div className="h-2 w-16 bg-muted rounded" />
      <div className="h-3 sm:h-4 w-full bg-muted rounded" />
      <div className="h-3 sm:h-4 w-3/4 bg-muted rounded" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-3 sm:h-4 w-20 bg-muted rounded" />
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded-full" />
      </div>
    </div>
  </div>
);
