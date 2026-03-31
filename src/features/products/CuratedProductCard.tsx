"use client";

import React, { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/shared/cart-store";
import { toast } from "sonner";
import { Product } from "@/shared/types";
import { cn } from "@/shared/utils";
import { getOptimizedImageUrl, IMAGE_SIZES, getResponsiveSizes } from "@/lib/image-utils";

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
        // Optimized for hero/curated section (larger images)
        image: getOptimizedImageUrl(
          product.image || product.mainImage || product.images?.[0],
          IMAGE_SIZES.productHero
        ),
      }),
      [product]
    );

    const productUrl = `/products/${product.slug || product.id}`;

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.in_stock) {
        toast.error("Out of stock");
        return;
      }
      const maxStock = product.stock_quantity ?? product.quantity ?? 0;
      const existingItem = cart.items.find((i) => i.productId === product.id);
      const currentQty = existingItem?.quantity ?? 0;
      if (currentQty >= maxStock) {
        toast.error(`Only ${maxStock} in stock`);
        return;
      }
      cart.addItem(product, 1);
      toast.success("Added to cart");
    };

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
          "bg-[#FFFCF8] border border-[#E8DDD0]",
          "rounded-xl overflow-hidden",
          "shadow-[0_2px_8px_rgba(59,44,35,0.06)]",
          "transition-shadow duration-300"
        )}
      >
        {/* Entire card is clickable */}
        <Link href={productUrl} className="flex flex-col h-full">
          {/* IMAGE AREA - Inside card, max 55-60% height */}
          <div className="relative aspect-[4/5] max-h-[200px] overflow-hidden bg-[#F8F4EF]">
            <Image
              src={productData.image}
              alt={productData.name}
              fill
              className={cn(
                "object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]",
                !product.in_stock && "grayscale-[30%] brightness-95"
              )}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
              loading="lazy"
            />

            {/* OUT OF STOCK - Bottom strip indicator */}
            {!product.in_stock && (
              <>
                <div className="absolute inset-0 bg-[#3B2C23]/15 z-15 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                  <div className="bg-[#3B2C23]/80 backdrop-blur-[2px] py-1.5 flex items-center justify-center">
                    <span className="text-[#C19A5B] text-[10px] font-semibold tracking-[0.12em] uppercase">
                      Out of Stock
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Badges - top-left (only when in stock) */}
            {badge && product.in_stock !== false && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#3B2C23]/80 text-[#FFF8F0] text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide">
                  {badge}
                </span>
              </div>
            )}

            {/* Quick Add - Corner icon (hidden when out of stock) */}
            {product.in_stock && (
              <button
                onClick={handleAddToCart}
                className={cn(
                  "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
                  "bg-white text-[#3B2C23] shadow-md",
                  "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                  "transition-all duration-300",
                  "hover:bg-[#A4552A] hover:text-white"
                )}
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* CONTENT AREA - Padded, structured */}
          <div className="flex flex-col flex-1 p-4">
            {/* PRODUCT TITLE - PRIMARY, visually dominant */}
            <h3 className="font-playfair font-semibold text-[16px] md:text-[17px] leading-snug text-[#3B2C23] line-clamp-2 mb-2 group-hover:text-[#A4552A] transition-colors duration-200">
              {productData.name}
            </h3>

            {/* PRICE - Secondary to title */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-inter font-semibold text-[15px] text-[#A4552A]">
                ₹{productData.price.toLocaleString()}
              </span>
              {productData.originalPrice &&
                productData.originalPrice > productData.price && (
                  <>
                    <span className="text-[12px] text-[#3B2C23]/40 line-through">
                      ₹{productData.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      -{Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}%
                    </span>
                  </>
                )}
            </div>

            {/* TRUST SIGNAL - Single, subtle, at bottom */}
            <div className="mt-auto pt-2 border-t border-[#E8DDD0]/60">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-[#C19A5B] text-[#C19A5B]" />
                <span className="text-[11px] font-medium text-[#3B2C23]/55 tracking-wide">
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
  <div className="flex flex-col w-full max-w-[280px] bg-[#FFFCF8] border border-[#E8DDD0] rounded-xl overflow-hidden animate-pulse">
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
