"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProductsByIds } from "@/shared/hooks/use-products";
import { useCartStore } from "@/shared/cart-store";
import { useCoupon } from "@/shared/hooks/use-coupon";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useAuthModalStore } from "@/shared/auth-modal-store";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { formatPrice, cn } from "@/shared/utils";
import { toast } from "sonner";
import { getOrderTotals } from "@/shared/lib/order-totals";
import environment from "@/shared/config/environment";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getImageTier } from "@/lib/image-tiers";
import { MADE_TO_ORDER_DAYS, isMadeToOrder } from "@/shared/lib/inventory";
import {
  CornerFlorals,
  KalashDivider,
  TempleBellsDivider,
} from "@/shared/ui/heritage-ornaments";

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

// Colour roles as on the home page: charcoal text, midnight main button,
// gold for lines only, royal blue for focus rings.
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))] focus-visible:ring-offset-2";
const primaryButton = `inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--brand-midnight))] font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[hsl(var(--brand-midnight-hover))] disabled:cursor-not-allowed disabled:bg-[hsl(var(--brand-midnight)/0.7)] ${focusRing}`;
const inlineLink = `rounded-sm font-semibold text-[hsl(var(--brand-ink))] underline decoration-[hsl(var(--brand-gold))] decoration-2 underline-offset-4 hover:decoration-[hsl(var(--brand-ink))] ${focusRing}`;
// Dark red used for stock and errors across the shop; passes AA on white.
const errorText = "text-[#8E2A1B]";

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
  autoComplete,
  inputMode,
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
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) => (
  <div className="w-full">
    <label
      htmlFor={name}
      className="mb-1.5 block font-sans text-[14px] font-medium text-[hsl(var(--brand-ink))]"
    >
      {label}
      {required && <span aria-hidden="true" className={errorText}> *</span>}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      autoComplete={autoComplete}
      inputMode={inputMode}
      aria-required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      placeholder={placeholder}
      className={cn(
        "h-12 w-full rounded-md border bg-white px-4 font-sans text-[15px] text-[hsl(var(--brand-ink))] transition-colors placeholder:text-[hsl(var(--brand-muted))]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]",
        error
          ? "border-[#8E2A1B]"
          : "border-[hsl(var(--brand-ink)/0.25)] hover:border-[hsl(var(--brand-ink)/0.45)] focus:border-[hsl(var(--brand-ink)/0.6)]",
      )}
    />
    {error && (
      <p id={`${name}-error`} className={cn("mt-1.5 font-sans text-[13px]", errorText)}>
        {error}
      </p>
    )}
  </div>
);

// Numbered steps in gold rings, like "From cloth to kalam" on the home page.
function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section
      aria-labelledby={`checkout-step-${step}`}
      className="rounded-sm border border-[hsl(var(--brand-gold)/0.45)] bg-white p-5 md:p-7"
    >
      <h2
        id={`checkout-step-${step}`}
        className="flex items-center gap-3 font-serif text-[20px] leading-tight text-[hsl(var(--brand-ink))] md:text-[22px]"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--brand-gold-ornament))] bg-[hsl(var(--brand-turmeric-tint))] font-sans text-[14px] font-semibold tabular-nums"
        >
          {step}
        </span>
        {title}
      </h2>
      <div className="mt-4 border-t border-[hsl(var(--brand-gold)/0.35)] pt-5">{children}</div>
    </section>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { openModal } = useAuthModalStore();
  const cart = useCartStore();
  const hasHydrated = useCartStore((s) => s._hasHydrated);
  // Exactly the products in the cart. Checkout used to read only the first page
  // of the catalogue (12 products), so anything older was priced at ₹0 and left
  // out of the Razorpay order.
  const cartIds = useMemo(
    () => cart.items.map((item) => item.productId),
    [cart.items],
  );
  const { data: products = [], isLoading: productsLoading } =
    useProductsByIds(cartIds);

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

  // On phones the pay bar owns the bottom edge; lift the floating chat and
  // admin buttons above it so they never cover "Pay now". Only while the bar
  // is shown: signed in with something in the cart.
  const showPayBar = !!firebaseUser && cart.items.length > 0;
  useEffect(() => {
    const update = () => {
      document.body.dataset.buyBar = showPayBar && window.innerWidth < 1024 ? "on" : "off";
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      delete document.body.dataset.buyBar;
    };
  }, [showPayBar]);

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
  const { discount, shipping, total } = getOrderTotals({
    subtotal,
    discount: appliedCoupon?.discountAmount || 0,
  });
  const hasMadeToOrderItems = cartItems.some(({ product }) => isMadeToOrder(product));

  // Handle coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const success = await applyCoupon(couponCode, subtotal);
    if (success) {
      toast.success("Coupon applied");
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
      newErrors.firstName = "Please enter your first name";
    if (!formData.lastName.trim()) newErrors.lastName = "Please enter your last name";
    if (!formData.address.trim()) newErrors.address = "Please enter your address";
    if (!formData.city.trim()) newErrors.city = "Please enter your city";
    if (!formData.state.trim()) newErrors.state = "Please enter your state";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please check your email address";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your mobile number";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    const pincodeRegex = /^\d{6}$/;
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Please enter your PIN code";
    } else if (!pincodeRegex.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please check the details marked in red.")
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create Razorpay order on server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only what is being bought — the server prices it from the database.
        body: JSON.stringify({
          items: cart.items.map(({ productId, quantity }) => ({ productId, quantity })),
          couponCode: appliedCoupon?.code ?? null,
        }),
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
        name: "Srikalahasti Kalamkari",
        description: "Order payment",
        order_id: orderData.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#0B2A55" },
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
              couponCode: appliedCoupon?.code ?? null,
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

  const payLabel = isProcessing ? "Opening payment…" : `Pay ${formatPrice(total)}`;

  // --- Auth Check ---
  if (authLoading || (firebaseUser && (!hasHydrated || productsLoading))) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[hsl(var(--brand-paper))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand-ink))]" aria-label="Loading checkout" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-[70vh] bg-[hsl(var(--brand-paper))] flex flex-col items-center justify-center px-6 text-center text-[hsl(var(--brand-ink))]">
        <h1 className="font-serif text-[28px] leading-tight">Sign in to check out</h1>
        <TempleBellsDivider className="mt-2" />
        <p className="mt-3 max-w-sm font-sans text-[15px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
          We need your account to save your order and send you updates.
        </p>
        <button
          type="button"
          onClick={() => openModal("/checkout")}
          className={cn(primaryButton, "mt-6 h-12 px-8")}
        >
          Sign in
        </button>
      </div>
    );
  }

  // --- Empty State ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[hsl(var(--brand-paper))] flex flex-col items-center justify-center px-6 text-center text-[hsl(var(--brand-ink))]">
        <h1 className="font-serif text-[28px] leading-tight">Your cart is empty</h1>
        <TempleBellsDivider className="mt-2" />
        <p className="mt-3 font-sans text-[15px] text-[hsl(var(--brand-ink-soft))]">
          Add a piece to your cart, then come back to check out.
        </p>
        <Link href="/products" className={cn(primaryButton, "mt-6 h-12 px-8")}>
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--brand-paper))] text-[hsl(var(--brand-ink))]">
      {/* Page band: pale indigo, kalash divider and corner temple drawings, like the shop page */}
      <div className="relative overflow-hidden border-b border-[hsl(var(--brand-gold)/0.45)] bg-[hsl(var(--brand-indigo-tint))]">
        <CornerFlorals className="absolute right-2 top-3 hidden h-16 w-16 opacity-70 sm:block md:right-4 md:h-20 md:w-20" />
        <CornerFlorals className="absolute bottom-3 left-2 hidden h-16 w-16 rotate-180 opacity-70 sm:block md:left-4 md:h-20 md:w-20" />
        <div className="relative mx-auto max-w-[1200px] px-4 pb-8 pt-5 md:px-8 md:pb-10">
          <Link
            href="/cart"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm font-sans text-[14px] text-[hsl(var(--brand-ink-soft))] hover:text-[hsl(var(--brand-ink))]",
              focusRing,
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to cart
          </Link>
          <div className="mt-3 text-center">
            <h1 className="font-serif text-[28px] leading-tight md:text-[36px]">Checkout</h1>
            <KalashDivider className="mt-2" />
            <p className="mt-2 font-sans text-[14px] text-[hsl(var(--brand-ink-soft))] md:text-[15px]">
              Free shipping across India. Prices include all taxes.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-44 pt-8 md:px-8 lg:pb-16 lg:pt-10">
        <form
          id="checkout-form"
          noValidate
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10"
        >
          {/* Left: details, address, payment */}
          <div className="space-y-6 lg:col-span-2">
            <Section step={1} title="Your details">
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormInput
                    label="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    autoComplete="given-name"
                    required
                  />
                  <FormInput
                    label="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    autoComplete="family-name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    autoComplete="email"
                    required
                    placeholder="name@example.com"
                  />
                  <FormInput
                    label="Mobile number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    autoComplete="tel-national"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </Section>

            <Section step={2} title="Delivery address">
              <div className="space-y-5">
                <FormInput
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  autoComplete="street-address"
                  required
                  placeholder="House no., building, street, area"
                />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <FormInput
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    autoComplete="address-level2"
                    required
                  />
                  <FormInput
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    error={errors.state}
                    autoComplete="address-level1"
                    required
                  />
                  <FormInput
                    label="PIN code"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    error={errors.pincode}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    required
                    maxLength={6}
                  />
                </div>
                <p className="font-sans text-[14px] text-[hsl(var(--brand-ink-soft))]">
                  We deliver only within India. Shipping is free.
                </p>
              </div>
            </Section>

            <Section step={3} title="Payment">
              <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--brand-ink)/0.15)] bg-[hsl(var(--brand-indigo-tint))] p-4">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--brand-ink))]" aria-hidden="true" />
                <div>
                  <p className="font-sans text-[15px] font-semibold text-[hsl(var(--brand-ink))]">
                    Pay online with Razorpay
                  </p>
                  <p className="mt-1 font-sans text-[14px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
                    UPI, cards, net banking or wallets. Cash on delivery is not available.
                  </p>
                </div>
              </div>
            </Section>
          </div>

          {/* Right: order summary on a turmeric panel */}
          <div className="lg:col-span-1">
            <div className="rounded-sm border border-[hsl(var(--brand-gold)/0.55)] bg-[hsl(var(--brand-turmeric-tint))] p-5 md:p-6 lg:sticky lg:top-24">
              <h2 className="font-serif text-[20px] leading-tight md:text-[22px]">Order summary</h2>

              <ul className="mt-4 max-h-[320px] divide-y divide-[hsl(var(--brand-gold-ornament)/0.3)] overflow-y-auto border-y border-[hsl(var(--brand-gold-ornament)/0.3)]">
                {cartItems.map(({ product, quantity }) =>
                  product ? (
                    <li key={product.id} className="flex gap-3 py-3">
                      <div className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-sm bg-white ring-1 ring-[hsl(var(--brand-gold)/0.5)]">
                        <OptimizedImage
                          src={
                            getImageTier(product.images, "thumb", 0) ||
                            product.mainImage ||
                            product.image ||
                            null
                          }
                          alt=""
                          fill
                          className="object-cover"
                          imageType="thumbnail"
                          sizes="56px"
                          placeholder="empty"
                        />
                      </div>
                      <div className="min-w-0 flex-1 font-sans">
                        <p className="line-clamp-2 text-[14px] font-medium leading-snug">
                          {product.title || product.name}
                        </p>
                        <p className="mt-1 text-[13px] text-[hsl(var(--brand-ink-soft))] tabular-nums">
                          Qty {quantity}
                        </p>
                        {isMadeToOrder(product) && (
                          <p className="mt-0.5 text-[13px] text-[hsl(var(--brand-ink-soft))]">
                            Made to order · {MADE_TO_ORDER_DAYS}
                          </p>
                        )}
                      </div>
                      <p className="font-sans text-[14px] font-semibold tabular-nums">
                        {formatPrice((product.price || 0) * quantity)}
                      </p>
                    </li>
                  ) : null,
                )}
              </ul>

              {/* Coupon */}
              <div className="mt-4">
                <label
                  htmlFor="coupon"
                  className="flex items-center gap-2 font-sans text-[14px] font-medium"
                >
                  <Tag className="h-4 w-4" aria-hidden="true" />
                  Have a coupon?
                </label>

                {appliedCoupon ? (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-[#1F6B3A]/30 bg-[hsl(var(--brand-leaf-tint))] py-1 pl-3 pr-1">
                    <p className="flex items-center gap-2 font-sans text-[14px] text-[#1F6B3A]">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span className="font-semibold">{appliedCoupon.code}</span>
                      <span className="tabular-nums">(−{formatPrice(appliedCoupon.discountAmount)})</span>
                    </p>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      aria-label="Remove coupon"
                      className={cn("flex h-9 w-9 items-center justify-center rounded-full text-[#1F6B3A] hover:bg-white/70", focusRing)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input
                      id="coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      aria-invalid={!!couponError}
                      aria-describedby={couponError ? "coupon-error" : undefined}
                      className="h-11 min-w-0 flex-1 rounded-md border border-[hsl(var(--brand-ink)/0.25)] bg-white px-3 font-sans text-[15px] uppercase text-[hsl(var(--brand-ink))] placeholder:normal-case placeholder:text-[hsl(var(--brand-muted))] focus:border-[hsl(var(--brand-ink)/0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-royal))]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-full border border-[hsl(var(--brand-ink)/0.75)] bg-white px-5 font-sans text-[13px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--brand-ink))] transition-colors hover:bg-[hsl(var(--brand-paper))] disabled:cursor-not-allowed disabled:border-[hsl(var(--brand-ink)/0.2)] disabled:text-[hsl(var(--brand-ink)/0.45)]",
                        focusRing,
                      )}
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Checking coupon" /> : "Apply"}
                    </button>
                  </div>
                )}

                {couponError && (
                  <p id="coupon-error" role="alert" className={cn("mt-2 font-sans text-[13px]", errorText)}>
                    {couponError}
                  </p>
                )}
              </div>

              {hasMadeToOrderItems && (
                <div className="mt-4 rounded-md border border-[hsl(var(--brand-gold)/0.5)] bg-white p-3 font-sans">
                  <p className="text-[14px] font-semibold">Made-to-order items</p>
                  <p className="mt-1 text-[13px] text-[hsl(var(--brand-ink-soft))]">
                    We make these items for you and deliver them in {MADE_TO_ORDER_DAYS}.
                  </p>
                </div>
              )}

              {/* Price breakdown */}
              <dl className="mt-4 space-y-2.5 border-t border-[hsl(var(--brand-gold-ornament)/0.3)] pt-4 font-sans text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--brand-ink-soft))]">Subtotal</dt>
                  <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-[hsl(var(--brand-ink-soft))]">Coupon discount</dt>
                    <dd className="font-medium tabular-nums">−{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-[hsl(var(--brand-ink-soft))]">Shipping</dt>
                  <dd className="font-medium tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-[hsl(var(--brand-gold-ornament)/0.3)] pt-3">
                  <dt className="text-[16px] font-semibold">Total</dt>
                  <dd className="text-[22px] font-semibold tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={isProcessing}
                className={cn(primaryButton, "mt-6 hidden h-[52px] w-full lg:flex")}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Lock className="h-4 w-4" aria-hidden="true" />
                )}
                {payLabel}
              </button>

              <ul className="mt-4 space-y-1.5 font-sans text-[13px] leading-relaxed text-[hsl(var(--brand-ink-soft))]">
                <li>
                  All sales are final. No returns, refunds or cancellations.{" "}
                  <Link href="/returns" className={inlineLink}>Read policy</Link>
                </li>
                <li>
                  By paying, you agree to our <Link href="/terms" className={inlineLink}>terms</Link>.
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>

      {/* Phones: total and pay button stay at the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--brand-gold)/0.55)] bg-white px-4 pb-3 pt-3 shadow-[0_-10px_28px_-18px_rgba(33,30,36,0.35)] lg:hidden">
        <div className="flex items-center gap-4">
          <div className="font-sans">
            <p className="text-[13px] text-[hsl(var(--brand-ink-soft))]">Total</p>
            <p className="text-[20px] font-semibold leading-tight tabular-nums">{formatPrice(total)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isProcessing}
            className={cn(primaryButton, "h-12 flex-1")}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="h-4 w-4" aria-hidden="true" />
            )}
            {isProcessing ? "Opening payment…" : "Pay now"}
          </button>
        </div>
        <p className="mt-2 text-center font-sans text-[13px] text-[hsl(var(--brand-ink-soft))]">
          All sales are final. No returns or refunds.
        </p>
      </div>
    </div>
  );
}
