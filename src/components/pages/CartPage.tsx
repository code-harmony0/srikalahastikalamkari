import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      title: 'Indigo Kalamkari Saree',
      price: 4500,
      quantity: 1,
      size: 'Standard',
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
    {
      id: '2',
      title: 'Crimson Heritage Saree',
      price: 5200,
      quantity: 1,
      size: 'Standard',
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 200 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

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
              Shopping Cart
            </h1>
            <p className="text-lg text-foreground/70 font-paragraph">
              Review your items and proceed to checkout
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-12">
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                      {/* Product Image */}
                      <div className="md:col-span-1">
                        <Image
                          src={item.image}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-lg"
                          width={200}
                          height={250}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="md:col-span-2">
                        <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-foreground/70 font-paragraph mb-4">
                          Size: <span className="font-semibold text-foreground">{item.size}</span>
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="md:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2 w-fit">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="w-8 text-center font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-paragraph text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <Link to="/shop">
                  <Button variant="outline" className="border-primary/50 hover:bg-primary/5 hover:border-primary group">
                    Continue Shopping <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
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
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 sticky top-24">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70 font-paragraph">Subtotal</span>
                    <span className="font-semibold text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70 font-paragraph">Shipping</span>
                    <span className="font-semibold text-foreground">₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70 font-paragraph">Tax (5%)</span>
                    <span className="font-semibold text-foreground">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-heading font-bold text-foreground">Total</span>
                  <span className="text-3xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <Link to="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg rounded-sm font-paragraph">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-xs text-foreground/50 font-paragraph text-center mt-4">
                  Secure checkout powered by industry-leading encryption
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Your cart is empty
            </h2>
            <p className="text-lg text-foreground/70 font-paragraph mb-8">
              Explore our collection and add some beautiful sarees to your cart.
            </p>
            <Link to="/shop">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-sm">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
