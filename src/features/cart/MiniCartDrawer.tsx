"use client"

import { useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { AnimatePresence, motion } from "framer-motion"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { useCartStore } from "@/shared/cart-store"
import { useMiniCartStore } from "@/shared/mini-cart-store"
import { useProductsByIds } from "@/shared/hooks/use-products"
import { getImageTier } from "@/lib/image-tiers"
import { formatPrice } from "@/shared/utils"

/**
 * Confirmation surface for "Add to Cart" (Issue 08): shows what was added,
 * allows quantity changes in place, and offers both onward paths without
 * forcing the visitor off the page they were browsing.
 */
export default function MiniCartDrawer() {
  const { isOpen, lastAddedId, close } = useMiniCartStore()
  const cart = useCartStore()
  // Exactly the products in the cart, so an older piece that was just added
  // still shows up in its own confirmation drawer.
  const cartIds = useMemo(() => cart.items.map((item) => item.productId), [cart.items])
  const { data: products = [] } = useProductsByIds(cartIds)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const lines = useMemo(() => {
    if (!products.length) return []
    return cart.items
      .map((item) => ({
        ...item,
        product: products.find((p: any) => p.id === item.productId),
      }))
      .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } =>
        Boolean(l.product),
      )
  }, [cart.items, products])

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + (Number((l.product as any).price) || 0) * l.quantity,
        0,
      ),
    [lines],
  )

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  // Escape closes; body scroll is locked while the panel owns the screen.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-[hsl(var(--brand-ink)/0.5)] backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.32 }}
            className="fixed right-0 top-0 z-[61] flex h-[100dvh] w-full max-w-[420px] flex-col bg-white shadow-2xl outline-none"
          >
            <header className="flex items-center justify-between border-b border-[hsl(var(--brand-gold)/0.45)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-[hsl(var(--brand-ink))]" strokeWidth={1.5} aria-hidden="true" />
                <h2 className="font-serif text-[20px] text-[hsl(var(--brand-ink))]">
                  Your cart
                </h2>
                {itemCount > 0 && (
                  <span className="rounded-full bg-[hsl(var(--brand-midnight))] px-2 py-0.5 font-sans text-[12px] font-semibold tabular-nums text-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={close}
                aria-label="Close cart"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-[hsl(var(--brand-ink))]" strokeWidth={1.25} aria-hidden="true" />
                <p className="font-sans text-[15px] text-[hsl(var(--brand-ink-soft))]">
                  Your cart is empty.
                </p>
                <Link
                  href="/products"
                  onClick={close}
                  className="inline-flex h-12 items-center rounded-full bg-[hsl(var(--brand-midnight))] px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
                >
                  Shop now
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-[hsl(var(--brand-gold-ornament)/0.3)] overflow-y-auto overscroll-contain px-5">
                  {lines.map((line) => {
                    const p: any = line.product
                    const img = getImageTier(p.images, "thumb", 0) || p.image || p.mainImage || null
                    const isNew = line.productId === lastAddedId
                    const max = line.maxStock ?? 99
                    return (
                      <li
                        key={`${line.productId}-${line.variant ?? ""}`}
                        className={`flex gap-3.5 py-4 ${isNew ? "-mx-2 rounded-md bg-[hsl(var(--brand-turmeric-tint))] px-2" : ""}`}
                      >
                        <div className="relative h-[86px] w-[68px] shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-[hsl(var(--brand-gold)/0.5)]">
                          {/* Same image component as the cart page, which loads these photos */}
                          <OptimizedImage
                            src={img}
                            alt={p.name || p.title || "Product"}
                            fill
                            className="object-cover"
                            imageType="cartItem"
                            sizes="68px"
                            placeholder="empty"
                          />

                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <Link
                            href={`/products/${p.slug || p.id}`}
                            onClick={close}
                            className="line-clamp-2 rounded-sm font-sans text-[14px] font-semibold leading-snug text-[hsl(var(--brand-ink))] decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
                          >
                            {p.name || p.title}
                          </Link>
                          <span className="mt-1 font-sans text-[14px] font-semibold tabular-nums text-[hsl(var(--brand-ink))]">
                            {formatPrice(Number(p.price) || 0)}
                          </span>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full border border-[hsl(var(--brand-ink)/0.25)] bg-white">
                              <button
                                onClick={() =>
                                  cart.updateQuantity(line.productId, line.quantity - 1)
                                }
                                aria-label={`Decrease quantity of ${p.name || p.title}`}
                                className="flex h-9 w-9 items-center justify-center text-[hsl(var(--brand-ink-soft))] transition-colors hover:bg-[hsl(var(--brand-ink)/0.05)] hover:text-[hsl(var(--brand-ink))] disabled:opacity-40"
                                disabled={line.quantity <= 1}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[30px] text-center font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))]">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  cart.updateQuantity(line.productId, line.quantity + 1)
                                }
                                aria-label={`Increase quantity of ${p.name || p.title}`}
                                className="flex h-9 w-9 items-center justify-center text-[hsl(var(--brand-ink-soft))] transition-colors hover:bg-[hsl(var(--brand-ink)/0.05)] hover:text-[hsl(var(--brand-ink))] disabled:opacity-40"
                                disabled={line.quantity >= max}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => cart.removeItem(line.productId)}
                              aria-label={`Remove ${p.name || p.title} from cart`}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-[hsl(var(--brand-ink-soft))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint))] hover:text-[hsl(var(--brand-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <footer className="border-t border-[hsl(var(--brand-gold)/0.45)] px-5 py-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="font-sans text-[15px] font-semibold text-[hsl(var(--brand-ink))]">
                      Subtotal
                    </span>
                    <span className="text-[20px] font-semibold tabular-nums text-[hsl(var(--brand-ink))]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="mb-3.5 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                    Free shipping. Prices include all taxes.
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/checkout"
                      onClick={close}
                      className="flex h-12 items-center justify-center rounded-full bg-[hsl(var(--brand-midnight))] font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
                    >
                      Go to checkout
                    </Link>
                    <button
                      onClick={close}
                      className="flex h-12 items-center justify-center rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-turmeric-tint))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
                    >
                      Continue shopping
                    </button>
                    <Link
                      href="/cart"
                      onClick={close}
                      className="mx-auto rounded-sm py-1 text-center font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
                    >
                      View full cart
                    </Link>
                  </div>
                </footer>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
