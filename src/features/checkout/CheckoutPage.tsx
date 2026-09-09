"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProducts } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { useCoupon, incrementCouponUsage } from "@/shared/hooks/use-coupon";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAuthModalStore } from "@/shared/auth-modal-store";
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
import { PageHero } from "@/components/layout/PageHero";
import { ShippingWidget } from "./ShippingWidget";
import environment from "@/shared/config/environment";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import { MADE_TO_ORDER_DAYS, isMadeToOrder } from "@/shared/lib/inventory";
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
    <label className="block text-sm font-inter font-medium text-[#1A1512]/80 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={cn(
        "w-full px-4 py-3 rounded-[10px] border bg-[#1A1512]/5 focus:outline-none transition-all placeholder:text-[#1A1512]/40",
        error
          ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"
          : "border-[#C19A5B]/30 focus:border-[#C19A5B] focus:ring-1 focus:ring-[#C19A5B]/40",
      )}
      placeholder={placeholder}
    />
    {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { openModal } = useAuthModalStore();
  const { data: productsData } = useProducts();
  const products = productsData?.data || [];
  const cart = useCartStore();

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      openModal("/checkout");
    }
  }, [firebaseUser, authLoading]);

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
  const hasMadeToOrderItems = cartItems.some(({ product }) => isMadeToOrder(product));

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
        key: orderData.keyId || environment.razorpay.keyId,
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
        theme: { color: "#C19A5B" },
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
              userId: firebaseUser?.uid || null,
              customerPhone: firebaseUser?.phoneNumber || null,
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

  // --- Auth Check ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background kalamkari-static-background silk-fabric-texture">
        <div className="w-12 h-12 border-2 border-[#C19A5B]/30 border-t-[#1A1512] rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  // --- Empty State ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture flex flex-col items-center justify-center px-6 text-center text-[#1A1512]">
        <div className="w-16 h-16 bg-[#C19A5B]/10 rounded-full flex items-center justify-center mb-4 border border-[#C19A5B]/30">
          <Wallet className="w-8 h-8 text-[#C19A5B]" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-[#1A1512] mb-4">
          Your cart is empty
        </h1>
        <p className="font-inter text-[#1A1512]/60 mb-8">
          Please add items to your cart before checking out.
        </p>
        <Link href="/products">
          <button className="px-8 py-3 bg-[#1A1512] text-white hover:bg-[#C19A5B] hover:text-[#1A1512] transition-colors rounded-lg font-bold tracking-wide uppercase text-xs shadow-md border border-[#C19A5B]/20">
            Return to Shop
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background kalamkari-static-background silk-fabric-texture text-[#1A1512]">
      {/* 🏛 Page Hero */}
      <PageHero
        eyebrow="Secure Checkout"
        titleStart="Finalize"
        titleAccent="order"
        description="Almost there — confirm your delivery details and proceed to secure payment."
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
              className="bg-white/95 rounded-[14px] border border-[#C19A5B]/20 p-6 md:p-8 shadow-sm backdrop-blur-sm"
            >
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1512] mb-6 pb-4 border-b border-[#C19A5B]/20">
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
              className="bg-white/95 rounded-[14px] border border-[#C19A5B]/20 p-6 md:p-8 shadow-sm backdrop-blur-sm"
            >
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1512] mb-6 pb-4 border-b border-[#C19A5B]/20">
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
                <p className="text-xs text-[#1A1512]/50 italic mt-2 flex items-center gap-1">
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
              className="bg-white/95 rounded-[14px] border border-[#C19A5B]/20 p-6 md:p-8 shadow-sm backdrop-blur-sm"
            >
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-[#1A1512] mb-6 pb-4 border-b border-[#C19A5B]/20">
                Payment Method
              </h2>

              <div className="rounded-[10px] border border-[#C19A5B]/30 bg-[#1A1512]/5 p-4 flex items-start gap-4">
                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-[#C19A5B] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C19A5B]" />
                </div>
                <div>
                  <h3 className="font-inter font-bold text-[#1A1512] text-sm flex items-center gap-2">
                    Online Payment
                    <span className="text-[10px] bg-[#1A1512] text-white px-2 py-0.5 rounded-full">
                      Secure
                    </span>
                  </h3>
                  <p className="text-xs text-[#1A1512]/60 mt-1 mb-3">
                    Cards, UPI, Netbanking, Wallets (via Razorpay)
                  </p>

                  {/* Trust Badges */}
                  <div className="flex items-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all">
                    <div className="flex gap-2">
                      <CreditCard className="w-6 h-6 text-[#1A1512]" />
                      <Wallet className="w-6 h-6 text-[#1A1512]" />
                    </div>
                    <span className="text-[10px] text-[#1A1512]/50 border-l border-[#C19A5B] pl-3">
                      Powered by Razorpay
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#1A1512]/60 bg-[#1A1512]/5 py-2 rounded-md border border-[#C19A5B]/10">
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
                className="bg-white/95 rounded-[14px] border border-[#C19A5B]/20 p-6 shadow-[0_4px_20px_rgba(26,21,18,0.04)] backdrop-blur-sm"
              >
                <h3 className="font-playfair text-xl font-bold text-[#1A1512] mb-6">
                  Order Summary
                </h3>

                {/* Product List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 scrollbar-thin scrollbar-thumb-[#C19A5B]/20">
                  {cartItems.map(({ product, quantity }) =>
                    product ? (
                      <div
                        key={product.id}
                        className="flex gap-3 py-3 border-b border-[#C19A5B]/10 last:border-0"
                      >
                        {/* Tiny Image */}
                        <div className="w-12 h-16 bg-[#FDFBF7] rounded border border-[#EAD6C3]/50 shrink-0 overflow-hidden relative">
                          <OptimizedImage
                            src={
                              getImageTier(product.images, "thumb", 0) ||
                              product.mainImage ||
                              product.image ||
                              null
                            }
                            alt={product.title || product.name || "Product"}
                            fill
                            className="object-cover"
                            imageType="thumbnail"
                            sizes="48px"
                            placeholder="empty"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-semibold text-[#1A1512] text-xs line-clamp-2 leading-relaxed">
                            {product.title || product.name}
                          </p>
                          <p className="text-[10px] text-[#1A1512]/60 mt-1">
                            Qty: {quantity}
                          </p>
                          {isMadeToOrder(product) && (
                            <p className="text-[10px] font-semibold text-[#A07840] mt-1">
                              Made to order · {MADE_TO_ORDER_DAYS}
                            </p>
                          )}
                        </div>
                        <p className="font-inter font-semibold text-[#C19A5B] text-xs">
                          {formatPrice((product.price || 0) * quantity)}
                        </p>
                      </div>
                    ) : null,
                  )}
                </div>

                {/* Coupon Section */}
                <div className="pt-4 border-t border-[#C19A5B]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-[#C19A5B]" />
                    <span className="text-sm font-medium text-[#1A1512]">Have a coupon?</span>
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
                        className="flex-1 px-3 py-2 text-sm border border-[#C19A5B]/30 rounded-lg bg-[#1A1512]/5 focus:outline-none focus:border-[#C19A5B] uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-[#1A1512] text-white text-sm font-medium rounded-lg hover:bg-[#C19A5B] hover:text-[#1A1512] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-300"
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

                {hasMadeToOrderItems && (
                  <div className="mt-4 rounded-lg border border-[#C19A5B]/30 bg-[#FFF7E8] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A07840]">
                      Made-to-order timeline
                    </p>
                    <p className="text-xs text-[#1A1512]/70 mt-1 leading-relaxed">
                      One or more pieces are custom requests. We will prepare the selected design and deliver it in {MADE_TO_ORDER_DAYS}.
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-[#C19A5B]/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1A1512]/70 font-inter">
                      Subtotal
                    </span>
                    <span className="font-medium text-[#1A1512]">
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
                    <span className="text-[#1A1512]/70 font-inter">
                      Shipping
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        shipping === 0 ? "text-green-600" : "text-[#1A1512]",
                      )}
                    >
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>


                  <div className="flex justify-between items-center pt-4 border-t border-[#C19A5B]/20 mt-2">
                    <span className="font-playfair font-bold text-lg text-[#1A1512]">
                      Total
                    </span>
                    <span className="font-playfair font-bold text-2xl text-[#C19A5B]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-8 bg-[#1A1512] text-white py-3.5 rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest shadow-md hover:bg-[#C19A5B] hover:text-[#1A1512] hover:shadow-lg transition-all duration-300 border border-[#C19A5B]/20 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                <p className="text-[10px] text-[#1A1512]/40 text-center mt-3 leading-tight">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-[#C19A5B]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="font-playfair font-bold text-[#1A1512]">Total</span>
          <span className="font-playfair font-bold text-xl text-[#C19A5B]">
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full bg-[#1A1512] text-white py-3 rounded-[8px] font-inter font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-[#C19A5B] hover:text-[#1A1512] transition-colors border border-[#C19A5B]/20 flex justify-center items-center gap-2"
        >
          {isProcessing ? "Processing..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
}
