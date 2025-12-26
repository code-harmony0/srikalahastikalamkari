import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { Products, ProductReviews } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Heart, Share2, ChevronLeft, ShoppingBag, Star, Shield, Truck, Users, Clock, Check } from 'lucide-react';
import { PatolaPattern } from '@/components/ui/decorative-pattern';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Products | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Products[]>([]);
  const [reviews, setReviews] = useState<ProductReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const product = await BaseCrudService.getById<Products>('products', id);
        setProduct(product);

        // Fetch related products (featured products excluding current)
        const { items } = await BaseCrudService.getAll<Products>('products');
        const related = items
          .filter(p => p._id !== id && p.isFeatured)
          .slice(0, 4);
        setRelatedProducts(related);

        // Fetch reviews for this product
        const { items: allReviews } = await BaseCrudService.getAll<ProductReviews>('productreviews');
        const productReviews = allReviews.filter(r => r.productName === product.title);
        setReviews(productReviews);

        // Set default size
        if (product.availableSizes) {
          const sizes = product.availableSizes.split(',').map(s => s.trim());
          setSelectedSize(sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
          Product not found
        </h1>
        <Link to="/shop">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const availableSizes = product.availableSizes
    ? product.availableSizes.split(',').map(s => s.trim())
    : [];

  // Mock data for enhanced features
  const rating = 4.5;
  const reviewCount = 127;
  const stockCount = 8;
  const viewersCount = 12;

  // Calculate average rating from reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : rating;

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="w-full min-h-screen bg-background relative">
      {/* Sticky Add to Cart Bar */}
      {showStickyBar && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 py-3">
          <div className="max-w-[100rem] mx-auto px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {product.mainImage && (
                <Image
                  src={product.mainImage}
                  alt={product.title || 'Product'}
                  className="w-12 h-12 object-cover rounded"
                  width={48}
                  height={48}
                />
              )}
              <div>
                <h3 className="font-heading font-semibold text-foreground text-sm">{product.title}</h3>
                <p className="text-primary font-bold">₹{product.price?.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors text-sm"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:border-primary transition-colors text-sm"
                >
                  +
                </button>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 h-auto rounded-sm">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Link to="/shop" className="hover:text-primary transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-8 relative z-10">
        <Link
          to="/shop"
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Image - 55% */}
          <div className="lg:col-span-7">
            {product.mainImage && (
              <div className="sticky top-4">
                <Image
                  src={product.mainImage}
                  alt={product.title || 'Product'}
                  className="w-full h-[500px] md:h-[600px] object-cover rounded-lg shadow-sm"
                  width={600}
                  height={600}
                />
                {/* Thumbnail Previews */}
                <div className="flex gap-3 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer border-2 border-gray-300 hover:border-primary rounded-lg overflow-hidden transition-colors"
                    >
                      <Image
                        src={product.mainImage}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-20 h-20 object-cover"
                        width={80}
                        height={80}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info - 45% */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
                {product.title}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.2 }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(avgRating as string))
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.div>
                  ))}
                  <span className="text-sm font-semibold text-foreground ml-1">{avgRating}</span>
                </div>
                <span className="text-sm text-foreground/60">({reviews.length || reviewCount} reviews)</span>
              </div>

              {/* Price and Badges */}
              <div className="flex items-center gap-3 mb-4">
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  ₹{product.price?.toLocaleString('en-IN')}
                </p>
                {product.isFeatured && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Featured
                  </Badge>
                )}
                <Badge className="bg-green-50 text-green-700 border border-green-200">
                  Free Shipping
                </Badge>
              </div>

              {/* Stock and Activity */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground/70">
                    {stockCount} in stock
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground/50" />
                  <span className="text-sm text-foreground/70">
                    {viewersCount} people viewing
                  </span>
                </div>
              </div>

              {/* Free Shipping Info */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Free shipping on orders over ₹2,000
                </span>
              </div>
            </div>

            <Separator />

            <p className="text-base text-foreground/70 font-paragraph leading-relaxed">
              {product.description}
            </p>

            <Separator />

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <Label className="text-sm font-semibold text-foreground mb-3 block">
                  Size
                </Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className={`cursor-pointer border px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-300 text-foreground hover:border-primary'
                          }`}
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <Label className="text-sm font-semibold text-foreground mb-3 block">
                Quantity
              </Label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 border border-gray-300 rounded-sm flex items-center justify-center hover:border-primary transition-colors"
                >
                  −
                </button>
                <span className="text-base font-semibold text-foreground w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 border border-gray-300 rounded-sm flex items-center justify-center hover:border-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base rounded-sm font-paragraph">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </motion.div>
                <motion.button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 border rounded-sm flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-gray-300 text-foreground/70 hover:border-primary'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 border border-gray-300 rounded-sm flex items-center justify-center text-foreground/70 hover:border-primary transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Delivery & Security Info */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <Truck className="w-4 h-4" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/70">
                  <Clock className="w-4 h-4" />
                  <span>Order within 2 hours for same-day processing</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-base font-heading font-semibold text-foreground hover:text-primary">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="text-foreground/70 font-paragraph leading-relaxed">
                  {product.description}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="material">
                <AccordionTrigger className="text-base font-heading font-semibold text-foreground hover:text-primary">
                  Material & Craft
                </AccordionTrigger>
                <AccordionContent className="text-foreground/70 font-paragraph leading-relaxed">
                  This exquisite Kalamkari saree is hand-painted using traditional techniques with natural dyes. Each piece is a unique work of art, meticulously crafted by skilled artisans. The saree features intricate patterns inspired by nature and cultural motifs.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="care">
                <AccordionTrigger className="text-base font-heading font-semibold text-foreground hover:text-primary">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-foreground/70 font-paragraph leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Dry clean recommended for best results
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Hand wash in cold water with mild detergent if preferred
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Avoid direct sunlight while drying
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Iron on low heat on the reverse side
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      Store in a cool, dry place away from moisture
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping">
                <AccordionTrigger className="text-base font-heading font-semibold text-foreground hover:text-primary">
                  Shipping & Returns
                </AccordionTrigger>
                <AccordionContent className="text-foreground/70 font-paragraph leading-relaxed space-y-2">
                  <p>• Free shipping on orders over ₹2,000</p>
                  <p>• Standard delivery: 3-5 business days</p>
                  <p>• Express delivery available for ₹200</p>
                  <p>• 30-day return policy</p>
                  <p>• Easy exchanges for size or color</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
            Customer Reviews
          </h2>

          {/* Average Rating Display */}
          {reviews.length > 0 && (
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{avgRating}</div>
                  <div className="flex items-center gap-1 justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(avgRating as string))
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/60">Based on {reviews.length} reviews</p>
                </div>
                <Separator orientation="vertical" className="h-20" />
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter(r => r.rating === stars).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-sm text-foreground/60 w-8">{stars}★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-yellow-400"
                          />
                        </div>
                        <span className="text-sm text-foreground/60 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-4 mb-6">
              {displayedReviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">
                        {review.customerName}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {review.reviewDate
                          ? new Date(review.reviewDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recently'}
                      </p>
                    </div>
                    {review.isVerifiedPurchase && (
                      <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{review.rating}/5</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-foreground/70 font-paragraph leading-relaxed">
                    {review.reviewText}
                  </p>

                  {index < displayedReviews.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg border border-gray-200 text-center mb-6">
              <p className="text-foreground/60 font-paragraph">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          )}

          {/* Show More / Write Review Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {reviews.length > 3 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="flex-1 px-6 py-3 border border-primary text-primary rounded-sm font-paragraph font-medium hover:bg-primary/5 transition-colors"
              >
                {showAllReviews ? 'Show Less Reviews' : 'Show More Reviews'}
              </motion.button>
            )}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={reviews.length > 3 ? 'flex-1' : 'w-full'}
            >
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-sm font-paragraph">
                Write a Review
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
              You Might Also Like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((relProduct) => (
                <motion.div
                  key={relProduct._id}
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <Link to={`/product/${relProduct._id}`}>
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-3">
                      {relProduct.mainImage && (
                        <Image
                          src={relProduct.mainImage}
                          alt={relProduct.title || 'Product'}
                          className="w-full h-48 md:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={300}
                        />
                      )}
                      {relProduct.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm md:text-base font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {relProduct.title}
                    </h3>
                    <p className="text-primary font-bold text-sm md:text-base">
                      ₹{relProduct.price?.toLocaleString('en-IN')}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
