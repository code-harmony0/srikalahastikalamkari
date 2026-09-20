// @ts-nocheck
"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useQueryClient } from "@tanstack/react-query"
import { useProducts } from "@/shared/hooks/use-products"
import { productsService } from "@/services/products"
import { useFilterCategories } from "@/shared/hooks/use-filter-categories"
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search as LucideSearch,
  LayoutGrid,
  List as ListIcon,
  X,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { ProductCard } from "./ProductCard"
import { PRICE_BANDS, type PriceBandId } from "./price-bands"
import { CategoryHero } from "./CategoryHero"
import { ProductCardCompact, ProductCardCompactSkeleton } from "./ProductCardCompact"
import Link from "next/link"
import { cn } from "@/shared/utils"
import {
  CornerFlorals,
  KalashDivider,
  TempleBellsDivider,
  TempleTowerDivider,
} from "@/shared/ui/heritage-ornaments"
import { STORE_WHATSAPP_NUMBER } from "@/shared/lib/whatsapp"
import dynamic from "next/dynamic"

const FilterSidebar = dynamic(
  () =>
    import(/* webpackChunkName: "products-filter-sidebar" */ "./FilterSidebar").then(
      (mod) => mod.FilterSidebar,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-[280px] space-y-4 p-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 bg-[hsl(var(--brand-ink)/0.06)] rounded-md animate-pulse"
          />
        ))}
      </div>
    ),
  },
)

const CUSTOM_WHATSAPP_URL = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello, I need help with a custom Srikalahasti Kalamkari design. Please share fabric, motif, price and timeline details.",
)}`

// Shared control styles (colour roles as on the home page: charcoal text,
// midnight for the main action, royal blue only for focus rings).
const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]"
const selectClass =
  "h-12 appearance-none cursor-pointer truncate rounded-full border border-[hsl(var(--brand-ink)/0.2)] bg-white pl-4 pr-9 font-sans text-[14px] text-[hsl(var(--brand-ink))] hover:border-[hsl(var(--brand-ink)/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]"
const chipClass =
  "inline-flex items-center gap-1 rounded-full border border-[hsl(var(--brand-ink)/0.2)] bg-white py-1 pl-3 pr-1 font-sans text-[13px] font-medium text-[hsl(var(--brand-ink))]"
const chipCloseClass = `flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--brand-ink-soft))] hover:bg-[hsl(var(--brand-indigo-tint))] hover:text-[hsl(var(--brand-ink))] ${focusRingClass}`
const textLinkClass = `rounded-sm px-1 font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))] ${focusRingClass}`
const primaryButtonClass =
  "inline-flex h-12 items-center justify-center rounded-full bg-[hsl(var(--brand-midnight))] px-8 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2"
const pagerEdgeClass = `flex h-10 w-10 items-center justify-center gap-1.5 rounded-full border border-[hsl(var(--brand-ink)/0.3)] bg-white font-sans text-[14px] font-medium text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint))] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white sm:h-11 sm:w-auto sm:px-4 ${focusRingClass}`

// Pagination helper: generates page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = [1]

  if (current > 3) pages.push("...")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("...")

  pages.push(total)
  return pages
}

const normalizeCategoryToken = (value: string) =>
  decodeURIComponent(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

interface ProductsPageProps {
  mode?: "shop" | "custom-design"
}

export default function ProductsPage({ mode = "shop" }: ProductsPageProps) {
  const isCustomDesignMode = mode === "custom-design"
  const searchParams = useSearchParams()

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [heroCategory, setHeroCategory] = useState<string | null>(null)
  const [priceBand, setPriceBand] = useState<PriceBandId | null>(null)
  const [sortBy, setSortBy] = useState("default")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Ensure page always starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Sync ?category= URL param once. Keep the URL stable so category links remain
  // shareable and do not lose filter state during App Router navigation.
  useEffect(() => {
    const cat = searchParams.get("category")
    if (cat) {
      setHeroCategory(decodeURIComponent(cat))
      setSelectedCategories([])
      setCurrentPage(1)
    }
    // ?search= lets the header search box hand a query straight to the grid.
    const q = searchParams.get("search")
    if (q !== null) {
      setSearchQuery(decodeURIComponent(q))
      setCurrentPage(1)
    }
    window.scrollTo(0, 0)
  }, [searchParams])

  const gridRef = useRef<HTMLDivElement>(null)

  const { categories: filterCategories, isLoading: categoriesLoading } =
    useFilterCategories()

  useEffect(() => {
    if (categoriesLoading || !filterCategories.length || !selectedCategories.length)
      return

    const resolveCategoryLabel = (selectedCategory: string) => {
      const selectedToken = normalizeCategoryToken(selectedCategory)

      for (const cat of filterCategories) {
        const catTokens = [cat.name, cat.slug]
          .filter(Boolean)
          .map((value) => normalizeCategoryToken(String(value)))

        if (catTokens.includes(selectedToken)) return cat.name

        for (const sub of cat.subcategories || []) {
          const subTokens = [sub.name, sub.slug]
            .filter(Boolean)
            .map((value) => normalizeCategoryToken(String(value)))

          if (subTokens.includes(selectedToken)) return sub.name
        }
      }

      return selectedCategory
    }

    setSelectedCategories((current) => {
      const resolved = Array.from(new Set(current.map(resolveCategoryLabel)))
      const hasChanged =
        resolved.length !== current.length ||
        resolved.some((category, index) => category !== current[index])

      return hasChanged ? resolved : current
    })
  }, [categoriesLoading, filterCategories, selectedCategories.length])

  // Resolve category IDs from selected names for the API
  // Must search both parent categories AND subcategories
  const categoryIds = useMemo(() => {
    // When heroCategory is selected, ONLY use heroCategory. Otherwise use sidebar selection.
    const allSelected = heroCategory ? [heroCategory] : selectedCategories
    if (allSelected.length === 0) return undefined
    if (categoriesLoading || !filterCategories.length)
      return ["00000000-0000-0000-0000-000000000000"]
    const selectedTokens = new Set(
      allSelected.map((category) => normalizeCategoryToken(category)),
    )
    const matchedIds: string[] = []

    const matchesSelectedCategory = (item: any) => {
      const tokens = [item.name, item.slug]
        .filter(Boolean)
        .map((value) => normalizeCategoryToken(String(value)))

      return tokens.some((token) => selectedTokens.has(token))
    }

    for (const cat of filterCategories) {
      if (matchesSelectedCategory(cat)) matchedIds.push(cat.id)
      for (const sub of cat.subcategories || []) {
        if (matchesSelectedCategory(sub)) matchedIds.push(sub.id)
      }
    }

    return matchedIds.length > 0
      ? matchedIds
      : ["00000000-0000-0000-0000-000000000000"]
  }, [heroCategory, selectedCategories, filterCategories, categoriesLoading])

  const selectedBand = PRICE_BANDS.find((band) => band.id === priceBand)

  // Prepare filters for React Query
  const filters = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      category_id:
        categoryIds && categoryIds.length > 0 ? categoryIds : undefined,
      // Price is only constrained once a band is chosen. Every request used to
      // send price_max 50,000, which hid anything priced above it.
      price_min: selectedBand?.min,
      price_max: selectedBand?.max,
      out_of_stock: undefined,
      is_custom_design: isCustomDesignMode ? true : false,
      is_visible: true,
      sort_by: sortBy,
    }),
    [
      currentPage,
      itemsPerPage,
      searchQuery,
      categoryIds,
      selectedBand,
      sortBy,
      isCustomDesignMode,
    ],
  )

  // Use Server-Side Pagination
  const { data: queryData, isLoading, isFetching, isPlaceholderData } = useProducts(filters)
  const products = queryData?.data || []
  const totalCount = queryData?.count || 0

  const customAvailableFilters = useMemo(() => {
    if (!isCustomDesignMode) {
      return {
        categoryNames: undefined,
        subCategoryNames: undefined,
        subCategoryNamesByCategory: undefined,
      }
    }

    const categoryNames = new Set<string>()
    const subCategoryNames = new Set<string>()
    const subCategoryNamesByCategory = new Map<string, Set<string>>()

    for (const product of products) {
      const categoryName = product.categoryName
      const subCategoryName = product.subCategoryName

      if (categoryName) categoryNames.add(categoryName)
      if (subCategoryName) subCategoryNames.add(subCategoryName)
      if (categoryName && subCategoryName) {
        const categorySubcategories =
          subCategoryNamesByCategory.get(categoryName) || new Set<string>()
        categorySubcategories.add(subCategoryName)
        subCategoryNamesByCategory.set(categoryName, categorySubcategories)
      }
    }

    return { categoryNames, subCategoryNames, subCategoryNamesByCategory }
  }, [isCustomDesignMode, products])

  useEffect(() => {
    if (!isCustomDesignMode || isLoading) return

    setSelectedCategories((current) => {
      const filtered = current.filter((categoryName) => {
        if (customAvailableFilters.categoryNames?.has(categoryName)) return true

        for (const subCategories of customAvailableFilters.subCategoryNamesByCategory?.values() ||
          []) {
          if (subCategories.has(categoryName)) return true
        }

        return false
      })

      return filtered.length === current.length ? current : filtered
    })
  }, [
    customAvailableFilters,
    isLoading,
    isCustomDesignMode,
  ])

  // Optimize: Prefetch next page
  const queryClient = useQueryClient()

  useEffect(() => {
    // While a new filter loads, totalCount is still the old filter's count, so
    // skip until the real one arrives or we would ask for a page that is not there.
    if (isPlaceholderData) return
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      const nextFilters = { ...filters, page: currentPage + 1 }
      queryClient.prefetchQuery({
        queryKey: ["products", nextFilters],
        queryFn: () => productsService.getPaginated(nextFilters),
      })
    }
  }, [filters, currentPage, totalCount, itemsPerPage, isPlaceholderData, queryClient])

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    selectedCategories,
    heroCategory,
    priceBand,
    sortBy,
    itemsPerPage,
  ])

  // Scroll to top on page change
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedCategories([])
    setHeroCategory(null)
    setPriceBand(null)
    setCurrentPage(1)
  }, [])

  const getActiveFiltersCount = () => {
    let count = 0
    if (heroCategory) count++
    if (searchQuery) count++
    if (selectedCategories.length > 0) count += selectedCategories.length
    if (priceBand) count++
    return count
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  const handleHeroCategoryChange = useCallback((cat: string | null) => {
    setHeroCategory(cat)
    setSelectedCategories([]) // Clear sidebar filters when top hero category is selected!
    setCurrentPage(1)
  }, [])

  const handleSidebarCategoriesChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories)
    if (categories.length > 0) {
      setHeroCategory(null) // Clear hero category when sidebar filters are chosen!
    }
    setCurrentPage(1)
  }, [])

  // Filter bar props shared between mobile and desktop sidebar
  const filterProps = {
    selectedCategories,
    setSelectedCategories: handleSidebarCategoriesChange,
    heroCategory,
    setHeroCategory: handleHeroCategoryChange,
    priceBand,
    setPriceBand,
    clearFilters: clearAllFilters,
    availableCategoryNames: customAvailableFilters.categoryNames,
    availableSubCategoryNames: customAvailableFilters.subCategoryNames,
    availableSubCategoryNamesByCategory:
      customAvailableFilters.subCategoryNamesByCategory,
    restrictToAvailableFilters: isCustomDesignMode,
    availableFiltersLoading: isCustomDesignMode && isLoading,
  }

  const heroCopy = isCustomDesignMode
    ? {
        title: "Custom design gallery",
        description:
          "Designs we can paint for you. Open any piece to see it closely, or send it to us on WhatsApp.",
      }
    : {
        title: "Shop Kalamkari",
        description: "Hand-painted Sarees, Dupattas and Fabrics from Srikalahasti.",
      }

  const firstShown = Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)
  const lastShown = Math.min(currentPage * itemsPerPage, totalCount)
  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-4"
      : "grid grid-cols-1 gap-6 max-w-4xl mx-auto"

  return (
    <div className="w-full min-h-screen bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))] overflow-hidden">
      {/* Shop opens with round category photos; custom design keeps the plain band */}
      {!isCustomDesignMode ? (
        <CategoryHero
          categories={filterCategories}
          isLoading={categoriesLoading}
          heroCategory={heroCategory}
          setHeroCategory={handleHeroCategoryChange}
        />
      ) : (
        <section className="relative overflow-hidden bg-[hsl(var(--brand-indigo-tint))]">
          <CornerFlorals className="absolute left-2 top-3 h-14 w-14 opacity-70 md:left-4 md:h-24 md:w-24" />
          <CornerFlorals
            className={cn(
              "absolute bottom-3 right-2 h-14 w-14 rotate-180 opacity-70 md:right-4 md:h-24 md:w-24",
              !isCustomDesignMode && "hidden lg:block",
            )}
          />
          <div className="relative mx-auto max-w-2xl px-6 py-10 text-center md:py-14">
            <h1 className="text-balance font-serif text-[32px] leading-tight text-[hsl(var(--brand-ink))] md:text-[46px]">
              {heroCopy.title}
            </h1>
            <TempleTowerDivider className="mt-3" />
            <p className="mx-auto mt-3 max-w-xl text-pretty font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))] md:text-[16px]">
              {heroCopy.description}
            </p>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="relative min-h-screen">
        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-[hsl(var(--brand-ink)/0.5)] z-[100] lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                role="dialog"
                aria-modal="true"
                aria-label="Filters"
                className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white z-[110] lg:hidden shadow-2xl overflow-y-auto scrollbar-hide border-r border-[hsl(var(--brand-gold)/0.45)]"
              >
                <FilterSidebar
                  {...filterProps}
                  showMobile={true}
                  onCloseMobile={() => setShowFilters(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div
          ref={gridRef}
          className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 py-5 md:py-12 relative z-10 scroll-mt-24"
          id="product-grid-start"
        >
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-[272px] flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar {...filterProps} />
              </div>
            </aside>

            {/* Main Product Area */}
            <main className="min-w-0 flex-1">
              {/* Toolbar */}
              <div className="mb-5 border-b border-[hsl(var(--brand-gold)/0.45)] pb-4 md:mb-10 md:pb-5">
                {/* Chosen filters */}
                {hasActiveFilters && (
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {heroCategory && (
                      <span className={chipClass}>
                        {heroCategory}
                        <button
                          type="button"
                          onClick={() => setHeroCategory(null)}
                          aria-label={`Remove ${heroCategory}`}
                          className={chipCloseClass}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className={chipClass}>
                        &ldquo;{searchQuery}&rdquo;
                        <button type="button" onClick={() => setSearchQuery("")} aria-label="Remove search" className={chipCloseClass}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    {selectedCategories.map((cat) => (
                      <span key={cat} className={chipClass}>
                        {cat}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategories(selectedCategories.filter((c) => c !== cat))
                          }
                          aria-label={`Remove ${cat}`}
                          className={chipCloseClass}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    {selectedBand && (
                      <span className={cn(chipClass, "tabular-nums")}>
                        {selectedBand.label}
                        <button type="button" onClick={() => setPriceBand(null)} aria-label="Remove price filter" className={chipCloseClass}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    <button type="button" onClick={clearAllFilters} className={cn(textLinkClass, "ml-1 h-9")}>
                      Clear all
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search sits with the grid controls so it is reachable without opening the filter drawer */}
                  <div className="relative w-full md:w-auto md:min-w-[240px] md:max-w-[420px] md:flex-1">
                    <LucideSearch
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[hsl(var(--brand-ink-soft))]"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      placeholder="Search products"
                      aria-label="Search products"
                      className="h-12 w-full rounded-full border border-[hsl(var(--brand-ink)/0.2)] bg-white pl-11 pr-11 font-sans text-[15px] text-[hsl(var(--brand-ink))] placeholder:text-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-ink)/0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("")
                          setCurrentPage(1)
                        }}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[hsl(var(--brand-ink-soft))] hover:bg-[hsl(var(--brand-indigo-tint))] hover:text-[hsl(var(--brand-ink))] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex h-12 w-[calc(50%-6px)] min-w-0 md:w-auto items-center justify-center gap-2 rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white px-5 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]"
                  >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--brand-midnight))] px-1.5 text-[12px] font-semibold tracking-normal text-white tabular-nums">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </button>

                  <div className="order-last w-full md:order-none md:mr-auto md:w-auto" aria-hidden="true" />

                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center gap-1 rounded-full border border-[hsl(var(--brand-ink)/0.2)] bg-white p-1">
                    {[
                      { mode: "grid" as const, label: "Grid view", Icon: LayoutGrid },
                      { mode: "list" as const, label: "List view", Icon: ListIcon },
                    ].map(({ mode: m, label, Icon }) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setViewMode(m)}
                        aria-pressed={viewMode === m}
                        aria-label={label}
                        title={label}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]",
                          viewMode === m
                            ? "bg-[hsl(var(--brand-midnight))] text-white"
                            : "text-[hsl(var(--brand-ink-soft))] hover:bg-[hsl(var(--brand-indigo-tint))] hover:text-[hsl(var(--brand-ink))]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>

                  {/* Items per page */}
                  <div className="relative hidden xl:block">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      aria-label="Items per page"
                      className={cn(selectClass, "w-[148px]")}
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={48}>48 per page</option>
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--brand-ink-soft))]" />
                  </div>

                  {/* Sort */}
                  <div className="relative w-[calc(50%-6px)] min-w-0 md:w-[210px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort"
                      className={cn(selectClass, "w-full")}
                    >
                      <option value="default">Recommended</option>
                      <option value="latest">Newest</option>
                      <option value="price-asc">Lowest price</option>
                      <option value="price-desc">Highest price</option>
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--brand-ink-soft))]" />
                  </div>
                </div>
              </div>

              {/* Product Grid / List */}
              {isLoading ? (
                <div className={gridClass}>
                  {[...Array(itemsPerPage)].map((_, i) =>
                    viewMode === "grid" ? (
                      <ProductCardCompactSkeleton key={i} />
                    ) : (
                      <div
                        key={i}
                        className="h-[180px] rounded-sm bg-[hsl(var(--brand-ink)/0.06)] animate-pulse"
                      />
                    ),
                  )}
                </div>
              ) : products.length > 0 ? (
                <>
                  <motion.div layout className={gridClass}>
                    <AnimatePresence mode="popLayout">
                      {products.map((product: any, index: number) =>
                        viewMode === "grid" ? (
                          <ProductCardCompact
                            key={product.id}
                            product={product}
                            index={index}
                            priority={index < 8}
                            actionMode={isCustomDesignMode ? "whatsapp-inquiry" : "commerce"}
                          />
                        ) : (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            viewMode="list"
                            priority={index < 8}
                            actionMode={isCustomDesignMode ? "whatsapp-inquiry" : "commerce"}
                          />
                        ),
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Pagination */}
                  <nav
                    aria-label="Pages"
                    className="mt-12 flex flex-col items-center gap-4 border-t border-[hsl(var(--brand-gold)/0.45)] pt-6 sm:flex-row sm:justify-between md:mt-16"
                  >
                    <p className="font-sans text-[14px] text-[hsl(var(--brand-ink-soft))] tabular-nums">
                      Showing {firstShown}–{lastShown} of {totalCount} items
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => goToPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1 || isFetching}
                          aria-label="Previous page"
                          className={pagerEdgeClass}
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pNum = i + 1
                            if (totalPages > 5) {
                              if (currentPage <= 3) {
                                pNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pNum = totalPages - 4 + i
                              } else {
                                pNum = currentPage - 2 + i
                              }
                            }
                            if (pNum > totalPages) return null

                            const current = currentPage === pNum
                            return (
                              <button
                                key={pNum}
                                type="button"
                                onClick={() => goToPage(pNum)}
                                disabled={isFetching}
                                aria-current={current ? "page" : undefined}
                                aria-label={`Page ${pNum}`}
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full font-sans text-[14px] tabular-nums transition-colors sm:h-11 sm:w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]",
                                  current
                                    ? "bg-[hsl(var(--brand-midnight))] font-semibold text-white"
                                    : "text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-indigo-tint))]",
                                )}
                              >
                                {pNum}
                              </button>
                            )
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage >= totalPages || isFetching}
                          aria-label="Next page"
                          className={pagerEdgeClass}
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </nav>
                </>
              ) : (
                /* Empty State */
                <div className="mx-auto max-w-xl rounded-sm border border-[hsl(var(--brand-gold)/0.55)] bg-white px-6 py-14 text-center">
                  <h2 className="text-balance font-serif text-[26px] leading-tight text-[hsl(var(--brand-ink))] md:text-[30px]">
                    {hasActiveFilters ? "No products match these filters" : "No products to show right now"}
                  </h2>
                  <TempleBellsDivider className="mt-3" />
                  <p className="mx-auto mt-4 max-w-sm font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
                    {hasActiveFilters
                      ? "Try another category or price, or clear the filters to see everything."
                      : "Please check again soon, or message us on WhatsApp."}
                  </p>
                  {hasActiveFilters ? (
                    <button type="button" onClick={clearAllFilters} className={cn(primaryButtonClass, "mt-8")}>
                      Clear filters
                    </button>
                  ) : (
                    <a
                      href={CUSTOM_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#1DA851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
                    >
                      <FaWhatsapp className="h-[15px] w-[15px] text-white" aria-hidden="true" />
                      Message on WhatsApp
                    </a>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Closing band (shop only): custom work, same words as the home page */}
      {!isCustomDesignMode && (
        <section aria-labelledby="shop-custom" className="relative overflow-hidden bg-[hsl(var(--brand-turmeric-tint))]">
          <CornerFlorals className="absolute left-2 top-3 h-16 w-16 opacity-70 md:left-4 md:h-24 md:w-24" />
          <CornerFlorals className="absolute bottom-3 right-2 h-16 w-16 rotate-180 opacity-70 md:right-4 md:h-24 md:w-24" />
          <div className="relative mx-auto max-w-2xl px-8 py-14 text-center md:py-20">
            <h2 id="shop-custom" className="text-balance font-serif text-[28px] leading-tight text-[hsl(var(--brand-ink))] md:text-[40px]">
              Want something made just for you?
            </h2>
            <KalashDivider className="mt-3" />
            <p className="mx-auto mt-4 max-w-lg text-pretty font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))] md:text-[16px]">
              We make custom designs for everything we paint: sarees, dupattas, fabrics, men&apos;s wear and more. Send us your
              idea, colours or a photo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={CUSTOM_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#1DA851] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:w-auto"
              >
                <FaWhatsapp className="h-[15px] w-[15px] text-white" aria-hidden="true" />
                Message on WhatsApp
              </a>
              <Link
                href="/custom-design"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white px-7 font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--brand-ink))] transition-colors duration-300 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2 sm:w-auto"
              >
                See custom designs
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
