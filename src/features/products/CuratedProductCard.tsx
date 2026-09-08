"use client";

import React, { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
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
}

export const CuratedProductCard = memo(
  ({ product, index = 0 }: CuratedProductCardProps) => {
    const cart = useCartStore();

    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        slug: product.slug,
        image:
          getImageTier(product?.images, "medium", 0) ||
          product.image ||
          product.mainImage ||
          "/images/products/product-placeholder.png",
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
        description: madeToOrder
          ? `Made to order. Delivery in ${MADE_TO_ORDER_DAYS}.`
          : undefined,
      });
    });

    // Determine badge type
    const getBadge = () => {
      if (product.is_featured || product.isFeatured) return "Curated";
      const salesRank = (product as any).salesRank;
      if (salesRank && salesRank <= 10) return "Popular";
      return null;
    };

    const badge = getBadge();

    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        whileHover={{ y: -6, boxShadow: "0 12px 28px rgba(59, 44, 35, 0.12)" }}
        className={cn(
          "group relative flex flex-col",
          // CARD CONTAINER - Solid background, subtle border, rounded corners
          "w-full max-w-[280px]",
          "bg-card border border-[#C19A5B]/20",
          "rounded-xl overflow-hidden",
          "shadow-[0_2px_8px_rgba(26,21,18,0.06)]",
          "transition-shadow duration-300"
        )}
      >
        {/* Entire card is clickable */}
        <Link href={productUrl} className="flex flex-col h-full">
          {/* IMAGE AREA - Inside card, max 55-60% height */}
          <div className="relative aspect-[4/5] max-h-[200px] overflow-hidden bg-[#F8F4EF]">
            <OptimizedImage
              src={productData.image}
              alt={productData.name}
              fill
              className={cn(
                "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]",
                madeToOrder && "grayscale-[30%] brightness-95"
              )}
              imageType="productHero"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
              loading="lazy"
            />

            {/* Made-to-order indicator */}
            {madeToOrder && (
              <>
                <div className="absolute inset-0 bg-[#1A1512]/15 z-15 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                  <div className="bg-[#1A1512]/80 backdrop-blur-[2px] py-1.5 flex items-center justify-center">
                    <span className="text-[#C19A5B] text-[10px] font-semibold tracking-[0.12em] uppercase">
                      Made to Order · {MADE_TO_ORDER_DAYS}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Badges - top-left (only when in stock) */}
            {badge && !madeToOrder && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#1A1512] text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase shadow-sm border border-white/10">
                  {badge}
                </span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className={cn(
                "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
                "bg-white text-[#1A1512] shadow-md",
                "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                "transition-all duration-300",
                "hover:bg-[#C19A5B] hover:text-white"
              )}
              aria-label={madeToOrder ? "Preorder made-to-order item" : "Add to cart"}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>

          {/* CONTENT AREA - Padded, structured */}
          <div className="flex flex-col flex-1 p-4">
            {/* PRODUCT TITLE - PRIMARY, visually dominant */}
            <h3 className="font-playfair font-semibold text-[16px] md:text-[17px] leading-snug text-[#1A1512] line-clamp-2 mb-2 group-hover:text-[#C19A5B] transition-colors duration-200">
              {productData.name}
            </h3>

            {/* PRICE - Secondary to title */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-inter font-semibold text-[15px] text-[#1A1512]">
                ₹{productData.price.toLocaleString()}
              </span>
              {productData.originalPrice &&
                productData.originalPrice > productData.price && (
                  <>
                    <span className="text-[12px] text-[#1A1512]/40 line-through">
                      ₹{productData.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      -{Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}%
                    </span>
                  </>
                )}
            </div>
            {madeToOrder && (
              <p className="text-[11px] font-medium text-[#A07840] mb-2">
                Recreated in {MADE_TO_ORDER_DAYS}
              </p>
            )}

            {/* TRUST SIGNAL - Single, subtle, at bottom */}
            <div className="mt-auto pt-2 border-t border-[#C19A5B]/20">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-[#C19A5B] text-[#C19A5B]" />
                <span className="text-[11px] font-medium text-[#1A1512]/55 tracking-wide">
                  Artisan Crafted
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }
);

CuratedProductCard.displayName = "CuratedProductCard";

// Skeleton Loader - Matches card structure
export const CuratedProductCardSkeleton = () => (
  <div className="flex flex-col w-full max-w-[280px] bg-card border border-[#E8DDD0] rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[4/5] max-h-[200px] bg-[#E8DDD0]/40" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-[#E8DDD0]/50 rounded w-full" />
      <div className="h-4 bg-[#E8DDD0]/50 rounded w-3/4" />
      <div className="h-4 bg-[#E8DDD0]/40 rounded w-1/2 mt-1" />
      <div className="pt-2 border-t border-[#E8DDD0]/40">
        <div className="h-3 bg-[#E8DDD0]/40 rounded w-2/5" />
      </div>
    </div>
  </div>
);
