import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Image } from '@/components/ui/image';
import { ChevronLeft, Lock } from 'lucide-react';
import { IkatPattern } from '@/components/ui/decorative-pattern';

interface CheckoutFormData {
  // Shipping
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  // Billing
  sameAsShipping: boolean;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  // Payment
  paymentMethod: 'card' | 'upi' | 'netbanking';
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVV: string;
  upiId: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPincode: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: '',
  });

  const cartItems = [
    {
      id: '1',
      title: 'Indigo Kalamkari Saree',
      price: 4500,
      quantity: 1,
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
    {
      id: '2',
      title: 'Crimson Heritage Saree',
      price: 5200,
      quantity: 1,
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 200;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  };

  return (
    <div className="w-full min-h-screen bg-background relative">
      <IkatPattern className="text-primary/5" opacity="opacity-3" />
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8 md:py-12 relative">
        <IkatPattern className="text-accent-color/10" opacity="opacity-10" />
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Checkout
            </h1>
            <p className="text-lg text-foreground/70 font-paragraph">
              Complete your purchase securely
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-12 relative z-10">
        <IkatPattern className="text-primary/5" opacity="opacity-5" />
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['shipping', 'payment', 'confirmation'].map((s, index) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold transition-colors ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['shipping', 'payment', 'confirmation'].indexOf(step) > index
                    ? 'bg-primary/30 text-primary'
                    : 'bg-gray-200 text-foreground/50'
                }`}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={`w-12 h-1 transition-colors ${
                    ['shipping', 'payment', 'confirmation'].indexOf(step) > index
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Shipping Address */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-8">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-semibold text-foreground mb-2 block">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-semibold text-foreground mb-2 block">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-2 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="address" className="text-sm font-semibold text-foreground mb-2 block">
                      Street Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="city" className="text-sm font-semibold text-foreground mb-2 block">
                        City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-semibold text-foreground mb-2 block">
                        State
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="pincode" className="text-sm font-semibold text-foreground mb-2 block">
                        PIN Code
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-semibold text-foreground mb-2 block">
                        Country
                      </Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="India">India</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                    Billing Address
                  </h2>

                  <div className="flex items-center gap-3 mb-6">
                    <Checkbox
                      id="sameAsShipping"
                      name="sameAsShipping"
                      checked={formData.sameAsShipping}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, sameAsShipping: checked as boolean }))
                      }
                    />
                    <Label htmlFor="sameAsShipping" className="text-sm font-paragraph text-foreground cursor-pointer">
                      Same as shipping address
                    </Label>
                  </div>

                  {!formData.sameAsShipping && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="billingAddress" className="text-sm font-semibold text-foreground mb-2 block">
                          Street Address
                        </Label>
                        <Input
                          id="billingAddress"
                          name="billingAddress"
                          type="text"
                          value={formData.billingAddress}
                          onChange={handleChange}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="billingCity" className="text-sm font-semibold text-foreground mb-2 block">
                            City
                          </Label>
                          <Input
                            id="billingCity"
                            name="billingCity"
                            type="text"
                            value={formData.billingCity}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingState" className="text-sm font-semibold text-foreground mb-2 block">
                            State
                          </Label>
                          <Input
                            id="billingState"
                            name="billingState"
                            type="text"
                            value={formData.billingState}
                            onChange={handleChange}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingPincode" className="text-sm font-semibold text-foreground mb-2 block">
                          PIN Code
                        </Label>
                        <Input
                          id="billingPincode"
                          name="billingPincode"
                          type="text"
                          value={formData.billingPincode}
                          onChange={handleChange}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Link to="/cart">
                    <Button variant="outline" className="border-primary/50 hover:bg-primary/5">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-sm"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </form>
            )}

            {/* Payment Method */}
            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="space-y-8">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                    Payment Method
                  </h2>

                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, paymentMethod: value as 'card' | 'upi' | 'netbanking' }))
                    }
                  >
                    <div className="space-y-4">
                      {/* Credit/Debit Card */}
                      <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer font-paragraph">
                          Credit/Debit Card
                        </Label>
                      </div>

                      {/* UPI */}
                      <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer font-paragraph">
                          UPI
                        </Label>
                      </div>

                      {/* Net Banking */}
                      <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="netbanking" id="netbanking" />
                        <Label htmlFor="netbanking" className="flex-1 cursor-pointer font-paragraph">
                          Net Banking
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Details */}
                {formData.paymentMethod === 'card' && (
                  <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-6">
                      Card Details
                    </h3>

                    <div className="mb-6">
                      <Label htmlFor="cardNumber" className="text-sm font-semibold text-foreground mb-2 block">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        maxLength={19}
                        className="w-full"
                      />
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="cardName" className="text-sm font-semibold text-foreground mb-2 block">
                        Cardholder Name
                      </Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="cardExpiry" className="text-sm font-semibold text-foreground mb-2 block">
                          Expiry Date
                        </Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          type="text"
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          maxLength={5}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCVV" className="text-sm font-semibold text-foreground mb-2 block">
                          CVV
                        </Label>
                        <Input
                          id="cardCVV"
                          name="cardCVV"
                          type="text"
                          placeholder="123"
                          value={formData.cardCVV}
                          onChange={handleChange}
                          maxLength={3}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI */}
                {formData.paymentMethod === 'upi' && (
                  <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-6">
                      UPI Details
                    </h3>

                    <div>
                      <Label htmlFor="upiId" className="text-sm font-semibold text-foreground mb-2 block">
                        UPI ID
                      </Label>
                      <Input
                        id="upiId"
                        name="upiId"
                        type="text"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/5"
                    onClick={() => setStep('shipping')}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-sm"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Purchase
                  </Button>
                </div>
              </form>
            )}

            {/* Order Confirmation */}
            {step === 'confirmation' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                  Order Confirmed!
                </h2>
                <p className="text-lg text-foreground/70 font-paragraph mb-8">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                  <p className="text-sm text-foreground/70 font-paragraph mb-2">
                    Order Number
                  </p>
                  <p className="text-2xl font-heading font-bold text-foreground mb-6">
                    #KLM-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>

                  <p className="text-sm text-foreground/70 font-paragraph mb-2">
                    Estimated Delivery
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    5-7 Business Days
                  </p>
                </div>

                <p className="text-foreground/70 font-paragraph mb-8">
                  A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
                </p>

                <Link to="/shop">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-sm">
                    Continue Shopping
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Order Summary Sidebar */}
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
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded"
                      width={80}
                      height={100}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-heading font-semibold text-foreground line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-foreground/70 font-paragraph">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

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

              <div className="flex justify-between items-center">
                <span className="text-lg font-heading font-bold text-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
