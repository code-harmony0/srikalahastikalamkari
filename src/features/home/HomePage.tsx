"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BadgeCheck, MessageCircle, Star } from "lucide-react"
import { cn, formatPrice } from "@/shared/utils"
import { useAllReviews, type Review } from "@/shared/hooks/use-reviews"
import { productsService } from "@/services/products"
import { getSubCategories } from "@/services/categories"
import { Product } from "@/shared/types"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { getImageTier } from "@/lib/image-tiers"
import {
  CuratedProductCard,
  CuratedProductCardSkeleton,
} from "@/features/products/CuratedProductCard"
import {
  ParcelMark,
  LockMark,
  LotusSealMark,
} from "@/shared/ui/craft-marks"
import { buildSareeShowcase, type ShowcaseSubCategory } from "./saree-showcase"

// The two top-level categories that hold sarees. The service resolves them by
// name, so they always match what the shop filter opens.
const SAREE_CATEGORIES = ["Sarees", "Pure Silk Sarees"]
const PRIMARY_SAREE_CATEGORY = "Sarees"

const categoryHref = (name: string) =>
  `/products?category=${encodeURIComponent(name)}`

// Brand photography is shot as full-length 2:3 portraits. Shown whole, a buyer
// sees the pallu and border — the parts that sell a Kalamkari saree — instead
// of the torso slice a full-width landscape banner crops them to.
const HERO_SAREES = [
  {
    src: "/images/brand-models/model-saree-03.jpeg",
    alt: "Model in a cream Srikalahasti Kalamkari saree with a hand-painted floral body and a story pallu",
  },
  {
    src: "/images/brand-models/model-saree-01.jpeg",
    alt: "Model in a purple Kalamkari saree with a pallu of painted figures and horses",
  },
  {
    src: "/images/brand-models/model-saree-10.jpeg",
    alt: "Model in a black and gold Kalamkari saree painted with horses and elephants",
  },
]

// Only what checkout actually does: every order ships free within India, and
// payment is online through Razorpay. There is no cash on delivery and no
// returns or refunds, so neither is claimed.
const TRUST = [
  { Mark: ParcelMark, label: "Free shipping across India" },
  { Mark: LockMark, label: "Secure online payment" },
  { Mark: LotusSealMark, label: "GI certified" },
]

const customDesignWhatsAppUrl =
  "https://wa.me/917288848881?text=Hello%2C%20I%20need%20help%20with%20a%20custom%20Srikalahasti%20Kalamkari%20design.%20Please%20share%20fabric%2C%20motif%2C%20price%20and%20timeline%20details."

export default function HomePage() {
  const [sarees, setSarees] = useState<Product[]>([])
  const [subCategories, setSubCategories] = useState<ShowcaseSubCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      productsService.getVisibleInTopCategories(SAREE_CATEGORIES),
      getSubCategories(),
    ])
      .then(([products, subs]) => {
        if (cancelled) return
        setSarees(products)
        setSubCategories(
          (subs.data ?? []).map((sub) => ({ id: sub.id, name: sub.name })),
        )
      })
      .catch((error) => console.error("Error loading sarees:", error))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const showcase = useMemo(
    () => buildSareeShowcase(sarees, subCategories),
    [sarees, subCategories],
  )

  // The hero's count and price describe exactly the page its button opens.
  const primary = useMemo(
    () =>
      buildSareeShowcase(
        sarees.filter((p) => p.categoryName === PRIMARY_SAREE_CATEGORY),
        [],
      ),
    [sarees],
  )

  // Only real, approved reviews. The page previously fell back to invented
  // customers with five-star ratings whenever none existed.
  const { reviews: allReviews } = useAllReviews()
  const reviews = useMemo(
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

  return (
    <main className="w-full kalamkari-static-background silk-fabric-texture text-[hsl(var(--brand-ink))]">
      {/* ── Hero: three whole sarees and one way in ─────────────────── */}
      <section
        aria-labelledby="home-hero-title"
        className="border-b border-[hsl(var(--brand-gold)/0.15)] bg-[hsl(var(--brand-cream))]"
      >
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:py-14">
          <div className="grid grid-cols-2 items-start gap-2.5 sm:grid-cols-3 sm:gap-3 lg:col-span-7">
            {HERO_SAREES.map((photo, index) => (
              <div
                key={photo.src}
                className={cn(
                  "relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-[hsl(var(--brand-ink)/0.08)]",
                  index === 1 && "sm:mt-10",
                  index === 2 && "hidden sm:block",
                )}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            <h1
              id="home-hero-title"
              className="font-serif text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] text-balance sm:text-[44px] lg:text-[54px]"
            >
              Hand-painted Kalamkari sarees
            </h1>
            <p className="mt-4 max-w-[40ch] text-[15px] leading-[1.7] text-[hsl(var(--brand-ink)/0.72)] sm:text-[16px]">
              Drawn with a bamboo <em>kalam</em> and natural dyes by the
              artisans of Srikalahasti.
            </p>
            <p className="mt-5 min-h-[1.5em] text-[15px] font-semibold tabular-nums">
              {primary.startingPrice !== null &&
                `${primary.total} sarees · from ${formatPrice(primary.startingPrice)}`}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={categoryHref(PRIMARY_SAREE_CATEGORY)}
                className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[hsl(var(--brand-ink))] px-8 text-[12px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-paper))] shadow-[0_2px_12px_rgba(26,21,18,0.18)] transition-colors hover:bg-[hsl(var(--brand-ink-soft))]"
              >
                Shop sarees
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={categoryHref("Pure Silk Sarees")}
                className="text-[14px] font-medium underline decoration-[hsl(var(--brand-ink)/0.3)] underline-offset-4 transition-colors hover:decoration-[hsl(var(--brand-ink))]"
              >
                Pure silk sarees
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust: the four reasons to buy here, in one line ────────── */}
      <section
        aria-label="Shopping with us"
        className="border-b border-[hsl(var(--brand-gold)/0.15)] bg-[hsl(var(--brand-paper))]"
      >
        <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-y-2.5 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {TRUST.map(({ Mark, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2.5 text-[13px] text-[hsl(var(--brand-ink)/0.75)]"
            >
              <Mark className="h-5 w-5 shrink-0 text-[hsl(var(--brand-gold-deep))]" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Fabrics: live collections, largest first ────────────────── */}
      {(loading || showcase.collections.length > 0) && (
        <section
          aria-labelledby="home-fabrics-title"
          className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16"
        >
          <h2
            id="home-fabrics-title"
            className="font-serif text-[26px] font-semibold leading-tight sm:text-[32px]"
          >
            Shop sarees by fabric
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse rounded-lg bg-[hsl(var(--brand-ink)/0.06)]"
                  />
                ))
              : showcase.collections.map((collection, index) => (
                  <Link
                    key={collection.id}
                    href={categoryHref(collection.name)}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[hsl(var(--brand-paper))] ring-1 ring-[hsl(var(--brand-ink)/0.08)]">
                      <OptimizedImage
                        src={
                          getImageTier(collection.cover.images, "medium", 0) ||
                          "/images/products/product-placeholder.png"
                        }
                        alt={collection.cover.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        imageType="productCard"
                        priority={index < 2}
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <h3 className="text-[15px] font-semibold leading-snug">
                        {collection.label}
                      </h3>
                      <span className="shrink-0 text-[13px] tabular-nums text-[hsl(var(--brand-ink)/0.55)]">
                        {collection.count} sarees
                      </span>
                    </div>
                  </Link>
                ))}
          </div>
        </section>
      )}

      {/* ── New sarees ──────────────────────────────────────────────── */}
      {(loading || showcase.newest.length > 0) && (
        <section
          aria-labelledby="home-new-title"
          className="mx-auto max-w-[1440px] px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20"
        >
          <div className="flex items-end justify-between gap-4">
            <h2
              id="home-new-title"
              className="font-serif text-[26px] font-semibold leading-tight sm:text-[32px]"
            >
              {showcase.newest.some((saree) => saree.is_featured)
                ? "Featured and new sarees"
                : "New sarees"}
            </h2>
            <Link
              href={categoryHref(PRIMARY_SAREE_CATEGORY)}
              className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-medium underline-offset-4 hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }, (_, i) => (
                  <CuratedProductCardSkeleton key={i} />
                ))
              : showcase.newest.map((product, index) => (
                  <CuratedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
          </div>
        </section>
      )}

      {/* ── Reviews: shown only once real customers have written them ── */}
      {reviews.length > 0 && (
        <section
          aria-labelledby="home-reviews-title"
          className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20"
        >
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2
              id="home-reviews-title"
              className="font-serif text-[26px] font-semibold leading-tight sm:text-[32px]"
            >
              What customers say
            </h2>
            {reviewStats && (
              <p className="inline-flex items-center gap-2 text-[14px] tabular-nums text-[hsl(var(--brand-ink)/0.7)]">
                <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                <span className="font-semibold text-[hsl(var(--brand-ink))]">
                  {reviewStats.average.toFixed(1)}
                </span>
                from {reviewStats.count}{" "}
                {reviewStats.count === 1 ? "review" : "reviews"}
              </p>
            )}
          </div>

          <ul className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {reviews.map((r: Review) => (
              <li
                key={r.id}
                className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]"
              >
                <figure className="flex h-full flex-col rounded-lg bg-[hsl(var(--brand-paper))] p-5 ring-1 ring-[hsl(var(--brand-ink)/0.08)] md:p-6">
                  <div className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
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
                  <blockquote className="mt-3 text-[15px] leading-[1.65] text-[hsl(var(--brand-ink)/0.85)]">
                    {r.content}
                  </blockquote>
                  <figcaption className="mt-auto pt-5 text-[13px]">
                    <span className="block font-semibold">{r.customer_name}</span>
                    {r.is_verified_purchase && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[hsl(var(--brand-ink)/0.55)]">
                        <BadgeCheck className="h-3.5 w-3.5 text-[hsl(var(--brand-gold-deep))]" />
                        Verified purchase
                      </span>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Custom commissions: one compact row ─────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="flex flex-col items-center gap-6 rounded-lg bg-[hsl(var(--brand-cream))] p-6 ring-1 ring-[hsl(var(--brand-gold)/0.2)] sm:p-8 md:flex-row md:gap-10">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
            <Image
              src="/images/brand-models/model-saree-12.jpeg"
              alt="A custom Kalamkari saree commission"
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-serif text-[22px] font-semibold leading-tight sm:text-[26px]">
              Want a custom design?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-[hsl(var(--brand-ink)/0.7)] sm:text-[15px]">
              Choose your fabric, motifs and colours — our artisans paint it
              for you.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2.5 sm:flex-row md:w-auto">
            <a
              href={customDesignWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[hsl(var(--brand-ink))] px-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-paper))] transition-colors hover:bg-[hsl(var(--brand-ink-soft))]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </a>
            <Link
              href="/custom-design"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[12px] font-semibold uppercase tracking-[0.14em] ring-1 ring-[hsl(var(--brand-ink)/0.3)] transition-colors hover:bg-[hsl(var(--brand-ink)/0.05)]"
            >
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
