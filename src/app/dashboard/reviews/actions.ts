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

export async function getAllReviews() {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function approveReview(id: string) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ is_approved: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteReview(id: string) {
  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

export async function toggleReviewFeatured(id: string, isFeatured: boolean) {
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
