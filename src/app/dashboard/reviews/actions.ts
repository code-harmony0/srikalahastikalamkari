"use server";

import { createClient } from "@supabase/supabase-js";
import { assertAdminPermission } from "@/shared/lib/admin-guard";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface ReviewData {
  product_id: string;
  customer_name: string;
  customer_email?: string | null;
  rating: number;
  title?: string | null;
  content?: string | null;
  is_verified_purchase?: boolean;
  is_approved?: boolean;
  is_featured?: boolean;
  helpful_count?: number;
}

/** Includes pending reviews and therefore must never be called by storefront UI. */
export async function getAdminReviews() {
  await assertAdminPermission("reviews.manage");
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select(`
      *,
      products (
        name,
        images
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function approveReview(id: string) {
  await assertAdminPermission("reviews.manage");
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ is_approved: true, helpful_count: 0 })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function rejectReview(id: string) {
  await assertAdminPermission("reviews.manage");
  // We use helpful_count = -1 as a robust indicator for "Rejected" without requiring 
  // a database schema migration. Pending is is_approved=false && helpful_count >= 0.
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ is_approved: false, helpful_count: -1 })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteReview(id: string) {
  await assertAdminPermission("reviews.manage");
  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

export async function toggleReviewFeatured(id: string, isFeatured: boolean) {
  await assertAdminPermission("reviews.manage");
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ is_featured: !isFeatured })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}