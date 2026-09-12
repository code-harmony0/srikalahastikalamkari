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
import { ProductCard } from "./ProductCard"
import { PRICE_BANDS, type PriceBandId } from "./price-bands"
import { ProductCardCompact, ProductCardCompactSkeleton } from "./ProductCardCompact"
import { PageHero } from "@/components/layout/PageHero"
import dynamic from "next/dynamic"

const FilterSidebar = dynamic(
  () => import("./FilterSidebar").then((mod) => mod.FilterSidebar),
  {
    ssr: false,
    loading: () => (
      <div className="w-[280px] space-y-4 p-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-10 bg-[#C19A5B]/10 rounded-lg animate-pulse"
          />
        ))}
      </div>
    ),
  },
)

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
      setSelectedCategories([decodeURIComponent(cat)])
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
    if (selectedCategories.length === 0) return undefined
    // Categories still loading — defer; don't show all products yet
    if (categoriesLoading || !filterCategories.length)
      return ["00000000-0000-0000-0000-000000000000"]
    const selectedTokens = new Set(
      selectedCategories.map((category) => normalizeCategoryToken(category)),
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

    // No DB match for the selected category — return impossible ID so 0 results show
    // instead of falling through to show all products
    return matchedIds.length > 0
      ? matchedIds
      : ["00000000-0000-0000-0000-000000000000"]
  }, [selectedCategories, filterCategories, categoriesLoading])

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
  const { data: queryData, isLoading, isFetching } = useProducts(filters)
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
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      const nextFilters = { ...filters, page: currentPage + 1 }
      queryClient.prefetchQuery({
        queryKey: ["products", nextFilters],
        queryFn: () => productsService.getPaginated(nextFilters),
      })
    }
  }, [filters, currentPage, totalCount, itemsPerPage, queryClient])

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    selectedCategories,
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
    setPriceBand(null)
    setCurrentPage(1)
  }, [])

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (selectedCategories.length > 0) count += selectedCategories.length
    if (priceBand) count++
    return count
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  // Filter bar props shared between mobile and desktop sidebar
  const filterProps = {
    selectedCategories,
    setSelectedCategories,
    priceBand,
    setPriceBand,
    clearFilters: clearAllFilters,
    availableCategoryNames: customAvailableFilters.categoryNames,
    availableSubCategoryNames: customAvailableFilters.subCategoryNames,
    availableSubCategoryNamesByCategory:
      customAvailableFilters.subCategoryNamesByCategory,
    restrictToAvailableFilters: isCustomDesignMode,
    availableFiltersLoading: isCustomDesignMode && isLoading,
    resultCount: totalCount,
  }

  const heroCopy = isCustomDesignMode
    ? {
        titleStart: "Custom",
        titleAccent: "design",
        titleEnd: "gallery",
        description:
          "Browse Kalamkari designs available for custom requests. Open any piece for details or send the exact design to our team on WhatsApp.",
        scrollLabel: "View Designs",
      }
    : {
        titleStart: "Shop",
        titleAccent: "Kalamkari",
        titleEnd: "",
        description:
          "Hand-painted sarees, dupattas and fabrics from Srikalahasti.",
        scrollLabel: "Explore Collection",
      }

  return (
    <div className="w-full min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512] overflow-hidden">
      {/* Hero Overview */}
      {/* Signature Hero Overview */}
      <PageHero
        titleStart={heroCopy.titleStart}
        titleAccent={heroCopy.titleAccent}
        titleEnd={heroCopy.titleEnd}
        description={heroCopy.description}
      />

      {/* Main Content */}
      <div className="relative bg-transparent min-h-screen">
        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-[#1A1512]/60 backdrop-blur-sm z-[100] lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white z-[110] lg:hidden shadow-2xl overflow-y-auto scrollbar-hide border-r border-[#C19A5B]/20"
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
          className="max-w-[120rem] mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-12 relative z-10"
          id="product-grid-start"
        >
          <div className="flex flex-col md:flex-row gap-8 sm:gap-12 lg:gap-16 w-full">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="sticky top-6">
                <FilterSidebar {...filterProps} />
              </div>
            </aside>

            {/* Main Product Area */}
            <main className="flex-1">
              {/* Toolbar Row */}
              <div className="flex flex-col gap-3 sm:gap-4 mb-5 sm:mb-6 border-b border-[#C19A5B]/10 pb-4 sm:pb-5">
                {/* Applied Filters Summary Bar */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:hidden">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[12.5px] font-medium">
                          &ldquo;{searchQuery}&rdquo;
                          <button onClick={() => setSearchQuery("")} className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[12.5px] font-medium"
                        >
                          {cat}
                          <button
                            onClick={() =>
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== cat),
                              )
                            }
                            className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {selectedBand && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[12.5px] font-medium">
                          {selectedBand.label}
                          <button onClick={() => setPriceBand(null)} aria-label="Remove price filter" className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-[10px] sm:text-[10px] font-bold text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] uppercase tracking-[0.16em] sm:tracking-widest whitespace-nowrap transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
 
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                  {/* Left: Counts & Mobile Filter */}
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden flex-1 sm:flex-none flex min-h-[44px] items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-[#C19A5B]/30 text-[10px] sm:text-[10px] font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase text-[#1A1512] bg-white/90 hover:bg-[#1A1512] hover:text-[#C19A5B] hover:border-transparent transition-all duration-300 shadow-sm"
                    >
                      <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--brand-gold-deep))]" />
                      Filters
                      {getActiveFiltersCount() > 0 && (
                        <span className="w-4.5 h-4.5 flex items-center justify-center rounded-full bg-[#1A1512] text-[#C19A5B] text-[11px] font-bold px-1.5">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </button>
                  </div>
 
                  {/* Right: Search, Sort, View Toggle, Items per page */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:flex-1 justify-end">
                    {/* Search - sits with the grid controls so it is reachable
                        without opening the filter drawer */}
                    <div className="relative order-first w-full sm:order-none sm:flex-1 sm:min-w-[240px] sm:max-w-[520px] sm:mr-auto">
                      <LucideSearch
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[hsl(var(--brand-gold-deep))]"
                      />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        placeholder="Search sarees, dupattas, fabrics..."
                        aria-label="Search products"
                        className="h-12 w-full rounded-lg border border-[#C19A5B]/25 bg-white pl-11 pr-10 text-[15px] text-[#1A1512] shadow-sm placeholder:text-[#1A1512]/40 focus:border-[#C19A5B] focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/25"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("")
                            setCurrentPage(1)
                          }}
                          aria-label="Clear search"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#1A1512]/40 hover:bg-[#1A1512]/5 hover:text-[#1A1512] transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center gap-1 bg-white/90 p-1 rounded-lg border border-[#C19A5B]/20 shadow-sm">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === "grid"
                            ? "bg-[#1A1512] text-[#C19A5B] shadow-sm"
                            : "text-[#1A1512]/40 hover:bg-[#C19A5B]/10 hover:text-[hsl(var(--brand-gold-deep))]"
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === "list"
                            ? "bg-[#1A1512] text-[#C19A5B] shadow-sm"
                            : "text-[#1A1512]/40 hover:bg-[#C19A5B]/10 hover:text-[hsl(var(--brand-gold-deep))]"
                        }`}
                        title="List View"
                      >
                        <ListIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
 
                    {/* Items per page */}
                    <div className="relative hidden sm:block">
                      <select
                        value={itemsPerPage}
                        onChange={(e) =>
                          setItemsPerPage(Number(e.target.value))
                        }
                        className="appearance-none min-h-[44px] pl-3 pr-8 py-2.5 rounded-lg border border-[#C19A5B]/20 bg-white text-[11px] font-bold text-[#3B2C23] uppercase tracking-wider focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/30 cursor-pointer shadow-sm"
                      >
                        <option value={12}>12 / page</option>
                        <option value={24}>24 / page</option>
                        <option value={48}>48 / page</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--brand-gold-deep))] pointer-events-none" />
                    </div>
 
                    {/* Sort */}
                    <div className="relative w-full sm:w-[190px]">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none min-h-[44px] pl-3 sm:pl-4 pr-9 sm:pr-10 py-2.5 rounded-lg border border-[#C19A5B]/20 bg-white/90 backdrop-blur-sm text-[10px] sm:text-[10px] font-bold text-[#1A1512] uppercase tracking-[0.12em] sm:tracking-wider focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/20 hover:border-[#C19A5B]/40 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="default">Sort: Recommended</option>
                        <option value="latest">Sort: Newest</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--brand-gold-deep))] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid / List */}
              {isLoading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
                      : "grid grid-cols-1 gap-6 max-w-4xl mx-auto"
                  }
                >
                  {[...Array(itemsPerPage)].map((_, i) =>
                    viewMode === "grid" ? (
                      <ProductCardCompactSkeleton key={i} />
                    ) : (
                      <div
                        key={i}
                        className="bg-white/80 backdrop-blur-sm h-[180px] rounded-xl animate-pulse border border-[#C19A5B]/10 shadow-sm"
                      />
                    ),
                  )}
                </div>
              ) : products.length > 0 ? (
                <>
                  <motion.div
                    layout
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.03 },
                      },
                    }}
                    initial="hidden"
                    animate="visible"
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
                        : "grid grid-cols-1 gap-6 max-w-4xl mx-auto"
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {products.map((product: any, index: number) =>
                        viewMode === "grid" ? (
                          <ProductCardCompact
                            key={product.id}
                            product={product}
                            index={index}
                            priority={index < 8}
                            actionMode={
                              isCustomDesignMode
                                ? "whatsapp-inquiry"
                                : "commerce"
                            }
                          />
                        ) : (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            viewMode="list"
                            priority={index < 8}
                            actionMode={
                              isCustomDesignMode
                                ? "whatsapp-inquiry"
                                : "commerce"
                            }
                          />
                        ),
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Pagination Footer - Dashboard Style */}
                  <div className="mt-8 sm:mt-12 px-4 sm:px-6 py-3 sm:py-4 border-t border-[#C19A5B]/10 bg-[#1A1512]/5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm text-[#1A1512]/60">
                      Showing{" "}
                      <span className="font-semibold text-[hsl(var(--brand-gold-deep))]">
                        {Math.min(
                          (currentPage - 1) * itemsPerPage + 1,
                          totalCount,
                        )}
                        -{Math.min(currentPage * itemsPerPage, totalCount)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-[#1A1512]">
                        {totalCount}
                      </span>{" "}
                      products
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isFetching}
                        className="flex items-center gap-1 h-11 sm:h-9 px-3 sm:px-4 text-[10px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-widest border border-[#C19A5B]/30 bg-white/40 text-[#1A1512] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A1512] hover:text-[#C19A5B] hover:border-transparent transition-all duration-300"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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

                            return (
                              <button
                                key={pNum}
                                onClick={() => goToPage(pNum)}
                                disabled={isFetching}
                                className={`h-11 w-11 sm:h-9 sm:w-9 rounded-lg text-xs font-medium transition-colors ${
                                  currentPage === pNum
                                    ? "bg-[#C19A5B] text-white shadow-md shadow-[#C19A5B]/20"
                                    : "text-[#1A1512]/60 hover:bg-[#C19A5B]/10 hover:text-[hsl(var(--brand-gold-deep))]"
                                }`}
                              >
                                {pNum}
                              </button>
                            )
                          },
                        )}
                      </div>
                      <button
                        onClick={() =>
                          goToPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage >= totalPages || isFetching}
                        className="flex items-center gap-1 h-11 sm:h-9 px-3 sm:px-4 text-[10px] sm:text-[10px] font-bold uppercase tracking-[0.14em] sm:tracking-widest border border-[#C19A5B]/30 bg-white/40 text-[#1A1512] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A1512] hover:text-[#C19A5B] hover:border-transparent transition-all duration-300"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative text-center py-20 bg-white/40 backdrop-blur-sm rounded-xl border border-[#C19A5B]/20 shadow-sm overflow-hidden"
                >
                  {/* Decorative corners */}
                  <div className="absolute inset-3 pointer-events-none border border-[#C19A5B]/10">
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t border-l border-[#C19A5B]/40" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t border-r border-[#C19A5B]/40" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b border-l border-[#C19A5B]/40" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b border-r border-[#C19A5B]/40" />
                  </div>
                  
                  <div className="max-w-md mx-auto px-6 relative z-10">
                    <div className="w-16 h-16 bg-[#1A1512]/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C19A5B]/25">
                      <LucideSearch className="w-6 h-6 text-[hsl(var(--brand-gold-deep))]" />
                    </div>
                    <h3 className="font-serif text-2xl text-[#1A1512] font-semibold mb-3 tracking-wide">
                      No masterpieces found
                    </h3>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#C19A5B] to-transparent mx-auto mb-4" />
                    <p className="font-sans text-[#1A1512]/60 mb-8 leading-relaxed text-[13px] font-light max-w-sm mx-auto">
                      Our curators couldn't find any Srikalahasti Kalamkari artwork matching these precise refinements.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-8 py-3 bg-[#1A1512] text-white border border-[#C19A5B]/30 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#C19A5B] hover:text-white transition-all duration-300 shadow-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
