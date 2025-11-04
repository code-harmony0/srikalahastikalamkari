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
    <div className="w-full min-h-screen bg-background relative">
      <KanjeevaramPattern className="text-primary/5" opacity="opacity-3" />
      
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Our Collection
            </h1>
            <p className="text-lg text-foreground/70 font-paragraph max-w-2xl mx-auto">
              Discover our exquisite range of handcrafted Kalamkari sarees, each piece telling a unique story of tradition and artistry
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center items-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-primary">{products.length}</div>
                <div className="text-sm text-foreground/60 font-paragraph">Total Products</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-primary">{products.filter(p => p.isFeatured).length}</div>
                <div className="text-sm text-foreground/60 font-paragraph">Featured</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-heading font-bold text-primary">{categories.length}</div>
                <div className="text-sm text-foreground/60 font-paragraph">Categories</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-20 relative">
              <DecorativeBorder position="top" className="opacity-50" />
              <DecorativeBorder position="bottom" className="opacity-50" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">
                  Filters
                </h2>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {getActiveFiltersCount()} active
                  </Badge>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
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
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between mt-3 text-sm text-foreground/70">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-6">
                  <Label className="text-sm font-semibold text-foreground mb-4 block">
                    Sizes
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          selectedSizes.includes(size)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-white text-foreground/70 border-gray-300 hover:border-primary'
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
                <div className="grid grid-cols-3 gap-2">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        selectedColors.includes(color)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-white text-foreground/70 border-gray-300 hover:border-primary'
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
                    />
                    <Label
                      htmlFor="featured-only"
                      className="ml-3 text-sm text-foreground/70 cursor-pointer"
                    >
                      Featured Only
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="in-stock"
                      checked={inStock}
                      onCheckedChange={(checked) => setInStock(checked === true)}
                    />
                    <Label
                      htmlFor="in-stock"
                      className="ml-3 text-sm text-foreground/70 cursor-pointer"
                    >
                      In Stock
                    </Label>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-foreground/70 font-paragraph text-sm">
                    Showing {filteredProducts.length} of {products.length} products
                  </span>
                  {getActiveFiltersCount() > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white text-foreground/70 hover:bg-gray-50'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all ${
                      viewMode === 'list' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white text-foreground/70 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-foreground/70 whitespace-nowrap">Sort by:</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                className="mb-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground/70 font-medium">Active filters:</span>
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Search: "{searchTerm}"
                      <button onClick={() => setSearchTerm('')}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedSizes.map(size => (
                    <Badge key={size} variant="outline" className="flex items-center gap-1">
                      Size: {size}
                      <button onClick={() => handleSizeToggle(size)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedColors.map(color => (
                    <Badge key={color} variant="outline" className="flex items-center gap-1">
                      Color: {color}
                      <button onClick={() => handleColorToggle(color)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {featuredOnly && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Featured Only
                      <button onClick={() => setFeaturedOnly(false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Badge variant="outline" className="flex items-center gap-1">
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
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse shadow-sm">
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
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      className="group"
                      onMouseEnter={() => setHoveredProduct(product._id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <Link to={`/product/${product._id}`}>
                        <div className={`${viewMode === 'list' ? 'flex gap-4' : 'block'} bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}>
                          <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 flex-shrink-0' : 'w-full'}`}>
                            {product.mainImage && (
                              <Image
                                src={product.mainImage}
                                alt={product.title || 'Product'}
                                className={`w-full ${viewMode === 'grid' ? 'h-64' : 'h-32'} object-cover transition-transform duration-500 ease-out ${
                                  hoveredProduct === product._id ? 'scale-110' : 'scale-100'
                                }`}
                                width={300}
                                height={viewMode === 'grid' ? 320 : 128}
                              />
                            )}
                            
                            {/* Overlay Actions */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: hoveredProduct === product._id ? 1 : 0 
                              }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2"
                            >
                              <Button 
                                size="sm" 
                                className="h-8 px-3 text-xs bg-white/90 hover:bg-white text-foreground shadow-lg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // Add to cart logic here
                                }}
                              >
                                <ShoppingBag className="w-3 h-3 mr-1" />
                                Add to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white border-white/90 shadow-lg"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleWishlist(product._id);
                                }}
                              >
                                <Heart 
                                  className={`w-3 h-3 ${
                                    wishlist.includes(product._id) 
                                      ? 'fill-red-500 text-red-500' 
                                      : 'text-foreground'
                                  }`} 
                                />
                              </Button>
                            </motion.div>

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                              {product.isFeatured && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  Featured
                                </Badge>
                              )}
                              {product.stockQuantity && product.stockQuantity < 5 && (
                                <Badge variant="destructive" className="text-xs">
                                  Low Stock
                                </Badge>
                              )}
                            </div>

                            {/* Wishlist Heart */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleWishlist(product._id);
                              }}
                              className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all"
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  wishlist.includes(product._id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-foreground/60'
                                }`} 
                              />
                            </button>
                          </div>

                          <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                            <motion.h3
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.1 }}
                              className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2"
                            >
                              {product.title}
                            </motion.h3>
                            
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.15 }}
                              className="text-foreground/70 text-sm font-paragraph mb-3 line-clamp-2"
                            >
                              {product.description}
                            </motion.p>

                            <div className="flex items-center justify-between">
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-primary font-bold text-lg"
                              >
                                ₹{product.price?.toLocaleString('en-IN')}
                              </motion.p>

                              {/* Rating placeholder */}
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
                              <div className="mt-3 flex flex-wrap gap-1">
                                {product.availableSizes.split(',').slice(0, 3).map((size, i) => (
                                  <span 
                                    key={i}
                                    className="text-xs px-2 py-1 bg-gray-100 text-foreground/70 rounded"
                                  >
                                    {size.trim()}
                                  </span>
                                ))}
                                {product.availableSizes.split(',').length > 3 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-foreground/70 rounded">
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
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white rounded-lg shadow-sm"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-foreground/70 font-paragraph mb-6">
                    We couldn't find any products matching your current filters. Try adjusting your search criteria.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
  );
}
