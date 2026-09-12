"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { useFilterCategories } from "@/shared/hooks/use-filter-categories";
import { cn } from "@/shared/utils";
import { PRICE_BANDS, type PriceBandId } from "./price-bands";

// A customer found the old filter too complicated: each category opened a
// second popup inside the drawer, price had a slider, min/max boxes and presets
// for one choice, and an "in stock" toggle removed nothing because everything
// is in stock. Now: categories with inline types, and a single price choice.

interface FilterSidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  priceBand: PriceBandId | null;
  setPriceBand: (band: PriceBandId | null) => void;
  clearFilters: () => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
  resultCount?: number;
  availableCategoryNames?: Set<string>;
  availableSubCategoryNames?: Set<string>;
  availableSubCategoryNamesByCategory?: Map<string, Set<string>>;
  restrictToAvailableFilters?: boolean;
  availableFiltersLoading?: boolean;
}

function ChoiceRow({
  label,
  checked,
  onClick,
  radio = false,
  indent = false,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  radio?: boolean;
  indent?: boolean;
}) {
  return (
    <button
      type="button"
      role={radio ? "radio" : "checkbox"}
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md py-2 pr-2 text-left text-[14px] text-[hsl(var(--brand-ink)/0.85)] hover:bg-[hsl(var(--brand-ink)/0.03)]",
        indent ? "pl-7" : "pl-1",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center ring-1 ring-inset transition-colors",
          radio ? "rounded-full" : "rounded-[4px]",
          checked
            ? "bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-paper))] ring-[hsl(var(--brand-ink))]"
            : "bg-[hsl(var(--brand-paper))] ring-[hsl(var(--brand-ink)/0.3)]",
        )}
      >
        {checked &&
          (radio ? (
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-paper))]" />
          ) : (
            <Check className="h-3 w-3" strokeWidth={3} />
          ))}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
    </button>
  );
}

const FilterSidebar = ({
  selectedCategories,
  setSelectedCategories,
  priceBand,
  setPriceBand,
  clearFilters,
  showMobile = false,
  onCloseMobile,
  resultCount,
  availableCategoryNames,
  availableSubCategoryNames,
  availableSubCategoryNamesByCategory,
  restrictToAvailableFilters = false,
  availableFiltersLoading = false,
}: FilterSidebarProps) => {
  const { categories, isLoading, error } = useFilterCategories();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) =>
    setSelectedCategories(
      selectedCategories.includes(name)
        ? selectedCategories.filter((c) => c !== name)
        : [...selectedCategories, name],
    );

  const hasActiveFilters = selectedCategories.length > 0 || priceBand !== null;

  // Custom-design mode only offers categories that have custom pieces.
  const visibleCategories = useMemo(() => {
    const restrict =
      restrictToAvailableFilters ||
      availableCategoryNames !== undefined ||
      availableSubCategoryNames !== undefined ||
      availableSubCategoryNamesByCategory !== undefined;
    if (!restrict) return categories;
    if (availableFiltersLoading) return [];

    return categories
      .map((category: any) => {
        const namesForCategory = availableSubCategoryNamesByCategory?.get(category.name);
        const subcategories = (category.subcategories || []).filter((sub: any) =>
          namesForCategory
            ? namesForCategory.has(sub.name)
            : availableSubCategoryNames?.has(sub.name),
        );
        if (!availableCategoryNames?.has(category.name) && subcategories.length === 0) {
          return null;
        }
        return { ...category, subcategories };
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

  const loadingCategories = isLoading || availableFiltersLoading;

  return (
    <aside
      className={cn(
        "bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]",
        showMobile
          ? "flex min-h-full flex-col px-5 pt-5"
          : "rounded-lg p-5 ring-1 ring-[hsl(var(--brand-ink)/0.08)]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold">Filters</h2>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-2 text-[13px] font-medium underline underline-offset-4"
            >
              Clear all
            </button>
          )}
          {showMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close filters"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--brand-ink)/0.05)]"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        <section className="mt-5 border-t border-[hsl(var(--brand-ink)/0.1)] pt-5">
          <h3 className="text-[13px] font-semibold">Category</h3>
          <div className="mt-2">
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
              <p className="py-2 text-[13px] text-[hsl(var(--brand-madder))]">
                Categories could not be loaded.
              </p>
            )}
            {!loadingCategories && !error && visibleCategories.length === 0 && (
              <p className="py-2 text-[13px] text-[hsl(var(--brand-ink)/0.6)]">
                No categories available right now.
              </p>
            )}
            {!loadingCategories &&
              !error &&
              visibleCategories.map((category: any) => {
                const subcategories = category.subcategories || [];
                const subSelected = subcategories.some((sub: any) =>
                  selectedCategories.includes(sub.name),
                );
                const open = expanded[category.id] ?? subSelected;

                return (
                  <div key={category.id}>
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <ChoiceRow
                          label={category.name}
                          checked={selectedCategories.includes(category.name)}
                          onClick={() => toggleCategory(category.name)}
                        />
                      </div>
                      {subcategories.length > 0 && (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={`${open ? "Hide" : "Show"} types of ${category.name}`}
                          onClick={() =>
                            setExpanded((current) => ({ ...current, [category.id]: !open }))
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[hsl(var(--brand-ink)/0.55)] hover:bg-[hsl(var(--brand-ink)/0.04)]"
                        >
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                          />
                        </button>
                      )}
                    </div>
                    {open &&
                      subcategories.map((sub: any) => (
                        <ChoiceRow
                          key={sub.id ?? sub.name}
                          indent
                          label={sub.name}
                          checked={selectedCategories.includes(sub.name)}
                          onClick={() => toggleCategory(sub.name)}
                        />
                      ))}
                  </div>
                );
              })}
          </div>
        </section>

        <section className="mt-5 border-t border-[hsl(var(--brand-ink)/0.1)] pt-5">
          <h3 id="price-filter-label" className="text-[13px] font-semibold">
            Price
          </h3>
          <div role="radiogroup" aria-labelledby="price-filter-label" className="mt-2">
            {PRICE_BANDS.map((band) => (
              <ChoiceRow
                key={band.id}
                radio
                label={band.label}
                checked={priceBand === band.id}
                onClick={() => setPriceBand(priceBand === band.id ? null : band.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {showMobile && (
        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-[hsl(var(--brand-ink)/0.1)] bg-[hsl(var(--brand-paper))] px-5 py-4">
          <button
            type="button"
            onClick={onCloseMobile}
            className="h-12 w-full rounded-full bg-[hsl(var(--brand-ink))] text-[12px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-paper))]"
          >
            {resultCount !== undefined
              ? `Show ${resultCount} ${resultCount === 1 ? "result" : "results"}`
              : "Show results"}
          </button>
        </div>
      )}
    </aside>
  );
};

export { FilterSidebar };
