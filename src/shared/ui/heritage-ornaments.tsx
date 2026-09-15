import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/shared/utils"

/**
 * Traditional ornament drawn as line art, in the manner of Kalamkari pen
 * outlines: a lotus divider, a cusped temple-arch (jharokha) frame, a scalloped
 * band edge and small corner florals. All decorative and aria-hidden.
 */

/** A lotus between two fine rules — the section divider. */
export function FloralDivider({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 40"
      width="240"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("mx-auto block text-[hsl(var(--brand-gold-ornament))]", className)}
    >
      {/* Horizontal border lines */}
      <path d="M 10 20 L 75 20 M 165 20 L 230 20" />
      <path d="M 15 16 L 65 16 M 175 16 L 225 16" strokeWidth="0.8" opacity="0.6" />
      <path d="M 15 24 L 65 24 M 175 24 L 225 24" strokeWidth="0.8" opacity="0.6" />

      {/* Flanking leaf swirls (Kalamkari style) */}
      <path d="M 75 20 C 80 10, 95 10, 100 20 C 105 30, 95 35, 90 28 C 85 22, 90 15, 95 15" />
      <path d="M 165 20 C 160 10, 145 10, 140 20 C 135 30, 145 35, 150 28 C 155 22, 150 15, 145 15" />
      <circle cx="95" cy="15" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="145" cy="15" r="1.2" fill="currentColor" stroke="none" />
      
      {/* Flourish dots */}
      <circle cx="80" cy="28" r="1" fill="currentColor" stroke="none" />
      <circle cx="160" cy="28" r="1" fill="currentColor" stroke="none" />

      {/* Main Lotus (Center at 120, 20) */}
      <path d="M 120 4 C 115 12, 115 24, 120 32 C 125 24, 125 12, 120 4 Z" /> {/* Central petal */}
      
      {/* Inner petals */}
      <path d="M 120 32 C 112 28, 108 22, 108 14 C 112 18, 116 25, 120 28" />
      <path d="M 120 32 C 128 28, 132 22, 132 14 C 128 18, 124 25, 120 28" />
      
      {/* Outer petals */}
      <path d="M 120 34 C 105 32, 98 25, 98 16 C 102 24, 110 32, 120 34 Z" />
      <path d="M 120 34 C 135 32, 142 25, 142 16 C 138 24, 130 32, 120 34 Z" />

      {/* Lotus base / receptacle */}
      <path d="M 112 33 C 116 38, 124 38, 128 33" />
      <path d="M 115 36 C 118 40, 122 40, 125 36" />
      
      {/* Dots and accents */}
      <circle cx="120" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="120" cy="10" r="1" fill="currentColor" stroke="none" />
      
      {/* Hanging ornaments from the divider lines */}
      <path d="M 40 24 L 40 28" /> <circle cx="40" cy="30" r="1" fill="currentColor" stroke="none" />
      <path d="M 200 24 L 200 28" /> <circle cx="200" cy="30" r="1" fill="currentColor" stroke="none" />
      <path d="M 25 16 L 25 12" /> <circle cx="25" cy="10" r="1" fill="currentColor" stroke="none" />
      <path d="M 215 16 L 215 12" /> <circle cx="215" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Shared frame for the small line-art dividers below: two gold rules and a centre motif. */
function DividerArt({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 40"
      width="240"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("mx-auto block text-[hsl(var(--brand-gold-ornament))]", className)}
    >
      {children}
    </svg>
  )
}

/** A stepped temple tower (gopuram) with kalash tops, like the Srikalahasti temple gate. */
export function TempleTowerDivider({ className }: { className?: string }) {
  return (
    <DividerArt className={className}>
      <path d="M10 30 H100 M140 30 H230" />
      <path d="M22 26 H92 M148 26 H218" strokeWidth="0.8" opacity="0.6" />
      <path d="M103 37 H137" />
      <path d="M105 37 L107.5 29 H132.5 L135 37" />
      <path d="M108.5 29 L111 22 H129 L131.5 29" />
      <path d="M112 22 L114 16 H126 L128 22" />
      <path d="M113.5 16 C113.5 10.5 126.5 10.5 126.5 16" />
      <path d="M117 12 V8.5 M120 11 V6.5 M123 12 V8.5" />
      <circle cx="117" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="120" cy="5.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="123" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <path d="M117 37 V33.5 C117 31 123 31 123 33.5 V37" />
      <circle cx="113" cy="33" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="127" cy="33" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="120" cy="25.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="120" cy="19" r="0.9" fill="currentColor" stroke="none" />
    </DividerArt>
  )
}

/** A kalash (purna kumbha): a filled pot with mango leaves and a coconut. */
export function KalashDivider({ className }: { className?: string }) {
  return (
    <DividerArt className={className}>
      <path d="M10 22 H96 M144 22 H230" />
      <path d="M22 18 H88 M152 18 H218" strokeWidth="0.8" opacity="0.6" />
      <path d="M110 22 H130" />
      <path d="M112 22 L114 25 H126 L128 22" />
      <path d="M114 25 C106 28 106 37 120 37 C134 37 134 28 126 25" />
      <path d="M110 31 H130" strokeWidth="0.8" />
      <circle cx="115" cy="34" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="120" cy="34.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="125" cy="34" r="0.9" fill="currentColor" stroke="none" />
      <path d="M120 5 C114 5 113 12 116 18 H124 C127 12 126 5 120 5 Z" />
      <path d="M116 19 C110 18 104 15 100 11 C107 11 112 14 116 19" />
      <path d="M124 19 C130 18 136 15 140 11 C133 11 128 14 124 19" />
      <path d="M117 20 C112 21 107 21 103 19" />
      <path d="M123 20 C128 21 133 21 137 19" />
    </DividerArt>
  )
}

/** Temple bells (ghanta): one large bell and two small ones under an arch. */
export function TempleBellsDivider({ className }: { className?: string }) {
  return (
    <DividerArt className={className}>
      <path d="M10 14 H98 M142 14 H230" />
      <path d="M22 10 H90 M150 10 H218" strokeWidth="0.8" opacity="0.6" />
      <path d="M104 14 C104 5 136 5 136 14" />
      <path d="M120 7 V12" />
      <path d="M114 29 C114 19 116 15 120 15 C124 15 126 19 126 29 L129 32 H111 Z" />
      <path d="M115 25 H125" strokeWidth="0.8" />
      <path d="M116 21 H124" strokeWidth="0.8" />
      <circle cx="120" cy="35" r="1.6" fill="currentColor" stroke="none" />
      <path d="M104 14 V20" />
      <path d="M101.5 24 C101.5 20 102.5 19 104 19 C105.5 19 106.5 20 106.5 24 H101.5 Z" />
      <path d="M136 14 V20" />
      <path d="M133.5 24 C133.5 20 134.5 19 136 19 C137.5 19 138.5 20 138.5 24 H133.5 Z" />
    </DividerArt>
  )
}

// Cusped arch outline in a 300×400 box: side walls, two lobes each side, a pointed crown.
const ARCH =
  "M0 400V150C0 122 18 106 40 101C44 72 68 56 95 56C104 27 128 11 150 0C172 11 196 27 205 56C232 56 256 72 260 101C282 106 300 122 300 150V400Z"
const ARCH_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400' preserveAspectRatio='none'><path d='${ARCH}' fill='black'/></svg>`,
)}")`

/**
 * Wraps an image in a cusped temple arch with a double gold line.
 * The child should fill the frame (e.g. next/image with `fill`).
 */
export function JharokhaFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const mask: CSSProperties = {
    WebkitMaskImage: ARCH_MASK,
    maskImage: ARCH_MASK,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  }
  return (
    <div className={cn("relative aspect-[3/4] w-full", className)}>
      <div className="absolute inset-0 overflow-hidden bg-[hsl(var(--brand-paper))]" style={mask}>
        {children}
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
      >
        <path d={ARCH} stroke="hsl(var(--brand-gold))" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        <path
          d={ARCH}
          transform="translate(10 13) scale(0.9333 0.935)"
          stroke="hsl(var(--brand-gold-soft))"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Finial above the crown */}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 26"
        width="20"
        height="26"
        className="pointer-events-none absolute -top-[22px] left-1/2 -translate-x-1/2 text-[hsl(var(--brand-gold-ornament))]"
        fill="currentColor"
      >
        <path d="M10 0 L14 7 L10 14 L6 7 Z" />
        <rect x="9.25" y="14" width="1.5" height="12" />
      </svg>
    </div>
  )
}

/**
 * A scalloped edge that makes the top of a band look cut like a textile border.
 * Pass the band's colour as `color` (any CSS colour).
 */
export function ScallopEdge({ color, flip = false, className }: { color: string; flip?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("h-3 w-full", flip && "rotate-180", className)}
      style={{
        backgroundImage: `radial-gradient(circle at 12px 12px, ${color} 11.5px, transparent 12px)`,
        backgroundSize: "24px 12px",
        backgroundRepeat: "repeat-x",
      }}
    />
  )
}

/** A small floral sprig for band corners. Rotate for the other corners. */
export function CornerFlorals({ className }: { className?: string }) {
  // If the parent rotates this 180 degrees (for bottom corners), we counter-rotate 
  // the inner drawing so the mandir always stays right-side up!
  const isRotated = className?.includes("rotate-180")
  
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("pointer-events-none text-[hsl(var(--brand-gold-ornament))]", className)}
    >
      <g transform={isRotated ? "rotate(180 60 60)" : undefined}>
        {/* Base Steps with decorative dots */}
        <path d="M25 105 L95 105" />
        <path d="M32 98 L88 98" />
        <circle cx="60" cy="101.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="45" cy="101.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="75" cy="101.5" r="1" fill="currentColor" stroke="none" />

        {/* Temple Pillars with ornate capitals */}
        <path d="M38 98 L38 65" />
        <path d="M44 98 L44 65" />
        <path d="M76 98 L76 65" />
        <path d="M82 98 L82 65" />
        
        {/* Capitals */}
        <path d="M35 65 C41 62, 41 62, 47 65" />
        <path d="M36 68 L46 68" />
        <path d="M73 65 C79 62, 79 62, 85 65" />
        <path d="M74 68 L84 68" />

        {/* Inner Arch (Garbhagriha) */}
        <path d="M48 98 L48 80 C48 65, 72 65, 72 80 L72 98" />
        
        {/* Hanging Bell inside arch */}
        <path d="M60 72 L60 80" strokeWidth="1" />
        <path d="M57 80 C57 78, 63 78, 63 80 C64 84, 56 84, 57 80 Z" />
        <circle cx="60" cy="84" r="1" fill="currentColor" stroke="none" />

        {/* Temple Roof (Vimana) - Stepped curved pyramid */}
        <path d="M32 62 C40 50, 48 40, 60 35 C72 40, 80 50, 88 62 Z" />
        <path d="M38 52 C45 46, 52 41, 60 39 C68 41, 75 46, 82 52" />
        <path d="M45 44 C50 40, 55 37, 60 36 C65 37, 70 40, 75 44" />
        
        {/* Roof Ornaments (Kalasams) */}
        <path d="M60 35 L60 25" />
        <circle cx="60" cy="23" r="2" />
        <path d="M50 40 L50 32" />
        <circle cx="50" cy="30" r="1.5" />
        <path d="M70 40 L70 32" />
        <circle cx="70" cy="30" r="1.5" />

        {/* Temple Flag (Dhwaja) */}
        <path d="M60 21 C68 18, 75 22, 78 18 C75 26, 68 22, 60 25" fill="currentColor" stroke="none" />

        {/* Side flourishes (Lotus/Vines) - Classic Kalamkari filler motifs */}
        <path d="M25 98 C15 90, 10 75, 20 65 C25 60, 30 65, 28 72 C26 78, 20 80, 25 98" />
        <path d="M95 98 C105 90, 110 75, 100 65 C95 60, 90 65, 92 72 C94 78, 100 80, 95 98" />
        <circle cx="16" cy="78" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="104" cy="78" r="1.5" fill="currentColor" stroke="none" />
        
        {/* Sun and Moon (Traditional Hindu corners) */}
        <circle cx="25" cy="35" r="4" />
        <path d="M25 28 L25 25 M25 42 L25 45 M18 35 L15 35 M32 35 L35 35 M20 30 L18 28 M30 40 L32 42 M20 40 L18 42 M30 30 L32 28" strokeWidth="1" />
        <path d="M98 31 C94 31, 91 34, 91 38 C91 42, 94 45, 98 45 C96 42, 96 34, 98 31 Z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

/** 
 * A large, highly intricate Kalamkari Mandala for background watermarks.
 * Beautifully drawn in line-art with concentric layers, lotus petals, and scalloped edges.
 */
export function KalamkariMandala({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        {/* Inner Lotus Petal */}
        <g id="petal-1">
          <path d="M 200 185 C 190 170, 190 155, 200 145 C 210 155, 210 170, 200 185 Z" />
          <path d="M 200 185 C 195 175, 195 165, 200 155 C 205 165, 205 175, 200 185 Z" />
          <circle cx="200" cy="151" r="1.5" fill="currentColor" stroke="none" />
        </g>
        
        {/* Outer Flared Petal */}
        <g id="petal-2">
          <path d="M 200 135 C 180 110, 160 70, 200 30 C 240 70, 220 110, 200 135 Z" />
          <path d="M 200 135 C 190 115, 180 85, 200 50 C 220 85, 210 115, 200 135 Z" />
          <path d="M 200 120 C 195 105, 192 90, 200 70 C 208 90, 205 105, 200 120 Z" />
          <circle cx="200" cy="40" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="200" cy="60" r="1.5" fill="currentColor" stroke="none" />
        </g>
        
        {/* Corner/Gap flourishes between large petals */}
        <g id="flourish">
          <path d="M 200 135 C 190 130, 175 110, 185 90 C 190 80, 200 85, 200 95" />
          <circle cx="185" cy="90" r="2" fill="currentColor" stroke="none" />
        </g>
      </defs>

      {/* Core Bindu and rings */}
      <circle cx="200" cy="200" r="4" fill="currentColor" stroke="none" />
      <circle cx="200" cy="200" r="15" />
      <circle cx="200" cy="200" r="20" strokeWidth="2" />
      
      {/* 12 Inner Petals */}
      {Array.from({ length: 12 }).map((_, i) => (
        <use key={`inner-${i}`} href="#petal-1" transform={`rotate(${i * 30} 200 200)`} />
      ))}

      {/* Rings separating inner and outer */}
      <circle cx="200" cy="200" r="60" />
      <circle cx="200" cy="200" r="65" strokeWidth="2" />
      <circle cx="200" cy="200" r="70" />

      {/* Decorative dots in the ring track */}
      {Array.from({ length: 36 }).map((_, i) => (
        <circle key={`dot-${i}`} cx="200" cy="132.5" r="1.5" fill="currentColor" stroke="none" transform={`rotate(${i * 10} 200 200)`} />
      ))}
      
      {/* 8 Outer Flared Petals */}
      {Array.from({ length: 8 }).map((_, i) => (
        <use key={`outer-${i}`} href="#petal-2" transform={`rotate(${i * 45} 200 200)`} />
      ))}

      {/* 8 Flourishes between outer petals */}
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={`flourish-group-${i}`} transform={`rotate(${i * 45 + 22.5} 200 200)`}>
          <use href="#flourish" />
          {/* Mirrored flourish to form a symmetrical motif */}
          <use href="#flourish" transform="translate(400, 0) scale(-1, 1)" />
        </g>
      ))}

      {/* Outer Border Track */}
      <circle cx="200" cy="200" r="175" />
      <circle cx="200" cy="200" r="185" strokeWidth="2" />
      
      {/* Scalloped outer edge (mini petals) */}
      {Array.from({ length: 72 }).map((_, i) => (
        <path key={`scallop-${i}`} d="M 200 15 C 196 5, 204 5, 200 15 Z" transform={`rotate(${i * 5} 200 200)`} />
      ))}
    </svg>
  )
}
