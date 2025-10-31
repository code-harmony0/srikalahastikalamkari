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
import { ChevronDown, ShoppingBag, Grid3X3, List, Filter } from 'lucide-react';
import { DecorativePattern, FloatingDots, DecorativeBorder } from '@/components/ui/decorative-pattern';

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
      <DecorativePattern className="text-primary/5" opacity="opacity-3" />
      <FloatingDots className="text-accent-color" count={12} />
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8 md:py-12">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Our Collection
            </h1>
            <p className="text-lg text-foreground/70 font-paragraph">
              Discover our exquisite range of handcrafted Kalamkari sarees
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-12">
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
              <h2 className="text-xl font-heading font-bold text-foreground mb-6">
                Filters
              </h2>

              {/* Search */}
              <div className="mb-8">
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  Search
                </Label>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Price Range */}
              <div className="mb-8">
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
                <div className="flex justify-between mt-4 text-sm text-foreground/70">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-8">
                  <Label className="text-sm font-semibold text-foreground mb-4 block">
                    Sizes
                  </Label>
                  <div className="space-y-3">
                    {allSizes.map(size => (
                      <div key={size} className="flex items-center">
                        <Checkbox
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => handleSizeToggle(size)}
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="ml-3 text-sm text-foreground/70 cursor-pointer"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              <div className="mb-8">
                <Label className="text-sm font-semibold text-foreground mb-4 block">
                  Colors
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableColors.map(color => (
                    <div key={color} className="flex items-center">
                      <Checkbox
                        id={`color-${color}`}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={() => handleColorToggle(color)}
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className="ml-3 text-sm text-foreground/70 cursor-pointer"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-8">
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
              {(searchTerm || selectedSizes.length > 0 || selectedColors.length > 0 || featuredOnly || inStock || priceRange[0] > 0 || priceRange[1] < 10000) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                >
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 text-primary font-semibold"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
                <p className="text-foreground/70 font-paragraph">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-white text-foreground/70 hover:bg-gray-50'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-white text-foreground/70 hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-foreground/70">Sort by:</Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Products Grid/List */}
            {loading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                    <div className={`w-full ${viewMode === 'grid' ? 'h-80' : 'h-48'} bg-gray-200`} />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}
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
                    >
                      <Link to={`/product/${product._id}`}>
                        <div className={`${viewMode === 'list' ? 'flex gap-6' : 'block'}`}>
                          <div className={`relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 mb-4 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                            {product.mainImage && (
                              <Image
                                src={product.mainImage}
                                alt={product.title || 'Product'}
                                className={`w-full ${viewMode === 'grid' ? 'h-80' : 'h-32'} object-cover group-hover:scale-110 transition-transform duration-500 ease-out`}
                                width={300}
                                height={400}
                              />
                            )}
                            {product.isFeatured && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-sm text-sm font-semibold"
                              >
                                Featured
                              </motion.div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="absolute bottom-0 left-0 right-0 p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <Button size="sm" variant="secondary" className="h-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background">
                                <ShoppingBag className="h-4 w-4 mr-2" /> View
                              </Button>
                            </motion.div>
                          </div>
                          <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
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
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-primary font-bold text-lg"
                            >
                              ₹{product.price?.toLocaleString('en-IN')}
                            </motion.p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-foreground/70 font-paragraph mb-4">
                  No products found matching your filters.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
