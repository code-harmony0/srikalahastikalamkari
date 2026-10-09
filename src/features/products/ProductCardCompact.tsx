"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
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

// Round buttons over the photo. Always shown on touch screens; on a mouse they
// appear when the card is hovered or the button has keyboard focus.
const photoButton = cn(
  "absolute z-30 flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10",
  "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
  "transition-[background-color,opacity] duration-300",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2",
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100",
);

/**
 * Shop grid card: tall photo with the saving as a small tag on it (as on the
 * client's reference shops), then centred category, name, price and stock in
 * the same white card.
 */
export const ProductCardCompact = memo(
  ({
    product,
    index = 0,
    priority = false,
    actionMode = "commerce",
  }: ProductCardCompactProps) => {
    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        image:
          getImageTier(product?.images, "medium", 0) ||
          product.image ||
          product.mainImage ||
          "/images/products/product-placeholder.png",
        hoverImage:
          product.images && product.images.length > 1 ? getImageTier(product.images, "medium", 1) : null,
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

    const hasDiscount =
      !!productData.originalPrice && productData.originalPrice > productData.price;
    const discountPercent = hasDiscount
      ? Math.round(
          ((productData.originalPrice! - productData.price) / productData.originalPrice!) * 100
        )
      : 0;

    const categoryLine = [categoryName, subCategoryName].filter(Boolean).join(" · ");
    const statusLine = madeToOrder
      ? inquiryOnly
        ? "Custom request"
        : `Made to order · ${MADE_TO_ORDER_DAYS}`
      : stockQuantity > 0 && stockQuantity <= 5
        ? `Only ${stockQuantity} left`
        : null;

    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: Math.min(index, 12) * 0.03 } }}
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-white",
          "ring-1 ring-[hsl(var(--brand-gold)/0.35)] shadow-[0_10px_24px_-20px_rgba(33,30,36,0.45)]",
          "transition-shadow duration-300 hover:shadow-[0_20px_36px_-22px_rgba(33,30,36,0.5)]",
        )}
      >
        <div className="relative">
          <Link
            href={productUrl}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--brand-royal))]"
          >
            <span className="relative block aspect-[7/9] overflow-hidden bg-[hsl(var(--brand-indigo-tint))]">
              {productData.hoverImage && (
                <OptimizedImage
                  src={productData.hoverImage}
                  alt=""
                  fill
                  className="z-10 object-cover object-top opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
                  imageType="productHero"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                />
              )}
              <OptimizedImage
                src={productData.image}
                alt={productData.name}
                fill
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                imageType="productHero"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={priority}
                loading={priority ? undefined : "lazy"}
              />
              {/* Thin gold inner frame, the same line the home cards use. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[6px] z-20 rounded-[3px] border border-[hsl(var(--brand-gold-soft)/0.85)] sm:inset-[7px]"
              />
              {/* Saving shown on the photo. Moved to top-right with premium styling */}
              {discountPercent > 0 && (
                <span className="absolute top-0 right-4 z-30 flex flex-col items-center justify-center rounded-b bg-white/95 px-2 pb-2.5 pt-2 shadow-[0_4px_12px_-2px_rgba(33,30,36,0.15)] border-x border-b border-black/5 backdrop-blur-sm transition-transform hover:-translate-y-0.5">
                  <span className="font-sans text-[11px] font-bold leading-none tracking-[0.05em] text-[#D93025]">
                    {discountPercent}%
                  </span>
                  <span className="mt-0.5 font-sans text-[8px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--brand-ink))]">
                    Off
                  </span>
                </span>
              )}
            </span>
          </Link>

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
                "absolute z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 backdrop-blur-md shadow-md border border-white/60 text-[hsl(var(--brand-ink))] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-white hover:text-[#D93025] hover:scale-110 hover:shadow-xl sm:top-4 sm:left-4 top-3 left-3",
                isWishlisted
                  ? "[@media(hover:hover)]:scale-100 [@media(hover:hover)]:opacity-100 text-[#D93025]"
                  : "[@media(hover:hover)]:scale-90 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100"
              )}
            >
              <Heart className={cn("h-[18px] w-[18px]", isWishlisted && "fill-current")} />
            </button>

          {inquiryOnly ? (
            <a
              href={inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ask on WhatsApp about ${productData.name}`}
              className={cn(
                "group/btn absolute z-30 flex h-10 items-center rounded-full bg-white/70 backdrop-blur-md shadow-md border border-white/60 text-[#1F7A4D] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-[#1F7A4D] hover:border-[#1F7A4D] hover:text-white hover:shadow-xl sm:bottom-4 sm:right-4 bottom-3 right-3",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <FaWhatsapp className="h-[20px] w-[20px]" />
              </div>
              <div className="flex max-w-0 items-center overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/btn:max-w-[140px] group-hover/btn:opacity-100">
                <span className="pr-5 font-sans text-[11px] font-bold uppercase tracking-[0.1em]">
                  Ask on WhatsApp
                </span>
              </div>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={
                madeToOrder ? `Preorder ${productData.name}` : `Add ${productData.name} to cart`
              }
              className={cn(
                "group/btn absolute z-30 flex h-10 items-center rounded-full bg-white/70 backdrop-blur-md shadow-[0_4px_12px_rgba(33,30,36,0.1)] border border-white/60 text-[hsl(var(--brand-ink))] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-[hsl(var(--brand-midnight))] hover:border-[hsl(var(--brand-midnight))] hover:text-white hover:shadow-[0_8px_20px_rgba(11,42,85,0.4)] sm:bottom-4 sm:right-4 bottom-3 right-3",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <ShoppingCart className="h-[18px] w-[18px]" />
              </div>
              <div className="flex max-w-0 items-center overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/btn:max-w-[120px] group-hover/btn:opacity-100">
                <span className="pr-5 font-sans text-[11px] font-bold uppercase tracking-[0.1em]">
                  {madeToOrder ? "Preorder" : "Add to cart"}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Card text, centred like the home cards: category, name, price, stock. */}
        <Link
          href={productUrl}
          tabIndex={-1}
          className="flex flex-1 flex-col items-center border-t border-[hsl(var(--brand-gold)/0.45)] px-3 pb-3.5 pt-3 text-center sm:px-4 sm:pb-4"
        >
          {categoryLine && (
            <span className="max-w-full truncate font-sans text-[11.5px] leading-4 text-[hsl(var(--brand-muted))] sm:text-[12px]">
              {categoryLine}
            </span>
          )}
          <span className="mt-1 font-sans text-[13.5px] font-medium leading-[1.4] text-[hsl(var(--brand-ink))] line-clamp-2 sm:text-[14.5px]">
            {productData.name}
          </span>

          <span className="mt-auto flex flex-col items-center pt-2">
            <span className="flex flex-wrap items-baseline justify-center gap-x-1.5 font-sans tabular-nums">
              <span className="text-[15px] font-semibold text-[hsl(var(--brand-ink))] sm:text-[16px]">
                ₹{productData.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-[12px] text-[hsl(var(--brand-muted))] line-through sm:text-[13px]">
                  ₹{productData.originalPrice!.toLocaleString("en-IN")}
                </span>
              )}
            </span>
            {statusLine && (
              <span
                className={cn(
                  "mt-1 font-sans text-[12px] font-medium leading-5",
                  madeToOrder ? "text-[hsl(var(--brand-midnight))]" : "text-[#8E2A1B]",
                )}
              >
                {statusLine}
              </span>
            )}
          </span>
        </Link>
      </motion.article>
    );
  }
);

ProductCardCompact.displayName = "ProductCardCompact";

export const ProductCardCompactSkeleton = () => (
  <div className="flex w-full animate-pulse flex-col overflow-hidden rounded-lg bg-white ring-1 ring-[hsl(var(--brand-gold)/0.3)]">
    <div className="aspect-[7/9] bg-[hsl(var(--brand-ink)/0.07)]" />
    <div className="space-y-2 px-3 pb-4 pt-3 sm:px-4">
      <div className="h-3 w-1/3 rounded bg-[hsl(var(--brand-ink)/0.07)]" />
      <div className="h-4 w-3/4 rounded bg-[hsl(var(--brand-ink)/0.07)]" />
      <div className="h-4 w-1/4 rounded bg-[hsl(var(--brand-ink)/0.06)]" />
    </div>
  </div>
);
