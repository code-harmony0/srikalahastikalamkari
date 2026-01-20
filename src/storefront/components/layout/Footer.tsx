"use client";

import Link from "next/link";
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function Footer() {
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/products' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
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

      <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-10 relative z-10">
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
                <span className="text-white font-heading font-bold text-2xl">K</span>
              </div>
              <div>
                <span className="text-3xl font-heading font-bold text-white block leading-tight tracking-tight">
                  Kalamkari
                </span>
                <span className="text-sm font-paragraph text-accent-color tracking-[0.2em] font-semibold">
                  HERITAGE
                </span>
              </div>
            </div>

            <p className="text-white/85 font-paragraph text-base leading-relaxed mb-6">
              Handcrafted Kalamkari sarees celebrating the rich heritage of Indian textile traditions. Each piece tells a story of artistry, culture, and timeless elegance.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-2">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-9 h-9 bg-white/15 hover:bg-accent-color/30 rounded-xl flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-accent-color/40"
                >
                  <Icon className="w-4 h-4 text-white hover:text-accent-color transition-colors" />
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
            <h3 className="text-xl font-heading font-extrabold text-white mb-5 relative">
              Quick Links
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-accent-color to-amber-400 rounded-full" />
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center py-1.5 px-2 rounded-lg hover:bg-white/10"
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
            <h3 className="text-xl font-heading font-extrabold text-white mb-5 relative">
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
                    className="text-white/80 hover:text-accent-color transition-all duration-300 font-paragraph text-base flex items-center py-1.5 px-2 rounded-lg hover:bg-white/10"
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
            <h3 className="text-xl font-heading font-extrabold text-white mb-5 relative">
              Get in Touch
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-accent-color to-amber-400 rounded-full" />
            </h3>

            <div className="space-y-4 mb-6">
              {[
                { icon: Mail, text: 'hello@kalamkari.com' },
                { icon: Phone, text: '+91 98765 43210' },
                { icon: MapPin, text: 'Heritage Craft Center\nSrikalahasti, Andhra Pradesh\nIndia - 517644' }
              ].map(({ icon: Icon, text }, index) => (
                <div key={index} className="flex items-start gap-3 text-white/80">
                  <Icon className="w-5 h-5 text-accent-color flex-shrink-0 mt-0.5" />
                  <span className="font-paragraph text-base leading-snug whitespace-pre-line">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-accent-color/30">
              <h4 className="text-lg font-heading font-semibold text-white mb-3">
                Stay Updated
              </h4>
              <p className="text-white/80 font-paragraph text-sm mb-4">
                Subscribe for exclusive offers and heritage stories.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2.5 border border-accent-color/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-color/60 bg-white/25 text-white placeholder:text-white/60 backdrop-blur-sm transition-all duration-300"
                />
                <Button className="bg-gradient-to-r from-accent-color to-amber-500 hover:from-amber-500 hover:to-accent-color text-wix-dark px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 border-0 text-sm">
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
              <p className="text-white/80 font-paragraph text-sm">
                © 2024 Kalamkari Heritage. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-white/70 text-sm">
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
                  className="text-white/80 hover:text-accent-color transition-all duration-300 font-paragraph text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
