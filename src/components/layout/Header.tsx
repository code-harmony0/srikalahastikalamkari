"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Menu, X, Heart, ShoppingBag, User, LogIn } from "lucide-react"; // Switched to 'User'
import { useCartStore } from "@/shared/cart-store";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useAuth } from "@/shared/contexts/AuthContext";
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
}: {
  href: string;
  label: string;
  icon: any;
  count?: number;
  isActive?: boolean;
  variant?: "wishlist" | "cart" | "profile";
}) => {
  return (
    <Link
      href={href}
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
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={cn(
              "absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold rounded-full shadow-sm",
              "bg-[#1A1512] text-[#FAFAF8]", // Charcoal badge
            )}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>

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

  // Stores
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 📜 Scroll Effects
  const { scrollY } = useScroll();

  const headerHeight = useTransform(scrollY, [0, 50], ["72px", "64px"]);
  const mobileHeaderHeight = useTransform(scrollY, [0, 50], ["56px", "56px"]);
  const bgOpacity = useTransform(scrollY, [0, 50], [0.98, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 50], [0, 0.08]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <motion.header
        style={{
          height:
            typeof window !== "undefined" && window.innerWidth < 768
              ? mobileHeaderHeight
              : headerHeight,
          backgroundColor: `rgba(250, 250, 248, ${bgOpacity.get()})`,
          backdropFilter: "blur(12px)",
          boxShadow: `0 1px 3px rgba(26,21,18,${shadowOpacity.get()})`,
        }}
        className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-[#1A1512]/5 flex items-center"
      >
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 flex items-center justify-between h-full">
          {/* 1️⃣ LOGO BLOCK */}
          <Link
            href="/"
            className="flex items-center gap-3 group z-50 relative"
          >
            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden shadow-sm group-hover:-translate-y-[1px] transition-all duration-300 ease-out bg-white">
              <Image
                src="/images/logo.jpg"
                alt="Srikalahasti Kalamkari Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-[#C19A5B]/10 opacity-0 group-hover:opacity-1 transition-opacity duration-300" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-serif font-bold text-[16px] md:text-[18px] text-[#1A1512] leading-none tracking-wide uppercase group-hover:text-[#C19A5B] transition-colors">
                SRIKALAHASTI
              </span>
              <span className="font-serif italic text-[14px] md:text-[15px] text-[#1A1512]/60 leading-none tracking-[0.2em] mt-1.5">
                KALAMKARI
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
                  <motion.div
                    layoutId="activeNavUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#C19A5B] rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
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
            />

            {/* Cart */}
            <ActionIcon
              href="/cart"
              label="Cart"
              icon={ShoppingBag}
              variant="cart"
              count={mounted ? cart.items.filter(i => !!i.productId).reduce((acc, i) => acc + i.quantity, 0) : 0}
            />

            {/* Profile / Login */}
            <ActionIcon
              href={user ? "/profile" : "/login"}
              label={user ? "My Account" : "Sign In"}
              icon={user ? User : LogIn}
              variant="profile"
              isActive={!!user}
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
      </motion.header>

      {/* 📱 MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#1A1512]/60 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-[56px] left-0 right-0 bg-background kalamkari-static-background silk-fabric-texture z-40 md:hidden overflow-hidden rounded-b-2xl shadow-2xl border-b border-[#C19A5B]/20"
            >
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
                  onClick={() => setIsMobileMenuOpen(false)}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
