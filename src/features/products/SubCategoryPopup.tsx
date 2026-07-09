
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/utils";
import { Check } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";

interface SubCategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategory: any;
  onSelectSubCategory: (subCatId: string) => void;
}

export function SubCategoryPopup({
  isOpen,
  onClose,
  parentCategory,
  onSelectSubCategory,
  selectedCategories,
  toggleCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  parentCategory: any;
  onSelectSubCategory: (id: string) => void;
  selectedCategories: string[];
  toggleCategory: (name: string) => void;
}) {
  if (!parentCategory) return null;
  const subCategories = parentCategory.subcategories || [];
  const isParentSelected = selectedCategories.includes(parentCategory.name);
  const selectedCount = selectedCategories.filter(cat =>
    cat === parentCategory.name || subCategories.some((sub: any) => sub.name === cat)
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] z-[9999] flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-none translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-xl border border-[#C19A5B]/20 bg-white p-0 shadow-[0_30px_90px_rgba(26,21,18,0.35)] data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full sm:h-[92vh] sm:w-[90vw] sm:max-w-7xl sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] [&>button]:right-3 [&>button]:top-3 [&>button]:rounded-lg [&>button]:bg-white [&>button]:p-1.5 [&>button]:opacity-100 [&>button_svg]:text-[#1A1512] sm:[&>button]:right-4 sm:[&>button]:top-4">
        <DialogHeader className="shrink-0 border-b border-[#C19A5B]/15 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-row items-center justify-between gap-4 pr-9">
            <DialogTitle className="font-serif text-[18px] font-bold uppercase leading-tight tracking-[0.04em] text-[#1A1512] sm:text-[24px]">
              {parentCategory.name}{" "}
              <span className="text-[#C19A5B] italic font-normal lowercase tracking-[0.08em]">
                collection
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose a subcategory from {parentCategory.name} to refine your selection.
            </DialogDescription>
            <p className="hidden text-[9px] font-bold uppercase tracking-[0.14em] text-[#1A1512]/45 sm:block">
              Refine selection
            </p>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white p-3 sm:p-4">
           <div className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-white pr-1 scrollbar-thin scrollbar-thumb-[#C19A5B]/30 pb-3 sm:pb-4">
             {/* "All" Option - Compact Button Style */}
             <button
                onClick={() => {
                    toggleCategory(parentCategory.name);
                    onClose();
                }}
                className={cn(
                    "mb-3 flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all group sm:mb-4 sm:p-4",
                    isParentSelected
                     ? "border-[#C19A5B] bg-[#C19A5B]/5 shadow-sm ring-1 ring-[#C19A5B]/20"
                     : "border-[#C19A5B]/20 bg-white shadow-sm hover:border-[#C19A5B] hover:bg-[#C19A5B]/5 hover:shadow-[0_12px_28px_rgba(26,21,18,0.08)]"
                )}
             >
                <div className="flex flex-1 items-center gap-4">
                   <div className={cn(
                       "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all sm:h-12 sm:w-12",
                       isParentSelected
                        ? "border-[#1A1512] bg-[#1A1512] text-[#C19A5B]" 
                        : "border-[#C19A5B]/20 bg-[#1A1512]/5 text-[#C19A5B] group-hover:border-[#C19A5B]/45"
                   )}>
                       <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16 a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                       </svg>
                   </div>
                   <div className="flex-1 min-w-0">
                      <span className="block font-serif text-sm font-bold uppercase tracking-[0.05em] text-[#1A1512] sm:text-lg">All {parentCategory.name}</span>
                      <span className="font-serif text-[12px] italic text-[#A07840]">View entire collection</span>
                   </div>
                </div>
                <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                    isParentSelected
                     ? "border-[#1A1512] bg-[#1A1512]" 
                     : "border-[#C19A5B]/30 bg-white"
                )}>
                    {isParentSelected && <Check className="w-3 h-3 text-[#C19A5B]" />}
                </div>
             </button>

             {subCategories.length === 0 ? (
               <div className="rounded-xl border border-[#C19A5B]/20 bg-white px-4 py-6 text-center">
                 <p className="font-serif text-sm italic text-[#1A1512]/60">
                   No subcategories available. Use <span className="font-bold not-italic text-[#C19A5B]">All {parentCategory.name}</span> to view the full collection.
                 </p>
               </div>
             ) : (
              <>
                {/* Subcategories Grid - Compact Button Style */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subCategories.map((sub: any) => {
                    const isSelected = selectedCategories.includes(sub.name);
                    return (
                        <button
                          key={sub.id}
                          onClick={() => toggleCategory(sub.name)}
                          className={cn(
                            "group flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition-all sm:min-h-[84px] sm:p-3.5",
                            isSelected
                                ? "border-[#C19A5B] bg-[#C19A5B]/5 shadow-sm ring-1 ring-[#C19A5B]/20"
                                : "border-[#C19A5B]/20 bg-white shadow-sm hover:border-[#C19A5B] hover:bg-[#C19A5B]/5 hover:shadow-[0_12px_28px_rgba(26,21,18,0.08)]"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#1A1512]/5 sm:h-14 sm:w-14">
                            {sub.image_url ? (
                                <OptimizedImage
                                  src={sub.image_url}
                                  alt={sub.name}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  imageType="thumbnail"
                                  sizes="56px"
                                  loading="lazy"
                                  placeholder="empty"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#C19A5B]/30 text-xs">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                            )}
                            {/* Overlay on image */}
                           <div className={cn(
                                "absolute inset-0 transition-opacity duration-300",
                                isSelected ? "bg-[#C19A5B]/12" : "bg-black/0 group-hover:bg-black/5"
                            )} />
                          </div>

                           {/* Name */}
                           <div className="flex-1 min-w-0">
                               <span className={cn(
                                   "block text-xs font-bold uppercase tracking-[0.08em] sm:text-sm",
                                   isSelected ? "text-[#A07840]" : "text-[#1A1512]/78 group-hover:text-[#A07840]"
                               )}>
                                   {sub.name}
                               </span>
                           </div>

                           {/* Checkbox */}
                           <div className={cn(
                               "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                               isSelected
                                 ? "border-[#1A1512] bg-[#1A1512]"
                                 : "border-[#C19A5B]/30 bg-white group-hover:border-[#C19A5B]"
                           )}>
                               {isSelected && <Check className="w-3 h-3 text-[#C19A5B]" />}
                           </div>
                          </button>
                     );
                 })}
                 </div>
              </>
             )}
            </div>
            
            {/* Footer - Done Button */}
            <div className="shrink-0 border-t border-[#C19A5B]/15 bg-white px-3 py-3 flex items-center justify-between gap-3 pb-safe sm:px-4 sm:py-3">
                <div className="hidden font-serif text-[13px] italic tracking-wide text-[#1A1512]/58 sm:block">
                    Selected: <span className="font-bold not-italic text-[#A07840]">{selectedCount}</span> {selectedCount === 1 ? "collection" : "collections"}
                </div>
                <button 
                 onClick={onClose}
                 className="w-full rounded-lg border border-[#C19A5B]/30 bg-[#1A1512] px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E7C984] shadow-[0_10px_22px_rgba(26,21,18,0.18)] transition-all duration-300 hover:bg-[#A07840] hover:text-white sm:w-auto"
                >
                    Done
                </button>
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
