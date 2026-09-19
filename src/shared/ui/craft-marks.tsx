/**
 * Craft marks
 *
 * The storefront's trust marks, drawn rather than pulled from an icon library.
 * A generic geometric icon set reads as software; these follow the bamboo
 * kalam line the products themselves are painted with — an even, thin stroke,
 * open terminals, and curves that are deliberately not perfectly symmetrical.
 *
 * All four share one stroke weight and one 24x24 box so they sit on a row
 * together without any of them looking heavier than the rest.
 */

type CraftMarkProps = {
  className?: string
  strokeWidth?: number
}

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
}

/** An elegant shipping box — free shipping mark. */
export function ParcelMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" strokeLinejoin="round" />
      <path d="M4 7.5L12 12l8-4.5" strokeLinejoin="round" />
      <path d="M12 12v9" strokeLinejoin="round" />
      <path d="M8 5.5l8 4.5" strokeLinejoin="round" />
    </svg>
  )
}

/** A clean, secure padlock — payment security mark. */
export function LockMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      <rect x="5" y="11" width="14" height="10" rx="2" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <path d="M12 15v2" strokeLinecap="round" />
    </svg>
  )
}

/** The lotus rosette that opens most Kalamkari borders, set as a seal. */
export function LotusSealMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      <path d="M12 3.3c4.8-.05 8.75 3.85 8.8 8.7.05 4.85-3.85 8.8-8.65 8.85-4.8.05-8.75-3.85-8.8-8.7-.05-4.85 3.85-8.8 8.65-8.85z" />
      {/* Narrow petals kept clear of the centre; wider ones collide into a
          dense knot once the mark is set at row size. */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle} 12 12)`}
          d="M12 5.5c.75.9 1.15 1.8 1.15 2.6 0 .72-.5 1.25-1.15 1.25s-1.15-.53-1.15-1.25c0-.8.4-1.7 1.15-2.6z"
        />
      ))}
      <circle cx="12" cy="12" r="1.15" />
    </svg>
  )
}

/** A certified rosette badge with ribbons — 100% handmade mark. */
export function HandmadeMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      {/* Ribbons */}
      <path d="M8 13.5v7.5l4-2.5 4 2.5v-7.5" strokeLinejoin="round" />
      {/* 16-point Scalloped Seal (Rosette) */}
      <polygon 
        points="12,2 14.3,3.5 16.9,4.1 17.5,6.7 19,9 17.5,11.3 16.9,13.9 14.3,14.5 12,16 9.7,14.5 7.1,13.9 6.5,11.3 5,9 6.5,6.7 7.1,4.1 9.7,3.5" 
        strokeLinejoin="round"
        fill="var(--background, #fff)"
      />
      {/* Inner circle */}
      <circle cx="12" cy="9" r="4.5" />
      {/* Checkmark */}
      <path d="M9.5 9.5l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Hand dipping into water basin — hand-wash only care mark. */
export function HandWashMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      {/* Basin */}
      <path d="M4 14h16l-1.2 5.5H5.2z" />
      {/* Water ripple */}
      <path d="M8 14c.4-1.2 1-1.8 1.6-1.8s1 .6 1.6 1.8" strokeWidth="1" />
      <path d="M12 14c.4-1.2 1-1.8 1.6-1.8s1 .6 1.6 1.8" strokeWidth="1" />
      {/* Hand */}
      <path d="M11 13.5V9a1 1 0 0 1 2 0v3" />
      <path d="M9.5 11V9.5a1 1 0 0 1 2 0" />
      <path d="M13 11V9.5a1 1 0 0 1 2 0v2.5" />
    </svg>
  )
}

/** A clean, stylized hanger with the universal 'P' dry clean symbol inside. */
export function DryCleanMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      {/* Hanger Hook */}
      <path d="M12 8.5V7C12 5.5 14 5.5 14 4c0-1.2-.8-2.4-2-2.4-1.2 0-2 .8-2 1.8" />
      {/* Hanger Body */}
      <path d="M12 8.5L2 15a1.5 1.5 0 0 0 0 3h20a1.5 1.5 0 0 0 0-3L12 8.5z" strokeLinejoin="round" />
      {/* Dry Clean 'P' Symbol inside the hanger */}
      <circle cx="12" cy="14.5" r="2.5" />
      <path d="M11.5 13h1.2c.6 0 1 .4 1 1s-.4 1-1 1h-1.2v1.5" />
    </svg>
  )
}
