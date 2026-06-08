"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion"
import { productsService } from "@/services/products"
import { promotionsService } from "@/services/promotions"
import { Product, Promotion } from "@/shared/types"
import { useIsMobile } from "@/shared/hooks/useIsMobile"
import Image from "next/image"
import { Button } from "@/shared/ui/button"
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Star,
  Heart,
  Award,
  Users,
  Palette,
  Scissors,
  CheckCircle2,
  Truck,
  Shield,
  Gem,
  Clock,
  Droplets,
  Paintbrush,
  Waves,
  Crown,
} from "lucide-react"
import {
  KanjeevaramPattern,
  DiagonalKalamkariPattern,
} from "@/shared/ui/decorative-pattern"
import { ProductCard } from "@/features/products/ProductCard"
import {
  CuratedProductCard,
  CuratedProductCardSkeleton,
} from "@/features/products/CuratedProductCard"

type AnimatedElementProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  className,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: delay / 1000, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Count-up animation component for numbers
const CountUpNumber = ({
  end,
  duration = 2000,
  className = "",
  suffix = "",
  prefix = "",
}: {
  end: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const startValue = 0

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(
        easeOutQuart * (end - startValue) + startValue,
      )

      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, isInView])

  return (
    <div ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </div>
  )
}

// Premium decorative pattern component for sophisticated heritage branding
const DecorativePattern = ({
  className = "",
  animated = false,
}: {
  className?: string
  animated?: boolean
}) => <KanjeevaramPattern className={className} opacity="opacity-5" />

// Kalamkari Hero Background - Diagonal flowing paisley pattern with fabric depth
const KalamkariHeroBackground = ({
  className = "",
  animated = false,
}: {
  className?: string
  animated?: boolean
}) => (
  <DiagonalKalamkariPattern
    className={className}
    opacity="opacity-10"
    animated={animated}
  />
)

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 27, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; days-- }
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
    <div className="flex gap-3">
      {blocks.map((block, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center countdown-pulse">
            <span className="font-serif text-2xl md:text-3xl font-bold text-white">
              {String(block.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] mt-2">{block.label}</span>
        </div>
      ))}
    </div>
  )
}

// Gold floating particles for hero
const GoldParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="gold-particle"
        style={{
          left: `${8 + Math.random() * 84}%`,
          animationDuration: `${8 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 8}s`,
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
          opacity: 0.3 + Math.random() * 0.4,
        }}
      />
    ))}
  </div>
)

// Category data
const categories = [
  { name: "Sarees", image: "/images/hero/kalamkari_saree_one.png", count: "50+" },
  { name: "Dupattas", image: "/images/hero/kalamkari_saree_two.png", count: "30+" },
  { name: "Dress Materials", image: "/images/hero/kalamkari_saree_three.png", count: "40+" },
  { name: "Wall Art", image: "/images/hero/kalamkari_saree_four.png", count: "25+" },
  { name: "Canvas Art", image: "/images/hero/kalamkari_saree_three.png", count: "20+" },
]

// Process steps
const processSteps = [
  { icon: Waves, title: "Fabric Selection", desc: "Finest cotton and silk sourced from traditional weavers" },
  { icon: Droplets, title: "Natural Dye Prep", desc: "Organic dyes extracted from plants, bark, and minerals" },
  { icon: Paintbrush, title: "Hand Painting", desc: "Master artisans paint each motif with bamboo pens" },
  { icon: Gem, title: "Washing & Setting", desc: "Multiple washes to fix colors permanently into fabric" },
  { icon: Crown, title: "Final Masterpiece", desc: "Quality inspected and ready for your collection" },
]



export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [textColor] = useState("text-white") // Fixed to white for maximum clarity
  const galleryScrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  const isMobile = useIsMobile()

  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const _heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const _heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const _heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  // Mobile: static values — same visual result but no scroll listener overhead
  const heroY = isMobile ? "0%" : _heroY
  const heroOpacity = isMobile ? 1 : _heroOpacity
  const heroScale = isMobile ? 1 : _heroScale

  const { scrollYProgress: galleryScrollProgress } = useScroll()
  const galleryBgY = useTransform(galleryScrollProgress, [0, 1], [0, -150])
  

  // Parallax for gallery background pattern — must be at component level (Rules of Hooks)
  const { scrollYProgress: pageScrollY } = useScroll()
  const galleryPatternY = useTransform(pageScrollY, [0, 1], [0, -150])

  // High-quality REAL Kalamkari saree fabric photographs with handcrafted patterns (LOCAL)
  const heroBackgroundImages = [
    {
      src: "/images/hero/kalamkari_saree_one.png",
      alt: "Elegant Kalamkari silk saree featuring hand-painted peacock and floral motifs in organic dyes",
      brightness: "medium",
    },
    {
      src: "/images/hero/kalamkari_saree_two.png",
      alt: "Traditional Srikalahasti Kalamkari saree fabric with intricate tree of life design",
      brightness: "medium",
    },
    {
      src: "/images/hero/kalamkari_saree_three.png",
      alt: "Handcrafted maroon and gold cotton silk Kalamkari saree with traditional deity motifs",
      brightness: "medium",
    },
    {
      src: "/images/hero/kalamkari_saree_four.png",
      alt: "Model wearing beautiful blue Kalamkari saree with elaborate borders and traditional hand paintings",
      brightness: "medium",
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featured, activePromotions] = await Promise.all([
          productsService.getFeaturedEfficient(6),
          promotionsService.getActive(),
        ])

        setFeaturedProducts(featured)
        setPromotions(activePromotions.slice(0, 2))
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Slow fade between images every 4-6 seconds as requested
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % heroBackgroundImages.length,
      )
    }, 4500) // 4.5 seconds - within 4-6s range for optimal viewing

    return () => clearInterval(interval)
  }, [heroBackgroundImages.length])

  // Hero entrance: orchestrated via variants (no imperative controls needed)

  // Auto-scroll gallery — RAF-based, pauses when hidden, respects user interaction
  useEffect(() => {
    const scrollContainer = galleryScrollRef.current
    if (!scrollContainer) return

    let scrollPosition = 0
    let lastInteractionTime = Date.now()
    let rafId: number

    const autoScroll = () => {
      if (scrollContainer) {
        const timeSinceInteraction = Date.now() - lastInteractionTime
        if (timeSinceInteraction > 5000) {
          const maxScroll =
            scrollContainer.scrollWidth - scrollContainer.clientWidth
          scrollPosition += 1.5
          if (scrollPosition >= maxScroll) {
            scrollPosition = 0
          }
          scrollContainer.scrollLeft = scrollPosition
        }
      }
      rafId = requestAnimationFrame(autoScroll)
    }

    const handleUserInteraction = () => {
      lastInteractionTime = Date.now()
      scrollPosition = scrollContainer.scrollLeft
    }

    scrollContainer.addEventListener("wheel", handleUserInteraction, { passive: true })
    scrollContainer.addEventListener("touchstart", handleUserInteraction, { passive: true })
    scrollContainer.addEventListener("mousedown", handleUserInteraction)

    rafId = requestAnimationFrame(autoScroll)

    return () => {
      cancelAnimationFrame(rafId)
      scrollContainer.removeEventListener("wheel", handleUserInteraction)
      scrollContainer.removeEventListener("touchstart", handleUserInteraction)
      scrollContainer.removeEventListener("mousedown", handleUserInteraction)
    }
  }, [])

  const whyChooseUsItems = [
    {
      icon: Award,
      title: "Authentic Craftsmanship",
      description:
        "Each saree is hand-painted by skilled artisans using traditional Srikalahasti Kalamkari techniques passed through generations.",
      highlight: "500+ Years of Heritage",
    },
    {
      icon: Palette,
      title: "Premium Natural Materials",
      description:
        "We use only the finest natural fabrics like pure silk and organic cotton, with eco-friendly natural dyes.",
      highlight: "100% Natural & Sustainable",
    },
    {
      icon: Users,
      title: "Artisan Empowerment",
      description:
        "Your purchase directly supports artisan families, helping preserve cultural heritage and traditional livelihoods.",
      highlight: "200+ Artisan Families Supported",
    },
  ]

  const galleryImages = [
    {
      src: "/images/gallery/gallery-1.jpg",
      alt: "Artisan hands painting intricate Kalamkari motifs with natural pigments in traditional copper bowls",
      category: "Craft Process",
      tone: "Warm",
    },
    {
      src: "/images/gallery/gallery-2.jpg",
      alt: "Close-up of dark navy Kalamkari silk saree featuring colourful deity and bird motifs",
      category: "Hero Textile",
      tone: "Rich",
    },
    {
      src: "/images/gallery/gallery-3.jpg",
      alt: "Elderly master artisan painting fine Kalamkari artwork with a bamboo pen in his Srikalahasti studio",
      category: "Heritage",
      tone: "Artisan",
    },
    {
      src: "/images/gallery/gallery-4.jpg",
      alt: "Pink Kalamkari fabric scroll depicting Lord Vishnu and Krishna in traditional hand-painted style",
      category: "Cultural Detail",
      tone: "Vibrant",
    },
    {
      src: "/images/gallery/gallery-5.jpg",
      alt: "Two artisans collaborating to paint Kalamkari patterns on stretched fabric over a wooden loom",
      category: "Craft Process",
      tone: "Warm",
    },
    {
      src: "/images/gallery/gallery-6.jpg",
      alt: "Woman artisan seated on the floor hand-painting a large Kalamkari piece with traditional ink",
      category: "Heritage",
      tone: "Earthy",
    },
  ]

  return (
    <>
      <main className="w-full kalamkari-static-background silk-fabric-texture text-foreground overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PREMIUM HERO SECTION — Cinematic Full-Bleed with Luxury FX  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative w-full h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#1A1512]"
          role="banner"
          aria-label="Srikalahasti Kalamkari - Premium Heritage Collection"
        >
          {/* ── Background: Parallax wrapper + AnimatePresence crossfade ── */}
          <motion.div
            style={{ y: heroY, scale: heroScale }}
            className="absolute inset-0 w-full h-[120%] z-0"
          >
            <AnimatePresence mode="sync">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] }}
                className="absolute inset-0"
              >
                <Image
                  src={heroBackgroundImages[currentImageIndex].src}
                  alt={heroBackgroundImages[currentImageIndex].alt}
                  fill
                  className="object-cover object-top"
                  priority={currentImageIndex === 0}
                  sizes="100vw"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Dark Premium Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[1]" />
          
          {/* Fabric Grain Texture */}
          <div
            className="absolute inset-0 opacity-[0.08] mix-blend-overlay z-[2]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Gold floating particles */}
          <GoldParticles />

          {/* Centered Content Narrative with animations */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center justify-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
              className="flex flex-col items-center text-center"
            >
              {/* Est. Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)",
                    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="flex items-center gap-4 mb-8"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 1 }}
                  className="w-12 h-px bg-[#C19A5B]/60"
                />
                <span className="text-[10px] font-bold text-[#C19A5B] uppercase tracking-[0.5em]">
                  Est. 1999 · Heritage Artisans
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                  className="w-12 h-px bg-[#C19A5B]/60"
                />
              </motion.div>

              {/* Main Heading */}
              <h1 className="font-heading leading-[0.85] text-white mb-6 tracking-tighter drop-shadow-xl">
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 30, filter: "blur(14px)" },
                    visible: { opacity: 0.9, y: 0, filter: "blur(0px)",
                      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="block font-serif italic text-[#C19A5B] text-3xl md:text-4xl lg:text-5xl mb-4 tracking-[0.2em]"
                >
                  Srikalahasti
                </motion.span>
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 50, filter: "blur(18px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)",
                      transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="block font-serif font-bold uppercase tracking-tight text-6xl md:text-8xl lg:text-[120px]"
                >
                  Kalamkari
                </motion.span>
              </h1>

              {/* Decorative divider */}
              <motion.div
                variants={{
                  hidden: { scaleX: 0, opacity: 0 },
                  visible: { scaleX: 1, opacity: 1,
                    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="w-20 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/60 to-transparent mb-8"
              />

              {/* Subheadline */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)",
                    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="font-sans text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
              >
                Where every thread tells a timeless story. Authentic hand-painted
                heritage directly from the master artisans of Andhra Pradesh.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0,
                    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg mx-auto mb-12"
              >
                <Link href="/products" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button className="w-full sm:w-[220px] h-14 rounded-none bg-white text-[#1A1512] hover:bg-[#C19A5B] hover:text-white text-[13px] font-bold tracking-[0.15em] uppercase transition-colors duration-400 cta-glow">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Shop Collection
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="outline"
                      className="w-full sm:w-[220px] h-14 rounded-none border-[#C19A5B]/50 text-white hover:bg-[#C19A5B]/15 hover:border-[#C19A5B] text-[13px] font-bold tracking-[0.15em] uppercase transition-all duration-400 bg-transparent backdrop-blur-sm"
                    >
                      Discover Our Story
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.1 } },
                }}
                className="flex flex-wrap justify-center gap-6 md:gap-10"
              >
                {[
                  { icon: Truck, text: "Free Shipping" },
                  { icon: Shield, text: "Authenticity Certified" },
                  { icon: Award, text: "Handcrafted Heritage" },
                  { icon: Heart, text: "Artisan Empowerment" },
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0,
                        transition: { duration: 0.5, ease: "easeOut" } },
                    }}
                    whileHover={{ scale: 1.08, color: "#C19A5B" }}
                    className="flex items-center gap-2 text-white/55 cursor-default"
                  >
                    <badge.icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{badge.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* ── Scroll Cue — mouse icon with animated scroll wheel ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 1, ease: "easeOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="font-sans text-[9px] font-bold tracking-[0.4em] text-white/40 uppercase mb-1">
              Scroll
            </span>
            {/* Mouse shell */}
            <div className="w-[22px] h-[34px] rounded-full border border-[#C19A5B]/40 flex items-start justify-center pt-[5px]">
              {/* Scroll wheel dot */}
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-[3px] h-[6px] rounded-full bg-[#C19A5B]/70"
              />
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SHOP BY CATEGORY — Visual Category Navigator                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="w-full py-12 md:py-16 relative overflow-hidden bg-transparent">
          <div className="max-w-[1300px] mx-auto px-6 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-14"
            >
              <div className="flex items-center justify-center gap-3 mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-px bg-[#C19A5B]/50"
                />
                <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#C19A5B]">
                  Browse Collections
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-px bg-[#C19A5B]/50"
                />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#1A1512] mb-4 leading-tight">
                Shop by <span className="italic text-[#C19A5B]">Category</span>
              </h2>
              <p className="font-sans text-base text-[#1A1512]/60 max-w-xl mx-auto leading-relaxed font-light">
                Explore our curated collections, each piece handcrafted with centuries of tradition
              </p>
            </motion.div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link href={`/products?category=${cat.name.toLowerCase().replace(/ /g, '-')}`}>
                    <div className="group relative aspect-[3/4] rounded-xl overflow-hidden category-card-hover cursor-pointer">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />
                      
                      {/* Gold border on hover */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#C19A5B]/40 rounded-xl transition-all duration-500" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-serif text-lg md:text-xl font-bold text-white mb-1 group-hover:text-[#C19A5B] transition-colors duration-300">
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                            {cat.count} Items
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-[#C19A5B] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                      
                      {/* Shimmer badge */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[9px] font-bold text-[#C19A5B] uppercase tracking-widest bg-white/90 px-2 py-1 rounded-full">
                          Explore
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Masterpieces of Heritage - Curated Editorial Layout */}
        <section className="relative w-full pt-6 pb-14 md:pt-8 md:pb-18 overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            {/* Header Block - Editorial, balanced */}
            <div className="text-center mb-16 md:mb-20">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[#C19A5B]">
                  Curated Collection
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-[#1A1512] mt-4 mb-4 leading-tight">
                  Masterpieces of <span className="italic">Heritage</span>
                </h2>
                <div className="w-12 h-px bg-[#1A1512]/20 mx-auto mt-6"></div>
              </motion.div>
            </div>

            {/* Product Grid - 3-col with more breathing room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 justify-items-center">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <CuratedProductCardSkeleton key={i} />
                  ))
                : featuredProducts
                    .slice(0, 6)
                    .map((product, i) => (
                      <CuratedProductCard
                        key={product.id}
                        product={product}
                        index={i}
                      />
                    ))}
            </div>

            {/* CTA Block - Refined */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mt-16"
            >
              <Link href="/products">
                <button className="inline-flex items-center gap-3 px-8 py-4 text-[13px] font-bold tracking-[0.1em] uppercase text-[#1A1512] border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white transition-all duration-300">
                  View Full Gallery
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* The Soul of the Artisan Section - Refined Polish (Section 3) */}
        <section className="w-full py-14 md:py-20 relative overflow-hidden bg-white/40 backdrop-blur-[2px] border-y border-[#C19A5B]/10">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Image Block - Editorial Framing */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                className="order-2 lg:order-1 relative"
              >
                <div className="relative aspect-[3/4] overflow-hidden shadow-xl">
                  <Image
                    src="/images/products/artisan.png"
                    alt="Master artisan carefully painting traditional Kalamkari designs"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />
                  {/* Subtle vignette for premium feel */}
                  <div className="absolute inset-0 border border-[#1A1512]/10 mix-blend-overlay"></div>
                </div>

                {/* Stat Card: Minimalist Floating */}
                <motion.div
                  className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md p-8 shadow-lg border border-[#C19A5B]/15"
                >
                  <CountUpNumber
                    end={500}
                    duration={2000}
                    className="text-4xl font-serif text-[#1A1512] mb-2 leading-none"
                    suffix="+"
                  />
                  <div className="text-[10px] font-sans font-bold text-[#C19A5B] tracking-[0.2em] uppercase">
                    Years of Heritage
                  </div>
                </motion.div>
              </motion.div>

              {/* Text Block - Editorial Layout */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                {/* Tag */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-12 h-px bg-[#C19A5B]"></span>
                  <span className="font-sans text-[10px] font-bold text-[#C19A5B] uppercase tracking-[0.25em]">
                    Our Heritage
                  </span>
                </div>

                {/* Heading */}
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1512] mb-8 leading-[1.1] tracking-tight">
                  The Soul of the <br />
                  <span className="italic text-[#C19A5B]">Artisan</span>
                </h2>

                {/* Content */}
                <div className="space-y-6 mb-12 max-w-xl">
                  <p className="font-sans text-base text-[#1A1512]/70 leading-relaxed font-light">
                    Srikalahasti Kalamkari is more than an art form; it is a
                    living narrative whispered through generations. Specializing
                    in authentic hand-painted textiles, from elegant Sarees and
                    Duppatas to exquisite Wall Paintings and Canvas art.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {["Sarees", "Duppatas", "Dress Materials", "Wall Art"].map((item) => (
                      <span
                        key={item}
                        className="text-[11px] font-bold text-[#1A1512]/60 uppercase tracking-widest border-b border-[#1A1512]/20 pb-1"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link href="/about">
                    <Button className="w-full sm:w-auto h-[52px] px-8 rounded-none bg-[#1A1512] text-white hover:bg-[#1A1512]/90 transition-all text-[12px] font-bold tracking-[0.15em] uppercase">
                      Discover the Craft
                    </Button>
                  </Link>
                  
                  {/* Whatsapp CTA directly here */}
                  <a
                    href="https://wa.me/917288848881?text=Hello%2C%20I%20would%20love%20to%20create%20a%20custom%20handcrafted%20saree"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 px-8 h-[52px] border border-[#1A1512]/20 hover:border-[#1A1512] text-[#1A1512] text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-300"
                  >
                    <Palette className="w-4 h-4 text-[#C19A5B] group-hover:scale-110 transition-transform" />
                    Bespoke Design
                  </a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Faint Watermark (Bottom Right) */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-[0.03] pointer-events-none rotate-12 text-[#1A1512]">
            <svg
              viewBox="0 0 200 200"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M100 0C100 0 130 50 180 80C130 90 100 130 100 200C100 130 70 90 20 80C70 50 100 0 100 0Z" />
              <circle cx="100" cy="100" r="10" />
            </svg>
          </div>
        </section>

        {/* Seasonal Offerings Section - Modern Tactile Cards with Editorial Feel */}
        {promotions.length > 0 && (
          <section className="w-full pt-10 pb-16 md:pb-22 relative overflow-hidden">
            <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 mb-12">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#E5B97C]/50 to-transparent" />
            </div>

            <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              {/* Editorial Header with Luxury Typography */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <div className="flex items-center justify-center gap-6 mb-8">
                  <motion.div
                    className="w-24 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                  <span className="font-paragraph text-sm font-bold text-accent-color uppercase tracking-[0.3em] relative">
                    Limited Time
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent-color/30"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      viewport={{ once: true }}
                    />
                  </span>
                  <motion.div
                    className="w-24 h-px bg-gradient-to-r from-transparent via-accent-color to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    viewport={{ once: true }}
                  />
                </div>

                <motion.h2
                  className="font-heading text-5xl md:text-6xl lg:text-7xl text-foreground mb-8 leading-[0.9] tracking-tight font-light"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Seasonal
                  <span className="block text-primary font-normal italic">
                    Offerings
                  </span>
                </motion.h2>

                <motion.p
                  className="font-paragraph text-xl md:text-2xl text-foreground/75 max-w-4xl mx-auto leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  Discover our curated seasonal collections featuring exclusive
                  designs and limited-edition pieces that celebrate the artistry
                  of each season.
                </motion.p>
              </motion.div>

              {/* Modern Tactile Cards with Editorial Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {promotions[0] && (
                  <motion.article
                    initial={{ opacity: 0, x: -60, scale: 0.9 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      duration: 1.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    {/* Tactile Card Container */}
                    <motion.div
                      whileHover={{ y: -8, scale: 1.015 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="relative overflow-hidden rounded-[2rem] shadow-2xl bg-white/95 backdrop-blur-md border border-white/60"
                    >
                      {/* Kalamkari Motif Overlay on Card */}
                      <div
                        className="absolute inset-0 opacity-2 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23A0522D' fill-opacity='0.04'%3E%3Cpath d='M40 20c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3Cpath d='M40 30c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Image Container with Parallax */}
                      <div className="relative h-[480px] md:h-[520px] overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="w-full h-full"
                        >
                          <Image
                            src={
                              promotions[0].bannerImage ||
                              "/images/promotions/promo-1.png"
                            }
                            alt={promotions[0].title || "Seasonal Promotion"}
                            className="w-full h-full object-cover"
                            width={800}
                            height={520}
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </motion.div>

                        {/* Sophisticated Hover Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 0.9 }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* Editorial Content Overlay */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1, delay: 0.3 }}
                          viewport={{ once: true }}
                          className="absolute bottom-0 left-0 right-0 p-10 md:p-12 text-white"
                        >
                          <motion.h3
                            className="font-heading text-4xl md:text-5xl mb-6 font-light text-white leading-tight tracking-tight"
                            whileHover={{ scale: 1.02, x: 4 }}
                            transition={{ duration: 0.3 }}
                          >
                            {promotions[0].title}
                          </motion.h3>

                          <p className="font-paragraph text-lg md:text-xl mb-8 text-white/95 leading-relaxed max-w-lg font-light">
                            {promotions[0].description}
                          </p>

                          {/* Editorial CTA */}
                          <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Button
                              size="lg"
                              className="h-14 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-medium group transition-all duration-500 shadow-xl hover:shadow-2xl border-0 tracking-wide"
                              asChild
                            >
                              <a href={promotions[0].callToActionUrl}>
                                Shop Collection
                                <motion.span
                                  className="inline-block ml-3"
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <ArrowRight className="h-6 w-6" />
                                </motion.span>
                              </a>
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.article>
                )}

                {promotions[1] && (
                  <motion.article
                    initial={{ opacity: 0, x: 60, scale: 0.9 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      duration: 1.2,
                      delay: 0.2,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    {/* Tactile Card Container */}
                    <motion.div
                      whileHover={{ y: -8, scale: 1.015 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="relative overflow-hidden rounded-[2rem] shadow-2xl bg-white/95 backdrop-blur-md border border-white/60"
                    >
                      {/* Kalamkari Motif Overlay on Card */}
                      <div
                        className="absolute inset-0 opacity-2 pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='0.04'%3E%3Cpath d='M40 15c13.807 0 25 11.193 25 25s-11.193 25-25 25-25-11.193-25-25 11.193-25 25-25z'/%3E%3Cpath d='M40 25c8.284 0 15 6.716 15 15s-6.716 15-15 15-15-6.716-15-15 6.716-15 15-15z'/%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Image Container with Parallax */}
                      <div className="relative h-[480px] md:h-[520px] overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="w-full h-full"
                        >
                          <Image
                            src={
                              promotions[1].bannerImage ||
                              "/images/promotions/promo-2.png"
                            }
                            alt={promotions[1].title || "Special Offer"}
                            className="w-full h-full object-cover"
                            width={800}
                            height={520}
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </motion.div>

                        {/* Sophisticated Hover Overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                          initial={{ opacity: 0.7 }}
                          whileHover={{ opacity: 0.9 }}
                          transition={{ duration: 0.2 }}
                        />

                        {/* Editorial Content Overlay */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1, delay: 0.5 }}
                          viewport={{ once: true }}
                          className="absolute bottom-0 left-0 right-0 p-10 md:p-12 text-white"
                        >
                          <motion.h3
                            className="font-heading text-4xl md:text-5xl mb-6 font-light text-white leading-tight tracking-tight"
                            whileHover={{ scale: 1.02, x: 4 }}
                            transition={{ duration: 0.3 }}
                          >
                            {promotions[1].title}
                          </motion.h3>

                          <p className="font-paragraph text-lg md:text-xl mb-8 text-white/95 leading-relaxed max-w-lg font-light">
                            {promotions[1].description}
                          </p>

                          {/* Editorial CTA */}
                          <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Button
                              variant="outline"
                              size="lg"
                              className="h-14 px-10 text-lg rounded-2xl border-2 border-white/90 hover:bg-white/25 hover:border-white text-white font-medium transition-all duration-500 backdrop-blur-md bg-white/15 shadow-xl hover:shadow-2xl tracking-wide"
                              asChild
                            >
                              <a href={promotions[1].callToActionUrl}>
                                Explore Offers
                                <motion.span
                                  className="inline-block ml-3"
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <ArrowRight className="h-6 w-6" />
                                </motion.span>
                              </a>
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.article>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* EXCLUSIVE OFFERS — Full-Width Cinematic Banner with Countdown  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="w-full relative overflow-hidden bg-[#1A1512]">
          <div className="relative min-h-[500px] md:min-h-[550px] flex items-center">
            {/* Parallax BG Image */}
            <div className="absolute inset-0">
              <Image
                src="/images/hero/kalamkari_saree_three.png"
                alt="Exclusive Hand-painted Kalamkari Saree Collection"
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1512]/90 via-[#1A1512]/70 to-[#1A1512]/50" />
            </div>

            {/* Gold line accents */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/40 to-transparent"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C19A5B]/40 to-transparent"
            />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-24">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Content */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-[#C19A5B]/20 border border-[#C19A5B]/30 rounded-full px-4 py-1.5 mb-6"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C19A5B]" />
                    <span className="text-[11px] font-bold text-[#C19A5B] uppercase tracking-[0.2em]">
                      Limited Time Offer
                    </span>
                  </motion.div>

                  <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-[1.1]">
                    Heritage Season{" "}
                    <span className="italic text-[#C19A5B]">Sale</span>
                  </h2>

                  <p className="font-sans text-lg text-white/70 mb-8 max-w-lg leading-relaxed font-light">
                    Enjoy up to 30% off on selected handcrafted Kalamkari pieces.
                    Each artwork is a one-of-a-kind masterpiece.
                  </p>

                  {/* Discount badge */}
                  <motion.div
                    initial={{ rotate: -5, scale: 0 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C19A5B] to-[#A07840] px-6 py-3 rounded-lg mb-8"
                  >
                    <span className="font-serif text-3xl font-bold text-white">30%</span>
                    <div>
                      <span className="block text-[10px] font-bold text-white/80 uppercase tracking-widest">Off on</span>
                      <span className="block text-[12px] font-bold text-white uppercase tracking-wider">Select Pieces</span>
                    </div>
                  </motion.div>

                  <div className="flex gap-4 mt-2">
                    <Link href="/products">
                      <Button className="h-12 px-8 rounded-none bg-white text-[#1A1512] hover:bg-[#C19A5B] hover:text-white text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-500">
                        Shop Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Right: Countdown */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col items-center md:items-end"
                >
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.3em] mb-6">
                    Offer Ends In
                  </span>
                  <CountdownTimer />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* THE KALAMKARI PROCESS — Visual Storytelling Steps              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="w-full py-14 md:py-20 relative overflow-hidden bg-transparent">
          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-px bg-[#C19A5B]/50" />
                <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[#C19A5B]">
                  From Fabric to Art
                </span>
                <div className="w-10 h-px bg-[#C19A5B]/50" />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#1A1512] mb-4 leading-tight">
                The Kalamkari <span className="italic text-[#C19A5B]">Process</span>
              </h2>
              <p className="font-sans text-base text-[#1A1512]/60 max-w-2xl mx-auto leading-relaxed font-light">
                Every masterpiece passes through five meticulous stages of artisan craftsmanship,
                each step guided by centuries of inherited wisdom.
              </p>
            </motion.div>

            {/* Process Steps */}
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-px z-0">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="w-full h-full bg-gradient-to-r from-[#C19A5B]/10 via-[#C19A5B]/30 to-[#C19A5B]/10 origin-left"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
                {processSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="flex flex-col items-center text-center group"
                  >
                    {/* Step Number Circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative w-20 h-20 mb-6"
                    >
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-[#C19A5B]/20 group-hover:border-[#C19A5B]/50 transition-colors duration-500" />
                      {/* Inner circle */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white to-neutral-200/40 group-hover:from-[#C19A5B]/10 group-hover:to-[#C19A5B]/20 transition-all duration-500 flex items-center justify-center shadow-sm">
                        <step.icon className="w-7 h-7 text-[#C19A5B] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Step number */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1A1512] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{i + 1}</span>
                      </div>
                    </motion.div>

                    <h3 className="font-serif text-lg font-bold text-[#1A1512] mb-2 group-hover:text-[#C19A5B] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[13px] text-[#1A1512]/60 leading-relaxed max-w-[200px]">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise Section - Precision Polish 2026 */}
        <section className="w-full py-10 md:py-12 relative overflow-hidden bg-gradient-to-b from-white/50 to-transparent">
          {/* Faint Kalamkari Motif Background */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 20c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' stroke='%23C19A5B' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />

          <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
            {/* Compact Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-px bg-[#C19A5B]" />
                <span className="font-sans text-[10px] font-bold text-[#C19A5B] uppercase tracking-[0.2em]">
                  Our Promise
                </span>
                <div className="w-12 h-px bg-[#C19A5B]" />
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-[#1A1512] mb-3 leading-tight">
                The Srikalahasti <span className="text-[#C19A5B] italic">Promise</span>
              </h2>

              <p className="font-sans text-base text-[#1A1512]/90 leading-relaxed max-w-2xl mx-auto">
                Authentic experiences steeped in tradition, quality, and
                heritage.
              </p>
            </motion.div>

            {/* Promise Cards - Precision Refined */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyChooseUsItems.map((item, index) => (
                <AnimatedElement key={index} delay={index * 100}>
                  <motion.article
                    whileHover={{ y: -4, rotate: -1 }}
                    className="group relative h-full"
                  >
                    {/* Gold Hover Glow */}
                    <div className="absolute -inset-1 bg-[#C19A5B]/0 group-hover:bg-[#C19A5B]/15 rounded-[16px] blur-lg transition-all duration-500" />

                    {/* Card with Darker Gradient */}
                    <div className="relative h-full bg-gradient-to-b from-white to-white/40 rounded-xl py-8 px-6 shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_28px_rgba(193,154,91,0.12)] transition-all duration-500 border border-[#C19A5B]/20 group-hover:border-[#C19A5B]/50 overflow-hidden">
                      {/* Icon - Smaller with Gold Gradient */}
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C19A5B] to-[#C19A5B]/80 shadow-md">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Title - Playfair Bold 20px */}
                      <h3 className="font-serif text-[20px] font-bold text-[#1A1512] mb-2 text-center leading-tight">
                        {item.title}
                      </h3>

                      {/* Description - Inter 15px */}
                      <p className="font-sans text-[15px] text-[#1A1512]/90 leading-[1.5] text-center mb-4">
                        {item.description}
                      </p>

                      {/* Badge - Inter SemiBold 13px */}
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1.5 bg-[#C19A5B]/8 rounded-full border border-[#C19A5B]/25 text-[13px] font-semibold text-[#C19A5B] group-hover:border-[#C19A5B]/50 transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-[#C19A5B]/40">
                          <Sparkles className="w-3 h-3 mr-1.5 text-[#C19A5B]" />
                          {item.highlight}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* VISUAL GALLERY - Organic Editorial Mosaic (2026 Crafted) */}
        <section className="w-full py-14 md:py-20 relative overflow-hidden bg-gradient-to-b from-white/60 to-transparent">
          {/* Parallax Background Pattern - 5% Gold Motif */}
          <motion.div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M70 10 L130 70 L70 130 L10 70 Z' fill='none' stroke='%23C8A874' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "280px 280px",
              y: isMobile ? 0 : galleryBgY,
            }}
          />

          {/* Advanced Luxury: Looping Gold Thread Animation */}
          {!isMobile && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1200 800"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M-50,200 C200,150 400,250 600,200 C800,150 1000,250 1250,200"
                fill="none"
                stroke="#C19A5B"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1],
                  opacity: [0, 1, 1, 0],
                  x: [0, 50, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M-50,600 C200,550 400,650 600,600 C800,550 1000,650 1250,600"
                fill="none"
                stroke="#C19A5B"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1],
                  opacity: [0, 1, 1, 0],
                  x: [0, -40, 0],
                }}
                transition={{
                  duration: 12,
                  delay: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>
          )}

          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            {/* Aligned Global Header Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} // Refined rise 20px
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }} // Global easing
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-px bg-[#C19A5B]/40" />
                <span className="font-sans text-[12px] font-bold text-[#C19A5B] uppercase tracking-[0.2em]">
                  VISUAL GALLERY
                </span>
                <div className="w-10 h-px bg-[#C19A5B]/40" />
              </div>

              <h2 className="font-serif text-4xl md:text-5xl text-[#3A2A1C] mb-5 leading-tight relative inline-block">
                Woven in <span className="text-[#A65329] italic">Elegance</span>
                {/* Gold Underline Animation */}
                <motion.div
                  className="absolute -bottom-2 left-0 h-px bg-[#C19A5B]/60"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                />
              </h2>

              <p className="font-sans text-base text-[#493A2F]/85 max-w-[680px] mx-auto leading-relaxed font-light">
                Explore the artistry and tradition of Srikalahasti Kalamkari
                through our curated visual journal.
              </p>
            </motion.div>

            {/* Organic Mosaic Grid - Fine-tuned Gaps: 20px H / 24px V */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-x-5 md:gap-y-6 auto-rows-[250px] md:auto-rows-[280px]">
              {galleryImages.map((image, index) => {
                let gridClasses = "md:col-span-1 md:row-span-1"
                if (index === 0) gridClasses = "md:col-span-2 md:row-span-1"
                if (index === 2) gridClasses = "md:col-span-1 md:row-span-2"
                if (index === 5) gridClasses = "md:col-span-2 md:row-span-1"

                return (
                  <AnimatedElement
                    key={index}
                    delay={index * 100} // Refined stagger 100ms
                    className={`${gridClasses} group relative`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.03 }} // Refined 1.03 scale
                      className="relative h-full w-full overflow-hidden rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white/50 backdrop-blur-sm transition-shadow duration-300 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Inner Shadow Simulation */}
                      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />

                      {/* Refined Soft Linear Gradient Overlay for Legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(35,22,10,0.55)] via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-75" />

                      {/* Refined Hover Overlay Tint */}
                      <div className="absolute inset-0 bg-[#C19A5B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-[#C19A5B]/20 rounded-[14px] pointer-events-none" />

                      <div className="absolute bottom-6 left-6 overflow-hidden">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.1 + 0.25,
                            duration: 0.4,
                          }} // Staggered label reveal
                        >
                          <span className="font-serif italic text-[18px] text-[#F9E8CF] block drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] group-hover:text-[#FFD58C] transition-colors duration-300">
                            {image.category}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatedElement>
                )
              })}
            </div>
          </div>
        </section>
        {/* VOICES OF HERITAGE — Community & Trust Redesign (KDLS 2026) */}
        <section className="w-full py-14 md:py-20 relative overflow-hidden bg-[#1A1512]/[0.015]">
          {/* Subtle Fabric Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url('/patterns/kalamkari-pattern.svg')`,
              backgroundSize: "120px 120px",
            }}
          />

          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16 md:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-[#C19A5B] block mb-4">
                  Authentic Voices
                </span>
                <h2 className="font-playfair text-4xl md:text-5xl text-[#1A1512] font-bold leading-tight mb-6">
                  Voices of <span className="italic text-[#C19A5B]">Heritage</span>
                </h2>
                <p className="font-sans text-[16px] text-[#1A1512]/70 max-w-2xl mx-auto leading-relaxed">
                  Real stories from those who carry our legacy forward, woven
                  through threads of trust and timeless craftsmanship.
                </p>
              </motion.div>
            </div>

            {/* Hero Testimonial - Full Width */}
            <div className="mb-16 md:mb-20">
              <AnimatedElement className="w-full" delay={100}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative p-10 md:p-14 bg-white rounded-[20px] shadow-[0_12px_40px_rgba(26,21,18,0.03)] border border-[#C19A5B]/20 overflow-hidden text-center max-w-5xl mx-auto"
                >
                  {/* Decorative Heritage Corner Frames */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-[#C19A5B]/30" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-[#C19A5B]/30" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 opacity-[0.03] pointer-events-none">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#C19A5B">
                      <path
                        d="M50 10 L80 90 L20 40 L80 40 L20 90 Z"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="text-[64px] font-playfair text-[#C19A5B] opacity-[0.15] leading-none mb-4 h-12">
                      ❝
                    </div>
                    <p className="font-playfair text-[20px] md:text-[24px] leading-[1.7] text-[#1A1512]/85 mb-10 italic max-w-3xl mx-auto">
                      "Each piece tells a story that transcends time. Truly a
                      masterpiece of Srikalahasti art, hand-painted with a soul
                      that connects me to the divine heritage. The colors are
                      even more vibrant than I imagined."
                    </p>

                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#C19A5B]/20">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
                            alt="Verified Customer"
                            width={52}
                            height={52}
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-[#C19A5B] fill-current" />
                        </div>
                      </div>
                      <div>
                        <p className="font-playfair text-[18px] font-bold text-[#C19A5B] leading-tight mb-1 uppercase tracking-wide">
                          Priya Sharma
                        </p>
                        <p className="font-sans text-[13px] text-[#1A1512]/60 italic font-medium">
                          Mumbai, Maharashtra
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatedElement>
            </div>

            {/* Community Grid - 2 Rows of 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  quote:
                    "Impeccable craftsmanship, it feels like wearing centuries of tradition.",
                  name: "Ananya Reddy",
                  city: "Hyderabad",
                },
                {
                  quote:
                    "The natural dyes and hand-painted motifs make every saree unique. Worth every rupee.",
                  name: "Lakshmi Iyer",
                  city: "Chennai",
                },
                {
                  quote:
                    "Gifted this to my mother and she was moved to tears. Unmatched quality.",
                  name: "Rajesh Kumar",
                  city: "Bangalore",
                },
                {
                  quote:
                    "A legacy I'm proud to pass down. The detail in the Kalamkari is simply sublime.",
                  name: "Meera Das",
                  city: "Kolkata",
                },
                {
                  quote:
                    "Fast delivery and exquisite packaging. The saree is a true art piece.",
                  name: "Sita Rao",
                  city: "Delhi",
                },
                {
                  quote:
                    "Authentic Srikalahasti work. So glad I found Srikalahasti Kalamkari.",
                  name: "Uma Pillai",
                  city: "Kochi",
                },
              ].map((item, idx) => (
                <AnimatedElement key={idx} delay={idx * 100}>
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow: "0 16px 40px rgba(193, 154, 91, 0.08)",
                    }}
                    className="group relative h-full p-8 md:p-10 bg-white rounded-[16px] border border-[#C19A5B]/20 flex flex-col justify-between transition-all duration-300 hover:bg-white/95 hover:border-[#C19A5B]/45 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                  >
                    {/* Decorative Heritage Corner Frames */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-[#C19A5B]/30 group-hover:border-[#C19A5B]/60 transition-all duration-300" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-[#C19A5B]/30 group-hover:border-[#C19A5B]/60 transition-all duration-300" />
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-[40px] font-playfair text-[#C19A5B] opacity-[0.2] leading-none h-6">
                          “
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-[#C19A5B] text-[#C19A5B]"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="font-sans text-[15px] leading-[1.7] text-[#1A1512]/80 italic">
                        {item.quote}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#C19A5B]/10">
                      <p className="font-sans text-[14px] font-bold text-[#C19A5B] uppercase tracking-wider mb-1">
                        {item.name}
                      </p>
                      <p className="font-sans text-[12px] text-[#1A1512]/50 font-medium">
                        {item.city}
                      </p>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>

            {/* Trust Anchors Footer */}
            <div className="mt-24 md:mt-32 border-t border-[#C19A5B]/20 pt-16 md:pt-20">
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
                {[
                  {
                    icon: Star,
                    value: "4.9/5",
                    label: "Customer Rating",
                    prefix: "⭐ ",
                  },
                  {
                    icon: Scissors,
                    value: "100%",
                    label: "Handcrafted",
                    prefix: "🪡 ",
                  },
                  {
                    icon: Users,
                    value: "10K+",
                    label: "Happy Customers",
                    prefix: "❤️ ",
                  },
                ].map((anchor, idx) => (
                  <AnimatedElement key={idx} delay={idx * 150}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-[#C19A5B]/20 hover:bg-white transition-all duration-300 min-w-[240px] justify-center group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{anchor.prefix}</span>
                          <span className="font-playfair text-[22px] font-bold text-[#1A1512]">
                            {anchor.value}
                          </span>
                        </div>
                        <span className="font-sans text-[12px] font-bold text-[#C19A5B] uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                          {anchor.label}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatedElement>
                ))}
              </div>
            </div>
          </div>
        </section>


      </main>
    </>
  )
}
