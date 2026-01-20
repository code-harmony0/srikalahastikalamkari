"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Shield, Truck, Clock } from "lucide-react";
import { formatPrice } from "@/shared/utils";
import { toast } from "sonner";

export default function CartPage() {
  const { data: products = [] } = useProducts();
  const cart = useCartStore();

  const cartItems = useMemo(() => {
    return cart.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return { ...item, product };
    }).filter((item) => item.product);
  }, [cart.items, products]);

  const subtotal = useMemo(() => {
    return cart.getTotalPrice(products);
  }, [cart, products]);

  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    cart.updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    cart.removeItem(productId);
    toast.success("Item removed from cart");
  };

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 px-4"
        >
          <ShoppingBag className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
            Your cart is empty
          </h2>
          <p className="text-base text-foreground/70 font-paragraph mb-6">
            Explore our collection and add some beautiful sarees to your cart.
          </p>
          <Link href="/products">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-sm transition-all duration-300 hover:shadow-lg font-paragraph">
              Start Shopping
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-background/30 to-secondary/10 border-b border-gray-200 py-8 md:py-12">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
                Shopping Cart
              </h1>
            </div>
            <p className="text-base md:text-lg text-foreground/70 font-paragraph max-w-2xl mx-auto">
              {cart.getTotalItems()} {cart.getTotalItems() === 1 ? 'item' : 'items'} ready for checkout
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {cartItems.map(({ productId, quantity, product }, index) => {
                  if (!product) return null;

                  const stockLevel = product.stock_quantity || 10;
                  const isLowStock = stockLevel <= 5;

                  return (
                    <motion.div
                      key={productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      layout
                      className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <Image
                              src={product.mainImage || "/placeholder.png"}
                              alt={product.title || "Product"}
                              className="w-20 h-24 sm:w-24 sm:h-32 object-cover rounded-md border border-border"
                              width={96}
                              height={128}
                            />
                            {isLowStock && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                Low Stock
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Details - Aligned Row on Desktop */}
                        <div className="flex-grow w-full">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-heading font-bold text-foreground mb-1">
                                {product.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-secondary/10 rounded-lg p-1.5 border border-border/50">
                              <button
                                onClick={() => handleUpdateQuantity(productId, quantity - 1)}
                                disabled={quantity <= 1}
                                className="p-1 hover:bg-white rounded shadow-sm transition-all disabled:opacity-50 disabled:shadow-none"
                              >
                                <Minus className="w-3.5 h-3.5 text-foreground" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-foreground">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(productId, quantity + 1)}
                                disabled={quantity >= stockLevel}
                                className="p-1 hover:bg-white rounded shadow-sm transition-all disabled:opacity-50 disabled:shadow-none"
                              >
                                <Plus className="w-3.5 h-3.5 text-foreground" />
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-primary min-w-[5rem] text-right">
                                {formatPrice((product.price || 0) * quantity)}
                              </span>
                              <button
                                onClick={() => handleRemoveItem(productId)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-full"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Continue Shopping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-4"
            >
              <Link href="/products">
                <button className="border border-primary/50 hover:bg-primary/5 hover:border-primary group transition-all duration-300 px-4 py-2 rounded-sm font-paragraph text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70 font-paragraph">Subtotal</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70 font-paragraph">Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70 font-paragraph">Tax (5%)</span>
                  <span className="font-semibold text-foreground">{formatPrice(tax)}</span>
                </div>
              </div>

              {shipping === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Truck className="w-4 h-4" />
                    <span className="text-sm font-medium">Free shipping on orders over ₹5,000</span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-heading font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base rounded-sm font-paragraph transition-all duration-300 hover:shadow-lg">
                  Proceed to Checkout
                </button>
              </Link>

              {/* Trust Indicators */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Shield className="w-3 h-3" />
                  <span>Secure checkout with 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Clock className="w-3 h-3" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Summary */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-heading font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base rounded-sm font-paragraph">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
