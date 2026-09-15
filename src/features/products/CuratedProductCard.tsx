"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/shared/cart-store";
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action";
import { toast } from "sonner";
import { Product } from "@/shared/types";
import { cn } from "@/shared/utils";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  getStockQuantity,
  isMadeToOrder,
} from "@/shared/lib/inventory";

interface CuratedProductCardProps {
  product: Product;
  index?: number;
  /** The home page shows the price only; discounts stay on shop and product pages. */
  showDiscount?: boolean;
}

/**
 * Home page product card, in the page's own style: no box, the photo in a thin
 * gold frame (like the fabric arches), name and price centred underneath.
 */
export const CuratedProductCard = memo(
  ({ product, showDiscount = true }: CuratedProductCardProps) => {
    const cart = useCartStore();

    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        category: (product as { categoryName?: string }).categoryName ?? null,
        image:
          getImageTier(product?.images, "medium", 0) ||
          product.image ||
          product.mainImage ||
          "/images/products/product-placeholder.png",
        hoverImage: product.images && product.images.length > 1 ? getImageTier(product.images, "medium", 1) : null,
      }),
      [product]
    );

    const productUrl = `/products/${product.slug || product.id}`;
    const stockQuantity = getStockQuantity(product);
    const madeToOrder = isMadeToOrder(product);
    const purchasableLimit = getPurchasableQuantityLimit(product);

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
        description: madeToOrder ? `Made to order. Delivery in ${MADE_TO_ORDER_DAYS}.` : undefined,
      });
    });

    const hasDiscount = showDiscount && !!productData.originalPrice && productData.originalPrice > productData.price;

    return (
      <article className="group flex w-full flex-col">
        <div className="relative">
          <Link
            href={productUrl}
            className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-4"
          >
            <span className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-[hsl(var(--brand-paper))] shadow-[0_18px_36px_-26px_rgba(33,30,36,0.55)]">
              {productData.hoverImage && (
                <OptimizedImage
                  src={productData.hoverImage}
                  alt=""
                  fill
                  className="z-10 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 360px"
                  imageType="productHero"
                  loading="lazy"
                />
              )}
              <OptimizedImage
                src={productData.image}
                alt={productData.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                imageType="productHero"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 360px"
                loading="lazy"
              />
              {/* Thin gold inner frame, the same line the fabric arches use. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[7px] z-20 rounded-[2px] border border-[hsl(var(--brand-gold-soft)/0.9)]"
              />
            </span>
          </Link>

          {/* Add to cart: one round midnight button in the photo corner; always shown on touch screens. */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={cn(
              "absolute bottom-3.5 right-3.5 z-30 flex h-10 w-10 items-center justify-center rounded-full",
              "bg-[hsl(var(--brand-midnight))] text-white shadow-[0_8px_18px_-8px_rgba(11,42,85,0.8)]",
              "transition-[background-color,opacity] duration-300 hover:bg-[hsl(var(--brand-midnight-hover))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2",
              "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
            )}
            aria-label={madeToOrder ? `Preorder ${productData.name}` : `Add ${productData.name} to cart`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        <Link href={productUrl} tabIndex={-1} className="mt-4 block px-1 text-center">
          {productData.category && (
            <span className="block font-sans text-[12px] font-medium text-[hsl(var(--brand-muted))]">
              {productData.category}
            </span>
          )}
          <span className="mt-1 font-serif text-[16px] leading-snug text-[hsl(var(--brand-ink))] line-clamp-2 md:text-[18px]">
            {productData.name}
          </span>
          <span className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2 font-sans tabular-nums">
            <span className="text-[15px] font-semibold text-[hsl(var(--brand-ink))]">
              ₹{productData.price.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-[13px] text-[hsl(var(--brand-muted))] line-through">
                ₹{productData.originalPrice!.toLocaleString("en-IN")}
              </span>
            )}
          </span>
          {madeToOrder && (
            <span className="mt-1 block font-sans text-[12px] text-[hsl(var(--brand-muted))]">
              Made to order · {MADE_TO_ORDER_DAYS}
            </span>
          )}
        </Link>
      </article>
    );
  }
);

CuratedProductCard.displayName = "CuratedProductCard";

export const CuratedProductCardSkeleton = () => (
  <div className="flex w-full animate-pulse flex-col">
    <div className="aspect-[4/5] rounded-sm bg-[hsl(var(--border)/0.45)]" />
    <div className="mx-auto mt-4 h-3 w-1/3 rounded bg-[hsl(var(--border)/0.5)]" />
    <div className="mx-auto mt-2 h-4 w-3/4 rounded bg-[hsl(var(--border)/0.5)]" />
    <div className="mx-auto mt-2 h-4 w-1/4 rounded bg-[hsl(var(--border)/0.45)]" />
  </div>
);
