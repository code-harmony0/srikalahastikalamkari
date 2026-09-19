"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { productsService } from "@/services/products";
import { getImageTier } from "@/lib/image-tiers";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { type Category } from "@/shared/hooks/use-filter-categories";
import {
  buildCategoryPhotos,
  type CategoryPhoto,
} from "@/features/home/category-showcase";
import { toggleCategoryChoice } from "./CategoryPickerDialog";
import { cn } from "@/shared/utils";

interface CategoryHeroProps {
  categories: Category[];
  isLoading: boolean;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
}

interface CircleProps {
  label: string;
  image?: string | null;
  active: boolean;
  size: "large" | "small";
  onSelect: () => void;
  children?: React.ReactNode;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-4";

// Same look as the home page category circles: gold frame, real product photo.
function CategoryCircle({
  label,
  image,
  active,
  size,
  onSelect,
  children,
}: CircleProps) {
  const large = size === "large";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col items-center rounded-lg text-center",
        focusRing,
        large
          ? "focus-visible:ring-offset-[hsl(var(--brand-cream))]"
          : "focus-visible:ring-offset-[hsl(var(--brand-paper))]",
      )}
    >
      <span
        className={cn(
          "block aspect-square w-full rounded-full border-[hsl(var(--brand-gold))] p-[3px] transition-all duration-300 ease-out",
          active
            ? "-translate-y-0.5 border-[4px] shadow-[0_10px_20px_-10px_rgba(10,40,90,0.55)]"
            : "border-2 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_16px_-10px_rgba(10,40,90,0.45)]",
        )}
      >
        <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
          {image ? (
            <OptimizedImage
              src={image}
              alt=""
              fill
              sizes={large ? "96px" : "80px"}
              imageType="thumbnail"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            children
          )}
        </span>
      </span>
      <span className="mx-[-8px] mt-2 block text-center md:mx-[-12px]">
        <span
          className={cn(
            "inline-block rounded-xl px-2.5 py-0.5 font-sans leading-snug transition-colors duration-300",
            large ? "text-[13px]" : "text-[12px] md:text-[13px]",
            active
              ? "bg-[hsl(var(--brand-midnight))] font-semibold text-white"
              : "font-medium text-[hsl(var(--brand-ink))]",
          )}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

const stripClass =
  "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 pt-1.5 [scrollbar-width:none] sm:px-6 md:flex-wrap md:justify-center md:gap-x-6 md:gap-y-4 md:overflow-visible [&::-webkit-scrollbar]:hidden";

// Keep the chosen circle in view when the strip scrolls sideways on phones.
function useScrollActiveIntoView(activeKey: string) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const row = ref.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !active) return;
    const rowBox = row.getBoundingClientRect();
    const box = active.getBoundingClientRect();
    row.scrollTo({
      left:
        row.scrollLeft +
        box.left -
        rowBox.left -
        (rowBox.width - box.width) / 2,
      behavior: "smooth",
    });
  }, [activeKey]);
  return ref;
}

export function CategoryHero({
  categories,
  isLoading,
  selectedCategories,
  setSelectedCategories,
}: CategoryHeroProps) {
  // Same query key as the home page, so the photos are usually already cached.
  const { data: index } = useQuery({
    queryKey: ["home", "category-index"],
    queryFn: () => productsService.getVisibleCategoryIndex(),
    staleTime: 5 * 60 * 1000,
  });

  const photos = useMemo(() => {
    if (!index) return null;
    const flat = categories.flatMap((cat) => [
      {
        id: cat.id,
        name: cat.name,
        parent_id: null,
        image_url: cat.image_url ?? null,
      },
      ...cat.subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        parent_id: cat.id,
        image_url: sub.image_url ?? null,
      })),
    ]);
    const products = index.map((product) => ({
      category_id: product.category_id,
      sub_category_id: product.sub_category_id,
      image: getImageTier(product.images, "medium", 0),
      created_at: product.created_at ?? "",
    }));
    return buildCategoryPhotos(flat, products);
  }, [index, categories]);

  const photoOf = (id: string): CategoryPhoto | undefined => photos?.get(id);
  // Once counts are known, hide categories a shopper would find empty.
  const hasProducts = (id: string) => !photos || (photoOf(id)?.count ?? 0) > 0;

  const visibleCategories = categories
    .map((cat) => ({
      ...cat,
      subcategories: cat.subcategories.filter((sub) => hasProducts(sub.id)),
    }))
    .filter((cat) => hasProducts(cat.id) || cat.subcategories.length > 0);

  // Same selection rules as the sidebar: every chosen category or type shows
  // as selected here, and both places read and write the same list.
  const isSelected = (name: string) => selectedCategories.includes(name);
  const isParentActive = (cat: (typeof visibleCategories)[number]) =>
    isSelected(cat.name) || cat.subcategories.some((sub) => isSelected(sub.name));

  const [openId, setOpenId] = useState<string | null>(null);
  const trayParent =
    visibleCategories.find((cat) => cat.id === openId && isParentActive(cat)) ??
    visibleCategories.find(
      (cat) => isParentActive(cat) && cat.subcategories.length > 0,
    );
  const showTray = !!trayParent && trayParent.subcategories.length > 0;

  const selectParent = (cat: (typeof visibleCategories)[number]) => {
    setOpenId(cat.id);
    if (!isParentActive(cat)) setSelectedCategories([cat.name]);
    else if (cat.subcategories.length === 0) setSelectedCategories([]);
  };
  const chooseInTray = (name: string) => {
    if (trayParent)
      setSelectedCategories(
        toggleCategoryChoice(selectedCategories, trayParent, name),
      );
  };

  const parentRef = useScrollActiveIntoView(
    visibleCategories.filter(isParentActive).map((cat) => cat.id).join("|"),
  );
  const subRef = useScrollActiveIntoView(selectedCategories.join("|"));

  return (
    <section
      aria-labelledby="shop-heading"
      className="bg-[hsl(var(--brand-paper))]"
    >
      <div className="relative border-b border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-cream))]">
        <div className="mx-auto max-w-[1440px] pb-4 pt-4 md:pb-5 md:pt-6">
          <h1 id="shop-heading" className="sr-only">
            Shop Kalamkari by category
          </h1>

          <ul
            aria-label="Categories"
            ref={parentRef}
            className={cn(
              stripClass,
              "[mask-image:linear-gradient(to_right,transparent,black_4%,black_88%,transparent)] md:[mask-image:none]",
            )}
          >
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="w-[80px] shrink-0 md:w-[96px]">
                  <span className="block aspect-square w-full animate-pulse rounded-full bg-white" />
                  <span className="mx-auto mt-3 block h-3 w-16 animate-pulse rounded bg-white" />
                </li>
              ))
            ) : (
              <>
                <li className="w-[80px] shrink-0 snap-center md:w-[96px]">
                  <CategoryCircle
                    label="All"
                    active={selectedCategories.length === 0}
                    size="large"
                    onSelect={() => setSelectedCategories([])}
                  >
                    <LayoutGrid
                      className="h-1/3 w-1/3 text-[hsl(var(--brand-ink))]"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </CategoryCircle>
                </li>
                {visibleCategories.map((cat) => (
                  <li
                    key={cat.id}
                    className="w-[80px] shrink-0 snap-center md:w-[96px]"
                  >
                    <CategoryCircle
                      label={cat.name}
                      image={photoOf(cat.id)?.image}
                      active={isParentActive(cat)}
                      size="large"
                      onSelect={() => selectParent(cat)}
                    >
                      <span className="font-serif text-2xl text-[hsl(var(--brand-ink))]">
                        {cat.name.charAt(0)}
                      </span>
                    </CategoryCircle>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
        <span
          aria-hidden="true"
          className="absolute -bottom-[5px] left-1/2 h-[9px] w-[9px] -translate-x-1/2 rotate-45 bg-[hsl(var(--brand-gold))]"
        />
      </div>

      <AnimatePresence initial={false}>
        {showTray && trayParent && (
          <motion.div
            key={trayParent.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-paper))]"
          >
            <div className="mx-auto max-w-[1440px] pb-1.5 pt-3 md:pb-2 md:pt-4">
              <ul
                aria-label={`${trayParent.name} types`}
                ref={subRef}
                className={stripClass}
              >
                <li className="w-[68px] shrink-0 snap-center md:w-[80px]">
                  <CategoryCircle
                    label={`All ${trayParent.name}`}
                    image={photoOf(trayParent.id)?.image}
                    active={isSelected(trayParent.name)}
                    size="small"
                    onSelect={() => chooseInTray(trayParent.name)}
                  />
                </li>
                {trayParent.subcategories.map((sub) => (
                  <li
                    key={sub.id}
                    className="w-[68px] shrink-0 snap-center md:w-[80px]"
                  >
                    <CategoryCircle
                      label={sub.name}
                      image={photoOf(sub.id)?.image}
                      active={isSelected(sub.name)}
                      size="small"
                      onSelect={() => chooseInTray(sub.name)}
                    >
                      <span className="font-serif text-xl text-[hsl(var(--brand-ink))]">
                        {sub.name.charAt(0)}
                      </span>
                    </CategoryCircle>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
