import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingCart, User, Sparkles, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMember } from '@/integrations';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { member, isAuthenticated, isLoading } = useMember();
  
  // Header scroll effect
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
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
      {/* Enhanced Premium Header */}
      <motion.header 
        style={{ 
          opacity: headerOpacity,
          backdropFilter: `blur(${headerBlur}px)`
        }}
        className="bg-gradient-to-r from-primary via-amber-800 to-primary shadow-2xl sticky top-0 z-50 border-b-2 border-accent-color/50"
      >
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Enhanced Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Link to="/" className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent-color via-amber-600 to-primary rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                    <span className="text-primary-foreground font-heading font-bold text-2xl">K</span>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-accent-color/60 opacity-40"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-color rounded-full animate-pulse"></div>
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-2xl font-heading font-bold text-primary-foreground leading-tight tracking-tight">
                    Kalamkari
                  </span>
                  <span className="text-xs font-paragraph text-accent-color tracking-[0.3em] font-semibold">
                    HERITAGE
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={link.href}
                    className="relative text-primary-foreground font-paragraph text-base font-semibold group overflow-hidden py-2 px-1"
                  >
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-accent-color">
                      {link.label}
                    </span>
                    <motion.div
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent-color to-amber-400 origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-primary-foreground/10 rounded-lg opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Enhanced Right Icons */}
            <div className="flex items-center gap-3 lg:gap-4">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-primary-foreground/15 rounded-xl transition-all duration-300 hidden sm:flex text-primary-foreground group"
              >
                <Search className="w-5 h-5 group-hover:text-accent-color transition-colors" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-primary-foreground/15 rounded-xl transition-all duration-300 hidden sm:flex text-primary-foreground group relative"
              >
                <Heart className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  3
                </motion.span>
              </motion.button>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/cart" className="p-3 hover:bg-primary-foreground/15 rounded-xl transition-all duration-300 relative flex text-primary-foreground group">
                  <ShoppingCart className="w-5 h-5 group-hover:text-accent-color transition-colors" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-accent-color text-primary font-bold text-xs rounded-full flex items-center justify-center shadow-lg"
                  >
                    2
                  </motion.span>
                </Link>
              </motion.div>
              
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/profile" className="p-3 hover:bg-primary-foreground/15 rounded-xl transition-all duration-300 hidden sm:flex text-primary-foreground group">
                    <User className="w-5 h-5 group-hover:text-accent-color transition-colors" />
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 hover:bg-primary-foreground/15 rounded-xl transition-all duration-300 hidden sm:flex text-primary-foreground group"
                >
                  <User className="w-5 h-5 group-hover:text-accent-color transition-colors" />
                </motion.button>
              )}

              {/* Enhanced Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 hover:bg-primary-foreground/15 rounded-xl transition-all duration-300 text-primary-foreground"
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

          {/* Enhanced Mobile Navigation */}
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isMenuOpen ? 1 : 0, 
              height: isMenuOpen ? 'auto' : 0 
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-primary-foreground/20"
          >
            <div className="py-6 space-y-4">
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
                    className="block text-primary-foreground hover:text-accent-color transition-colors font-paragraph text-lg font-semibold py-3 px-4 rounded-lg hover:bg-primary-foreground/10"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              {/* Mobile Icons */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-primary-foreground/20">
                <button className="p-3 text-primary-foreground hover:text-accent-color transition-colors">
                  <Search className="w-6 h-6" />
                </button>
                <button className="p-3 text-primary-foreground hover:text-accent-color transition-colors">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-3 text-primary-foreground hover:text-accent-color transition-colors">
                  <User className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Enhanced Premium Footer */}
      <footer className="bg-gradient-to-br from-primary via-amber-800 to-primary text-primary-foreground border-t-2 border-accent-color/50 mt-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(184,134,11,0.3)_2px,transparent_2px),radial-gradient(circle_at_75%_75%,rgba(160,82,45,0.3)_1px,transparent_1px)] bg-[length:24px_24px,16px_16px]"></div>
        </div>
        
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Enhanced Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-color to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-primary font-heading font-bold text-xl">K</span>
                </div>
                <div>
                  <span className="text-2xl font-heading font-bold text-primary-foreground block leading-tight">
                    Kalamkari
                  </span>
                  <span className="text-xs font-paragraph text-accent-color tracking-[0.2em] font-semibold">
                    HERITAGE
                  </span>
                </div>
              </div>
              <p className="text-primary-foreground/90 font-paragraph text-base leading-relaxed mb-6">
                Handcrafted Kalamkari sarees celebrating the rich heritage of Indian textile traditions. Each piece tells a story of artistry, culture, and timeless elegance.
              </p>
              
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent-color/20 rounded-xl flex items-center justify-center transition-all duration-300 group"
                >
                  <Instagram className="w-5 h-5 text-primary-foreground group-hover:text-accent-color" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent-color/20 rounded-xl flex items-center justify-center transition-all duration-300 group"
                >
                  <Facebook className="w-5 h-5 text-primary-foreground group-hover:text-accent-color" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-10 h-10 bg-primary-foreground/10 hover:bg-accent-color/20 rounded-xl flex items-center justify-center transition-all duration-300 group"
                >
                  <Twitter className="w-5 h-5 text-primary-foreground group-hover:text-accent-color" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-6 relative">
                Quick Links
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent-color"></div>
              </h3>
              <ul className="space-y-4">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-accent-color/50 rounded-full mr-3 group-hover:bg-accent-color transition-colors"></span>
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
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-6 relative">
                Customer Care
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent-color"></div>
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-color/50 rounded-full mr-3 group-hover:bg-accent-color transition-colors"></span>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-color/50 rounded-full mr-3 group-hover:bg-accent-color transition-colors"></span>
                    Shipping & Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-color/50 rounded-full mr-3 group-hover:bg-accent-color transition-colors"></span>
                    Size Guide
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 bg-accent-color/50 rounded-full mr-3 group-hover:bg-accent-color transition-colors"></span>
                    Care Instructions
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-bold text-primary-foreground mb-6 relative">
                Get in Touch
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent-color"></div>
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-primary-foreground/80">
                  <Mail className="w-5 h-5 text-accent-color flex-shrink-0" />
                  <span className="font-paragraph text-base">hello@kalamkari.com</span>
                </div>
                <div className="flex items-center gap-3 text-primary-foreground/80">
                  <Phone className="w-5 h-5 text-accent-color flex-shrink-0" />
                  <span className="font-paragraph text-base">+91 98765 43210</span>
                </div>
                <div className="flex items-start gap-3 text-primary-foreground/80">
                  <MapPin className="w-5 h-5 text-accent-color flex-shrink-0 mt-0.5" />
                  <span className="font-paragraph text-base leading-relaxed">
                    Heritage Craft Center<br />
                    Srikalahasti, Andhra Pradesh<br />
                    India - 517644
                  </span>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
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
                    className="flex-1 px-4 py-3 border border-accent-color/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-color/50 bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 backdrop-blur-sm"
                  />
                  <Button className="bg-accent-color hover:bg-accent-color/90 text-primary px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                    Join
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-primary-foreground/20 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <p className="text-primary-foreground/80 font-paragraph text-base">
                © 2024 Kalamkari Heritage. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
                <Sparkles className="w-4 h-4 text-accent-color" />
                <span>Handcrafted with love in India</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
              >
                Artisan Partners
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
