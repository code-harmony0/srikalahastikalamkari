
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed z-[9999] bg-[#FFF8F0] border-[#C19A5B]/20 p-0 overflow-hidden shadow-2xl
        /* Mobile: Full Screen */
        inset-0 w-screen h-screen max-w-none rounded-none translate-x-0 translate-y-0
        data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full
        
        /* Desktop: Larger Modal - 90% width, 85% height */
        sm:fixed sm:left-[50%] sm:top-[50%] sm:w-[90vw] sm:max-w-6xl sm:h-[85vh] sm:rounded-2xl 
        sm:translate-x-[-50%] sm:translate-y-[-50%] 
        sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] 
        sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[#C19A5B]/10 bg-white/50 backdrop-blur-sm flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="font-playfair text-lg sm:text-2xl text-[#3B2C23]">
            {parentCategory.name} <span className="text-[#A4552A] italic text-base sm:text-xl">Collection</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-[#3B2C23]/60 hidden sm:block">
            Select one or more subcategories
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
           {subCategories.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-[#3B2C23]/50 text-sm italic">
                   No subcategories found for {parentCategory.name}
               </div>
           ) : (
           <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#C19A5B]/20 pb-20 sm:pb-4">
            {/* "All" Option - Compact Button Style */}
            <button
               onClick={() => {
                   if(!selectedCategories.includes(parentCategory.name)) {
                       toggleCategory(parentCategory.name); 
                   }
                   onClose();
               }}
               className={cn(
                   "w-full flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl border transition-all mb-3 sm:mb-4 text-left group hover:shadow-md",
                   selectedCategories.includes(parentCategory.name)
                    ? "bg-[#FFF4E8] border-[#A4552A] shadow-sm"
                    : "bg-white border-[#C19A5B]/20 hover:border-[#C19A5B]"
               )}
            >
               <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all shrink-0",
                      selectedCategories.includes(parentCategory.name) 
                       ? "bg-[#A4552A] text-white" 
                       : "bg-[#C19A5B]/10 text-[#C19A5B] group-hover:bg-[#C19A5B]/20"
                  )}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="font-playfair font-bold text-base sm:text-lg text-[#3B2C23] block">All {parentCategory.name}</span>
                     <span className="text-xs text-[#A4552A]/80">View entire collection</span>
                  </div>
               </div>
               <div className={cn(
                   "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                   selectedCategories.includes(parentCategory.name) 
                    ? "border-[#A4552A] bg-[#A4552A]" 
                    : "border-[#C19A5B]/40"
               )}>
                   {selectedCategories.includes(parentCategory.name) && <Check className="w-4 h-4 text-white" />}
               </div>
            </button>

            {/* Subcategories Grid - Compact Button Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {subCategories.map((sub: any) => {
                const isSelected = selectedCategories.includes(sub.name);
                return (
                    <button
                      key={sub.id}
                      onClick={() => toggleCategory(sub.name)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border transition-all text-left group hover:shadow-md",
                        isSelected
                            ? "border-[#A4552A] bg-[#FFF4E8] shadow-sm ring-1 ring-[#A4552A]/20"
                            : "border-[#C19A5B]/20 bg-white hover:border-[#C19A5B] hover:bg-[#FFF4E8]/30"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 bg-[#FDFBF7]">
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
                            isSelected ? "bg-[#A4552A]/15" : "bg-black/0 group-hover:bg-black/5"
                        )} />
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                          <span className={cn(
                              "font-medium text-sm sm:text-base leading-tight block truncate",
                              isSelected ? "text-[#A4552A]" : "text-[#3B2C23] group-hover:text-[#A4552A]"
                          )}>
                              {sub.name}
                          </span>
                      </div>

                      {/* Checkbox */}
                      <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                          isSelected 
                            ? "border-[#A4552A] bg-[#A4552A]" 
                            : "border-[#C19A5B]/40 group-hover:border-[#C19A5B]"
                      )}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                );
            })}
            </div>
           </div>
           )}
           
           {/* Footer - Done Button */}
           <div className="shrink-0 pt-4 border-t border-[#C19A5B]/10 bg-[#FFF8F0] flex items-center justify-between gap-4 pb-safe sm:pb-0">
               <p className="text-xs sm:text-sm text-[#3B2C23]/60 hidden sm:block">
                   {selectedCategories.filter(cat => 
                     cat === parentCategory.name || subCategories.some((sub: any) => sub.name === cat)
                   ).length} selected
               </p>
               <button 
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 bg-[#A4552A] text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-[#8B3F20] transition-all shadow-md hover:shadow-lg"
               >
                   Done
               </button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
