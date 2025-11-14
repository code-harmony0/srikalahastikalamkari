import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Image } from '@/components/ui/image';
import { ChevronLeft, Lock, Shield, Truck, Clock, CreditCard, Smartphone, Building2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
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
      <section className="bg-white border-b border-gray-200 py-4 md:py-6 relative">
        <IkatPattern className="text-accent-color/10" opacity="opacity-10" />
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-sm text-foreground/70 font-paragraph">
              Complete your purchase securely
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-6 relative z-10">
        <IkatPattern className="text-primary/5" opacity="opacity-5" />
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { key: 'shipping', label: 'Shipping' },
            { key: 'payment', label: 'Payment' },
            { key: 'confirmation', label: 'Confirmation' }
          ].map((s, index) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s.key
                      ? 'bg-primary text-primary-foreground'
                      : ['shipping', 'payment', 'confirmation'].indexOf(step) > index
                      ? 'bg-primary/30 text-primary'
                      : 'bg-gray-200 text-foreground/50'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-xs mt-1 font-paragraph ${
                  step === s.key ? 'text-primary font-medium' : 'text-foreground/60'
                }`}>
                  {s.label}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`w-8 h-0.5 mt-[-12px] transition-colors ${
                    ['shipping', 'payment', 'confirmation'].indexOf(step) > index
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Shipping Address */}
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="firstName" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        First Name <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="lastName" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="email" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="phone" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="relative">
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="address" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        Street Address <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="relative">
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="city" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        City <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="state" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        State <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="pincode"
                        name="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label 
                        htmlFor="pincode" 
                        className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                      >
                        PIN Code <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 bg-white text-sm transition-colors"
                    >
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                    <Label htmlFor="country" className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-600">
                      Country
                    </Label>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                    Billing Address
                  </h2>

                  <div className="flex items-center gap-3 mb-4">
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
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          id="billingAddress"
                          name="billingAddress"
                          type="text"
                          value={formData.billingAddress}
                          onChange={handleChange}
                          placeholder=" "
                          className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                        />
                        <Label 
                          htmlFor="billingAddress" 
                          className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                        >
                          Street Address
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <Input
                            id="billingCity"
                            name="billingCity"
                            type="text"
                            value={formData.billingCity}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                          />
                          <Label 
                            htmlFor="billingCity" 
                            className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                          >
                            City
                          </Label>
                        </div>
                        <div className="relative">
                          <Input
                            id="billingState"
                            name="billingState"
                            type="text"
                            value={formData.billingState}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                          />
                          <Label 
                            htmlFor="billingState" 
                            className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                          >
                            State
                          </Label>
                        </div>
                        <div className="relative">
                          <Input
                            id="billingPincode"
                            name="billingPincode"
                            type="text"
                            value={formData.billingPincode}
                            onChange={handleChange}
                            placeholder=" "
                            className="peer w-full h-12 px-4 pt-4 pb-2 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                          />
                          <Label 
                            htmlFor="billingPincode" 
                            className="absolute left-4 top-3 text-gray-500 text-sm transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs"
                          >
                            PIN Code
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link to="/cart">
                    <Button variant="outline" className="border-primary/50 hover:bg-primary/5 transition-all duration-300">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-sm transition-all duration-300 hover:shadow-lg"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </form>
            )}

            {/* Payment Method */}
            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">
                    Payment Method
                  </h2>

                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, paymentMethod: value as 'card' | 'upi' | 'netbanking' }))
                    }
                  >
                    <div className="space-y-3">
                      {/* Credit/Debit Card */}
                      <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer font-paragraph text-sm">
                          Credit/Debit Card
                        </Label>
                      </div>

                      {/* UPI */}
                      <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="upi" id="upi" />
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer font-paragraph text-sm">
                          UPI
                        </Label>
                      </div>

                      {/* Net Banking */}
                      <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="netbanking" id="netbanking" />
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <Label htmlFor="netbanking" className="flex-1 cursor-pointer font-paragraph text-sm">
                          Net Banking
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Details */}
                {formData.paymentMethod === 'card' && (
                  <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                      Card Details
                    </h3>

                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          maxLength={19}
                          className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                        />
                        <Label htmlFor="cardNumber" className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-600">
                          Card Number <span className="text-red-500">*</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <Input
                          id="cardName"
                          name="cardName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={handleChange}
                          className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                        />
                        <Label htmlFor="cardName" className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-600">
                          Cardholder Name <span className="text-red-500">*</span>
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Input
                            id="cardExpiry"
                            name="cardExpiry"
                            type="text"
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={handleChange}
                            maxLength={5}
                            className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                          />
                          <Label htmlFor="cardExpiry" className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-600">
                            Expiry Date <span className="text-red-500">*</span>
                          </Label>
                        </div>
                        <div className="relative">
                          <Input
                            id="cardCVV"
                            name="cardCVV"
                            type="text"
                            placeholder="123"
                            value={formData.cardCVV}
                            onChange={handleChange}
                            maxLength={3}
                            className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                          />
                          <Label htmlFor="cardCVV" className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-600">
                            CVV <span className="text-red-500">*</span>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI */}
                {formData.paymentMethod === 'upi' && (
                  <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                      UPI Details
                    </h3>

                    <div className="relative">
                      <Input
                        id="upiId"
                        name="upiId"
                        type="text"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={handleChange}
                        className="w-full h-12 px-4 border-2 border-gray-300 rounded-md focus:border-primary focus:ring-0 transition-colors"
                      />
                      <Label htmlFor="upiId" className="absolute left-4 -top-2 bg-white px-1 text-xs text-gray-600">
                        UPI ID <span className="text-red-500">*</span>
                      </Label>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/5 transition-all duration-300"
                    onClick={() => setStep('shipping')}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-sm transition-all duration-300 hover:shadow-lg"
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
                className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
                  Order Confirmed!
                </h2>
                <p className="text-base text-foreground/70 font-paragraph mb-6">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-xs text-foreground/70 font-paragraph mb-1">
                    Order Number
                  </p>
                  <p className="text-lg font-heading font-bold text-foreground mb-4">
                    #KLM-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>

                  <p className="text-xs text-foreground/70 font-paragraph mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    5-7 Business Days
                  </p>
                </div>

                <p className="text-sm text-foreground/70 font-paragraph mb-6">
                  A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>
                </p>

                <Link to="/shop">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 rounded-sm transition-all duration-300 hover:shadow-lg">
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
            {/* Desktop Order Summary */}
            <div className="hidden lg:block bg-white rounded-lg p-5 shadow-lg border border-gray-200 sticky top-24">
              <h2 className="text-lg font-heading font-bold text-foreground mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <Image
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-14 object-cover rounded"
                      width={48}
                      height={56}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-semibold text-foreground line-clamp-2 mb-1">
                        {item.title}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-foreground/70 font-paragraph">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70 font-paragraph">Subtotal</span>
                  <span className="text-sm font-semibold text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70 font-paragraph">Shipping</span>
                  <span className="text-sm font-semibold text-foreground">₹{shipping.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70 font-paragraph">Tax (5%)</span>
                  <span className="text-sm font-semibold text-foreground">₹{tax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-heading font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>

              {/* Trust Badges */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Shield className="w-3 h-3" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Truck className="w-3 h-3" />
                  <span>Free shipping on orders over ₹5,000</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Clock className="w-3 h-3" />
                  <span>Estimated delivery: 5-7 business days</span>
                </div>
              </div>
            </div>

            {/* Mobile Collapsible Summary */}
            <div className="lg:hidden bg-white rounded-lg shadow-lg border border-gray-200 mb-4">
              <button
                onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <div>
                  <span className="text-lg font-heading font-bold text-foreground">
                    Order Summary
                  </span>
                  <span className="text-xl font-bold text-primary ml-4">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                {isSummaryCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-foreground/70" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-foreground/70" />
                )}
              </button>

              {!isSummaryCollapsed && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  {/* Items */}
                  <div className="space-y-3 mb-4 pt-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <Image
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-14 object-cover rounded"
                          width={48}
                          height={56}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-heading font-semibold text-foreground line-clamp-2 mb-1">
                            {item.title}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-foreground/70 font-paragraph">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-bold text-primary">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70 font-paragraph">Subtotal</span>
                      <span className="text-sm font-semibold text-foreground">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70 font-paragraph">Shipping</span>
                      <span className="text-sm font-semibold text-foreground">₹{shipping.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/70 font-paragraph">Tax (5%)</span>
                      <span className="text-sm font-semibold text-foreground">₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <Shield className="w-3 h-3" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <Clock className="w-3 h-3" />
                      <span>Estimated delivery: 5-7 business days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Sticky CTA */}
            {step !== 'confirmation' && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-heading font-bold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {step === 'shipping' && (
                  <Button 
                    onClick={handleShippingSubmit}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-sm transition-all duration-300"
                  >
                    Continue to Payment
                  </Button>
                )}
                {step === 'payment' && (
                  <Button 
                    onClick={handlePaymentSubmit}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-sm transition-all duration-300"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Complete Purchase
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
