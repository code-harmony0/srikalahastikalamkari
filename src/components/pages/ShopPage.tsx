import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ShoppingBag, Grid3X3, List, Filter, Search, Heart, Star, X, SlidersHorizontal } from 'lucide-react';
import { KanjeevaramPattern, DecorativeBorder } from '@/components/ui/decorative-pattern';

export default function ShopPage() {
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          BaseCrudService.getAll<Products>('products'),
          BaseCrudService.getAll<ProductCategories>('productcategories'),
        ]);

        setProducts(productsRes.items);
        setCategories(categoriesRes.items.filter(c => c.isActive));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Category filter
    if (selectedCategories.length > 0) {
      // Note: This would need category reference field in products
      // For now, we'll skip category filtering as products don't have category references
    }

    // Color filter (basic implementation based on title/description)
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => {
        const text = `${p.title} ${p.description}`.toLowerCase();
        return selectedColors.some(color => text.includes(color.toLowerCase()));
      });
    }

    // Featured filter
    if (featuredOnly) {
      filtered = filtered.filter(p => p.isFeatured);
    }

    // In stock filter (assuming all products are in stock for now)
    if (inStock) {
      // This would check actual stock levels in a real implementation
      filtered = filtered.filter(p => true);
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.availableSizes) return false;
        const sizes = p.availableSizes.split(',').map(s => s.trim());
        return selectedSizes.some(size => sizes.includes(size));
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a._createdDate || 0).getTime();
          const dateB = new Date(b._createdDate || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'name-az':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'name-za':
        filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'featured':
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, priceRange, selectedSizes, selectedColors, featuredOnly, inStock, sortBy]);

  const allSizes = Array.from(
    new Set(
      products
        .flatMap(p => p.availableSizes?.split(',').map(s => s.trim()) || [])
    )
  ).sort();

  const availableColors = ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Black', 'White', 'Indigo', 'Crimson', 'Golden'];

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setFeaturedOnly(false);
    setInStock(false);
    setPriceRange([0, 10000]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, priceRange, selectedSizes, selectedColors, featuredOnly, inStock, sortBy]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedSizes.length > 0) count++;
    if (selectedColors.length > 0) count++;
    if (featuredOnly) count++;
    if (inStock) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
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
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  } as const;

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Page Header - Our Collection Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-background/30 to-secondary/10">
        {/* Subtle decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <KanjeevaramPattern className="text-primary" opacity="opacity-100" />
        </div>
        
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
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              {/* Unique Designs Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                className="group relative"
              >
                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1, type: "spring", stiffness: 200 }}
                      className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300"
                    >
                      {products.length}
                    </motion.div>
                    <div className="text-sm font-paragraph text-foreground/80 font-medium">
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
                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-color/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.1, type: "spring", stiffness: 200 }}
                      className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300"
                    >
                      {products.filter(p => p.isFeatured).length}
                    </motion.div>
                    <div className="text-sm font-paragraph text-foreground/80 font-medium">
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
                <div className="relative bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-white/40 hover:border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.2, type: "spring", stiffness: 200 }}
                      className="text-3xl md:text-4xl font-heading font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300"
                    >
                      {categories.length}
                    </motion.div>
                    <div className="text-sm font-paragraph text-foreground/80 font-medium">
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
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <KanjeevaramPattern className="text-primary" opacity="opacity-100" />
        </div>
        
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 sticky top-24 relative overflow-hidden">
              {/* Subtle decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-accent-color/20 to-primary/20"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">
                  Filters
                </h2>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/20 px-2 py-1 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  Search Products
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <Input
                    type="text"
                    placeholder="Search by name, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-200 focus:border-primary focus:ring-primary/20 h-10"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-foreground mb-4 block">
                  Price Range
                </Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={10000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-3 text-sm text-foreground/70 font-medium">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-foreground mb-4 block">
                    Available Sizes
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all duration-200 font-medium ${
                          selectedSizes.includes(size)
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-white text-foreground/70 border-gray-200 hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-foreground mb-4 block">
                  Colors
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`px-2 py-1.5 text-sm rounded-lg border-2 transition-all duration-200 font-medium ${
                        selectedColors.includes(color)
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-white text-foreground/70 border-gray-200 hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-foreground mb-4 block">
                  Quick Filters
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Checkbox
                      id="featured-only"
                      checked={featuredOnly}
                      onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
                      className="border-2 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="featured-only"
                      className="ml-3 text-sm text-foreground/80 cursor-pointer font-medium"
                    >
                      Featured Only
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="in-stock"
                      checked={inStock}
                      onCheckedChange={(checked) => setInStock(checked === true)}
                      className="border-2 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor="in-stock"
                      className="ml-3 text-sm text-foreground/80 cursor-pointer font-medium"
                    >
                      In Stock Only
                    </Label>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-primary hover:text-primary transition-all duration-200 h-9"
                  onClick={clearAllFilters}
                >
                  <X className="w-4 h-4 mr-2" />
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/60">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors px-3 py-2 rounded-xl border border-primary/20 hover:border-primary/40 bg-white/60 text-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="bg-primary/15 text-primary text-xs border-primary/20 rounded-full px-2 py-0.5">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/70 font-paragraph text-sm font-medium">
                      Showing {currentProducts.length} of {filteredProducts.length} products
                    </span>
                    {getActiveFiltersCount() > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-primary text-sm hover:text-primary/80 transition-colors font-medium underline underline-offset-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white/60">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-transparent text-foreground/70 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-transparent text-foreground/70 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-foreground/70 whitespace-nowrap font-medium">Sort by:</Label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white/80 font-medium transition-all duration-200"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-az">Name: A to Z</option>
                      <option value="name-za">Name: Z to A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {getActiveFiltersCount() > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-foreground/70 font-medium">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="outline" className="flex items-center gap-1 rounded-full text-xs">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedSizes.map(size => (
                      <Badge key={size} variant="outline" className="flex items-center gap-1 rounded-full text-xs">
                        Size: {size}
                        <button onClick={() => handleSizeToggle(size)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedColors.map(color => (
                      <Badge key={color} variant="outline" className="flex items-center gap-1 rounded-full text-xs">
                        Color: {color}
                        <button onClick={() => handleColorToggle(color)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {featuredOnly && (
                      <Badge variant="outline" className="flex items-center gap-1 rounded-full text-xs">
                        Featured Only
                        <button onClick={() => setFeaturedOnly(false)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                      <Badge variant="outline" className="flex items-center gap-1 rounded-full text-xs">
                        ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                        <button onClick={() => setPriceRange([0, 10000])}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Products Grid/List */}
              {loading ? (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/80 rounded-2xl overflow-hidden animate-pulse shadow-lg">
                      <div className={`w-full ${viewMode === 'grid' ? 'h-64' : 'h-32'} bg-gray-200`} />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}
                  >
                    <AnimatePresence mode="popLayout">
                      {currentProducts.map((product, index) => (
                        <motion.div
                          key={product._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          layout
                          className="group"
                          onMouseEnter={() => setHoveredProduct(product._id)}
                          onMouseLeave={() => setHoveredProduct(null)}
                        >
                          <Link to={`/product/${product._id}`}>
                            <div className={`${viewMode === 'list' ? 'flex gap-4' : 'block'} bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/60 hover:border-primary/20`}>
                              <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 flex-shrink-0' : 'w-full'}`}>
                                {product.mainImage && (
                                  <Image
                                    src={product.mainImage}
                                    alt={product.title || 'Product'}
                                    className={`w-full ${viewMode === 'grid' ? 'h-64' : 'h-32'} object-cover transition-all duration-500 ease-out ${
                                      hoveredProduct === product._id ? 'scale-105' : 'scale-100'
                                    }`}
                                    width={300}
                                    height={viewMode === 'grid' ? 320 : 128}
                                  />
                                )}
                                
                                {/* Gradient Overlay */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ 
                                    opacity: hoveredProduct === product._id ? 1 : 0 
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent"
                                />

                                {/* Wishlist Button */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleWishlist(product._id);
                                  }}
                                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-300"
                                >
                                  <Heart 
                                    className={`w-4 h-4 transition-colors duration-300 ${
                                      wishlist.includes(product._id) 
                                        ? 'fill-red-500 text-red-500' 
                                        : 'text-foreground/60 hover:text-red-500'
                                    }`} 
                                  />
                                </button>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-1">
                                  {product.isFeatured && (
                                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-md">
                                      Featured
                                    </Badge>
                                  )}
                                  {product.stockQuantity && product.stockQuantity < 5 && (
                                    <Badge variant="destructive" className="text-xs px-2 py-1 rounded-full shadow-md">
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>

                                {/* Hover Actions */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ 
                                    opacity: hoveredProduct === product._id ? 1 : 0,
                                    y: hoveredProduct === product._id ? 0 : 20
                                  }}
                                  transition={{ duration: 0.3 }}
                                  className="absolute bottom-3 left-3 right-3 flex justify-center"
                                >
                                  <Button 
                                    size="sm" 
                                    className="h-9 px-4 text-sm bg-white/95 hover:bg-white text-foreground shadow-lg rounded-full font-medium transition-all duration-300"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      // Add to cart logic here
                                    }}
                                  >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                </motion.div>
                              </div>

                              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                <motion.h3
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.1 }}
                                  className="text-lg font-heading font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight"
                                >
                                  {product.title}
                                </motion.h3>
                                
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.15 }}
                                  className="text-foreground/70 text-sm font-paragraph mb-3 line-clamp-2 leading-relaxed"
                                >
                                  {product.description}
                                </motion.p>

                                <div className="flex items-center justify-between mb-3">
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-primary font-bold text-lg"
                                  >
                                    ₹{product.price?.toLocaleString('en-IN')}
                                  </motion.p>

                                  {/* Rating */}
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className="w-3 h-3 fill-yellow-400 text-yellow-400" 
                                      />
                                    ))}
                                    <span className="text-xs text-foreground/60 ml-1">(4.5)</span>
                                  </div>
                                </div>

                                {/* Available Sizes */}
                                {product.availableSizes && viewMode === 'grid' && (
                                  <div className="flex flex-wrap gap-1">
                                    {product.availableSizes.split(',').slice(0, 3).map((size, i) => (
                                      <span 
                                        key={i}
                                        className="text-xs px-2 py-1 bg-gray-100/80 text-foreground/70 rounded-full font-medium"
                                      >
                                        {size.trim()}
                                      </span>
                                    ))}
                                    {product.availableSizes.split(',').length > 3 && (
                                      <span className="text-xs px-2 py-1 bg-gray-100/80 text-foreground/70 rounded-full font-medium">
                                        +{product.availableSizes.split(',').length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
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
                      className="flex justify-center items-center gap-2 mt-12"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-10 px-4 rounded-full border-2 border-gray-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 font-medium"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`h-10 w-10 rounded-full font-medium transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'border-2 border-gray-200 hover:border-primary hover:text-primary bg-white/80'
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-10 px-4 rounded-full border-2 border-gray-200 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 font-medium"
                      >
                        Next
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-heading font-medium text-foreground mb-3">
                      No products found
                    </h3>
                    <p className="text-foreground/70 font-paragraph mb-6 leading-relaxed">
                      We couldn't find any products matching your current filters. Try adjusting your search criteria.
                    </p>
                    <Button
                      onClick={clearAllFilters}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 rounded-full font-medium"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-b from-white/60 to-gray-50/80 backdrop-blur-md border-t border-white/60 mt-16">
        <div className="max-w-[120rem] mx-auto px-6 md:px-8 lg:px-12 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-heading font-light text-foreground mb-3">
                Discover More
              </h3>
              <p className="text-foreground/70 font-paragraph mb-6 max-w-xl mx-auto leading-relaxed">
                Explore our complete collection of handcrafted Kalamkari sarees and discover the perfect piece for your wardrobe.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/about">
                  <Button variant="outline" className="h-10 px-6 rounded-full border-2 border-gray-200 hover:border-primary hover:text-primary bg-white/80 font-medium">
                    Our Story
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button className="h-10 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
