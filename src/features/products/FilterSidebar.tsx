"use client";

import { useMemo, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { useFilterCategories, type Category } from "@/shared/hooks/use-filter-categories";
import { cn } from "@/shared/utils";
import { PRICE_BANDS, type PriceBandId } from "./price-bands";
import { CategoryPickerDialog } from "./CategoryPickerDialog";

interface FilterSidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  heroCategory?: string | null;
  setHeroCategory?: (cat: string | null) => void;
  priceBand: PriceBandId | null;
  setPriceBand: (band: PriceBandId | null) => void;
  clearFilters: () => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
  availableCategoryNames?: Set<string>;
  availableSubCategoryNames?: Set<string>;
  availableSubCategoryNamesByCategory?: Map<string, Set<string>>;
  restrictToAvailableFilters?: boolean;
  availableFiltersLoading?: boolean;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]";

/* ─── Price radio row (only used for price bands) ─── */
function PriceRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "flex min-h-[40px] w-full items-center gap-3 rounded-md py-2 pl-1.5 pr-2 text-left font-sans text-[14px] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint)/0.7)]",
        focusRing,
        checked && "font-medium",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors",
          checked
            ? "bg-[hsl(var(--brand-midnight))] text-white ring-[hsl(var(--brand-midnight))]"
            : "bg-white ring-[hsl(var(--brand-ink)/0.4)]",
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
    </button>
  );
}

/* ─── Main FilterSidebar ─── */
const FilterSidebar = ({
  selectedCategories,
  setSelectedCategories,
  heroCategory,
  setHeroCategory,
  priceBand,
  setPriceBand,
  clearFilters,
  showMobile = false,
  onCloseMobile,
  availableCategoryNames,
  availableSubCategoryNames,
  availableSubCategoryNamesByCategory,
  restrictToAvailableFilters = false,
  availableFiltersLoading = false,
}: FilterSidebarProps) => {
  const { categories, isLoading, error } = useFilterCategories();
  const [pickerCategoryId, setPickerCategoryId] = useState<string | null>(null);

  const toggleCategory = (name: string) =>
    setSelectedCategories(
      selectedCategories.includes(name)
        ? selectedCategories.filter((c) => c !== name)
        : [...selectedCategories, name],
    );

  const hasActiveFilters =
    Boolean(heroCategory) || selectedCategories.length > 0 || priceBand !== null;

  // Custom-design mode only offers categories that have custom pieces.
  const visibleCategories = useMemo((): Category[] => {
    const restrict =
      restrictToAvailableFilters ||
      availableCategoryNames !== undefined ||
      availableSubCategoryNames !== undefined ||
      availableSubCategoryNamesByCategory !== undefined;
    if (!restrict) return categories;
    if (availableFiltersLoading) return [];

    return categories
      .map((category) => {
        const namesForCategory = availableSubCategoryNamesByCategory?.get(category.name);
        const subcategories = category.subcategories.filter((sub) =>
          namesForCategory
            ? namesForCategory.has(sub.name)
            : availableSubCategoryNames?.has(sub.name),
        );
        if (!availableCategoryNames?.has(category.name) && subcategories.length === 0) {
          return null;
        }
        return { ...category, subcategories };
      })
      .filter((category): category is Category => category !== null);
  }, [
    availableCategoryNames,
    availableFiltersLoading,
    availableSubCategoryNames,
    availableSubCategoryNamesByCategory,
    categories,
    restrictToAvailableFilters,
  ]);

  const loadingCategories = isLoading || availableFiltersLoading;
  const sectionClass = "mt-5 border-t border-[hsl(var(--brand-gold)/0.45)] pt-5";
  const sectionTitleClass = "font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))]";

  return (
    <aside
      className={cn(
        "bg-white text-[hsl(var(--brand-ink))]",
        showMobile
          ? "flex min-h-full flex-col px-5 pt-5"
          : "rounded-sm border border-[hsl(var(--brand-gold)/0.55)] p-5",
      )}
    >
      <div className="flex min-h-[36px] items-center justify-between gap-3">
        <h2 className="font-serif text-[22px] leading-none text-[hsl(var(--brand-ink))]">Filters</h2>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                "h-9 rounded-sm px-2 font-sans text-[14px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))]",
                focusRing,
              )}
            >
              Clear all
            </button>
          )}
          {showMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close filters"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-indigo-tint))]",
                focusRing,
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        <section className={sectionClass}>
          <h3 className={sectionTitleClass}>Category</h3>
          <div className="mt-2 space-y-0.5">
            {loadingCategories && (
              <div className="space-y-2 py-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-7 animate-pulse rounded-md bg-[hsl(var(--brand-ink)/0.06)]"
                  />
                ))}
              </div>
            )}
            {!loadingCategories && error && (
              <p className="py-2 font-sans text-[14px] text-[hsl(var(--brand-madder))]">
                Categories could not be loaded.
              </p>
            )}
            {!loadingCategories && !error && visibleCategories.length === 0 && (
              <p className="py-2 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                No categories available right now.
              </p>
            )}
            {!loadingCategories &&
              !error &&
              visibleCategories.map((category) => {
                const subcategories = category.subcategories;
                const hasSubs = subcategories.length > 0;
                const chosen = Array.from(
                  new Set([category.name, ...subcategories.map((sub) => sub.name)]),
                ).filter((name) => selectedCategories.includes(name));
                const isActive = chosen.length > 0;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      if (hasSubs) {
                        setPickerCategoryId(category.id);
                      } else {
                        toggleCategory(category.name);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-sans text-[14px] transition-colors",
                      isActive
                        ? "bg-[hsl(var(--brand-indigo-tint))] font-semibold text-[hsl(var(--brand-midnight))]"
                        : "text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-indigo-tint)/0.5)]",
                      focusRing,
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block">{category.name}</span>
                      {hasSubs && isActive && (
                        <span className="mt-0.5 block text-[13px] font-normal leading-snug text-[hsl(var(--brand-ink-soft))]">
                          {chosen.map((name) => (name === category.name ? "All" : name)).join(", ")}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--brand-midnight))] px-1 text-[11px] font-semibold text-white tabular-nums">
                        {chosen.length}
                      </span>
                    )}
                    {hasSubs && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--brand-ink-soft))]" />
                    )}
                  </button>
                );
              })}
          </div>
        </section>

        <section className={sectionClass}>
          <h3 id="price-filter-label" className={sectionTitleClass}>
            Price
          </h3>
          <div role="radiogroup" aria-labelledby="price-filter-label" className="mt-2 tabular-nums">
            {PRICE_BANDS.map((band) => (
              <PriceRow
                key={band.id}
                label={band.label}
                checked={priceBand === band.id}
                onClick={() => setPriceBand(priceBand === band.id ? null : band.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {showMobile && (
        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-[hsl(var(--brand-gold)/0.45)] bg-white px-5 py-4">
          <button
            type="button"
            onClick={onCloseMobile}
            className={cn(
              "h-12 w-full rounded-full bg-[hsl(var(--brand-midnight))] font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white tabular-nums transition-colors hover:bg-[hsl(var(--brand-midnight-hover))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2",
            )}
          >
            Show results
          </button>
        </div>
      )}

      <CategoryPickerDialog
        category={visibleCategories.find((category) => category.id === pickerCategoryId) ?? null}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        onClose={() => setPickerCategoryId(null)}
      />
    </aside>
  );
};

export { FilterSidebar };
