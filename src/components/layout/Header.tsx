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
      className="relative group p-2.5 rounded-full hover:bg-[#FAFAF8]/10 transition-all duration-300"
      aria-label={label}
    >
      <Icon
        strokeWidth={1.5} // Thinner, more elegant stroke
        className={cn(
          "w-[22px] h-[22px] transition-all duration-300 ease-out",

          // Default State
          "text-[#1A1512] group-hover:text-[#C19A5B]",

          // Hover Effects
          "group-hover:-translate-y-[2px]",

          // Variant Specifics
          variant === "wishlist" && isActive && "text-[#C19A5B]", // Gold text instead of fill
          variant === "cart" && "group-hover:rotate-3 origin-top",
        )}
      />

      {/* Badge */}
      {count > 0 && (
        <span
          className={cn(
            "absolute top-0.5 right-0.5 flex min-w-[16px] h-[16px] items-center justify-center rounded-full text-[9px] font-bold shadow-sm transition-transform duration-200",
            "bg-[#1A1512] text-[#FAFAF8]", // Charcoal badge
          )}
        >
          {count}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wide bg-[#1A1512] text-[#FAFAF8] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-[#FAFAF8]/10 z-50">
        {label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1512] rotate-45 border-t border-l border-[#FAFAF8]/10"></span>
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

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header
        className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-[#1A1512]/5 bg-[#FAFAF8]/[0.98] shadow-[0_1px_3px_rgba(26,21,18,0.04)] backdrop-blur-md md:h-[72px]"
      >
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 flex items-center justify-between h-full">
          {/* 1️⃣ LOGO BLOCK */}
          <Link
            href="/"
            className="flex items-center gap-3 group z-50 relative"
          >
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-md ring-1 ring-[#C19A5B]/25 group-hover:-translate-y-[1px] transition-all duration-300 ease-out bg-[#050302]">
              <Image
                src="/images/logo-transparent.png"
                alt="Srikalahasti Kalamkari Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-[#C19A5B]/10 opacity-0 group-hover:opacity-1 transition-opacity duration-300" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-serif font-bold text-[13px] md:text-[15px] text-[#1A1512] leading-none tracking-wide uppercase group-hover:text-[#C19A5B] transition-colors">
                SRIKALAHASTI KALAMKARI
              </span>
              <span className="font-serif italic text-[12px] md:text-[13px] text-[#1A1512]/60 leading-none tracking-[0.2em] mt-1.5">
                HERITAGE ART
              </span>
            </div>
          </Link>

          {/* 2️⃣ NAVIGATION MENU */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-[13px] uppercase font-bold tracking-[0.1em] transition-all duration-200 py-1",
                  isActive(link.href)
                    ? "text-[#1A1512]"
                    : "text-[#1A1512]/60 hover:text-[#C19A5B]",
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[#C19A5B]" />
                )}
                {!isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C19A5B] transition-all duration-200 group-hover:w-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* 3️⃣ ACTION ICONS */}
          <div className="flex items-center gap-3">
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
              className="md:hidden p-2 ml-1 text-[#1A1512] hover:text-[#C19A5B] transition-colors active:scale-95"
              aria-label="Toggle Menu"
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
            className="fixed inset-0 z-40 bg-[#1A1512]/60 backdrop-blur-sm md:hidden"
          />

          <div className="fixed top-[56px] left-0 right-0 bg-background kalamkari-static-background silk-fabric-texture z-40 md:hidden overflow-hidden rounded-b-2xl shadow-2xl border-b border-[#C19A5B]/20 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-lg font-medium py-3 px-4 rounded-lg transition-all duration-200 flex justify-between items-center",
                    isActive(link.href)
                      ? "text-[#1A1512] bg-[#1A1512]/5 font-bold"
                      : "text-[#1A1512]/70 hover:bg-[#1A1512]/5 hover:text-[#1A1512]",
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C19A5B]" />
                  )}
                </Link>
              ))}

              <div className="h-px bg-[#1A1512]/10 my-3" />

              <Link
                href={user ? "/profile" : "/login"}
                onClick={handleMobileProfileClick}
                className="flex items-center gap-3 py-3 px-4 text-[#1A1512]/70 hover:text-[#1A1512] transition-colors rounded-lg hover:bg-[#1A1512]/5 font-medium"
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
