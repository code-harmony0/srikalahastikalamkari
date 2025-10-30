import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-lg">K</span>
              </div>
              <span className="hidden sm:inline text-xl font-heading font-bold text-foreground">
                Kalamkari
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex">
                <Search className="w-5 h-5 text-foreground/70" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex">
                <Heart className="w-5 h-5 text-foreground/70" />
              </button>
              <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <ShoppingCart className="w-5 h-5 text-foreground/70" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </Link>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex">
                <User className="w-5 h-5 text-foreground/70" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-3"
            >
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm font-medium py-2"
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                  <span className="text-primary-foreground font-heading font-bold text-lg">K</span>
                </div>
                <span className="text-lg font-heading font-bold text-foreground">
                  Kalamkari
                </span>
              </div>
              <p className="text-foreground/70 font-paragraph text-sm leading-relaxed">
                Handcrafted Kalamkari sarees celebrating the rich heritage of Indian textile traditions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                Customer Service
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                Newsletter
              </h3>
              <p className="text-foreground/70 font-paragraph text-sm mb-4">
                Subscribe to get special offers and updates.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground/70 font-paragraph text-sm">
              © 2024 Kalamkari. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-foreground/70 hover:text-primary transition-colors font-paragraph text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
