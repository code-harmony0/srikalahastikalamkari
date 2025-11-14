import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products, WishlistItem } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Trash2, Star, ArrowLeft, Package } from 'lucide-react';
import { KanjeevaramPattern, DecorativeBorder } from '@/components/ui/decorative-pattern';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        const [wishlistRes, productsRes] = await Promise.all([
          BaseCrudService.getAll<WishlistItem>('wishlistitem'),
          BaseCrudService.getAll<Products>('products'),
        ]);

        setWishlistItems(wishlistRes.items);
        setProducts(productsRes.items);
      } catch (error) {
        console.error('Error fetching wishlist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistData();
  }, []);

  const getProductById = (productId: string) => {
    return products.find(p => p._id === productId);
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    setRemovingItem(itemId);
    try {
      await BaseCrudService.delete('wishlistitem', itemId);
      setWishlistItems(prev => prev.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleAddToCart = (productId: string) => {
    // Add to cart logic here
    console.log('Adding to cart:', productId);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-background relative flex items-center justify-center">
        <KanjeevaramPattern className="text-primary/5" opacity="opacity-3" />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70 font-paragraph">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background relative">
      <KanjeevaramPattern className="text-primary/5" opacity="opacity-3" />
      
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8 md:py-12 relative">
        <DecorativeBorder className="text-accent-color/20" />
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground">
                My Wishlist
              </h1>
            </div>
            <p className="text-lg text-foreground/70 font-paragraph max-w-2xl mx-auto">
              Your carefully curated collection of beautiful Kalamkari sarees
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {/* Back to Shop Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-paragraph"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </motion.div>

        {wishlistItems.length === 0 ? (
          /* Empty Wishlist State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-primary/50" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-foreground/70 font-paragraph mb-8">
                Discover our beautiful collection of handcrafted Kalamkari sarees and add your favorites to your wishlist.
              </p>
              <Link to="/shop">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Explore Collection
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <AnimatePresence>
              {wishlistItems.map((item, index) => {
                const product = getProductById(item.productId || '');
                if (!product) return null;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={product.mainImage || 'https://static.wixstatic.com/media/07221c_b482b12fc21847f892a6607976d0f165~mv2.png?originWidth=384&originHeight=512'}
                        alt={product.title || 'Kalamkari Saree'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        width={400}
                      />
                      
                      {/* Remove from Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveFromWishlist(item._id)}
                        disabled={removingItem === item._id}
                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                      >
                        {removingItem === item._id ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                        )}
                      </motion.button>

                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-accent-color text-white font-paragraph text-xs">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Stock Status */}
                      {(product.stockQuantity || 0) <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive" className="font-paragraph">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4 md:p-6">
                      <div className="mb-3">
                        <h3 className="font-heading font-bold text-lg text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-foreground/60 font-paragraph line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-2xl font-heading font-bold text-primary">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Available Sizes */}
                      {product.availableSizes && (
                        <div className="mb-4">
                          <p className="text-xs text-foreground/60 font-paragraph mb-1">Available Sizes:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.availableSizes.split(',').map((size, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs font-paragraph">
                                {size.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Date Added */}
                      {item.dateAdded && (
                        <p className="text-xs text-foreground/50 font-paragraph mb-4">
                          Added {new Date(item.dateAdded).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      )}

                      {/* Customer Note */}
                      {item.customerNote && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-foreground/70 font-paragraph italic">
                            "{item.customerNote}"
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={(product.stockQuantity || 0) <= 0}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Link to={`/product/${product._id}`}>
                          <Button variant="outline" className="px-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Continue Shopping Section */}
        {wishlistItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12 pt-8 border-t border-gray-200"
          >
            <h3 className="text-xl font-heading font-bold text-foreground mb-4">
              Discover More Beautiful Sarees
            </h3>
            <Link to="/shop">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-paragraph">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}