
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
      <DialogContent className="fixed z-[9999] bg-white/95 backdrop-blur-md border-[#C19A5B]/20 p-0 overflow-hidden shadow-2xl
        /* Mobile: Full Screen */
        inset-0 w-screen h-screen max-w-none rounded-none translate-x-0 translate-y-0
        data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full
        
        /* Desktop: Larger Modal - 90% width, 85% height */
        sm:fixed sm:left-[50%] sm:top-[50%] sm:w-[90vw] sm:max-w-6xl sm:h-[85vh] sm:rounded-xl 
        sm:translate-x-[-50%] sm:translate-y-[-50%] 
        sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%] 
        sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]">
        <DialogHeader className="px-6 py-4 border-b border-[#C19A5B]/15 bg-white/70 backdrop-blur-md flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="font-serif text-lg sm:text-2xl font-bold uppercase tracking-wider text-[#1A1512]">
            {parentCategory.name} <span className="text-[#C19A5B] italic font-normal lowercase font-serif">collection</span>
          </DialogTitle>
          <p className="text-xs text-[#1A1512]/60 hidden sm:block tracking-wide uppercase font-semibold">
            Refine selection
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
           {subCategories.length === 0 ? (
               <div className="flex-1 flex items-center justify-center text-[#1A1512]/50 text-sm italic font-serif">
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
                    "w-full flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border transition-all mb-3 sm:mb-4 text-left group hover:shadow-md",
                    selectedCategories.includes(parentCategory.name)
                     ? "bg-[#C19A5B]/5 border-[#C19A5B] shadow-sm ring-1 ring-[#C19A5B]/20"
                     : "bg-white/60 backdrop-blur-sm border-[#C19A5B]/20 hover:border-[#C19A5B] hover:bg-[#C19A5B]/5"
                )}
             >
                <div className="flex items-center gap-3 flex-1">
                   <div className={cn(
                       "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-all shrink-0 border",
                       selectedCategories.includes(parentCategory.name) 
                        ? "bg-[#1A1512] text-[#C19A5B] border-[#C19A5B]/30" 
                        : "bg-[#C19A5B]/10 text-[#C19A5B] border-[#C19A5B]/10 group-hover:bg-[#C19A5B]/20"
                   )}>
                       <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16 a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                       </svg>
                   </div>
                   <div className="flex-1 min-w-0">
                      <span className="font-serif font-bold text-base sm:text-lg text-[#1A1512] block uppercase tracking-wider">All {parentCategory.name}</span>
                      <span className="text-[11px] text-[#C19A5B] italic font-serif">View entire collection</span>
                   </div>
                </div>
                <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                    selectedCategories.includes(parentCategory.name) 
                     ? "border-[#C19A5B] bg-[#1A1512]" 
                     : "border-[#C19A5B]/30"
                )}>
                    {selectedCategories.includes(parentCategory.name) && <Check className="w-3 h-3 text-[#C19A5B]" />}
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
                            ? "border-[#C19A5B] bg-[#C19A5B]/5 shadow-sm ring-1 ring-[#C19A5B]/20"
                            : "border-[#C19A5B]/20 bg-white/60 hover:border-[#C19A5B] hover:bg-[#C19A5B]/10"
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
                            isSelected ? "bg-[#C19A5B]/15" : "bg-black/0 group-hover:bg-black/5"
                        )} />
                      </div>

                       {/* Name */}
                       <div className="flex-1 min-w-0">
                           <span className={cn(
                               "font-semibold text-xs sm:text-sm uppercase tracking-wider block truncate",
                               isSelected ? "text-[#C19A5B]" : "text-[#1A1512]/80 group-hover:text-[#C19A5B]"
                           )}>
                               {sub.name}
                           </span>
                       </div>

                       {/* Checkbox */}
                       <div className={cn(
                           "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                           isSelected 
                             ? "border-[#C19A5B] bg-[#1A1512]" 
                             : "border-[#C19A5B]/30 group-hover:border-[#C19A5B]"
                       )}>
                           {isSelected && <Check className="w-3 h-3 text-[#C19A5B]" />}
                       </div>
                      </button>
                 );
             })}
             </div>
            </div>
            )}
            
            {/* Footer - Done Button */}
            <div className="shrink-0 pt-4 border-t border-[#C19A5B]/15 bg-white/70 backdrop-blur-md flex items-center justify-between gap-4 pb-safe sm:pb-0">
                <div className="font-serif text-[13px] text-[#1A1512]/60 italic tracking-wide hidden sm:block">
                    Selected: <span className="font-serif font-bold text-[#C19A5B] not-italic">{selectedCategories.filter(cat => 
                      cat === parentCategory.name || subCategories.some((sub: any) => sub.name === cat)
                    ).length}</span> subsets
                </div>
                <button 
                 onClick={onClose}
                 className="w-full sm:w-auto px-10 py-3 bg-[#1A1512] text-[#C19A5B] border border-[#C19A5B]/30 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#C19A5B] hover:text-white transition-all shadow-md duration-300"
                >
                    Done
                </button>
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
