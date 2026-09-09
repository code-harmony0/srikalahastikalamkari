"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  User,
  LogIn,
  ChevronDown,
  Search,
} from "lucide-react";
import { useCartStore } from "@/shared/cart-store";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAuthModalStore } from "@/shared/auth-modal-store";
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/shared/utils";
import { useFilterCategories } from "@/shared/hooks/use-filter-categories";

// A nav panel is a map of the catalogue, not the catalogue itself. Longer
// category lists spill to the category page rather than growing the menu.
const SHOP_MENU_LIMIT = 6;

// 🎨 Custom Icon Component
const ActionIcon = ({
  href,
  label,
  icon: Icon,
  count = 0,
  isActive = false,
  variant = "profile",
  onClick,
}: {
  href: string;
  label: string;
  icon: any;
  count?: number;
  isActive?: boolean;
  variant?: "wishlist" | "cart" | "profile";
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative group flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--brand-ink)/0.06)] transition-all duration-300"
      aria-label={label}
    >
      <Icon
        strokeWidth={1.5} // Thinner, more elegant stroke
        className={cn(
          "w-[22px] h-[22px] transition-all duration-300 ease-out",

          // Default State
          "text-[hsl(var(--brand-ink))] group-hover:text-[hsl(var(--brand-gold))]",

          // Hover Effects
          "group-hover:-translate-y-[2px]",

          // Variant Specifics
          variant === "wishlist" && isActive && "text-[hsl(var(--brand-gold))]", // Gold text instead of fill
          variant === "cart" && "group-hover:rotate-3 origin-top",
        )}
      />

      {/* Badge */}
      {count > 0 && (
        <span
          className={cn(
            "absolute top-0 right-0 flex min-w-[18px] h-[18px] items-center justify-center rounded-full text-[11px] leading-none font-bold shadow-sm transition-transform duration-200",
            "bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-paper))]", // Charcoal badge
          )}
        >
          {count}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wide bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-paper))] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-[hsl(var(--brand-paper)/0.1)] z-50">
        {label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[hsl(var(--brand-ink))] rotate-45 border-t border-l border-[hsl(var(--brand-paper)/0.1)]"></span>
      </span>
    </Link>
  );
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Main Category -> Product Type, straight from the catalogue so the nav can
  // never drift from what the dashboard actually publishes.
  const { categories: shopCategories } = useFilterCategories();
  const pathname = usePathname();
  const router = useRouter();

  // Stores
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const { user } = useAuth();
  const { openModal } = useAuthModalStore();

  const handleWishlistClick = useAuthGuardedAction(() => {
    router.push("/wishlist");
  }, { redirectUrl: "/wishlist" });

  const handleCartClick = useAuthGuardedAction(() => {
    router.push("/cart");
  }, { redirectUrl: "/cart" });

  const handleProfileClick = useAuthGuardedAction(() => {
    router.push("/profile");
  }, { redirectUrl: "/profile" });

  const handleMobileProfileClick = useAuthGuardedAction((e) => {
    setIsMobileMenuOpen(false);
    router.push("/profile");
  }, { redirectUrl: "/profile" });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hover menus that close instantly feel broken when the pointer crosses the
  // gap between trigger and panel, so closing is deferred a beat.
  const openShop = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsShopOpen(true);
  }, []);

  const closeShop = useCallback((delay = 140) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsShopOpen(false), delay);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    searchInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isShopOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsShopOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isShopOpen]);

  // Close any open menu on route change.
  useEffect(() => {
    setIsShopOpen(false);
    setIsMobileMenuOpen(false);
    setMobileShopOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const categoryHref = (name: string) =>
    `/products?category=${encodeURIComponent(name)}`;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <>
      <header
        className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-[hsl(var(--brand-ink)/0.05)] bg-[hsl(var(--brand-paper))]/[0.98] shadow-[0_1px_3px_rgba(26,21,18,0.04)] backdrop-blur-md md:h-[72px]"
      >
        {/* Three-column grid on desktop so the centred nav reserves its own
            track. The previous absolutely-positioned nav sat outside the flow,
            so the wordmark overlapped the links as the viewport narrowed. */}
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 h-full gap-4 flex items-center justify-between md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6">
          {/* 1️⃣ LOGO BLOCK */}
          <Link
            href="/"
            className="flex items-center gap-3 group min-w-0 md:justify-self-start"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 group-hover:-translate-y-[1px] transition-transform duration-300 ease-out">
              <Image
                src="https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo-transparent/full"
                alt="Srikalahasti Kalamkari Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
                unoptimized
              />
            </div>
            {/* Below sm there is no room for the wordmark beside four actions;
                showing it only produced an ellipsis. The mark carries it. */}
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="font-serif font-bold text-[13px] lg:text-[15px] text-[hsl(var(--brand-ink))] leading-none tracking-wide uppercase group-hover:text-[hsl(var(--brand-gold-deep))] transition-colors truncate">
                Srikalahasti Kalamkari
              </span>
              <span className="hidden sm:block font-serif italic text-[11px] lg:text-[12px] text-[hsl(var(--brand-ink)/0.55)] leading-none tracking-[0.18em] mt-1.5 truncate">
                Heritage Art
              </span>
            </div>
          </Link>

          {/* 2️⃣ NAVIGATION MENU */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 md:justify-self-center whitespace-nowrap"
            onMouseLeave={() => closeShop()}
          >
            {navLinks.map((link) => {
              const linkClass = cn(
                "group relative text-[13px] uppercase font-semibold tracking-[0.1em] transition-colors duration-200 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))] focus-visible:ring-offset-2 rounded-sm",
                isActive(link.href)
                  ? "text-[hsl(var(--brand-ink))]"
                  : "text-[hsl(var(--brand-ink)/0.6)] hover:text-[hsl(var(--brand-gold-deep))]",
              );
              const underline = isActive(link.href) ? (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[hsl(var(--brand-gold))]" />
              ) : (
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full bg-[hsl(var(--brand-gold))] transition-all duration-200 group-hover:w-full" />
              );

              // Shop carries the catalogue, so it opens the category panel
              // instead of dropping the visitor on an unfiltered grid.
              if (link.label === "Shop" && shopCategories.length > 0) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={openShop}
                  >
                    <Link
                      href={link.href}
                      aria-expanded={isShopOpen}
                      aria-haspopup="true"
                      onFocus={openShop}
                      onClick={() => setIsShopOpen(false)}
                      className={cn(linkClass, "flex items-center gap-1.5")}
                    >
                      {link.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          isShopOpen && "rotate-180",
                        )}
                      />
                      {underline}
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onFocus={() => closeShop(0)}
                  className={linkClass}
                >
                  {link.label}
                  {underline}
                </Link>
              );
            })}
          </nav>

          {/* 3️⃣ ACTION ICONS */}
          <div className="flex items-center gap-1.5 md:gap-2 md:justify-self-end">
            {/* Search - Issue 01 asks for a prominent, always-reachable search.
                The shop page carries its own search field, so the header
                trigger stands down there rather than offering it twice. */}
            {!pathname.startsWith("/products") && (
            <button
              type="button"
              onClick={() => setIsSearchOpen((v) => !v)}
              aria-expanded={isSearchOpen}
              aria-controls="header-search"
              aria-label={isSearchOpen ? "Close search" : "Search products"}
              className="relative group flex h-11 w-11 items-center justify-center rounded-full hover:bg-[hsl(var(--brand-ink)/0.06)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))]"
            >
              <Search
                strokeWidth={1.5}
                className="w-[22px] h-[22px] text-[hsl(var(--brand-ink))] group-hover:text-[hsl(var(--brand-gold))] group-hover:-translate-y-[2px] transition-all duration-300 ease-out"
              />
            </button>
            )}

            {/* Wishlist */}
            <ActionIcon
              href="/wishlist"
              label="Wishlist"
              icon={Heart}
              variant="wishlist"
              count={mounted ? wishlist.items.filter(Boolean).length : 0}
              isActive={mounted && wishlist.items.filter(Boolean).length > 0}
              onClick={handleWishlistClick}
            />

            {/* Cart */}
            <ActionIcon
              href="/cart"
              label="Cart"
              icon={ShoppingBag}
              variant="cart"
              count={mounted ? cart.items.filter(i => !!i.productId).reduce((acc, i) => acc + i.quantity, 0) : 0}
              onClick={handleCartClick}
            />

            {/* Profile / Login */}
            <ActionIcon
              href={user ? "/profile" : "/login"}
              label={user ? "My Account" : "Sign In"}
              icon={user ? User : LogIn}
              variant="profile"
              isActive={!!user}
              onClick={handleProfileClick}
            />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex h-11 w-11 items-center justify-center ml-0.5 rounded-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.06)] transition-colors active:scale-95"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        {isSearchOpen && (
          <div
            id="header-search"
            className="absolute left-0 right-0 top-full border-t border-[hsl(var(--brand-ink)/0.06)] border-b border-[hsl(var(--brand-gold)/0.25)] bg-[hsl(var(--brand-paper))] shadow-[0_18px_40px_-18px_rgba(26,21,18,0.35)]"
          >
            <form
              onSubmit={submitSearch}
              className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-3 md:px-6"
            >
              <div className="relative flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[hsl(var(--brand-ink)/0.4)]"
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sarees, dupattas, fabrics"
                  aria-label="Search products"
                  className="h-12 w-full rounded-full border border-[hsl(var(--brand-ink)/0.14)] bg-[hsl(var(--brand-paper))] pl-11 pr-4 text-[15px] text-[hsl(var(--brand-ink))] placeholder:text-[hsl(var(--brand-ink)/0.42)] focus:border-[hsl(var(--brand-gold))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-gold)/0.25)]"
                />
              </div>
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-[hsl(var(--brand-ink))] px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--brand-paper))] transition-colors hover:bg-[hsl(var(--brand-gold-deep))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))]"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full text-[hsl(var(--brand-ink)/0.6)] hover:bg-[hsl(var(--brand-ink)/0.06)] sm:flex"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* CATEGORY PANEL - Main Category -> Product Type */}
        {isShopOpen && shopCategories.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full hidden md:block border-t border-[hsl(var(--brand-ink)/0.06)] border-b border-[hsl(var(--brand-gold)/0.25)] bg-[hsl(var(--brand-paper))] shadow-[0_18px_40px_-18px_rgba(26,21,18,0.35)]"
            onMouseEnter={openShop}
            onMouseLeave={() => closeShop()}
          >
            <div className="mx-auto grid max-w-[1280px] grid-cols-2 items-start gap-x-8 gap-y-7 px-6 py-8 lg:grid-cols-4">
              {shopCategories.map((category) => (
                <div key={category.id} className="min-w-0">
                  <Link
                    href={categoryHref(category.name)}
                    className="group inline-flex items-baseline gap-1.5 font-serif text-[15px] font-bold text-[hsl(var(--brand-ink))] hover:text-[hsl(var(--brand-gold-deep))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))] rounded-sm"
                  >
                    {category.name}
                  </Link>

                  {category.subcategories.length > 0 && (
                    <ul className="mt-3 space-y-1.5 border-l border-[hsl(var(--brand-gold)/0.25)] pl-3">
                      {category.subcategories.slice(0, SHOP_MENU_LIMIT).map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={categoryHref(sub.name)}
                            className="block truncate text-[13px] leading-relaxed text-[hsl(var(--brand-ink)/0.62)] hover:text-[hsl(var(--brand-ink))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))] rounded-sm"
                          >
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                      {category.subcategories.length > SHOP_MENU_LIMIT && (
                        <li>
                          <Link
                            href={categoryHref(category.name)}
                            className="block text-[13px] font-semibold text-[hsl(var(--brand-gold-deep))] hover:text-[hsl(var(--brand-ink))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))] rounded-sm"
                          >
                            {category.subcategories.length - SHOP_MENU_LIMIT} more
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-[hsl(var(--brand-ink)/0.06)]">
              <div className="mx-auto flex max-w-[1280px] items-center justify-end gap-4 px-6 py-3.5">
                <Link
                  href="/products"
                  className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-gold-deep))] hover:text-[hsl(var(--brand-ink))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))] rounded-sm"
                >
                  View all products
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 📱 MOBILE MENU */}
      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-[hsl(var(--brand-ink)/0.6)] backdrop-blur-sm md:hidden"
          />

          <div id="mobile-menu" className="fixed top-[56px] left-0 right-0 bg-background kalamkari-static-background silk-fabric-texture z-40 md:hidden overflow-hidden rounded-b-2xl shadow-2xl border-b border-[hsl(var(--brand-gold)/0.2)] animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col p-6 gap-2 max-h-[calc(100vh-56px)] overflow-y-auto overscroll-contain">
              {navLinks.map((link) => {
                const rowClass = cn(
                  "text-lg font-medium py-3 px-4 rounded-lg transition-all duration-200 flex justify-between items-center min-h-[44px]",
                  isActive(link.href)
                    ? "text-[hsl(var(--brand-ink))] bg-[hsl(var(--brand-ink)/0.05)] font-bold"
                    : "text-[hsl(var(--brand-ink)/0.7)] hover:bg-[hsl(var(--brand-ink)/0.05)] hover:text-[hsl(var(--brand-ink))]",
                );

                // Same two-level hierarchy as desktop, so navigation does not
                // change shape between devices.
                if (link.label === "Shop" && shopCategories.length > 0) {
                  return (
                    <div key={link.href} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setMobileShopOpen((v) => !v)}
                        aria-expanded={mobileShopOpen}
                        aria-controls="mobile-shop-categories"
                        className={cn(rowClass, "w-full text-left")}
                      >
                        {link.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "w-5 h-5 transition-transform duration-200",
                            mobileShopOpen && "rotate-180",
                          )}
                        />
                      </button>

                      {mobileShopOpen && (
                        <div
                          id="mobile-shop-categories"
                          className="mt-1 ml-4 flex flex-col gap-1 border-l border-[hsl(var(--brand-gold)/0.3)] pl-3"
                        >
                          {shopCategories.map((category) => (
                            <div key={category.id} className="py-1">
                              <Link
                                href={categoryHref(category.name)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-[44px] items-center font-serif text-[15px] font-bold text-[hsl(var(--brand-ink))] px-2 rounded-md hover:bg-[hsl(var(--brand-ink)/0.05)]"
                              >
                                {category.name}
                              </Link>
                              {category.subcategories.length > 0 && (
                                <div className="flex flex-col">
                                  {category.subcategories.slice(0, SHOP_MENU_LIMIT).map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={categoryHref(sub.name)}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="flex min-h-[40px] items-center px-2 text-[14px] text-[hsl(var(--brand-ink)/0.62)] rounded-md hover:bg-[hsl(var(--brand-ink)/0.05)] hover:text-[hsl(var(--brand-ink))]"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          <Link
                            href="/products"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex min-h-[44px] items-center px-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-gold-deep))]"
                          >
                            View all products
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={rowClass}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-gold))]" />
                    )}
                  </Link>
                );
              })}

              <div className="h-px bg-[hsl(var(--brand-ink)/0.1)] my-3" />

              <Link
                href={user ? "/profile" : "/login"}
                onClick={handleMobileProfileClick}
                className="flex items-center gap-3 py-3 px-4 text-[hsl(var(--brand-ink)/0.7)] hover:text-[hsl(var(--brand-ink))] transition-colors rounded-lg hover:bg-[hsl(var(--brand-ink)/0.05)] font-medium"
              >
                {user ? (
                  <User className="w-5 h-5" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                <span>{user ? "My Profile" : "Sign In / Join"}</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
