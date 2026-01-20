// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "@/shared/hooks/use-products";
import { useWishlistStore } from "@/shared/wishlist-store";
import { useCartStore } from "@/shared/cart-store";
import { Button } from "@/shared/ui/button";
import { Slider } from "@/shared/ui/slider";
import { SlidersHorizontal, ShoppingBag, Heart, X, ChevronDown, Star, Grid3x3, List } from "lucide-react";
import { formatPrice } from "@/shared/utils";
import { toast } from "sonner";

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts();
  const wishlist = useWishlistStore();
  const cart = useCartStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Shop All");
  const [priceRange, setPriceRange] = useState([0, 50000]);

  // UI states
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const productsPerPage = 12;

  const categories = [
    "Shop All",
    "Sarees",
    "Dupattas",
    "Fabrics",
    "Blouse Pieces",
    "Accessories",
  ];

  // Filter products with auto-update (live filtering)
  const filteredProducts = products?.filter((product) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !product.title?.toLowerCase().includes(searchLower) &&
        !product.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== "Shop All") {
      if (!product.title?.toLowerCase().includes(selectedCategory.toLowerCase().slice(0, -1))) {
        return false;
      }
    }

    // Price filter
    const price = product.price || 0;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }

    return true;
  }) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      case "latest":
        return new Date(b._createdDate || 0).getTime() - new Date(a._createdDate || 0).getTime();
      case "price-asc":
        return (a.price || 0) - (b.price || 0);
      case "price-desc":
        return (b.price || 0) - (a.price || 0);
      case "default":
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, sortedProducts.length);
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const product = products?.find((p) => p.id === productId);
    if (product) {
      cart.addItem(product, 1);
      toast.success("Added to cart");
    }
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlist.items.includes(productId)) {
      wishlist.removeItem(productId);
      toast.success("Removed from wishlist");
    } else {
      wishlist.addItem(productId);
      toast.success("Added to wishlist");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Shop All");
    setPriceRange([0, 50000]);
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedCategory !== "Shop All") count++;
    if (priceRange[0] > 0 || priceRange[1] < 50000) count++;
    return count;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as any },
    },
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Page Header - Our Collection Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-background/30 to-secondary/10">
        <div className="relative z-10 max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-accent-color/10 text-primary text-sm font-semibold rounded-full border border-primary/20 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                  Premium Collection
                </span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-tight tracking-tight"
            >
              Our Collection
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="max-w-3xl mx-auto mb-12"
            >
              <p className="text-lg md:text-xl text-foreground/70 font-paragraph leading-relaxed mb-4">
                Discover our exquisite range of handcrafted Kalamkari sarees, where each piece tells a unique story of tradition, artistry, and timeless elegance
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent-color mx-auto rounded-full"></div>
            </motion.div>

            {/* Compact Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {/* Unique Designs Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="group relative"
              >
                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1, type: "spring", stiffness: 200 }}
                      className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300"
                    >
                      {products?.length || 0}
                    </motion.div>
                    <div className="text-xs font-paragraph text-foreground/80 font-bold">
                      Unique Designs
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Featured Pieces Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                className="group relative"
              >
                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-color/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.1, type: "spring", stiffness: 200 }}
                      className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300"
                    >
                      {products?.filter(p => p.isFeatured).length || 0}
                    </motion.div>
                    <div className="text-xs font-paragraph text-foreground/80 font-bold">
                      Featured Pieces
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Categories Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
                className="group relative"
              >
                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.2, type: "spring", stiffness: 200 }}
                      className="text-2xl md:text-3xl font-heading font-bold text-primary mb-1 group-hover:scale-110 transition-transform duration-300"
                    >
                      {categories.length - 1}
                    </motion.div>
                    <div className="text-xs font-paragraph text-foreground/80 font-bold">
                      Categories
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Call to Action Hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mt-12"
            >
              <p className="text-foreground/50 font-paragraph text-sm">
                Scroll down to explore our complete collection
              </p>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mt-3"
              >
                <ChevronDown className="w-5 h-5 text-foreground/30 mx-auto" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Refined Background Pattern */}
      <div className="relative bg-gradient-to-b from-background/30 to-white">
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-6 md:py-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-secondary/10 rounded-xl p-6 shadow-sm border border-border/50 sticky top-24 relative overflow-hidden">
              {/* Subtle decorative elements */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary/20 via-accent-color/20 to-primary/20"></div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-foreground">
                  Filters
                </h2>
                {getActiveFiltersCount() > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/15 text-primary border border-primary/20">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="text-xs font-semibold mb-2 block" style={{ color: '#4E3629' }}>
                  Search Products
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-paragraph transition-colors"
                    style={{
                      borderColor: '#E8E3DB',
                      backgroundColor: 'transparent'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#B38B59'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#E8E3DB'}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                      style={{ color: '#666' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full h-px mb-4" style={{ backgroundColor: 'rgba(232, 227, 219, 0.6)' }}></div>

              {/* Categories */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold mb-3" style={{ color: '#4E3629' }}>Categories</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 font-paragraph ${
                        selectedCategory === cat 
                          ? 'bg-primary/10 text-primary font-semibold translate-x-1' 
                          : 'text-muted-foreground hover:bg-secondary/10 hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px mb-4" style={{ backgroundColor: 'rgba(232, 227, 219, 0.6)' }}></div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="text-xs font-semibold mb-3 block" style={{ color: '#4E3629' }}>
                  Price Range
                </label>
                <div className="px-1">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={50000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-xs font-medium" style={{ color: '#666' }}>
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {getActiveFiltersCount() > 0 && (
                <Button
                  onClick={clearAllFilters}
                  className="w-full h-8 text-xs rounded-lg border-2 transition-all duration-200 font-medium"
                  variant="outline"
                  style={{
                    borderColor: '#E8E3DB',
                    color: '#666'
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors bg-secondary/10 border-border text-foreground hover:bg-secondary/20"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
                <span className="text-sm font-medium font-paragraph text-muted-foreground">
                  Showing {paginatedProducts.length} of {sortedProducts.length} products
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/10'}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/10'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm whitespace-nowrap font-medium text-muted-foreground hidden sm:block">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 bg-white text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="default">Most Popular</option>
                    <option value="latest">Newest</option>
                    <option value="popularity">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-2xl overflow-hidden animate-pulse shadow-lg">
                    <div className="w-full h-56" style={{ backgroundColor: '#E8E3DB' }} />
                    <div className="p-3 space-y-2">
                      <div className="h-3 rounded w-3/4" style={{ backgroundColor: '#E8E3DB' }} />
                      <div className="h-3 rounded w-1/2" style={{ backgroundColor: '#E8E3DB' }} />
                      <div className="h-3 rounded w-1/4" style={{ backgroundColor: '#E8E3DB' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        layout
                        className="group"
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        <Link href={`/products/${product.slug || product.id}`}>
                          <div className={`${viewMode === 'list' ? 'flex gap-4' : 'block h-full flex flex-col'} bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-border hover:border-primary/20 group`}>
                            <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 flex-shrink-0 aspect-square' : 'w-full aspect-[4/5]'}`}>
                              <Image
                                src={product.mainImage || "/placeholder.png"}
                                alt={product.title || "Product"}
                                width={viewMode === 'list' ? 128 : 400}
                                height={viewMode === 'list' ? 128 : 500}
                                className={`object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105`}
                              />

                              {/* Gradient Overlay */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: hoveredProduct === product.id ? 1 : 0
                                }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                              />

                              {/* Wishlist Button */}
                              <button
                                onClick={(e) => toggleWishlist(e, product.id)}
                                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-300 z-10"
                              >
                                <Heart
                                  className={`w-4 h-4 transition-colors duration-300 ${
                                    wishlist.items.includes(product.id)
                                      ? 'fill-red-500 text-red-500'
                                      : 'hover:text-red-500 text-foreground/60'
                                  }`}
                                />
                              </button>

                              {/* Sale Badge */}
                              {product.onSale && (
                                <div
                                  className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full shadow-md z-10 bg-accent text-accent-foreground"
                                >
                                  Sale
                                </div>
                              )}

                              {/* Featured Badge */}
                              {product.isFeatured && (
                                <div
                                  className="absolute top-3 left-3 px-3 py-1 text-xs rounded-full shadow-md font-semibold z-10 bg-primary text-primary-foreground"
                                >
                                  Featured
                                </div>
                              )}

                              {/* Hover Actions - Full Width Button */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                  opacity: hoveredProduct === product.id ? 1 : 0,
                                  y: hoveredProduct === product.id ? 0 : 20
                                }}
                                transition={{ duration: 0.3 }}
                                className="absolute bottom-4 left-4 right-4 flex justify-center z-10"
                              >
                                <button
                                  onClick={(e) => handleQuickAdd(e, product.id)}
                                  className="w-full py-2.5 text-sm shadow-lg rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-white text-foreground hover:bg-primary hover:text-white"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  Add to Cart
                                </button>
                              </motion.div>
                            </div>

                            <div className={`p-5 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : 'flex-grow flex flex-col justify-between'}`}>
                              <div>
                                <h3 className={`font-heading font-medium mb-1.5 leading-tight transition-colors group-hover:text-primary ${viewMode === 'list' ? 'text-lg' : 'text-base line-clamp-2'}`}>
                                  {product.title}
                                </h3>

                                <p className={`text-sm font-paragraph mb-3 leading-relaxed text-muted-foreground ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-2'}`}>
                                  {product.description}
                                </p>
                              </div>

                              <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                                <div className={`flex ${viewMode === 'list' ? 'flex-col gap-1' : 'items-center justify-between mb-2'}`}>
                                  <p className={`font-bold ${viewMode === 'list' ? 'text-sm' : 'text-base'}`} style={{ color: '#B38B59' }}>
                                    {formatPrice(product.price || 0)}
                                  </p>

                                  {/* Rating */}
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400"
                                      />
                                    ))}
                                    <span className="text-xs ml-1" style={{ color: '#666' }}>(4.5)</span>
                                  </div>
                                </div>

                                {/* Available Sizes - Show in grid view only */}
                                {product.availableSizes && viewMode === 'grid' && (
                                  <div className="flex flex-wrap gap-1">
                                    {product.availableSizes.split(',').slice(0, 3).map((size, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                                        style={{ backgroundColor: 'rgba(102, 102, 102, 0.1)', color: '#666' }}
                                      >
                                        {size.trim()}
                                      </span>
                                    ))}
                                    {product.availableSizes.split(',').length > 3 && (
                                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(102, 102, 102, 0.1)', color: '#666' }}>
                                        +{product.availableSizes.split(',').length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Quick Add for List View */}
                                {viewMode === 'list' && (
                                  <button
                                    onClick={(e) => handleQuickAdd(e, product.id)}
                                    className="h-7 px-3 text-xs shadow-lg rounded-full font-medium transition-all duration-300 flex items-center gap-1.5 flex-shrink-0"
                                    style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                      color: '#4E3629'
                                    }}
                                  >
                                    <ShoppingBag className="w-3 h-3" />
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex justify-center items-center gap-1.5 mt-8"
                  >
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3 rounded-full border-2 font-medium transition-all duration-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: '#E8E3DB',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: '#666'
                      }}
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 rounded-full font-medium transition-all duration-300 text-xs"
                          style={
                            currentPage === page
                              ? { backgroundColor: '#B38B59', color: '#FDFBF7' }
                              : { border: '2px solid #E8E3DB', backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#666' }
                          }
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 rounded-full border-2 font-medium transition-all duration-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: '#E8E3DB',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: '#666'
                      }}
                    >
                      Next
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg"
              >
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-heading font-medium mb-2" style={{ color: '#4E3629' }}>
                    No products found
                  </h3>
                  <p className="font-paragraph mb-4 leading-relaxed text-sm" style={{ color: '#666' }}>
                    We couldn't find any products matching your current filters. Try adjusting your search criteria.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="h-8 px-4 rounded-full font-medium text-xs flex items-center gap-1.5 mx-auto"
                    style={{ backgroundColor: '#B38B59', color: '#FDFBF7' }}
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
