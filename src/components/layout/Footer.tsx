"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Instagram,
  MapPin,
  Phone,
  ExternalLink,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
} from "lucide-react"
import { CONTACT, mailtoHref, telHref, whatsAppHref } from "@/shared/config/contact"

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-gradient-to-b from-[#1C1613] via-[#140F0D] to-[#0D0907] text-[#FAFAF8] border-t border-[#C19A5B]/35 font-sans"
      aria-label="Site Footer"
    >
      {/* ── Sacred Background Watermark Crest (Emblem Only, No Text) ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 select-none">
        <Image
          src="/images/srikalahasti-crest-only.png"
          alt=""
          width={465}
          height={359}
          aria-hidden="true"
          className="h-[280px] w-auto object-contain opacity-[0.05] saturate-50 md:h-[360px] lg:h-[420px] pointer-events-none"
        />
      </div>

      {/* ── Soft Heritage Radial Glow ── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(193,154,91,0.08),transparent_70%)] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* ── Main 4-Column Grid ── */}
        <div className="py-14 sm:py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Column 1: Brand (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl flex shrink-0 items-center justify-center bg-[#0D0907] overflow-hidden shadow-md ring-1 ring-[#C19A5B]/40 p-1">
                <Image
                  src="/images/srikalahasti-crest-only.png"
                  alt="Srikalahasti Kalamkari"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg tracking-wider text-white uppercase">
                  SRIKALAHASTI KALAMKARI
                </h3>
              </div>
            </div>

            <p className="text-[#D6CBC0] text-[13.5px] leading-relaxed max-w-sm">
              Authentic GI-certified hand-drawn bamboo pen artistry and 100% natural vegetable dyes on pure handloom textiles.
            </p>

            <div className="text-[12.5px] text-[#A89F91] space-y-1 pt-1">
              <p>
                <span className="text-[#E2BD7A] font-medium">GI Registered:</span> Application No. 28
              </p>
              <p>
                <span className="text-[#E2BD7A] font-medium">GSTIN:</span>{" "}
                <span className="font-mono text-[#D6CBC0]">{CONTACT.gstin}</span>
              </p>
            </div>

            <div className="pt-1">
              <a
                href="https://www.instagram.com/srikalahasti_kalamkari_offical"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] text-[#D6CBC0] hover:text-[#E2BD7A] transition-colors group"
              >
                <Instagram className="w-4 h-4 text-[hsl(var(--brand-gold-deep))] group-hover:scale-110 transition-transform" />
                <span>@srikalahasti_kalamkari_offical</span>
              </a>
            </div>
          </div>

          {/* Column 2: Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-serif text-[12px] font-bold uppercase tracking-[0.2em] text-[#E2BD7A]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-[13.5px]">
              {[
                { label: "Kalamkari Sarees", category: "Sarees" },
                { label: "Handcrafted Dupattas", category: "Duppatta" },
                { label: "Dress Materials", category: "Fabrics" },
                { label: "Wall Art", category: "wall-paintings" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={`/products?category=${encodeURIComponent(item.category)}`}
                    className="text-[#D6CBC0] hover:text-[#E2BD7A] hover:translate-x-1 transition-all duration-200 inline-block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-serif text-[12px] font-bold uppercase tracking-[0.2em] text-[#E2BD7A]">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-[13.5px]">
              {[
                { label: "Shipping Policy", href: "/shipping" },
                { label: "Refund Policy", href: "/returns" },
                { label: "Track Orders", href: "/orders" },
                { label: "Artisan Craft FAQs", href: "/faqs" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#D6CBC0] hover:text-[#E2BD7A] hover:translate-x-1 transition-all duration-200 inline-block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Atelier & Inquiries (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif text-[12px] font-bold uppercase tracking-[0.2em] text-[#E2BD7A]">
              Atelier & Inquiries
            </h4>

            <div className="space-y-3 text-[13.5px]">
              {/* Helplines */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <a
                  href={telHref(CONTACT.phones[0])}
                  className="inline-flex items-center gap-2 text-white hover:text-[#E2BD7A] font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[hsl(var(--brand-gold-deep))]" />
                  <span>{CONTACT.phones[0]}</span>
                </a>
                <span className="text-white/20">·</span>
                <a
                  href={whatsAppHref("Hello! I would like to inquire about authentic Kalamkari collections.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Email */}
              <div>
                <a
                  href={mailtoHref()}
                  className="inline-flex items-center gap-2 text-[#D6CBC0] hover:text-white transition-colors break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[hsl(var(--brand-gold-deep))] shrink-0" />
                  <span>{CONTACT.email}</span>
                </a>
              </div>

              {/* Locations - Clean & Uncluttered */}
              <div className="pt-2 border-t border-white/10 space-y-3 text-[13px]">
                {/* Srikalahasti */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[hsl(var(--brand-gold-deep))] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Srikalahasti Atelier</div>
                    <div className="text-[#D6CBC0] leading-snug">#17-68, Bharathi Nagar, Tirupati Main Rd</div>
                  </div>
                </div>

                {/* Tirupati */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[hsl(var(--brand-gold-deep))] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">
                      Tirupati Store{" "}
                      <a
                        href="https://maps.app.goo.gl/tABoSwfoUcmEQjgJA"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E2BD7A] hover:underline ml-1"
                      >
                        Map <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="text-[#D6CBC0] leading-snug">#6-8-1126, NGOs Colony</div>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-center gap-2 text-[12.5px] text-[#A89F91] pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[hsl(var(--brand-gold-deep))] shrink-0" />
                  <span>Mon – Sat: 10:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Utility Bar ── */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-[#A89F91] pb-24 sm:pb-6 sm:pr-28">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-center sm:text-left">
            <span>© 2026 Srikalahasti Kalamkari</span>
            <span className="text-white/20">|</span>
            <Link href="/privacy" className="hover:text-[#E2BD7A] transition-colors">Privacy Policy</Link>
            <span className="text-white/20">·</span>
            <Link href="/terms" className="hover:text-[#E2BD7A] transition-colors">Terms of Service</Link>
            <span className="text-white/20">·</span>
            <Link href="/shipping" className="hover:text-[#E2BD7A] transition-colors">Shipping</Link>
          </div>

          <div className="font-serif italic text-[12px] text-[hsl(var(--brand-gold-deep))] tracking-wide">
            Crafted with Devotion in Srikalahasti
          </div>
        </div>
      </div>
    </footer>
  )
}

