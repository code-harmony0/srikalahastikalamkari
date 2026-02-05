"use client";

import React, { useState } from "react";
import { useInventory } from "@/shared/contexts/InventoryContext";
import { Button } from "@/app/dashboard/ui/button";
import { toast } from "sonner";
import { Trash2, Search, ArrowRight, Star, Loader2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FeaturedManager = () => {
    const { products, updateProduct } = useInventory();
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Filter featured products
    const featuredProducts = products?.filter((p) => p.isFeatured) || [];

    const handleRemove = async (productId: string, productName: string) => {
        setLoadingId(productId);
        try {
            await updateProduct(productId, { isFeatured: false });
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {featuredProducts.map((product) => (
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
                                     <img
                                        src={product.images?.[0] || product.image || ""}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay Action */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-full shadow-lg scale-90 hover:scale-100 transition-transform"
                                            onClick={() => handleRemove(product.id, product.name)}
                                            disabled={loadingId === product.id}
                                        >
                                            {loadingId === product.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                
                                {/* Compact Details */}
                                <div className="p-3">
                                    <h3 className="font-semibold text-slate-900 text-sm truncate" title={product.name}>
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                        ₹{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
            
            {featuredProducts.length === 0 && (
                <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-semibold mb-1">No Featured Products</h3>
                    <p className="text-slate-500 text-sm mb-4">Select up to 6 products to display on the home page.</p>
                    <Link href="/dashboard/products">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">
                            Go to Products
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FeaturedManager;
