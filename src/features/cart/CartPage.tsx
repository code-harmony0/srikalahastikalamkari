"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/shared/hooks/use-products";
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

export default function CartPage() {
  const { data: productsData } = useProducts();
  const products = productsData?.data || [];
  const cart = useCartStore();

  // 🛍 Merge Cart Items with Product Data
  const cartItems = useMemo(() => {
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

  // 💰 Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price || 0) * item.quantity;
    }, 0);
  }, [cartItems]);

  // Free shipping logic for the summary
  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  // Handlers
  const handleUpdateQuantity = (
    productId: string,
    newQuantity: number,
    maxStock: number,
  ) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
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
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-[#FFF4E8] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C19A5B]/30 shadow-sm">
            <ShoppingBag className="w-8 h-8 text-[#C19A5B]" strokeWidth={1.5} />
          </div>

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B2C23] mb-3">
            Your cart is empty
          </h1>
          <p className="font-inter text-[#3B2C23]/60 mb-8 leading-relaxed text-base">
            Explore our handcrafted collections to find your favorite pieces.
          </p>

          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-[#A4552A] text-[#FFF8F0] rounded-lg font-inter font-bold tracking-widest text-xs uppercase shadow-lg shadow-[#A4552A]/20 hover:bg-[#8B3F20] transition-all flex items-center gap-2 mx-auto"
            >
              Browse Collection <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* 🏛 HEADER SECTION */}
      <section className="relative h-[160px] md:h-[180px] bg-gradient-to-b from-[#FFF8F0] to-[#FFF4E8] flex flex-col items-center justify-center text-center px-6 border-b border-[#EAD6C3]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 flex flex-col items-center"
        >
          <ShoppingBag
            className="w-8 h-8 text-[#A4552A] mb-3 opacity-90"
            strokeWidth={1.5}
          />

          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#3B2C23] mb-2">
            Shopping Cart
          </h1>
          <p className="font-inter text-[#3B2C23]/60 text-sm md:text-base mb-4 font-light">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready
            for checkout
          </p>

          <div className="w-16 h-[2px] bg-gradient-to-r from-[#C19A5B] to-[#A4552A] rounded-full" />
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
                // API Field Mapping
                const imageUrl =
                  product.image || product.images?.[0] || "/placeholder.png";
                const productName = product.name || "Unknown Product";
                const stock = product.stock_quantity || 0;
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
                    className="group bg-white rounded-[14px] border border-[#EAD6C3] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#C19A5B]/60 hover:shadow-[0_4px_12px_rgba(164,85,42,0.08)] transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                  >
                    {/* Image */}
                    <Link href={productLink} className="relative shrink-0">
                      <div className="w-24 h-24 rounded-[10px] overflow-hidden border border-[#EAD6C3] bg-[#FDFBF7]">
                        <Image
                          src={imageUrl}
                          alt={productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="96px"
                        />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <Link href={productLink}>
                          <h3 className="font-inter font-bold text-[#3B2C23] text-[15px] leading-tight hover:text-[#A4552A] transition-colors">
                            {productName}
                          </h3>
                        </Link>
                        <p className="font-inter text-[#3B2C23]/60 text-xs line-clamp-1 max-w-[200px]">
                          {product.description || "Hand-painted Srikalahasti Kalamkari"}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <p className="font-inter text-[#A4552A] font-bold text-[15px]">
                            {formatPrice(product.price || 0)}
                          </p>
                          {originalPrice &&
                            originalPrice > (product.price || 0) && (
                              <p className="font-inter text-[#3B2C23]/40 text-[12px] line-through decoration-[#A4552A]/50">
                                {formatPrice(originalPrice)}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                        {/* Quantity */}
                        <div className="flex items-center bg-[#FFF4E8] rounded-lg border border-[#C19A5B]/30 h-9">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                productId,
                                quantity - 1,
                                stock,
                              )
                            }
                            disabled={quantity <= 1}
                            className="w-8 h-full flex items-center justify-center text-[#A4552A] hover:bg-[#C19A5B]/10 disabled:opacity-30 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-inter font-semibold text-[#3B2C23] text-sm">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                productId,
                                quantity + 1,
                                stock,
                              )
                            }
                            disabled={quantity >= stock}
                            className="w-8 h-full flex items-center justify-center text-[#A4552A] hover:bg-[#C19A5B]/10 disabled:opacity-30 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() =>
                            handleRemoveItem(productId, productName)
                          }
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#EAD6C3] text-[#3B2C23]/60 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
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
                className="inline-flex items-center gap-2 text-[#A4552A] font-inter text-sm font-medium hover:text-[#8B3F20] transition-colors group"
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
            <div className="bg-white rounded-[14px] border border-[#EAD6C3] shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6 md:p-7 z-10">
              <h2 className="font-playfair font-bold text-[#3B2C23] text-xl mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-[#EAD6C3]">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-inter text-[#3B2C23]/70">Subtotal</span>
                  <span className="font-inter font-medium text-[#3B2C23]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-inter text-[#3B2C23]/70">Shipping</span>
                  <span
                    className={cn(
                      "font-inter font-medium",
                      shipping === 0 ? "text-green-600" : "text-[#3B2C23]",
                    )}
                  >
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-inter text-[#3B2C23]/70">GST (5%)</span>
                  <span className="font-inter font-medium text-[#3B2C23]">
                    {formatPrice(tax)}
                  </span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="bg-[#EBF7EF] border border-[#3FAF6C]/20 rounded-lg p-3 mb-6 flex items-center gap-2.5 text-[#2E7D4D]">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    Free shipping unlocked!
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mb-8">
                <span className="font-playfair font-bold text-[#3B2C23] text-lg">
                  Total
                </span>
                <span className="font-playfair font-bold text-[#A4552A] text-2xl">
                  {formatPrice(total)}
                </span>
              </div>

              <Link href="/checkout" className="block">
                <button className="w-full bg-[#A4552A] text-[#FFF8F0] py-3.5 rounded-lg font-inter font-bold text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(164,85,42,0.25)] hover:bg-[#8B3F20] hover:shadow-[0_6px_16px_rgba(164,85,42,0.35)] transition-all transform active:scale-[0.98]">
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
