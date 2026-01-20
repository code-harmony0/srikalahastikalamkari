"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProductBySlug, useProducts } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { useWishlistStore } from "@/shared/wishlist-store";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Label } from "@/shared/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import {
  Heart,
  Share2,
  ChevronLeft,
  ShoppingBag,
  Star,
  Shield,
  Truck,
  Check,
  X,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/shared/utils";

interface ProductDetailProps {
  slug: string;
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: allProducts } = useProducts();

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const cart = useCartStore();
  const wishlist = useWishlistStore();

  const reviews = [
    {
      id: "1",
      customerName: "Priya Sharma",
      rating: 5,
      reviewText: "Absolutely stunning saree! The craftsmanship is exceptional and the colors are vibrant. The Kalamkari work is incredibly detailed and authentic. I wore it to a wedding and received so many compliments. The fabric drapes beautifully and feels luxurious. Worth every penny!",
      reviewDate: new Date("2024-12-15"),
      isVerifiedPurchase: true,
    },
    {
      id: "2",
      customerName: "Anjali Mehta",
      rating: 5,
      reviewText: "Beautiful traditional work that showcases true Indian artistry. The fabric quality is excellent - soft yet sturdy, and drapes beautifully. The natural dyes give it such an elegant, timeless look. Packaging was premium and delivery was prompt. Highly recommend to anyone looking for authentic Kalamkari!",
      reviewDate: new Date("2024-12-10"),
      isVerifiedPurchase: true,
    },
    {
      id: "3",
      customerName: "Sneha Patel",
      rating: 4,
      reviewText: "Lovely piece with intricate hand-painted details. The colors are more vibrant in person which I love! Shipping was fast and the saree came beautifully packaged in a reusable cotton bag. Only minor point - wish there were more color options. Overall very satisfied with my purchase.",
      reviewDate: new Date("2024-12-05"),
      isVerifiedPurchase: true,
    },
    {
      id: "4",
      customerName: "Kavita Reddy",
      rating: 5,
      reviewText: "This is my third purchase from Shri Kailash Kalamkari and they never disappoint! The quality is consistently excellent. The natural dyes give such a rich, earthy look that improves with each wash. Supporting authentic artisan work feels great. Already planning my next purchase!",
      reviewDate: new Date("2024-11-28"),
      isVerifiedPurchase: true,
    },
  ];

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Product not found
        </h1>
        <Link href="/products">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const availableSizes = product.availableSizes?.split(",").map((s) => s.trim()) || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "4.5";
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const stockCount = product.stock_quantity || 8;
  const galleryImages = product.mainImage ? [product.mainImage] : [];
  const relatedProducts = allProducts?.filter((p) => p.id !== product.id && p.isFeatured).slice(0, 4) || [];
  const isInWishlist = wishlist.isInWishlist(product.id);

  const handleAddToCart = () => {
    cart.addItem({
      ...product,
      selectedVariant: selectedVariant
    }, quantity);
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const handleToggleWishlist = () => {
    wishlist.toggleItem(product.id);
    toast.success(wishlist.isInWishlist(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Sticky Add to Cart Bar */}
      {showStickyBar && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 py-3"
        >
          <div className="max-w-[100rem] mx-auto px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {product.mainImage && (
                <Image
                  src={product.mainImage}
                  alt={product.title || "Product"}
                  className="w-12 h-12 object-cover rounded"
                  width={48}
                  height={48}
                />
              )}
              <div>
                <h3 className="font-heading font-semibold text-foreground text-sm">{product.title}</h3>
                <p className="text-primary font-bold">{formatPrice(product.price || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors text-sm"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 h-auto rounded-sm"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Link href="/products" className="hover:text-primary transition-colors">
                Shop
              </Link>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px] md:max-w-none">{product.title}</span>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Image Gallery - 60% */}
          <div className="lg:col-span-7">
            {product.mainImage && (
              <div className="sticky top-4">
                <motion.div className="relative overflow-hidden rounded-lg bg-white" layoutId="product-image">
                  <Image
                    src={product.mainImage}
                    alt={product.title || "Product"}
                    className="w-full h-[500px] md:h-[600px] object-cover cursor-pointer"
                    width={600}
                    height={600}
                    onClick={() => setIsModalOpen(true)}
                  />
                </motion.div>
              </div>
            )}
          </div>

          {/* Product Info - 40% */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Title and Rating */}
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                  {product.title}
                </h1>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(avgRating))
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{avgRating}</span>
                  <span className="text-sm text-foreground/60">({reviews.length} reviews)</span>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Price and Badges */}
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice((product.price || 0) + (selectedVariant?.price_modifier || 0))}
                </p>
                {product.is_featured && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Stock and Shipping */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground/70">{stockCount} in stock</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700 font-medium">
                    Free shipping on orders over ₹2,000
                  </span>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Description */}
              <p className="text-sm text-foreground/70 font-paragraph leading-relaxed line-clamp-3">
                {product.description}
              </p>

              <Separator className="my-3" />

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wider">Select Variant</Label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v: any) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`
                            px-4 py-2 text-sm font-medium rounded-lg border transition-all
                            ${selectedVariant?.id === v.id
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                              : "border-gray-200 text-foreground hover:border-primary"
                            }
                          `}
                        >
                          {v.size && v.color ? `${v.size} / ${v.color}` : v.size || v.color || v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 block">Quantity</Label>
                <div className="flex items-center gap-2 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold text-foreground w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base rounded-sm font-paragraph"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </motion.div>

                <div className="flex gap-2">
                  <motion.button
                    onClick={handleToggleWishlist}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 border rounded-sm flex items-center justify-center transition-colors ${
                      isInWishlist
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-300 text-foreground/70 hover:border-primary"
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isInWishlist ? "currentColor" : "none"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 border border-gray-300 rounded-sm flex items-center justify-center text-foreground/70 hover:border-primary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-2 pt-2 text-xs text-foreground/70">
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 flex-shrink-0" />
                  <span>Delivery: 3-5 business days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 flex-shrink-0" />
                  <span>Secure SSL checkout</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Accordion */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-lg font-heading font-semibold text-foreground hover:text-primary">
                Product Details
              </AccordionTrigger>
              <AccordionContent className="space-y-6">
                <p className="text-foreground/70 font-paragraph leading-relaxed">
                  {product.description}
                </p>

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-6 border rounded-xl overflow-hidden bg-white/50">
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, value], idx) => (
                          <tr key={key} className={idx % 2 === 0 ? "bg-slate-50/50" : ""}>
                            <td className="px-4 py-3 font-semibold text-slate-600 uppercase text-[10px] tracking-wider border-r border-slate-100 w-1/3">
                              {key}
                            </td>
                            <td className="px-4 py-3 text-slate-800">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="material">
              <AccordionTrigger className="text-lg font-heading font-semibold text-foreground hover:text-primary">
                Material & Craft
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 font-paragraph leading-relaxed">
                This exquisite Kalamkari saree is hand-painted using traditional techniques with natural dyes. Each piece is a unique work of art, meticulously crafted by skilled artisans. The saree features intricate patterns inspired by nature and cultural motifs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="care">
              <AccordionTrigger className="text-lg font-heading font-semibold text-foreground hover:text-primary">
                Care Instructions
              </AccordionTrigger>
              <AccordionContent>
                <ul className="text-foreground/70 font-paragraph leading-relaxed space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Dry clean recommended for best results
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Hand wash in cold water with mild detergent if preferred
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Avoid direct sunlight while drying
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Iron on low heat on the reverse side
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Store in a cool, dry place away from moisture
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="shipping">
              <AccordionTrigger className="text-lg font-heading font-semibold text-foreground hover:text-primary">
                Shipping & Returns
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 font-paragraph leading-relaxed space-y-2">
                <p>• Free shipping on orders over ₹2,000</p>
                <p>• Standard delivery: 3-5 business days</p>
                <p>• Express delivery available for ₹200</p>
                <p>• 30-day return policy</p>
                <p>• Easy exchanges for size or color</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <motion.div key={relProduct.id} whileHover={{ y: -4 }} className="group">
                  <Link href={`/products/${relProduct.slug || relProduct.id}`}>
                    <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors mb-3">
                      {relProduct.mainImage && (
                        <Image
                          src={relProduct.mainImage}
                          alt={relProduct.title || "Product"}
                          className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={300}
                        />
                      )}
                      {relProduct.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm md:text-base font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {relProduct.title}
                    </h3>
                    <p className="text-primary font-bold text-sm md:text-base">
                      {formatPrice(relProduct.price || 0)}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Customer Reviews
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(avgRating))
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{avgRating}</span>
                  <span className="text-xs text-foreground/60">({reviews.length})</span>
                </div>
              )}
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4 mb-6">
              {displayedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-foreground text-sm">
                          {review.customerName}
                        </h3>
                        {review.isVerifiedPurchase && (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-foreground/60">
                        {review.reviewDate
                          ? new Date(review.reviewDate).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{review.rating}/5</span>
                  </div>

                  <p className="text-sm text-foreground/70 font-paragraph leading-relaxed">
                    {review.reviewText}
                  </p>

                  {index < displayedReviews.length - 1 && <Separator className="mt-3" />}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg border border-gray-200 text-center mb-6">
              <p className="text-foreground/60 font-paragraph text-sm">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}

          {reviews.length > 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full px-6 py-3 border border-primary text-primary rounded-sm font-paragraph font-medium hover:bg-primary/5 transition-colors"
            >
              {showAllReviews ? "Show Less Reviews" : `Show More Reviews (${reviews.length - 3} more)`}
            </motion.button>
          )}
        </section>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </motion.button>
              <Image
                src={product.mainImage || ""}
                alt={product.title || "Product"}
                className="w-full h-auto max-h-[80vh] object-contain"
                width={800}
                height={800}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
