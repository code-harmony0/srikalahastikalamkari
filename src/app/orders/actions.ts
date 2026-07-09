"use server";

import { supabaseAdmin } from "@/lib/supabase/client";

export async function getUserOrders(firebaseUid: string, phoneNumber?: string | null, from = 0, to = 9) {
  if (!firebaseUid) {
    return { data: [], count: 0, error: "No user ID provided" };
  }

  try {
    // Match by firebase_uid (preferred) OR customer_phone (legacy orders placed before uid was saved)
    let query = supabaseAdmin
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        shipping_address,
        customer_email,
        shipping_company,
        tracking_id,
        shipped_at,
        delivered_at,
        order_items (
          id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            images
          )
        )
      `, { count: 'exact' });

    if (phoneNumber) {
      query = query.or(`firebase_uid.eq.${firebaseUid},customer_phone.eq.${phoneNumber}`);
    } else {
      query = query.eq('firebase_uid', firebaseUid);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return { data: [], count: 0, error: error.message };
  }
}
