"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { getCategories, getSubCategories } from "@/services/categories"
import { productsService } from "@/services/products"
import { getImageTier } from "@/lib/image-tiers"
import { OptimizedImage } from "@/components/shared/OptimizedImage"
import { FloralDivider } from "@/shared/ui/heritage-ornaments"
import { buildCategoryShowcase, type ShowcaseCategory } from "./category-showcase"

const SAREE_PARENTS = ["Sarees", "Pure Silk Sarees"]
const MAX_FABRICS = 8

const categoryHref = (name: string) => `/products?category=${encodeURIComponent(name)}`

// "Linen saree" reads as "Linen" under a "Saree fabrics" heading.
const fabricLabel = (name: string) => {
  const stripped = name.replace(/\s+sarees?$/i, "").trim() || name
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

export function CategoryShowcase() {
  const { data: topRows, isLoading: topLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })
  const { data: subRows, isLoading: subLoading } = useQuery({
    queryKey: ["home", "sub-categories"],
    queryFn: getSubCategories,
    staleTime: 5 * 60 * 1000,
  })
  const { data: index, isLoading: indexLoading } = useQuery({
    queryKey: ["home", "category-index"],
    queryFn: () => productsService.getVisibleCategoryIndex(),
    staleTime: 5 * 60 * 1000,
  })

  const showcase = useMemo(() => {
    if (!topRows?.data || !subRows?.data || !index) return null
    const categories: ShowcaseCategory[] = [...topRows.data, ...subRows.data].map((row) => ({
      id: row.id,
      name: row.name,
      parent_id: row.parent_id ?? null,
      image_url: row.image_url ?? null,
    }))
    const products = index.map((product) => ({
      category_id: product.category_id,
      sub_category_id: product.sub_category_id,
      image: getImageTier(product.images, "medium", 0),
      created_at: product.created_at ?? "",
    }))
    return buildCategoryShowcase(categories, products, {
      fabricParents: SAREE_PARENTS,
      minFabricCount: 3,
    })
  }, [topRows, subRows, index])

  const loading = topLoading || subLoading || indexLoading
  if (!loading && (!showcase || showcase.top.length === 0)) return null

  const fabrics = showcase?.fabrics.slice(0, MAX_FABRICS) ?? []

  return (
    <section
      aria-labelledby="shop-by-category"
      className="relative w-full bg-[hsl(var(--brand-cream))] py-14 md:py-20"
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <h2
          id="shop-by-category"
          className="text-balance text-center font-serif text-[30px] leading-tight text-[hsl(var(--brand-ink))] md:text-[42px]"
        >
          Shop by category
        </h2>
        <FloralDivider className="mt-4" />

        {/* Round category strip — scrolls sideways on phones, centred on desktop. */}
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [mask-image:linear-gradient(to_right,black_82%,transparent)] md:[mask-image:none] [scrollbar-width:none] sm:mx-0 sm:px-0 md:mt-10 md:flex-wrap md:justify-center md:gap-8 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex w-[88px] shrink-0 flex-col items-center gap-3 md:w-[120px]">
                  <span className="aspect-square w-full animate-pulse rounded-full bg-[hsl(var(--brand-paper))]" />
                  <span className="h-3 w-16 animate-pulse rounded bg-[hsl(var(--brand-paper))]" />
                </li>
              ))
            : showcase!.top.map((category) => (
                <li key={category.id} className="w-[88px] shrink-0 snap-start md:w-[120px]">
                  <Link
                    href={categoryHref(category.name)}
                    className="group flex flex-col items-center rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--brand-cream))]"
                  >
                    <span className="block aspect-square w-full rounded-full border-2 border-[hsl(var(--brand-gold))] p-[3px] transition-shadow duration-300 group-hover:shadow-[0_0_0_4px_hsl(var(--brand-gold)/0.35)]">
                      <span className="relative block h-full w-full overflow-hidden rounded-full bg-[hsl(var(--brand-paper))]">
                        {category.image && (
                          <OptimizedImage
                            src={category.image}
                            alt=""
                            fill
                            sizes="120px"
                            imageType="thumbnail"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                          />
                        )}
                      </span>
                    </span>
                    <span className="mt-2.5 block font-sans text-[13px] font-semibold leading-snug text-[hsl(var(--brand-ink))] md:text-[14px]">
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
        </ul>

        {/* Temple-arch fabric tiles for sarees, the largest part of the catalogue. */}
        {(loading || fabrics.length > 0) && (
          <div className="mt-14 md:mt-20">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-serif text-[22px] leading-tight text-[hsl(var(--brand-ink))] md:text-[28px]">
                Saree fabrics
              </h3>
              <Link
                href={categoryHref("Sarees")}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded font-sans text-[13px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] md:text-[14px]"
              >
                All sarees
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:mt-8 md:gap-x-6 lg:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                    <li key={i}>
                      <span className="block aspect-[3/4] animate-pulse rounded-b-md rounded-t-[999px] bg-[hsl(var(--brand-paper))]" />
                      <span className="mx-auto mt-3 block h-3.5 w-24 animate-pulse rounded bg-[hsl(var(--brand-paper))]" />
                    </li>
                  ))
                : fabrics.map((fabric) => (
                    <li key={fabric.name}>
                      <Link
                        href={categoryHref(fabric.name)}
                        className="group block rounded-t-[999px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(var(--brand-cream))]"
                      >
                        <span className="relative block aspect-[3/4] overflow-hidden rounded-b-md rounded-t-[999px] border border-[hsl(var(--brand-gold)/0.7)] bg-[hsl(var(--brand-paper))] shadow-[0_14px_30px_-20px_rgba(10,40,90,0.45)]">
                          {fabric.image && (
                            <OptimizedImage
                              src={fabric.image}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              imageType="productCard"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                            />
                          )}
                          {/* Inner gold line, like the double frame of a temple arch. */}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-[6px] rounded-b-[3px] rounded-t-[999px] border border-[hsl(var(--brand-gold-soft)/0.85)] transition-colors duration-300 group-hover:border-white"
                          />
                        </span>
                        <span className="mt-3 block text-center font-serif text-[17px] leading-snug text-[hsl(var(--brand-ink))] md:text-[19px]">
                          {fabricLabel(fabric.name)}
                        </span>
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
