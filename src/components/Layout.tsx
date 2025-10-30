import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingCart, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMember } from '@/integrations';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { member, isAuthenticated, isLoading } = useMember();

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
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-amber-700 to-primary shadow-lg sticky top-0 z-50 border-b-4 border-accent-color">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative w-12 h-12 bg-gradient-to-br from-accent-color to-primary rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
                  <span className="text-primary-foreground font-heading font-bold text-xl">K</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-lg border-2 border-transparent border-t-accent-color opacity-30"
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xl font-heading font-bold text-primary-foreground leading-tight">
                    Kalamkari
                  </span>
                  <span className="text-xs font-paragraph text-primary-foreground/80 tracking-widest">
                    HERITAGE
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
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
                    className="relative text-primary-foreground font-paragraph text-sm font-semibold group overflow-hidden"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <motion.div
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-color origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors hidden sm:flex text-primary-foreground"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors hidden sm:flex text-primary-foreground"
              >
                <Heart className="w-5 h-5" />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/cart" className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors relative flex text-primary-foreground">
                  <ShoppingCart className="w-5 h-5" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 bg-accent-color text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-md"
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
                  <Link to="/profile" className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors hidden sm:flex text-primary-foreground">
                    <User className="w-5 h-5" />
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors hidden sm:flex text-primary-foreground"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors text-primary-foreground"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? 'auto' : 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-primary-foreground/20"
          >
            <div className="py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-primary-foreground hover:text-accent-color transition-colors font-paragraph text-sm font-semibold py-2 px-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary via-amber-700 to-primary text-primary-foreground border-t-4 border-accent-color mt-20">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-accent-color rounded-lg flex items-center justify-center">
                  <span className="text-primary font-heading font-bold text-lg">K</span>
                </div>
                <span className="text-lg font-heading font-bold text-primary-foreground">
                  Kalamkari
                </span>
              </div>
              <p className="text-primary-foreground/80 font-paragraph text-sm leading-relaxed">
                Handcrafted Kalamkari sarees celebrating the rich heritage of Indian textile traditions.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-heading font-bold text-primary-foreground mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-heading font-bold text-primary-foreground mb-4">
                Customer Service
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-primary-foreground/80 hover:text-accent-color transition-colors font-paragraph text-sm"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-heading font-bold text-primary-foreground mb-4">
                Newsletter
              </h3>
              <p className="text-primary-foreground/80 font-paragraph text-sm mb-4">
                Subscribe to get special offers and updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-accent-color rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent-color bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                />
                <Button className="bg-accent-color hover:bg-amber-600 text-primary px-4 py-2 rounded-sm font-semibold">
                  Subscribe
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-primary-foreground/80 font-paragraph text-sm">
              © 2024 Kalamkari. All rights reserved.
            </p>
            <div className="flex gap-6">
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
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
