"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingCart, User, ChevronDown, LogIn, UserPlus, LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useCartStore } from '@/shared/cart-store';
import { useWishlistStore } from '@/shared/wishlist-store';
import { useAuth } from '@/shared/contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cart = useCartStore();
  const wishlist = useWishlistStore();
  const { user } = useAuth();

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Header scroll effect with shrink and blur
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [72, 56]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 8]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.85]);

  const navLinks = [
    {
      label: 'Home',
      href: '/',
      hasDropdown: false
    },
    {
      label: 'Shop',
      href: '/products',
      hasDropdown: true,
      megaMenu: {
        categories: [
          { name: 'Silk Sarees', href: '/products/silk', description: 'Premium silk collection' },
          { name: 'Cotton Sarees', href: '/products/cotton', description: 'Comfortable daily wear' },
          { name: 'Kalamkari Prints', href: '/products/kalamkari', description: 'Traditional hand-painted' },
          { name: 'Bridal Collection', href: '/products/bridal', description: 'Special occasion wear' }
        ],
        featured: [
          { name: 'New Arrivals', href: '/products/new', description: 'Latest designs' },
          { name: 'Best Sellers', href: '/products/bestsellers', description: 'Customer favorites' },
          { name: 'Sale Items', href: '/products/sale', description: 'Limited time offers' },
          { name: 'Gift Cards', href: '/products/gifts', description: 'Perfect for loved ones' }
        ]
      }
    },
    {
      label: 'About',
      href: '/about',
      hasDropdown: false
    },
    {
      label: 'Contact',
      href: '/contact',
      hasDropdown: false
    },
  ];

  return (
    <motion.header
      style={{
        height: headerHeight,
        opacity: headerOpacity,
        backdropFilter: `blur(${headerBlur}px)`,
        background: 'linear-gradient(135deg, #9A4A2B 0%, #7B3A22 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
      className="sticky top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Refined Logo Section */}
          <motion.div
            style={{ scale: logoScale }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <Link href="/" className="flex items-center gap-3 group" aria-label="Kalamkari Heritage Home">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105"
                     style={{
                       background: 'linear-gradient(135deg, #C06A3E 0%, #8C4627 100%)',
                       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                     }}>
                  <span className="font-heading font-bold text-xl" style={{ color: '#FFF8F2' }}>K</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full opacity-80" style={{ backgroundColor: '#DFA059' }}></div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[22px] font-heading font-bold leading-tight tracking-tight" style={{ color: '#FDF7F0' }}>
                  Kalamkari
                </span>
                <span className="text-[10px] font-paragraph tracking-[0.2em] font-semibold uppercase" style={{ color: '#F2D4A3' }}>
                  Heritage
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Refined Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" role="navigation" aria-label="Main navigation">
            {navLinks.map((link, i) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="relative font-paragraph text-base font-semibold group flex items-center gap-1 py-3 px-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
                  style={{
                    color: '#FDF7F0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = openDropdown === link.label ? '#D9A46C' : '#FDF7F0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-expanded={link.hasDropdown ? openDropdown === link.label : undefined}
                  aria-haspopup={link.hasDropdown ? "true" : undefined}
                >
                  <span className="relative z-10 transition-colors duration-300" style={{
                    color: openDropdown === link.label ? '#D9A46C' : 'inherit'
                  }}>
                    {link.label}
                  </span>
                  {link.hasDropdown && (
                    <ChevronDown
                      className="w-4 h-4 transition-all duration-300"
                      style={{
                        color: openDropdown === link.label ? '#D9A46C' : 'inherit',
                        transform: openDropdown === link.label ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  )}
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 origin-left"
                    style={{ background: 'linear-gradient(90deg, #F2D4A3 0%, #DFA059 100%)' }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </Link>

                {/* 2-Column Mega Menu */}
                {link.hasDropdown && link.megaMenu && openDropdown === link.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[480px] rounded-2xl shadow-2xl overflow-hidden z-50"
                    style={{
                      backgroundColor: '#FDF7F0',
                      border: '1px solid rgba(242, 212, 163, 0.3)'
                    }}
                  >
                    <div className="grid grid-cols-2 gap-0">
                      {/* Categories Column */}
                      <div className="p-6" style={{ borderRight: '1px solid rgba(242, 212, 163, 0.2)' }}>
                        <h3 className="text-sm font-heading font-bold uppercase tracking-wide mb-4" style={{ color: '#7B3A22' }}>Categories</h3>
                        <div className="space-y-2">
                          {link.megaMenu.categories.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block p-3 rounded-lg transition-colors duration-200 group"
                              style={{
                                color: '#7B3A22'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(223, 160, 89, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="text-sm font-semibold transition-colors group-hover:text-[#C06A3E]">
                                {item.name}
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'rgba(123, 58, 34, 0.7)' }}>
                                {item.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Featured Column */}
                      <div className="p-6">
                        <h3 className="text-sm font-heading font-bold uppercase tracking-wide mb-4" style={{ color: '#7B3A22' }}>Featured</h3>
                        <div className="space-y-2">
                          {link.megaMenu.featured.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block p-3 rounded-lg transition-colors duration-200 group"
                              style={{
                                color: '#7B3A22'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(223, 160, 89, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="text-sm font-semibold transition-colors group-hover:text-[#C06A3E]">
                                {item.name}
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'rgba(123, 58, 34, 0.7)' }}>
                                {item.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Refined Utility Icons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl transition-all duration-300 hidden sm:flex group focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
              style={{
                color: '#F7ECE4'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#F7ECE4';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Search"
            >
              <Search className="w-5 h-5 transition-colors" />
            </motion.button>


            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/cart"
                className="p-2.5 rounded-xl transition-all duration-300 relative flex group focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
                style={{
                  color: '#F7ECE4'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#F7ECE4';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label={`Shopping cart (${mounted ? cart.getTotalItems() : 0} items)`}
              >
                <ShoppingCart className="w-5 h-5 transition-colors" />
                {mounted && cart.getTotalItems() > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 font-bold text-xs flex items-center justify-center"
                    style={{
                      backgroundColor: '#DFA059',
                      color: '#3A1E0E',
                      borderRadius: '14px'
                    }}
                  >
                    {cart.getTotalItems()}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* User Menu */}
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className="p-2.5 rounded-xl transition-all duration-300 flex items-center gap-1 group focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
                  style={{
                    color: '#F7ECE4'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#F7ECE4';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label={user ? "User menu" : "Sign in"}
                >
                  <User className="w-5 h-5 transition-colors" />
                  {!user && <span className="text-sm font-medium">Sign In</span>}
                </button>
              </motion.div>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-[#A0522D]/10 overflow-hidden z-50"
                >
                  {user ? (
                    // Authenticated user menu
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5DC] transition-colors text-[#333333]"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5DC] transition-colors text-[#333333]"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                      <button
                        onClick={() => {/* Add logout logic */}}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 border-t border-[#A0522D]/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    // Guest menu
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5DC] transition-colors text-[#333333]"
                      >
                        <LogIn className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign In</span>
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5DC] transition-colors text-[#333333]"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-sm font-medium">Sign Up</span>
                      </Link>
                      <div className="border-t border-[#A0522D]/10 px-4 py-3 bg-[#FDF8F2]">
                        <p className="text-xs text-[#666] mb-2">New customer?</p>
                        <Link
                          href="/signup"
                          className="block text-center py-2 bg-[#A0522D] text-white rounded-lg text-sm font-medium hover:bg-[#8B4513] transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
              style={{
                color: '#F7ECE4'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#F7ECE4';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Slide Menu */}
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="lg:hidden overflow-hidden fixed left-0 right-0 top-[72px] w-full z-40"
          style={{
            borderTop: '1px solid rgba(253, 247, 240, 0.15)',
            background: 'linear-gradient(135deg, #8B3E1F 0%, #6B2E15 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          }}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-6 md:px-8 py-6 space-y-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isMenuOpen ? 1 : 0,
                  x: isMenuOpen ? 0 : -20
                }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block transition-colors font-paragraph text-lg font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
                  style={{
                    color: '#FDF7F0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#FDF7F0';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {/* Mobile Utility Icons */}
            <div className="flex items-center justify-center gap-6 pt-4" style={{ borderTop: '1px solid rgba(253, 247, 240, 0.15)' }}>
              <button
                className="p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)] rounded-lg"
                style={{
                  color: '#F7ECE4'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#F7ECE4';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>
              <Link
                href="/profile"
                className="p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)] rounded-lg"
                style={{
                  color: '#F7ECE4'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#F7ECE4';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="User profile"
              >
                <User className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </motion.nav>
      </div>
    </motion.header>
  );
}
