import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield, Truck, Clock } from 'lucide-react';
import { BandhaniPattern } from '@/components/ui/decorative-pattern';

interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  size: string;
  image: string;
  color?: string;
  stockLevel?: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Indigo Kalamkari Saree',
      price: 4500,
      originalPrice: 5000,
      quantity: 1,
      size: 'Standard',
      color: 'Indigo Blue',
      stockLevel: 3,
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
    {
      id: '2',
      title: 'Crimson Heritage Saree',
      price: 5200,
      quantity: 1,
      size: 'Standard',
      color: 'Deep Crimson',
      stockLevel: 12,
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

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
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 },
    },
  } as const;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const savings = originalSubtotal - subtotal;
  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  return (
    <div className="w-full min-h-screen bg-background relative">
      <BandhaniPattern className="text-primary/5" opacity="opacity-3" />
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-6 md:py-8 relative">
        <BandhaniPattern className="text-accent-color/10" opacity="opacity-10" />
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-base text-foreground/70 font-paragraph">
              Review your items and proceed to checkout
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-6 relative z-10">
        <BandhaniPattern className="text-primary/5" opacity="opacity-5" />
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      layout
                      className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 group"
                    >
                    <div className="flex gap-4 items-start">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <Image
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-24 object-cover rounded-md"
                            width={80}
                            height={96}
                          />
                          {item.stockLevel && item.stockLevel <= 5 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Low Stock
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-heading font-bold text-foreground truncate pr-2">
                            {item.title}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-foreground/70 mb-3">
                          <span>Size: <span className="font-medium text-foreground">{item.size}</span></span>
                          {item.color && (
                            <span className="flex items-center gap-1">
                              Color: 
                              <div className="w-3 h-3 rounded-full bg-blue-600 border border-gray-300 ml-1"></div>
                              <span className="font-medium text-foreground">{item.color}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{item.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="text-xl font-bold text-primary">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3 text-foreground" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3 text-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>

              {/* Continue Shopping */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-4"
              >
                <Link to="/shop">
                  <Button 
                    variant="outline" 
                    className="border-primary/50 hover:bg-primary/5 hover:border-primary group transition-all duration-300"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping 
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 sticky top-24">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70 font-paragraph">Subtotal</span>
                    <span className="font-semibold text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm font-paragraph">You Save</span>
                      <span className="font-semibold">-₹{savings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70 font-paragraph">Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shipping.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70 font-paragraph">Tax (5%)</span>
                    <span className="font-semibold text-foreground">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">Free shipping on orders over ₹5,000</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-heading font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base rounded-sm font-paragraph transition-all duration-300 hover:shadow-lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Trust Indicators */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    <Shield className="w-3 h-3" />
                    <span>Secure checkout with 256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    <Clock className="w-3 h-3" />
                    <span>Estimated delivery: 3-5 business days</span>
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Summary */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-heading font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <Link to="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base rounded-sm font-paragraph">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <ShoppingBag className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
              Your cart is empty
            </h2>
            <p className="text-base text-foreground/70 font-paragraph mb-6">
              Explore our collection and add some beautiful sarees to your cart.
            </p>
            <Link to="/shop">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-sm transition-all duration-300 hover:shadow-lg">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
