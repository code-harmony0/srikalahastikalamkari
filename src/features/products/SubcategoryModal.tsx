"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, CheckCircle2, ChevronRight, Search } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  image?: string;
  desc?: string;
  subcategories?: CategoryItem[];
  children?: CategoryItem[];
}

interface SubcategoryModalProps {
  rootCategory: CategoryItem | null;
  selectedSubIds: string[];
  onClose: () => void;
  onApply: (subIds: string[]) => void;
}

export const SubcategoryModal: React.FC<SubcategoryModalProps> = ({
  rootCategory,
  selectedSubIds: initialSelectedSubIds,
  onClose,
  onApply,
}) => {
  // Navigation State
  const [breadcrumb, setBreadcrumb] = useState<CategoryItem[]>([]);
  const [tempSelected, setTempSelected] = useState<string[]>(initialSelectedSubIds);
  const [modalSearch, setModalSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Sync temp selection and reset breadcrumb when root changes
  useEffect(() => {
    if (rootCategory) {
      setBreadcrumb([rootCategory]);
      setTempSelected(initialSelectedSubIds);
      setModalSearch("");
      setPage(1);
    }
  }, [rootCategory, initialSelectedSubIds]);

  // Handle ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const currentLevel = breadcrumb[breadcrumb.length - 1];
  
  // Flatten items for display (supporting both .subcategories and .children keys from the data model)
  const currentItems = useMemo(() => {
    if (!currentLevel) return [];
    let items = currentLevel.subcategories || currentLevel.children || [];
    
    if (modalSearch) {
      return items.filter(item => 
        item.name.toLowerCase().includes(modalSearch.toLowerCase())
      );
    }
    return items;
  }, [currentLevel, modalSearch]);

  const paginatedItems = currentItems.slice(0, page * itemsPerPage);

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const navigateTo = (item: CategoryItem) => {
    if (item.subcategories?.length || item.children?.length) {
      setBreadcrumb(prev => [...prev, item]);
      setModalSearch("");
      setPage(1);
    }
  };

  const jumpToBreadcrumb = (index: number) => {
    setBreadcrumb(prev => prev.slice(0, index + 1));
    setModalSearch("");
    setPage(1);
  };

  if (!rootCategory || !currentLevel) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#3B2C23]/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative bg-[#FFF8F0] w-full max-w-[800px] rounded-[20px] shadow-2xl overflow-hidden border border-[#C19A5B]/25 flex flex-col max-h-[90vh]"
        >
          {/* 🔘 Header with Breadcrumbs */}
          <div className="bg-white/50 border-b border-[#C19A5B]/15">
            <div className="px-8 py-5 flex items-center justify-between">
              <button
                onClick={() => breadcrumb.length > 1 ? jumpToBreadcrumb(breadcrumb.length - 2) : onClose()}
                className="flex items-center gap-2 text-[#A4552A] font-bold text-[13px] uppercase tracking-wide hover:opacity-70 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
                {breadcrumb.length > 1 ? "Back" : "Close"}
              </button>
              
              <h2 className="font-playfair text-[22px] font-bold text-[#3B2C23]">
                {currentLevel.name} <span className="italic text-[#A4552A]">Gallery</span>
              </h2>

              <button onClick={onClose} className="p-1 text-[#C19A5B] hover:text-[#A4552A] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Breadcrumb Path */}
            <nav className="flex items-center px-8 pb-4 gap-2 text-[12px] font-inter">
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => jumpToBreadcrumb(idx)}
                    className={`transition-colors whitespace-nowrap ${
                      idx === breadcrumb.length - 1 
                        ? "text-[#A4552A] font-bold" 
                        : "text-[#3B2C23]/50 hover:text-[#A4552A]"
                    }`}
                  >
                    {item.name}
                  </button>
                  {idx < breadcrumb.length - 1 && <ChevronRight className="w-3 h-3 text-[#C19A5B]/40" />}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* 🔍 Inner Search */}
          <div className="px-8 py-3 bg-[#C19A5B]/5 border-b border-[#C19A5B]/10 flex items-center gap-3">
             <Search className="w-4 h-4 text-[#C19A5B]" />
             <input 
               type="text" 
               placeholder={`Search in ${currentLevel.name}...`}
               value={modalSearch}
               onChange={(e) => setModalSearch(e.target.value)}
               className="bg-transparent w-full text-[14px] text-[#3B2C23] placeholder:text-[#3B2C23]/40 focus:outline-none"
             />
          </div>

          {/* 🖼️ Main Content Grid */}
          <div className="p-8 overflow-y-auto sidebar-scroll flex-1 bg-white/20">
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {paginatedItems.map((item) => {
                  const isSelected = tempSelected.includes(item.id);
                  const hasChildren = (item.subcategories?.length ?? 0) > 0 || (item.children?.length ?? 0) > 0;
                  
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      whileHover={{ y: -4 }}
                      onClick={() => hasChildren ? navigateTo(item) : null}
                      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md cursor-pointer
                        ${isSelected ? "border-[#A4552A] ring-1 ring-[#A4552A]/20" : "border-[#C19A5B]/20 hover:border-[#A4552A]/40"}
                      `}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-[120px] bg-[#FDFBF7] overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 50vw, 200px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#C19A5B]/20">
                             <X className="w-10 h-10" />
                          </div>
                        )}
                        
                        {/* Selections Checkmark Badge (Leaf items or all?) */}
                        {!hasChildren && (
                          <button 
                            onClick={(e) => toggleSelection(item.id, e)}
                            className="absolute top-2 right-2 z-10"
                          >
                            <AnimatePresence>
                              {isSelected ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="bg-[#A4552A] text-white p-1 rounded-full shadow-lg"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <div className="bg-white/80 text-[#C19A5B] p-1 rounded-full border border-[#C19A5B]/20 hover:bg-white transition-colors">
                                  <div className="w-4 h-4 border-2 border-current rounded-full" />
                                </div>
                              )}
                            </AnimatePresence>
                          </button>
                        )}

                        {/* Folder indicator for nested items */}
                        {hasChildren && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#3B2C23]/60 backdrop-blur-sm rounded text-[9px] text-white font-bold uppercase tracking-wider">
                            { (item.subcategories || item.children)?.length } Items
                          </div>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="p-4 text-center">
                        <h4 className={`font-inter text-[14px] font-bold truncate ${isSelected ? "text-[#A4552A]" : "text-[#3B2C23]"}`}>
                          {item.name}
                        </h4>
                        {item.desc && (
                          <p className="font-inter text-[12px] text-[#3B2C23]/60 italic mt-1 line-clamp-2 leading-tight">
                            {item.desc}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[#3B2C23]/40">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-playfair text-lg italic">No artifacts found in this tier</p>
              </div>
            )}

            {/* Load More Pagination */}
            {currentItems.length > paginatedItems.length && (
              <div className="flex justify-center mt-12 pb-4">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-8 py-3 bg-gradient-to-r from-[#C19A5B] to-[#A4552A] text-white rounded-xl font-bold text-[12px] uppercase tracking-[0.1em] shadow-lg shadow-[#A4552A]/20 hover:scale-105 transition-all"
                >
                  Explore More
                </button>
              </div>
            )}
          </div>

          {/* 🏁 Footer */}
          <div className="px-8 py-6 border-t border-[#C19A5B]/20 bg-white/40 flex items-center justify-between">
            <button
               onClick={onClose}
               className="text-[#A4552A]/70 hover:text-[#A4552A] font-bold text-[13px] uppercase tracking-wide"
            >
              Cancel
            </button>

            <p className="hidden md:block font-inter text-[10px] text-[#C19A5B] uppercase tracking-[0.2em] font-black">
              Authentic Handcrafted Heritage
            </p>

            <button
              onClick={() => onApply(tempSelected)}
              className="flex items-center gap-3 bg-[#A4552A] text-white px-8 py-3 rounded-xl font-bold text-[13px] uppercase tracking-widest shadow-lg shadow-[#A4552A]/20 hover:bg-[#8B3F20] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Selection
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
