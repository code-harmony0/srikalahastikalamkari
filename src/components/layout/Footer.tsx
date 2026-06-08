"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  ArrowRight,
  ExternalLink,
  Mail,
} from "lucide-react"
import { cn } from "@/shared/utils"

export default function Footer() {
  const [emailFocused, setEmailFocused] = useState(false)

  return (
    <footer
      className="bg-[#1A1512] text-[#FAFAF8] border-t border-[#FAFAF8]/10 font-sans"
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* 1️⃣ TOP ROW: Identity (Left) & Newsletter (Right) */}
        <div className="py-12 border-b border-[#FAFAF8]/10 flex flex-col md:flex-row md:items-end justify-between gap-10">
          {/* Brand Essence */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white overflow-hidden shadow-sm">
                <Image
                  src="/images/logo.jpg"
                  alt="Srikalahasti Kalamkari Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-wide text-[#FAFAF8] uppercase">
                  SRIKALAHASTI
                </span>
                <span className="font-serif italic text-xl tracking-[0.2em] text-[#FAFAF8]/60 mt-0.5">
                  KALAMKARI
                </span>
                <span className="text-[10px] font-bold text-[#C19A5B] tracking-[0.2em] uppercase mt-2">
                  GSTIN: 37EVOPS6191D1ZX
                </span>
              </div>
            </div>
            <p className="font-sans text-[#FAFAF8]/60 text-[13px] leading-relaxed max-w-sm mt-2">
              Preserving the ancient pen-art tradition with devotion since 1999. Every piece is a canvas of history.
            </p>
          </div>

          {/* Compact Newsletter */}
          <div className="w-full md:max-w-sm">
            {/* ... Newsletter content remains same ... */}
            <label
              htmlFor="newsletter-email"
              className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#C19A5B] mb-4"
            >
              Join the Collective
            </label>
            <div
              className={cn(
                "flex items-center border-b transition-all duration-300 pb-2",
                emailFocused
                  ? "border-[#C19A5B]"
                  : "border-[#FAFAF8]/20",
              )}
            >
              <Mail
                className={cn(
                  "w-4 h-4 mr-3 transition-colors",
                  emailFocused ? "text-[#C19A5B]" : "text-[#FAFAF8]/40",
                )}
              />
              <input
                id="newsletter-email"
                type="email"
                placeholder="Receive artisan stories..."
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent border-none outline-none text-[#FAFAF8] text-[13px] placeholder:text-[#FAFAF8]/40 font-sans min-w-0"
              />
              <button
                className="text-[#FAFAF8] hover:text-[#C19A5B] flex items-center justify-center transition-all duration-300 shrink-0 px-2"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2️⃣ MIDDLE ROW: Compact Navigation Grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Collections */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C19A5B]">
              Collections
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Kalamkari Sarees", category: "Sarees" },
                { label: "Kalamkari Dupattas", category: "Dupattas" },
                { label: "Dress Materials", category: "Fabrics" },
                { label: "Wall Paintings", category: "Wall Paintings" },
                { label: "Canvas Paintings", category: "Canvas Paintings" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/products?category=${encodeURIComponent(item.category)}`}
                    className="text-[#FAFAF8]/60 hover:text-[#FAFAF8] transition-colors text-[13px] block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C19A5B]">
              Support
            </h4>
            <ul className="space-y-3">
              {["Shipping Policy", "Textile Care", "FAQs"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.split(" ")[0].toLowerCase()}`}
                    className="text-[#FAFAF8]/60 hover:text-[#FAFAF8] transition-colors text-[13px] block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Location (Spans 2 cols on tablet/desktop) */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 space-y-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C19A5B]">
              Contact Us
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phones */}
              <div className="space-y-3">
                <span className="text-[10px] text-[#FFF8F0]/40 uppercase tracking-wider block mb-0.5">
                  Customer Care
                </span>
                <div className="space-y-1">
                  <span className="flex items-center gap-2 text-[13px] text-[#FFF8F0]/90 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888 48881
                  </span>
                  <span className="flex items-center gap-2 text-[13px] text-[#FFF8F0]/90 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888 48882
                  </span>
                  <span className="flex items-center gap-2 text-[13px] text-[#FFF8F0]/90 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888 48883
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 group">
                <MapPin className="w-4 h-4 text-[#C19A5B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] text-[#FFF8F0]/70 leading-relaxed group-hover:text-[#FFF8F0] transition-colors">
                    # 17-68, Bharathi Nagar,
                    <br />
                    Tirupati Main Road, Near Railway Station,
                    <br />
                    Srikalahasti-517640
                  </p>
                  <a
                    href="https://maps.app.goo.gl/tABoSwfoUcmEQjgJA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#C19A5B] hover:text-[#FFF8F0] transition-colors mt-2"
                  >
                    Get Directions <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3️⃣ BOTTOM ROW: Utility & Socials */}
        <div className="py-5 border-t border-[#FFF8F0]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[#FFF8F0]/50">
          <div className="flex items-center gap-4">
            <span>© 1999 Srikalahasti Kalamkari</span>
            <span className="text-[#FFF8F0]/20">|</span>
            <Link href="/privacy" className="hover:text-[#C19A5B] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C19A5B] transition-colors">Terms & Conditions</Link>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden md:inline font-playfair italic text-[#C19A5B]">
              Artistry from Srikalahasti.
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/srikalahasti_kalamkari_offical"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#C19A5B]/30 text-[#FFF8F0]/80 hover:text-white hover:border-[#C19A5B] hover:bg-[#C19A5B]/10 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#C19A5B] group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium">
                  @srikalahasti_kalamkari_offical
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="py-3 border-t border-[#FFF8F0]/10 text-center text-[11px] text-[#FFF8F0]/40 font-inter">
          Designed &amp; maintained by{" "}
          <a
            href="https://www.exploreconsultancyservices.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C19A5B]/60 hover:text-[#C19A5B] transition-colors"
          >
            Explore Consultancy Services
          </a>
        </div>
      </div>
    </footer>
  )
}
