import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Products } from '@/entities';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Heart, Share2, ChevronLeft, ShoppingBag } from 'lucide-react';
import { PatolaPattern } from '@/components/ui/decorative-pattern';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Products | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  } as const;

  return (
    <div className="w-full min-h-screen bg-background relative">
      <PatolaPattern className="text-primary/5" opacity="opacity-3" />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 relative">
        <PatolaPattern className="text-accent-color/10" opacity="opacity-10" />
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-4 relative z-10">
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
      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-12 relative z-10">
        <PatolaPattern className="text-primary/5" opacity="opacity-5" />
        <Link
          to="/shop"
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8 w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.mainImage && (
              <Image
                src={product.mainImage}
                alt={product.title || 'Product'}
                className="w-full h-auto rounded-lg shadow-sm"
                width={600}
                height={800}
              />
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-bold text-primary">
                ₹{product.price?.toLocaleString('en-IN')}
              </p>
              {product.isFeatured && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-sm text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>

            <p className="text-lg text-foreground/70 font-paragraph mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <motion.div variants={itemVariants} className="mb-8">
                <Label className="text-sm font-semibold text-foreground mb-4 block">
                  Select Size
                </Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map(size => (
                      <motion.div
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center"
                      >
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="w-5 h-5"
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className="ml-3 text-sm font-medium text-foreground cursor-pointer border border-gray-300 px-4 py-2 rounded-sm hover:border-primary transition-colors"
                        >
                          {size}
                        </Label>
                      </motion.div>
                    ))}
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Quantity Selection */}
            <motion.div variants={itemVariants} className="mb-8">
              <Label className="text-sm font-semibold text-foreground mb-4 block">
                Quantity
              </Label>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-sm flex items-center justify-center hover:border-primary transition-colors"
                >
                  −
                </motion.button>
                <span className="text-lg font-semibold text-foreground w-8 text-center">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-sm flex items-center justify-center hover:border-primary transition-colors"
                >
                  +
                </motion.button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-4 mb-8">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg rounded-sm group">
                  <ShoppingBag className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                  Add to Cart
                </Button>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-12 h-12 border rounded-sm flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-gray-300 text-foreground/70 hover:border-primary'
                }`}
              >
                <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 border border-gray-300 rounded-sm flex items-center justify-center text-foreground/70 hover:border-primary transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </motion.button>
            </motion.div>

            {/* Product Details Accordion */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 border-t border-gray-200 pt-8">
              <motion.details variants={itemVariants} className="group">
                <summary className="flex items-center justify-between cursor-pointer py-4 text-lg font-heading font-semibold text-foreground hover:text-primary transition-colors">
                  Product Description
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    className="group-open:rotate-180 transition-transform"
                  >
                    ▼
                  </motion.span>
                </summary>
                <p className="text-foreground/70 font-paragraph leading-relaxed pb-4">
                  {product.description}
                </p>
              </motion.details>

              <motion.details variants={itemVariants} className="group">
                <summary className="flex items-center justify-between cursor-pointer py-4 text-lg font-heading font-semibold text-foreground hover:text-primary transition-colors">
                  Material & Craft
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    className="group-open:rotate-180 transition-transform"
                  >
                    ▼
                  </motion.span>
                </summary>
                <p className="text-foreground/70 font-paragraph leading-relaxed pb-4">
                  This exquisite Kalamkari saree is hand-painted using traditional techniques with natural dyes. Each piece is a unique work of art, meticulously crafted by skilled artisans. The saree features intricate patterns inspired by nature and cultural motifs.
                </p>
              </motion.details>

              <motion.details variants={itemVariants} className="group">
                <summary className="flex items-center justify-between cursor-pointer py-4 text-lg font-heading font-semibold text-foreground hover:text-primary transition-colors">
                  Care Instructions
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 0 }}
                    className="group-open:rotate-180 transition-transform"
                  >
                    ▼
                  </motion.span>
                </summary>
                <ul className="text-foreground/70 font-paragraph leading-relaxed pb-4 space-y-2 list-disc list-inside">
                  <li>Dry clean recommended for best results</li>
                  <li>Hand wash in cold water with mild detergent if preferred</li>
                  <li>Avoid direct sunlight while drying</li>
                  <li>Iron on low heat on the reverse side</li>
                  <li>Store in a cool, dry place away from moisture</li>
                </ul>
              </motion.details>
            </motion.div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-200">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl font-heading font-bold text-foreground mb-8"
            >
              You Might Also Like
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relProduct, index) => (
                <motion.div
                  key={relProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Link to={`/product/${relProduct._id}`}>
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow mb-4">
                      {relProduct.mainImage && (
                        <Image
                          src={relProduct.mainImage}
                          alt={relProduct.title || 'Product'}
                          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={400}
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {relProduct.title}
                    </h3>
                    <p className="text-primary font-bold text-lg">
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
