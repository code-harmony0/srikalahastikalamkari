"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAllProducts } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/shared/utils";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import { ShippingWidget } from "./ShippingWidget";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  getStockQuantity,
  isMadeToOrder,
} from "@/shared/lib/inventory";

export default function CartPage() {
  const { data: products = [] } = useAllProducts();
  const cart = useCartStore();

  // 🛍 Merge Cart Items with Product Data
  const cartItems = useMemo(() => {
    if (!products.length) return [];
    return cart.items
      .map((item) => {
        const product = products.find((p: any) => p.id === item.productId);
        return { ...item, product };
      })
      .filter(
        (
          item,
        ): item is typeof item & {
          product: NonNullable<typeof item.product>;
        } => Boolean(item.product),
      );
  }, [cart.items, products]);

  // 🧹 CLEANUP: Remove stale IDs from store that don't exist in DB
  useEffect(() => {
    if (products.length > 0 && cart.items.length > 0) {
      const validIds = new Set(products.map((p: any) => p.id));
      cart.items.forEach((item) => {
        if (!validIds.has(item.productId)) {
          cart.removeItem(item.productId);
        }
      });
    }
  }, [products, cart]);

  // 💰 Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price || 0) * item.quantity;
    }, 0);
  }, [cartItems]);

  // Free shipping logic for the summary
  const shipping = 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  // Handlers
  const handleUpdateQuantity = (
    productId: string,
    newQuantity: number,
    maxQuantity: number,
    madeToOrder = false,
  ) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxQuantity) {
      toast.error(
        madeToOrder
          ? `Made-to-order quantity is limited to ${maxQuantity}`
          : `Only ${maxQuantity} items available in stock`,
      );
      return;
    }
    cart.updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string, name: string) => {
    cart.removeItem(productId);
    toast("Removed from cart 🗑️", {
      description: `${name} has been removed.`,
    });
  };

  // 🪶 EMPTY STATE
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C19A5B]/30 shadow-sm">
            <ShoppingBag className="w-8 h-8 text-[#C19A5B]" strokeWidth={1.5} />
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1A1512] mb-3">
            Your cart is empty
          </h1>
          <p className="font-sans text-[#1A1512]/60 mb-8 leading-relaxed text-base">
            Explore our handcrafted collections to find your favorite pieces.
          </p>

          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-[#1A1512] text-white hover:bg-[#C19A5B] hover:text-white rounded-[4px] font-sans font-bold tracking-widest text-[11px] uppercase transition-all duration-300 shadow-md flex items-center gap-2 mx-auto"
            >
              Browse Collection <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* 🏛 HEADER SECTION */}
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
            Your Selection
          </span>

          <h1 className="font-serif text-[32px] md:text-[40px] font-bold text-white tracking-wide leading-tight mb-2 uppercase">
            Shopping <span className="italic text-[#C19A5B] font-normal lowercase">cart</span>
          </h1>

          <p className="font-sans text-white/70 text-[13px] md:text-[14px] font-light tracking-wide max-w-[600px] leading-relaxed">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready for checkout
          </p>
        </motion.div>
      </section>

      {/* 🛍 CART GRID */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Product List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <AnimatePresence mode="popLayout">
              {cartItems.map(({ productId, quantity, product }) => {
                const imageRef =
                  getImageTier(product.images, "thumb", 0) ||
                  product.image ||
                  product.mainImage ||
                  null;
                const productName = product.name || "Unknown Product";
                const stock = getStockQuantity(product);
                const madeToOrder = isMadeToOrder(product);
                const purchasableLimit = getPurchasableQuantityLimit(product);
                const productLink = `/products/${product.slug || product.id}`;
                const originalPrice = product.original_price;

                return (
                  <motion.div
                    key={productId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="group bg-white rounded-[12px] border border-[#C19A5B]/20 p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#C19A5B]/60 hover:shadow-[0_4px_12px_rgba(26,21,18,0.06)] transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                  >
                    {/* Image */}
                    <Link href={productLink} className="relative shrink-0">
                      <div className="relative w-24 h-24 rounded-[10px] overflow-hidden border border-[#EAD6C3] bg-[#FDFBF7]">
                        <OptimizedImage
                          src={imageRef}
                          alt={productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          imageType="cartItem"
                          sizes="96px"
                          loading="lazy"
                          placeholder="empty"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <Link href={productLink}>
                          <h3 className="font-serif font-bold text-[#1A1512] text-[15px] leading-tight hover:text-[#C19A5B] transition-colors">
                            {productName}
                          </h3>
                        </Link>
                        <p className="font-sans text-[#1A1512]/60 text-xs line-clamp-1 max-w-[200px]">
                          {product.description || "Hand-painted Srikalahasti Kalamkari"}
                        </p>
                        {madeToOrder && (
                          <p className="text-[11px] font-semibold text-[#A07840] mt-1">
                            Made to order · delivery in {MADE_TO_ORDER_DAYS}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <p className="font-sans text-[#1A1512] font-bold text-[15px]">
                            {formatPrice(product.price || 0)}
                          </p>
                          {originalPrice &&
                            originalPrice > (product.price || 0) && (
                              <p className="font-sans text-[#1A1512]/40 text-[12px] line-through decoration-[#1A1512]/50">
                                {formatPrice(originalPrice)}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                        {/* Quantity */}
                        <div className="flex items-center bg-white rounded-[4px] border border-[#C19A5B]/30 h-9">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                productId,
                                quantity - 1,
                                purchasableLimit,
                                madeToOrder,
                              )
                            }
                            disabled={quantity <= 1}
                            className="w-8 h-full flex items-center justify-center text-[#1A1512] hover:bg-[#C19A5B]/10 disabled:opacity-30 rounded-l-[4px] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-sans font-semibold text-[#1A1512] text-sm">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                productId,
                                quantity + 1,
                                purchasableLimit,
                                madeToOrder,
                              )
                            }
                            disabled={quantity >= purchasableLimit}
                            className="w-8 h-full flex items-center justify-center text-[#1A1512] hover:bg-[#C19A5B]/10 disabled:opacity-30 rounded-r-[4px] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() =>
                            handleRemoveItem(productId, productName)
                          }
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C19A5B]/20 text-[#1A1512]/60 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-[#C19A5B] font-sans text-sm font-semibold hover:text-[#1A1512] transition-colors group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>

          {/* RIGHT: Order Summary & Shipping Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* 1. Order Summary Card */}
            <div className="bg-white rounded-[12px] border border-[#C19A5B]/20 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 md:p-7 z-10">
              <h2 className="font-serif font-bold text-[#1A1512] text-xl mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-[#C19A5B]/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[#1A1512]/70">Subtotal</span>
                  <span className="font-sans font-medium text-[#1A1512]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[#1A1512]/70">Shipping</span>
                  <span
                    className={cn(
                      "font-sans font-medium",
                      shipping === 0 ? "text-green-600" : "text-[#1A1512]",
                    )}
                  >
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans text-[#1A1512]/70">GST (5%)</span>
                  <span className="font-sans font-medium text-[#1A1512]">
                    {formatPrice(tax)}
                  </span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="bg-[#EBF7EF] border border-green-200/50 rounded-[4px] p-3 mb-6 flex items-center gap-2.5 text-green-700">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    Free shipping unlocked!
                  </span>
                </div>
              )}

              {cartItems.some(({ product }) => isMadeToOrder(product)) && (
                <div className="bg-[#FFF7E8] border border-[#C19A5B]/30 rounded-[4px] p-3 mb-6 text-[#1A1512]">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#A07840]">
                    Made-to-order item included
                  </p>
                  <p className="text-xs text-[#1A1512]/70 mt-1 leading-relaxed">
                    Sold-out pieces can still be ordered. They will be recreated and delivered in {MADE_TO_ORDER_DAYS}.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mb-8">
                <span className="font-serif font-bold text-[#1A1512] text-lg">
                  Total
                </span>
                <span className="font-serif font-bold text-[#C19A5B] text-2xl">
                  {formatPrice(total)}
                </span>
              </div>

              <Link href="/checkout" className="block">
                <button className="w-full bg-[#1A1512] text-white hover:bg-[#C19A5B] py-3.5 rounded-[4px] font-sans font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all duration-300">
                  Proceed to Checkout
                </button>
              </Link>
            </div>

            {/* 2. 🆕 New Shipping Widget (Placed Below) */}
            <ShippingWidget subtotal={subtotal} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
