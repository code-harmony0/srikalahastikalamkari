"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/shared/utils"

interface PageHeroProps {
  icon?: LucideIcon
  title: string
  subtitle?: string
  className?: string
}

export function PageHero({
  icon: Icon,
  title,
  subtitle,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative h-[200px] md:h-[240px] w-full flex flex-col items-center justify-center text-center px-6 overflow-hidden",
        "bg-[#1A1512]", // Deep Charcoal/Espresso Background
        "border-b border-[#C19A5B]/20",
        className,
      )}
    >
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(#C19A5B 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Subtle Glow Center */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-3xl mx-auto"
      >
        {/* Icon */}
        {Icon && (
          <div className="mb-4 p-3 rounded-full bg-[#FAFAF8]/10 border border-[#FAFAF8]/20 backdrop-blur-sm shadow-sm">
            <Icon className="w-6 h-6 text-[#C19A5B]" strokeWidth={1.5} />
          </div>
        )}

        {/* Title */}
        <h1 className="font-playfair text-3xl md:text-[40px] font-bold text-[#FAFAF8] tracking-wide leading-tight mb-3 drop-shadow-sm">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-inter text-[#FAFAF8]/80 text-sm md:text-[16px] font-light tracking-wide leading-relaxed max-w-xl">
            {subtitle}
          </p>
        )}

        {/* Divider Animation */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 0.8 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-[2px] bg-gradient-to-r from-transparent via-[#C19A5B] to-transparent mt-6 rounded-full"
        />
      </motion.div>
    </section>
  )
}
