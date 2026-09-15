"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BadgeCheck, MessageCircle, Pause, Play, Star } from "lucide-react"
import { productsService } from "@/services/products"
import { Product } from "@/shared/types"
import { cn } from "@/shared/utils"
import { useAllReviews, type Review } from "@/shared/hooks/use-reviews"
import { getImageTier } from "@/lib/image-tiers"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { CuratedProductCard, CuratedProductCardSkeleton } from "@/features/products/CuratedProductCard"
import { CornerFlorals, FloralDivider, JharokhaFrame } from "@/shared/ui/heritage-ornaments"
import { getCategories } from "@/services/categories"
import { CategoryShowcase } from "./CategoryShowcase"
import { pickGalleryPieces } from "./gallery-pieces"

/*
 * Colour roles on this page (PRODUCT.md, 2026-09-15):
 *  - charcoal text everywhere; never blue or brown text, never gold text on light
 *  - midnight navy for the primary action; white + charcoal outline for secondary
 *  - pale natural-dye bands: indigo (categories, closing), turmeric (story), madder (gallery)
 *  - gold only as frames, rules and floral line art
 */

const HERO_IMAGES = [
  { src: "/images/brand-models/model-saree-03.jpeg", alt: "Model wearing a cream floral Srikalahasti Kalamkari saree with a hand-painted story border" },
  { src: "/images/brand-models/model-saree-01.jpeg", alt: "Model wearing a purple Kalamkari saree with narrative pallu artwork" },
  { src: "/images/brand-models/model-saree-07.jpeg", alt: "Model wearing a blue Kalamkari saree with traditional painted motifs" },
  { src: "/images/brand-models/model-saree-10.jpeg", alt: "Model in a black and gold Kalamkari saree with hand-painted motifs" },
]

const PROCESS_STEPS = [
  { title: "Prepare the cloth", text: "Cotton or silk is washed and soaked so it will take the dye." },
  { title: "Draw with the kalam", text: "Every outline is drawn freehand with a bamboo pen." },
  { title: "Fill the colours", text: "Natural dyes are painted in by hand, one colour at a time." },
  { title: "Wash and fix", text: "The cloth is washed so the colours set into the fabric." },
  { title: "Check and send", text: "Each piece is checked before it leaves Srikalahasti." },
]

const FACTS = [
  "GI registered · Application No. 28",
  "Made in Srikalahasti",
  "Painted with natural dyes",
  "Sold directly by the makers",
]

type GalleryPiece = Omit<Product, "image"> & { image: string | null; categoryName?: string }

const SAREE_CATEGORIES = ["Sarees", "Pure Silk Sarees"]

// Gallery block, 4 columns on computers and 2 on phones:
//   big big tall small      phones: big big / big big / tall small / tall small / small small / wide wide
//   big big tall small
//   small small wide wide
const GALLERY_LAYOUT = ["col-span-2 row-span-2", "row-span-2", "", "", "", "", "col-span-2"]

const STORY_LINKS = [
  { label: "Sarees", category: "Sarees" },
  { label: "Dupattas", category: "Duppatta" },
  { label: "Fabrics", category: "Fabrics" },
  { label: "Wall paintings", category: "Wall Paintings" },
]

const WHATSAPP_URL =
  "https://wa.me/917288848881?text=Hello%2C%20I%20need%20help%20with%20a%20custom%20Srikalahasti%20Kalamkari%20design.%20Please%20share%20fabric%2C%20motif%2C%20price%20and%20timeline%20details."

const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name)}`

// Shared styles: outline secondary button and gold-underlined text link.
const secondaryButton =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors duration-300 hover:bg-[hsl(var(--brand-turmeric-tint))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
const textLink =
  "inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] transition-colors hover:decoration-[hsl(var(--brand-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] rounded-sm"

function SectionHeading({ title, intro, onDark = false }: { title: string; intro?: string; onDark?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2
        className={cn(
          "text-balance font-serif text-[30px] leading-tight md:text-[42px]",
          onDark ? "text-white" : "text-[hsl(var(--brand-ink))]",
        )}
      >
        {title}
      </h2>
      <FloralDivider className={cn("mt-4", onDark && "text-[hsl(var(--brand-gold))]")} />
      {intro && (
        <p
          className={cn(
            "mx-auto mt-4 max-w-xl text-pretty font-sans text-[15px] leading-relaxed md:text-[16px]",
            onDark ? "text-[#DCE6F2]" : "text-[hsl(var(--brand-ink-soft))]",
          )}
        >
          {intro}
        </p>
      )}
    </div>
  )
}

export default function HomePage() {
  const reduceMotion = useReducedMotion()
  const [featured, setFeatured] = useState<Product[]>([])
  const [customPiece, setCustomPiece] = useState<Product | null>(null)
  const [gallery, setGallery] = useState<GalleryPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

  const { reviews: allReviews } = useAllReviews()
  const reviews = useMemo(
    () =>
      (allReviews || [])
        .filter((r: Review) => r.is_approved && r.rating >= 4 && typeof r.content === "string" && r.content.trim().length > 20)
        .sort((a: Review, b: Review) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6),
    [allReviews],
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [customRows, topCategories] = await Promise.all([
          productsService.getVisibleInTopCategories(["Customisations"]).catch(() => [] as Product[]),
          getCategories().catch(() => ({ data: null, error: null })),
        ])
        const names = (topCategories.data ?? []).map((c: { name: string }) => c.name)
        const everyPiece = names.length ? await productsService.getVisibleInTopCategories(names) : []
        if (cancelled) return

        const withPhoto = everyPiece.filter((p) => getImageTier(p.images, "medium", 0))
        // Featured: pieces marked featured in admin first, then the newest sarees.
        const sarees = withPhoto.filter((p) => SAREE_CATEGORIES.includes((p as { categoryName?: string }).categoryName ?? ""))
        const featuredRows = [...withPhoto.filter((p) => p.is_featured), ...sarees.filter((p) => !p.is_featured)].slice(0, 6)
        setFeatured(featuredRows)

        const customWithPhoto = customRows.filter((p) => getImageTier(p.images, "medium", 0))
        setCustomPiece(customWithPhoto.find((p) => !/wall|painting|frame/i.test(p.name || "")) ?? customWithPhoto[0] ?? null)

        const picked = pickGalleryPieces(
          withPhoto.map((p) => ({ ...p, image: getImageTier(p.images, "medium", 0) })),
          { limit: 7, exclude: featuredRows.map((p) => p.id) },
        )
        const wideIndex = picked.findIndex((p) => p.categoryName === "Wall Paintings")
        if (wideIndex > 0 && wideIndex !== picked.length - 1) {
          const [painting] = picked.splice(wideIndex, 1)
          picked.push(painting)
        }
        setGallery(picked)
      } catch (error) {
        console.error("Home data failed to load:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Slow crossfade; stopped for reduced motion or when the visitor pauses it.
  useEffect(() => {
    if (reduceMotion || heroPaused) return
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 7000)
    return () => clearInterval(timer)
  }, [reduceMotion, heroPaused])

  const customImage = customPiece ? getImageTier(customPiece.images, "medium", 0) : null

  return (
    <main className="w-full overflow-hidden bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        aria-label="Srikalahasti Kalamkari"
        className="relative flex min-h-[calc(88svh-96px)] w-full items-center justify-center overflow-hidden bg-[hsl(var(--brand-midnight))] sm:min-h-[640px] lg:min-h-[calc(100svh-112px)]"
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[heroIndex].src}
              alt={HERO_IMAGES[heroIndex].alt}
              fill
              priority={heroIndex === 0}
              sizes="100vw"
              className="object-cover object-[center_40%]"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,32,0.55)_0%,rgba(8,16,32,0.35)_45%,rgba(8,16,32,0.78)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center">
          <Image
            src="/images/srikalahasti-crest-only.png"
            alt="Srikalahasti Kalamkari"
            width={220}
            height={236}
            priority
            className="h-24 w-auto drop-shadow-[0_14px_30px_rgba(0,0,0,0.5)] sm:h-32 md:h-40"
          />
          <h1 className="mt-6 text-balance font-serif text-[34px] leading-[1.08] text-white sm:text-[46px] md:text-[60px]">
            Srikalahasti Kalamkari
          </h1>
          <p className="mt-4 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-white/90 md:text-[18px]">
            Sarees, dupattas and fabrics, drawn with a bamboo kalam and natural dyes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
            <Link
              href={categoryHref("Sarees")}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-white px-8 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.6)] transition-colors duration-300 hover:bg-[hsl(var(--brand-turmeric-tint))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Shop sarees
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="font-sans text-[14px] font-semibold text-white underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[7px] transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))] rounded-sm"
            >
              Discover the craft
            </Link>
          </div>
          <p className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[13px] font-medium text-white">
            <span>Free shipping across India</span>
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-[hsl(var(--brand-gold))]" />
            <span>GI-registered craft</span>
          </p>
        </div>

        {/* Slide position + pause */}
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {HERO_IMAGES.map((image, i) => (
              <span
                key={image.src}
                className={cn("h-1 rounded-full transition-all duration-500", i === heroIndex ? "w-6 bg-white" : "w-2 bg-white/50")}
              />
            ))}
          </div>
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setHeroPaused((p) => !p)}
              aria-label={heroPaused ? "Play slideshow" : "Pause slideshow"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-gold-soft))]"
            >
              {heroPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          )}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY (pale indigo band) ─────────────────────────── */}
      <CategoryShowcase />

      {/* ── FEATURED PIECES (white) ─────────────────────────────────────── */}
      {(loading || featured.length > 0) && (
        <section aria-labelledby="featured-pieces" className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div id="featured-pieces">
              <SectionHeading title="Featured pieces" intro="New sarees from our workshop." />
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:mt-12 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
              {loading
                ? Array.from({ length: 6 }, (_, i) => <CuratedProductCardSkeleton key={i} />)
                : featured.slice(0, 6).map((product, i) => (
                    <CuratedProductCard key={product.id} product={product} index={i} showDiscount={false} />
                  ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/products" className={secondaryButton}>
                Shop all pieces
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── THE CRAFT (pale turmeric band) ──────────────────────────────── */}
      <section aria-labelledby="the-craft" className="relative bg-[hsl(var(--brand-turmeric-tint))] py-16 md:py-24">
        <CornerFlorals className="absolute left-3 top-4 h-20 w-20 opacity-70 md:h-28 md:w-28" />
        <CornerFlorals className="absolute bottom-4 right-3 h-20 w-20 rotate-180 opacity-70 md:h-28 md:w-28" />
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 px-5 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16">
          <div className="mx-auto w-full max-w-[380px] pt-6">
            <JharokhaFrame>
              <Image
                src="/images/brand-models/model-saree-05.jpeg"
                alt="Model wearing a hand-painted Srikalahasti Kalamkari dupatta"
                fill
                sizes="(max-width: 768px) 80vw, 380px"
                className="object-cover"
              />
            </JharokhaFrame>
          </div>
          <div>
            <h2 id="the-craft" className="text-balance font-serif text-[30px] leading-tight md:text-[44px]">
              Drawn by hand, not printed
            </h2>
            <FloralDivider className="ml-0 mt-4" />
            <div className="mt-6 max-w-[34rem] space-y-4 font-sans text-[16px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
              <p>
                Kalamkari means pen-work. In Srikalahasti every outline is drawn freehand with a bamboo kalam, then filled
                with natural dyes, colour by colour. No blocks, no machines.
              </p>
              <p>
                We paint sarees, dupattas, fabrics and more in the village, and sell them to you directly.
              </p>
            </div>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {STORY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={categoryHref(link.category)}
                    className="inline-flex h-10 items-center rounded-full border border-[hsl(var(--brand-ink)/0.25)] bg-white/70 px-4 font-sans text-[14px] font-medium text-[hsl(var(--brand-ink))] transition-colors hover:border-[hsl(var(--brand-ink))] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/about" className={textLink}>
                Read our story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROCESS (midnight band) ─────────────────────────────────── */}
      <section aria-labelledby="the-process" className="relative bg-[hsl(var(--brand-midnight))] py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div id="the-process">
            <SectionHeading onDark title="From cloth to kalam" intro="How a Srikalahasti Kalamkari piece is made." />
          </div>
          <ol className="relative mt-12 grid grid-cols-2 gap-x-4 gap-y-9 md:mt-16 lg:grid-cols-5 lg:gap-6">
            <span
              aria-hidden="true"
              className="absolute left-[10%] right-[10%] top-[26px] hidden border-t border-dashed border-[hsl(var(--brand-gold)/0.55)] lg:block"
            />
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.title} className={cn("relative flex flex-col items-center text-center", i === PROCESS_STEPS.length - 1 && "col-span-2 lg:col-span-1")}>
                <span className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[hsl(var(--brand-gold))] bg-[hsl(var(--brand-midnight))] font-sans text-[16px] font-semibold tabular-nums text-[hsl(var(--brand-gold-soft))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-serif text-[20px] leading-snug text-white">{step.title}</h3>
                <p className="mt-2 max-w-[15rem] font-sans text-[14px] leading-relaxed text-[#DCE6F2]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FACT STRIP (replaces the promise cards) ─────────────────────── */}
      <section aria-label="About the craft" className="bg-white">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <ul className="grid grid-cols-1 border-y-2 border-dotted border-[hsl(var(--brand-gold-ornament)/0.7)] py-6 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-center justify-center gap-3 px-3 py-2.5 text-center font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))]">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rotate-45 bg-[hsl(var(--brand-gold))]" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── GALLERY OF OUR WORK (pale madder band) ─────────────────────── */}
      {(loading || gallery.length > 0) && (
        <section aria-labelledby="our-work" className="bg-[hsl(var(--brand-madder-tint))] py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
            <div id="our-work">
              <SectionHeading
                title="Gallery of our work"
                intro="Sarees, dupattas, fabrics and custom work, all painted by hand in Srikalahasti."
              />
            </div>
            {/* A neat block: one big tile, one tall, one wide, the rest small. Straight edges on every side. */}
            <ul className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] md:mt-12 md:grid-cols-4 md:auto-rows-[200px] md:gap-4 lg:auto-rows-[230px]">
              {loading
                ? GALLERY_LAYOUT.map((layout, i) => (
                    <li key={i} className={cn("animate-pulse rounded-sm bg-white/70", layout)} />
                  ))
                : gallery.slice(0, GALLERY_LAYOUT.length).map((piece, i) => (
                    <li key={piece.id} className={GALLERY_LAYOUT[i]}>
                      <Link
                        href={`/products/${piece.slug || piece.id}`}
                        title={piece.name}
                        className="group relative block h-full w-full overflow-hidden rounded-sm bg-white shadow-[0_18px_34px_-26px_rgba(60,20,10,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--brand-madder-tint))]"
                      >
                        {piece.image && (
                          <OptimizedImage
                            src={piece.image}
                            alt={piece.name}
                            fill
                            sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                            imageType="productCard"
                            className="object-cover object-[center_20%] transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                        )}
                        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.22)_30%,transparent_52%)]" />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-[6px] rounded-[2px] border border-white/70" />
                        <span className="absolute inset-x-0 bottom-0 p-3.5 md:p-4">
                          <span className="block font-sans text-[13px] font-semibold text-white md:text-[14px]">
                            {piece.categoryName}
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 hidden md:block",
                              i !== 0 && "md:opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100",
                            )}
                          >
                            <span className={cn("font-serif leading-snug text-white/95 line-clamp-1", i === 0 ? "text-[18px]" : "text-[15px]")}>
                              {piece.name}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
            </ul>
            <div className="mt-10 text-center">
              <Link href="/products" className={textLink}>
                See all pieces in the shop
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── REAL REVIEWS (hidden until approved reviews exist) ─────────── */}
      {reviews.length > 0 && (
        <section aria-labelledby="reviews" className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div id="reviews">
              <SectionHeading title="From our customers" />
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {reviews.slice(0, 3).map((r: Review & { customer_name?: string; city?: string; is_verified_purchase?: boolean }) => (
                <li key={r.id} className="rounded-lg border border-[hsl(var(--border))] bg-white p-6">
                  <div className="flex gap-1" aria-label={`${r.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < r.rating ? "fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" : "text-[hsl(var(--brand-ink)/0.2)]")} />
                    ))}
                  </div>
                  <blockquote className="mt-3 font-serif text-[17px] leading-relaxed">{r.content}</blockquote>
                  <p className="mt-4 font-sans text-[14px] font-semibold">{r.customer_name}</p>
                  {r.is_verified_purchase && (
                    <p className="mt-1 inline-flex items-center gap-1 font-sans text-[13px] text-[hsl(var(--brand-muted))]">
                      <BadgeCheck className="h-4 w-4" /> Verified purchase
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── CUSTOM STUDIO (closing band, pale indigo) ───────────────────── */}
      <section aria-labelledby="custom-studio" className="relative bg-[hsl(var(--brand-cream))]">
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:gap-16 md:py-24">
          <div className="order-2 md:order-1">
            <h2 id="custom-studio" className="text-balance font-serif text-[30px] leading-tight md:text-[44px]">
              Want something made just for you?
            </h2>
            <FloralDivider className="ml-0 mt-4" />
            <p className="mt-6 max-w-[34rem] font-sans text-[16px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
              We make custom designs for everything we paint: sarees, dupattas, fabrics, men's wear and more. Send us your
              idea, colours or a photo.
            </p>
            <p className="mt-3 font-sans text-[14px] text-[hsl(var(--brand-muted))]">
              No obligation. We share fabric options, price and timeline first.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#1F7A4D] px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#17603C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Message on WhatsApp
              </a>
              <Link href="/custom-design" className={cn(secondaryButton, "hover:bg-white/80")}>
                See custom designs
              </Link>
            </div>
          </div>
          <div className="order-1 mx-auto w-full max-w-[340px] pt-6 md:order-2">
            <JharokhaFrame>
              {customImage ? (
                <OptimizedImage
                  src={customImage}
                  alt={customPiece?.name ? `Commissioned piece: ${customPiece.name}` : "A commissioned Kalamkari piece"}
                  fill
                  sizes="(max-width: 768px) 80vw, 340px"
                  imageType="productCard"
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/images/brand-models/model-saree-08.jpeg"
                  alt="Hand-painted Srikalahasti Kalamkari saree"
                  fill
                  sizes="(max-width: 768px) 80vw, 340px"
                  className="object-cover"
                />
              )}
            </JharokhaFrame>
            {customPiece?.name && (
              <p className="mt-3 text-center font-sans text-[13px] text-[hsl(var(--brand-muted))]">{customPiece.name}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
