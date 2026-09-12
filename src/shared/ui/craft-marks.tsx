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

/** A cloth bundle tied with string — how a piece actually leaves the workshop. */
export function ParcelMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      <path d="M4.6 8.4c0-.35.22-.62.52-.64 4.6-.22 9.26-.22 13.86 0 .3.02.52.29.52.64.2 3.1.2 6.2 0 9.3-.02.35-.22.62-.52.64-4.6.22-9.26.22-13.86 0-.3-.02-.5-.29-.52-.64-.2-3.1-.2-6.2 0-9.3z" />
      <path d="M12 7.85c.06 3.55.06 7.1 0 10.65" />
      <path d="M4.7 13.1c4.87.2 9.76.2 14.63 0" />
      <path d="M12 7.75c-.85-1.05-1.95-1.95-3.05-1.8-.9.12-1.2 1-.4 1.5.9.55 2.3.45 3.45.3z" />
      <path d="M12 7.75c.85-1.05 1.95-1.95 3.05-1.8.9.12 1.2 1 .4 1.5-.9.55-2.3.45-3.45.3z" />
    </svg>
  )
}

/** A padlock in the same pen line — payment handled securely by Razorpay. */
export function LockMark({ className, strokeWidth = 1.2 }: CraftMarkProps) {
  return (
    <svg {...baseProps} className={className} strokeWidth={strokeWidth}>
      <path d="M5.4 11.2c0-.4.3-.7.7-.72 3.93-.2 7.87-.2 11.8 0 .4.02.7.32.7.72.18 2.78.18 5.55 0 8.33-.02.4-.3.7-.7.72-3.93.2-7.87.2-11.8 0-.4-.02-.68-.32-.7-.72-.18-2.78-.18-5.55 0-8.33z" />
      <path d="M8.3 10.5V8.1c0-2.1 1.66-3.8 3.7-3.8s3.7 1.7 3.7 3.8v2.4" />
      <path d="M12 14.2c.04.8.04 1.6 0 2.4" />
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
