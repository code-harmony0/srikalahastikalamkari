import React from "react"
import Image from "next/image"
import { cn } from "@/shared/utils"
import { CornerFlorals, TempleTowerDivider } from "@/shared/ui/heritage-ornaments"

export type PageHeroTheme = "madder" | "indigo" | "emerald" | "obsidian" | "classic"

export interface PageHeroProps {
  /** Kept so existing pages compile; every page now uses the same light band. */
  theme?: PageHeroTheme
  /** Kept so existing pages compile; small labels above titles are no longer shown. */
  eyebrow?: string
  /** First part of the title */
  titleStart: string
  /** Second part of the title (shown in the same charcoal, not a different colour) */
  titleAccent: string
  /** Last part of the title (optional) */
  titleEnd?: string
  /** Short text under the title */
  description?: React.ReactNode
  /** Optional faint background photo */
  bgImage?: string
  /** Kept so existing pages compile; the background photo is decorative */
  bgImageAlt?: string
  /** Optional slot for buttons or links under the text */
  children?: React.ReactNode
  /** Extra styling overrides */
  className?: string
  /** Less padding */
  compact?: boolean
}

/**
 * Interior page band, the same on every page as on the shop, about and contact
 * pages: pale indigo, charcoal serif title, one temple tower divider and small
 * temple drawings in the corners.
 */
export function PageHero({
  titleStart,
  titleAccent,
  titleEnd,
  description,
  bgImage,
  children,
  className,
  compact = false,
}: PageHeroProps) {
  const title = [titleStart, titleAccent, titleEnd].filter(Boolean).join(" ")

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))] text-[hsl(var(--brand-ink))]",
        className,
      )}
    >
      {bgImage && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover object-[center_35%] opacity-15" />
        </div>
      )}
      <CornerFlorals className="absolute left-2 top-3 h-14 w-14 opacity-70 md:left-4 md:h-24 md:w-24" />
      <CornerFlorals className="absolute bottom-3 right-2 hidden h-14 w-14 rotate-180 opacity-70 sm:block md:right-4 md:h-24 md:w-24" />

      <div className={cn("relative mx-auto max-w-2xl px-6 text-center", compact ? "py-8 md:py-10" : "py-10 md:py-14")}>
        <h1 className="text-balance font-serif text-[32px] leading-tight md:text-[46px]">{title}</h1>
        <TempleTowerDivider className="mt-3" />
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))] md:text-[16px]">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  )
}
