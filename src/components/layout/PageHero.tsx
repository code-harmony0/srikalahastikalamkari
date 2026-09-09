"use client"

import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkles } from "lucide-react"
import { cn } from "@/shared/utils"

export type PageHeroTheme = "madder" | "indigo" | "emerald" | "obsidian" | "classic"

export interface PageHeroProps {
  /** Visual atmosphere theme inspired by authentic Kalamkari natural dyes */
  theme?: PageHeroTheme
  /** Small category / theme tag displayed above the title */
  eyebrow?: string
  /** Leading text of the title, rendered in uppercase serif */
  titleStart: string
  /** Emphasized accent word, rendered in italic gold lowercase serif */
  titleAccent: string
  /** Trailing text of the title (optional) */
  titleEnd?: string
  /** Supporting descriptive copy */
  description?: React.ReactNode
  /** Optional background image path (rendered with dark contrast overlay) */
  bgImage?: string
  /** Image alt text if bgImage is provided */
  bgImageAlt?: string
  /** Optional slot for action buttons, pills, or breadcrumbs */
  children?: React.ReactNode
  /** Extra styling overrides */
  className?: string
  /** Whether to render a slightly more compact height */
  compact?: boolean
}

interface ThemeConfig {
  bg: string
  overlayGradient: string
  glow: string
  cornerBorder: string
  frameBorder: string
  eyebrowPill: string
  eyebrowText: string
  eyebrowIcon: string
  accentText: string
  divider: string
}

const THEMES: Record<PageHeroTheme, ThemeConfig> = {
  madder: {
    bg: "bg-gradient-to-b from-[#2E070C] via-[#1F0508] to-[#120305]",
    overlayGradient: "from-[#2E070C]/90 via-[#1F0508]/80 to-[#120305]/95",
    glow: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220, 38, 38, 0.22) 0%, rgba(226, 189, 122, 0.16) 45%, rgba(18, 3, 5, 0) 100%)",
    cornerBorder: "border-[#E2BD7A]",
    frameBorder: "border-[#E2BD7A]/25",
    eyebrowPill: "bg-red-950/60 border-[#E2BD7A]/40 text-[#E2BD7A] shadow-[0_2px_12px_rgba(220,38,38,0.2)]",
    eyebrowText: "text-[#E2BD7A]",
    eyebrowIcon: "text-[#F87171]",
    accentText: "text-[#E2BD7A]",
    divider: "from-transparent via-[#E2BD7A] to-transparent",
  },
  indigo: {
    bg: "bg-gradient-to-b from-[#09152B] via-[#0C1A36] to-[#050D1C]",
    overlayGradient: "from-[#09152B]/90 via-[#0C1A36]/80 to-[#050D1C]/95",
    glow: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37, 99, 235, 0.22) 0%, rgba(226, 189, 122, 0.16) 45%, rgba(5, 13, 28, 0) 100%)",
    cornerBorder: "border-[#E2BD7A]",
    frameBorder: "border-[#E2BD7A]/25",
    eyebrowPill: "bg-blue-950/60 border-[#E2BD7A]/40 text-[#E2BD7A] shadow-[0_2px_12px_rgba(37,99,235,0.2)]",
    eyebrowText: "text-[#E2BD7A]",
    eyebrowIcon: "text-[#60A5FA]",
    accentText: "text-[#E2BD7A]",
    divider: "from-transparent via-[#E2BD7A] to-transparent",
  },
  emerald: {
    bg: "bg-gradient-to-b from-[#062118] via-[#082C20] to-[#03140E]",
    overlayGradient: "from-[#062118]/90 via-[#082C20]/80 to-[#03140E]/95",
    glow: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(16, 185, 129, 0.20) 0%, rgba(226, 189, 122, 0.16) 45%, rgba(3, 20, 14, 0) 100%)",
    cornerBorder: "border-[#E2BD7A]",
    frameBorder: "border-[#E2BD7A]/25",
    eyebrowPill: "bg-emerald-950/60 border-[#E2BD7A]/40 text-[#E2BD7A] shadow-[0_2px_12px_rgba(16,185,129,0.2)]",
    eyebrowText: "text-[#E2BD7A]",
    eyebrowIcon: "text-[#34D399]",
    accentText: "text-[#E2BD7A]",
    divider: "from-transparent via-[#E2BD7A] to-transparent",
  },
  obsidian: {
    bg: "bg-gradient-to-b from-[#161210] via-[#1A1412] to-[#0D0B09]",
    overlayGradient: "from-[#161210]/92 via-[#1A1412]/80 to-[#0D0B09]/96",
    glow: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(226, 189, 122, 0.18) 0%, rgba(193, 154, 91, 0.08) 50%, rgba(13, 11, 9, 0) 100%)",
    cornerBorder: "border-[#C19A5B]",
    frameBorder: "border-[#C19A5B]/25",
    eyebrowPill: "bg-white/10 border-[#C19A5B]/35 text-[#E2BD7A]",
    eyebrowText: "text-[#E2BD7A]",
    eyebrowIcon: "text-[#E2BD7A]",
    accentText: "text-[#E2BD7A]",
    divider: "from-transparent via-[#C19A5B] to-transparent",
  },
  classic: {
    bg: "bg-[#1A1512]",
    overlayGradient: "from-[#1A1512]/90 via-[#1A1512]/75 to-[#1A1512]/95",
    glow: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(193, 154, 91, 0.12) 0%, rgba(26, 21, 18, 0) 100%)",
    cornerBorder: "border-[#C19A5B]",
    frameBorder: "border-[#C19A5B]/20",
    eyebrowPill: "bg-white/10 border-[#C19A5B]/30 text-[#E2BD7A]",
    eyebrowText: "text-[#E2BD7A]",
    eyebrowIcon: "text-[#E2BD7A]",
    accentText: "text-[#E2BD7A]",
    divider: "from-transparent via-[#C19A5B] to-transparent",
  },
}

export function PageHero({
  theme = "classic",
  eyebrow,
  titleStart,
  titleAccent,
  titleEnd,
  description,
  bgImage,
  bgImageAlt = "Srikalahasti Kalamkari Heritage",
  children,
  className,
  compact = false,
}: PageHeroProps) {
  const t = THEMES[theme] || THEMES.classic

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden text-white flex items-center justify-center text-center px-5 sm:px-6",
        t.bg,
        // Consistent architectural height scale across all interior pages:
        compact
          ? "h-[190px] sm:h-[210px] md:h-[230px]"
          : "h-[220px] sm:h-[250px] md:h-[270px]",
        className
      )}
    >
      {/* 1. Optional Photographic Texture Wash */}
      {bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={bgImage}
            alt={bgImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] scale-105 opacity-25"
          />
          {/* Gradients to keep text 100% readable and blend seamlessly into the themed base */}
          <div className={cn("absolute inset-0 bg-gradient-to-b", t.overlayGradient)} />
        </div>
      )}

      {/* 2. Authentic Srikalahasti Kalamkari Motif Watermark */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C19A5B' stroke-width='0.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M50 30c18 0 32 14 32 32 0 25-18 45-32 45s-32-20-32-45c0-18 14-32 32-32z'/%3E%3Cpath d='M150 120c15 0 27 12 27 27 0 21-15 39-27 39s-27-18-27-39c0-15 12-27 27-27z'/%3E%3Cpath d='M120 50c12 0 22 10 22 22 0 16-12 30-22 30s-22-14-22-30c0-12 10-22 22-22z'/%3E%3Cpath d='M70 140c10 0 18 8 18 18 0 14-10 25-18 25s-18-11-18-25c0-10 8-18 18-18z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* 3. Ambient Warm Jewel Center Glow */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: t.glow,
        }}
      />

      {/* 4. Signature Editorial Temple Corner Marks & Border Frame */}
      <div className={cn("absolute inset-3 sm:inset-5 md:inset-6 z-[5] pointer-events-none border", t.frameBorder)}>
        {/* Four Traditional Temple Corner Notches */}
        <div className={cn("absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2", t.cornerBorder)} />
        <div className={cn("absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2", t.cornerBorder)} />
        <div className={cn("absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2", t.cornerBorder)} />
        <div className={cn("absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2", t.cornerBorder)} />
      </div>

      {/* 5. Animated Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3"
      >
        {/* Eyebrow Pill */}
        {eyebrow && (
          <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border", t.eyebrowPill)}>
            <Sparkles className={cn("w-3 h-3", t.eyebrowIcon)} />
            <span className={cn("font-sans text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase", t.eyebrowText)}>
              {eyebrow}
            </span>
          </div>
        )}

        {/* Signature H1 Title */}
        <h1 className="font-serif text-[26px] sm:text-[34px] md:text-[42px] font-bold text-white tracking-wide leading-tight uppercase drop-shadow-sm">
          {titleStart}{" "}
          <span className={cn("italic font-normal lowercase font-serif", t.accentText)}>
            {titleAccent}
          </span>
          {titleEnd && ` ${titleEnd}`}
        </h1>

        {/* Tapering Center Divider Line */}
        <div className={cn("h-px w-20 sm:w-28 bg-gradient-to-r my-1", t.divider)} />

        {/* Subtitle */}
        {description && (
          <p className="font-sans text-white/85 text-[12px] sm:text-[13px] md:text-[14.5px] font-normal tracking-wide max-w-[560px] leading-relaxed">
            {description}
          </p>
        )}

        {/* Optional Action Buttons or Metadata Badges */}
        {children && <div className="pt-2">{children}</div>}
      </motion.div>
    </section>
  )
}
