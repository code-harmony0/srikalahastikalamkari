"use client"

import React, { useEffect, useState, useRef, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/shared/utils"
import { useAllReviews, type Review } from "@/shared/hooks/use-reviews"
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
  MessageCircle,
  Quote,
  BadgeCheck,
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
  {
    name: "Sarees",
    filterName: "Sarees",
    image: "/images/brand-models/model-saree-01.jpeg",
    alt: "Hand-painted Srikalahasti Kalamkari Sarees",
    count: "50+",
  },
  {
    name: "Dupattas",
    filterName: "Duppatta",
    image: "/images/brand-models/model-saree-05.jpeg",
    alt: "Authentic Kalamkari Dupattas from Srikalahasti",
    count: "30+",
  },
  {
    name: "Dress Materials",
    filterName: "Fabrics",
    image: "/images/brand-models/model-saree-08.jpeg",
    alt: "Kalamkari Dress Materials and Fabrics",
    count: "40+",
  },
  {
    name: "Wall Art",
    filterName: "wall-paintings",
    image: "/images/wall-art/wall-art-04.jpeg",
    alt: "Traditional Srikalahasti Kalamkari Wall Art",
    count: "25+",
  },
]

// Process steps
const processSteps = [
  {
    icon: Waves,
    title: "Fabric Selection",
    desc: "Finest cotton and silk sourced from traditional weavers",
  },
  {
    icon: Droplets,
    title: "Natural Dye Prep",
    desc: "Organic dyes extracted from plants, bark, and minerals",
  },
  {
    icon: Paintbrush,
    title: "Hand Painting",
    desc: "Master artisans paint each motif with bamboo pens",
  },
  {
    icon: Gem,
    title: "Washing & Setting",
    desc: "Multiple washes to fix colors permanently into fabric",
  },
  {
    icon: Crown,
    title: "Final Masterpiece",
    desc: "Quality inspected and ready for your collection",
  },
]

const customDesignWhatsAppUrl =
  "https://wa.me/917288848881?text=Hello%2C%20I%20need%20help%20with%20a%20custom%20Srikalahasti%20Kalamkari%20design.%20Please%20share%20fabric%2C%20motif%2C%20price%20and%20timeline%20details."

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])

  // Approved 4-and-5 star reviews with real written content, newest first.
  const { reviews: allReviews } = useAllReviews()
  const homeReviews = useMemo(
    () =>
      (allReviews || [])
        .filter(
          (r: Review) =>
            r.is_approved &&
            r.rating >= 4 &&
            typeof r.content === "string" &&
            r.content.trim().length > 20,
        )
        .sort(
          (a: Review, b: Review) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 6),
    [allReviews],
  )

  const reviewStats = useMemo(() => {
    const approved = (allReviews || []).filter((r: Review) => r.is_approved)
    if (!approved.length) return null
    return {
      average:
        approved.reduce((sum: number, r: Review) => sum + r.rating, 0) /
        approved.length,
      count: approved.length,
    }
  }, [allReviews])

  // Sample quotes shown only while no approved review exists. Shaped like a
  // real review row so the rail has one rendering path. Initials, not stock
  // portraits: these are samples, not identified customers.
  const placeholderReviews = useMemo(
    () =>
      [
        ["Impeccable craftsmanship — it feels like wearing centuries of tradition.", "Ananya Reddy", "Hyderabad"],
        ["The natural dyes and hand-painted motifs make every saree unique. Worth every rupee.", "Lakshmi Iyer", "Chennai"],
        ["Gifted this to my mother and she was moved to tears. Unmatched quality.", "Rajesh Kumar", "Bangalore"],
        ["A legacy I'm proud to pass down. The detail in the Kalamkari is simply sublime.", "Meera Das", "Kolkata"],
        ["Fast delivery and exquisite packaging. The saree is a true art piece.", "Sita Rao", "Delhi"],
        ["Authentic Srikalahasti work. So glad I found Srikalahasti Kalamkari.", "Uma Pillai", "Kochi"],
      ].map(([content, customer_name, city], i) => ({
        id: `sample-${i}`,
        content,
        customer_name,
        city,
        rating: 5,
        is_verified_purchase: false,
      })),
    [],
  )

  const displayReviews = homeReviews.length ? homeReviews : placeholderReviews
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
  const _heroScale = useTransform(scrollYProgress, [0, 1], [1, 1])

  // Mobile: static values — same visual result but no scroll listener overhead
  const heroY = isMobile ? "0%" : _heroY
  const heroOpacity = isMobile ? 1 : _heroOpacity
  const heroScale = isMobile ? 1 : _heroScale

  const gallerySectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: galleryScrollProgress } = useScroll({
    target: gallerySectionRef,
    offset: ["start end", "end start"],
  })
  const galleryBgY = useTransform(galleryScrollProgress, [0, 1], [0, -80])

  // High-quality Kalamkari saree model photographs.
  const heroBackgroundImages = [
    {
      src: "/images/brand-models/model-saree-01.jpeg",
      alt: "Model wearing a purple Srikalahasti Kalamkari saree with narrative pallu artwork",
      brightness: "medium",
    },
    {
      src: "/images/brand-models/model-saree-03.jpeg",
      alt: "Model wearing a cream floral Kalamkari saree with hand-painted story border",
      brightness: "medium",
    },
    {
      src: "/images/brand-models/model-saree-12.jpeg",
      alt: "Model wearing a cream Srikalahasti Kalamkari saree with gold border and mythological hand-painted motifs",
      brightness: "medium",
    },
    {
      src: "/images/brand-models/model-saree-07.jpeg",
      alt: "Model wearing a blue Kalamkari saree with traditional painted motifs and woven border",
      brightness: "medium",
    },
    {
      src: "/images/brand-models/model-saree-10.jpeg",
      alt: "Model posing in a black and gold Kalamkari saree with dramatic hand-painted motifs",
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

    scrollContainer.addEventListener("wheel", handleUserInteraction, {
      passive: true,
    })
    scrollContainer.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    })
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
      src: "/images/wall-art/wall-art-01.jpeg",
      alt: "Hand-painted green Kalamkari wall art depicting a deity beneath a sacred tree",
      category: "Wall Art",
      tone: "Vibrant",
    },
    {
      src: "/images/wall-art/wall-art-02.jpeg",
      alt: "Kalamkari wall painting showing divine figures arranged around a central deity",
      category: "Temple Story",
      tone: "Rich",
    },
    {
      src: "/images/wall-art/wall-art-04.jpeg",
      alt: "Hand-painted Kalamkari horse procession wall artwork on natural fabric",
      category: "Horse Motif",
      tone: "Heritage",
    },
    {
      src: "/images/wall-art/wall-art-05.jpeg",
      alt: "Kalamkari wall art showing a seated woman beside a deer with ornamental border work",
      category: "Folk Story",
      tone: "Earthy",
    },
    {
      src: "/images/gallery/gallery-4.jpg",
      alt: "Traditional Kalamkari story scroll with hand-painted mythological figures",
      category: "Story Scroll",
      tone: "Vibrant",
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
          className="relative w-full min-h-[calc(86svh-56px)] pt-6 pb-24 sm:h-[100vh] sm:min-h-[700px] sm:py-0 flex items-center justify-center overflow-hidden bg-[hsl(var(--brand-ink))]"
          role="banner"
          aria-label="Srikalahasti Kalamkari - Premium Heritage Collection"
        >
          {/* ── Background: Parallax wrapper + AnimatePresence crossfade ── */}
          <motion.div
            style={{ y: heroY, scale: heroScale, willChange: "transform" }}
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
                  className="object-cover object-[center_42%]"
                  priority={currentImageIndex === 0}
                  loading={currentImageIndex === 0 ? undefined : "eager"}
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
          <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 text-center flex flex-col items-center justify-center">
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
              {/* Hero Logo */}
              <motion.div
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 18,
                    scale: 0.96,
                    filter: "blur(8px)",
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="mb-3 sm:mb-6 flex justify-center"
              >
                <Image
                  src="https://imagedelivery.net/xGnXvGVZkNr8ZNcbFxAROQ/srikalahasti-logo-transparent/full"
                  alt="Srikalahasti Kalamkari Logo"
                  width={300}
                  height={320}
                  priority
                  className="h-20 w-auto object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.55)] sm:h-40 md:h-48 lg:h-56"
                unoptimized />
              </motion.div>

              {/* Est. Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8 max-w-full"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ originX: 1 }}
                  className="hidden h-px w-8 bg-[hsl(var(--brand-gold)/0.6)] sm:block md:w-12"
                />

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 1.2,
                    delay: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ originX: 0 }}
                  className="hidden h-px w-8 bg-[hsl(var(--brand-gold)/0.6)] sm:block md:w-12"
                />
              </motion.div>

              {/* Main Heading */}
              <h1 className="font-heading w-full max-w-full sm:max-w-none leading-[0.95] sm:leading-[0.9] text-white mb-4 sm:mb-6 tracking-tight drop-shadow-xl">
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 50, filter: "blur(18px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 1.3, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="block whitespace-nowrap font-serif font-bold uppercase text-[clamp(1.35rem,6.2vw,2.45rem)] sm:text-5xl md:text-7xl lg:text-[88px]"
                >
                  Srikalahasti Kalamkari
                </motion.span>
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: {
                        duration: 1,
                        delay: 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      },
                    },
                  }}
                  className="mt-3 block font-sans text-[0.78rem] font-medium uppercase leading-snug tracking-[0.22em] text-[#F9E8CF]/90 sm:mt-5 sm:text-base md:text-xl"
                >
                  Hand-Painted Sarees & Fabrics
                </motion.span>
              </h1>

              {/* Decorative divider */}
              <motion.div
                variants={{
                  hidden: { scaleX: 0, opacity: 0 },
                  visible: {
                    scaleX: 1,
                    opacity: 1,
                    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-[hsl(var(--brand-gold)/0.6)] to-transparent mb-4 sm:mb-8"
              />

              {/* Subheadline */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="font-sans text-sm md:text-xl text-white/75 mb-6 sm:mb-10 max-w-[20rem] sm:max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
              >
                Where every thread tells a timeless story. Hand-painted 
                heritage directly from the master artisans of
                Andhra Pradesh.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center w-full max-w-[21rem] sm:max-w-lg mx-auto mb-5 sm:mb-12"
              >
                <Link href="/products" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button className="w-full sm:w-[220px] h-11 sm:h-14 rounded-none bg-white text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-gold))] hover:text-white text-[10px] sm:text-[13px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase transition-colors duration-400 cta-glow">
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Shop Collection
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full sm:w-[220px] h-11 sm:h-14 rounded-none border-[hsl(var(--brand-gold)/0.5)] text-white hover:bg-[hsl(var(--brand-gold)/0.15)] hover:border-[hsl(var(--brand-gold))] text-[10px] sm:text-[13px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase transition-all duration-400 bg-transparent backdrop-blur-sm"
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
                className="grid w-full max-w-none grid-cols-2 gap-x-2 gap-y-2.5 px-1 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 md:gap-10"
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
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: "easeOut" },
                      },
                    }}
                    whileHover={{ scale: 1.08, color: "hsl(var(--brand-gold))" }}
                    className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-2 text-white/55 cursor-default"
                  >
                    <badge.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="truncate text-[10px] font-bold uppercase tracking-[0.02em] sm:tracking-[0.15em]">
                      {badge.text}
                    </span>
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
            className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-2"
          >
            <span className="font-sans text-[10px] font-bold tracking-[0.3em] text-white/50 uppercase mb-1">
              Scroll
            </span>
            {/* Mouse shell */}
            <div className="w-[22px] h-[34px] rounded-full border border-[hsl(var(--brand-gold)/0.4)] flex items-start justify-center pt-[5px]">
              {/* Scroll wheel dot */}
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-[3px] h-[6px] rounded-full bg-[hsl(var(--brand-gold)/0.7)]"
              />
            </div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CUSTOM DESIGN CTA — Immediate WhatsApp Inquiry                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="relative w-full overflow-hidden bg-[#F7F6F3] border-y border-[hsl(var(--brand-gold)/0.25)]">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
            <DecorativePattern className="absolute inset-0 text-[hsl(var(--brand-ink))]" />
          </div>
          <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-8 md:py-10 relative z-10">
            <div className="grid lg:grid-cols-[1fr_auto] gap-7 lg:gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="flex flex-col md:flex-row md:items-center gap-5 md:gap-7"
              >
                <div className="w-14 h-14 shrink-0 rounded-full bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-gold))] flex items-center justify-center shadow-[0_14px_35px_rgba(26,21,18,0.16)]">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-px w-8 bg-[hsl(var(--brand-gold))]" />
                    <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--brand-gold-deep))]">
                      Custom Kalamkari Studio
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-[hsl(var(--brand-ink))] leading-tight">
                    Create your own saree, dupatta, or wall art design.
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-[hsl(var(--brand-ink)/0.68)] font-light">
                    Share your idea, size, fabric, colors, motif or reference.
                    Our artisans can adapt heritage stories or paint a fully
                    personal Kalamkari piece for you.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:items-stretch"
              >
                <a
                  href={customDesignWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 min-w-[210px] items-center justify-center gap-3 bg-[hsl(var(--brand-ink))] px-6 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[hsl(var(--brand-gold-deep))]"
                >
                  <MessageCircle className="w-4 h-4 text-[hsl(var(--brand-gold-deep))]" />
                  WhatsApp Message
                </a>
                <Link
                  href="/custom-design"
                  className="inline-flex h-12 min-w-[230px] items-center justify-center gap-3 border border-[hsl(var(--brand-ink)/0.2)] bg-white/55 px-6 text-[12px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--brand-ink))] transition-all duration-300 hover:border-[hsl(var(--brand-ink))] hover:bg-white"
                >
                  View Custom Designs
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--brand-gold-deep))]" />
                </Link>
              </motion.div>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[hsl(var(--brand-gold)/0.2)] pt-5">
              {[
                { icon: Scissors, text: "Sarees, dupattas and fabric panels" },
                { icon: Paintbrush, text: "Wall art and story motifs" },
                { icon: Clock, text: "Timeline shared before confirmation" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 text-[hsl(var(--brand-ink)/0.7)]"
                >
                  <item.icon className="w-4 h-4 text-[hsl(var(--brand-gold-deep))] shrink-0" />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em]">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
                  className="h-px bg-[hsl(var(--brand-gold)/0.5)]"
                />
                <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[hsl(var(--brand-gold-deep))]">
                  Browse Collections
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-px bg-[hsl(var(--brand-gold)/0.5)]"
                />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-[hsl(var(--brand-ink))] mb-4 leading-tight">
                Shop by <span className="text-[hsl(var(--brand-gold-deep))]">Category</span>
              </h2>
              <p className="font-sans text-base text-[hsl(var(--brand-ink)/0.6)] max-w-xl mx-auto leading-relaxed font-light">
                Explore our curated collections, each piece handcrafted with
                centuries of tradition
              </p>
            </motion.div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.filterName)}`}
                  >
                    <div className="group relative aspect-[3/4] rounded-xl overflow-hidden category-card-hover cursor-pointer">
                      <Image
                        src={cat.image}
                        alt={cat.alt}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 20vw"
                        loading="eager"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80" />

                      {/* Gold border on hover */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[hsl(var(--brand-gold)/0.4)] rounded-xl transition-all duration-500" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-serif text-lg md:text-xl font-bold text-white mb-1 group-hover:text-[hsl(var(--brand-gold))] transition-colors duration-300">
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                            {cat.count} Items
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-[hsl(var(--brand-gold))] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>

                      {/* Shimmer badge */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[11px] font-bold text-[hsl(var(--brand-gold-deep))] uppercase tracking-widest bg-white/90 px-2 py-1 rounded-full">
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
            <div className="text-center mb-8 md:mb-11">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <span className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase text-[hsl(var(--brand-gold-deep))]">
                  Curated Collection
                </span>
                <h2 className="font-serif text-4xl md:text-5xl text-[hsl(var(--brand-ink))] mt-4 mb-4 leading-tight">
                  Masterpieces of <span className="text-[hsl(var(--brand-gold-deep))]">Heritage</span>
                </h2>
                <div className="w-12 h-px bg-[hsl(var(--brand-ink)/0.2)] mx-auto mt-6"></div>
              </motion.div>
            </div>

            {/* Product Grid - 3-col with more breathing room */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:gap-x-6 md:gap-y-10">
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
                <button className="inline-flex items-center gap-3 px-8 py-4 text-[13px] font-bold tracking-[0.1em] uppercase text-[hsl(var(--brand-ink))] border border-[hsl(var(--brand-ink)/0.2)] hover:bg-[hsl(var(--brand-ink))] hover:text-white transition-all duration-300">
                  View Full Gallery
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* The Soul of the Artisan Section - Refined Polish (Section 3) */}
        <section className="w-full py-14 md:py-20 relative overflow-hidden bg-white/40 backdrop-blur-[2px] border-y border-[hsl(var(--brand-gold)/0.1)]">
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
                    src="/images/brand-models/model-saree-12.jpeg"
                    alt="Model wearing a cream Srikalahasti Kalamkari saree with gold border and mythological motifs"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />
                  {/* Subtle vignette for premium feel */}
                  <div className="absolute inset-0 border border-[hsl(var(--brand-ink)/0.1)] mix-blend-overlay"></div>
                </div>

                {/* Stat Card: Minimalist Floating */}
                <motion.div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md p-8 shadow-lg border border-[hsl(var(--brand-gold)/0.15)]">
                  <CountUpNumber
                    end={500}
                    duration={2000}
                    className="text-4xl font-serif text-[hsl(var(--brand-ink))] mb-2 leading-none"
                    suffix="+"
                  />
                  <div className="text-[10px] font-sans font-bold text-[hsl(var(--brand-gold-deep))] tracking-[0.2em] uppercase">
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
                  <span className="w-12 h-px bg-[hsl(var(--brand-gold))]"></span>
                  <span className="font-sans text-[10px] font-bold text-[hsl(var(--brand-gold-deep))] uppercase tracking-[0.25em]">
                    Our Heritage
                  </span>
                </div>

                {/* Heading */}
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[hsl(var(--brand-ink))] mb-8 leading-[1.1] tracking-tight">
                  The Soul of the <br />
                  <span className="text-[hsl(var(--brand-gold-deep))]">Artisan</span>
                </h2>

                {/* Content */}
                <div className="space-y-6 mb-12 max-w-xl">
                  <p className="font-sans text-base text-[hsl(var(--brand-ink)/0.7)] leading-relaxed font-light mb-4">
                    Srikalahasti Kalamkari is more than an art form; it is a
                    living narrative whispered through generations. Specializing
                    in authentic hand-painted textiles, from elegant Sarees and
                    Duppatas to exquisite Wall Paintings and Canvas art.
                  </p>
                  <p className="font-sans text-sm text-[hsl(var(--brand-ink)/0.6)] leading-relaxed font-light">
                    Also recognized worldwide as <strong>Shri Kalahasti Kalamkari</strong>, our artisans preserve the authentic pen Kalamkari technique, creating some of the finest Indian handloom sarees and fabrics available today.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {["Sarees", "Duppatas", "Dress Materials", "Wall Art"].map(
                      (item) => (
                        <span
                          key={item}
                          className="text-[11px] font-bold text-[hsl(var(--brand-ink)/0.6)] uppercase tracking-widest border-b border-[hsl(var(--brand-ink)/0.2)] pb-1"
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link href="/about">
                    <Button className="w-full sm:w-auto h-[52px] px-8 rounded-none bg-[hsl(var(--brand-ink))] text-white hover:bg-[hsl(var(--brand-ink)/0.9)] transition-all text-[12px] font-bold tracking-[0.15em] uppercase">
                      Discover the Craft
                    </Button>
                  </Link>

                  <Link
                    href="/custom-design"
                    className="group inline-flex items-center justify-center gap-3 px-8 h-[52px] border border-[hsl(var(--brand-ink)/0.2)] hover:border-[hsl(var(--brand-ink))] text-[hsl(var(--brand-ink))] text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-300"
                  >
                    <Palette className="w-4 h-4 text-[hsl(var(--brand-gold-deep))] group-hover:scale-110 transition-transform" />
                    Custom Designs
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Faint Watermark (Bottom Right) */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-[0.03] pointer-events-none rotate-12 text-[hsl(var(--brand-ink))]">
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



        {/* ═══════════════════════════════════════════════════════════════ */}


        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* THE KALAMKARI PROCESS — Visual Storytelling Steps              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="w-full py-16 md:py-24 relative overflow-hidden bg-white dark:bg-[#120905]">
          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16"
            >
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-px bg-[hsl(var(--brand-gold)/0.5)]" />
                <span className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-[hsl(var(--brand-gold-deep))]">
                  From Fabric to Art
                </span>
                <div className="w-10 h-px bg-[hsl(var(--brand-gold)/0.5)]" />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-[hsl(var(--brand-ink))] dark:text-[hsl(var(--brand-cream))] mb-4 leading-tight">
                The Kalamkari{" "}
                <span className="text-[hsl(var(--brand-gold-deep))]">Process</span>
              </h2>
              <p className="font-sans text-base text-[hsl(var(--brand-ink)/0.6)] dark:text-[hsl(var(--brand-cream)/0.7)] max-w-2xl mx-auto leading-relaxed font-light">
                Every masterpiece passes through five meticulous stages of
                artisan craftsmanship, each step guided by centuries of
                inherited wisdom.
              </p>
            </motion.div>

            {/* Process Steps */}
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px z-0">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="w-full h-full bg-gradient-to-r from-[hsl(var(--brand-gold)/0.1)] via-[hsl(var(--brand-gold)/0.3)] to-[hsl(var(--brand-gold)/0.1)] origin-left"
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
                      className="relative w-20 h-20 mb-4"
                    >
                      {/* Outer ring - solid background masks the connecting line behind it */}
                      <div className="absolute inset-0 rounded-full border-2 border-[hsl(var(--brand-gold)/0.2)] bg-white dark:bg-[#120905] group-hover:border-[hsl(var(--brand-gold)/0.5)] transition-colors duration-500" />
                      {/* Inner circle */}
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white to-neutral-200/40 group-hover:from-[hsl(var(--brand-gold)/0.1)] group-hover:to-[hsl(var(--brand-gold)/0.2)] transition-all duration-500 flex items-center justify-center shadow-sm">
                        <step.icon className="w-7 h-7 text-[hsl(var(--brand-gold-deep))] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Step number */}
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[hsl(var(--brand-ink))] dark:bg-[hsl(var(--brand-gold))] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white dark:text-[hsl(var(--brand-ink))]">
                          {i + 1}
                        </span>
                      </div>
                    </motion.div>

                    <h3 className="font-serif text-lg font-bold text-[hsl(var(--brand-ink))] dark:text-[hsl(var(--brand-cream))] mb-2 group-hover:text-[hsl(var(--brand-gold))] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="font-sans text-[13px] text-[hsl(var(--brand-ink)/0.6)] dark:text-[hsl(var(--brand-cream)/0.6)] leading-relaxed max-w-[200px]">
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
                <div className="w-12 h-px bg-[hsl(var(--brand-gold))]" />
                <span className="font-sans text-[10px] font-bold text-[hsl(var(--brand-gold-deep))] uppercase tracking-[0.2em]">
                  Our Promise
                </span>
                <div className="w-12 h-px bg-[hsl(var(--brand-gold))]" />
              </div>

              <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--brand-ink))] mb-3 leading-tight">
                The Srikalahasti{" "}
                <span className="text-[hsl(var(--brand-gold-deep))]">Promise</span>
              </h2>

              <p className="font-sans text-base text-[hsl(var(--brand-ink)/0.9)] leading-relaxed max-w-2xl mx-auto">
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
                    <div className="absolute -inset-1 bg-[hsl(var(--brand-gold)/0)] group-hover:bg-[hsl(var(--brand-gold)/0.15)] rounded-[16px] blur-lg transition-all duration-500" />

                    {/* Card with Darker Gradient */}
                    <div className="relative h-full bg-gradient-to-b from-white to-white/40 rounded-xl py-8 px-6 shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_28px_rgba(193,154,91,0.12)] transition-all duration-500 border border-[hsl(var(--brand-gold)/0.2)] group-hover:border-[hsl(var(--brand-gold)/0.5)] overflow-hidden">
                      {/* Icon - Smaller with Gold Gradient */}
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold)/0.8)] shadow-md">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Title - Playfair Bold 20px */}
                      <h3 className="font-serif text-[20px] font-bold text-[hsl(var(--brand-ink))] mb-2 text-center leading-tight">
                        {item.title}
                      </h3>

                      {/* Description - Inter 15px */}
                      <p className="font-sans text-[15px] text-[hsl(var(--brand-ink)/0.9)] leading-[1.5] text-center mb-4">
                        {item.description}
                      </p>

                      {/* Badge - Inter SemiBold 13px */}
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1.5 bg-[hsl(var(--brand-gold)/0.08)] rounded-full border border-[hsl(var(--brand-gold)/0.25)] text-[13px] font-semibold text-[hsl(var(--brand-gold-deep))] group-hover:border-[hsl(var(--brand-gold)/0.5)] transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-[hsl(var(--brand-gold)/0.4)]">
                          <Sparkles className="w-3 h-3 mr-1.5 text-[hsl(var(--brand-gold-deep))]" />
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
        <section ref={gallerySectionRef} className="w-full py-14 md:py-20 relative overflow-hidden bg-gradient-to-b from-white/60 to-transparent">
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
                  style={{ stroke: "hsl(var(--brand-gold))" }}
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
                  style={{ stroke: "hsl(var(--brand-gold))" }}
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
                <div className="w-10 h-px bg-[hsl(var(--brand-gold)/0.4)]" />
                <span className="font-sans text-[12px] font-bold text-[hsl(var(--brand-gold-deep))] uppercase tracking-[0.2em]">
                  VISUAL GALLERY
                </span>
                <div className="w-10 h-px bg-[hsl(var(--brand-gold)/0.4)]" />
              </div>

              <h2 className="font-serif text-4xl md:text-5xl text-[#3A2A1C] mb-5 leading-tight relative inline-block">
                Woven in <span className="text-[hsl(var(--brand-gold-deep))]">Elegance</span>
                {/* Gold Underline Animation */}
                <motion.div
                  className="absolute -bottom-2 left-0 h-px bg-[hsl(var(--brand-gold)/0.6)]"
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
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(20,12,6,0.92)] via-[rgba(20,12,6,0.55)] to-transparent transition-opacity duration-500" />

                      {/* Refined Hover Overlay Tint */}
                      <div className="absolute inset-0 bg-[hsl(var(--brand-gold)/0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-inset ring-[hsl(var(--brand-gold)/0.2)] rounded-[14px] pointer-events-none" />

                      <div className="absolute bottom-4 left-5 right-5 overflow-hidden">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.1 + 0.25,
                            duration: 0.4,
                          }} // Staggered label reveal
                        >
                          <span className="font-sans text-[15px] font-semibold tracking-[0.02em] text-white block drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] group-hover:text-[hsl(var(--brand-gold-soft))] transition-colors duration-300">
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
        {/* VOICES OF HERITAGE — reads real approved reviews; the samples below
            stand in only until the dashboard has some. Kept compact so it
            supports the page rather than becoming a second page of its own. */}
        <section className="w-full py-14 md:py-20 relative overflow-hidden bg-gradient-to-b from-[#F8F7F4] to-[#F4F3EF] border-y border-[hsl(var(--brand-gold)/0.18)] dark:from-[#120905] dark:to-[#1b0e08]">
          <div
            className="absolute inset-0 opacity-[0.018] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: `url('/patterns/kalamkari-pattern.svg')`,
              backgroundSize: "120px 120px",
            }}
          />

          <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-8 relative z-10">
            <AnimatedElement className="text-center" delay={0}>
              <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[38px] font-bold leading-tight text-[hsl(var(--brand-ink))] dark:text-[hsl(var(--brand-cream))]">
                Voices of Heritage
              </h2>

              {/* Figures come from real reviews once they exist. */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-5">
                <span className="inline-flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-[15px] w-[15px] fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]"
                    />
                  ))}
                  <span className="ml-1 font-sans text-[14px] font-bold text-[hsl(var(--brand-ink))] dark:text-[hsl(var(--brand-cream))]">
                    {reviewStats ? reviewStats.average.toFixed(1) : "5.0"}
                  </span>
                </span>
                <span className="hidden h-3 w-px bg-[hsl(var(--brand-ink)/0.2)] sm:block" />
                <span className="font-sans text-[13px] text-[hsl(var(--brand-ink)/0.7)] dark:text-[hsl(var(--brand-cream)/0.7)]">
                  {reviewStats
                    ? reviewStats.count === 1
                      ? "1 customer review"
                      : `${reviewStats.count} customer reviews`
                    : "Loved by customers across India"}
                </span>
                <span className="hidden h-3 w-px bg-[hsl(var(--brand-ink)/0.2)] sm:block" />
                <span className="font-sans text-[13px] text-[hsl(var(--brand-ink)/0.7)] dark:text-[hsl(var(--brand-cream)/0.7)]">
                  100% hand-painted
                </span>
              </div>
            </AnimatedElement>

            <div className="mt-9 md:mt-12 -mx-5 px-5 sm:mx-0 sm:px-0">
              <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-5 md:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {displayReviews.map((r: any) => (
                  <li
                    key={r.id}
                    className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]"
                  >
                    <figure className="flex h-full flex-col rounded-xl border border-[hsl(var(--brand-gold)/0.25)] bg-white p-5 shadow-[0_4px_16px_rgba(26,21,18,0.07)] dark:bg-[#1a0f0a]/70 md:p-6">
                      <div className="mb-3 flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < r.rating
                                ? "fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]"
                                : "text-[hsl(var(--brand-ink)/0.2)]",
                            )}
                          />
                        ))}
                      </div>

                      <blockquote className="font-serif text-[16px] leading-[1.55] text-[hsl(var(--brand-ink))] dark:text-[hsl(var(--brand-cream))] md:text-[17px]">
                        {r.content}
                      </blockquote>

                      <figcaption className="mt-auto flex items-center gap-3 pt-5">
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-gold)/0.18)] font-sans text-[14px] font-bold text-[hsl(var(--brand-gold-deep))]"
                        >
                          {r.customer_name
                            .split(" ")
                            .slice(0, 2)
                            .map((w: string) => w[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] dark:text-[hsl(var(--brand-cream))]">
                            {r.customer_name}
                          </span>
                          {r.city && (
                            <span className="mt-0.5 block font-sans text-[12px] text-[hsl(var(--brand-ink)/0.55)] dark:text-[hsl(var(--brand-cream)/0.55)]">
                              {r.city}
                            </span>
                          )}
                          {r.is_verified_purchase && (
                            <span className="mt-0.5 inline-flex items-center gap-1 font-sans text-[12px] text-[hsl(var(--brand-ink)/0.55)] dark:text-[hsl(var(--brand-cream)/0.55)]">
                              <BadgeCheck className="h-3.5 w-3.5 text-[hsl(var(--brand-gold-deep))]" />
                              Verified purchase
                            </span>
                          )}
                        </span>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
