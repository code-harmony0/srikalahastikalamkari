"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown, ChevronRight, ChevronUp, LayoutGrid } from "lucide-react";
import { productsService } from "@/services/products";
import { getImageTier } from "@/lib/image-tiers";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { type Category } from "@/shared/hooks/use-filter-categories";
import {
  buildCategoryPhotos,
  type CategoryPhoto,
} from "@/features/home/category-showcase";

import { cn } from "@/shared/utils";

interface CategoryHeroProps {
  categories: Category[];
  isLoading: boolean;
  heroCategory: string | null;
  setHeroCategory: (cat: string | null) => void;
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
            large ? "text-[12px] md:text-[13px]" : "text-[12px] md:text-[13px]",
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
  "flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 pt-1.5 [scrollbar-width:none] sm:px-6 [justify-content:safe_center] md:gap-4 xl:flex-wrap xl:gap-x-6 xl:gap-y-4 xl:overflow-visible [&::-webkit-scrollbar]:hidden";

// Keep the chosen circle in view when the strip scrolls sideways on phones.
function useScrollActiveIntoView(activeKey: string, open: boolean) {
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
  }, [activeKey, open]);
  return ref;
}

interface SummaryBarProps {
  parentName?: string;
  typeName?: string;
  fallbackName: string | null;
  image?: string | null;
  onChange: () => void;
}

// Scrolling down tucks the bar under the header; scrolling up brings it back.
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 160 || y < last - 6) setHidden(false);
      else if (y > last + 6) setHidden(true);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return [hidden, setHidden] as const;
}

function CategorySummaryBar({
  parentName,
  typeName,
  fallbackName,
  image,
  onChange,
}: SummaryBarProps) {
  const [hidden, setHidden] = useHideOnScrollDown();
  return (
    <div
      onFocus={() => setHidden(false)}
      className={cn(
        "relative border-b border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-cream))] shadow-[0_6px_14px_-12px_rgba(10,40,90,0.5)] transition-transform duration-300 ease-out motion-reduce:transition-none",
        hidden && "-translate-y-[calc(100%+8px)]",
      )}
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2 sm:px-6 md:px-10">
        <span className="relative block h-10 w-10 shrink-0 rounded-full border-2 border-[hsl(var(--brand-gold))] bg-white p-[2px]">
          <span className="relative block h-full w-full overflow-hidden rounded-full">
            {image && (
              <OptimizedImage
                src={image}
                alt=""
                fill
                sizes="40px"
                imageType="thumbnail"
                className="object-cover"
              />
            )}
          </span>
        </span>
        <p className="flex min-w-0 flex-1 items-center gap-1.5 font-sans text-[15px] text-[hsl(var(--brand-ink))]">
          {typeName ? (
            <>
              <span className="hidden shrink-0 text-[hsl(var(--brand-ink-soft))] sm:inline">
                {parentName}
              </span>
              <ChevronRight
                className="hidden h-4 w-4 shrink-0 text-[hsl(var(--brand-ink-soft))] sm:block"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="truncate font-semibold">{typeName}</span>
            </>
          ) : (
            <span className="truncate font-semibold">
              {parentName ?? fallbackName}
            </span>
          )}
        </p>
        <button
          type="button"
          aria-label="Change category"
          aria-expanded={false}
          aria-controls="shop-categories"
          onClick={onChange}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border border-[hsl(var(--brand-midnight))] bg-white px-3.5 py-1.5 font-sans text-[13px] font-medium text-[hsl(var(--brand-midnight))] transition-colors hover:bg-[hsl(var(--brand-midnight)/0.06)]",
            focusRing,
          )}
        >
          Change<span className="hidden sm:inline"> category</span>
          <ChevronDown
            className="h-4 w-4"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      </div>
      <span
        aria-hidden="true"
        className="absolute -bottom-[5px] left-1/2 h-[9px] w-[9px] -translate-x-1/2 rotate-45 bg-[hsl(var(--brand-gold))]"
      />
    </div>
  );
}

export function CategoryHero({
  categories,
  isLoading,
  heroCategory,
  setHeroCategory,
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

  const visibleCategories = categories;

  // Same selection rules as the sidebar: every chosen category or type shows
  // as selected here, and both places read and write the same list.
  const isSelected = (name: string) => heroCategory === name;
  const isParentActive = (cat: (typeof visibleCategories)[number]) =>
    heroCategory === cat.name ||
    cat.subcategories.some((sub) => heroCategory === sub.name);

  const [openId, setOpenId] = useState<string | null>(null);
  const trayParent =
    visibleCategories.find((cat) => cat.id === openId && isParentActive(cat)) ??
    visibleCategories.find(
      (cat) => isParentActive(cat) && cat.subcategories.length > 0,
    );
  const showTray = !!trayParent && trayParent.subcategories.length > 0;

  // The circles tuck away once a choice is made and open again on tap.
  // With nothing chosen they always stay open: picking is the job then.
  const [expanded, setExpanded] = useState(false);
  const open = expanded || heroCategory === null;

  const selectParent = (cat: (typeof visibleCategories)[number]) => {
    setOpenId(cat.id);
    if (!isParentActive(cat)) setHeroCategory(cat.name);
    else if (cat.subcategories.length === 0) setHeroCategory(null);
    // A parent with types keeps the strip open so a type can be picked.
    setExpanded(cat.subcategories.length > 0);
  };
  const chooseInTray = (name: string) => {
    if (!trayParent) return;
    setHeroCategory(isSelected(name) ? null : name);
    setExpanded(false);
  };

  const parentRef = useScrollActiveIntoView(
    visibleCategories
      .filter(isParentActive)
      .map((cat) => cat.id)
      .join("|"),
    open,
  );
  const subRef = useScrollActiveIntoView(heroCategory ?? "", open);

  const chosenParent = visibleCategories.find(isParentActive);
  const chosenType = chosenParent?.subcategories.find((sub) =>
    isSelected(sub.name),
  );
  const chosenPhoto = photoOf((chosenType ?? chosenParent)?.id ?? "")?.image;

  const slide = {
    initial: { height: 0, opacity: 0, overflow: "hidden" },
    animate: {
      height: "auto",
      opacity: 1,
      transitionEnd: { overflow: "visible" },
    },
    exit: { height: 0, opacity: 0, overflow: "hidden" },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  } as const;

  return (
    <>
      <h1 id="shop-heading" className="sr-only">
        Shop Kalamkari by category
      </h1>

      <MotionConfig reducedMotion="user">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div key="circles" id="shop-categories" {...slide}>
              <div className="relative border-b border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-cream))]">
                <div className="mx-auto max-w-[1440px] pb-3 pt-3 md:pb-5 md:pt-4">
                  {heroCategory !== null && (
                    <div className="flex justify-end px-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-sans text-[13px] font-medium text-[hsl(var(--brand-royal))] hover:underline",
                          focusRing,
                        )}
                      >
                        Hide categories
                        <ChevronUp
                          className="h-4 w-4"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )}

                  <ul
                    aria-label="Categories"
                    ref={parentRef}
                    className={cn(
                      stripClass,
                      "[mask-image:linear-gradient(to_right,transparent,black_4%,black_92%,transparent)] xl:[mask-image:none]",
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
                            active={heroCategory === null}
                            size="large"
                            onSelect={() => setHeroCategory(null)}
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
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              {...slide}
              className="sticky top-14 z-40 md:top-[72px]"
            >
              <CategorySummaryBar
                parentName={chosenParent?.name}
                typeName={chosenType?.name}
                fallbackName={heroCategory}
                image={chosenPhoto}
                onChange={() => setExpanded(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </>
  );
}
