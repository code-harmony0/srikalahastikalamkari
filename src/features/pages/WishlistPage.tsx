"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { useProductsByIds } from "@/shared/hooks/use-products";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action";
import { useAuth } from "@/shared/contexts/AuthContext";
import { formatPrice } from "@/shared/utils";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import {
  MADE_TO_ORDER_DAYS,
  getPurchasableQuantityLimit,
  isMadeToOrder,
} from "@/shared/lib/inventory";
import type { Product } from "@/shared/types";

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
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--brand-ink)/0.15)] border-t-[hsl(var(--brand-ink))]" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center text-[hsl(var(--brand-ink))]">
        <Heart
          className="h-10 w-10 text-[hsl(var(--brand-gold-deep))]"
          strokeWidth={1.25}
        />
        <h1 className="mt-5 font-serif text-[30px] font-semibold leading-tight">
          Your wishlist is empty
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-[30px] font-semibold leading-tight sm:text-[36px]">
              Your wishlist
            </h1>
            <span className="text-[14px] tabular-nums text-[hsl(var(--brand-ink)/0.6)]">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"}
            </span>
          </div>
          {wishlistItems.length > 1 && (
            <button
              onClick={handleMoveAll}
              className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-[12px] font-semibold uppercase tracking-[0.14em] ring-1 ring-[hsl(var(--brand-ink)/0.35)] transition-colors hover:bg-[hsl(var(--brand-ink)/0.05)]"
            >
              <ShoppingBag className="h-4 w-4" />
              Move all to cart
            </button>
          )}
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
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
              <li key={product.id} className="flex flex-col">
                <div className="relative">
                  <Link
                    href={href}
                    className="relative block aspect-[4/5] overflow-hidden rounded-lg bg-[hsl(var(--brand-paper))] ring-1 ring-[hsl(var(--brand-ink)/0.08)]"
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
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id, name)}
                    aria-label={`Remove ${name} from wishlist`}
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--brand-paper)/0.95)] text-[hsl(var(--brand-ink)/0.7)] shadow-[0_1px_4px_rgba(26,21,18,0.15)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <Link href={href} className="mt-3 block">
                  <h2 className="line-clamp-2 min-h-[2.7em] text-[14px] font-semibold leading-snug">
                    {name}
                  </h2>
                </Link>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[15px] font-semibold tabular-nums">
                    {formatPrice(price)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-[12.5px] tabular-nums text-[hsl(var(--brand-ink)/0.45)] line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
                {madeToOrder && (
                  <p className="mt-1 text-[12.5px] text-[hsl(var(--brand-gold-deep))]">
                    Made to order · ready in {MADE_TO_ORDER_DAYS}
                  </p>
                )}

                <button
                  onClick={(e) => handleMoveToCart(e, product)}
                  disabled={atLimit}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--brand-ink))] text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-paper))] transition-colors hover:bg-[hsl(var(--brand-ink-soft))] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
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
