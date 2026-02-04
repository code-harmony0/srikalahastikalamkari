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
      className="relative group p-2.5 rounded-full hover:bg-[#FFF8F0]/10 transition-all duration-300"
      aria-label={label}
    >
      <Icon
        strokeWidth={1.5} // Thinner, more elegant stroke
        className={cn(
          "w-[22px] h-[22px] transition-all duration-300 ease-out",

          // Default State
          "text-[#FFF8F0] group-hover:text-[#C19A5B]",

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
              "absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] text-[9px] font-bold rounded-full border border-[#3B2C23] shadow-sm",
              "bg-[#A4552A] text-[#FFF8F0]", // Consistent terracotta badge
            )}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-medium tracking-wide bg-[#3B2C23] text-[#FFF8F0] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-[#FFF8F0]/10 z-50">
        {label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#3B2C23] rotate-45 border-t border-l border-[#FFF8F0]/10"></span>
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
          background: `linear-gradient(to right, rgba(164, 85, 42, ${bgOpacity.get()}), rgba(59, 44, 35, ${bgOpacity.get()}))`,
          backdropFilter: "blur(8px)",
          boxShadow: `0 2px 8px rgba(0,0,0,${shadowOpacity.get()})`,
        }}
        className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-[#FFF8F0]/10 flex items-center"
      >
        <div className="max-w-[1280px] w-full mx-auto px-6 flex items-center justify-between h-full">
          {/* 1️⃣ LOGO BLOCK */}
          <Link
            href="/"
            className="flex items-center gap-3 group z-50 relative"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-md border border-[#FFF8F0]/20 group-hover:-translate-y-[2px] transition-all duration-300 ease-out">
              <Image
                src="/images/logo.jpg"
                alt="Srikalahasti Kalamkari Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#C19A5B] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-[16px] md:text-[18px] text-[#FFF8F0] leading-none tracking-tight uppercase group-hover:text-white transition-colors">
                SRIKALAHASTI
              </span>
              <span className="font-serif italic text-[18px] md:text-[20px] text-[#C19A5B] leading-none tracking-widest group-hover:text-[#D4AF7A] transition-colors mt-1">
                Kalamkari
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
                  "relative text-[15px] font-medium tracking-[0.02em] transition-all duration-200 py-1",
                  isActive(link.href)
                    ? "text-[#FFF8F0]"
                    : "text-[#FFF8F0]/90 hover:text-[#C19A5B]",
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
              className="md:hidden p-2 ml-1 text-[#FFF8F0]/90 hover:text-[#C19A5B] transition-colors active:scale-95"
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
              className="fixed inset-0 bg-[#3B2C23]/60 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-[56px] left-0 right-0 bg-[#FFF8F0] z-40 md:hidden overflow-hidden rounded-b-2xl shadow-2xl border-b border-[#A4552A]/20"
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
                        ? "text-[#A4552A] bg-[#A4552A]/5 font-bold"
                        : "text-[#3B2C23] hover:bg-[#A4552A]/5 hover:text-[#A4552A]",
                    )}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C19A5B]" />
                    )}
                  </Link>
                ))}

                <div className="h-px bg-[#3B2C23]/10 my-3" />

                <Link
                  href={user ? "/profile" : "/login"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-4 text-[#3B2C23] hover:text-[#A4552A] transition-colors rounded-lg hover:bg-[#A4552A]/5 font-medium"
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
