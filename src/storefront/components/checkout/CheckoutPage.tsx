"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/shared/utils";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: products = [] } = useProducts();
  const cart = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Info
    name: "",
    email: "",
    phone: "",
    // Shipping Address
    address: "",
    city: "",
    state: "",
    pincode: "",
    // Payment (mock)
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const cartItems = cart.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cart.getTotalPrice(products);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear cart
    cart.clearCart();

    toast.success("Order placed successfully!", {
      description: "You'll receive a confirmation email shortly.",
      icon: <CheckCircle2 className="w-5 h-5" />,
    });

    // Redirect to success page or home
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add items to cart before checkout</p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-amber-700 to-orange-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Link href="/cart">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Checkout</h1>
        </div>
      </section>

      {/* Checkout Form */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information */}
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-heading font-bold text-foreground">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-heading font-bold text-foreground">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">PIN Code *</label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        pattern="[0-9]{6}"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                        placeholder="XXXXXX"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="border border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-heading font-bold text-foreground">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base font-mono"
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">Expiry Date *</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        required
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">CVV *</label>
                      <input
                        type="text"
                        name="cardCvv"
                        required
                        maxLength={3}
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-base"
                        placeholder="XXX"
                      />
                    </div>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 py-4 border-t border-border mt-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  </div>
                  
                  <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Your payment information is encrypted and secure
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-lg border border-border/60">
                <CardHeader className="bg-secondary/5 border-b border-border/50">
                  <CardTitle className="text-xl font-heading font-bold text-foreground">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Order Items */}
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-secondary/20">
                    {cartItems.map(({ productId, quantity, product }) => product && (
                      <div key={productId} className="flex gap-3">
                        <div className="text-sm flex-1">
                          <p className="font-semibold text-foreground line-clamp-1">{product.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">Qty: {quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice((product.price || 0) * quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (18%)</span>
                      <span className="font-semibold">{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-border pt-3 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="font-heading font-bold text-lg text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Mobile Sticky Button */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-lg"
              disabled={isProcessing}
            >
              Place Order — {formatPrice(total)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
