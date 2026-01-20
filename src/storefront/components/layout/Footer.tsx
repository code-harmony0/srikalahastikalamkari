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
    <footer className="relative overflow-hidden mt-20 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
      {/* Heritage Harmony Gradient Background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, #4A2916 0%, #8C4A29 100%)"
      }}/>
      
      {/* Subtle Gold Kalamkari Motif - 8% Opacity */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E2B77A' stroke-width='0.4' stroke-linecap='round' stroke-linejoin='round' opacity='0.3'%3E%3Cpath d='M35 25c12 0 22 10 22 22 0 16-12 28-22 28s-22-12-22-28c0-12 10-22 22-22z' fill='%23E2B77A' fill-opacity='0.08'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "140px 140px",
          backgroundPosition: "0 0",
          backgroundRepeat: "repeat"
        }}
      />

      {/* Fabric Grain Texture Overlay */}
      <div 
         className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-soft-light"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Gold Divider at Top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E6C28C]/40 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
      />

      <div className="max-w-[120rem] mx-auto px-6 md:px-12 pt-16 pb-10 relative z-10">
        {/* 3-column Footer Grid (Unified Grouping) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 items-baseline">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E6C28C] to-[#B36A2E] rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                <span className="text-white font-serif font-bold text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold text-[#FFF8F0] leading-tight">
                  Srikalahasti
                </span>
                <span className="text-[10px] font-sans text-[#E6C28C] tracking-[0.25em] font-bold">
                  KALAMKARI
                </span>
              </div>
            </div>

            <p className="text-white/70 font-sans text-[14px] leading-relaxed mb-8 max-w-[280px]">
              Celebrating five centuries of hand-painted heritage. Each piece is a masterpiece of artisan mastery and natural elegance.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-9 h-9 bg-white/5 hover:bg-[#E6C28C]/20 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-[#E6C28C]/30 group"
                >
                  <Icon className="w-4 h-4 text-white/50 group-hover:text-[#E6C28C] transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links Section (Unified Care & Explore) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-12 md:gap-24"
          >
            <div>
              <h3 className="font-serif text-[16px] font-bold text-[#E6C28C] mb-[16px] tracking-wide">
                Explore
              </h3>
              <ul className="flex flex-col gap-[10px]">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-white/80 hover:text-[#E6C28C] transition-all duration-300 font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-[16px] font-bold text-[#E6C28C] mb-[16px] tracking-wide">
                Care
              </h3>
              <ul className="flex flex-col gap-[10px]">
                {['Shipping', 'Returns', 'Care Guide'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[15px] text-white/80 hover:text-[#E6C28C] transition-all duration-300 font-sans"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Newsletter Section - Glassmorphic Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="bg-white/5 backdrop-blur-[6px] rounded-[10px] p-6 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-4 h-4 text-[#E6C28C]" />
                <h4 className="text-[16px] font-serif font-bold text-[#FFF8F0]">
                  Stay Connected
                </h4>
              </div>
              
              <p className="text-white/60 font-sans text-[14px] mb-6 leading-relaxed">
                Join our collective for first access to new collections and artisan stories.
              </p>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#E6C28C]/40 transition-all h-10 shadow-inner"
                />
                <Button className="bg-[#E6C28C] hover:bg-[#B35D2E] text-[#3A2413] hover:text-white px-5 rounded-[6px] font-bold text-[13px] uppercase tracking-wider transition-all h-10 border-0 flex-shrink-0">
                  Join
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Centered Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative pt-5 border-t border-white/15"
        >
          <p className="text-white/65 font-serif italic text-[13px] tracking-wider text-center">
            &copy; 2026 Srikalahasti Kalamkari &bull; Preserving Tradition, Painting the Future
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
