"use client"

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type MouseEvent,
} from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  useProductBySlug,
  useProducts,
  useProduct,
} from "@/shared/hooks/use-products"
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
  X,
} from "lucide-react"
import { toast } from "sonner"
import { formatPrice, cn } from "@/shared/utils"
import { getResponsiveSizes } from "@/lib/image-utils"
import { getImageTier } from "@/lib/image-tiers"
import { resolveProductImageSrc } from "@/lib/cloudflare-images"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { ProductReviews } from "./ProductReviews"
import { useReviews } from "@/shared/hooks/use-reviews"
import { StockAlert, SavingsBadge } from "@/shared/components/UrgencyTriggers"

export default function ProductDetail() {
  const params = useParams()
  const slug = params?.slug as string

  const isUUID = slug
    ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slug,
      )
    : false

  const { data: productBySlug, isLoading: loadingBySlug } =
    useProductBySlug(slug)
  const { data: productById, isLoading: loadingById } = useProduct(slug)

  const product = isUUID ? productById : productBySlug
  const isLoading = !slug ? true : isUUID ? loadingById : loadingBySlug
  const { data: relatedProductsData } = useProducts({
    category_id: product?.category_id,
    limit: 5,
  })

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [fullImage, setFullImage] = useState<string | null>(null)
  const [zoomMagnifier, setZoomMagnifier] = useState({
    visible: false,
    x: 50,
    y: 50,
  })

  const handleZoom = useCallback(() => {
    if (!product?.images?.length) return

    const full = getImageTier(product?.images, "full", selectedImageIndex)
    setFullImage(full || "/images/products/product-placeholder.png")
    setZoomMagnifier({ visible: false, x: 50, y: 50 })

    setIsImageModalOpen(true)
  }, [product?.images, selectedImageIndex])

  const handleCloseZoomModal = useCallback(() => {
    setIsImageModalOpen(false)
    setZoomMagnifier((current) => ({ ...current, visible: false }))
  }, [])

  const cart = useCartStore()
  const wishlist = useWishlistStore()

  const { averageRating, totalReviews } = useReviews(product?.id || "")

  // Set product data globally for WhatsApp button
  useEffect(() => {
    if (product && typeof window !== "undefined") {
      ;(window as any).__PRODUCT_DATA = {
        id: product.id,
        name: product.name || product.title,
        price: product.price,
        slug: product.slug,
      }
    }

    // Cleanup when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__PRODUCT_DATA
      }
    }
  }, [product?.id]) // Only update when product.id changes

  // Optimized main image (high quality for detail view)
  const mainProductImage = useMemo(() => {
    const img = getImageTier(product?.images, "medium", selectedImageIndex)
    return img || "/images/products/product-placeholder.png"
  }, [product?.images, selectedImageIndex])

  const zoomMagnifierImage = useMemo(
    () =>
      resolveProductImageSrc(
        fullImage || "/images/products/product-placeholder.png",
        "full",
      ),
    [fullImage],
  )

  const handleZoomMagnifierMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = Math.min(
        100,
        Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
      )
      const y = Math.min(
        100,
        Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
      )

      setZoomMagnifier({
        visible: true,
        x,
        y,
      })
    },
    [],
  )

  const handleZoomMagnifierLeave = useCallback(() => {
    setZoomMagnifier((current) => ({ ...current, visible: false }))
  }, [])

  // Optimized thumbnails (small) - each thumbnail shows different image
  const thumbnailImages = useMemo(() => {
    if (!product?.images?.length) return []
    return product.images.map((img, idx) => {
      const thumb = getImageTier(product?.images, "thumb", idx)
      return thumb || "/images/products/product-placeholder.png"
    })
  }, [product?.images])

  const relatedProducts = (relatedProductsData?.data || [])
    .filter((p) => p.id !== product?.id)
    .slice(0, 4)

  const isInWishlist = product ? wishlist.isInWishlist(product.id) : false
  const inStock = (product?.stock_quantity || 0) > 0

  // Handlers
  const handleAddToCart = () => {
    if (!product) return
    const maxStock = product.stock_quantity ?? 0
    const existingItem = cart.items.find((i) => i.productId === product.id)
    const currentQty = existingItem?.quantity ?? 0
    const addable = Math.min(quantity, maxStock - currentQty)
    if (addable <= 0) {
      toast.error(`Only ${maxStock} in stock`)
      return
    }
    cart.addItem(product, addable)
    toast.success(`Added ${addable} item(s) to cart`)
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
        <h1 className="font-playfair text-xl font-bold text-[#3B2C23] mb-2">
          Product Not Found
        </h1>
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
        <div className="max-w-[1380px] mx-auto px-4 md:px-6 py-3">
          {" "}
          {/* Increased width */}
          <div className="flex items-center gap-2 text-[11px] text-[#7A6A5C] font-inter uppercase tracking-wide">
            <Link href="/" className="hover:text-[#A4552A] transition-colors">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link
              href="/products"
              className="hover:text-[#A4552A] transition-colors"
            >
              Shop
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-[#3B2C23] font-semibold truncate max-w-[200px]">
              {product.name || product.title}
            </span>
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
            {product?.images && product.images.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:h-[600px] scrollbar-hide shrink-0 py-1 px-1">
                {(product?.images || []).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (product?.images && idx < product.images.length) {
                        setSelectedImageIndex(idx)
                      }
                    }}
                    className={cn(
                      "relative w-16 h-20 lg:w-20 lg:h-24 rounded-[6px] overflow-hidden border transition-all shrink-0",
                      selectedImageIndex === idx
                        ? "border-[#A4552A] ring-1 ring-[#A4552A]/20"
                        : "border-[#EAD6C3]/30 hover:border-[#C19A5B]",
                    )}
                  >
                    <OptimizedImage
                      src={
                        thumbnailImages[idx] ||
                        "/images/products/product-placeholder.png"
                      }
                      alt={`View ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      imageType="thumbnail"
                      priority={false}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div
              className="relative flex-1 aspect-[4/5] bg-white rounded-[10px] overflow-hidden border border-[#EAD6C3]/20 shadow-sm group lg:h-[600px] cursor-zoom-in"
              onClick={handleZoom}
            >
              <OptimizedImage
                src={mainProductImage}
                alt={product.name || product.title || "Product"}
                fill
                className={cn(
                  "object-cover transition-transform duration-700 group-hover:scale-105",
                  !inStock && "grayscale-[20%]",
                )}
                sizes={getResponsiveSizes("detail")}
                imageType="productDetail"
                priority={false} // Remove priority - only for above-fold hero images
                loading="lazy"
              />
              {/* Out of Stock Indicator */}
              {!inStock && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-red-600 px-3 py-1.5 rounded-sm shadow-md">
                    <span className="text-white text-xs font-bold tracking-wide uppercase">
                      Out of Stock
                    </span>
                  </div>
                </div>
              )}
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
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(averageRating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#C19A5B]/30"}`}
                      />
                    ))}
                  </div>
                  <a
                    href="#reviews"
                    className="text-xs text-[#7A6A5C] hover:text-[#A4552A] underline underline-offset-2"
                  >
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
                  {product.original_price &&
                    product.original_price > product.price && (
                      <span className="font-inter text-sm text-[#7A6A5C]/60 line-through decoration-[#7A6A5C]/40">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                    inStock
                      ? "bg-[#EBF7EF] border-[#3FAF6C]/20"
                      : "bg-red-50 border-red-200",
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      inStock ? "bg-[#2E7D4D]" : "bg-red-500 animate-pulse",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wide",
                      inStock ? "text-[#2E7D4D]" : "text-red-600",
                    )}
                  >
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                {product.original_price &&
                  product.original_price > product.price && (
                    <SavingsBadge
                      originalPrice={product.original_price}
                      salePrice={product.price}
                    />
                  )}
              </div>

              {/* Low Stock Alert */}
              {product.stock_quantity !== undefined && (
                <StockAlert stock={product.stock_quantity} />
              )}

              {/* Trust Strip */}
              <div className="flex items-center gap-6 py-2">
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#5C4A3D]">
                  <Truck className="w-3.5 h-3.5 text-[#A4552A]" />
                  <span>Free shipping {">"} ₹2000</span>
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
                {product.description?.slice(0, 180) ||
                  "Handcrafted with traditional Kalamkari techniques, showcasing authentic artisan craftsmanship. Each piece tells a story of heritage and skilled artistry."}
                ...
              </p>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {/* Out of Stock Banner - Prominent warning */}
                {!inStock && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-semibold text-sm">
                        Currently Unavailable
                      </p>
                      <p className="text-red-600 text-xs mt-0.5">
                        This item is out of stock. Add to wishlist to be
                        notified when available.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 h-[48px]">
                  {/* Quantity */}
                  <div
                    className={cn(
                      "flex items-center border rounded-[6px] w-28 shrink-0",
                      inStock
                        ? "border-[#EAD6C3] bg-white"
                        : "border-gray-200 bg-gray-50 opacity-50",
                    )}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-full flex items-center justify-center hover:bg-[#FFF4E8] text-[#3B2C23] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1 || !inStock}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center font-inter text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-full flex items-center justify-center hover:bg-[#FFF4E8] text-[#3B2C23] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!inStock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart - Prominent disabled state */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={cn(
                      "flex-1 rounded-[6px] font-inter font-medium text-sm flex items-center justify-center gap-2 transition-all",
                      inStock
                        ? "bg-[#A4552A] hover:bg-[#8B3F20] text-white shadow-sm active:scale-[0.98]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed",
                    )}
                  >
                    {inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleToggleWishlist}
                    className={cn(
                      "flex-1 h-[40px] border rounded-[6px] flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide transition-all",
                      isInWishlist
                        ? "border-[#A4552A] text-[#A4552A] bg-[#FFF4E8]"
                        : "border-[#EAD6C3] text-[#7A6A5C] hover:border-[#A4552A] hover:text-[#A4552A]",
                    )}
                  >
                    <Heart
                      className={cn(
                        "w-3.5 h-3.5",
                        isInWishlist && "fill-current",
                      )}
                    />
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
              <AccordionItem
                value="details"
                className="border-b border-[#EAD6C3]/20 px-6"
              >
                <AccordionTrigger className="py-4 font-playfair text-base font-bold text-[#3B2C23] hover:no-underline">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[#3B2C23]/70 font-inter leading-relaxed">
                  {product.specifications ? (
                    <ul className="space-y-2 list-disc pl-4 marker:text-[#EAD6C3]">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <li key={key}>
                            <span className="font-medium text-[#3B2C23]">
                              {key}:
                            </span>{" "}
                            {String(value)}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : (
                    <p>Dimensions: 6.5 meters. Occasion: Festive, Wedding.</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="craft"
                className="border-b border-[#EAD6C3]/20 px-6"
              >
                <AccordionTrigger className="py-4 font-playfair text-base font-bold text-[#3B2C23] hover:no-underline">
                  Material & Craft
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[#3B2C23]/70 font-inter leading-relaxed">
                  <p className="mb-2">
                    <strong className="text-[#3B2C23]">Fabric:</strong> Pure
                    cotton with natural dyes.
                  </p>
                  <p>
                    <strong className="text-[#3B2C23]">Technique:</strong>{" "}
                    Traditional hand-painted Kalamkari using organic colors
                    derived from roots, leaves, and minerals.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="px-6 border-b-0">
                <AccordionTrigger className="py-4 font-playfair text-base font-bold text-[#3B2C23] hover:no-underline">
                  Shipping
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-[#3B2C23]/70 font-inter leading-relaxed">
                  <p className="mb-1">• Free shipping on orders over ₹2000</p>
                  <p className="mb-1">• Delivery: 5-7 business days</p>
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
                    <OptimizedImage
                      src={(() => {
                        const img = getImageTier(relProduct?.images, "thumb", 0)
                        return img || "/images/products/product-placeholder.png"
                      })()}
                      alt={relProduct.name || relProduct.title || "Product"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes={getResponsiveSizes("grid")}
                      imageType="productCard"
                      priority={false}
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
      </div>{" "}
      {/* END GLOBAL CONTAINER */}
      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseZoomModal}
          >
            <button
              className="absolute top-6 right-6 z-20 text-white/80 hover:text-white transition-colors"
              onClick={handleCloseZoomModal}
            >
              <X className="w-8 h-8" />
            </button>
            <div
              className="relative h-full w-full max-w-5xl cursor-crosshair overflow-hidden"
              onClick={(event) => event.stopPropagation()}
              onMouseMove={handleZoomMagnifierMove}
              onMouseLeave={handleZoomMagnifierLeave}
            >
              <OptimizedImage
                src={fullImage || "/images/products/product-placeholder.png"}
                alt="Fullscreen view"
                fill
                className="object-contain"
                variant="full"
                context="zoom"
                objectFit="contain"
                sizes="100vw"
                priority={false}
                loading="lazy"
                placeholder="empty"
              />
              {zoomMagnifier.visible && (
                <>
                  <div
                    className="pointer-events-none absolute z-10 h-32 w-28 -translate-x-1/2 -translate-y-1/2 border border-white/80 bg-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.38),inset_0_0_0_1px_rgba(255,255,255,0.55)] backdrop-blur-[1px] md:h-44 md:w-36"
                    style={{
                      left: `${zoomMagnifier.x}%`,
                      top: `${zoomMagnifier.y}%`,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute right-4 top-1/2 z-20 h-[min(680px,82vh)] w-[min(460px,42vw)] -translate-y-1/2 overflow-hidden rounded-[10px] border border-white/80 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.52),inset_0_0_0_1px_rgba(255,255,255,0.55)] transition-opacity duration-150"
                    style={{
                      backgroundImage: `url("${zoomMagnifierImage}")`,
                      backgroundPosition: `${zoomMagnifier.x}% ${zoomMagnifier.y}%`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "320% auto",
                      imageRendering: "auto",
                    }}
                  >
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductReviews
          productId={product.id}
          productName={product.title || product.name}
        />
      </div>
    </div>
  )
}
