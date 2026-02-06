"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useProductBySlug, useProducts, useProduct } from "@/shared/hooks/use-products"
import { useCartStore } from "@/shared/cart-store"
import { useWishlistStore } from "@/shared/wishlist-store"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion"
import {
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  Package,
  Minus,
  Plus,
  Check,
  X
} from "lucide-react"
import { toast } from "sonner"
import { formatPrice, cn } from "@/shared/utils"
import { getOptimizedImageUrl, IMAGE_SIZES, getResponsiveSizes } from "@/lib/image-utils"
import { ProductReviews } from "./ProductReviews"
import { useReviews } from "@/shared/hooks/use-reviews"
import { StockAlert, SavingsBadge } from "@/shared/components/UrgencyTriggers"

export default function ProductDetail() {
  const params = useParams()
  const slug = params?.slug as string
  
  const isUUID = slug ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) : false
  
  const { data: productBySlug, isLoading: loadingBySlug } = useProductBySlug(slug)
  const { data: productById, isLoading: loadingById } = useProduct(slug)
  
  const product = isUUID ? productById : productBySlug
  const isLoading = !slug ? true : (isUUID ? loadingById : loadingBySlug)
  const { data: relatedProductsData } = useProducts({ 
    category_id: product?.category_id,
    limit: 5 
  })
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const cart = useCartStore()
  const wishlist = useWishlistStore()

  const { averageRating, totalReviews } = useReviews(product?.id || "")

  // Derived Data - Optimize images for different contexts
  const productImages = useMemo(() => {
    const rawImages = product?.images?.length 
      ? product.images 
      : product?.mainImage 
        ? [product.mainImage] 
        : ["/images/products/product-placeholder.png"];
    return rawImages;
  }, [product?.images, product?.mainImage]);
  
  // Optimized main image (high quality for detail view)
  const mainProductImage = useMemo(() => 
    getOptimizedImageUrl(productImages[selectedImageIndex], IMAGE_SIZES.productDetail),
    [productImages, selectedImageIndex]
  );
  
  // Optimized thumbnails (small)
  const thumbnailImages = useMemo(() => 
    productImages.map(img => getOptimizedImageUrl(img, IMAGE_SIZES.thumbnail)),
    [productImages]
  );
  
  const relatedProducts = (relatedProductsData?.data || [])
    .filter((p) => p.id !== product?.id)
    .slice(0, 4)
  
  const isInWishlist = product ? wishlist.isInWishlist(product.id) : false
  const inStock = (product?.stock_quantity || 0) > 0

  // Handlers
  const handleAddToCart = () => {
    if (!product) return
    cart.addItem(product, quantity)
    toast.success(`Added ${quantity} item(s) to cart`)
  }

  const handleToggleWishlist = () => {
    if (!product) return
    wishlist.toggleItem(product.id)
    toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || product?.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-10 h-10 border-2 border-[#A4552A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center px-4">
        <Package className="h-12 w-12 text-[#C19A5B] mb-3" />
        <h1 className="font-playfair text-xl font-bold text-[#3B2C23] mb-2">Product Not Found</h1>
        <Link href="/products">
          <button className="text-[#A4552A] font-medium text-sm hover:underline underline-offset-4">
            Return to Shop
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      
      {/* ─────────────────────────────────────────────
          BREADCRUMB
      ────────────────────────────────────────────── */}
      <div className="border-b border-[#EAD6C3]/20 bg-white/50">
        <div className="max-w-[1380px] mx-auto px-4 md:px-6 py-3"> {/* Increased width */}
          <div className="flex items-center gap-2 text-[11px] text-[#7A6A5C] font-inter uppercase tracking-wide">
            <Link href="/" className="hover:text-[#A4552A] transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/products" className="hover:text-[#A4552A] transition-colors">Shop</Link>
            <span className="opacity-40">/</span>
            <span className="text-[#3B2C23] font-semibold truncate max-w-[200px]">{product.name || product.title}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          GLOBAL CONTAINER FOR CONTENT
          Max-width increased to 1380px to reduce side padding
      ────────────────────────────────────────────── */}
      <div className="max-w-[1380px] mx-auto px-4 md:px-6 pb-12">

        {/* ─────────────────────────────────────────────
            SECTION 1: PRODUCT HERO
        ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-8">
          
          {/* LEFT: GALLERY (7 Cols - Wider Image Area) */}
          <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 h-fit">
            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:h-[600px] scrollbar-hide shrink-0 py-1 px-1">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "relative w-16 h-20 lg:w-20 lg:h-24 rounded-[6px] overflow-hidden border transition-all shrink-0",
                      selectedImageIndex === idx
                        ? "border-[#A4552A] ring-1 ring-[#A4552A]/20"
                        : "border-[#EAD6C3]/30 hover:border-[#C19A5B]"
                    )}
                  >
                    <Image src={thumbnailImages[idx]} alt={`View ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative aspect-[4/5] bg-white rounded-[10px] overflow-hidden border border-[#EAD6C3]/20 shadow-sm group lg:h-[600px]">
              <Image
                src={mainProductImage}
                alt={product.name || product.title || "Product"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                sizes={getResponsiveSizes('detail')}
                priority
                onClick={() => setIsImageModalOpen(true)}
              />
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO (5 Cols - Content Area) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="sticky top-24 space-y-6">
              
              {/* Header Group */}
              <div className="space-y-2">
                <h1 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-[#3B2C23] leading-[1.2]">
                  {product.name || product.title}
                </h1>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#C19A5B]/30"}`} />
                    ))}
                  </div>
                  <a href="#reviews" className="text-xs text-[#7A6A5C] hover:text-[#A4552A] underline underline-offset-2">
                    {averageRating.toFixed(1)} ({totalReviews} reviews)
                  </a>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="flex items-center justify-between border-b border-[#EAD6C3]/30 pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-inter text-2xl md:text-3xl font-bold text-[#A4552A]">
                    {formatPrice(product.price || 0)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="font-inter text-sm text-[#7A6A5C]/60 line-through decoration-[#7A6A5C]/40">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7EF] border border-[#3FAF6C]/20">
                                  <div className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-[#2E7D4D]" : "bg-red-500"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#2E7D4D]">
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                {product.original_price && product.original_price > product.price && (
                  <SavingsBadge originalPrice={product.original_price} salePrice={product.price} />
                )}
              </div>

              {/* Low Stock Alert */}
              {product.stock_quantity !== undefined && <StockAlert stock={product.stock_quantity} />}

              {/* Trust Strip */}
              <div className="flex items-center gap-6 py-2">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#5C4A3D]">
                  <Truck className="w-3.5 h-3.5 text-[#A4552A]" />
                  <span>Free shipping {'>'} ₹2000</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#5C4A3D]">
                  <Package className="w-3.5 h-3.5 text-[#A4552A]" />
                  <span>5-7 Day Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#5C4A3D]">
                  <Shield className="w-3.5 h-3.5 text-[#A4552A]" />
                  <span>Secure Checkout</span>
                </div>
              </div>

              {/* Essence */}
              <p className="text-sm text-[#3B2C23]/80 font-inter leading-relaxed">
                {product.description?.slice(0, 180) || "Handcrafted with traditional Kalamkari techniques, showcasing authentic artisan craftsmanship. Each piece tells a story of heritage and skilled artistry."}...
              </p>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3 h-[48px]">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#EAD6C3] rounded-[6px] bg-white w-28 shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-full flex items-center justify-center hover:bg-[#FFF4E8] text-[#3B2C23]"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-inter text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-full flex items-center justify-center hover:bg-[#FFF4E8] text-[#3B2C23]"
                      disabled={!inStock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 bg-[#A4552A] hover:bg-[#8B3F20] text-white rounded-[6px] font-inter font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                  >
                    Add to Cart
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleToggleWishlist}
                    className={cn(
                      "flex-1 h-[40px] border rounded-[6px] flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide transition-all",
                      isInWishlist 
                        ? "border-[#A4552A] text-[#A4552A] bg-[#FFF4E8]" 
                        : "border-[#EAD6C3] text-[#7A6A5C] hover:border-[#A4552A] hover:text-[#A4552A]"
                    )}
                  >
                    <Heart className={cn("w-3.5 h-3.5", isInWishlist && "fill-current")} />
                    Wishlist
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 h-[40px] border border-[#EAD6C3] text-[#7A6A5C] rounded-[6px] flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide hover:border-[#A4552A] hover:text-[#A4552A] transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            SECTION 2: PRODUCT DETAILS (Accordion)
        ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Offset to align with content column (7 cols space) */}
          <div className="hidden lg:block lg:col-span-7" /> 
          
          <div className="lg:col-span-5 bg-white rounded-[10px] border border-[#EAD6C3]/30 overflow-hidden shadow-sm">
            <Accordion type="single" collapsible defaultValue="details">
              
              <AccordionItem value="details" className="border-b border-[#EAD6C3]/20 px-6">
                <AccordionTrigger className="py-4 font-playfair text-base font-bold text-[#3B2C23] hover:no-underline">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[#3B2C23]/70 font-inter leading-relaxed">
                  {product.specifications ? (
                    <ul className="space-y-2 list-disc pl-4 marker:text-[#EAD6C3]">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <li key={key}><span className="font-medium text-[#3B2C23]">{key}:</span> {String(value)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Dimensions: 6.5 meters. Occasion: Festive, Wedding.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="craft" className="border-b border-[#EAD6C3]/20 px-6">
                <AccordionTrigger className="py-4 font-playfair text-base font-bold text-[#3B2C23] hover:no-underline">
                  Material & Craft
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[#3B2C23]/70 font-inter leading-relaxed">
                  <p className="mb-2"><strong className="text-[#3B2C23]">Fabric:</strong> Pure cotton with natural dyes.</p>
                  <p><strong className="text-[#3B2C23]">Technique:</strong> Traditional hand-painted Kalamkari using organic colors derived from roots, leaves, and minerals.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="px-6 border-b-0">
                <AccordionTrigger className="py-4 font-playfair text-base font-bold text-[#3B2C23] hover:no-underline">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[#3B2C23]/70 font-inter leading-relaxed">
                  <p className="mb-1">• Free shipping on orders over ₹2000</p>
                  <p className="mb-1">• Delivery: 5-7 business days</p>
                  <p>• Returns: 7-day return policy for unused items</p>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            SECTION 3: REVIEWS (Unified Container)
        ────────────────────────────────────────────── */}

        {/* ─────────────────────────────────────────────
            SECTION 4: RELATED PRODUCTS (Curated)
        ────────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#EAD6C3]/30">
            <h2 className="font-playfair text-2xl font-bold text-[#3B2C23] mb-8 text-center">
              You May Also Love
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/products/${relProduct.slug || relProduct.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] bg-white rounded-[8px] overflow-hidden border border-[#EAD6C3]/30 mb-3">
                    <Image
                      src={getOptimizedImageUrl(relProduct.images?.[0] || relProduct.mainImage, IMAGE_SIZES.productCard)}
                      alt={relProduct.name || relProduct.title || "Product"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes={getResponsiveSizes('grid')}
                      loading="lazy"
                    />
                    {relProduct.isFeatured && (
                      <span className="absolute top-2 left-2 bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#A4552A] rounded-[2px] backdrop-blur-sm">
                        Artisan
                      </span>
                    )}
                  </div>
                  <h3 className="font-inter text-sm font-medium text-[#3B2C23] line-clamp-1 group-hover:text-[#A4552A] transition-colors">
                    {relProduct.name || relProduct.title}
                  </h3>
                  <p className="font-playfair text-base font-bold text-[#A4552A] mt-1">
                    {formatPrice(relProduct.price || 0)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div> {/* END GLOBAL CONTAINER */}

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full max-w-4xl flex items-center justify-center">
              <Image 
                src={mainProductImage} 
                alt="Fullscreen view" 
                fill 
                className="object-contain" 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductReviews productId={product.id} productName={product.title || product.name} />
      </div>

    </div>
  )
}