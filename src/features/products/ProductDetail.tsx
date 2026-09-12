"use client"

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type WheelEvent as ReactWheelEvent,
  type TouchEvent as ReactTouchEvent,
} from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  useProductBySlug,
  useProducts,
  useProduct,
} from "@/shared/hooks/use-products"
import { useCartStore } from "@/shared/cart-store"
import { useMiniCartStore } from "@/shared/mini-cart-store"
import { useWishlistStore } from "@/shared/wishlist-store"
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action"
import {
  Heart,
  Share2,
  Star,
  Package,
  Minus,
  Plus,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react"
import { toast } from "sonner"
import { formatPrice, cn } from "@/shared/utils"
import { hasSelectableColors, parseColorEntry } from "@/shared/lib/color-swatch"
import { getResponsiveSizes } from "@/lib/image-utils"
import { getImageTier } from "@/lib/image-tiers"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import {
  ParcelMark,
  LockMark,
  LotusSealMark,
} from "@/shared/ui/craft-marks"
import { ProductReviews } from "./ProductReviews"
import { useReviews } from "@/shared/hooks/use-reviews"
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  getStockQuantity,
  isMadeToOrder,
} from "@/shared/lib/inventory"

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
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
    limit: 8,
    is_visible: true,
  })
  // Thin categories return one or two pieces; backfill so the row is always full.
  const { data: fallbackProductsData } = useProducts({
    limit: 12,
    is_visible: true,
  })

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Docked purchase bar: shown once the main buy block has scrolled past.
  const buyBlockRef = useRef<HTMLDivElement | null>(null)
  const [showBuyBar, setShowBuyBar] = useState(false)
  
  // Fullscreen Direct Zoom & Pan state (Fast, zero-glitch pointer events)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const hasDraggedRef = useRef(false)
  const pointerStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const lastTouchDistanceRef = useRef<number | null>(null)

  const cart = useCartStore()
  const openMiniCart = useMiniCartStore((s) => s.open)
  const wishlist = useWishlistStore()

  const { averageRating, totalReviews } = useReviews(product?.id || "")

  // Reset zoom & pan when opening modal or changing modal image
  const resetZoom = useCallback(() => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
    setIsDragging(false)
    hasDraggedRef.current = false
  }, [])

  const handleOpenZoomModal = useCallback(() => {
    if (!product?.images?.length) return
    setModalImageIndex(selectedImageIndex)
    resetZoom()
    setIsImageModalOpen(true)
  }, [product?.images, selectedImageIndex, resetZoom])

  const handleCloseZoomModal = useCallback(() => {
    setIsImageModalOpen(false)
    resetZoom()
  }, [resetZoom])

  const handleModalNextImage = useCallback(
    (e?: ReactMouseEvent) => {
      e?.stopPropagation()
      const total = product?.images?.length || 0
      if (total <= 1) return
      setModalImageIndex((prev) => (prev + 1) % total)
      resetZoom()
    },
    [product?.images?.length, resetZoom],
  )

  const handleModalPrevImage = useCallback(
    (e?: ReactMouseEvent) => {
      e?.stopPropagation()
      const total = product?.images?.length || 0
      if (total <= 1) return
      setModalImageIndex((prev) => (prev - 1 + total) % total)
      resetZoom()
    },
    [product?.images?.length, resetZoom],
  )

  // Zoom in / Zoom out / Toggle handlers
  const handleZoomIn = useCallback((e?: ReactMouseEvent) => {
    e?.stopPropagation()
    setZoomLevel((prev) => Math.min(4, +(prev + 0.5).toFixed(1)))
  }, [])

  const handleZoomOut = useCallback((e?: ReactMouseEvent) => {
    e?.stopPropagation()
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1))
      if (next === 1) setPanPosition({ x: 0, y: 0 })
      return next
    })
  }, [])

  // Smooth single-click toggle zoom without clashing with pan dragging
  const handleClickCanvas = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation()
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false
        return
      }
      if (zoomLevel > 1) {
        resetZoom()
      } else {
        setZoomLevel(2.2)
      }
    },
    [zoomLevel, resetZoom],
  )

  // Wheel zoom handler with smooth scaling
  const handleWheel = useCallback((e: ReactWheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setZoomLevel((prev) => {
      const delta = e.deltaY < 0 ? 0.35 : -0.35
      const next = Math.min(4, Math.max(1, +(prev + delta).toFixed(2)))
      if (next === 1) setPanPosition({ x: 0, y: 0 })
      return next
    })
  }, [])

  // Pointer Drag to Pan (Silky smooth 1:1 movement, captures pointer)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      hasDraggedRef.current = false
      if (zoomLevel <= 1) return
      e.preventDefault()
      setIsDragging(true)
      pointerStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panPosition.x,
        panY: panPosition.y,
      }
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    },
    [zoomLevel, panPosition],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || zoomLevel <= 1) return
      e.preventDefault()
      const dx = e.clientX - pointerStartRef.current.x
      const dy = e.clientY - pointerStartRef.current.y
      if (Math.hypot(dx, dy) > 3) {
        hasDraggedRef.current = true
      }
      // Max allowable pan based on zoom level to keep image visible
      const maxPan = 420 * (zoomLevel - 1)
      const clampedX = Math.max(-maxPan, Math.min(maxPan, pointerStartRef.current.panX + dx))
      const clampedY = Math.max(-maxPan, Math.min(maxPan, pointerStartRef.current.panY + dy))
      setPanPosition({ x: clampedX, y: clampedY })
    },
    [isDragging, zoomLevel],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging) {
        setIsDragging(false)
        try {
          e.currentTarget.releasePointerCapture(e.pointerId)
        } catch {}
      }
    },
    [isDragging],
  )

  // Touch Pinch and Pan
  const handleTouchStart = useCallback(
    (e: ReactTouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        lastTouchDistanceRef.current = Math.hypot(dx, dy)
      } else if (e.touches.length === 1 && zoomLevel > 1) {
        hasDraggedRef.current = false
        setIsDragging(true)
        pointerStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: panPosition.x,
          panY: panPosition.y,
        }
      }
    },
    [zoomLevel, panPosition],
  )

  const handleTouchMove = useCallback(
    (e: ReactTouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.hypot(dx, dy)
        const ratio = distance / lastTouchDistanceRef.current
        setZoomLevel((prev) => {
          const next = Math.min(4, Math.max(1, +(prev * ratio).toFixed(2)))
          if (next === 1) setPanPosition({ x: 0, y: 0 })
          return next
        })
        lastTouchDistanceRef.current = distance
      } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
        const dx = e.touches[0].clientX - pointerStartRef.current.x
        const dy = e.touches[0].clientY - pointerStartRef.current.y
        if (Math.hypot(dx, dy) > 3) {
          hasDraggedRef.current = true
        }
        const maxPan = 420 * (zoomLevel - 1)
        const clampedX = Math.max(-maxPan, Math.min(maxPan, pointerStartRef.current.panX + dx))
        const clampedY = Math.max(-maxPan, Math.min(maxPan, pointerStartRef.current.panY + dy))
        setPanPosition({ x: clampedX, y: clampedY })
      }
    },
    [isDragging, zoomLevel],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    lastTouchDistanceRef.current = null
  }, [])

  // Keyboard navigation for zoom modal
  useEffect(() => {
    if (!isImageModalOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseZoomModal()
      if (e.key === "ArrowRight") handleModalNextImage()
      if (e.key === "ArrowLeft") handleModalPrevImage()
      if (e.key === "+" || e.key === "=") handleZoomIn()
      if (e.key === "-") handleZoomOut()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    isImageModalOpen,
    handleCloseZoomModal,
    handleModalNextImage,
    handleModalPrevImage,
    handleZoomIn,
    handleZoomOut,
  ])

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

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__PRODUCT_DATA
      }
    }
  }, [product?.id, product?.name, product?.title, product?.price, product?.slug])

  // Optimized main image
  const mainProductImage = useMemo(() => {
    const img = getImageTier(product?.images, "medium", selectedImageIndex)
    return img || "/images/products/product-placeholder.png"
  }, [product?.images, selectedImageIndex])

  // Modal full image (Fast instant load from cached medium/main tier)
  const modalImageSrc = useMemo(() => {
    if (modalImageIndex === selectedImageIndex && mainProductImage) {
      return mainProductImage
    }
    const img =
      getImageTier(product?.images, "medium", modalImageIndex) ||
      getImageTier(product?.images, "full", modalImageIndex)
    return img || "/images/products/product-placeholder.png"
  }, [product?.images, modalImageIndex, selectedImageIndex, mainProductImage])

  // Optimized thumbnails
  const thumbnailImages = useMemo(() => {
    if (!product?.images?.length) return []
    return product.images.map((_, idx) => {
      const thumb = getImageTier(product?.images, "thumb", idx)
      return thumb || "/images/products/product-placeholder.png"
    })
  }, [product?.images])

  const relatedProducts = useMemo(() => {
    const seen = new Set<string>()
    if (product?.id) seen.add(product.id)
    const picked: NonNullable<typeof relatedProductsData>["data"] = []
    const take = (list?: NonNullable<typeof relatedProductsData>["data"]) => {
      for (const candidate of list ?? []) {
        if (picked.length >= 4) return
        if (!candidate?.id || seen.has(candidate.id)) continue
        seen.add(candidate.id)
        picked.push(candidate)
      }
    }
    take(relatedProductsData?.data)
    take(fallbackProductsData?.data)
    return picked
  }, [relatedProductsData?.data, fallbackProductsData?.data, product?.id])

  const isInWishlist = product ? wishlist.items.includes(product.id) : false
  const stockQuantity = getStockQuantity(product)
  const madeToOrder = isMadeToOrder(product)
  const purchasableLimit = getPurchasableQuantityLimit(product)
  const inStock = stockQuantity > 0

  const handleAddToCart = useAuthGuardedAction(() => {
    if (!product) return
    const existingItem = cart.items.find((i) => i.productId === product.id)
    const currentQty = existingItem?.quantity ?? 0
    const addable = Math.min(quantity, purchasableLimit - currentQty)
    if (addable <= 0) {
      toast.error(
        madeToOrder
          ? `Made-to-order quantity is limited to ${purchasableLimit}`
          : `Only ${stockQuantity} in stock`,
      )
      return
    }
    cart.addItem(product, addable)
    openMiniCart(product.id)
    if (madeToOrder) {
      toast.success(`Added ${addable} item(s) to cart`, {
        description: `This custom request will be prepared and delivered in ${MADE_TO_ORDER_DAYS}.`,
      })
    } else {
      toast.success(`Added ${addable} item(s) to cart`)
    }
  })

  // Quick add straight from a recommendation card, without leaving the page.
  const handleQuickAdd = useAuthGuardedAction(
    (_event: unknown, relProduct?: (typeof relatedProducts)[number]) => {
      if (!relProduct) return
      cart.addItem(relProduct, 1)
      openMiniCart(relProduct.id)
      toast.success(`${relProduct.name || relProduct.title} added to cart`)
    },
  )

  // BUY NOW = Add item and immediately redirect to checkout
  const handleBuyNow = useAuthGuardedAction(() => {
    if (!product) return
    const existingItem = cart.items.find((i) => i.productId === product.id)
    const currentQty = existingItem?.quantity ?? 0
    const addable = Math.min(quantity, purchasableLimit - currentQty)
    if (addable <= 0) {
      toast.error(
        madeToOrder
          ? `Made-to-order quantity is limited to ${purchasableLimit}`
          : `Only ${stockQuantity} in stock`,
      )
      return
    }
    cart.addItem(product, addable)
    router.push("/checkout")
  })

  const handleToggleWishlist = useAuthGuardedAction(() => {
    if (!product) return
    wishlist.toggleItem(product.id)
    toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
  })

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

  useEffect(() => {
    // Read geometry directly rather than observing intersection: at threshold 0
    // an observer never fires when the element is skipped in a single jump
    // (anchor links, restored scroll position, a fast flick), leaving the bar
    // stuck hidden exactly when the buyer is furthest from the buttons.
    const update = () => {
      const el = buyBlockRef.current
      if (!el) return
      setShowBuyBar(el.getBoundingClientRect().bottom <= 0)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [product?.id])

  // The docked bar owns the bottom edge; lift the floating widgets clear of it.
  useEffect(() => {
    document.body.dataset.buyBar = showBuyBar ? "on" : "off"
    return () => {
      delete document.body.dataset.buyBar
    }
  }, [showBuyBar])

  // Only facts that are actually true of this product. The page previously
  // defaulted every piece to "6.3 metres, blouse included" and an 0.8m blouse,
  // which is wrong for wall paintings, dupattas, lehengas and men's sets — i.e.
  // most of the catalogue. Anything not recorded on the product is now omitted
  // rather than invented; only shop-wide truths are appended.
  const specRows = useMemo<Array<[string, string]>>(() => {
    const spec = (product?.specifications ?? {}) as Record<string, unknown>
    const rows: Array<[string, string]> = []
    const seen = new Set<string>()

    const push = (label: string, value: string) => {
      const key = label.trim().toLowerCase()
      if (!value.trim() || seen.has(key)) return
      seen.add(key)
      rows.push([label, value])
    }

    for (const [label, value] of Object.entries(spec)) {
      if (value == null) continue
      push(label, String(value))
    }

    // True of every piece the workshop makes, so safe to state without data.
    push("Dyes", "Natural botanical and mineral dyes")
    // Dispatch time for ready pieces isn't confirmed, so only made-to-order
    // pieces state a timeline.
    if (madeToOrder) {
      push("Dispatch", `Handmade to order, ready in ${MADE_TO_ORDER_DAYS}`)
    }

    return rows
  }, [product?.specifications, madeToOrder])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--brand-ink)/0.15)] border-t-[hsl(var(--brand-ink))] animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <Package
          className="h-10 w-10 text-[hsl(var(--brand-gold-deep))] mb-4"
          strokeWidth={1.25}
        />
        <h1 className="font-serif text-[22px] font-semibold text-[hsl(var(--brand-ink))]">
          We couldn&apos;t find that piece
        </h1>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center h-11 px-7 rounded-full bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-paper))] text-[12px] font-semibold uppercase tracking-[0.16em] hover:bg-[hsl(var(--brand-ink-soft))] transition-colors"
        >
          Back to shop
        </Link>
      </div>
    )
  }

  const savePercent =
    product.original_price && product.original_price > (product.price || 0)
      ? Math.round(
          ((product.original_price - (product.price || 0)) /
            product.original_price) *
            100,
        )
      : 0

  const productName = product.name || product.title || "Product"

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="border-b border-[hsl(var(--brand-gold)/0.14)] bg-[hsl(var(--brand-paper)/0.55)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[11px] text-[hsl(var(--brand-ink)/0.55)]"
          >
            <Link
              href="/"
              className="hover:text-[hsl(var(--brand-gold-deep))] transition-colors"
            >
              Home
            </Link>
            <span aria-hidden className="opacity-40">/</span>
            <Link
              href="/products"
              className="hover:text-[hsl(var(--brand-gold-deep))] transition-colors"
            >
              Shop
            </Link>
            <span aria-hidden className="opacity-40">/</span>
            <span className="text-[hsl(var(--brand-ink)/0.9)] truncate max-w-[220px]">
              {productName}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        {/* ── Buy block: gallery + purchase column ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 py-7 lg:py-10 items-start">
          {/* Gallery */}
          <div className="lg:col-span-6 flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
            {product?.images && product.images.length > 1 && (
              <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible scrollbar-hide shrink-0">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    aria-current={selectedImageIndex === idx}
                    className={cn(
                      "relative w-[58px] h-[73px] rounded-lg overflow-hidden shrink-0 transition-all duration-200",
                      "ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-deep))] focus-visible:ring-offset-2",
                      selectedImageIndex === idx
                        ? "ring-[hsl(var(--brand-ink))] opacity-100"
                        : "ring-[hsl(var(--brand-ink)/0.12)] opacity-60 hover:opacity-100",
                    )}
                  >
                    <OptimizedImage
                      src={
                        thumbnailImages[idx] ||
                        "/images/products/product-placeholder.png"
                      }
                      alt=""
                      fill
                      className="object-cover"
                      sizes="58px"
                      imageType="thumbnail"
                      priority={false}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main image — height-capped so the whole buy column stays above the fold */}
            <div
              onClick={handleOpenZoomModal}
              className="group relative flex-1 min-w-0 w-full aspect-[4/5] bg-[hsl(var(--brand-paper))] rounded-lg overflow-hidden ring-1 ring-[hsl(var(--brand-ink)/0.08)] cursor-zoom-in select-none"
            >
              <OptimizedImage
                src={mainProductImage}
                alt={productName}
                fill
                priority
                className="object-cover object-top select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 55vw"
                imageType="productDetail"
              />

              {product?.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const total = product?.images?.length || 0
                      if (total <= 1) return
                      setSelectedImageIndex((prev) => (prev - 1 + total) % total)
                    }}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[hsl(var(--brand-paper)/0.92)] text-[hsl(var(--brand-ink))] shadow-[0_2px_10px_rgba(26,21,18,0.14)] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const total = product?.images?.length || 0
                      if (total <= 1) return
                      setSelectedImageIndex((prev) => (prev + 1) % total)
                    }}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[hsl(var(--brand-paper)/0.92)] text-[hsl(var(--brand-ink))] shadow-[0_2px_10px_rgba(26,21,18,0.14)] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <span className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-[hsl(var(--brand-ink)/0.72)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Purchase column */}
          {/* Now that the details moved out, the rail is short enough to stick
              safely (~560px against a 900px viewport), so the buttons stay
              beside the gallery instead of leaving white space under them. */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            {/* Title + secondary actions */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-serif text-[26px] md:text-[31px] leading-[1.15] font-semibold text-[hsl(var(--brand-ink))] tracking-[-0.01em]">
                {productName}
              </h1>
              <div className="flex items-center shrink-0 -mr-2 -mt-1">
                <button
                  onClick={handleToggleWishlist}
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Save to wishlist"
                  }
                  aria-pressed={isInWishlist}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[hsl(var(--brand-ink)/0.55)] hover:text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.05)] transition-colors"
                >
                  <Heart
                    className={cn(
                      "w-[18px] h-[18px]",
                      isInWishlist &&
                        "fill-[hsl(var(--brand-madder))] text-[hsl(var(--brand-madder))]",
                    )}
                  />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share this product"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[hsl(var(--brand-ink)/0.55)] hover:text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.05)] transition-colors"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* Provenance + rating, one line */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[12px] text-[hsl(var(--brand-ink)/0.6)]">
              <span>Hand-painted in Srikalahasti</span>
              {totalReviews > 0 && (
                <>
                  <span aria-hidden className="opacity-35">·</span>
                  <a
                    href="#reviews-section"
                    className="flex items-center gap-1.5 hover:text-[hsl(var(--brand-ink))] transition-colors"
                  >
                    <span className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < Math.round(averageRating)
                              ? "fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]"
                              : "text-[hsl(var(--brand-ink)/0.2)]",
                          )}
                        />
                      ))}
                    </span>
                    <span className="underline underline-offset-2 decoration-[hsl(var(--brand-ink)/0.25)]">
                      {totalReviews}
                    </span>
                  </a>
                </>
              )}
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline flex-wrap gap-x-3 gap-y-1">
              <span className="text-[30px] leading-none font-semibold text-[hsl(var(--brand-ink))] tabular-nums tracking-[-0.01em]">
                {formatPrice(product.price || 0)}
              </span>
              {savePercent > 0 && (
                <>
                  <span className="text-[15px] text-[hsl(var(--brand-ink)/0.4)] line-through tabular-nums">
                    {formatPrice(product.original_price || 0)}
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[hsl(var(--brand-madder))] bg-[hsl(var(--brand-madder)/0.08)] border border-[hsl(var(--brand-madder)/0.22)] rounded-full px-2 py-0.5">
                    Save {savePercent}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-[12px] text-[hsl(var(--brand-ink)/0.55)]">
              Tax included. Free shipping across India.
            </p>

            {/* Availability — one line, low stock wins */}
            <p className="mt-3 flex items-center gap-2 text-[12.5px] font-medium">
              <span
                aria-hidden
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  inStock
                    ? "bg-[hsl(var(--brand-gold-deep))]"
                    : "bg-[hsl(var(--brand-ink)/0.35)]",
                )}
              />
              {!inStock ? (
                <span className="text-[hsl(var(--brand-ink)/0.7)]">
                  Made to order · ready in {MADE_TO_ORDER_DAYS}
                </span>
              ) : stockQuantity <= 5 ? (
                <span className="text-[hsl(var(--brand-madder))]">
                  Only {stockQuantity} left
                </span>
              ) : (
                <span className="text-[hsl(var(--brand-ink)/0.7)]">
                  In stock
                </span>
              )}
            </p>

            {/* Colour */}
            {hasSelectableColors(product.colors) && (
              <div className="mt-6">
                <p className="text-[12px] text-[hsl(var(--brand-ink)/0.6)]">
                  Colour:{" "}
                  <span className="text-[hsl(var(--brand-ink))] font-medium">
                    {selectedColor
                      ? parseColorEntry(selectedColor).name
                      : "Select"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2.5 mt-2.5">
                  {(product.colors ?? []).map((color: string) => {
                    const { name, hex } = parseColorEntry(color)
                    const isSelected = selectedColor === color
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={isSelected}
                        aria-label={name}
                        title={name}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          "ring-1 ring-inset ring-[hsl(var(--brand-ink)/0.15)]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-deep))]",
                          isSelected &&
                            "ring-2 ring-[hsl(var(--brand-ink))] ring-offset-2 ring-offset-[hsl(var(--brand-paper))]",
                        )}
                        style={{ backgroundColor: hex || "#D1D5DB" }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[12px] text-[hsl(var(--brand-ink)/0.6)]">
                Qty
              </span>
              <div className="flex items-center h-11 rounded-full ring-1 ring-[hsl(var(--brand-ink)/0.15)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="w-10 h-full flex items-center justify-center rounded-l-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.05)] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-[14px] font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(purchasableLimit, quantity + 1))
                  }
                  disabled={quantity >= purchasableLimit}
                  aria-label="Increase quantity"
                  className="w-10 h-full flex items-center justify-center rounded-r-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.05)] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div ref={buyBlockRef} className="mt-5">
              <div className="flex gap-2.5">
                <button
                  onClick={handleAddToCart}
                  className="h-[52px] flex-[38] min-w-0 rounded-full bg-transparent text-[hsl(var(--brand-ink))] ring-1 ring-[hsl(var(--brand-ink)/0.55)] hover:bg-[hsl(var(--brand-ink)/0.06)] active:scale-[0.99] transition-all text-[12px] font-semibold uppercase tracking-[0.14em] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {madeToOrder ? "Pre-order" : "Add"}
                    <span className="hidden sm:inline"> to cart</span>
                  </span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="h-[52px] flex-[62] min-w-0 rounded-full bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-paper))] hover:bg-[hsl(var(--brand-ink-soft))] active:scale-[0.99] transition-all text-[12px] font-semibold uppercase tracking-[0.16em] shadow-[0_2px_12px_rgba(26,21,18,0.18)]"
                >
                  Buy now
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[hsl(var(--brand-ink)/0.5)]">
                UPI · Cards · Net banking · Wallets
              </p>
            </div>

            {/* Trust row — flat, no cards */}
            <div className="mt-7 pt-6 border-t border-[hsl(var(--brand-gold)/0.2)] grid grid-cols-3 gap-2">
              {[
                { Mark: ParcelMark, label: "Free shipping" },
                { Mark: LockMark, label: "Secure payment" },
                { Mark: LotusSealMark, label: "GI certified" },
              ].map(({ Mark, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-1.5"
                >
                  <Mark className="w-[22px] h-[22px] text-[hsl(var(--brand-gold-deep))]" />
                  <span className="text-[11px] leading-tight text-[hsl(var(--brand-ink)/0.65)]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Details ──────────────────────────────────────────────
            Full width rather than stacked in the buy rail, which left
            the whole area beside the gallery empty. */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-12 border-t border-[hsl(var(--brand-gold)/0.2)]">
          <div className="lg:col-span-5">
            {product.description && (
              <>
                <h2 className="font-serif text-[19px] font-semibold text-[hsl(var(--brand-ink))]">
                  About this piece
                </h2>
                <p className="mt-4 max-w-[62ch] text-[14.5px] leading-[1.8] text-[hsl(var(--brand-ink)/0.75)] whitespace-pre-line">
                  {product.description}
                </p>
              </>
            )}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="font-serif text-[19px] font-semibold text-[hsl(var(--brand-ink))]">
              Details
            </h2>
            {/* Two columns so the table height matches the description
                beside it instead of running 380px past it. */}
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {specRows.map(([label, value]) => (
                <div
                  key={label}
                  className="border-t border-[hsl(var(--brand-ink)/0.1)] py-3.5"
                >
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-[hsl(var(--brand-ink)/0.5)]">
                    {label}
                  </dt>
                  <dd className="mt-1 text-[14px] leading-[1.5] text-[hsl(var(--brand-ink)/0.9)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Related ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[hsl(var(--brand-gold)/0.2)]">
            <h2 className="font-serif text-[22px] font-semibold text-[hsl(var(--brand-ink))] mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-9">
              {relatedProducts.map((relProduct) => {
                const relSave =
                  relProduct.original_price &&
                  relProduct.original_price > (relProduct.price || 0)
                    ? Math.round(
                        ((relProduct.original_price - (relProduct.price || 0)) /
                          relProduct.original_price) *
                          100,
                      )
                    : 0
                return (
                  <Link
                    key={relProduct.id}
                    href={`/products/${relProduct.slug || relProduct.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-square bg-[hsl(var(--brand-paper))] rounded-lg overflow-hidden ring-1 ring-[hsl(var(--brand-ink)/0.07)]">
                      <OptimizedImage
                        src={
                          getImageTier(relProduct?.images, "thumb", 0) ||
                          "/images/products/product-placeholder.png"
                        }
                        alt={relProduct.name || relProduct.title || "Product"}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        sizes={getResponsiveSizes("grid")}
                        imageType="productCard"
                        priority={false}
                        loading="lazy"
                      />

                      {relSave > 0 && (
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-[hsl(var(--brand-paper)/0.95)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--brand-madder))]">
                          Save {relSave}%
                        </span>
                      )}

                      <button
                        onClick={(e) => handleQuickAdd(e, relProduct)}
                        aria-label={`Add ${relProduct.name || relProduct.title} to cart`}
                        className="absolute inset-x-2.5 bottom-2.5 h-9 rounded-full bg-[hsl(var(--brand-ink)/0.92)] text-[hsl(var(--brand-paper))] backdrop-blur-sm flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ease-out hover:bg-[hsl(var(--brand-ink))] lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>

                    <h3 className="mt-3 min-h-[2.6em] text-[13.5px] leading-[1.35] text-[hsl(var(--brand-ink)/0.85)] line-clamp-2">
                      {relProduct.name || relProduct.title}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-[15px] font-semibold text-[hsl(var(--brand-ink))] tabular-nums">
                        {formatPrice(relProduct.price || 0)}
                      </span>
                      {relSave > 0 && (
                        <span className="text-[12px] text-[hsl(var(--brand-ink)/0.4)] line-through tabular-nums">
                          {formatPrice(relProduct.original_price || 0)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Reviews ──────────────────────────────────────────── */}
        <section
          id="reviews-section"
          className="mt-16 pt-12 border-t border-[hsl(var(--brand-gold)/0.2)]"
        >
          <ProductReviews
            productId={product.id}
            productName={product.title || product.name}
          />
        </section>
      </div>

      {/* ── Docked purchase bar ──────────────────────────────────
          Rises once the buy block scrolls away, on every viewport. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 will-change-transform",
          "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          showBuyBar && !isImageModalOpen ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showBuyBar}
      >
        <div className="border-t border-[hsl(var(--brand-gold)/0.25)] bg-[hsl(var(--brand-paper)/0.92)] backdrop-blur-xl shadow-[0_-6px_28px_rgba(26,21,18,0.09)]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
            <div className="relative w-11 h-14 rounded-md overflow-hidden shrink-0 hidden sm:block ring-1 ring-[hsl(var(--brand-ink)/0.08)]">
              <OptimizedImage
                src={mainProductImage}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
                imageType="thumbnail"
                priority={false}
              />
            </div>

            <div className="min-w-0 flex-1 sm:flex-none sm:w-auto">
              <p className="hidden sm:block text-[13px] text-[hsl(var(--brand-ink)/0.75)] truncate max-w-[220px]">
                {productName}
              </p>
              <p className="text-[18px] sm:text-[17px] font-semibold text-[hsl(var(--brand-ink))] tabular-nums leading-tight">
                {formatPrice(product.price || 0)}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-auto shrink-0 flex-1 sm:flex-none justify-end">
              <button
                onClick={handleAddToCart}
                aria-label={madeToOrder ? "Pre-order" : "Add to cart"}
                className="h-11 w-11 sm:w-auto sm:px-6 rounded-full ring-1 ring-[hsl(var(--brand-ink)/0.5)] text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.06)] transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline text-[12px] font-semibold uppercase tracking-[0.14em]">
                  {madeToOrder ? "Pre-order" : "Add"}
                </span>
              </button>
              <button
                onClick={handleBuyNow}
                className="h-11 flex-1 sm:flex-none sm:w-44 max-w-[220px] rounded-full bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-paper))] hover:bg-[hsl(var(--brand-ink-soft))] transition-colors text-[12px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          IMAGE DIRECT ZOOM MODAL (No magnifying glass!)
      ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none"
            onClick={handleCloseZoomModal}
          >
            {/* Top Bar with Controls */}
            <div
              className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Counter */}
              <div className="text-white/80 font-sans text-xs font-medium tracking-widest uppercase">
                {product.images && product.images.length > 1 && (
                  <span>
                    {modalImageIndex + 1} / {product.images.length}
                  </span>
                )}
              </div>

              {/* Floating Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-1 text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs tabular-nums text-white/90 px-1 min-w-[42px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3.5}
                  className="p-1 text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={resetZoom}
                    className="ml-1 text-[10px] uppercase font-bold tracking-wider text-[hsl(var(--brand-gold))] hover:text-white px-2 py-0.5 rounded transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                onClick={handleCloseZoomModal}
                aria-label="Close fullscreen view"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Next / Prev Navigation Buttons */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={handleModalPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/15 transition-all active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleModalNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/15 transition-all active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Canvas Container (Smooth click to zoom & pan) */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 pt-16 pb-20 select-none touch-none"
              onClick={handleClickCanvas}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "zoom-in",
              }}
            >
              <div
                className="relative w-full h-full max-w-5xl max-h-[82vh] flex items-center justify-center select-none pointer-events-none"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <OptimizedImage
                  src={modalImageSrc}
                  alt="Product Full View"
                  fill
                  priority={true}
                  className="object-contain select-none pointer-events-none"
                  variant="full"
                  sizes="100vw"
                />
              </div>
            </div>

            {/* Bottom Thumbnail Strip + Helper */}
            <div
              className="absolute bottom-3 left-0 right-0 z-30 px-4 flex flex-col items-center gap-2 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 max-w-full overflow-x-auto scrollbar-hide">
                  {(product.images || []).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setModalImageIndex(idx)
                        resetZoom()
                      }}
                      className={cn(
                        "relative w-10 h-14 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                        modalImageIndex === idx
                          ? "border-[hsl(var(--brand-gold))] scale-105 ring-1 ring-[hsl(var(--brand-gold))]"
                          : "border-white/30 opacity-60 hover:opacity-100",
                      )}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <OptimizedImage
                        src={thumbnailImages[idx] || "/images/products/product-placeholder.png"}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="40px"
                        imageType="thumbnail"
                        priority={false}
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="text-[11px] font-sans text-white/50 tracking-wider uppercase pointer-events-none text-center">
                Click to zoom • Drag to pan • Wheel to scale • Esc to close
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
