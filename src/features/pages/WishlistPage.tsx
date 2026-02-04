"use client";

import { useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProducts } from "@/shared/hooks/use-products";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatPrice } from "@/shared/utils";

export default function WishlistPage() {
  const { data: products = [], isLoading } = useAllProducts();
  const wishlist = useWishlistStore();
  const cart = useCartStore();

  // 🛍 Merge Wishlist Items with Product Data
  const wishlistItems = useMemo(
    () => {
      if (!products.length) return [];
      return wishlist.items
        .map((item) => products.find((p: any) => p.id === item))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));
    },
    [wishlist.items, products],
  );

  // 🧹 CLEANUP: Remove stale IDs from store that don't exist in DB
  useEffect(() => {
    if (!isLoading && products.length > 0 && wishlist.items.length > 0) {
      const validIds = new Set(products.map((p: any) => p.id));
      wishlist.items.forEach((id) => {
        if (!validIds.has(id)) {
          wishlist.removeItem(id);
        }
      });
    }
  }, [isLoading, products, wishlist]);

  // Handlers
  const handleRemove = (id: string, name: string) => {
    wishlist.removeItem(id);
    toast("Removed from wishlist 💔", {
      description: `${name} has been removed.`,
    });
  };

  const handleAddToCart = (product: any) => {
    cart.addItem(product, 1);
    wishlist.removeItem(product.id);
    toast.success("Moved to cart 👜");
  };

  const handleAddAll = () => {
    let count = 0;
    wishlistItems.forEach((p) => {
      if ((p.stock_quantity || 0) > 0) {
        cart.addItem(p, 1);
        count++;
      }
    });
    wishlist.clearWishlist();
    if (count > 0) {
      toast.success(`Moved ${count} items to cart 🛍️`);
    } else {
      toast.error("No items available to move");
    }
  };

  // 🌀 LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFF8F0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#C19A5B]/30 border-t-[#A4552A] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 🪶 EMPTY STATE
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#FFF2E0] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-[#FFF4E8] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C19A5B]/30 shadow-sm">
            <Heart className="w-8 h-8 text-[#C19A5B]" strokeWidth={1.5} />
          </div>

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B2C23] mb-3">
            Your wishlist is empty
          </h1>
          <p className="font-inter text-[#3B2C23]/60 mb-8 leading-relaxed text-base">
            Discover our handcrafted collections and save your favorites here.
          </p>

          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-[#A4552A] text-[#FFF8F0] rounded-lg font-inter font-bold tracking-widest text-xs uppercase shadow-[0_4px_12px_rgba(164,85,42,0.25)] hover:bg-[#8B3F20] transition-all flex items-center gap-2 mx-auto"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* 🏛 HEADER SECTION (Matches Cart Header) */}
      <section className="relative h-[160px] md:h-[180px] bg-gradient-to-b from-[#FFF8F0] to-[#FFF4E8] flex flex-col items-center justify-center text-center px-6 border-b border-[#EAD6C3]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex flex-col items-center"
        >
          <Heart
            className="w-8 h-8 text-[#A4552A] mb-3 opacity-90 fill-[#A4552A]/5"
            strokeWidth={1.5}
          />

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B2C23] mb-2">
            My Wishlist
          </h1>
          <p className="font-inter text-[#3B2C23]/60 text-sm md:text-base mb-4 font-light">
            Your curated collection of beautiful Srikalahasti Kalamkari sarees
          </p>

          <div className="w-16 h-[2px] bg-gradient-to-r from-[#C19A5B] to-[#A4552A] rounded-full" />
        </motion.div>
      </section>

      {/* 📦 MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-[#A4552A] font-inter text-sm font-medium hover:text-[#8B3F20] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b border-transparent group-hover:border-[#A4552A]">
              Continue Shopping
            </span>
          </Link>

          <button
            onClick={handleAddAll}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#A4552A] text-[#FFF8F0] rounded-[8px] font-inter text-xs font-bold uppercase tracking-widest shadow-[0_2px_8px_rgba(164,85,42,0.2)] hover:bg-[#8B3F20] hover:shadow-[0_4px_12px_rgba(164,85,42,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Add All to Cart
          </button>
        </div>

        {/* WISHLIST GRID */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((product) => {
              const inStock = (product.stock_quantity || 0) > 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 },
                  }}
                  className="group bg-white rounded-[14px] border border-[#EAD6C3] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#C19A5B]/60 hover:shadow-[0_8px_24px_rgba(164,85,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Image Container */}
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="relative block aspect-[3/4] bg-[#FDFBF7] overflow-hidden border-b border-[#EAD6C3]/50"
                  >
                    <Image
                      src={
                        product.mainImage || product.image || "/placeholder.png"
                      }
                      alt={product.title || product.name || "Product"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-[#3B2C23]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(
                          product.id,
                          product.title || product.name || "Unknown Product",
                        );
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-[#3B2C23]/60 border border-[#EAD6C3] shadow-sm hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Link>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="block mb-1"
                    >
                      <h3 className="font-playfair font-bold text-[#3B2C23] text-[16px] leading-tight line-clamp-1 group-hover:text-[#A4552A] transition-colors">
                        {product.title || product.name}
                      </h3>
                    </Link>
                    <p className="font-inter text-[#3B2C23]/60 text-xs line-clamp-1 mb-4">
                      {product.description || "Hand-painted natural dyes"}
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-inter font-bold text-[#A4552A] text-[16px]">
                          {formatPrice(product.price || 0)}
                        </span>

                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border",
                            inStock
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-500 border-gray-200",
                          )}
                        >
                          {inStock ? "In Stock" : "Sold Out"}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!inStock}
                        className="w-full h-10 bg-[#A4552A] text-[#FFF8F0] rounded-[8px] font-inter text-[11px] font-bold uppercase tracking-wider hover:bg-[#8B3F20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#EAD6C3] flex items-center justify-center gap-2 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {inStock ? "Add to Cart" : "Unavailable"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
