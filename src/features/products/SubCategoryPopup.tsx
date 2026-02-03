
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import Image from "next/image";
import { cn } from "@/shared/utils";

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
  onSelectSubCategory, // Note: This prop name implies single validation, but we can reuse it to send "name" or we might need to change the prop
  selectedCategories, // We need to read selected categories
  toggleCategory, // We need to toggle categories
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
      <DialogContent className="max-w-xl bg-[#FFF8F0] border-[#C19A5B]/20 p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-[#C19A5B]/10 bg-white/50 backdrop-blur-sm flex flex-row items-center justify-between">
          <DialogTitle className="font-playfair text-xl text-[#3B2C23]">
            {parentCategory.name} <span className="text-[#A4552A] italic">Collection</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#C19A5B]/20">
            {/* "All" Option */}
            <button
               onClick={() => {
                   if(!selectedCategories.includes(parentCategory.name)) {
                       toggleCategory(parentCategory.name); 
                   }
                   onClose();
               }}
               className={cn(
                   "group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all aspect-[3/4] text-center",
                   selectedCategories.includes(parentCategory.name)
                    ? "bg-[#FFF4E8] border-[#A4552A] shadow-md"
                    : "bg-white border-[#C19A5B]/20 hover:border-[#C19A5B]"
               )}
            >
               <div className={cn(
                   "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors mb-2",
                   selectedCategories.includes(parentCategory.name) 
                    ? "border-[#A4552A] bg-[#A4552A] text-white" 
                    : "border-[#C19A5B]/40 text-[#C19A5B]/40"
               )}>
                   {selectedCategories.includes(parentCategory.name) && <span className="text-xs">✓</span>}
               </div>
               <span className="font-playfair font-bold text-lg text-[#3B2C23]">All<br/>{parentCategory.name}</span>
               <span className="text-[10px] uppercase tracking-widest text-[#A4552A]">View All</span>
            </button>

            {/* Sub Categories */}
            {subCategories.map((sub: any) => {
                const isSelected = selectedCategories.includes(sub.name);
                return (
                    <button
                      key={sub.id}
                      onClick={() => toggleCategory(sub.name)}
                      className={cn(
                        "group relative rounded-xl border transition-all overflow-hidden aspect-[3/4]",
                        isSelected
                            ? "border-[#A4552A] shadow-md ring-1 ring-[#A4552A]"
                            : "border-[#C19A5B]/20 hover:border-[#C19A5B]"
                      )}
                    >
                      {/* Full Image */}
                      <div className="absolute inset-0 bg-[#FDFBF7]">
                        {sub.image_url ? (
                            <Image src={sub.image_url} alt={sub.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#C19A5B]/40 text-xs">No Image</div>
                        )}
                        <div className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            isSelected ? "bg-[#A4552A]/20" : "bg-black/0 group-hover:bg-black/10"
                        )} />
                      </div>

                      {/* Checkbox Overlay */}
                      <div className="absolute top-3 right-3 z-10">
                          <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm bg-white",
                              isSelected 
                                ? "border-[#A4552A] bg-[#A4552A] text-white" 
                                : "border-[#C19A5B]/40 text-transparent bg-white/80 backdrop-blur-sm"
                          )}>
                              <span className="text-xs font-bold">✓</span>
                          </div>
                      </div>
                      
                      {/* Name Overlay */}
                      <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 text-left">
                          <span className={cn(
                              "font-medium text-sm leading-tight text-white block font-playfair tracking-wide",
                              isSelected ? "text-[#F4E6D0]" : "text-white"
                          )}>
                              {sub.name}
                          </span>
                      </div>
                    </button>
                );
            })}
           </div>
           
           <div className="mt-6 flex justify-end pt-4 border-t border-[#C19A5B]/10">
               <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#A4552A] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#8B3F20] transition-colors shadow-sm"
               >
                   Done
               </button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
