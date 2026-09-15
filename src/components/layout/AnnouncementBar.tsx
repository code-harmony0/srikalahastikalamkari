"use client";

import { useState } from "react";
import { X } from "lucide-react";

/** One calm, static line: rotating text changed height on phones and could not be paused. */
export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative z-50 bg-[hsl(var(--brand-midnight))] text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center px-12 py-2">
        <p className="text-center font-sans text-[12px] font-medium tracking-[0.06em] sm:text-[13px]">
          Free shipping across India
          <span aria-hidden="true" className="mx-2.5 inline-block h-1 w-1 translate-y-[-2px] rotate-45 bg-[hsl(var(--brand-gold))]" />
          Hand-painted in Srikalahasti
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/75 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))]"
          aria-label="Close announcement bar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
