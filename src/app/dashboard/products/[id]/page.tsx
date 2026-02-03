"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInventory } from "@/shared/contexts/InventoryContext";
import { Button } from "@/app/dashboard/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  FileText,
  Palette,
  Settings,
  Eye,
  EyeOff,
  DollarSign,
  Boxes,
} from "lucide-react";
import Barcode from "react-barcode";
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
import { toast } from "sonner";

// Collapsible Section Component for Product Details
const DetailSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            {icon}
          </div>
          <span className="text-base font-semibold text-slate-900">
            {title}
          </span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  ;

  console.log("📄 ProductDetail page loaded with ID:", id);

  const inventoryContext = useInventory();
  console.log("🔧 ProductDetail: Inventory context:", !!inventoryContext);

  const { products, deleteProduct, loading } = inventoryContext;
  console.log("📊 ProductDetail: Context data:", {
    productsCount: products?.length,
    loading,
  });
  const [product, setProduct] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Temporarily disabled to test page loading
  // useEffect(() => {
  //   console.log("🔍 ProductDetail useEffect triggered:", { id, loading, productsCount: products.length });
  //   ...
  // }, [id, products, router, toast, loading]);

  // Load product data with proper error handling
  useEffect(() => {
    console.log("🔍 ProductDetail: Starting product load for ID:", id);
    console.log("📊 Context state:", {
      loading,
      productsCount: products.length,
      products,
    });

    // If still loading products, wait
    if (loading) {
      console.log("⏳ Waiting for products to load...");
      return;
    }

    // If no products loaded, show error
    if (products.length === 0) {
      console.log("❌ No products available");
      setProduct(null);
      return;
    }

    // Find the product by ID
    console.log(
      "🔍 Searching for product ID:",
      id,
      "among",
      products.length,
      "products",
    );
    console.log(
      "📋 Available product IDs:",
      products.map((p) => p.id),
    );

    const foundProduct = products.find((p: any) => String(p.id) === String(id));

    if (foundProduct) {
      console.log(
        "✅ Product found:",
        foundProduct.name,
        "ID:",
        foundProduct.id,
      );
      setProduct(foundProduct);
    } else {
      console.log("❌ Product not found:", id);
      console.log(
        "📋 Available products:",
        products.map((p) => ({ id: p.id, name: p.name })),
      );
      setProduct(null);
    }
  }, [id, products, loading]);

  const handleDelete = async () => {
    if (product) {
      await deleteProduct(product.id);
      toast.success("Product Deleted", {
        description: `${product.name} has been removed`
      });
      router.push("/dashboard/products");
    }
  };

  const handleEdit = () => {
    sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
    router.push(`/dashboard/add-product?edit=${product.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <Package className="h-12 w-12 animate-bounce text-slate-400" />
          <p className="text-slate-500 font-medium">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <Package className="h-12 w-12 text-slate-400" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              Product Not Found
            </h2>
            <p className="text-slate-500 mb-4">
              The product with ID{" "}
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                {id}
              </code>{" "}
              could not be found.
            </p>
            <p className="text-sm text-slate-400 mb-4">
              {products.length > 0
                ? `${products.length} products are available.`
                : "No products are currently available."}
            </p>
            <Button onClick={() => router.push("/dashboard/products")}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images || (product.image ? [product.image] : []);
  const currentImage =
    images[currentImageIndex] || "https://placehold.co/600x600?text=No+Image";
  const isVisible = product.isVisible !== false;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header with Product Title */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/products")}
              className="hover:bg-slate-100 rounded-xl h-10 w-10 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {product.in_stock || product.inStock ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    In Stock
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 px-2.5 py-0.5 rounded-full text-xs"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />
                    Out of Stock
                  </Badge>
                )}
                {isVisible ? (
                  <Badge className="bg-slate-100 text-slate-700 border-slate-300 px-2.5 py-0.5 rounded-full text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Visible
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-600 border-slate-300 px-2.5 py-0.5 rounded-full text-xs"
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                )}
                {product.categoryName && (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-600 border-slate-300 px-2.5 py-0.5 rounded-full text-xs"
                  >
                    {product.categoryName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="h-10 border-slate-300 hover:bg-slate-50 rounded-xl"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-10 bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Images (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
            <div className="aspect-square bg-slate-50 flex items-center justify-center p-6">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                    currentImageIndex === index
                      ? "ring-2 ring-slate-900 scale-105"
                      : "ring-1 ring-slate-200 hover:ring-slate-300 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Barcode Card */}
          {product.barcode && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
                Product Barcode
              </h3>
              <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <div className="bg-white p-3 rounded-lg border border-slate-300">
                  <Barcode value={product.barcode} height={50} width={1.5} />
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  {product.barcode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pricing Card */}
          <DetailSection
            title="Pricing & Inventory"
            icon={<DollarSign className="h-4 w-4" />}
          >
            <div className="pt-4 space-y-4">
              <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Current Price
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <>
                        <span className="text-lg text-slate-400 line-through">
                          ₹{product.originalPrice?.toLocaleString()}
                        </span>
                        <Badge className="bg-red-600 hover:bg-red-600 text-white px-2 py-0.5 rounded-full text-xs">
                          {Math.round(
                            ((product.originalPrice - product.price) /
                              product.originalPrice) *
                              100,
                          )}
                          % OFF
                        </Badge>
                      </>
                    )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Stock Quantity
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {product.quantity || product.stock_quantity || 0}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      units
                    </span>
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Status
                  </p>
                  <p
                    className={`text-xl font-bold ${(product.quantity || 0) > 5 ? "text-emerald-600" : "text-slate-600"}`}
                  >
                    {(product.quantity || 0) > 5 ? "Healthy" : "Low Stock"}
                  </p>
                </div>
              </div>
            </div>
          </DetailSection>

          {/* Description */}
          <DetailSection
            title="Description"
            icon={<FileText className="h-4 w-4" />}
          >
            <div className="pt-4">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                {product.description || "No description available."}
              </p>
            </div>
          </DetailSection>

          {/* Colors */}
          {product.colors &&
            Array.isArray(product.colors) &&
            product.colors.length > 0 && (
              <DetailSection
                title="Available Colors"
                icon={<Palette className="h-4 w-4" />}
                defaultOpen={false}
              >
                <div className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono font-medium text-slate-600">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DetailSection>
            )}

          {/* Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <DetailSection
                title="Specifications"
                icon={<Settings className="h-4 w-4" />}
                defaultOpen={false}
              >
                <div className="pt-4 space-y-2">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-slate-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {value as string}
                        </span>
                      </div>
                    ),
                  )}
                  {product.material && (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-500">
                        Material
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {product.material}
                      </span>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

          {/* Variants */}
          {product.variants &&
            Array.isArray(product.variants) &&
            product.variants.length > 0 && (
              <DetailSection
                title={`Product Variants (${product.variants.length})`}
                icon={<Boxes className="h-4 w-4" />}
                defaultOpen={false}
              >
                <div className="pt-4 space-y-3">
                  {product.variants.map((variant: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {variant.size && (
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">
                              Size
                            </p>
                            <p className="font-semibold text-slate-900">
                              {variant.size}
                            </p>
                          </div>
                        )}
                        {variant.color && (
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">
                              Color
                            </p>
                            <div className="flex items-center gap-1.5">
                              {variant.color.startsWith("#") && (
                                <div
                                  className="w-4 h-4 rounded-full border border-slate-300"
                                  style={{ backgroundColor: variant.color }}
                                />
                              )}
                              <p className="font-semibold text-slate-900">
                                {variant.color}
                              </p>
                            </div>
                          </div>
                        )}
                        {variant.sku && (
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">SKU</p>
                            <p className="font-mono font-semibold text-slate-900">
                              {variant.sku}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Stock</p>
                          <p className="font-semibold text-slate-900">
                            {variant.stock_quantity || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}
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
              Are you sure you want to delete "{product.name}"? This action
              cannot be undone and will remove the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-200"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductDetails;
