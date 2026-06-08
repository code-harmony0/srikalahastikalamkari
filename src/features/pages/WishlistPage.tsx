"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProducts } from "@/shared/hooks/use-products";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { useAuth } from "@/shared/contexts/AuthContext";
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
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";

export default function WishlistPage() {
  const router = useRouter()
  const { user: firebaseUser } = useAuth()
  const { data: products = [], isLoading } = useAllProducts();
  const wishlist = useWishlistStore();
  const cart = useCartStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (firebaseUser === null) {
      router.push("/login")
    }
  }, [firebaseUser, router])

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
      <div className="min-h-[60vh] flex items-center justify-center bg-background kalamkari-static-background silk-fabric-texture">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#C19A5B]/30 border-t-[#1A1512] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // 🪶 EMPTY STATE
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C19A5B]/30 shadow-sm">
            <Heart className="w-8 h-8 text-[#C19A5B]" strokeWidth={1.5} />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A1512] mb-3">
            Your wishlist is empty
          </h1>
          <p className="font-sans text-[#1A1512]/60 mb-8 leading-relaxed text-base">
            Discover our handcrafted collections and save your favorites here.
          </p>

          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-[#1A1512] text-white hover:bg-[#C19A5B] hover:text-white rounded-[4px] font-sans font-bold tracking-widest text-[11px] uppercase transition-all duration-300 shadow-md flex items-center gap-2 mx-auto"
            >
              Explore Collection <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* 🏛 HEADER SECTION (Matches Premium Dark Hero) */}
      <section className="relative w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden h-[180px] md:h-[220px] bg-[#1A1512]">
        <div className="absolute inset-0 z-[6] pointer-events-none">
          <div className="absolute top-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/30 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-2xl mx-auto"
        >
          <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-[#C19A5B] mb-2">
            Your Collection
          </span>

          <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-white tracking-wide leading-tight mb-2 uppercase">
            My <span className="italic text-[#C19A5B] font-normal lowercase">wishlist</span>
          </h1>

          <p className="font-sans text-white/70 text-[13px] md:text-[14px] font-light tracking-wide max-w-[600px] leading-relaxed">
            Your curated collection of beautiful Srikalahasti Kalamkari sarees
          </p>
        </motion.div>
      </section>

      {/* 📦 MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Link
            href="/products"
            className="group flex items-center gap-2 text-[#C19A5B] font-sans text-sm font-semibold hover:text-[#1A1512] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="border-b border-transparent group-hover:border-[#C19A5B]">
              Continue Shopping
            </span>
          </Link>

          <button
            onClick={handleAddAll}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1A1512] text-white hover:bg-[#C19A5B] rounded-[4px] font-sans text-xs font-bold uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                  className="group bg-white rounded-[12px] border border-[#C19A5B]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#C19A5B]/60 hover:shadow-[0_8px_24px_rgba(26,21,18,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Image Container */}
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    className="relative block aspect-[3/4] bg-[#FDFBF7] overflow-hidden border-b border-[#C19A5B]/10"
                  >
                    <OptimizedImage
                      src={
                        getImageTier(product.images, "thumb", 0) ||
                        product.mainImage ||
                        product.image ||
                        null
                      }
                      alt={product.title || product.name || "Product"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      imageType="productCard"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      placeholder="empty"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-[#1A1512]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(
                          product.id,
                          product.title || product.name || "Unknown Product",
                        );
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-[#1A1512]/60 border border-[#C19A5B]/20 shadow-sm hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
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
                      <h3 className="font-serif font-bold text-[#1A1512] text-[16px] leading-tight line-clamp-1 group-hover:text-[#C19A5B] transition-colors">
                        {product.title || product.name}
                      </h3>
                    </Link>
                    <p className="font-sans text-[#1A1512]/60 text-xs line-clamp-1 mb-4">
                      {product.description || "Hand-painted natural dyes"}
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-[#1A1512] text-[16px]">
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
                        className="w-full h-10 bg-[#1A1512] text-white hover:bg-[#C19A5B] rounded-[4px] font-sans text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 flex items-center justify-center gap-2 shadow-sm"
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
