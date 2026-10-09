// @ts-nocheck
"use client";
import { getStockQuantity } from "@/shared/lib/inventory";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInventory } from "@/shared/contexts/InventoryContext";
import { Button } from "@/app/dashboard/ui/button";
import { Input } from "@/app/dashboard/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/dashboard/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Package,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  MoreVertical,
  Copy,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/shared/ui/sheet";
import { getCategories, getSubCategories } from "@/services/categories";
import { getSubcategorySortIndex } from "@/shared/lib/category-order";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { supabase } from "@/lib/supabase/client";

import { useProducts } from "@/shared/hooks/use-products";
import { useQueryClient } from "@tanstack/react-query";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import { cn } from "@/shared/utils";

interface FilterState {
  categories: string[];
  priceRange: [number | "", number | ""];
  colors: string[];
  inStock: boolean;
  isVisible: boolean | null; // Added visibility filter
}

const ProductList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  ;
  const {
    products: contextProducts,
    deleteProduct,
    updateProduct,
    fetchData,
    loading,
  } = useInventory();

  // Log when products update
  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await getCategories();
      if (data) setAllCategories(data);
    };
    loadCategories();

    console.log(
      "🛒 ProductList received products update:",
      contextProducts?.length || 0,
      "products"
    );
    if (contextProducts && contextProducts.length > 0) {
      console.log("📋 First product:", contextProducts[0]?.name, "ID:", contextProducts[0]?.id);
    }
  }, [contextProducts]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIds, setSelectedIdsState] = useState<string[]>([]);

  // Load selections from session storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("dashboard_selected_products");
      if (stored) {
        setSelectedIdsState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load selected products", e);
    }
  }, []);

  // Wrapper to update state and sync to session storage
  const setSelectedIds = (value: string[] | ((prev: string[]) => string[])) => {
    setSelectedIdsState((prev) => {
      const nextValue = typeof value === 'function' ? value(prev) : value;
      sessionStorage.setItem("dashboard_selected_products", JSON.stringify(nextValue));
      return nextValue;
    });
  };
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState<number | null>(
    null,
  );

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    if (contextProducts && Array.isArray(contextProducts)) {
      contextProducts.forEach((p) => {
        if ((p as any).categoryName) cats.add((p as any).categoryName);
      });
    }
    return Array.from(cats);
  }, [contextProducts]);

  const availableColors = useMemo(() => {
    const cols = new Set<string>();
    if (contextProducts && Array.isArray(contextProducts)) {
      contextProducts.forEach((p) => {
        if (Array.isArray((p as any).colors)) {
          (p as any).colors.forEach((c: string) => cols.add(c));
        }
      });
    }
    return Array.from(cols);
  }, [contextProducts]);
  const [allCategories, setAllCategories] = useState<any[]>([]); // New state for fetched categories
  const [subCategoryFilter, setSubCategoryFilter] = useState("all"); // State for sub-category filter
  const [showFilters, setShowFilters] = useState(false); // New state

  const [filters, setFilters] = useState<FilterState>({
    // New state
    categories: [],
    priceRange: ["", ""],
    colors: [],
    inStock: false,
    isVisible: null, // Default to show all
  });

  // Server-side Pagination & Filtering
  const queryFilters = useMemo(() => ({
    page,
    limit,
    search: searchQuery || undefined,
    category_id: filters.categories.length > 0 ? filters.categories : undefined,
    sub_category_id: subCategoryFilter !== "all" ? subCategoryFilter : undefined,
    price_min: filters.priceRange[0] === "" ? undefined : Number(filters.priceRange[0]),
    price_max: filters.priceRange[1] === "" ? undefined : Number(filters.priceRange[1]),
    include_out_of_stock: !filters.inStock, // Logic inversion: inStock=true means only available
    in_stock: filters.inStock || undefined,
    sort_by: sortBy
  }), [page, limit, searchQuery, filters, subCategoryFilter, sortBy]);

  const { data: queryData, isLoading: isQueryLoading } = useProducts(queryFilters);
  const products = queryData?.data || [];
  const totalCount = queryData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery, sortBy, subCategoryFilter, limit]);

  // OLD Client-side logic removed for performance
  const filteredAndSortedProducts = products; // Alias for compatibility with render logic

  const handleEdit = (product: any) => {
    sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    router.push(`/dashboard/add-product?edit=${product.id}`);
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product Deleted", {
        description: `${productToDelete.name} has been removed`
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length > 0) {
      setIsDeletingBulk(true);
      try {
        await Promise.all(selectedIds.map((id) => deleteProduct(id)));
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success("Products Deleted", {
          description: `${selectedIds.length} products have been removed`
        });
        setSelectedIds([]);
      } catch (error) {
        toast.error("Error deleting products");
      } finally {
        setIsDeletingBulk(false);
        setIsBulkDeleteDialogOpen(false);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleExportCsv = async () => {
    if (selectedIds.length === 0) return;
    try {
      const selectedProducts = contextProducts?.filter(p => selectedIds.includes(p.id)) || [];
      
      const ExcelJS = (await import("exceljs")).default;
      const FileSaver = await import("file-saver");
      const saveAs = FileSaver.saveAs || FileSaver.default;

      // Fetch fresh categories and subcategories for data validation
      const categoriesRes = await getCategories();
      const subCategoriesRes = await getSubCategories();
      const categories = categoriesRes.data || [];
      const subCategories = subCategoriesRes.data || [];

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet("Products");

      ws.columns = [
        { header: "SKU", key: "sku", width: 22 },
        { header: "Product Name", key: "name", width: 45 },
        { header: "Description", key: "desc", width: 70 },
        { header: "Category", key: "cat", width: 22 },
        { header: "Subcategory", key: "subcat", width: 28 },
        { header: "Selling Price (₹)", key: "price", width: 18 },
        { header: "MRP / Original Price (₹)", key: "mrp", width: 22 },
        { header: "Stock Quantity", key: "stock", width: 15 },
        { header: "Image / Photo Shoot No.", key: "imagefile", width: 35 },
        { header: "Attribute 1 Label", key: "attr1l", width: 20 },
        { header: "Attribute 1 Value", key: "attr1v", width: 25 },
        { header: "Attribute 2 Label", key: "attr2l", width: 20 },
        { header: "Attribute 2 Value", key: "attr2v", width: 25 },
        { header: "Attribute 3 Label", key: "attr3l", width: 20 },
        { header: "Attribute 3 Value", key: "attr3v", width: 25 },
        { header: "Attribute 4 Label", key: "attr4l", width: 20 },
        { header: "Attribute 4 Value", key: "attr4v", width: 25 },
        { header: "Attribute 5 Label", key: "attr5l", width: 20 },
        { header: "Attribute 5 Value", key: "attr5v", width: 25 },
      ];

      ws.getRow(1).font = { bold: true };
      ws.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      const sortedCategories = [...categories].sort((a, b) => {
        if (a.name.toLowerCase() === 'sarees') return -1;
        if (b.name.toLowerCase() === 'sarees') return 1;
        return a.name.localeCompare(b.name);
      });
      const categoryNames = sortedCategories.map((c) => c.name);
      
      const allSubCategoryNames = [...subCategories].sort((a, b) => {
        const iA = getSubcategorySortIndex(a.name);
        const iB = getSubcategorySortIndex(b.name);
        if (iA !== iB) return iA - iB;
        return a.name.localeCompare(b.name);
      }).map((s) => s.name);
      const uniqueSubCategoryNames = [...new Set(allSubCategoryNames)];

      selectedProducts.forEach(p => {
        let attrs: Record<string, string> = {};
        if (p.attributes) {
          if (Array.isArray(p.attributes)) {
             p.attributes.forEach((attr: any) => {
               if (attr.name && attr.value) attrs[attr.name] = attr.value;
             });
          } else if (typeof p.attributes === 'object') {
             attrs = { ...p.attributes };
          }
        }
        
        // Add material as an attribute if it exists and isn't already there
        if (p.material && !attrs['Material']) {
          attrs['Material'] = p.material;
        }
        
        const attrKeys = Object.keys(attrs).slice(0, 5);

        ws.addRow({
          sku: p.sku || "",
          name: p.name || "",
          desc: p.description || "",
          cat: p.categoryName || p.categories?.name || categories.find((c: any) => c.id === p.category_id)?.name || "",
          subcat: p.subCategoryName || p.sub_category?.name || subCategories.find((s: any) => s.id === p.sub_category_id)?.name || "",
          price: p.price || 0,
          mrp: p.originalPrice || p.original_price || "",
          stock: p.quantity !== undefined ? p.quantity : (p.stock_quantity || 0),
          imagefile: Array.isArray(p.images) ? p.images.join(", ") : (p.images || ""),
          attr1l: attrKeys[0] || "",
          attr1v: attrs[attrKeys[0]] || "",
          attr2l: attrKeys[1] || "",
          attr2v: attrs[attrKeys[1]] || "",
          attr3l: attrKeys[2] || "",
          attr3v: attrs[attrKeys[2]] || "",
          attr4l: attrKeys[3] || "",
          attr4v: attrs[attrKeys[3]] || "",
          attr5l: attrKeys[4] || "",
          attr5v: attrs[attrKeys[4]] || "",
        });
      });

      // Data validation hidden columns setup
      ws.getColumn('Z').hidden = true;
      ws.getColumn('AA').hidden = true;

      categoryNames.forEach((cat, index) => {
        ws.getCell(`Z${index + 1}`).value = cat;
      });

      const catSubMap = new Map<string, string[]>();
      subCategories.forEach((sub) => {
        const parentCat = categories.find((c) => String(c.id) === String(sub.category_id));
        if (parentCat) {
          if (!catSubMap.has(parentCat.name)) catSubMap.set(parentCat.name, []);
          const arr = catSubMap.get(parentCat.name)!;
          if (!arr.includes(sub.name)) arr.push(sub.name);
        }
      });

      let colOffset = 0;
      for (const [catName, subcats] of catSubMap) {
        // Start from column AB (index 28)
        const colNumber = 28 + colOffset;
        let colLetter = "";
        let temp = colNumber;
        while (temp > 0) {
          let modulo = (temp - 1) % 26;
          colLetter = String.fromCharCode(65 + modulo) + colLetter;
          temp = Math.floor((temp - modulo) / 26);
        }

        const col = ws.getColumn(colLetter);
        col.hidden = true;

        subcats.forEach((subName, idx) => {
          ws.getCell(`${colLetter}${idx + 1}`).value = subName;
        });

        const safeName = catName.replace(/[^a-zA-Z0-9]/g, "_");
        const rangeAddr = `Products!$${colLetter}$1:$${colLetter}$${Math.max(1, subcats.length)}`;
        workbook.definedNames.add(rangeAddr, safeName);
        colOffset++;
      }

      uniqueSubCategoryNames.forEach((subcat, index) => {
        ws.getCell(`AA${index + 1}`).value = subcat;
      });

      const catFormula = `$Z$1:$Z$${Math.max(2, categoryNames.length)}`;

      for (let i = 2; i <= selectedProducts.length + 1; i++) {
        // Column D is Category
        ws.getCell(`D${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [catFormula],
          showErrorMessage: true,
          errorTitle: 'Invalid Category',
          error: 'Please select a category from the dropdown list'
        };

        // Column E is Subcategory
        const indirectFormula = `INDIRECT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(D${i}," ","_"),"&","_"),"-","_"))`;
        ws.getCell(`E${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [indirectFormula],
          showErrorMessage: true,
          errorTitle: 'Invalid Subcategory',
          error: 'Please select a subcategory that belongs to the chosen category'
        };
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "products-export.xlsx");
      
      toast.success("Export Successful", { description: "Excel file has been downloaded." });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export Failed", { description: "There was an error generating the Excel file." });
    }
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleColor = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: ["", ""],
      colors: [],
      inStock: false,
      isVisible: null,
    });
    setSubCategoryFilter("all");
    setSearchQuery("");
  };

  const handleVisibilityToggle = async (product: any, isVisible: boolean) => {
    setTogglingVisibility(product.id);
    try {
      await updateProduct(product.id, { isVisible: isVisible }); // Use isVisible here
      await queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(isVisible ? "Product Visible" : "Product Hidden", {
        description: `${product.name} is now ${isVisible ? "visible" : "hidden"} on the store`
      });
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Error", { description: "Failed to update product visibility" });
    } finally {
      setTogglingVisibility(null);
    }
  };

  const handleFeaturedToggle = async (product: any, isFeatured: boolean) => {
    // Check limit if turning on
    if (isFeatured) {
        const currentFeaturedCount = (contextProducts || []).filter(p => p.isFeatured).length;
        if (currentFeaturedCount >= 6) {
            toast.error("Limit Reached", { description: "You can only showcase 6 top products." });
            return;
        }
    }

    try {
      await updateProduct(product.id, { isFeatured: isFeatured });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(isFeatured ? "Added to Featured" : "Removed from Featured", {
        description: `${product.name} is ${isFeatured ? "now" : "no longer"} featured.`
      });
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Error", { description: "Failed to update product." });
    }
  };

  // Most pieces are one-of-a-kind with a stock of 1, so "fewer than 5" flagged
  // almost the whole catalogue. Out of stock is the number that needs action.
  const outOfStockCount = (contextProducts || []).filter(
    (p) => getStockQuantity(p) <= 0,
  ).length;
  const totalValue = (contextProducts || []).reduce(
    (acc, p) => acc + (p.price || 0) * (p.quantity || 0),
    0,
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (subCategoryFilter !== "all") count++;
    if (filters.colors.length > 0) count++;
    if (filters.priceRange[0] !== "" || filters.priceRange[1] !== "") count++;
    if (filters.inStock) count++;
    if (filters.isVisible !== null) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your inventory and variants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={fetchData}
            className="h-9 hover:bg-slate-200/50 border-0 text-slate-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={() => router.push("/dashboard/add-product")}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-md h-9 gap-2 px-4 rounded-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {(contextProducts || []).length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Out of Stock
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {outOfStockCount}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Inventory Value
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              ₹{totalValue.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products by name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-slate-300 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 border-slate-300 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-11 px-4 text-base border-slate-300 rounded-xl"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-slate-900 text-white px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl font-bold">Filters</SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-6">
                  {/* Categories & Subcategories */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-semibold text-slate-900">Category</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Main Category</label>
                          <Select
                            value={filters.categories[0] || "all"}
                            onValueChange={(val) => {
                               const newCats = val === "all" ? [] : [val];
                               setFilters(prev => ({...prev, categories: newCats}));
                               setSubCategoryFilter("all");
                            }}
                          >
                            <SelectTrigger className="w-full bg-white border-slate-200 h-10 rounded-xl">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="all">All Categories</SelectItem>
                              {allCategories.filter(c => !c.parent_id).map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                       <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Sub Category</label>
                          <Select
                            value={subCategoryFilter}
                            onValueChange={setSubCategoryFilter}
                            disabled={filters.categories.length === 0}
                          >
                            <SelectTrigger className="w-full bg-white border-slate-200 h-10 rounded-xl">
                              <SelectValue placeholder="All Sub Categories" />
                            </SelectTrigger>
                             <SelectContent className="rounded-xl">
                              <SelectItem value="all">All Sub Categories</SelectItem>
                              {allCategories
                                .filter(c => c.parent_id === filters.categories[0])
                                .map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                  </div>

                  {/* Colors */}
                  {availableColors.length > 0 && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                      <h4 className="font-semibold text-slate-900">Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <Badge
                            key={color}
                            variant="outline"
                            className={`cursor-pointer px-3 py-1.5 rounded-lg ${filters.colors.includes(color) ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'}`}
                            onClick={() => toggleColor(color)}
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-semibold text-slate-900">
                      Price Range (₹)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">
                          Min Price
                        </label>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.priceRange[0]}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [
                                e.target.value === "" ? "" : Number(e.target.value),
                                prev.priceRange[1],
                              ],
                            }))
                          }
                          className="w-full bg-white border-slate-200 h-10 rounded-xl"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">
                          Max Price
                        </label>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.priceRange[1]}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              priceRange: [
                                prev.priceRange[0],
                                e.target.value === "" ? "" : Number(e.target.value),
                              ],
                            }))
                          }
                          className="w-full bg-white border-slate-200 h-10 rounded-xl"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        Availability
                      </h4>
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              inStock: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <span className="text-sm font-medium">In Stock Only</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        Visibility
                      </h4>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="radio"
                            name="visibility"
                            checked={filters.isVisible === null}
                            onChange={() =>
                              setFilters((prev) => ({ ...prev, isVisible: null }))
                            }
                            className="h-4 w-4 rounded-full border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          <span className="text-sm font-medium">Show All</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="radio"
                            name="visibility"
                            checked={filters.isVisible === true}
                            onChange={() =>
                              setFilters((prev) => ({ ...prev, isVisible: true }))
                            }
                            className="h-4 w-4 rounded-full border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          <span className="text-sm font-medium">Visible Only</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <input
                            type="radio"
                            name="visibility"
                            checked={filters.isVisible === false}
                            onChange={() =>
                              setFilters((prev) => ({ ...prev, isVisible: false }))
                            }
                            className="h-4 w-4 rounded-full border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                          <span className="text-sm font-medium">Hidden Only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <SheetFooter className="mt-8 pt-4 border-t border-slate-100 flex-row justify-between gap-3 sm:justify-between">
                   <Button variant="ghost" onClick={clearFilters} disabled={activeFilterCount === 0}>
                     Clear All
                   </Button>
                   <SheetClose asChild>
                     <Button className="bg-slate-900 text-white">Apply Filters</Button>
                   </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500 font-medium mr-2">Active Filters:</span>
            {filters.categories.length > 0 && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200" onClick={() => { setFilters(prev => ({...prev, categories: []})); setSubCategoryFilter("all"); }}>
                Category
                <X className="w-3 h-3 ml-1 text-slate-400" />
              </Badge>
            )}
            {subCategoryFilter !== "all" && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200" onClick={() => setSubCategoryFilter("all")}>
                Subcategory
                <X className="w-3 h-3 ml-1 text-slate-400" />
              </Badge>
            )}
            {filters.colors.map(color => (
              <Badge key={color} variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200" onClick={() => toggleColor(color)}>
                {color}
                <X className="w-3 h-3 ml-1 text-slate-400" />
              </Badge>
            ))}
            {(filters.priceRange[0] !== "" || filters.priceRange[1] !== "") && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200" onClick={() => setFilters(prev => ({...prev, priceRange: ["", ""]}))}>
                Price
                <X className="w-3 h-3 ml-1 text-slate-400" />
              </Badge>
            )}
            {filters.inStock && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200" onClick={() => setFilters(prev => ({...prev, inStock: false}))}>
                In Stock
                <X className="w-3 h-3 ml-1 text-slate-400" />
              </Badge>
            )}
            {filters.isVisible !== null && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200" onClick={() => setFilters(prev => ({...prev, isVisible: null}))}>
                {filters.isVisible ? 'Visible' : 'Hidden'}
                <X className="w-3 h-3 ml-1 text-slate-400" />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6 px-2 text-slate-500 hover:text-slate-900 ml-2">
               Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Product Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent border-b border-slate-300">
              <TableHead 
                className="w-[80px] pl-6 pr-4 cursor-pointer"
                onClick={toggleSelectAll}
              >
                <div className="flex h-full w-full items-center">
                  <Checkbox
                    checked={
                      filteredAndSortedProducts.length > 0 &&
                      selectedIds.length === filteredAndSortedProducts.length
                    }
                    aria-label="Select all"
                    className="pointer-events-none data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[80px] font-semibold text-xs uppercase tracking-wider text-slate-500 py-4 pl-2">
                Image
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 py-4">
                Product
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 py-4">
                Category
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 py-4 text-right">
                Price
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 py-4 text-right">
                Stock
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 py-4">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-slate-500 pr-6 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isQueryLoading ? (
               <TableRow>
                 <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                   <div className="flex flex-col items-center justify-center gap-2 h-full">
                      <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
                      <p>Loading products...</p>
                   </div>
                 </TableCell>
               </TableRow>
            ) : filteredAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Package className="h-12 w-12 mb-4 text-slate-200" />
                    <p className="text-lg font-medium text-slate-900">
                      No products found
                    </p>
                    <p className="text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProducts.map((product) => {
                const isVisible = product.isVisible !== false; // Default to true if undefined
                const isSelected = selectedIds.includes(product.id);
                return (
                  <TableRow
                    key={product.id}
                    className={cn(
                      "group hover:bg-slate-50/50 transition-colors border-l-2",
                      !isVisible && "opacity-50",
                      isSelected ? "bg-slate-50/80 border-l-slate-900 border-b-slate-200" : "border-l-transparent border-b-slate-100"
                    )}
                  >
                    <TableCell 
                      className="w-[80px] pl-6 pr-4 py-4 cursor-pointer"
                      onClick={() => toggleSelectProduct(product.id)}
                    >
                      <div className="flex h-full w-full items-center">
                        <Checkbox
                          checked={isSelected}
                          aria-label={`Select ${product.name}`}
                          className="pointer-events-none data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      className="pl-2 py-4 cursor-pointer"
                      onClick={() => handleEdit(product)}
                    >
                      <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden">
                        <OptimizedImage
                          src={
                            getImageTier(product.images, "thumb", 0) ||
                            product.image ||
                            null
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          imageType="thumbnail"
                          sizes="48px"
                          placeholder="empty"
                        />
                      </div>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleEdit(product)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-base">
                            {product.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.sku ? (
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-semibold text-slate-600 border border-slate-200 tracking-wide">
                              {product.sku}
                            </code>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No SKU</span>
                          )}
                          {!isVisible && (
                            <Badge
                              variant="outline"
                              className="bg-slate-100 text-slate-600 border-slate-300 text-[10px] px-1.5 py-0"
                            >
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleEdit(product)}
                    >
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-600 border-slate-300 font-medium"
                      >
                        {product.categoryName || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      onClick={() => handleEdit(product)}
                      className="text-right tabular-nums cursor-pointer"
                    >
                      <div className="font-bold text-slate-900">
                        ₹{product.price?.toLocaleString()}
                      </div>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <div className="text-xs text-slate-400 line-through">
                            ₹{product.originalPrice?.toLocaleString()}
                          </div>
                        )}
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        router.push(`/dashboard/products/${product.id}`)
                      }
                      className="text-right tabular-nums"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-medium ${(product.quantity || 0) > 5 ? "text-slate-700" : "text-slate-700"}`}
                          >
                            {product.quantity || 0}
                          </span>
                          {product.variants && product.variants.length > 0 && (
                            <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-tight">
                              {product.variants.length} Var
                            </span>
                          )}
                        </div>
                        <div
                          className={`h-2 w-2 rounded-full shrink-0 ${(product.quantity || 0) > 5 ? "bg-emerald-500" : "bg-slate-500"}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Switch
                          checked={isVisible}
                          onCheckedChange={(checked) =>
                            handleVisibilityToggle(product, checked)
                          }
                          disabled={togglingVisibility === product.id}
                          className="data-[state=checked]:bg-green-600"
                        />
                        {isVisible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div
                        className="flex items-center justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-lg outline-none ring-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem 
                              onClick={() => {
                                sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
                                router.push(`/dashboard/add-product?edit=${product.id}`);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4 text-slate-500" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col space-y-4">
        {isQueryLoading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-500 bg-white rounded-2xl border border-slate-100">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            <p>Loading products...</p>
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100">
            <Package className="h-12 w-12 mb-4 text-slate-200" />
            <p className="text-lg font-medium text-slate-900">No products found</p>
          </div>
        ) : (
          filteredAndSortedProducts.map((product) => {
            const isVisible = product.isVisible !== false;
            return (
              <div key={product.id} className={`bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-4 ${!isVisible ? "opacity-60" : ""}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start cursor-pointer flex-1" onClick={() => handleEdit(product)}>
                    <div className="relative h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <OptimizedImage
                        src={getImageTier(product.images, "thumb", 0) || product.image || null}
                        alt={product.name}
                        fill
                        className="object-cover"
                        imageType="thumbnail"
                        sizes="56px"
                        placeholder="empty"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-slate-900 leading-tight line-clamp-2">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {product.sku ? (
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-600 border border-slate-200">
                            {product.sku}
                          </code>
                        ) : null}
                        {!isVisible && (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-[9px] px-1.5 py-0">
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-slate-500 rounded-lg -mr-2 outline-none ring-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem 
                        onClick={() => {
                          sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
                          router.push(`/dashboard/add-product?edit=${product.id}`);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4 text-slate-500" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-50 cursor-pointer" onClick={() => handleEdit(product)}>
                  <div>
                    <div className="font-bold text-slate-900">₹{product.price?.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">{product.categoryName || "Uncategorized"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium text-slate-700">{product.quantity || 0} in stock</div>
                      {product.variants && product.variants.length > 0 && (
                        <div className="text-[10px] font-semibold text-slate-500 uppercase">{product.variants.length} Var</div>
                      )}
                    </div>
                    <Switch
                      checked={isVisible}
                      onCheckedChange={(checked) => handleVisibilityToggle(product, checked)}
                      disabled={togglingVisibility === product.id}
                      className="data-[state=checked]:bg-green-600 scale-90"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">
        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-sm text-slate-500">
               Showing <span className="font-medium text-slate-900">{filteredAndSortedProducts.length}</span> of <span className="font-medium text-slate-900">{totalCount}</span> products
           </div>
           <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isQueryLoading}
                className="h-8 text-xs bg-white border-slate-200 text-slate-600 hover:text-slate-900"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                     // Simple pagination logic
                     let pNum = i + 1;
                     if (totalPages > 5) {
                        if (page <= 3) {
                            pNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pNum = totalPages - 4 + i;
                        } else {
                            pNum = page - 2 + i;
                        }
                     }
                     if (pNum > totalPages) return null;
                     
                     return (
                         <button
                            key={pNum}
                            onClick={() => setPage(pNum)}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === pNum ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                         >
                            {pNum}
                         </button>
                     );
                 })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isQueryLoading}
                 className="h-8 text-xs bg-white border-slate-200 text-slate-600 hover:text-slate-900"
              >
                Next
              </Button>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-200"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Delete Multiple Products?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete {selectedIds.length} selected products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBulk} className="rounded-xl border-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmBulkDelete();
              }}
              disabled={isDeletingBulk}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2"
            >
              {isDeletingBulk && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isDeletingBulk ? 'Deleting...' : 'Delete All Selected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] border border-slate-700 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-3 border-r border-slate-700 pr-5">
            <span className="flex items-center justify-center bg-white text-slate-900 font-bold text-xs h-6 w-6 rounded-full">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium tracking-wide">Selected</span>
          </div>
          <div className="flex items-center gap-2 pl-1">
            <Button
              onClick={handleExportCsv}
              className="bg-slate-800 hover:bg-slate-700 text-white border-0 h-9 text-xs rounded-full px-5 shadow-none"
            >
              <Package className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => setIsBulkDeleteDialogOpen(true)}
              className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-0 h-9 text-xs rounded-full px-5 shadow-none transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white hover:bg-slate-800 h-9 w-9 p-0 rounded-full ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
