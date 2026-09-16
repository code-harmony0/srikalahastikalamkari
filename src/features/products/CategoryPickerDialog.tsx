"use client";

import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, LayoutGrid, X } from "lucide-react";
import type { Category } from "@/shared/hooks/use-filter-categories";
import { resolveProductImageSrc } from "@/lib/cloudflare-images";
import { cn } from "@/shared/utils";

interface CategoryPickerDialogProps {
  category: Category | null;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  onClose: () => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2";

const imageSrc = (imageUrl?: string | null) =>
  imageUrl ? resolveProductImageSrc(imageUrl, "medium") : null;

/**
 * "All <category>" and its types are exclusive: picking a type drops "All",
 * picking "All" drops the types. Types can be combined with each other.
 */
export function toggleCategoryChoice(
  selected: string[],
  category: Category,
  name: string,
): string[] {
  if (selected.includes(name)) return selected.filter((n) => n !== name);

  const subNames = category.subcategories.map((sub) => sub.name);
  const withoutConflicts =
    name === category.name
      ? selected.filter((n) => !subNames.includes(n))
      : selected.filter((n) => n !== category.name);

  return [...withoutConflicts, name];
}

function ChoiceCard({
  name,
  image,
  selected,
  onClick,
  isAll = false,
}: {
  name: string;
  image: string | null;
  selected: boolean;
  onClick: () => void;
  isAll?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn("group flex flex-col text-left", focusRing, "rounded-md")}
    >
      <span
        className={cn(
          "relative block aspect-square w-full overflow-hidden rounded-md bg-[hsl(var(--brand-indigo-tint))] ring-1 transition-[box-shadow,transform] duration-300 ease-out",
          selected
            ? "ring-[3px] ring-[hsl(var(--brand-royal))] shadow-[0_8px_18px_-10px_rgba(11,42,85,0.55)]"
            : "ring-[hsl(var(--brand-gold)/0.55)] group-hover:shadow-[0_8px_18px_-10px_rgba(11,42,85,0.45)] group-hover:ring-[hsl(var(--brand-midnight)/0.5)]",
        )}
      >
        {isAll ? (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[hsl(var(--brand-midnight))] text-white">
            <LayoutGrid aria-hidden className="h-6 w-6" strokeWidth={1.75} />
            <span className="font-sans text-[18px] font-semibold leading-none">All</span>
          </span>
        ) : image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 30vw, 150px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span aria-hidden className="flex h-full w-full items-center justify-center font-serif text-[28px] text-[hsl(var(--brand-ink-soft))]">
            {name.charAt(0)}
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow-[0_2px_6px_rgba(11,42,85,0.35)] transition-all duration-200",
            selected
              ? "scale-100 bg-[hsl(var(--brand-royal))] text-white"
              : "scale-90 bg-white/90 text-transparent ring-1 ring-[hsl(var(--brand-ink)/0.25)]",
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </span>
      <span
        className={cn(
          "mt-2 font-sans text-[14px] leading-snug text-[hsl(var(--brand-ink))]",
          selected ? "font-semibold" : "font-medium",
        )}
      >
        {name}
      </span>
    </button>
  );
}

export function CategoryPickerDialog({
  category,
  selectedCategories,
  setSelectedCategories,
  onClose,
}: CategoryPickerDialogProps) {
  const subcategories = category?.subcategories ?? [];
  const namesInCategory = category
    ? [category.name, ...subcategories.map((sub) => sub.name)]
    : [];
  const chosenHere = selectedCategories.filter((n) => namesInCategory.includes(n));

  const choose = (name: string) => {
    if (!category) return;
    setSelectedCategories(toggleCategoryChoice(selectedCategories, category, name));
  };

  return (
    <DialogPrimitive.Root open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[300] bg-[hsl(var(--brand-midnight)/0.6)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-[300] flex flex-col bg-white text-[hsl(var(--brand-ink))] shadow-[0_30px_80px_-20px_rgba(11,42,85,0.5)] outline-none",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[calc(100vw-48px)] sm:max-w-[820px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-[hsl(var(--brand-gold)/0.6)]",
            "duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          {category && (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--brand-gold)/0.45)] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
                <div className="min-w-0">
                  <DialogPrimitive.Title className="text-balance font-serif text-[26px] leading-tight text-[hsl(var(--brand-ink))] sm:text-[28px]">
                    {category.name}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="mt-1 font-sans text-[15px] text-[hsl(var(--brand-ink-soft))]">
                    Pick the types you want to see. You can pick more than one.
                  </DialogPrimitive.Description>
                </div>
                <DialogPrimitive.Close
                  aria-label="Close"
                  className={cn(
                    "-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-indigo-tint))]",
                    focusRing,
                  )}
                >
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5">
                  <ChoiceCard
                    isAll
                    name={`All ${category.name}`}
                    image={null}
                    selected={selectedCategories.includes(category.name)}
                    onClick={() => choose(category.name)}
                  />
                  {subcategories.map((sub) => (
                    <ChoiceCard
                      key={sub.id}
                      name={sub.name}
                      image={imageSrc(sub.image_url)}
                      selected={selectedCategories.includes(sub.name)}
                      onClick={() => choose(sub.name)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-[hsl(var(--brand-gold)/0.45)] bg-white px-5 py-4 sm:px-7">
                <button
                  type="button"
                  disabled={chosenHere.length === 0}
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.filter((n) => !namesInCategory.includes(n)),
                    )
                  }
                  className={cn(
                    "h-11 rounded-sm px-1 font-sans text-[15px] font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-[6px] hover:decoration-[hsl(var(--brand-ink))] disabled:cursor-not-allowed disabled:no-underline disabled:text-[hsl(var(--brand-ink-soft))]",
                    focusRing,
                  )}
                >
                  Clear
                </button>
                <DialogPrimitive.Close
                  className={cn(
                    "ml-auto h-12 min-w-[160px] rounded-full bg-[hsl(var(--brand-midnight))] px-7 font-sans text-[14px] font-semibold uppercase tracking-[0.1em] text-white tabular-nums transition-colors hover:bg-[hsl(var(--brand-midnight-hover))]",
                    focusRing,
                  )}
                >
                  Done
                </DialogPrimitive.Close>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
