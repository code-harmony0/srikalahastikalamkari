"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/shared/hooks/use-products";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Package, Star } from "lucide-react";
import { formatPrice } from "@/shared/utils";
import { toast } from "sonner";

type Product = {
  _id: string;
  slug?: string;
  title?: string;
  description?: string;
  mainImage?: string;
  price?: number;
  stockQuantity?: number;
  availableSizes?: string;
  isFeatured?: boolean;
};

export default function WishlistPage() {
  const { data: products = [], isLoading } = useProducts();
  const wishlist = useWishlistStore();
  const cart = useCartStore();

  const wishlistItems = useMemo(
    () =>
      wishlist.items
        .map((item) => products.find((p) => p._id === item.productId))
        .filter((p): p is Product => Boolean(p)),
    [wishlist.items, products]
  );

  const handleRemoveFromWishlist = (productId: string) => {
    wishlist.toggleItem(productId);
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (product: Product) => {
    cart.addItem(product);
    toast.success("Added to cart");
  };

  const handleAddAllToCart = () => {
    wishlistItems.forEach((product) => {
      if (product) cart.addItem(product);
    });
    toast.success(`Added ${wishlistItems.length} items to cart`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 sm:px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border border-border"
        >
          <Package className="w-12 h-12 text-primary/50" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-4 text-foreground">
            Your wishlist is empty
          </h1>
          <p className="font-paragraph text-center max-w-md text-base sm:text-lg leading-relaxed mb-8 text-muted-foreground">
            Discover our beautiful collection of handcrafted Kalamkari sarees and add your favorites to your wishlist.
          </p>

          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-sm font-paragraph font-medium transition-all duration-300 flex items-center gap-2 mx-auto bg-primary text-background"
            >
              <ShoppingBag className="w-5 h-5" />
              Explore Collection
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 fill-current text-primary" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
                My Wishlist
              </h1>
            </div>

            <p className="text-lg font-paragraph max-w-2xl mx-auto mb-4 text-muted-foreground">
              Your carefully curated collection of beautiful Kalamkari sarees
            </p>

            <div className="flex items-center justify-center gap-2">
              <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md rounded-lg shadow-md border border-border">
                <span className="text-sm font-semibold text-primary">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Back to Shop & Add All */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-paragraph transition-opacity text-primary hover:opacity-80"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </motion.div>

          {wishlistItems.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddAllToCart}
              className="px-6 py-2 border border-primary rounded-sm font-paragraph font-medium transition-all duration-300 flex items-center gap-2 text-primary hover:bg-primary/5"
            >
              <ShoppingBag className="w-4 h-4" />
              Add All to Cart
            </motion.button>
          )}
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence>
            {wishlistItems.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-border"
              >
                {/* Product Image */}
                <Link href={`/products/${product.slug || product._id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={product.mainImage || "/placeholder.png"}
                      alt={product.title || "Product"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromWishlist(product._id);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors border border-border"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </motion.button>

                    {/* Featured Badge */}
                    {product.isFeatured && (
                      <div className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full shadow-md flex items-center gap-1 bg-primary text-background">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </div>
                    )}

                    {/* Stock Status */}
                    {(product.stockQuantity || 0) <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="px-4 py-2 text-xs font-semibold rounded-full bg-destructive text-white">
                          Out of Stock
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Details */}
                <div className="p-4 md:p-6">
                  <Link href={`/products/${product.slug || product._id}`}>
                    <h3 className="font-heading font-bold text-lg mb-1 line-clamp-2 transition-colors cursor-pointer text-foreground hover:text-primary">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-sm font-paragraph line-clamp-2 mb-3 text-muted-foreground">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-heading font-bold text-primary">
                      {formatPrice(product.price || 0)}
                    </span>
                  </div>

                  {/* Available Sizes */}
                  {product.availableSizes && (
                    <div className="mb-4">
                      <p className="text-xs font-paragraph mb-1 text-muted-foreground">
                        Available Sizes:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.availableSizes.split(",").map((size, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted-foreground/10 text-muted-foreground border border-border"
                          >
                            {size.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stock Status Text */}
                  {product.stockQuantity && product.stockQuantity > 0 ? (
                    <p className="text-xs font-paragraph mb-4 text-green-500">
                      In Stock ({product.stockQuantity} available)
                    </p>
                  ) : (
                    <p className="text-xs font-paragraph mb-4 text-destructive">
                      Out of Stock
                    </p>
                  )}

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(product)}
                    disabled={(product.stockQuantity || 0) <= 0}
                    className="w-full py-2.5 rounded-sm font-paragraph font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-background disabled:bg-muted"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Continue Shopping Section */}
        {wishlistItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12 pt-8 border-t border-border"
          >
            <h3 className="text-xl font-heading font-bold mb-4 text-foreground">
              Discover More Beautiful Sarees
            </h3>

            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 border border-primary rounded-sm font-paragraph font-medium transition-all duration-300 flex items-center gap-2 mx-auto text-primary hover:bg-primary/5"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
