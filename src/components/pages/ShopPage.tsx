import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, ProductCategories } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Products[]>([]);
  const [categories, setCategories] = useState<ProductCategories[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

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
      case 'popular':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategories, priceRange, selectedSizes, sortBy]);

  const allSizes = Array.from(
    new Set(
      products
        .flatMap(p => p.availableSizes?.split(',').map(s => s.trim()) || [])
    )
  ).sort();

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="w-full min-h-screen bg-background">
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
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-20">
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

              {/* Clear Filters */}
              {(searchTerm || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSizes([]);
                    setPriceRange([0, 10000]);
                  }}
                >
                  Clear Filters
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
                  <ChevronDown className="w-5 h-5" />
                  Filters
                </button>
                <p className="text-foreground/70 font-paragraph">
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-foreground/70">Sort by:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                    <div className="w-full h-80 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link to={`/product/${product._id}`}>
                      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-4">
                        {product.mainImage && (
                          <Image
                            src={product.mainImage}
                            alt={product.title || 'Product'}
                            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                            width={300}
                            height={400}
                          />
                        )}
                        {product.isFeatured && (
                          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-sm text-sm font-semibold">
                            Featured
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-foreground/70 text-sm font-paragraph mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-primary font-bold text-lg">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-foreground/70 font-paragraph mb-4">
                  No products found matching your filters.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSizes([]);
                    setPriceRange([0, 10000]);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
