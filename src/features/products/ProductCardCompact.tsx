"use client";

import React, { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import { useCategories } from "@/shared/hooks/use-categories";
import { Product } from "@/shared/types";

interface ProductCardCompactProps {
  product: Product;
  index?: number;
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
  ({ product, index = 0 }: ProductCardCompactProps) => {
    // Memoized field mapping
    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        image:
          product.image || product.mainImage || product.images?.[0] || null,
        slug: product.slug,
      }),
      [product]
    );

    const { data: categories } = useCategories();
    const categoryName = useMemo(() => {
      if (!categories?.data || !product.category_id) return null;
      const category = categories.data.find(
        (c: any) => c.id === product.category_id
      );
      return category?.name || null;
    }, [categories, product.category_id]);

    const wishlist = useWishlistStore();
    const cart = useCartStore();
    const isWishlisted = wishlist.items.includes(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isWishlisted) {
        wishlist.removeItem(product.id);
        toast.success("Removed from wishlist");
      } else {
        wishlist.addItem(product.id);
        toast.success("Added to wishlist");
      }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!product.in_stock) {
        toast.error("Out of stock");
        return;
      }

      cart.addItem(product, 1);
      toast.success("Added to cart");
    };

    const mainImage = productData.image || "/images/placeholder.png";
    const productUrl = `/products/${product.slug || product.id}`;

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

    return (
      <motion.article
        layout
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="group relative bg-card rounded-lg border border-accent/15 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/30 hover:-translate-y-0.5"
      >
        <Link href={productUrl} className="block">
          {/* IMAGE SECTION - Fixed 4:5 aspect ratio */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={mainImage}
              alt={productData.name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {/* Badges - Top Left */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {!product.in_stock && (
                <span className="bg-muted-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Sold Out
                </span>
              )}
            </div>

            {/* Wishlist Button - Top Right, always visible on mobile */}
            <button
              onClick={toggleWishlist}
              className={cn(
                "absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-background/90 backdrop-blur-sm shadow-sm",
                "md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0",
                isWishlisted
                  ? "text-primary"
                  : "text-foreground/60 hover:text-primary"
              )}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn("w-4 h-4", isWishlisted && "fill-current")}
              />
            </button>
          </div>

          {/* META SECTION - Compact info */}
          <div className="p-3 space-y-1.5">
            {/* Category - Small, muted */}
            {categoryName && (
              <span className="font-playfair italic text-accent text-[10px] leading-none block">
                {categoryName}
              </span>
            )}

            {/* Product Name - Primary visual anchor, max 2 lines */}
            <h3 className="font-inter font-semibold text-foreground text-[13px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {productData.name}
            </h3>

            {/* Price Row */}
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-inter font-bold text-primary text-[15px] leading-none">
                ₹{productData.price.toLocaleString()}
              </span>
              {productData.originalPrice &&
                productData.originalPrice > productData.price && (
                  <>
                    <span className="text-[11px] text-muted-foreground line-through">
                      ₹{productData.originalPrice.toLocaleString()}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        -{discountPercent}%
                      </span>
                    )}
                  </>
                )}
            </div>

            {/* Stock & Rating Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {/* Rating */}
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    4.8
                  </span>
                </div>

                {/* Stock indicator */}
                {product.stock_quantity !== undefined && product.stock_quantity > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {product.stock_quantity <= 5
                      ? `Only ${product.stock_quantity} left`
                      : "In stock"}
                  </span>
                )}
              </div>

              {/* Add to Cart - Compact icon button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                  "bg-primary text-primary-foreground shadow-sm",
                  "hover:bg-primary/90 hover:shadow-md",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1"
                )}
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Link>
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
  <div className="bg-card rounded-lg border border-accent/10 overflow-hidden animate-pulse">
    <div className="aspect-[4/5] bg-muted" />
    <div className="p-3 space-y-2">
      <div className="h-2 w-16 bg-muted rounded" />
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="w-8 h-8 bg-muted rounded-full" />
      </div>
    </div>
  </div>
);
