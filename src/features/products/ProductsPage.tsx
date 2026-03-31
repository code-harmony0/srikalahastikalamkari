// @ts-nocheck
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/shared/hooks/use-products";
import { productsService } from "@/services/products";
import { useFilterCategories } from "@/shared/hooks/use-filter-categories";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search as LucideSearch,
  LayoutGrid,
  List as ListIcon,
  X,
} from "lucide-react";
import { ProductCard } from "./ProductCard";
import {
  ProductCardCompact,
  ProductCardCompactSkeleton,
} from "./ProductCardCompact";
import dynamic from "next/dynamic";

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
  }
);

// Pagination helper: generates page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Sync ?category= URL param once, then remove it so returning to the page
  // or re-renders don't force the category back if the user deselected it.
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategories([decodeURIComponent(cat)]);
      setCurrentPage(1);
      // Consume the param — strip it from the URL so it won't re-apply
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const gridRef = useRef<HTMLDivElement>(null);
  
  const { categories: filterCategories, isLoading: categoriesLoading } = useFilterCategories();

  // Resolve category IDs from selected names for the API
  // Must search both parent categories AND subcategories
  const categoryIds = useMemo(() => {
     if (selectedCategories.length === 0) return undefined;
     // Categories still loading — defer; don't show all products yet
     if (categoriesLoading || !filterCategories.length) return ["00000000-0000-0000-0000-000000000000"];
     const selectedNames = new Set(selectedCategories);
     const matchedIds: string[] = [];

     for (const cat of filterCategories) {
       if (selectedNames.has(cat.name)) matchedIds.push(cat.id);
       for (const sub of cat.subcategories || []) {
         if (selectedNames.has(sub.name)) matchedIds.push(sub.id);
       }
     }

     // No DB match for the selected category — return impossible ID so 0 results show
     // instead of falling through to show all products
     return matchedIds.length > 0 ? matchedIds : ["00000000-0000-0000-0000-000000000000"];
  }, [selectedCategories, filterCategories, categoriesLoading]);


  // Prepare filters for React Query
  const filters = useMemo(() => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      category_id: (categoryIds && categoryIds.length > 0) ? categoryIds : undefined,
      price_min: priceRange[0],
      price_max: priceRange[1],
      in_stock: inStockOnly || undefined,
      sort_by: sortBy
  }), [currentPage, itemsPerPage, searchQuery, categoryIds, priceRange, inStockOnly, sortBy]);

  // Use Server-Side Pagination
  const { data: queryData, isLoading, isFetching } = useProducts(filters);
  const products = queryData?.data || [];
  const totalCount = queryData?.count || 0;

  // Optimize: Prefetch next page
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      const nextFilters = { ...filters, page: currentPage + 1 };
      queryClient.prefetchQuery({
        queryKey: ["products", nextFilters],
        queryFn: () => productsService.getPaginated(nextFilters),
      });
    }
  }, [filters, currentPage, totalCount, itemsPerPage, queryClient]);
  
  // Compute product counts for sidebar (client side approximation or separate API)
  // Since we are paginating, we can't count purely on client. 
  // For now, we'll retain the old logic if we had all products, but since we don't, 
  // we might pass empty counts or fetch counts separately. 
  // For this step, we'll pass empty object or implement a reliable count later.
  const productCounts = {}; 

  
  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, priceRange, sortBy, inStockOnly, itemsPerPage]);

  // Scroll to top on page change
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setInStockOnly(false);
    setCurrentPage(1);
  }, []);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (priceRange[0] > 0 || priceRange[1] < 50000) count++;
    if (inStockOnly) count++;
    return count;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Filter bar props shared between mobile and desktop sidebar
  const filterProps = {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange: (range: [number, number]) => setPriceRange(range),
    inStockOnly,
    setInStockOnly,
    clearFilters: clearAllFilters,
    productCounts,
    totalProducts: totalCount,
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Hero Overview */}
      <section className="relative w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFF4E8] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#C19A5B 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-[1100px] mx-auto px-6 relative z-10 text-center pt-20 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="font-sans text-[12px] font-medium tracking-[0.25em] uppercase text-[#C19A5B] mb-2 leading-none">
              Heritage Collective
            </span>
            <h1 className="font-playfair text-[3rem] text-[#3B2C23] font-bold leading-tight mb-2.5">
              The Artisan's{" "}
              <span className="italic text-[#A4552A]">Gallery</span>
            </h1>
            <p className="font-sans text-[15px] text-[#3B2C23]/70 max-w-[700px] leading-relaxed mb-5">
              Hand-painted sarees and textiles crafted with five centuries of
              Srikalahasti tradition.
            </p>

            <motion.button
              onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="group flex flex-col items-center gap-3 mt-4"
            >
              <span className="text-[11px] font-semibold text-[#C19A5B] tracking-[0.2em] uppercase transition-colors duration-500 group-hover:text-[#A4552A] leading-none">
                Explore Collection
              </span>
              <div className="relative w-[1px] h-12 overflow-hidden">
                <div className="absolute inset-0 bg-[#C19A5B]/30 group-hover:bg-[#A4552A]/30 transition-colors duration-500" />
                <motion.div
                  animate={{
                    y: [-48, 48],
                    backgroundColor: ["#C19A5B", "#C19A5B", "#A4552A"],
                  }}
                  transition={{
                    y: { duration: 2.5, repeat: Infinity, ease: "linear" },
                    backgroundColor: { duration: 0.5 },
                  }}
                  className="absolute top-0 left-0 w-full h-1/2 bg-[#C19A5B] transition-colors duration-500 group-hover:bg-[#A4552A]"
                />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative bg-[#FFF8F0]/30 min-h-screen">
        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-[#3B2C23]/40 backdrop-blur-sm z-[100] lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-[#FFF8F0] z-[110] lg:hidden shadow-2xl overflow-y-auto scrollbar-hide"
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
          className="max-w-[120rem] mx-auto px-6 md:px-10 py-12 relative z-10"
          id="product-grid-start"
        >
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 w-full">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="sticky top-6">
                <FilterSidebar {...filterProps} />
              </div>
            </aside>

            {/* Main Product Area */}
            <main className="flex-1">
              {/* Toolbar Row */}
              <div className="flex flex-col gap-4 mb-6 border-b border-[#C19A5B]/10 pb-5">
                {/* Applied Filters Summary Bar */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-3 flex-wrap lg:hidden">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A4552A]/10 text-[#A4552A] text-[10px] font-semibold">
                          &ldquo;{searchQuery}&rdquo;
                          <button onClick={() => setSearchQuery("")}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C19A5B]/15 text-[#3B2C23] text-[10px] font-semibold"
                        >
                          {cat}
                          <button
                            onClick={() =>
                              setSelectedCategories(
                                selectedCategories.filter((c) => c !== cat)
                              )
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C19A5B]/15 text-[#3B2C23] text-[10px] font-semibold">
                          Price filtered
                          <button onClick={() => setPriceRange([0, 50000])}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {inStockOnly && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold">
                          In Stock
                          <button onClick={() => setInStockOnly(false)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-[10px] font-semibold text-[#A4552A] hover:text-[#8B3F20] uppercase tracking-wider whitespace-nowrap"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Left: Counts & Mobile Filter */}
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-xl border border-[#C19A5B]/30 text-[11px] font-bold tracking-[0.15em] uppercase text-[#3B2C23] bg-white hover:bg-[#FFF4E8] transition-all shadow-sm"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#A4552A]" />
                      Filters
                      {getActiveFiltersCount() > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#A4552A] text-white text-[9px] font-bold">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </button>

                  </div>

                  {/* Right: Sort, View Toggle, Items per page */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-[#C19A5B]/20">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === "grid"
                            ? "bg-[#FFF4E8] text-[#A4552A] shadow-sm"
                            : "text-[#3B2C23]/40 hover:bg-gray-50"
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-all ${
                          viewMode === "list"
                            ? "bg-[#FFF4E8] text-[#A4552A] shadow-sm"
                            : "text-[#3B2C23]/40 hover:bg-gray-50"
                        }`}
                        title="List View"
                      >
                        <ListIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Items per page */}
                    <div className="relative hidden sm:block">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-[#C19A5B]/20 bg-white text-[11px] font-bold text-[#3B2C23] uppercase tracking-wider focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/30 cursor-pointer shadow-sm"
                      >
                        <option value={12}>12 / page</option>
                        <option value={24}>24 / page</option>
                        <option value={48}>48 / page</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#C19A5B] pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative w-full sm:w-[180px]">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-[#C19A5B]/20 bg-white text-[11px] font-bold text-[#3B2C23] uppercase tracking-wider focus:outline-none focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/30 transition-all cursor-pointer shadow-sm"
                      >
                        <option value="default">Sort: Recommended</option>
                        <option value="latest">Sort: Newest</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C19A5B] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Grid / List */}
              {isLoading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                      : "grid grid-cols-1 gap-6 max-w-4xl mx-auto"
                  }
                >
                  {[...Array(itemsPerPage)].map((_, i) =>
                    viewMode === "grid" ? (
                      <ProductCardCompactSkeleton key={i} />
                    ) : (
                      <div
                        key={i}
                        className="bg-white h-[180px] rounded-xl animate-pulse border border-[#C19A5B]/10 shadow-sm"
                      />
                    )
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
                        ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                        : "grid grid-cols-1 gap-6 max-w-4xl mx-auto"
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {products.map((product: any, index: number) =>
                        viewMode === "grid" ? (
                          <ProductCardCompact
                            key={product.id}
                            product={product}
                            index={index % itemsPerPage}
                          />
                        ) : (
                          <ProductCard
                            key={product.id}
                            product={product}
                            index={index % itemsPerPage}
                            viewMode="list"
                          />
                        )
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Pagination Footer - Dashboard Style */}
                  <div className="mt-12 px-6 py-4 border-t border-[#C19A5B]/10 bg-[#FFF8F0]/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-[#3B2C23]/60">
                      Showing <span className="font-semibold text-[#A4552A]">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}-{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-semibold text-[#3B2C23]">{totalCount}</span> products
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isFetching}
                        className="h-8 px-4 text-xs font-medium rounded-lg border border-[#C19A5B]/20 bg-white text-[#3B2C23] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFF4E8] hover:border-[#C19A5B] transition-all"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pNum = i + 1;
                          if (totalPages > 5) {
                            if (currentPage <= 3) {
                              pNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pNum = totalPages - 4 + i;
                            } else {
                              pNum = currentPage - 2 + i;
                            }
                          }
                          if (pNum > totalPages) return null;
                          
                          return (
                            <button
                              key={pNum}
                              onClick={() => goToPage(pNum)}
                              disabled={isFetching}
                              className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                                currentPage === pNum 
                                  ? 'bg-[#A4552A] text-white shadow-md shadow-[#A4552A]/20' 
                                  : 'text-[#3B2C23]/60 hover:bg-[#FFF4E8] hover:text-[#A4552A]'
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages || isFetching}
                        className="h-8 px-4 text-xs font-medium rounded-lg border border-[#C19A5B]/20 bg-white text-[#3B2C23] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FFF4E8] hover:border-[#C19A5B] transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 bg-white rounded-2xl border border-[#C19A5B]/10 shadow-sm"
                >
                  <div className="max-w-md mx-auto px-6">
                    <div className="w-16 h-16 bg-[#FFF8F0] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C19A5B]/10">
                      <LucideSearch className="w-6 h-6 text-[#C19A5B]" />
                    </div>
                    <h3 className="font-playfair text-xl text-[#3B2C23] font-bold mb-3 italic">
                      No masterpieces found
                    </h3>
                    <p className="font-sans text-[#3B2C23]/60 mb-8 leading-relaxed text-[14px]">
                      Our curators couldn't find artifacts matching these
                      refinements.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-8 py-3 bg-[#A4552A] text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#8B3F20] transition-all"
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
  );
}

