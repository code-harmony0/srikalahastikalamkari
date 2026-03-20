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
      className="bg-gradient-to-b from-[#8B3F20] to-[#2E1D15] text-[#FFF8F0] border-t border-[#C19A5B]/20 font-sans"
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* 1️⃣ TOP ROW: Identity (Left) & Newsletter (Right) */}
        <div className="py-8 border-b border-[#FFF8F0]/10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          {/* Brand Essence */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg shadow-md flex items-center justify-center border border-[#FFF8F0]/20 overflow-hidden">
                <Image
                  src="/images/logo.jpg"
                  alt="Srikalahasti Kalamkari Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-tight text-[#FFF8F0] uppercase">
                  SRIKALAHASTI
                </span>
                <span className="font-serif italic text-2xl tracking-widest text-[#C19A5B]">
                  Kalamkari
                </span>
                <span className="text-[9px] font-black text-[#C19A5B] tracking-[0.2em] uppercase mt-1.5">
                  GSTIN: 37EVOPS6191D1ZX
                </span>
              </div>
            </div>
            <p className="font-playfair italic text-[#FFF8F0]/80 text-[14px] max-w-sm">
              "Preserving the ancient pen-art tradition with devotion since
              1999."
            </p>
          </div>

          {/* Compact Newsletter */}
          <div className="w-full md:max-w-sm">
            {/* ... Newsletter content remains same ... */}
            <label
              htmlFor="newsletter-email"
              className="block text-[11px] font-bold uppercase tracking-widest text-[#C19A5B] mb-2"
            >
              Join the Collective
            </label>
            <div
              className={cn(
                "flex items-center bg-[#FFF8F0]/5 border rounded-full transition-all duration-300 px-1 py-0.5",
                emailFocused
                  ? "border-[#C19A5B] bg-[#FFF8F0]/10"
                  : "border-[#C19A5B]/30",
              )}
            >
              <Mail
                className={cn(
                  "w-4 h-4 ml-3 transition-colors",
                  emailFocused ? "text-[#C19A5B]" : "text-[#FFF8F0]/40",
                )}
              />
              <input
                id="newsletter-email"
                type="email"
                placeholder="Receive artisan stories..."
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent border-none outline-none text-[#FFF8F0] text-[13px] placeholder:text-[#FFF8F0]/40 px-3 py-2 font-sans min-w-0"
              />
              <button
                className="bg-[#C19A5B] hover:bg-[#FFF8F0] text-[#3B2C23] hover:text-[#A4552A] rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 shrink-0"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 2️⃣ MIDDLE ROW: Compact Navigation Grid */}
        <div className="py-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Collections */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C19A5B]">
              Collections
            </h4>
            <ul className="space-y-2">
              {[
                "Kalamkari Sarees",
                "Kalamkari Duppatas",
                "Dress Materials",
                "Wall Paintings",
                "Canvas Paintings",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href={`/products?category=${item.toLowerCase().replace(" ", "-")}`}
                    className="text-[#FFF8F0]/70 hover:text-[#C19A5B] transition-colors text-[13px] block hover:translate-x-1 duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C19A5B]">
              Support
            </h4>
            <ul className="space-y-2">
              {["Shipping Policy", "Textile Care", "FAQs"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.split(" ")[0].toLowerCase()}`}
                    className="text-[#FFF8F0]/70 hover:text-[#C19A5B] transition-colors text-[13px] block hover:translate-x-1 duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Location (Spans 2 cols on tablet/desktop) */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C19A5B]">
              Contact Us
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phones */}
              <div className="space-y-3">
                <div className="group">
                  <span className="text-[10px] text-[#FFF8F0]/40 uppercase tracking-wider block mb-0.5">
                    Customer Care
                  </span>
                  <div className="space-y-1">
                    <a
                      href="tel:+917288848881"
                      className="flex items-center gap-2 text-[13px] text-[#FFF8F0]/90 group-hover:text-[#C19A5B] transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888
                      48881
                    </a>
                    <a
                      href="tel:+917288848882"
                      className="flex items-center gap-2 text-[13px] text-[#FFF8F0]/90 group-hover:text-[#C19A5B] transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888
                      48882
                    </a>
                    <a
                      href="tel:+917288848883"
                      className="flex items-center gap-2 text-[13px] text-[#FFF8F0]/90 group-hover:text-[#C19A5B] transition-colors font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888
                      48883
                    </a>
                  </div>
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
            <span className="w-1 h-1 rounded-full bg-[#FFF8F0]/20" />
            <Link
              href="/privacy"
              className="hover:text-[#C19A5B] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#C19A5B] transition-colors"
            >
              Terms
            </Link>
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
