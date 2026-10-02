"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { assertAdminSession } from "@/shared/lib/admin-guard";

export interface OrdersFilters {
  status?: string;
  search?: string;
  dateRange?: string; // "today", "7days", "30days", "all"
  page?: number;
  limit?: number;
}

export async function fetchAdminOrders(filters: OrdersFilters) {
  const supabase = getServiceClient();
  const session = await assertAdminSession();

  // Basic permission check
  if (!session.permissions?.includes("orders.view") && session.role !== "super_admin") {
    throw new Error("Unauthorized to view orders");
  }

  const { status, search, dateRange, page = 1, limit = 20 } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("orders")
    .select(`
      *,
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
    `, { count: 'exact' })
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    const isNumber = !isNaN(Number(search));
    // If it looks like a number, maybe search phone or total amount (exact match not ideal, so cast to text)
    // Supabase ilike on UUID is not allowed directly.
    query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`);
  }

  if (dateRange) {
    const now = new Date();
    if (dateRange === "today") {
      now.setHours(0, 0, 0, 0);
      query = query.gte("created_at", now.toISOString());
    } else if (dateRange === "7days") {
      now.setDate(now.getDate() - 7);
      query = query.gte("created_at", now.toISOString());
    } else if (dateRange === "30days") {
      now.setDate(now.getDate() - 30);
      query = query.gte("created_at", now.toISOString());
    }
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("fetchAdminOrders error:", error);
    throw new Error("Failed to fetch orders");
  }

  return { orders: data || [], count: count || 0 };
}

export async function bulkUpdateOrderStatus(orderIds: string[], status: string) {
  const supabase = getServiceClient();
  const session = await assertAdminSession();

  if (!session.permissions?.includes("orders.manage") && session.role !== "super_admin") {
    throw new Error("Unauthorized to manage orders");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", orderIds);

  if (error) {
    console.error("bulkUpdateOrderStatus error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
