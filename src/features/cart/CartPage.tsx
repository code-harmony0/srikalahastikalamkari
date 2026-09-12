"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useProductsByIds } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAuthModalStore } from "@/shared/auth-modal-store";
import { formatPrice } from "@/shared/utils";
import { getOrderTotals } from "@/shared/lib/order-totals";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  isMadeToOrder,
} from "@/shared/lib/inventory";

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
    cart.updateQuantity(productId, nextQuantity);
  };

  const handleRemoveItem = (productId: string, name: string) => {
    cart.removeItem(productId);
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
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--brand-ink)/0.15)] border-t-[hsl(var(--brand-ink))]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center text-[hsl(var(--brand-ink))]">
        <ShoppingBag
          className="h-10 w-10 text-[hsl(var(--brand-gold-deep))]"
          strokeWidth={1.25}
        />
        <h1 className="mt-5 font-serif text-[30px] font-semibold leading-tight">
          Your cart is empty
        </h1>
        <Link
          href="/products?category=Sarees"
          className="mt-7 inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[hsl(var(--brand-ink))] px-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-paper))] transition-colors hover:bg-[hsl(var(--brand-ink-soft))]"
        >
          Shop sarees
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-[hsl(var(--brand-ink))]">
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-serif text-[30px] font-semibold leading-tight sm:text-[36px]">
            Your cart
          </h1>
          <p className="text-[14px] tabular-nums text-[hsl(var(--brand-ink)/0.6)]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Items */}
          <ul className="divide-y divide-[hsl(var(--brand-ink)/0.1)] border-y border-[hsl(var(--brand-ink)/0.1)] lg:col-span-7">
            {cartItems.map(({ productId, quantity, product }) => {
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
                <li key={productId} className="flex gap-4 py-5 sm:gap-5">
                  <Link
                    href={href}
                    className="relative h-[120px] w-[90px] shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--brand-paper))] ring-1 ring-[hsl(var(--brand-ink)/0.08)]"
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

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={href} className="min-w-0">
                        <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug">
                          {name}
                        </h2>
                      </Link>
                      <p className="shrink-0 text-[15px] font-semibold tabular-nums">
                        {formatPrice(price * quantity)}
                      </p>
                    </div>

                    <p className="mt-1 text-[13px] tabular-nums text-[hsl(var(--brand-ink)/0.6)]">
                      {formatPrice(price)}
                      {originalPrice && originalPrice > price && (
                        <span className="ml-2 text-[hsl(var(--brand-ink)/0.4)] line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </p>

                    {madeToOrder && (
                      <p className="mt-1 text-[12.5px] text-[hsl(var(--brand-gold-deep))]">
                        Made to order · ready in {MADE_TO_ORDER_DAYS}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex h-10 items-center rounded-full ring-1 ring-[hsl(var(--brand-ink)/0.15)]">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(productId, quantity - 1, limit, madeToOrder)
                          }
                          disabled={quantity <= 1}
                          aria-label={`Decrease quantity of ${name}`}
                          className="flex h-full w-10 items-center justify-center rounded-l-full hover:bg-[hsl(var(--brand-ink)/0.05)] disabled:opacity-25 disabled:hover:bg-transparent"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-[14px] font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(productId, quantity + 1, limit, madeToOrder)
                          }
                          disabled={quantity >= limit}
                          aria-label={`Increase quantity of ${name}`}
                          className="flex h-full w-10 items-center justify-center rounded-r-full hover:bg-[hsl(var(--brand-ink)/0.05)] disabled:opacity-25 disabled:hover:bg-transparent"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(productId, name)}
                        className="inline-flex h-10 items-center gap-1.5 text-[13px] text-[hsl(var(--brand-ink)/0.6)] underline-offset-4 hover:underline"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Summary */}
          <aside className="lg:col-span-5">
            <div className="rounded-lg bg-[hsl(var(--brand-paper))] p-6 ring-1 ring-[hsl(var(--brand-ink)/0.08)] lg:sticky lg:top-24">
              <h2 className="font-serif text-[22px] font-semibold">Order summary</h2>

              <dl className="mt-5 space-y-3 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--brand-ink)/0.65)]">Subtotal</dt>
                  <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--brand-ink)/0.65)]">Shipping</dt>
                  <dd className="font-medium">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between border-t border-[hsl(var(--brand-ink)/0.1)] pt-5">
                <span className="text-[15px] font-semibold">Total</span>
                <span className="text-[24px] font-semibold tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-[hsl(var(--brand-ink)/0.55)]">
                Prices include all taxes.
              </p>

              {hasMadeToOrder && (
                <p className="mt-4 rounded-md bg-[hsl(var(--brand-cream))] px-3 py-2.5 text-[13px] leading-relaxed">
                  Includes a made-to-order piece, ready in {MADE_TO_ORDER_DAYS}.
                </p>
              )}

              <button
                onClick={goToCheckout}
                className="mt-6 h-[52px] w-full rounded-full bg-[hsl(var(--brand-ink))] text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-paper))] transition-colors hover:bg-[hsl(var(--brand-ink-soft))]"
              >
                Checkout
              </button>
              <p className="mt-3 text-center text-[12px] text-[hsl(var(--brand-ink)/0.55)]">
                Secure online payment · UPI, cards, net banking, wallets
              </p>
            </div>

            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
