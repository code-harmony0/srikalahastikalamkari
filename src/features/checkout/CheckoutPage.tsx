"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProducts } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { useCoupon, incrementCouponUsage } from "@/shared/hooks/use-coupon";
import {
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Lock,
  ShieldCheck,
  CreditCard,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { formatPrice, cn } from "@/shared/utils";
import { toast } from "sonner";
import { PageHero } from "./page-hero";
import { ShippingWidget } from "./ShippingWidget";
import environment from "@/shared/config/environment";
// --- Razorpay Script Loader ---
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Razorpay) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

// --- Types ---
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface FormErrors {
  [key: string]: string;
}

// --- Reusable Input Component ---
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  placeholder,
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}) => (
  <div className="w-full">
    <label className="block text-sm font-inter font-medium text-[#3B2C23]/80 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={cn(
        "w-full px-4 py-3 rounded-[10px] border bg-[#FFF8F0]/30 focus:outline-none transition-all placeholder:text-[#3B2C23]/30",
        error
          ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
          : "border-[#EAD6C3] focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40",
      )}
      placeholder={placeholder}
    />
    {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { data: productsData } = useProducts();
  const products = productsData?.data || [];
  const cart = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const { appliedCoupon, isLoading: couponLoading, error: couponError, applyCoupon, removeCoupon } = useCoupon();

  // --- Cart Calculations ---
  const cartItems = useMemo(
    () =>
      cart.items
        .map((item) => {
          const product = products.find((p: any) => p.id === item.productId);
          return { ...item, product };
        })
        .filter((item) => item.product),
    [cart.items, products],
  );

  const subtotal = useMemo(
    () => cart.getTotalPrice(products),
    [cart, products],
  );
  const discount = appliedCoupon?.discountAmount || 0;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  // Handle coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const success = await applyCoupon(couponCode, subtotal);
    if (success) {
      toast.success("Coupon applied!", { description: `You saved ₹${discount}` });
    }
  };

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    const pincodeRegex = /^\d{6}$/;
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!pincodeRegex.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form.")
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create Razorpay order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to initiate payment")

      // Step 2: Prepare cart items to send to verify route
      const cartPayload = cart.items
        .map((item) => {
          const product = products.find((p: any) => p.id === item.productId)
          if (!product) return null
          return { productId: product.id, price: product.price, quantity: item.quantity }
        })
        .filter(Boolean)

      // Step 3: Load Razorpay JS and open payment modal
      await loadRazorpayScript()

      const options = {
        key: environment.razorpay.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Shri Kalahasti Kalamkari",
        description: "Authentic Kalamkari Purchase",
        order_id: orderData.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#A4552A" },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          // Step 4: Verify payment and save order on server
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              formData,
              cartItems: cartPayload,
              totalAmount: total,
            }),
          })

          const verifyData = await verifyRes.json()
          if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed")

          cart.clearCart()
          toast.success("Order placed successfully!", {
            description: `Order #${verifyData.orderId.slice(0, 8)} confirmed. Thank you!`,
          })
          setTimeout(() => router.push("/orders"), 1500)
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.error("Payment cancelled. Please try again.")
          },
        },
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", () => {
        setIsProcessing(false)
        toast.error("Payment failed. Please try again.")
      })
      rzp.open()
    } catch (error) {
      console.error("Checkout Error:", error)
      toast.error("Something went wrong. Please try again.")
      setIsProcessing(false)
    }
  };

  // --- Empty State ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-[#FFF4E8] rounded-full flex items-center justify-center mb-4 border border-[#C19A5B]/30">
          <Wallet className="w-8 h-8 text-[#C19A5B]" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-[#3B2C23] mb-4">
          Your cart is empty
        </h1>
        <p className="font-inter text-[#3B2C23]/60 mb-8">
          Please add items to your cart before checking out.
        </p>
        <Link href="/products">
          <button className="px-8 py-3 bg-[#A4552A] text-[#FFF8F0] rounded-lg font-bold tracking-wide uppercase text-xs hover:bg-[#8B3F20] transition-colors shadow-lg shadow-[#A4552A]/20">
            Return to Shop
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* 🏛 Page Hero */}
      <PageHero
        icon={Wallet}
        title="Checkout"
        subtitle="Almost there — confirm your details and place your order."
      />

      {/* 📦 Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
        >
          {/* LEFT COLUMN: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[14px] border border-[#EAD6C3] p-6 md:p-8 shadow-sm"
            >
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#3B2C23] mb-6 pb-4 border-b border-[#EAD6C3]/50">
                Customer Information
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    required
                  />
                  <FormInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                    placeholder="name@example.com"
                  />
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </motion.div>

            {/* 2. Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[14px] border border-[#EAD6C3] p-6 md:p-8 shadow-sm"
            >
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#3B2C23] mb-6 pb-4 border-b border-[#EAD6C3]/50">
                Shipping Address
              </h2>
              <div className="space-y-5">
                <FormInput
                  label="Address Line 1"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  required
                  placeholder="House No, Building, Street"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <FormInput
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    required
                  />
                  <FormInput
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    error={errors.state}
                    required
                  />
                  <FormInput
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    error={errors.pincode}
                    required
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-[#3B2C23]/50 italic mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> We currently deliver
                  across India and selected international regions.
                </p>
              </div>
            </motion.div>

            {/* 3. Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[14px] border border-[#EAD6C3] p-6 md:p-8 shadow-sm"
            >
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#3B2C23] mb-6 pb-4 border-b border-[#EAD6C3]/50">
                Payment Method
              </h2>

              <div className="rounded-[10px] border border-[#C19A5B]/30 bg-[#FFF8F0]/20 p-4 flex items-start gap-4">
                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-[#A4552A] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A4552A]" />
                </div>
                <div>
                  <h3 className="font-inter font-bold text-[#3B2C23] text-sm flex items-center gap-2">
                    Online Payment
                    <span className="text-[10px] bg-[#3B2C23] text-white px-2 py-0.5 rounded-full">
                      Secure
                    </span>
                  </h3>
                  <p className="text-xs text-[#3B2C23]/60 mt-1 mb-3">
                    Cards, UPI, Netbanking, Wallets (via Razorpay)
                  </p>

                  {/* Trust Badges */}
                  <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all">
                    <div className="flex gap-2">
                      <CreditCard className="w-6 h-6 text-[#3B2C23]" />
                      <Wallet className="w-6 h-6 text-[#3B2C23]" />
                    </div>
                    <span className="text-[10px] text-[#3B2C23]/50 border-l border-[#C19A5B] pl-3">
                      Powered by Razorpay
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#3B2C23]/50 bg-[#F9FAFB] py-2 rounded-md border border-[#EAD6C3]/30">
                <Lock className="w-3 h-3" />
                <span>
                  Payments are encrypted and secured with 256-bit SSL.
                </span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Summary & Trust */}
          <div className="lg:col-span-1">
            {/* 🛑 FIX IS HERE: Wrapper div is sticky, allowing inner items to scroll naturally if needed */}
            <div className="sticky top-24 space-y-6">
              {/* Order Summary Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-[14px] border border-[#EAD6C3] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <h3 className="font-playfair text-xl font-bold text-[#3B2C23] mb-6">
                  Order Summary
                </h3>

                {/* Product List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-[#EAD6C3]">
                  {cartItems.map(({ product, quantity }) =>
                    product ? (
                      <div
                        key={product.id}
                        className="flex gap-3 py-3 border-b border-[#EAD6C3]/30 last:border-0"
                      >
                        {/* Tiny Image */}
                        <div className="w-12 h-16 bg-[#FDFBF7] rounded border border-[#EAD6C3]/50 shrink-0 overflow-hidden relative">
                          <img
                            src={product.mainImage || "/images/placeholder.png"}
                            alt={product.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-semibold text-[#3B2C23] text-xs line-clamp-2 leading-relaxed">
                            {product.title || product.name}
                          </p>
                          <p className="text-[10px] text-[#3B2C23]/60 mt-1">
                            Qty: {quantity}
                          </p>
                        </div>
                        <p className="font-inter font-medium text-[#A4552A] text-xs">
                          {formatPrice((product.price || 0) * quantity)}
                        </p>
                      </div>
                    ) : null,
                  )}
                </div>

                {/* Coupon Section */}
                <div className="pt-4 border-t border-[#EAD6C3]">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-[#C19A5B]" />
                    <span className="text-sm font-medium text-[#3B2C23]">Have a coupon?</span>
                  </div>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs text-green-600">
                          (-{formatPrice(appliedCoupon.discountAmount)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        <X className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 text-sm border border-[#EAD6C3] rounded-lg bg-[#FFF8F0]/30 focus:outline-none focus:border-[#C19A5B] uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-[#3B2C23] text-white text-sm font-medium rounded-lg hover:bg-[#3B2C23]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  )}
                  
                  {couponError && (
                    <p className="text-xs text-red-500 mt-2">{couponError}</p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-[#EAD6C3]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3B2C23]/70 font-inter">
                      Subtotal
                    </span>
                    <span className="font-medium text-[#3B2C23]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  
                  {/* Discount Row */}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-inter flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Discount
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3B2C23]/70 font-inter">
                      Shipping
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        shipping === 0 ? "text-green-600" : "text-[#3B2C23]",
                      )}
                    >
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>


                  <div className="flex justify-between items-center pt-4 border-t border-[#EAD6C3] mt-2">
                    <span className="font-playfair font-bold text-lg text-[#3B2C23]">
                      Total
                    </span>
                    <span className="font-playfair font-bold text-2xl text-[#A4552A]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-8 bg-[#A4552A] text-[#FFF8F0] py-3.5 rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest shadow-[0_4px_12px_rgba(164,85,42,0.25)] hover:bg-[#8B3F20] hover:shadow-[0_6px_16px_rgba(164,85,42,0.35)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Pay <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-[#3B2C23]/40 text-center mt-3 leading-tight">
                  By placing this order, you agree to our Terms & Conditions.
                </p>
              </motion.div>

              {/* Shipping Widget - Now Inside Sticky Container */}
              <div className="relative z-0">
                <ShippingWidget subtotal={subtotal} />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#EAD6C3] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="font-playfair font-bold text-[#3B2C23]">Total</span>
          <span className="font-playfair font-bold text-xl text-[#A4552A]">
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full bg-[#A4552A] text-[#FFF8F0] py-3 rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest shadow-lg flex justify-center items-center gap-2"
        >
          {isProcessing ? "Processing..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
}
