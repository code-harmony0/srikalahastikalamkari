"use client";

import React, { memo, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Heart, CheckCircle2, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import { useCategories } from "@/shared/hooks/use-categories";
import { Product } from "@/shared/types";
import { getOptimizedImageUrl, IMAGE_SIZES, getResponsiveSizes, BLUR_DATA_URL } from "@/lib/image-utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  viewMode?: "grid" | "list";
}

export const ProductCard = memo(
  ({ product, index = 0, viewMode = "grid" }: ProductCardProps) => {
    // Memoized field mapping for better performance and type safety
    const productData = useMemo(
      () => ({
        name: product.name || product.title || "Unnamed Product",
        description: product.description || null,
        price: product.price || 0,
        originalPrice: product.original_price || product.originalPrice || null,
        images: product.images || [],
        image:
          product.image || product.mainImage || product.images?.[0] || null,
        slug: product.slug,
      }),
      [product],
    );

    const { data: categories } = useCategories();
    const categoryName = useMemo(() => {
      if (!categories?.data || !product.category_id) return "Uncategorized";
      const category = categories.data.find(
        (c: any) => c.id === product.category_id,
      );
      return category?.name || "Uncategorized";
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

    const isList = viewMode === "list";

    // Safe Image Access with Optimization
    const optimizedImage = useMemo(() => 
      getOptimizedImageUrl(productData.image, isList ? IMAGE_SIZES.productCardCompact : IMAGE_SIZES.productCard),
      [productData.image, isList]
    );
    
    const [imgSrc, setImgSrc] = React.useState(optimizedImage);
    
    // Update state if product changes
    React.useEffect(() => {
        setImgSrc(optimizedImage);
    }, [optimizedImage]);

    const mainImage = imgSrc;
    const hoverImage = useMemo(() => 
      productData.images && productData.images.length > 1
        ? getOptimizedImageUrl(productData.images[1], isList ? IMAGE_SIZES.productCardCompact : IMAGE_SIZES.productCard)
        : null,
      [productData.images, isList]
    );
    const productUrl = `/products/${product.slug || product.id}`;
    
    // Responsive sizes for different layouts
    const imageSizes = isList ? "180px" : getResponsiveSizes('grid');

    const cardVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, delay: index * 0.04 },
      },
    };

    return (
      <motion.div
        layout
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className={cn(
          "group relative bg-[#FFF8F0] border border-[#C19A5B]/20 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#C19A5B]/40",
          // 🛠 Compact List View: Fixed height 180px, Flex Row
          isList
            ? "rounded-lg flex flex-row h-[180px]"
            : "rounded-xl flex flex-col h-full",
        )}
      >
        {/* 1️⃣ IMAGE SECTION */}
        <div
          className={cn(
            "relative overflow-hidden bg-[#FDFBF7]",
            // 🛠 Compact List View: Width 180px
            isList ? "w-[180px] h-full shrink-0" : "w-full aspect-[4/5]",
          )}
        >
          <Link href={productUrl} className="block w-full h-full">
            {/* Secondary Image (Hover) */}
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={`${productData.name} alternate`}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                sizes={imageSizes}
                loading="lazy"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            )}

            {/* Main Image */}
            <Image
              src={mainImage}
              alt={productData.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out group-hover:scale-105",
                hoverImage ? "group-hover:opacity-0" : "",
              )}
              sizes={imageSizes}
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              onError={() => setImgSrc("/images/placeholder.png")}
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20 pointer-events-none">
            {!product.in_stock && (
              <span className="bg-gray-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider shadow-sm w-fit">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button (Grid View Only - List view has it in content) */}
          {!isList && (
            <button
              onClick={toggleWishlist}
              className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-white/90 text-[#3B2C23] hover:bg-[#A4552A] hover:text-white flex items-center justify-center shadow-sm transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
              title="Wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`}
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
                  "font-inter font-bold text-[#3B2C23] leading-tight group-hover/text:text-[#A4552A] transition-colors",
                  isList
                    ? "text-[15px] line-clamp-1"
                    : "text-[14px] line-clamp-2",
                )}
              >
                {productData.name}
              </h3>

              {/* Description: Only show in List view, limit to 2 lines */}
              {isList && (
                <p className="font-inter text-[12px] text-[#3B2C23]/60 leading-relaxed mt-1.5 line-clamp-2 pr-4">
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
                <p className="font-inter font-bold text-[15px] text-[#A4552A]">
                  ₹{productData.price.toLocaleString()}
                </p>
                {product.original_price &&
                  productData.originalPrice &&
                  productData.originalPrice > productData.price && (
                    <>
                      <span className="text-[11px] text-[#3B2C23]/40 line-through decoration-[#A4552A]/40">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                        -{Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
              </div>
              {product.stock_quantity && product.stock_quantity > 0 ? (
                <span className="text-[11px] font-medium text-[#3B2C23]/70 mt-0.5">
                  {product.stock_quantity} in stock
                </span>
              ) : null}

              {!isList && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#C19A5B] text-[#C19A5B]" />
                  <span className="text-[11px] font-medium text-[#3B2C23]/70">
                    4.8
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 relative z-10">
              {isList && (
                <button
                  onClick={toggleWishlist}
                  className="w-8 h-8 rounded-full border border-[#C19A5B]/20 text-[#3B2C23] hover:bg-[#FFF4E8] flex items-center justify-center transition-colors"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isWishlisted ? "fill-[#A4552A] text-[#A4552A]" : ""}`}
                  />
                </button>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className={cn(
                  "bg-[#A4552A] text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  // 🛠 Compact Button sizing
                  isList
                    ? "h-8 px-4 rounded-md text-[11px] font-bold uppercase tracking-wide hover:bg-[#8B3F20]"
                    : "w-8 h-8 rounded-full hover:bg-[#8B3F20]",
                )}
                title="Add to Cart"
              >
                {isList ? (
                  <>{product.in_stock ? "Add" : "Sold"}</>
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

ProductCard.displayName = "ProductCard";
