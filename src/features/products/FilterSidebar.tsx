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
        className="flex items-center justify-between w-full py-3.5 group"
      >
        <div className="flex items-center gap-2">
          <h3 className="uppercase text-[11px] tracking-[0.15em] font-semibold text-[#C19A5B] group-hover:text-[#A4552A] transition-colors">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="text-[9px] font-bold bg-[#A4552A] text-white w-4 h-4 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-[#C19A5B]" />
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
            <div className="pb-4">{children}</div>
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

  return (
    <motion.aside
      ref={sidebarRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-gradient-to-b from-[#FFF8F0] to-[#FFF5E7] shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-[#C19A5B]/20 rounded-2xl hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] transition-all overflow-y-auto scrollbar-hide"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#FFF8F0] to-transparent px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#A4552A]/10 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-[#A4552A]" />
            </div>
            <div>
              <h2 className="text-[16px] font-serif font-bold text-[#3B2C23] leading-tight">
                Filters
              </h2>

            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-semibold text-[#A4552A] hover:text-[#8B3F20] uppercase tracking-wider transition-colors"
              >
                Clear all
              </button>
            )}
            {showMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg hover:bg-[#C19A5B]/10 lg:hidden transition-colors"
                aria-label="Close filters"
              >
                <X className="w-4 h-4 text-[#3B2C23]" />
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
            className="px-5 pb-3 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A4552A]/10 text-[#A4552A] text-[10px] font-semibold">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="hover:text-[#8B3F20]">
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
                  <button onClick={() => toggleCategory(cat)} className="hover:text-[#A4552A]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C19A5B]/15 text-[#3B2C23] text-[10px] font-semibold">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <button
                    onClick={() => setPriceRange([0, 50000])}
                    className="hover:text-[#A4552A]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold">
                  In Stock
                  <button onClick={() => setInStockOnly(false)} className="hover:text-green-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Sections */}
      <div className="px-5 pb-5">
        {/* Search */}
        <FilterSection title="Search" defaultOpen={true}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C19A5B]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-[13px] bg-white border border-[#C19A5B]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A5B]/30 focus:border-[#C19A5B]/40 text-[#3B2C23] placeholder:text-[#3B2C23]/35 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B2C23]/40 hover:text-[#A4552A] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </FilterSection>

        {/* Categories - List with Popup */}
        <FilterSection
          title="Categories"
          defaultOpen={true}
          count={selectedCategories.length}
        >
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-[#C19A5B]/10 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
          {error && (
            <div className="text-[12px] text-red-500/80 py-2">Failed to load categories</div>
          )}
          {!isLoading && !error && categories.length > 0 && (
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#C19A5B]/20">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.name); // Parent selected
                // Check if any subcategory of this parent is selected
                const hasSubSelected = category.subcategories?.some((sub: any) => selectedCategories.includes(sub.name)); 
                const count = productCounts[category.id] || 0;
                
                return (
                  <div key={category.id}>
                    <button
                      onClick={() => setPopupCategory(category)}
                      className={`
                        flex items-center justify-between w-full p-2.5 rounded-lg transition-all group/cat
                        ${isSelected || hasSubSelected ? "bg-[#FFF4E8] border border-[#C19A5B]/30" : "hover:bg-[#FFF4E8]/50 border border-transparent"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                         {/* Thumbnail if available, or icon */}
                         <div className="w-8 h-8 rounded-md bg-[#C19A5B]/10 flex items-center justify-center overflow-hidden">
                            {category.image_url ? (
                                <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-4 h-4 text-[#C19A5B]" />
                            )}
                         </div>
                         <div className="text-left">
                             <span className={`block text-[13px] font-medium leading-tight ${isSelected || hasSubSelected ? "text-[#A4552A]" : "text-[#3B2C23]"}`}>
                                 {category.name}
                             </span>
                             {hasSubSelected && (
                                <span className="text-[10px] text-[#A4552A]/80">Filter active</span>
                             )}
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#C19A5B]/60" />
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
          <div className="space-y-4">
            {/* Price Display */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white border border-[#C19A5B]/20 rounded-lg px-3 py-2 text-center">
                <span className="text-[11px] text-[#3B2C23]/50 block leading-none mb-0.5">Min</span>
                <span className="text-[13px] font-bold text-[#A4552A]">
                  {formatPrice(priceRange[0])}
                </span>
              </div>
              <div className="w-4 h-px bg-[#C19A5B]/30" />
              <div className="flex-1 bg-white border border-[#C19A5B]/20 rounded-lg px-3 py-2 text-center">
                <span className="text-[11px] text-[#3B2C23]/50 block leading-none mb-0.5">Max</span>
                <span className="text-[13px] font-bold text-[#A4552A]">
                  {formatPrice(priceRange[1])}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="px-1">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={50000}
                step={500}
                className="[&>div:first-child]:h-1.5 [&>div:first-child]:bg-[#C19A5B]/20 [&>div:first-child]:cursor-pointer [&>div:first-child>div]:bg-[#A4552A]"
              />
            </div>

            {/* Quick Price Presets */}
            <div className="flex flex-wrap gap-1.5">
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
                    onClick={() => setPriceRange(preset.range)}
                    className={`
                      px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all
                      ${
                        isActive
                          ? "bg-[#A4552A] text-white shadow-sm"
                          : "bg-white border border-[#C19A5B]/20 text-[#3B2C23]/70 hover:border-[#A4552A]/40 hover:text-[#A4552A]"
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
        <FilterSection title="Availability" defaultOpen={true}>
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`
              flex items-center gap-3 w-full py-2.5 px-3 rounded-xl transition-all
              ${inStockOnly ? "bg-green-50 border border-green-200" : "bg-white border border-[#C19A5B]/15 hover:border-[#C19A5B]/30"}
            `}
          >
            {/* Toggle */}
            <div
              className={`
                relative w-9 h-5 rounded-full transition-colors flex-shrink-0
                ${inStockOnly ? "bg-green-500" : "bg-[#C19A5B]/25"}
              `}
            >
              <motion.div
                animate={{ x: inStockOnly ? 16 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Package
                className={`w-4 h-4 ${inStockOnly ? "text-green-600" : "text-[#3B2C23]/40"}`}
              />
              <span
                className={`text-[13px] font-medium ${
                  inStockOnly ? "text-green-700" : "text-[#3B2C23]/70"
                }`}
              >
                In Stock Only
              </span>
            </div>
          </button>
        </FilterSection>

        {/* Mobile Apply Button */}
        {showMobile && (
          <div className="pt-4 mt-2">
            <button
              onClick={onCloseMobile}
              className="w-full h-11 bg-[#A4552A] text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#8B3F20] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              Show Results
              {activeFilterCount > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  {activeFilterCount} active
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
