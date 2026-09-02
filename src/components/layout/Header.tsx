"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, ShoppingBag, User, LogIn } from "lucide-react"; // Switched to 'User'
import { useCartStore } from "@/shared/cart-store";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAuthModalStore } from "@/shared/auth-modal-store";
import { useAuthGuardedAction } from "@/shared/hooks/use-auth-guarded-action";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/shared/utils";

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
      className="relative group p-2.5 rounded-full hover:bg-[hsl(var(--brand-ink)/0.06)] transition-all duration-300"
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
            "absolute top-0.5 right-0.5 flex min-w-[16px] h-[16px] items-center justify-center rounded-full text-[9px] font-bold shadow-sm transition-transform duration-200",
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
  const [mounted, setMounted] = useState(false);
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
              unoptimized />
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
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 md:justify-self-center whitespace-nowrap">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "group relative text-[13px] uppercase font-semibold tracking-[0.1em] transition-colors duration-200 py-1",
                  isActive(link.href)
                    ? "text-[hsl(var(--brand-ink))]"
                    : "text-[hsl(var(--brand-ink)/0.6)] hover:text-[hsl(var(--brand-gold-deep))]",
                )}
              >
                {link.label}
                {isActive(link.href) ? (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[hsl(var(--brand-gold))]" />
                ) : (
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full bg-[hsl(var(--brand-gold))] transition-all duration-200 group-hover:w-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* 3️⃣ ACTION ICONS */}
          <div className="flex items-center gap-1.5 md:gap-2 md:justify-self-end">
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
              className="md:hidden p-2 ml-0.5 rounded-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink)/0.06)] transition-colors active:scale-95"
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
      </header>

      {/* 📱 MOBILE MENU */}
      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-[hsl(var(--brand-ink)/0.6)] backdrop-blur-sm md:hidden"
          />

          <div id="mobile-menu" className="fixed top-[56px] left-0 right-0 bg-background kalamkari-static-background silk-fabric-texture z-40 md:hidden overflow-hidden rounded-b-2xl shadow-2xl border-b border-[hsl(var(--brand-gold)/0.2)] animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium py-3 px-4 rounded-lg transition-all duration-200 flex justify-between items-center",
                    isActive(link.href)
                      ? "text-[hsl(var(--brand-ink))] bg-[hsl(var(--brand-ink)/0.05)] font-bold"
                      : "text-[hsl(var(--brand-ink)/0.7)] hover:bg-[hsl(var(--brand-ink)/0.05)] hover:text-[hsl(var(--brand-ink))]",
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand-gold))]" />
                  )}
                </Link>
              ))}

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
