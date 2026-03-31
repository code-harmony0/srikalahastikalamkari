"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  motion,
  useScroll,
  useTransform,
  useAnimation,
  useInView,
} from "framer-motion"
import { productsService } from "@/services/products"
import { promotionsService } from "@/services/promotions"
import { Product, Promotion } from "@/shared/types"
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
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            element.classList.add("is-visible")
          }, delay)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`${className || ""} animate-reveal`}>
      {children}
    </div>
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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [textColor] = useState("text-white") // Fixed to white for maximum clarity
  const galleryScrollRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroControls = useAnimation()

  // Parallax scroll effects
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  // High-quality REAL Kalamkari saree fabric photographs with handcrafted patterns (LOCAL)
  const heroBackgroundImages = [
    {
      src: "/images/hero/saree-1.jpg",
      alt: "Woman wearing a black Kalamkari saree with vibrant floral patterns and gold zari border",
      brightness: "medium",
    },
    {
      src: "/images/hero/saree-2.jpg",
      alt: "Woman wearing a cream Kalamkari saree with blue floral vines and traditional pallu depicting a divine figure",
      brightness: "medium",
    },
    {
      src: "/images/hero/saree-3.jpg",
      alt: "Woman wearing a green Kalamkari silk saree with mythological figures and gold zari border",
      brightness: "medium",
    },
    {
      src: "/images/hero/saree-4.jpg",
      alt: "Woman wearing a maroon Kalamkari dupatta with traditional Srikalahasti hand-painted motifs",
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

  // GSAP-style hero entrance animation
  useEffect(() => {
    heroControls.start({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 2.5,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for GSAP feel
        staggerChildren: 0.3,
      },
    })
  }, [heroControls])

  // Remove duplicate background image carousel effect
  // (keeping only the one above for 5-second intervals)

  // Auto-scroll gallery
  useEffect(() => {
    const scrollContainer = galleryScrollRef.current
    if (!scrollContainer) return

    let scrollPosition = 0
    let isAutoScrolling = true
    let lastInteractionTime = Date.now()

    const autoScroll = () => {
      if (!isAutoScrolling || !scrollContainer) return

      // Check if user has interacted recently (pause auto-scroll for 5 seconds after interaction)
      if (Date.now() - lastInteractionTime < 5000) {
        return
      }

      scrollPosition += 2
      const maxScroll =
        scrollContainer.scrollWidth - scrollContainer.clientWidth

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0 // Loop back to start
      }

      scrollContainer.scrollLeft = scrollPosition
    }

    const scrollInterval = setInterval(autoScroll, 50)

    // Pause auto-scroll on user interaction
    const handleUserInteraction = () => {
      lastInteractionTime = Date.now()
    }

    scrollContainer.addEventListener("wheel", handleUserInteraction)
    scrollContainer.addEventListener("touchstart", handleUserInteraction)
    scrollContainer.addEventListener("mousedown", handleUserInteraction)

    return () => {
      clearInterval(scrollInterval)
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
        {/* Cinematic Hero Section - Calm, High-End Look */}
        <section
          ref={heroRef}
          className="relative w-full min-h-[95vh] grid lg:grid-cols-2 overflow-hidden bg-[#FFF8F0]"
          role="banner"
          aria-label="Srikalahasti Kalamkari - Cinematic Collection"
        >
          {/* LEFT COLUMN: Narrative & Actions */}
          <div className="relative z-20 flex flex-col justify-center px-6 md:px-12 lg:px-24 py-20 lg:py-0 order-2 lg:order-1 border-r border-[#D4A05A]/10">
            {/* Subtle Background Pattern for Texture */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A65329' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="w-16 h-px bg-[#A65329]"></div>
                  <span className="text-xs font-bold text-[#A65329] uppercase tracking-[0.3em]">
                    Est. 1999
                  </span>
                </div>

                <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-foreground mb-8 tracking-tighter">
                  <span className="block font-serif italic text-primary text-2xl md:text-3xl lg:text-4xl mb-4 tracking-widest opacity-90">
                    Srikalahasti
                  </span>
                  <span className="block font-serif font-bold uppercase tracking-tight">
                    Kalamkari
                  </span>
                </h1>

                <p className="font-sans text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed font-light italic">
                  “Where every thread tells a timeless story.”
                </p>

                {/* Unified Button Group */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full">
                  <Link href="/products" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-[220px] h-14 rounded-xl text-base font-semibold luxury-primary-button tracking-widest uppercase">
                      Shop Collection
                    </Button>
                  </Link>

                  <Link href="/about" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-[220px] h-14 rounded-xl text-base font-semibold luxury-secondary-button tracking-widest uppercase"
                    >
                      Discover Story
                    </Button>
                  </Link>
                </div>

                {/* Bespoke Design CTA - Enhanced & Prominent */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="mt-10"
                >
                  <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-[#A65329] via-[#B85C2E] to-[#8B4520] shadow-[0_12px_40px_rgba(166,83,41,0.35)] border border-[#D4A05A]/30">
                    {/* Decorative Pattern Overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0z' fill='none' stroke='%23FFF' stroke-width='1'/%3E%3C/svg%3E")`,
                        backgroundSize: "24px 24px",
                      }}
                    />

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                    <div className="relative p-6 flex items-start gap-4">
                      {/* Icon Container */}
                      <div className="shrink-0 p-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
                        <Palette
                          className="w-6 h-6 text-white"
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                            Exclusive
                          </span>
                          <span className="w-8 h-px bg-white/40" />
                        </div>

                        <h3 className="font-serif text-lg font-bold text-white mb-2 tracking-wide">
                          Bespoke Design
                        </h3>

                        <p className="font-sans text-[14px] text-white/90 leading-relaxed mb-4">
                          Your vision, our artisan's hands — crafted only for
                          you. Create a one-of-a-kind masterpiece.
                        </p>

                        {/* CTA Button */}
                        <a
                          href="https://wa.me/917288848881?text=Hello%2C%20I%20would%20love%20to%20create%20a%20custom%20handcrafted%20saree%20%2F%20dupatta.%20Could%20you%20help%20me%20design%20one%3F"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-white text-[#A65329] text-[13px] font-bold tracking-wider uppercase hover:bg-[#FFF8F0] transition-all duration-300 shadow-lg hover:shadow-xl group/btn"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 shrink-0"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.35.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Start Custom Order
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Minimalist Scroll Cue */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ height: [0, 48, 0], opacity: [0, 1, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-[1px] bg-accent h-12 origin-top"
              />
              <span className="font-sans text-[10px] font-bold tracking-[0.5em] text-foreground/40 uppercase">
                Scroll
              </span>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Visual & Parallax */}
          <div className="relative order-1 lg:order-2 h-[60vh] lg:h-auto overflow-hidden">
            <motion.div
              style={{ y: heroY, scale: heroScale }}
              className="absolute inset-0 w-full h-[120%]"
            >
              {heroBackgroundImages.map((image, index) => (
                <Image
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  fill
                  className={`object-cover object-top transition-opacity ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
                  style={{ transitionDuration: "2000ms" }}
                  priority={index === 0}
                />
              ))}

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-black/20 via-transparent to-transparent opacity-30"></div>

              {/* Fabric Grain Texture */}
              <div
                className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              ></div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: Masterpieces of Heritage - Curated Editorial Layout */}
        <section className="relative w-full py-14 md:py-20 bg-[#FAF6F1] overflow-hidden">
          <div className="max-w-[960px] mx-auto px-4 md:px-6 relative z-10">
            {/* Header Block - Editorial, balanced */}
            <div className="text-center mb-10 md:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-inter text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C19A5B]">
                  Curated Collection
                </span>
                <h2 className="font-playfair text-[28px] md:text-[36px] text-[#3B2C23] mt-3 mb-3 leading-tight font-bold">
                  Masterpieces of{" "}
                  <span className="italic text-[#A4552A]">Heritage</span>
                </h2>
                <p className="text-[#3B2C23]/65 max-w-lg mx-auto font-inter text-[14px] leading-relaxed">
                  Hand-painted sarees that define timeless craftsmanship.
                </p>
              </motion.div>
            </div>

            {/* Product Grid - 3-col with breathing room */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 justify-items-center">
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
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center mt-12"
            >
              <Link href="/products">
                <button className="inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium text-[#3B2C23] border border-[#3B2C23]/20 rounded-full hover:bg-[#3B2C23] hover:text-white hover:border-[#3B2C23] transition-all duration-300">
                  View All Products
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* The Soul of the Artisan Section - Refined Polish (Section 3) */}
        <section className="w-full py-20 md:py-24 relative overflow-hidden">
          {/* Section Divider with Faint Shadow */}
          <div className="absolute top-0 left-0 w-full h-px bg-[#D4A05A]/20 shadow-[0_2px_4px_rgba(0,0,0,0.02)] z-10" />

          {/* Background: Soft Beige -> Cream + Faint Fabric Texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4E8] to-[#FFF8F0] z-0" />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%233B2C23'/%3E%3C/svg%3E")`,
              backgroundSize: "20px 20px",
            }}
          />

          <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 relative z-20">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {/* Image Block - Aligned Flush Left */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, x: -20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                viewport={{ once: true }}
                className="lg:col-span-6 order-2 lg:order-1"
              >
                <div className="relative group">
                  {/* Main Image Container */}
                  <div className="relative overflow-hidden rounded-[16px] shadow-2xl transition-all duration-700">
                    <Image
                      src="/images/products/artisan.png"
                      alt="Master artisan carefully painting traditional Kalamkari designs"
                      className="w-full aspect-[4/5] object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                      width={600}
                      height={750}
                    />
                    <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:opacity-0"></div>
                  </div>

                  {/* Stat Card: Heritage Years */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="absolute -bottom-8 -right-8 bg-[#FFF8F0]/95 backdrop-blur-md rounded-[12px] p-6 shadow-[0_8px_32px_rgba(59,44,35,0.1)] border border-[#D4A05A]/20"
                  >
                    <CountUpNumber
                      end={500}
                      duration={2000}
                      className="text-3xl font-serif font-bold text-[#A65329] mb-1"
                      suffix="+"
                    />
                    <div className="text-sm font-sans text-[#3B2C23]/80 font-medium tracking-wide">
                      Years Heritage
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Text Block - Narrower & Refined */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className="lg:col-span-6 order-1 lg:order-2 lg:pl-8"
              >
                {/* Tag */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#A65329]"></span>
                  <span className="font-sans text-[11px] font-bold text-[#A65329] uppercase tracking-[0.25em]">
                    Our Heritage
                  </span>
                </div>

                {/* Heading */}
                <h2 className="font-serif text-4xl md:text-5xl lg:text-[56px] text-[#3B2C23] mb-8 leading-[1.1] tracking-tight">
                  The Soul of the <br />
                  <span className="text-[#A65329] italic">Artisan</span>
                </h2>

                {/* Content */}
                <div className="space-y-6 mb-10 max-w-xl">
                  <p className="font-sans text-[17px] text-[#3B2C23]/85 leading-relaxed font-light">
                    Srikalahasti Kalamkari is more than an art form; it is a
                    living narrative whispered through generations. Specializing
                    in authentic hand-painted textiles, from elegant Sarees and
                    Duppatas to exquisite Wall Paintings and Canvas art.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      "Sarees",
                      "Duppatas",
                      "Dress Materials",
                      "Blouse Pieces",
                      "House Decorations",
                      "Wall Paintings",
                      "Canvas Paintings",
                      "Photo Frames",
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-[#A65329]/5 border border-[#A65329]/20 rounded-full text-[11px] font-bold text-[#A65329] uppercase tracking-wider"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="border-l-2 border-[#D4A05A]/40 pl-6 my-6">
                    <p className="font-serif text-lg text-[#3B2C23]/90 italic leading-relaxed">
                      "Every thread tells a story. Every color carries history."
                    </p>
                  </blockquote>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg">
                  {/* Card 1 */}
                  <div className="p-4 bg-white/50 rounded-[10px] border border-[#3B2C23]/5 shadow-inner flex items-center gap-4 transition-all hover:bg-white/80 hover:shadow-md hover:scale-[1.02]">
                    <div className="p-2 bg-[#A65329]/10 rounded-lg text-[#A65329]">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif text-2xl font-bold text-[#3B2C23]">
                        200+
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-[#3B2C23]/60">
                        Master Artisans
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 bg-white/50 rounded-[10px] border border-[#3B2C23]/5 shadow-inner flex items-center gap-4 transition-all hover:bg-white/80 hover:shadow-md hover:scale-[1.02]">
                    <div className="p-2 bg-[#D4A05A]/10 rounded-lg text-[#D4A05A]">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-serif text-2xl font-bold text-[#3B2C23]">
                        100%
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-[#3B2C23]/60">
                        Natural Dyes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/about">
                    <Button className="h-[52px] px-8 rounded-[10px] bg-[#A65329] text-white hover:bg-[#8B4420] transition-all shadow-lg hover:shadow-xl text-[15px] font-medium tracking-wide focus:ring-2 focus:ring-[#C19A5B] focus:ring-offset-2">
                      Discover the Craft
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      variant="outline"
                      className="h-[52px] px-8 rounded-[10px] border-[#3B2C23]/20 text-[#3B2C23] hover:bg-[#3B2C23]/5 hover:border-[#3B2C23]/40 transition-all text-[15px] font-medium tracking-wide focus:ring-2 focus:ring-[#C19A5B] focus:ring-offset-2 bg-transparent"
                    >
                      Our Story
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Faint Watermark (Bottom Right) */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-[0.03] pointer-events-none rotate-12 text-[#3B2C23]">
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
          <section className="w-full pt-16 pb-24 md:pb-32 relative overflow-hidden">
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

        {/* Our Promise Section - Precision Polish 2026 */}
        <section className="w-full py-10 md:py-12 relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#FBEED8]">
          {/* Faint Kalamkari Motif Background */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 20c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' stroke='%23A65329' stroke-width='0.5' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
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

              <h2 className="font-serif text-3xl md:text-4xl text-[#3B2A1C] mb-3 leading-tight">
                The Srikalahasti{" "}
                <span className="text-[#A65329] italic">Promise</span>
              </h2>

              <p className="font-sans text-base text-[#493A2F]/90 leading-relaxed max-w-2xl mx-auto">
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
                    {/* Terracotta Hover Glow */}
                    <div className="absolute -inset-1 bg-[#C17C4E]/0 group-hover:bg-[#C17C4E]/25 rounded-[16px] blur-lg transition-all duration-500" />

                    {/* Card with Darker Gradient */}
                    <div className="relative h-full bg-gradient-to-b from-[#FAF3E8] to-[#F5E8D4] rounded-xl py-8 px-6 shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_28px_rgba(193,124,78,0.12)] transition-all duration-500 border border-[#E6C595]/30 group-hover:border-[#C49353]/60 overflow-hidden">
                      {/* Icon - Smaller with Gold Gradient */}
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E8C98C] to-[#C09A58] shadow-md">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Title - Playfair Bold 20px */}
                      <h3 className="font-serif text-[20px] font-bold text-[#3B2A1C] mb-2 text-center leading-tight">
                        {item.title}
                      </h3>

                      {/* Description - Inter 15px */}
                      <p className="font-sans text-[15px] text-[#493A2F]/90 leading-[1.5] text-center mb-4">
                        {item.description}
                      </p>

                      {/* Badge - Inter SemiBold 13px */}
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1.5 bg-[#C19A5B]/8 rounded-full border border-[#C19A5B]/25 text-[13px] font-semibold text-[#B47A2B] group-hover:border-[#C19A5B]/50 transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-offset-1 group-hover:ring-[#C19A5B]/40">
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
        <section className="w-full py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#F9EBD8]">
          {/* Parallax Background Pattern - 5% Gold Motif */}
          <motion.div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M70 10 L130 70 L70 130 L10 70 Z' fill='none' stroke='%23C8A874' stroke-width='0.5'/%3E%3C/svg%3E")`,
              backgroundSize: "280px 280px",
              y: useTransform(useScroll().scrollYProgress, [0, 1], [0, -150]), // Refined 0.4x-style drift
            }}
          />

          {/* Advanced Luxury: Looping Gold Thread Animation */}
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
        <section className="w-full py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] to-[#FFF3E6]">
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
                <h2 className="font-playfair text-4xl md:text-5xl text-[#3A2413] font-bold leading-tight mb-6">
                  Voices of{" "}
                  <span className="italic text-[#A4552A]">Heritage</span>
                </h2>
                <p className="font-sans text-[16px] text-[#3A2413]/70 max-w-2xl mx-auto leading-relaxed">
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
                  className="relative p-10 md:p-14 bg-white/60 backdrop-blur-md rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#C19A5B]/10 overflow-hidden text-center max-w-5xl mx-auto"
                >
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
                    <p className="font-playfair text-[20px] md:text-[24px] leading-[1.7] text-[#3A2413]/85 mb-10 italic max-w-3xl mx-auto">
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
                        <p className="font-playfair text-[18px] font-bold text-[#A4552A] leading-tight mb-1 uppercase tracking-wide">
                          Priya Sharma
                        </p>
                        <p className="font-sans text-[13px] text-[#3A2413]/60 italic font-medium">
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
                      boxShadow: "0 12px 24px rgba(164, 85, 42, 0.08)",
                    }}
                    className="group h-full p-8 md:p-10 bg-white/50 backdrop-blur-sm rounded-[16px] border border-[#C19A5B]/10 flex flex-col justify-between transition-all duration-300 hover:bg-white/80"
                  >
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
                      <p className="font-sans text-[15px] leading-[1.7] text-[#3A2413]/80 italic">
                        {item.quote}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#C19A5B]/10">
                      <p className="font-sans text-[14px] font-bold text-[#A4552A] uppercase tracking-wider mb-1">
                        {item.name}
                      </p>
                      <p className="font-sans text-[12px] text-[#3A2413]/50 font-medium">
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
                      className="flex items-center gap-4 bg-[#FFF8F0] px-8 py-5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-[#C19A5B]/15 min-w-[240px] justify-center group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{anchor.prefix}</span>
                          <span className="font-playfair text-[22px] font-bold text-[#3A2413]">
                            {anchor.value}
                          </span>
                        </div>
                        <span className="font-sans text-[12px] font-bold text-[#A4552A] uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
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
