"use client";

import { Facebook, Youtube, PhoneCall } from "lucide-react";
import Link from "next/link";

/** New top bar mimicking the provided design with static text and social links */
export default function AnnouncementBar() {
  return (
    <div className="relative z-50 bg-[#0B1525] text-white">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between px-6 py-2.5 sm:flex-row text-[12px] sm:text-[13px] font-sans gap-2 sm:gap-0">
        
        {/* Left side text items */}
        <div className="flex items-center flex-wrap justify-center sm:justify-start">
          <span className="font-medium tracking-wide">Handcrafted with Heritage</span>
          <span className="mx-2.5 text-white/40">|</span>
          <span className="font-medium tracking-wide">Made in India</span>
          <span className="mx-2.5 text-white/40">|</span>
          <span className="flex items-center gap-1.5 font-medium tracking-wide">
            <span aria-label="truck">🚚</span> Free Shipping Across India
          </span>
        </div>

        {/* Right side social & contact */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/srikalahasti_kalamkari_offical" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110 focus:outline-none flex items-center group relative" aria-label="Follow us on Instagram">
              {/* Tooltip for Instagram follow */}
              <div className="absolute -top-7 right-0 whitespace-nowrap bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Follow us on Instagram
                <div className="absolute -bottom-1 right-2 w-2 h-2 bg-white rotate-45" />
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-grad)" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="url(#ig-grad)" />
              </svg>
            </a>
          </div>
          <span className="text-white/40 text-[10px]">|</span>
          <Link href="/contact" className="flex items-center gap-1.5 font-semibold transition-colors hover:text-[hsl(var(--brand-gold-soft))]">
            <PhoneCall className="h-3.5 w-3.5" />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
