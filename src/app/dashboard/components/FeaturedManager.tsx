"use client";

import React, { useState } from "react";
import { useInventory } from "@/shared/contexts/InventoryContext";
import { Button } from "@/app/dashboard/ui/button";
import { toast } from "sonner";
import { Trash2, Search, ArrowRight, Star, Loader2, Package, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";

const FeaturedManager = () => {
    const { products, updateProduct } = useInventory();
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Filter featured products and limit to 6
    const featuredProducts = (products?.filter((p) => p.isFeatured || p.is_featured) || []).slice(0, 6);

    const handleRemove = async (productId: string, productName: string) => {
        setLoadingId(productId);
        try {
            await updateProduct(productId, { isFeatured: false, is_featured: false });
            toast.success("Removed", {
                description: `${productName} removed from featured.`,
            });
        } catch (error) {
            toast.error("Error", { description: "Failed to update product." });
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Compact Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                        <Star className="h-5 w-5 fill-slate-800" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Featured Collection</h2>
                        <p className="text-xs text-slate-500">
                            {featuredProducts.length} / 6 products selected
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/products">
                    <Button variant="outline" className="h-9 text-xs border-slate-200 hover:bg-slate-50 gap-2">
                        Manage Selection
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                </Link>
            </div>

            {/* Compact Grid */}
            {featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                    <AnimatePresence>
                        {featuredProducts.map((product) => {
                            const isOutOfStock = (product.stock_quantity ?? product.quantity ?? 0) <= 0;
                            const isHidden = product.isVisible === false || product.is_visible === false;
                            
                            return (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                >
                                    <div className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                        {/* Image Aspect Ratio 3:4 */}
                                        <div className="aspect-[3/4] bg-slate-100 relative">
                                             <OptimizedImage
                                                src={getImageTier(product.images, "thumb", 0) || product.image || null}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                imageType="productCard"
                                                sizes="(max-width: 768px) 50vw, 25vw, 16vw"
                                                placeholder="empty"
                                            />
                                            {/* Visible Action & Status */}
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-7 w-7 rounded-full shadow-md hover:bg-red-600 bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-red-600 transition-all"
                                                    onClick={() => handleRemove(product.id, product.name)}
                                                    disabled={loadingId === product.id}
                                                    title="Remove from featured"
                                                >
                                                    {loadingId === product.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-800" />
                                                    ) : (
                                                        <X className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                                                {isOutOfStock && (
                                                    <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                                        Out of stock
                                                    </span>
                                                )}
                                                {isHidden && (
                                                    <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                                        Hidden
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Compact Details */}
                                        <div className="p-3">
                                            <h3 className="font-semibold text-slate-900 text-sm truncate" title={product.name}>
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                                ₹{(product.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, 6 - featuredProducts.length) }).map((_, i) => (
                        <motion.div
                            key={`empty-${i}`}
                            layout
                            className="aspect-[3/4] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <Package className="h-4 w-4 opacity-50" />
                            </div>
                            <span className="text-[10px] font-medium leading-tight">
                                Available<br/>Slot
                            </span>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-semibold mb-1 text-lg">No Featured Products</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Select up to 6 products to display prominently on the home page.</p>
                    <Link href="/dashboard/products">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
                            <Search className="h-4 w-4 mr-2" />
                            Browse Products
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FeaturedManager;