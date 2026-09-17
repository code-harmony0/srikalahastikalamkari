"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProductsByIds } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAuthModalStore } from "@/shared/auth-modal-store";
import { cn, formatPrice } from "@/shared/utils";
import { getOrderTotals } from "@/shared/lib/order-totals";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  isMadeToOrder,
} from "@/shared/lib/inventory";
import {
  CornerFlorals,
  KalashDivider,
  TempleBellsDivider,
} from "@/shared/ui/heritage-ornaments";

// Colour roles as on the home page: charcoal text, midnight main button,
// gold for lines only, royal blue for focus rings.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2";
const primaryButton = `inline-flex items-center justify-center gap-2.5 rounded-full bg-[hsl(var(--brand-midnight))] font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] ${focusRing}`;
const textLink = `inline-flex items-center gap-1.5 rounded-sm font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))] ${focusRing}`;

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { openModal } = useAuthModalStore();
  const cart = useCartStore();
  const hasHydrated = useCartStore((s) => s._hasHydrated);

  // Fetch exactly the products in the cart. Looking them up in a partial
  // catalogue list made older products vanish from customers' carts.
  const cartIds = useMemo(
    () => cart.items.map((item) => item.productId),
    [cart.items],
  );
  const {
    data: products = [],
    isLoading: productsLoading,
    isSuccess,
    isFetching,
    isPlaceholderData,
  } = useProductsByIds(cartIds);

  useEffect(() => {
    if (!authLoading && !user) {
      openModal("/cart");
    }
  }, [user, authLoading, openModal]);

  const cartItems = useMemo(
    () =>
      cart.items
        .map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId),
        }))
        .filter(
          (
            item,
          ): item is typeof item & {
            product: NonNullable<typeof item.product>;
          } => Boolean(item.product),
        ),
    [cart.items, products],
  );

  // Remove items whose product was deleted or hidden — judged only against a
  // settled result for the current cart, never a stale or failed request.
  useEffect(() => {
    if (!isSuccess || isFetching || isPlaceholderData) return;
    const found = new Set(products.map((p) => p.id));
    cart.items.forEach((item) => {
      if (!found.has(item.productId)) cart.removeItem(item.productId);
    });
  }, [products, isSuccess, isFetching, isPlaceholderData, cart]);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product.price || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );
  const { shipping, total } = getOrderTotals({ subtotal });
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const hasMadeToOrder = cartItems.some(({ product }) => isMadeToOrder(product));

  const handleUpdateQuantity = (
    productId: string,
    nextQuantity: number,
    limit: number,
    madeToOrder: boolean,
    selectedColor?: string,
  ) => {
    if (nextQuantity < 1) return;
    if (nextQuantity > limit) {
      toast.error(
        madeToOrder
          ? `Made-to-order quantity is limited to ${limit}`
          : `Only ${limit} in stock`,
      );
      return;
    }
    cart.updateQuantity(productId, nextQuantity, selectedColor);
  };

  const handleRemoveItem = (productId: string, name: string, selectedColor?: string) => {
    cart.removeItem(productId, selectedColor);
    toast(`${name} removed from your cart`);
  };

  const goToCheckout = () => {
    if (!authLoading && !user) {
      openModal("/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (!hasHydrated || productsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[hsl(var(--brand-paper))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand-ink))]" aria-label="Loading your cart" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[hsl(var(--brand-paper))] px-4 text-center text-[hsl(var(--brand-ink))]">
        <h1 className="font-serif text-[28px] leading-tight">Your cart is empty</h1>
        <TempleBellsDivider className="mt-2" />
        <p className="mt-3 font-sans text-[15px] text-[hsl(var(--brand-ink-soft))]">
          Add a piece you like, then come back here.
        </p>
        <Link href="/products?category=Sarees" className={cn(primaryButton, "mt-6 h-12 px-8")}>
          Shop sarees
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      {/* Page band: same as checkout */}
      <div className="relative overflow-hidden border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]">
        <CornerFlorals className="absolute right-2 top-3 hidden h-16 w-16 opacity-70 sm:block md:right-4 md:h-20 md:w-20" />
        <CornerFlorals className="absolute bottom-3 left-2 hidden h-16 w-16 rotate-180 opacity-70 sm:block md:left-4 md:h-20 md:w-20" />
        <div className="relative mx-auto max-w-[1200px] px-4 py-8 text-center md:px-8 md:py-10">
          <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">Your cart</h1>
          <KalashDivider className="mt-2" />
          <p className="mt-2 font-sans text-[14px] tabular-nums text-[hsl(var(--brand-ink-soft))] md:text-[15px]">
            {itemCount} {itemCount === 1 ? "item" : "items"} · Free shipping across India
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Items */}
          <ul className="self-start divide-y divide-[hsl(var(--brand-gold-ornament)/0.3)] border-y border-[hsl(var(--brand-gold)/0.45)] lg:col-span-7">
            {cartItems.map(({ productId, quantity, product, selectedColor }) => {
              const name = product.name || "Product";
              const price = product.price || 0;
              const originalPrice = product.original_price;
              const madeToOrder = isMadeToOrder(product);
              const limit = getPurchasableQuantityLimit(product);
              const href = `/products/${product.slug || product.id}`;
              const imageRef =
                getImageTier(product.images, "thumb", 0) ||
                product.image ||
                product.mainImage ||
                null;

              return (
                <li key={`${productId}-${selectedColor ?? ""}`} className="flex gap-4 py-5 sm:gap-5">
                  <Link
                    href={href}
                    className={cn(
                      "relative h-[120px] w-[90px] shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-[hsl(var(--brand-gold)/0.5)]",
                      focusRing,
                    )}
                  >
                    <OptimizedImage
                      src={imageRef}
                      alt={name}
                      fill
                      className="object-cover"
                      imageType="cartItem"
                      sizes="90px"
                      loading="lazy"
                      placeholder="empty"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col font-sans">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={href} className={cn("min-w-0 rounded-sm", focusRing)}>
                        <h2 className="line-clamp-2 font-sans text-[15px] font-semibold leading-snug">
                          {name}
                        </h2>
                      </Link>
                      <p className="shrink-0 text-[15px] font-semibold tabular-nums">
                        {formatPrice(price * quantity)}
                      </p>
                    </div>

                    {selectedColor && (
                      <p className="mt-1 text-[14px] text-[hsl(var(--brand-ink-soft))]">
                        Color: {selectedColor}
                      </p>
                    )}

                    <p className="mt-1 text-[14px] tabular-nums text-[hsl(var(--brand-ink-soft))]">
                      {formatPrice(price)}
                      {originalPrice && originalPrice > price && (
                        <span className="ml-2 text-[hsl(var(--brand-muted))] line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </p>

                    {madeToOrder && (
                      <p className="mt-1 text-[14px] text-[hsl(var(--brand-ink-soft))]">
                        Made to order · ready in {MADE_TO_ORDER_DAYS}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex h-11 items-center rounded-full border border-[hsl(var(--brand-ink)/0.25)] bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(productId, quantity - 1, limit, madeToOrder, selectedColor)
                          }
                          disabled={quantity <= 1}
                          aria-label={`Decrease quantity of ${name}`}
                          className={cn(
                            "flex h-full w-10 items-center justify-center rounded-l-full hover:bg-[hsl(var(--brand-indigo-tint))] disabled:text-[hsl(var(--brand-ink)/0.3)] disabled:hover:bg-transparent",
                            focusRing,
                          )}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-7 text-center text-[15px] font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(productId, quantity + 1, limit, madeToOrder, selectedColor)
                          }
                          disabled={quantity >= limit}
                          aria-label={`Increase quantity of ${name}`}
                          className={cn(
                            "flex h-full w-10 items-center justify-center rounded-r-full hover:bg-[hsl(var(--brand-indigo-tint))] disabled:text-[hsl(var(--brand-ink)/0.3)] disabled:hover:bg-transparent",
                            focusRing,
                          )}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(productId, name, selectedColor)}
                        className={cn(
                          "inline-flex h-11 items-center gap-1.5 rounded-sm px-1 text-[14px] text-[hsl(var(--brand-ink-soft))] underline-offset-4 hover:text-[hsl(var(--brand-ink))] hover:underline",
                          focusRing,
                        )}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Summary: turmeric panel, same as checkout */}
          <aside className="lg:col-span-5">
            <div className="rounded-sm border border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-turmeric-tint))] p-6 lg:sticky lg:top-24">
              <h2 className="font-serif text-[22px] leading-tight">Order summary</h2>

              <dl className="mt-5 space-y-3 font-sans text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--brand-ink-soft))]">Subtotal</dt>
                  <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--brand-ink-soft))]">Shipping</dt>
                  <dd className="font-medium">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between border-t border-[hsl(var(--brand-gold-ornament)/0.3)] pt-5 font-sans">
                <span className="text-[16px] font-semibold">Total</span>
                <span className="text-[24px] font-semibold tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mt-1 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                Prices include all taxes.
              </p>

              {hasMadeToOrder && (
                <p className="mt-4 rounded-md border border-[hsl(var(--brand-gold)/0.5)] bg-white px-3 py-2.5 font-sans text-[14px] leading-relaxed">
                  Includes a made-to-order piece, ready in {MADE_TO_ORDER_DAYS}.
                </p>
              )}

              <button
                type="button"
                onClick={goToCheckout}
                className={cn(primaryButton, "mt-6 h-[52px] w-full")}
              >
                Go to checkout
              </button>
              <p className="mt-3 text-center font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                Pay online by UPI, card, net banking or wallet
              </p>
            </div>

            <Link href="/products" className={cn(textLink, "mt-6")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
