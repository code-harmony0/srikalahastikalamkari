import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingCart, User, Sparkles, Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMember } from '@/integrations';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { member, isAuthenticated, isLoading } = useMember();
  
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
      href: '/shop',
      hasDropdown: true,
      megaMenu: {
        categories: [
          { name: 'Silk Sarees', href: '/shop/silk', description: 'Premium silk collection' },
          { name: 'Cotton Sarees', href: '/shop/cotton', description: 'Comfortable daily wear' },
          { name: 'Kalamkari Prints', href: '/shop/kalamkari', description: 'Traditional hand-painted' },
          { name: 'Bridal Collection', href: '/shop/bridal', description: 'Special occasion wear' }
        ],
        featured: [
          { name: 'New Arrivals', href: '/shop/new', description: 'Latest designs' },
          { name: 'Best Sellers', href: '/shop/bestsellers', description: 'Customer favorites' },
          { name: 'Sale Items', href: '/shop/sale', description: 'Limited time offers' },
          { name: 'Gift Cards', href: '/shop/gifts', description: 'Perfect for loved ones' }
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

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Refined Premium Header */}
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
              <Link to="/" className="flex items-center gap-3 group" aria-label="Kalamkari Heritage Home">
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
                    to={link.href}
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
                                to={item.href}
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
                                to={item.href}
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
                  to="/wishlist" 
                  className="p-2.5 rounded-xl transition-all duration-300 hidden sm:flex group relative focus:outline-none focus:ring-2 focus:ring-[rgba(242,212,163,0.5)]"
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
                  aria-label="Wishlist (3 items)"
                >
                  <Heart className="w-5 h-5 transition-colors" />
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 text-xs font-bold flex items-center justify-center"
                    style={{ 
                      backgroundColor: '#DFA059', 
                      color: '#3A1E0E',
                      borderRadius: '14px'
                    }}
                  >
                    3
                  </span>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/cart" 
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
                  aria-label="Shopping cart (2 items)"
                >
                  <ShoppingCart className="w-5 h-5 transition-colors" />
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 font-bold text-xs flex items-center justify-center"
                    style={{ 
                      backgroundColor: '#DFA059', 
                      color: '#3A1E0E',
                      borderRadius: '14px'
                    }}
                  >
                    2
                  </span>
                </Link>
              </motion.div>
              
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/profile" 
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
                    aria-label="User profile"
                  >
                    <User className="w-5 h-5 transition-colors" />
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex font-semibold px-6 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(242,212,163,0.5)] focus:ring-offset-[#9A4A2B]"
                  style={{
                    background: 'linear-gradient(135deg, #C06A3E 0%, #8C4627 100%)',
                    color: '#FFF8F2',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #CC7845 0%, #98502E 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #C06A3E 0%, #8C4627 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  aria-label="Sign in to your account"
                >
                  Sign In
                </motion.button>
              )}

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
            className="lg:hidden overflow-hidden"
            style={{ 
              borderTop: '1px solid rgba(253, 247, 240, 0.15)',
              background: 'linear-gradient(135deg, #8B3E1F 0%, #6B2E15 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="py-6 space-y-2">
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
                    to={link.href}
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
                  aria-label="Wishlist"
                >
                  <Heart className="w-6 h-6" />
                </button>
                {isAuthenticated ? (
                  <Link 
                    to="/profile"
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
                ) : (
                  <button 
                    className="font-semibold px-6 py-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(242,212,163,0.5)] focus:ring-offset-[#9A4A2B]"
                    style={{
                      background: 'linear-gradient(135deg, #C06A3E 0%, #8C4627 100%)',
                      color: '#FFF8F2',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #CC7845 0%, #98502E 100%)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #C06A3E 0%, #8C4627 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Refined Premium Footer - Static Brown Gradient with Subtle Gold Kalamkari */}
      <footer className="relative overflow-hidden mt-24">
        {/* Static Brown Gradient Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #2D1810 0%, #3D2317 25%, #4A2C1A 50%, #3D2317 75%, #2D1810 100%)"
            }}
          />
        </div>
        
        {/* Subtle Gold Kalamkari Motif - Static */}
        <div 
          className="absolute inset-0 opacity-6"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23B8860B' stroke-width='0.4' stroke-linecap='round' stroke-linejoin='round' opacity='0.3'%3E%3Cpath d='M35 25c12 0 22 10 22 22 0 16-12 28-22 28s-22-12-22-28c0-12 10-22 22-22z' fill='%23B8860B' fill-opacity='0.06'/%3E%3Cpath d='M105 85c10 0 18 8 18 18 0 14-10 24-18 24s-18-10-18-24c0-10 8-18 18-18z' fill='%23B8860B' fill-opacity='0.05'/%3E%3Cpath d='M70 35c8 0 14 6 14 14 0 10-8 18-14 18s-14-8-14-18c0-8 6-14 14-14z' fill='%23B8860B' fill-opacity='0.04'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "140px 140px",
            backgroundPosition: "0 0",
            backgroundRepeat: "repeat"
          }}
        />
        
        {/* Gold Divider at Top */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-color to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
        />
        
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-12 relative z-10">
          {/* 4-Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-color via-amber-600 to-primary rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-primary-foreground font-heading font-bold text-2xl">K</span>
                </div>
                <div>
                  <span className="text-3xl font-heading font-bold text-primary-foreground block leading-tight tracking-tight">
                    Kalamkari
                  </span>
                  <span className="text-sm font-paragraph text-accent-color tracking-[0.2em] font-semibold">
                    HERITAGE
                  </span>
                </div>
              </div>
              
              <p className="text-primary-foreground/85 font-paragraph text-base leading-relaxed mb-6">
                Handcrafted Kalamkari sarees celebrating the rich heritage of Indian textile traditions. Each piece tells a story of artistry, culture, and timeless elegance.
              </p>
              
              {/* Social Media */}
              <div className="flex items-center gap-2">
                {[Instagram, Facebook, Twitter].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-9 h-9 bg-primary-foreground/15 hover:bg-accent-color/30 rounded-xl flex items-center justify-center transition-all duration-300 border border-primary-foreground/20 hover:border-accent-color/40"
                  >
                    <Icon className="w-4 h-4 text-primary-foreground hover:text-accent-color transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-extrabold text-primary-foreground mb-5 relative">
                Quick Links
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-accent-color to-amber-400 rounded-full" />
              </h3>
              <ul className="space-y-2">
                {navLinks.map((link, index) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center py-1.5 px-2 rounded-lg hover:bg-primary-foreground/10"
                    >
                      <span className="w-1.5 h-1.5 bg-accent-color/60 rounded-full mr-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-extrabold text-primary-foreground mb-5 relative">
                Customer Care
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-accent-color to-amber-400 rounded-full" />
              </h3>
              <ul className="space-y-2">
                {[
                  'Contact Us',
                  'Shipping & Returns', 
                  'Size Guide',
                  'Care Instructions'
                ].map((item, index) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center py-1.5 px-2 rounded-lg hover:bg-primary-foreground/10"
                    >
                      <span className="w-1.5 h-1.5 bg-accent-color/60 rounded-full mr-3" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-extrabold text-primary-foreground mb-5 relative">
                Get in Touch
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-accent-color to-amber-400 rounded-full" />
              </h3>
              
              <div className="space-y-4 mb-6">
                {[
                  { icon: Mail, text: 'hello@kalamkari.com' },
                  { icon: Phone, text: '+91 98765 43210' },
                  { icon: MapPin, text: 'Heritage Craft Center\nSrikalahasti, Andhra Pradesh\nIndia - 517644' }
                ].map(({ icon: Icon, text }, index) => (
                  <div key={index} className="flex items-start gap-3 text-primary-foreground/80">
                    <Icon className="w-5 h-5 text-accent-color flex-shrink-0 mt-0.5" />
                    <span className="font-paragraph text-base leading-snug whitespace-pre-line">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-5 border border-accent-color/30">
                <h4 className="text-lg font-heading font-semibold text-primary-foreground mb-3">
                  Stay Updated
                </h4>
                <p className="text-primary-foreground/80 font-paragraph text-sm mb-4">
                  Subscribe for exclusive offers and heritage stories.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2.5 border border-accent-color/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-color/60 bg-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/60 backdrop-blur-sm transition-all duration-300"
                  />
                  <Button className="bg-gradient-to-r from-accent-color to-amber-500 hover:from-amber-500 hover:to-accent-color text-primary px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border-0 text-sm">
                    Join
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar with Gold Divider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Gold divider above bottom bar */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-color to-transparent mb-5" />
            
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-primary-foreground/80 font-paragraph text-sm">
                  © 2024 Kalamkari Heritage. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                  <Sparkles className="w-4 h-4 text-accent-color" />
                  <span>Handcrafted with love in India</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  'Privacy Policy',
                  'Terms of Service', 
                  'Artisan Partners'
                ].map((item, index) => (
                  <a
                    key={item}
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-sm"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
