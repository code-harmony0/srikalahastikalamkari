"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/shared/ui/button"
import { Sparkles } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { KanjeevaramPattern } from "@/shared/ui/decorative-pattern"

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          days--
        }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const blocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Mins" },
    { value: timeLeft.seconds, label: "Secs" },
  ]

  return (
    <div className="flex gap-3 md:gap-5 justify-center">
      {blocks.map((block, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(242,183,5,0.2)]">
            <span className="font-serif text-2xl md:text-3xl font-bold text-white">
              {String(block.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-[0.15em] mt-2 md:mt-3">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Gold floating particles
const GoldParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-[hsl(var(--brand-gold))] shadow-[0_0_8px_#F2B705]"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${8 + Math.random() * 12}s linear infinite`,
          animationDelay: `-${Math.random() * 8}s`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          opacity: 0.3 + Math.random() * 0.5,
        }}
      />
    ))}
  </div>
)

export default function ComingSoonPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const heroBackgroundImages = [
    {
      src: "/images/brand-models/model-saree-01.jpeg",
      alt: "Srikalahasti Kalamkari Saree",
    },
    {
      src: "/images/brand-models/model-saree-03.jpeg",
      alt: "Srikalahasti Kalamkari Heritage",
    },
    {
      src: "/images/brand-models/model-saree-12.jpeg",
      alt: "Srikalahasti Kalamkari Artwork",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % heroBackgroundImages.length,
      )
    }, 4500)
    return () => clearInterval(interval)
  }, [heroBackgroundImages.length])

  return (
    <main className="w-full h-screen overflow-hidden text-foreground relative flex flex-col justify-center items-center bg-[hsl(var(--brand-midnight))]">
      {/* Background Images */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroBackgroundImages[currentImageIndex].src}
              alt={heroBackgroundImages[currentImageIndex].alt}
              fill
              className="object-cover object-[center_35%]"
              priority={currentImageIndex === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-[1]" />
      
      {/* Texture */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Particles */}
      <GoldParticles />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo-transparent/full"
              alt="Srikalahasti Kalamkari Logo"
              width={200}
              height={220}
              className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              priority
            unoptimized />
          </div>

          {/* Heading */}
          <h1 className="font-serif font-bold uppercase text-white mb-4 tracking-wider text-4xl md:text-6xl drop-shadow-xl">
            Coming Soon
          </h1>
          
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-gold))] to-transparent mb-6" />

          {/* Subheading */}
          <p className="font-sans text-sm md:text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed font-light tracking-wide">
            We are weaving together something magnificent. Our exclusive collection of authentic, hand-painted Srikalahasti Kalamkari sarees and fabrics will be available shortly.
          </p>

          {/* Timer */}
          <div className="mb-12">
            <CountdownTimer />
          </div>

          {/* WhatsApp / Contact Button */}
          <a href="https://wa.me/917288848881?text=Hello%21%20Please%20notify%20me%20when%20the%20Srikalahasti%20Kalamkari%20website%20launches." target="_blank" rel="noreferrer">
            <Button className="h-12 md:h-14 px-8 rounded-none bg-[hsl(var(--brand-gold))] text-white hover:bg-white hover:text-[hsl(var(--brand-ink))] text-xs md:text-sm font-bold tracking-[0.15em] uppercase transition-colors duration-500 shadow-[0_0_20px_rgba(242,183,5,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              <FaWhatsapp className="w-4 h-4 mr-2" />
              Notify Me via WhatsApp
            </Button>
          </a>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(-40px) translateX(-10px); opacity: 0; }
        }
      `}</style>
    </main>
  )
}
