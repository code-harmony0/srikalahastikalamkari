"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const announcements = [
  "Free Shipping across India",
  "100% Handcrafted Authentic Kalamkari • Direct From Srikalahasti",
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  return (
    <div className="relative bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] px-4 py-2 text-xs transition-all duration-300 z-50">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="hidden sm:inline-flex p-0.5 rounded text-[hsl(var(--brand-cream)/0.6)] hover:text-[hsl(var(--brand-gold))] transition-colors"
          aria-label="Previous announcement"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Center message */}
        <div className="flex-1 text-center overflow-hidden py-0.5">
          <p
            key={currentIndex}
            className="font-medium tracking-wide uppercase text-[11px] sm:text-xs animate-fadeIn"
          >
            {announcements[currentIndex]}
          </p>
        </div>

        {/* Right Arrow & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNext}
            className="hidden sm:inline-flex p-0.5 rounded text-[hsl(var(--brand-cream)/0.6)] hover:text-[hsl(var(--brand-gold))] transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-0.5 rounded text-[hsl(var(--brand-cream)/0.6)] hover:text-[hsl(var(--brand-cream))] transition-colors ml-1"
            aria-label="Close announcement bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
