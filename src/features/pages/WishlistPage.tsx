"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useProductsByIds } from "@/shared/hooks/use-products";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action";
import { useAuth } from "@/shared/contexts/AuthContext";
import { cn, formatPrice } from "@/shared/utils";
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
import type { Product } from "@/shared/types";

// Colour roles as on the home page: charcoal text, midnight main button,
// white outline second button, gold for lines only, royal blue for focus rings.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2";
const primaryButton = `inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--brand-midnight))] font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] disabled:cursor-not-allowed disabled:bg-[hsl(var(--brand-midnight)/0.6)] ${focusRing}`;
const secondaryButton = `inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-turmeric-tint))] ${focusRing}`;

export default function WishlistPage() {
  const router = useRouter();
  const { user: firebaseUser } = useAuth();
  const wishlist = useWishlistStore();
  const cart = useCartStore();
  const hasHydrated = useWishlistStore((s) => s._hasHydrated);

  useEffect(() => {
    if (firebaseUser === null) {
      router.push("/login");
    }
  }, [firebaseUser, router]);

  // Exactly the saved products, not a lookup in a partial catalogue list.
  const {
    data: products = [],
    isLoading,
    isSuccess,
    isFetching,
    isPlaceholderData,
  } = useProductsByIds(wishlist.items);

  const wishlistItems = useMemo(
    () =>
      wishlist.items
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [wishlist.items, products],
  );

  // Drop saved products that were deleted or hidden, judged only against a
  // settled result for the current list.
  useEffect(() => {
    if (!isSuccess || isFetching || isPlaceholderData) return;
    const found = new Set(products.map((p) => p.id));
    wishlist.items.forEach((id) => {
      if (!found.has(id)) wishlist.removeItem(id);
    });
  }, [products, isSuccess, isFetching, isPlaceholderData, wishlist]);

  const handleRemove = (id: string, name: string) => {
    wishlist.removeItem(id);
    toast(`${name} removed from your wishlist`);
  };

  const handleMoveToCart = useAuthGuardedAction(
    (_event: unknown, product?: Product) => {
      if (!product) return;
      cart.addItem(product, 1);
      wishlist.removeItem(product.id);
      toast.success("Moved to cart", {
        description: isMadeToOrder(product)
          ? `Made to order. Ready in ${MADE_TO_ORDER_DAYS}.`
          : undefined,
      });
    },
  );

  const handleMoveAll = useAuthGuardedAction(() => {
    const count = wishlistItems.length;
    wishlistItems.forEach((product) => cart.addItem(product, 1));
    wishlist.clearWishlist();
    toast.success(`Moved ${count} ${count === 1 ? "item" : "items"} to cart`);
  });

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[hsl(var(--brand-paper))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand-ink))]" aria-label="Loading your wishlist" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[hsl(var(--brand-paper))] px-4 text-center text-[hsl(var(--brand-ink))]">
        <h1 className="font-serif text-[28px] leading-tight">Your wishlist is empty</h1>
        <TempleBellsDivider className="mt-2" />
        <p className="mt-3 font-sans text-[15px] text-[hsl(var(--brand-ink-soft))]">
          Tap the heart on any piece to save it here.
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
      {/* Page band: same as cart and checkout */}
      <div className="relative overflow-hidden border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]">
        <CornerFlorals className="absolute right-2 top-3 hidden h-16 w-16 opacity-70 sm:block md:right-4 md:h-20 md:w-20" />
        <CornerFlorals className="absolute bottom-3 left-2 hidden h-16 w-16 rotate-180 opacity-70 sm:block md:left-4 md:h-20 md:w-20" />
        <div className="relative mx-auto max-w-[1200px] px-4 py-8 text-center md:px-8 md:py-10">
          <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">Your wishlist</h1>
          <KalashDivider className="mt-2" />
          <p className="mt-2 font-sans text-[14px] tabular-nums text-[hsl(var(--brand-ink-soft))] md:text-[15px]">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        {wishlistItems.length > 1 && (
          <div className="mb-8 flex justify-end">
            <button type="button" onClick={handleMoveAll} className={cn(secondaryButton, "h-11 px-6")}>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Move all to cart
            </button>
          </div>
        )}

        <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
          {wishlistItems.map((product) => {
            const name = product.name || product.title || "Product";
            const price = product.price || 0;
            const originalPrice = product.original_price;
            const href = `/products/${product.slug || product.id}`;
            const madeToOrder = isMadeToOrder(product);
            const inCart =
              cart.items.find((item) => item.productId === product.id)?.quantity ?? 0;
            const atLimit = inCart >= getPurchasableQuantityLimit(product);

            return (
              <li key={product.id} className="flex flex-col font-sans">
                <div className="relative">
                  <Link
                    href={href}
                    className={cn(
                      "relative block aspect-[4/5] overflow-hidden rounded-sm bg-[hsl(var(--brand-indigo-tint))] shadow-[0_18px_36px_-26px_rgba(33,30,36,0.55)]",
                      focusRing,
                    )}
                  >
                    <OptimizedImage
                      src={
                        getImageTier(product.images, "thumb", 0) ||
                        product.mainImage ||
                        product.image ||
                        null
                      }
                      alt={name}
                      fill
                      className="object-cover"
                      imageType="productCard"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      placeholder="empty"
                    />
                    {/* Thin gold inner frame, as on the home cards */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[7px] z-10 rounded-[2px] border border-[hsl(var(--brand-gold-soft)/0.9)]"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id, name)}
                    aria-label={`Remove ${name} from wishlist`}
                    className={cn(
                      "absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[hsl(var(--brand-ink))] shadow-[0_6px_14px_-8px_rgba(33,30,36,0.6)] hover:bg-white",
                      focusRing,
                    )}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <Link href={href} className={cn("mt-3 block rounded-sm", focusRing)}>
                  <h2 className="line-clamp-2 min-h-[2.7em] font-sans text-[14px] font-semibold leading-snug">
                    {name}
                  </h2>
                </Link>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[15px] font-semibold tabular-nums">
                    {formatPrice(price)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-[13px] tabular-nums text-[hsl(var(--brand-muted))] line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
                {madeToOrder && (
                  <p className="mt-1 text-[14px] text-[hsl(var(--brand-ink-soft))]">
                    Made to order · ready in {MADE_TO_ORDER_DAYS}
                  </p>
                )}

                <button
                  type="button"
                  onClick={(e) => handleMoveToCart(e, product)}
                  disabled={atLimit}
                  className={cn(primaryButton, "mt-3 h-11 w-full")}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  {atLimit ? "In your cart" : "Move to cart"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
