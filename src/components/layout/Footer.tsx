"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Instagram,
  MapPin,
  Phone,
  ExternalLink,
  Mail,
  Clock,
  Youtube,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { CONTACT, mailtoHref, telHref, whatsAppHref } from "@/shared/config/contact"
import { KalamkariMandala } from "@/shared/ui/heritage-ornaments"

const linkClass =
  "inline-flex min-h-[40px] items-center text-[#DCE6F2] transition-colors duration-200 hover:text-[hsl(var(--brand-gold-soft))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold))] rounded-sm"

const headingClass =
  "font-sans text-[12px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-gold))]"

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t-2 border-[hsl(var(--brand-gold))] bg-[hsl(var(--brand-midnight))] font-sans text-white"
      aria-label="Site Footer"
    >
      {/* Kalamkari Mandala watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden">
        <KalamkariMandala className="pointer-events-none h-[400px] w-auto object-contain opacity-[0.04] text-[hsl(var(--brand-gold))] md:h-[500px] lg:h-[600px] xl:h-[800px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-10 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-12 lg:py-20">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-4">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5 p-2 shadow-sm ring-2 ring-[hsl(var(--brand-gold))]">
                <Image
                  src="/images/srikalahasti-crest-only.png"
                  alt="Srikalahasti Kalamkari"
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="font-serif text-xl font-bold tracking-normal text-white sm:text-2xl">
                Srikalahasti Kalamkari
              </h3>
            </div>

            <p className="max-w-sm text-[13.5px] leading-relaxed text-[#DCE6F2]">
              GI-registered Srikalahasti Kalamkari, drawn by hand with a bamboo kalam and coloured with natural dyes.
            </p>

            <div className="space-y-1 pt-1 text-[12.5px] text-white/70">
              <p>
                <span className="font-medium text-[hsl(var(--brand-gold-soft))]">GI Registered:</span> Application No. 28
              </p>
              <p>
                <span className="font-medium text-[hsl(var(--brand-gold-soft))]">GSTIN:</span>{" "}
                <span className="font-mono text-white/85">{CONTACT.gstin}</span>
              </p>
            </div>

            <div className="pt-3 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={CONTACT.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2.5 rounded-full bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))]"
              >
                <Instagram className="h-4 w-4" />
                <span>Follow us on Instagram</span>
              </a>
              <a
                href={CONTACT.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#FF0000] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))]"
              >
                <Youtube className="h-4 w-4" />
                <span>Subscribe on YouTube</span>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3.5 lg:col-span-2">
            <h4 className={headingClass}>Collections</h4>
            <ul className="space-y-0.5 text-[13.5px]">
              {[
                { label: "Kalamkari Sarees", category: "Sarees" },
                { label: "Dupattas", category: "Duppatta" },
                { label: "Fabrics", category: "Fabrics" },
                { label: "Wall Paintings", category: "Wall Paintings" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={`/products?category=${encodeURIComponent(item.category)}`} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer care */}
          <div className="space-y-3.5 lg:col-span-2">
            <h4 className={headingClass}>Client Care</h4>
            <ul className="space-y-0.5 text-[13.5px]">
              {[
                { label: "Shipping Policy", href: "/shipping" },
                { label: "Refund Policy", href: "/returns" },
                { label: "Track Orders", href: "/orders" },
                { label: "Artisan Craft FAQs", href: "/faqs" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Inquiries */}
          <div className="space-y-4 lg:col-span-4">
            <h4 className={headingClass}>Inquiries</h4>

            <div className="space-y-3 text-[13.5px]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <a
                  href={telHref(CONTACT.phones[0])}
                  className="inline-flex items-center gap-2 font-semibold tabular-nums text-white transition-colors hover:text-[hsl(var(--brand-gold-soft))]"
                >
                  <Phone className="h-3.5 w-3.5 text-[hsl(var(--brand-gold-soft))]" />
                  <span>{CONTACT.phones[0]}</span>
                </a>
                <span className="text-white/50">·</span>
                <a
                  href={whatsAppHref("Hello! I would like to inquire about authentic Kalamkari collections.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                >
                  <FaWhatsapp className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div>
                <a href={mailtoHref()} className={`${linkClass} inline-flex items-center gap-2 break-all`}>
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-gold-soft))]" />
                  <span>{CONTACT.email}</span>
                </a>
              </div>

              <div className="space-y-3.5 border-t border-white/10 pt-2.5 text-[13px]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-gold-soft))]" />
                  <div>
                    <div className="font-semibold text-white">
                      Srikalahasti (Store & Workshop){" "}
                      <a
                        href={CONTACT.addresses.kalahasti.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--brand-gold-soft))] hover:underline"
                      >
                        Map <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="leading-snug text-white/75">
                      # 17-68, Bharathi Nagar, Tirupati Main Road, Near Railway Station, Srikalahasti-517640
                    </div>
                    <div className="mt-0.5 text-[12px] text-[hsl(var(--brand-gold-soft))] tabular-nums">
                      Ph: +91 72888 48881 / 82 / 83
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-gold-soft))]" />
                  <div>
                    <div className="font-semibold text-white">Tirupati Store</div>
                    <div className="leading-snug text-white/75">
                      # 6-8-1126, NGOs Colony, Opp: Balaji Silk Emporium, Revenue Ward No 6, Tirupati
                    </div>
                    <div className="mt-0.5 text-[12px] text-[hsl(var(--brand-gold-soft))] tabular-nums">
                      Ph: +91 70364 81999 / 82999 / 83999
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5 text-[12.5px] text-white/70">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-gold-soft))]" />
                  <span className="tabular-nums">Mon – Sat: 10:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 pb-24 text-[12.5px] text-white/70 sm:flex-row sm:pb-6 sm:pr-28">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center sm:justify-start sm:text-left">
            <span>© 2026 <span className="font-serif font-semibold">Srikalahasti Kalamkari</span></span>
            <span className="text-white/50">|</span>
            <Link href="/privacy" className="transition-colors hover:text-[hsl(var(--brand-gold-soft))]">Privacy Policy</Link>
            <span className="text-white/50">·</span>
            <Link href="/terms" className="transition-colors hover:text-[hsl(var(--brand-gold-soft))]">Terms of Service</Link>
            <span className="text-white/50">·</span>
            <Link href="/shipping" className="transition-colors hover:text-[hsl(var(--brand-gold-soft))]">Shipping</Link>
          </div>

          <div className="flex flex-col items-center gap-1 sm:items-end">
            <div className="font-serif text-[13px] tracking-wide text-[hsl(var(--brand-gold-soft))]">
              Crafted with Devotion in Srikalahasti
            </div>
            <div className="font-sans text-[12px] text-white/50">
              Made by{" "}
              <a href="https://exploreconsultancyservices.com/projects" target="_blank" rel="noopener noreferrer" className="font-medium text-white/80 hover:text-[hsl(var(--brand-gold))] transition-colors">
                Explore Consultancy Services
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
