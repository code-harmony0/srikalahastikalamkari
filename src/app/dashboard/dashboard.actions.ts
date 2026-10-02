"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { assertAdminSession } from "@/shared/lib/admin-guard";

export interface DashboardKPIs {
  total_revenue: number | null;
  total_orders: number | null;
  avg_order_value: number | null;
  aov_orders_count: number | null;
  revenue_growth: number | null;
  orders_growth: number | null;
  has_prior_revenue: boolean;
  has_prior_orders: boolean;
}

export interface DashboardAttention {
  pending_orders: number | null;
  low_stock: number | null;
  unread_inquiries: number | null;
  pending_reviews: number | null;
}

export interface DailyActivity {
  date: string;
  orders: number;
  items_sold: number;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  total_sold: number;
  revenue: number | null;
}

// ─── Security Helpers ────────────────────────────────────────────────────────
async function canViewFinancials() {
  const session = await assertAdminSession();
  return session.role === "super_admin"; // Only super_admin sees financials per requirement
}

// ─── Attention KPIs ──────────────────────────────────────────────────────────
export async function getDashboardAttention(): Promise<DashboardAttention> {
  const supabase = getServiceClient();
  const session = await assertAdminSession();
  const permissions = session.permissions || [];
  
  const canViewOrders = permissions.includes("orders.view") || session.role === "super_admin";
  const canViewProducts = permissions.includes("products.view") || session.role === "super_admin";
  const canManageInquiries = permissions.includes("inquiries.manage") || session.role === "super_admin";
  const canManageReviews = permissions.includes("reviews.manage") || session.role === "super_admin";

  const [orders, stock, inquiries, reviews] = await Promise.all([
    canViewOrders ? supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "paid"]) : Promise.resolve({ count: null }),
    canViewProducts ? supabase.from("products").select("*", { count: "exact", head: true }).lt("stock_quantity", 5) : Promise.resolve({ count: null }),
    canManageInquiries ? supabase.from("contact_inquiries").select("*", { count: "exact", head: true }).eq("status", "new") : Promise.resolve({ count: null }),
    canManageReviews ? supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending") : Promise.resolve({ count: null })
  ]);

  return {
    pending_orders: orders.count,
    low_stock: stock.count,
    unread_inquiries: inquiries.count,
    pending_reviews: reviews.count,
  };
}

// ─── Performance KPIs ────────────────────────────────────────────────────────
export async function getDashboardPerformance(): Promise<DashboardKPIs> {
  const supabase = getServiceClient();
  const isAllowed = await canViewFinancials();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  // Only fetch last 2 months of orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .gte("created_at", lastMonthStart);

  const orders = recentOrders || [];
  
  const currentMonthOrders = orders.filter(o => o.created_at >= currentMonthStart);
  const lastMonthOrders = orders.filter(o => o.created_at >= lastMonthStart && o.created_at <= lastMonthEnd);

  const currentEarning = currentMonthOrders.filter(o => o.status !== "cancelled");
  const lastEarning = lastMonthOrders.filter(o => o.status !== "cancelled");

  const currentRevenue = currentEarning.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const lastRevenue = lastEarning.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const hasPriorRevenue = lastRevenue > 0;
  const hasPriorOrders = lastMonthOrders.length > 0;

  const revenueGrowth = hasPriorRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : null;
  const ordersGrowth = hasPriorOrders ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : null;
  const avgOrderValue = currentEarning.length > 0 ? currentRevenue / currentEarning.length : 0;

  return {
    total_revenue: isAllowed ? currentRevenue : null,
    total_orders: currentMonthOrders.length,
    avg_order_value: isAllowed ? avgOrderValue : null,
    aov_orders_count: currentEarning.length,
    revenue_growth: isAllowed ? revenueGrowth : null,
    orders_growth: ordersGrowth,
    has_prior_revenue: hasPriorRevenue,
    has_prior_orders: hasPriorOrders,
  };
}

// ─── Operations (Recent Orders) ──────────────────────────────────────────────
export async function getDashboardRecentOrders(limit: number = 5) {
  const supabase = getServiceClient();
  const isAllowed = await canViewFinancials();

  const { data } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      total_amount,
      status,
      created_at,
      order_items ( count )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data) return [];
  
  return data.map(order => ({
    id: order.id,
    customer_name: order.customer_name,
    total_amount: isAllowed ? order.total_amount : null,
    status: order.status,
    created_at: order.created_at,
    items_count: order.order_items?.[0]?.count || 0
  }));
}

// ─── Analytics (Activity) ────────────────────────────────────────────────────
export async function getDashboardDailyActivity(days: number = 7): Promise<DailyActivity[]> {
  const supabase = getServiceClient();
  const isAllowed = await canViewFinancials();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, created_at, status")
    .gte("created_at", startDate.toISOString())
    .neq("status", "cancelled")
    .order("created_at", { ascending: true });

  const orderIds = (orders || []).map(o => o.id);
  let itemsByOrder: Record<string, number> = {};

  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds);

    if (items) {
      itemsByOrder = items.reduce((acc: Record<string, number>, item) => {
        acc[item.order_id] = (acc[item.order_id] || 0) + item.quantity;
        return acc;
      }, {});
    }
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyMap: Record<string, DailyActivity> = {};

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const key = date.toISOString().split("T")[0];
    dailyMap[key] = {
      date: dayLabels[date.getDay()],
      orders: 0,
      items_sold: 0,
      revenue: 0,
    };
  }

  for (const order of orders || []) {
    const key = new Date(order.created_at).toISOString().split("T")[0];
    if (dailyMap[key]) {
      dailyMap[key].orders += 1;
      dailyMap[key].revenue += (isAllowed ? (order.total_amount || 0) : 0);
      dailyMap[key].items_sold += itemsByOrder[order.id] || 0;
    }
  }

  return Object.values(dailyMap);
}

// ─── Analytics (Top Products) ────────────────────────────────────────────────
export async function getDashboardTopProducts(days: number = 30, limit: number = 5): Promise<TopProduct[]> {
  const supabase = getServiceClient();
  const isAllowed = await canViewFinancials();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. Get recent valid orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id")
    .gte("created_at", startDate.toISOString())
    .neq("status", "cancelled");

  if (!recentOrders || recentOrders.length === 0) return [];

  const orderIds = recentOrders.map((o) => o.id);

  // 2. Fetch items just for those orders
  const { data: items } = await supabase
    .from("order_items")
    .select(`
      product_id,
      quantity,
      price_at_purchase,
      products!inner (
        id,
        name,
        images
      )
    `)
    .in("order_id", orderIds);

  if (!items) return [];

  const productMap: Record<string, TopProduct> = {};

  for (const item of items) {
    const product = item.products as any;
    if (!productMap[product.id]) {
      productMap[product.id] = {
        id: product.id,
        name: product.name,
        image: product.images?.[0] || "",
        total_sold: 0,
        revenue: 0,
      };
    }
    productMap[product.id].total_sold += item.quantity;
    productMap[product.id].revenue! += item.quantity * (item.price_at_purchase || 0);
  }

  const sorted = Object.values(productMap).sort((a, b) => b.total_sold - a.total_sold).slice(0, limit);
  
  if (!isAllowed) {
    sorted.forEach(p => p.revenue = null);
  }

  return sorted;
}
