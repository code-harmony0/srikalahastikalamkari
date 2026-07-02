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
  return (
    <footer
      className="relative overflow-hidden bg-[#1A1512] text-[#FAFAF8] border-t border-[#FAFAF8]/10 font-sans"
      aria-label="Site Footer"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/logo-transparent.png"
          alt=""
          width={520}
          height={534}
          aria-hidden="true"
          className="h-[260px] w-auto object-contain opacity-[0.055] saturate-0 md:h-[360px] lg:h-[430px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* 1️⃣ TOP ROW: Identity (Left) & Newsletter (Right) */}
        <div className="py-9 sm:py-12 border-b border-[#FAFAF8]/10 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
          {/* Brand Essence */}
          <div className="flex flex-col gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex shrink-0 items-center justify-center bg-[#050302] overflow-hidden shadow-md ring-1 ring-[#C19A5B]/25">
                <Image
                  src="/images/logo-transparent.png"
                  alt="Srikalahasti Kalamkari Logo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="whitespace-nowrap font-serif font-bold text-[clamp(0.75rem,3.6vw,1.125rem)] md:text-xl tracking-[0.02em] sm:tracking-wide text-[#FAFAF8] uppercase leading-none">
                  SRIKALAHASTI KALAMKARI
                </span>
                <span className="whitespace-nowrap font-serif italic text-[11px] sm:text-base tracking-[0.16em] sm:tracking-[0.2em] text-[#FAFAF8]/60 mt-1">
                  HERITAGE ART
                </span>
                <span className="text-[8.5px] sm:text-[10px] font-bold text-[#C19A5B] tracking-[0.16em] sm:tracking-[0.2em] uppercase mt-1.5 sm:mt-2">
                  GSTIN: 37EVOPS6191D1ZX
                </span>
              </div>
            </div>
            <p className="font-sans text-[#FAFAF8]/60 text-[12px] sm:text-[13px] leading-relaxed max-w-sm mt-1 sm:mt-2">
              Preserving the ancient pen-art tradition with devotion since 1999. Every piece is a canvas of history.
            </p>
          </div>


        </div>

        {/* 2️⃣ MIDDLE ROW: Compact Navigation Grid */}
        <div className="py-9 sm:py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
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
                <span className="text-[10px] text-[#FAFAF8]/40 uppercase tracking-wider block mb-0.5">
                  Customer Care
                </span>
                <div className="space-y-1">
                  <span className="flex items-center gap-2 text-[13px] text-[#FAFAF8]/90 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888 48881
                  </span>
                  <span className="flex items-center gap-2 text-[13px] text-[#FAFAF8]/90 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888 48882
                  </span>
                  <span className="flex items-center gap-2 text-[13px] text-[#FAFAF8]/90 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C19A5B]" /> +91 72888 48883
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 group">
                <MapPin className="w-4 h-4 text-[#C19A5B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] text-[#FAFAF8]/70 leading-relaxed group-hover:text-[#FAFAF8] transition-colors">
                    #6-8-1126, NGOs Colony,
                    <br />
                    Opp: Balaji Silk Emporium,
                    <br />
                    Revenue Ward No 6, Tirupati
                  </p>
                  <a
                    href="https://maps.app.goo.gl/tABoSwfoUcmEQjgJA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#C19A5B] hover:text-[#FAFAF8] transition-colors mt-2"
                  >
                    Get Directions <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3️⃣ BOTTOM ROW: Utility & Socials */}
        <div className="py-5 border-t border-[#FAFAF8]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] sm:text-[12px] text-[#FAFAF8]/50">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4">
            <span className="whitespace-nowrap">© 1999 Srikalahasti Kalamkari</span>
            <span className="text-[#FAFAF8]/20">|</span>
            <Link href="/privacy" className="hover:text-[#C19A5B] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C19A5B] transition-colors">Terms & Conditions</Link>
          </div>

          <div className="flex max-w-full items-center gap-6">
            <span className="hidden md:inline font-playfair italic text-[#C19A5B]">
              Artistry from Srikalahasti.
            </span>
            <div className="flex max-w-full items-center gap-4">
              <a
                href="https://www.instagram.com/srikalahasti_kalamkari_offical"
                target="_blank"
                rel="noopener noreferrer"
                className="flex max-w-full items-center gap-2 px-3 sm:gap-2.5 sm:px-4 py-2 rounded-full border border-[#C19A5B]/30 text-[#FAFAF8]/80 hover:text-white hover:border-[#C19A5B] hover:bg-[#C19A5B]/10 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#C19A5B] group-hover:scale-110 transition-transform" />
                <span className="max-w-[15.5rem] truncate text-[11px] sm:max-w-none sm:text-[13px] font-medium">
                  @srikalahasti_kalamkari_offical
                </span>
              </a>
            </div>
          </div>
        </div>
        <div className="py-3 border-t border-[#FAFAF8]/10 text-center text-[11px] text-[#FAFAF8]/40 font-inter">
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
