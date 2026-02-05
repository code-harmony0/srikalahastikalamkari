"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface CouponData {
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  expires_at?: string | null;
  is_active: boolean;
}

export async function getCoupons() {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function createCoupon(couponData: CouponData) {
  const { data, error } = await supabaseAdmin.from("coupons").insert(couponData).select().single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateCoupon(id: string, couponData: Partial<CouponData>) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update(couponData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteCoupon(id: string) {
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update({ is_active: !isActive })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
