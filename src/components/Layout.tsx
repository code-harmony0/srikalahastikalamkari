import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingCart, User, Sparkles, Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
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

      {/* Enhanced Premium Footer with Dual-tone, Gold Dividers & Ornamental Motifs */}
      <footer className="relative overflow-hidden mt-24">
        {/* Dual-tone Background with Cinematic Gradient */}
        <div className="absolute inset-0">
          {/* Primary gradient layer */}
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #2D1810 0%, #3D2317 25%, #4A2C1A 50%, #3D2317 75%, #2D1810 100%)"
            }}
          />
          
          {/* Secondary gradient overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(45deg, rgba(160, 82, 45, 0.3) 0%, rgba(184, 134, 11, 0.2) 25%, rgba(139, 69, 19, 0.3) 50%, rgba(218, 165, 32, 0.2) 75%, rgba(160, 82, 45, 0.3) 100%)",
              backgroundSize: "400% 400%"
            }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Cinematic vignette */}
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.4) 100%)"
            }}
          />
        </div>
        
        {/* Enhanced Ornamental Motifs Background */}
        <div className="absolute inset-0 opacity-8">
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
              opacity: [0.08, 0.12, 0.08]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B8860B' fill-opacity='0.15'%3E%3Cpath d='M60 20c22.091 0 40 17.909 40 40s-17.909 40-40 40S20 82.091 20 60 37.909 20 60 20zm0 15c-13.807 0-25 11.193-25 25s11.193 25 25 25 25-11.193 25-25-11.193-25-25-25z'/%3E%3Cpath d='M60 40c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3Ccircle cx='60' cy='60' r='6' fill='%23FFD700' fill-opacity='0.3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "120px 120px"
            }}
          />
          
          {/* Additional ornamental pattern */}
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              backgroundPosition: ["0px 0px", "60px 60px"],
              opacity: [0.06, 0.1, 0.06]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23A0522D' fill-opacity='0.12'%3E%3Cpath d='M30 10c11.046 0 20 8.954 20 20s-8.954 20-20 20S10 41.046 10 30 18.954 10 30 10z'/%3E%3Cpath d='M30 20c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px"
            }}
          />
        </div>
        
        {/* Floating Gold Ornamental Elements */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-24 h-24 opacity-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 8c17.673 0 32 14.327 32 32s-14.327 32-32 32S8 57.673 8 40 22.327 8 40 8z' fill='none' stroke='%23B8860B' stroke-width='2'/%3E%3Cpath d='M40 20c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z' fill='%23FFD700' fill-opacity='0.2'/%3E%3Ccircle cx='40' cy='40' r='6' fill='%23B8860B' fill-opacity='0.4'/%3E%3C/svg%3E")`,
            filter: "drop-shadow(0 0 15px rgba(184, 134, 11, 0.3))"
          }}
        />
        
        <motion.div
          animate={{ 
            rotate: [360, 0],
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-16 w-20 h-20 opacity-3"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M35 7c15.464 0 28 12.536 28 28s-12.536 28-28 28S7 50.464 7 35 19.536 7 35 7z' fill='none' stroke='%23A0522D' stroke-width='1.5'/%3E%3Cpath d='M35 18c9.389 0 17 7.611 17 17s-7.611 17-17 17-17-7.611-17-17 7.611-17 17-17z' fill='%23B8860B' fill-opacity='0.15'/%3E%3Ccircle cx='35' cy='35' r='5' fill='%23FFD700' fill-opacity='0.3'/%3E%3C/svg%3E")`,
            filter: "drop-shadow(0 0 12px rgba(160, 82, 45, 0.25))"
          }}
        />
        
        {/* Enhanced Gold Divider at Top */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-color to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Animated shimmer on divider */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "blur(1px)" }}
          />
        </motion.div>
        
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Enhanced Brand Section with Gold Accents */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <motion.div 
                className="flex items-center gap-4 mb-8"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-color via-amber-600 to-primary rounded-3xl flex items-center justify-center shadow-xl">
                    <span className="text-primary-foreground font-heading font-bold text-2xl">K</span>
                  </div>
                  {/* Gold glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-50"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(184, 134, 11, 0.3)",
                        "0 0 40px rgba(184, 134, 11, 0.5)",
                        "0 0 20px rgba(184, 134, 11, 0.3)"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div>
                  <span className="text-3xl font-heading font-bold text-primary-foreground block leading-tight tracking-tight">
                    Kalamkari
                  </span>
                  <span className="text-sm font-paragraph text-accent-color tracking-[0.2em] font-semibold">
                    HERITAGE
                  </span>
                </div>
              </motion.div>
              
              <motion.p 
                className="text-primary-foreground/90 font-paragraph text-lg leading-relaxed mb-8"
                style={{
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
                }}
              >
                Handcrafted Kalamkari sarees celebrating the rich heritage of Indian textile traditions. Each piece tells a story of artistry, culture, and timeless elegance.
              </motion.p>
              
              {/* Enhanced Social Media with Gold Glow */}
              <div className="flex items-center gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.15, rotate: 5, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 bg-gradient-to-br from-primary-foreground/15 via-primary-foreground/20 to-primary-foreground/15 hover:from-accent-color/30 hover:via-accent-color/40 hover:to-accent-color/30 rounded-2xl flex items-center justify-center transition-all duration-300 group border border-primary-foreground/20 hover:border-accent-color/40"
                    style={{
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <Icon className="w-6 h-6 text-primary-foreground group-hover:text-accent-color transition-colors" />
                    {/* Hover glow */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: "0 0 20px rgba(184, 134, 11, 0.4)"
                      }}
                    />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Quick Links with Improved Styling */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-heading font-bold text-primary-foreground mb-8 relative">
                Quick Links
                <motion.div 
                  className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-accent-color to-amber-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </h3>
              <ul className="space-y-5">
                {navLinks.map((link, index) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={link.href}
                      className="text-primary-foreground/85 hover:text-accent-color transition-all duration-300 font-paragraph text-lg flex items-center group py-2 px-3 rounded-xl hover:bg-primary-foreground/10"
                    >
                      <motion.span 
                        className="w-2 h-2 bg-accent-color/60 rounded-full mr-4 group-hover:bg-accent-color transition-colors"
                        whileHover={{ scale: 1.3 }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="relative">
                        {link.label}
                        <motion.div
                          className="absolute -bottom-1 left-0 w-0 h-px bg-accent-color group-hover:w-full transition-all duration-300"
                        />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Enhanced Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-heading font-bold text-primary-foreground mb-8 relative">
                Customer Care
                <motion.div 
                  className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-accent-color to-amber-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </h3>
              <ul className="space-y-5">
                {[
                  'Contact Us',
                  'Shipping & Returns', 
                  'Size Guide',
                  'Care Instructions'
                ].map((item, index) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href="#"
                      className="text-primary-foreground/85 hover:text-accent-color transition-all duration-300 font-paragraph text-lg flex items-center group py-2 px-3 rounded-xl hover:bg-primary-foreground/10"
                    >
                      <motion.span 
                        className="w-2 h-2 bg-accent-color/60 rounded-full mr-4 group-hover:bg-accent-color transition-colors"
                        whileHover={{ scale: 1.3 }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="relative">
                        {item}
                        <motion.div
                          className="absolute -bottom-1 left-0 w-0 h-px bg-accent-color group-hover:w-full transition-all duration-300"
                        />
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Enhanced Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-heading font-bold text-primary-foreground mb-8 relative">
                Get in Touch
                <motion.div 
                  className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-accent-color to-amber-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  viewport={{ once: true }}
                />
              </h3>
              
              <div className="space-y-6 mb-8">
                {[
                  { icon: Mail, text: 'hello@kalamkari.com' },
                  { icon: Phone, text: '+91 98765 43210' },
                  { icon: MapPin, text: 'Heritage Craft Center\nSrikalahasti, Andhra Pradesh\nIndia - 517644' }
                ].map(({ icon: Icon, text }, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-4 text-primary-foreground/85 group"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-6 h-6 text-accent-color flex-shrink-0 mt-1 group-hover:text-amber-400 transition-colors" />
                    </motion.div>
                    <span className="font-paragraph text-lg leading-relaxed whitespace-pre-line">
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Newsletter Signup */}
              <motion.div 
                className="bg-gradient-to-br from-primary-foreground/15 via-primary-foreground/20 to-primary-foreground/15 backdrop-blur-md rounded-3xl p-8 border border-accent-color/30 shadow-xl relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3 }}
                style={{
                  boxShadow: "0 8px 32px rgba(184, 134, 11, 0.2)"
                }}
              >
                {/* Background shimmer */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "linear-gradient(45deg, transparent 30%, rgba(184, 134, 11, 0.3) 50%, transparent 70%)",
                    backgroundSize: "200% 200%"
                  }}
                  animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <h4 className="text-xl font-heading font-semibold text-primary-foreground mb-4 relative z-10">
                  Stay Updated
                </h4>
                <p className="text-primary-foreground/85 font-paragraph text-base mb-6 relative z-10">
                  Subscribe for exclusive offers and heritage stories.
                </p>
                <div className="flex gap-3 relative z-10">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-5 py-4 border border-accent-color/40 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-accent-color/60 bg-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/60 backdrop-blur-sm transition-all duration-300 hover:bg-primary-foreground/30"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-gradient-to-r from-accent-color to-amber-500 hover:from-amber-500 hover:to-accent-color text-primary px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border-0">
                      Join
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced Bottom Bar with Gold Dividers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Gold divider above bottom bar */}
            <motion.div 
              className="w-full h-px bg-gradient-to-r from-transparent via-accent-color to-transparent mb-8"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 2, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                animate={{ x: [-100, 100] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(1px)" }}
              />
            </motion.div>
            
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <p className="text-primary-foreground/85 font-paragraph text-lg">
                  © 2024 Kalamkari Heritage. All rights reserved.
                </p>
                <motion.div 
                  className="flex items-center gap-3 text-primary-foreground/70 text-base"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-accent-color" />
                  </motion.div>
                  <span>Handcrafted with love in India</span>
                </motion.div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  'Privacy Policy',
                  'Terms of Service', 
                  'Artisan Partners'
                ].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className="text-primary-foreground/85 hover:text-accent-color transition-all duration-300 font-paragraph text-base relative group"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-px bg-accent-color group-hover:w-full transition-all duration-300"
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll to Top Button with Cinematic Motion */}
        <motion.button
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-accent-color via-amber-600 to-primary rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 z-50 group border-2 border-white/20 hover:border-white/40"
          whileHover={{ 
            scale: 1.1, 
            y: -4,
            boxShadow: "0 20px 40px rgba(184, 134, 11, 0.4)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {/* Rotating border */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-color/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Arrow icon */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="w-6 h-6 text-primary-foreground -rotate-90 group-hover:text-white transition-colors" />
          </motion.div>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "radial-gradient(circle, rgba(184, 134, 11, 0.3) 0%, transparent 70%)",
              filter: "blur(8px)",
              transform: "scale(1.5)"
            }}
          />
        </motion.button>
      </footer>
    </div>
  );
}
