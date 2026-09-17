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
  ArrowRight,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import { formatPrice, cn } from "@/shared/utils"
import { parseColorEntry } from "@/shared/lib/color-swatch"
import { STORE_WHATSAPP_NUMBER } from "@/shared/lib/whatsapp"
import { getImageTier } from "@/lib/image-tiers"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import {
  ParcelMark,
  LockMark,
  LotusSealMark,
} from "@/shared/ui/craft-marks"
import { CuratedProductCard } from "./CuratedProductCard"
import { ProductReviews } from "./ProductReviews"
import { useReviews } from "@/shared/hooks/use-reviews"
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  getStockQuantity,
  isMadeToOrder,
} from "@/shared/lib/inventory"

// Colour roles as on the home page: charcoal text, midnight main button,
// white outline second button, gold for lines only, royal blue for focus rings.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
const primaryButton = `inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--brand-midnight))] font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] ${focusRing}`
const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-turmeric-tint))] ${focusRing}`
const textLink = `inline-flex items-center gap-1.5 rounded-sm font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] transition-colors hover:decoration-[hsl(var(--brand-ink))] ${focusRing}`
const crumbLink = `rounded-sm underline decoration-transparent decoration-2 underline-offset-[5px] transition-colors hover:text-[hsl(var(--brand-ink))] hover:decoration-[hsl(var(--brand-gold))] ${focusRing}`
const iconButton = `flex h-11 w-11 items-center justify-center rounded-full text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint))] ${focusRing}`

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
  // Swipe on the main photo (phones): a sideways drag changes the photo
  // and must not also open the zoom view.
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const swipedRef = useRef(false)
  const [pageUrl, setPageUrl] = useState("")

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
      // Closing the share sheet rejects the promise; that is not an error.
      navigator
        .share({
          title: product?.name || product?.title,
          url: window.location.href,
        })
        .catch(() => {})
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

  // The real page address (with domain) for the WhatsApp question.
  useEffect(() => {
    setPageUrl(window.location.href)
  }, [slug])

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
    // Care for anything worn or used as cloth; wall paintings are not washed.
    if (!/wall|painting/i.test(product?.categoryName ?? "")) {
      push("Care", "Dry clean only, at a professional cleaner.\nDo not hand wash or machine wash.")
    }
    // Dispatch time for ready pieces isn't confirmed, so only made-to-order
    // pieces state a timeline.
    if (madeToOrder) {
      push("Dispatch", `Handmade to order, ready in ${MADE_TO_ORDER_DAYS}`)
    }

    return rows
  }, [product?.specifications, product?.categoryName, madeToOrder])

  if (isLoading) {
    // Same shape as the loaded page, so nothing jumps when the piece arrives.
    const block = "animate-pulse rounded-sm bg-[hsl(var(--brand-ink)/0.07)]"
    return (
      <div
        aria-busy="true"
        aria-label="Loading this piece"
        className="min-h-screen bg-[hsl(var(--brand-paper))]"
      >
        <div className="h-[49px] border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 py-7 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:py-10">
          <div className={cn(block, "aspect-[4/5] lg:col-span-6 lg:ml-[84px]")} />
          <div className="space-y-4 lg:col-span-6">
            <div className={cn(block, "h-10 w-4/5")} />
            <div className={cn(block, "h-4 w-1/3")} />
            <div className={cn(block, "mt-8 h-9 w-2/5")} />
            <div className={cn(block, "h-4 w-1/2")} />
            <div className="flex gap-3 pt-6">
              <div className={cn(block, "h-[52px] flex-[40] rounded-full")} />
              <div className={cn(block, "h-[52px] flex-[60] rounded-full")} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[hsl(var(--brand-paper))] flex flex-col items-center justify-center px-4 text-center">
        <Package
          className="h-10 w-10 text-[hsl(var(--brand-ink))] mb-4"
          strokeWidth={1.25}
        />
        <h1 className="font-serif text-[28px] text-[hsl(var(--brand-ink))]">
          We couldn&apos;t find that piece
        </h1>
        <Link href="/products" className={cn(primaryButton, "mt-6 h-12 px-8")}>
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
  const categoryName = product.categoryName || null
  const askOnWhatsAppUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    ["Hello, I have a question about this piece:", productName, pageUrl].filter(Boolean).join("\n"),
  )}`
  const pieceColours = (product.colors ?? []).filter(
    (color): color is string => typeof color === "string" && color.trim().length > 0,
  )
  const diamond = (
    <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[hsl(var(--brand-ink-soft))]" />
  )

  return (
    <div className="min-h-screen bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      {/* ── Breadcrumb: pale indigo strip with a gold line, like the shop band ── */}
      <div className="border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2.5 font-sans text-[13px] text-[hsl(var(--brand-ink-soft))]"
          >
            <Link href="/" className={crumbLink}>
              Home
            </Link>
            <span aria-hidden className="text-[hsl(var(--brand-muted))]">/</span>
            <Link href="/products" className={crumbLink}>
              Shop
            </Link>
            <span aria-hidden className="text-[hsl(var(--brand-muted))]">/</span>
            {categoryName && (
              <>
                <Link
                  href={`/products?category=${encodeURIComponent(categoryName)}`}
                  className={cn(crumbLink, "shrink-0")}
                >
                  {categoryName}
                </Link>
                <span aria-hidden className="text-[hsl(var(--brand-muted))]">/</span>
              </>
            )}
            <span aria-current="page" className="min-w-0 truncate font-medium text-[hsl(var(--brand-ink))] sm:max-w-md">
              {productName}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        {/* ── Buy block: gallery + purchase column ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 py-7 lg:py-10 items-start">
          {/* Gallery */}
          <div className="lg:col-span-6 flex flex-col-reverse lg:flex-row gap-3 lg:gap-4">
            {product?.images && product.images.length > 1 && (
              <div className="hidden lg:flex lg:flex-col gap-3 shrink-0 p-1">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    aria-current={selectedImageIndex === idx}
                    className={cn(
                      "relative w-[60px] h-[76px] rounded-sm overflow-hidden shrink-0 transition-shadow duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2",
                      selectedImageIndex === idx
                        ? "ring-2 ring-[hsl(var(--brand-midnight))] ring-offset-2 ring-offset-[hsl(var(--brand-paper))]"
                        : "ring-1 ring-[hsl(var(--brand-gold)/0.5)] hover:ring-[hsl(var(--brand-ink)/0.5)]",
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
              onClick={() => {
                if (swipedRef.current) {
                  swipedRef.current = false
                  return
                }
                handleOpenZoomModal()
              }}
              onTouchStart={(e) => {
                const touch = e.touches[0]
                swipeStartRef.current = { x: touch.clientX, y: touch.clientY }
              }}
              onTouchEnd={(e) => {
                const start = swipeStartRef.current
                swipeStartRef.current = null
                const total = product?.images?.length || 0
                if (!start || total <= 1) return
                const touch = e.changedTouches[0]
                const dx = touch.clientX - start.x
                const dy = touch.clientY - start.y
                if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
                swipedRef.current = true
                setSelectedImageIndex((prev) => (prev + (dx < 0 ? 1 : -1) + total) % total)
              }}
              className="group relative flex-1 min-w-0 w-full aspect-[4/5] bg-[hsl(var(--brand-indigo-tint))] rounded-sm overflow-hidden shadow-[0_18px_36px_-26px_rgba(33,30,36,0.55)] cursor-zoom-in select-none touch-pan-y"
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
              {/* Thin gold inner frame, the same line the home cards use */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[10px] z-[5] rounded-[2px] border border-[hsl(var(--brand-gold-soft)/0.9)]"
              />

              {/* Phones: swipe with dots instead of a thumbnail row, so the name and price come up sooner */}
              {product?.images && product.images.length > 1 && (
                <>
                  <p className="sr-only" aria-live="polite">
                    Photo {selectedImageIndex + 1} of {product.images.length}
                  </p>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center gap-1.5 lg:hidden"
                  >
                    {product.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "h-1.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-300",
                          idx === selectedImageIndex ? "w-5" : "w-1.5 opacity-70",
                        )}
                      />
                    ))}
                  </div>
                </>
              )}

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
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/95 text-[hsl(var(--brand-ink))] shadow-[0_6px_14px_-8px_rgba(33,30,36,0.6)] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 active:scale-95",
                      focusRing,
                    )}
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
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/95 text-[hsl(var(--brand-ink))] shadow-[0_6px_14px_-8px_rgba(33,30,36,0.6)] flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 active:scale-95",
                      focusRing,
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenZoomModal()
                }}
                aria-label="View larger photo"
                className={cn(
                  "absolute bottom-4 right-4 z-10 w-11 h-11 rounded-full bg-[hsl(var(--brand-midnight))] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-200 hover:bg-[hsl(var(--brand-midnight-hover))]",
                  focusRing,
                )}
              >
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Purchase column */}
          {/* Now that the details moved out, the rail is short enough to stick
              safely (~560px against a 900px viewport), so the buttons stay
              beside the gallery instead of leaving white space under them. */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            {/* Title + secondary actions */}
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-balance font-serif text-[20px] md:text-[24px] leading-snug text-[hsl(var(--brand-ink))]">
                {productName}
              </h1>
              <div className="flex items-center shrink-0 -mr-2 -mt-1">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={
                    isInWishlist ? "Remove from wishlist" : "Save to wishlist"
                  }
                  aria-pressed={isInWishlist}
                  className={iconButton}
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
                  type="button"
                  onClick={handleShare}
                  aria-label="Share this product"
                  className={iconButton}
                >
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            {/* Provenance + rating, one line */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
              <span>Hand-painted in Srikalahasti</span>
              {totalReviews > 0 && (
                <>
                  <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-[hsl(var(--brand-gold-ornament))]" />
                  <a
                    href="#reviews-section"
                    className={cn("flex items-center gap-1.5 rounded-sm hover:text-[hsl(var(--brand-ink))] transition-colors", focusRing)}
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
                    <span className="underline underline-offset-4 decoration-[hsl(var(--brand-gold))]">
                      {totalReviews}
                    </span>
                  </a>
                </>
              )}
            </div>

            {/* Price: plain sans figures */}
            <div className="mt-4 flex items-baseline flex-wrap gap-x-3 gap-y-2 font-sans">
              <span className="text-[24px] leading-none font-semibold text-[hsl(var(--brand-ink))] tabular-nums">
                {formatPrice(product.price || 0)}
              </span>
              {savePercent > 0 && (
                <>
                  <span className="text-[16px] text-[hsl(var(--brand-muted))] line-through tabular-nums">
                    {formatPrice(product.original_price || 0)}
                  </span>
                  <span className="self-center rounded-full border border-[hsl(var(--brand-gold-ornament)/0.7)] bg-white px-2.5 py-0.5 text-[13px] font-semibold text-[hsl(var(--brand-ink))] tabular-nums">
                    {savePercent}% off
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
              Price includes all taxes.
            </p>

            {/* Availability — one line, low stock wins */}
            <p className="mt-3 flex items-center gap-2 font-sans text-[14px] font-medium">
              <span
                aria-hidden
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  !inStock
                    ? "bg-[hsl(var(--brand-midnight))]"
                    : stockQuantity <= 5
                      ? "bg-[#8E2A1B]"
                      : "bg-[hsl(var(--brand-midnight))]",
                )}
              />
              {!inStock ? (
                <span className="text-[hsl(var(--brand-ink))]">
                  Made to order · ready in {MADE_TO_ORDER_DAYS}
                </span>
              ) : stockQuantity <= 5 ? (
                <span className="text-[#8E2A1B]">
                  Only {stockQuantity} left
                </span>
              ) : (
                <span className="text-[hsl(var(--brand-ink))]">
                  In stock
                </span>
              )}
            </p>

            {/* Colours painted in this piece. Shown as facts, not a picker:
                each piece is hand-painted once and the cart has no colour choice. */}
            {pieceColours.length > 0 && (
              <div className="mt-6">
                <p className="font-sans text-[14px] font-medium text-[hsl(var(--brand-ink))]">
                  Colours in this piece
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {pieceColours.map((color) => {
                    const { name, hex } = parseColorEntry(color)
                    return (
                      <li
                        key={color}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-[hsl(var(--brand-ink)/0.15)] bg-white pl-1.5 pr-3.5 font-sans text-[14px] text-[hsl(var(--brand-ink))]"
                      >
                        <span
                          aria-hidden
                          className="h-6 w-6 rounded-full ring-1 ring-inset ring-[hsl(var(--brand-ink)/0.2)]"
                          style={{ backgroundColor: hex || "#D1D5DB" }}
                        />
                        {name}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Quantity: only when more than one can be bought */}
            {purchasableLimit > 1 && (
            <div className="mt-6 flex items-center gap-3">
              <span className="font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                Quantity
              </span>
              <div className="flex items-center h-12 rounded-full border border-[hsl(var(--brand-ink)/0.25)] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className={cn("w-11 h-full flex items-center justify-center rounded-l-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-indigo-tint))] disabled:text-[hsl(var(--brand-ink)/0.3)] disabled:hover:bg-transparent transition-colors", focusRing)}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-sans text-[15px] font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(purchasableLimit, quantity + 1))
                  }
                  disabled={quantity >= purchasableLimit}
                  aria-label="Increase quantity"
                  className={cn("w-11 h-full flex items-center justify-center rounded-r-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-indigo-tint))] disabled:text-[hsl(var(--brand-ink)/0.3)] disabled:hover:bg-transparent transition-colors", focusRing)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            )}

            <div ref={buyBlockRef} className="mt-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={cn(secondaryButton, "h-[52px] flex-[40] min-w-0 px-4")}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {madeToOrder ? "Pre-order" : "Add"}
                    <span className="hidden sm:inline"> to cart</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className={cn(primaryButton, "h-[52px] flex-[60] min-w-0 px-4")}
                >
                  Buy now
                </button>
              </div>
            </div>

            {/* Good to know before paying: payment ways and the no-returns rule */}
            <ul className="mt-5 space-y-2 font-sans text-[14px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
              <li className="flex gap-2.5">
                {diamond}
                <span>Pay by UPI, card, net banking or wallet.</span>
              </li>
              <li className="flex gap-2.5">
                {diamond}
                <span>
                  All sales are final. No returns or refunds.{" "}
                  <Link
                    href="/returns"
                    className={cn(
                      "whitespace-nowrap rounded-sm font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))]",
                      focusRing,
                    )}
                  >
                    Read policy
                  </Link>
                </span>
              </li>
            </ul>
            <a
              href={askOnWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(textLink, "mt-4")}
            >
              <MessageCircle className="h-4 w-4 text-[#1F7A4D]" aria-hidden="true" />
              Ask about this piece on WhatsApp
            </a>

            {/* Fact strip: dotted gold lines and charcoal marks, as on the home page */}
            <ul className="mt-7 grid grid-cols-3 gap-2 border-y border-[hsl(var(--brand-gold)/0.45)] py-5">
              {[
                { Mark: ParcelMark, label: "Free shipping" },
                { Mark: LockMark, label: "Secure payment" },
                { Mark: LotusSealMark, label: "GI-registered craft" },
              ].map(({ Mark, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <Mark className="w-6 h-6 text-[hsl(var(--brand-ink))]" />
                  <span className="font-sans text-[13px] font-semibold leading-tight text-[hsl(var(--brand-ink))]">
                    {label}
                  </span>
                </li>
              ))}
            </ul>

          </div>
        </div>

      </div>

      {/* ── About + details: plain turmeric band ── */}
      <section
        aria-labelledby="piece-details"
        className="bg-[hsl(var(--brand-turmeric-tint))] py-12 md:py-16"
      >
        <div
          className={cn(
            "mx-auto grid max-w-[1200px] gap-10 px-5 sm:px-8 lg:gap-16",
            product.description && "lg:grid-cols-2",
          )}
        >
          {product.description && (
            <div>
              <h2 className="font-serif text-[20px] leading-tight text-[hsl(var(--brand-ink))] md:text-[22px]">
                About this piece
              </h2>
              <p className="mt-4 max-w-[62ch] font-sans text-[16px] leading-relaxed text-[hsl(var(--brand-ink-soft))] whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <div className={cn(!product.description && "mx-auto w-full max-w-2xl")}>
            <h2
              id="piece-details"
              className="font-serif text-[20px] leading-tight text-[hsl(var(--brand-ink))] md:text-[22px]"
            >
              Details
            </h2>
            <dl className="mt-4 border-t border-[hsl(var(--brand-gold-ornament)/0.5)]">
              {specRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-[hsl(var(--brand-gold-ornament)/0.35)] py-4"
                >
                  <dt className="font-sans text-[14px] font-medium text-[hsl(var(--brand-ink-soft))]">
                    {label}
                  </dt>
                  <dd className="font-sans text-[15px] leading-[1.5] text-[hsl(var(--brand-ink))] whitespace-pre-line">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Related: the home page's card and centred lotus heading ── */}
      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-pieces" className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="related-products"
                className="font-serif text-[22px] leading-tight text-[hsl(var(--brand-ink))] md:text-[24px]"
              >
                You may also like
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
              {relatedProducts.map((relProduct, index) => (
                <CuratedProductCard key={relProduct.id} product={relProduct} index={index} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/products" className={textLink}>
                See all products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews: shown only when real approved reviews exist, as on the home page ── */}
      {totalReviews > 0 && (
        <section
          id="reviews-section"
          aria-labelledby="reviews-title"
          className="bg-[hsl(var(--brand-madder-tint))] py-12 md:py-16"
        >
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="text-center">
              <h2
                id="reviews-title"
                className="font-serif text-[22px] leading-tight text-[hsl(var(--brand-ink))] md:text-[24px]"
              >
                Reviews
              </h2>
            </div>
            <ProductReviews
              productId={product.id}
              productName={product.title || product.name}
            />
          </div>
        </section>
      )}

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
        <div className="border-t border-[hsl(var(--brand-gold)/0.55)] bg-white shadow-[0_-10px_28px_-18px_rgba(33,30,36,0.35)]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
            <div className="relative w-11 h-14 rounded-sm overflow-hidden shrink-0 hidden sm:block ring-1 ring-[hsl(var(--brand-gold)/0.5)]">
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
              <p className="hidden sm:block font-sans text-[14px] text-[hsl(var(--brand-ink-soft))] truncate max-w-[260px]">
                {productName}
              </p>
              <p className="font-sans text-[18px] font-semibold text-[hsl(var(--brand-ink))] tabular-nums leading-tight">
                {formatPrice(product.price || 0)}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-auto shrink-0 flex-1 sm:flex-none justify-end">
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={madeToOrder ? "Pre-order" : "Add to cart"}
                className={cn(secondaryButton, "h-11 w-11 shrink-0 sm:w-auto sm:px-6")}
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {madeToOrder ? "Pre-order" : "Add"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className={cn(primaryButton, "h-11 flex-1 sm:flex-none sm:w-44 max-w-[220px] whitespace-nowrap")}
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
              <div className="text-[12px] font-sans text-white/85 tracking-wide pointer-events-none text-center">
                Tap or click to zoom · Drag to move · Esc to close
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
