"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/shared/ui/slider";
import { useFilterCategories } from "@/shared/hooks/use-filter-categories";
import { SubCategoryPopup } from "./SubCategoryPopup";

interface FilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  clearFilters: () => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
  productCounts?: Record<string, number>;
  totalProducts?: number;
  hideAvailabilityFilter?: boolean;
  availableCategoryNames?: Set<string>;
  availableSubCategoryNames?: Set<string>;
  availableSubCategoryNamesByCategory?: Map<string, Set<string>>;
  restrictToAvailableFilters?: boolean;
  availableFiltersLoading?: boolean;
}

// Collapsible section wrapper
function FilterSection({
  title,
  defaultOpen = true,
  children,
  count,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#C19A5B]/15 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 sm:py-3.5 group"
      >
        <div className="flex items-center gap-2">
          <h3 className="uppercase text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.15em] font-semibold text-[hsl(var(--brand-gold-deep))] group-hover:text-[#1A1512] transition-colors">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="text-[10px] sm:text-[10px] font-bold bg-[#1A1512] text-white w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--brand-gold-deep))]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-3.5 sm:pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  clearFilters,
  showMobile = false,
  onCloseMobile,
  productCounts = {},
  totalProducts = 0,
  hideAvailabilityFilter = false,
  availableCategoryNames,
  availableSubCategoryNames,
  availableSubCategoryNamesByCategory,
  restrictToAvailableFilters = false,
  availableFiltersLoading = false,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [popupCategory, setPopupCategory] = useState<any | null>(null);
  const { categories, isLoading, error } = useFilterCategories();

  const formatPrice = useCallback((value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const toggleCategory = useCallback(
    (categoryName: string) => {
      setSelectedCategories(
        selectedCategories.includes(categoryName)
          ? selectedCategories.filter((c) => c !== categoryName)
          : [...selectedCategories, categoryName]
      );
    },
    [selectedCategories, setSelectedCategories]
  );

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000 ||
    inStockOnly;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategories.length > 0) count += selectedCategories.length;
    if (priceRange[0] > 0 || priceRange[1] < 50000) count++;
    if (inStockOnly) count++;
    return count;
  }, [searchQuery, selectedCategories, priceRange, inStockOnly]);

  const visibleCategories = useMemo(() => {
    const shouldRestrictFilters =
      restrictToAvailableFilters ||
      availableCategoryNames !== undefined ||
      availableSubCategoryNames !== undefined ||
      availableSubCategoryNamesByCategory !== undefined;

    if (!shouldRestrictFilters) return categories;
    if (availableFiltersLoading) return [];

    return categories
      .map((category) => {
        const categorySubcategoryNames =
          availableSubCategoryNamesByCategory?.get(category.name);
        const visibleSubcategories = (category.subcategories || []).filter(
          (sub: any) =>
            categorySubcategoryNames
              ? categorySubcategoryNames.has(sub.name)
              : availableSubCategoryNames?.has(sub.name),
        );
        const hasParentProducts = availableCategoryNames?.has(category.name);

        if (!hasParentProducts && visibleSubcategories.length === 0) return null;

        return {
          ...category,
          subcategories: visibleSubcategories,
        };
      })
      .filter(Boolean);
  }, [
    availableCategoryNames,
    availableFiltersLoading,
    availableSubCategoryNames,
    availableSubCategoryNamesByCategory,
    categories,
    restrictToAvailableFilters,
  ]);

  return (
    <motion.aside
      ref={sidebarRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white/80 backdrop-blur-md border border-[#C19A5B]/20 rounded-lg sm:rounded-xl shadow-sm overflow-y-auto scrollbar-hide"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-[#C19A5B]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#C19A5B]/10 flex items-center justify-center border border-[#C19A5B]/20">
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(var(--brand-gold-deep))]" />
            </div>
            <div>
              <h2 className="text-[13px] sm:text-[15px] font-serif font-bold text-[#1A1512] leading-tight uppercase tracking-wider">
                Filters
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] sm:text-[10px] font-bold text-[#1A1512]/60 hover:text-[hsl(var(--brand-gold-deep))] uppercase tracking-widest transition-colors"
              >
                Clear all
              </button>
            )}
            {showMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg hover:bg-[#C19A5B]/10 lg:hidden transition-colors border border-transparent hover:border-[#C19A5B]/20"
                aria-label="Close filters"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1A1512]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 sm:px-5 pt-3 pb-1 overflow-hidden border-b border-[#C19A5B]/10 bg-[#1A1512]/5"
          >
            <div className="flex flex-wrap gap-1.5">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[10px] sm:text-[10px] font-semibold">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors">
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </span>
              )}
              {selectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[10px] sm:text-[10px] font-semibold"
                >
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors">
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </span>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[10px] sm:text-[10px] font-semibold">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <button
                    onClick={() => setPriceRange([0, 50000])}
                    className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors"
                  >
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#C19A5B]/10 border border-[#C19A5B]/20 text-[#1A1512] text-[10px] sm:text-[10px] font-semibold">
                  In Stock
                  <button onClick={() => setInStockOnly(false)} className="text-[hsl(var(--brand-gold-deep))] hover:text-[#1A1512] transition-colors">
                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Sections */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 divide-y divide-[#C19A5B]/10">
        {/* Categories - List with Popup */}
        <FilterSection
          title="Categories"
          defaultOpen={true}
          count={selectedCategories.length}
        >
          {(isLoading || availableFiltersLoading) && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-7 sm:h-8 bg-[#C19A5B]/10 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {error && (
            <div className="text-[11px] sm:text-[12px] text-red-500/80 py-2">Failed to load categories</div>
          )}
          {!isLoading && !availableFiltersLoading && !error && visibleCategories.length === 0 && (
            <div className="rounded-lg border border-[#D3B37A]/25 bg-[#FDFCFA] px-3 py-4 text-[12px] leading-relaxed text-[#1A1512]/60">
              No matching custom categories are available right now.
            </div>
          )}
          {!isLoading && !availableFiltersLoading && !error && visibleCategories.length > 0 && (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#C19A5B]/20">
              {visibleCategories.map((category: any) => {
                const isSelected = selectedCategories.includes(category.name); // Parent selected
                // Check if any subcategory of this parent is selected
                const hasSubSelected = category.subcategories?.some((sub: any) => selectedCategories.includes(sub.name)); 
                
                return (
                  <div key={category.id}>
                    <button
                      onClick={() => setPopupCategory(category)}
                      className={`
                        flex items-center justify-between w-full p-2 sm:p-2.5 rounded-lg transition-all group/cat border
                        ${isSelected || hasSubSelected 
                          ? "bg-[#C19A5B]/5 border-[#C19A5B]/40 shadow-sm" 
                          : "hover:bg-[#C19A5B]/5 bg-[#1A1512]/5 border-[#C19A5B]/10"}
                      `}
                    >
                      <div className="text-left flex items-center gap-2">
                        {(isSelected || hasSubSelected) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C19A5B] shrink-0 animate-pulse" />
                        )}
                        <div>
                          <span className={`block text-[10.5px] sm:text-[12px] uppercase tracking-wider font-semibold leading-tight ${isSelected || hasSubSelected ? "text-[#1A1512]" : "text-[#1A1512]/80"}`}>
                            {category.name}
                          </span>
                          {hasSubSelected && (
                            <span className="text-[10px] sm:text-[10px] text-[hsl(var(--brand-gold-deep))] italic font-light">subset filtered</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[hsl(var(--brand-gold-deep))]/60 group-hover/cat:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </FilterSection>

        {/* SubCategory Popup */}
        <SubCategoryPopup 
            isOpen={!!popupCategory}
            onClose={() => setPopupCategory(null)}
            parentCategory={popupCategory}
            onSelectSubCategory={() => {}} 
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
        />

        {/* Price Range */}
        <FilterSection title="Price Range" defaultOpen={true}>
          <div className="space-y-3.5 sm:space-y-4">
            {/* Price Display */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 bg-[#1A1512]/5 border border-[#C19A5B]/20 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-center">
                <span className="text-[10px] sm:text-[10px] text-[#1A1512]/50 block leading-none mb-0.5 uppercase tracking-wider">Min</span>
                <span className="text-[11px] sm:text-[13px] font-bold text-[#1A1512]">
                  {formatPrice(priceRange[0])}
                </span>
              </div>
              <div className="w-4 h-px bg-[#C19A5B]/30" />
              <div className="flex-1 bg-[#1A1512]/5 border border-[#C19A5B]/20 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-center">
                <span className="text-[10px] sm:text-[10px] text-[#1A1512]/50 block leading-none mb-0.5 uppercase tracking-wider">Max</span>
                <span className="text-[11px] sm:text-[13px] font-bold text-[hsl(var(--brand-gold-deep))]">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="px-1 py-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={50000}
                step={500}
                className="[&>div:first-child]:h-1 [&>div:first-child]:bg-[#C19A5B]/20 [&>div:first-child]:cursor-pointer [&>div:first-child>div]:bg-[#C19A5B]"
              />
            </div>

            {/* Quick Price Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Under 2K", range: [0, 2000] as [number, number] },
                { label: "2K - 5K", range: [2000, 5000] as [number, number] },
                { label: "5K - 10K", range: [5000, 10000] as [number, number] },
                { label: "10K+", range: [10000, 50000] as [number, number] },
              ].map((preset) => {
                const isActive =
                  priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1];
                return (
                  <button
                    key={preset.label}
                    onClick={() => setPriceRange(isActive ? [0, 50000] : preset.range)}
                    className={`
                      px-2 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-[10px] font-bold uppercase tracking-wider transition-all border
                      ${
                        isActive
                          ? "bg-[#1A1512] text-[#C19A5B] border-[#C19A5B]/30 shadow-sm"
                          : "bg-[#1A1512]/5 border-[#C19A5B]/20 text-[#1A1512]/70 hover:bg-[#C19A5B]/10 hover:text-[#1A1512] hover:border-[#C19A5B]/40"
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        {!hideAvailabilityFilter && (
          <div className="py-3.5 sm:py-4">
            <h3 className="uppercase text-[10px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.2em] font-bold text-[hsl(var(--brand-gold-deep))] mb-2 sm:mb-2.5">
              Availability
            </h3>
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`
                flex items-center gap-2.5 sm:gap-3 w-full py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-lg transition-all border
                ${inStockOnly 
                  ? "bg-[#C19A5B]/5 border-[#C19A5B]/40 shadow-sm" 
                  : "bg-[#1A1512]/5 border-[#C19A5B]/20 hover:border-[#C19A5B]/40"}
              `}
            >
              {/* Toggle */}
              <div
                className={`
                  relative w-8 h-[18px] sm:w-9 sm:h-5 rounded-full transition-colors flex-shrink-0 p-0.5
                  ${inStockOnly ? "bg-[#1A1512]" : "bg-[#C19A5B]/20"}
                `}
              >
                <motion.div
                  animate={{ x: inStockOnly ? 14 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm ${inStockOnly ? "bg-[#C19A5B]" : "bg-white"}`}
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <Package
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inStockOnly ? "text-[hsl(var(--brand-gold-deep))]" : "text-[#1A1512]/40"}`}
                />
                <span
                  className={`text-[10.5px] sm:text-[12px] uppercase tracking-wider font-semibold ${
                    inStockOnly ? "text-[#1A1512]" : "text-[#1A1512]/60"
                  }`}
                >
                  In Stock Only
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Mobile Apply Button */}
        {showMobile && (
          <div className="pt-4 sm:pt-5 mt-2">
            <button
              onClick={onCloseMobile}
              className="w-full h-10 sm:h-11 bg-[#1A1512] text-[#C19A5B] border border-[#C19A5B]/30 rounded-lg text-[10px] sm:text-[10px] font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] hover:bg-[#C19A5B] hover:text-white transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(var(--brand-gold-deep))]" />
              <span>Show Results</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#C19A5B]/20 border border-[#C19A5B]/40 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export { FilterSidebar };
