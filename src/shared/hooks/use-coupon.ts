"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface AppliedCoupon extends Coupon {
  discountAmount: number;
}

interface UseCouponReturn {
  appliedCoupon: AppliedCoupon | null;
  isLoading: boolean;
  error: string | null;
  applyCoupon: (code: string, orderTotal: number) => Promise<boolean>;
  removeCoupon: () => void;
  calculateDiscount: (coupon: Coupon, orderTotal: number) => number;
}

export function useCoupon(): UseCouponReturn {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDiscount = useCallback((coupon: Coupon, orderTotal: number): number => {
    if (coupon.discount_type === "percentage") {
      let discount = (orderTotal * coupon.discount_value) / 100;
      // Apply max discount cap if set
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
      // Whole rupees, exactly as the server prices the order.
      return Math.min(Math.round(discount), orderTotal);
    } else {
      // Fixed discount
      return Math.min(Math.round(coupon.discount_value), orderTotal);
    }
  }, []);

  const applyCoupon = useCallback(async (code: string, orderTotal: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedCode = code.trim().toUpperCase();
      
      // Fetch coupon from database using raw query to bypass type checking
      // (Types will be regenerated after schema changes)
      const { data, error: fetchError } = await supabase
        .from("coupons" as any)
        .select("*")
        .eq("code", normalizedCode)
        .eq("is_active", true)
        .single();

      if (fetchError || !data) {
        setError("Invalid coupon code");
        setIsLoading(false);
        return false;
      }

      const coupon = data as unknown as Coupon;
      const now = new Date();
      
      // Check start date
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        setError("This coupon is not yet active");
        setIsLoading(false);
        return false;
      }

      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        setError("This coupon has expired");
        setIsLoading(false);
        return false;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        setError("This coupon has reached its usage limit");
        setIsLoading(false);
        return false;
      }

      // Check minimum order amount
      if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
        setError(`Minimum order amount is ₹${coupon.min_order_amount}`);
        setIsLoading(false);
        return false;
      }

      // Calculate discount
      const discountAmount = calculateDiscount(coupon, orderTotal);

      setAppliedCoupon({
        ...coupon,
        discountAmount,
      });
      setError(null);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError("Failed to apply coupon");
      setIsLoading(false);
      return false;
    }
  }, [calculateDiscount]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setError(null);
  }, []);

  return {
    appliedCoupon,
    isLoading,
    error,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
}
