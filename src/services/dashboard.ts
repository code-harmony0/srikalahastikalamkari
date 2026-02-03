import { supabaseAdmin } from "@/lib/supabase/client"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  total_revenue: number
  total_orders: number
  product_count: number
  completion_rate: number
  // Month-over-month growth (real data)
  revenue_growth: number
  orders_growth: number
  // Derived
  avg_order_value: number
  pending_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  cancelled_orders: number
}

export interface DailyActivity {
  date: string
  orders: number
  items_sold: number
  revenue: number
}

export interface CategorySales {
  category: string
  value: number
}

export interface TopProduct {
  id: string
  name: string
  image: string
  total_sold: number
  revenue: number
}

export interface OrderPreview {
  id: string
  customer_name: string | null
  total_amount: number
  status: string
  created_at: string
}

export interface SparklinePoint {
  value: number
}

// ─── Dashboard KPIs (Real Month-over-Month Growth) ──────────────────────────

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  // Fetch all orders (status + amount + date) in one query
  const { data: allOrders } = await supabaseAdmin
    .from("orders")
    .select("status, total_amount, created_at")

  // Product count
  const { count: productCount } = await supabaseAdmin
    .from("products")
    .select("*", { count: "exact", head: true })

  const orders = allOrders || []
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

  // Status breakdown
  const pending = orders.filter(o => o.status === "pending" || o.status === "paid").length
  const processing = orders.filter(o => o.status === "in_packing" || o.status === "packed").length
  const shipped = orders.filter(o => o.status === "shipped").length
  const delivered = orders.filter(o => o.status === "delivered").length
  const cancelled = orders.filter(o => o.status === "cancelled").length

  // Month-over-month calculations (real data)
  const currentMonthOrders = orders.filter(
    o => new Date(o.created_at) >= currentMonthStart
  )
  const lastMonthOrders = orders.filter(
    o => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) <= lastMonthEnd
  )

  const currentMonthRevenue = currentMonthOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
  const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + (o.total_amount || 0), 0)

  const revenueGrowth = lastMonthRevenue > 0
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : currentMonthRevenue > 0 ? 100 : 0

  const ordersGrowth = lastMonthOrders.length > 0
    ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
    : currentMonthOrders.length > 0 ? 100 : 0

  const completionRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0

  return {
    total_revenue: totalRevenue,
    total_orders: totalOrders,
    product_count: productCount || 0,
    completion_rate: completionRate,
    revenue_growth: revenueGrowth,
    orders_growth: ordersGrowth,
    avg_order_value: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    pending_orders: pending,
    processing_orders: processing,
    shipped_orders: shipped,
    delivered_orders: delivered,
    cancelled_orders: cancelled,
  }
}

// ─── Daily Activity (Last N Days) ──────────────────────────────────────────

export async function getDailyActivity(days: number = 7): Promise<DailyActivity[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  // Fetch orders in date range
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, created_at, status")
    .gte("created_at", startDate.toISOString())
    .neq("status", "cancelled")
    .order("created_at", { ascending: true })

  // Fetch order items for these orders
  const orderIds = (orders || []).map(o => o.id)
  let itemsByOrder: Record<string, number> = {}

  if (orderIds.length > 0) {
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds)

    if (items) {
      itemsByOrder = items.reduce((acc: Record<string, number>, item) => {
        acc[item.order_id] = (acc[item.order_id] || 0) + item.quantity
        return acc
      }, {})
    }
  }

  // Group by day
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dailyMap: Record<string, DailyActivity> = {}

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const key = date.toISOString().split("T")[0]
    dailyMap[key] = {
      date: dayLabels[date.getDay()],
      orders: 0,
      items_sold: 0,
      revenue: 0,
    }
  }

  // Fill with real data
  for (const order of orders || []) {
    const key = new Date(order.created_at).toISOString().split("T")[0]
    if (dailyMap[key]) {
      dailyMap[key].orders += 1
      dailyMap[key].revenue += order.total_amount || 0
      dailyMap[key].items_sold += itemsByOrder[order.id] || 0
    }
  }

  return Object.values(dailyMap)
}

// ─── Top Categories by Sales ────────────────────────────────────────────────

export async function getTopCategoriesBySales(limit: number = 6): Promise<CategorySales[]> {
  // Join: order_items → products → categories
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select(`
      quantity,
      products!inner (
        category_id,
        categories!inner (
          name
        )
      )
    `)

  if (!items || items.length === 0) {
    return []
  }

  // Aggregate by category
  const categoryMap: Record<string, number> = {}
  for (const item of items) {
    const product = item.products as any
    const categoryName = product?.categories?.name
    if (categoryName) {
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + item.quantity
    }
  }

  return Object.entries(categoryMap)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

// ─── Top Products by Revenue ─────────────────────────────────────────────────

export async function getTopProducts(limit: number = 5): Promise<TopProduct[]> {
  const { data: items } = await supabaseAdmin
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

  if (!items) return []

  const productSales = items.reduce((acc: Record<string, TopProduct>, item: any) => {
    const pid = item.product_id
    if (!acc[pid]) {
      acc[pid] = {
        id: pid,
        name: item.products.name,
        image: item.products.images?.[0] || "",
        total_sold: 0,
        revenue: 0,
      }
    }
    acc[pid].total_sold += item.quantity
    acc[pid].revenue += item.quantity * item.price_at_purchase
    return acc
  }, {})

  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

// ─── Recent Orders ───────────────────────────────────────────────────────────

export async function getRecentOrders(limit: number = 8): Promise<OrderPreview[]> {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, total_amount, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  return data || []
}

// ─── KPI Sparkline Data (Last 30 Days Daily) ─────────────────────────────────

export async function getKPISparklines(): Promise<{
  revenue: SparklinePoint[]
  orders: SparklinePoint[]
  items_sold: SparklinePoint[]
  completion: SparklinePoint[]
}> {
  const days = 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  // Fetch orders in range
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, status, created_at")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  // Fetch items for these orders
  const orderIds = (orders || []).map(o => o.id)
  let itemsByOrder: Record<string, number> = {}

  if (orderIds.length > 0) {
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("order_id, quantity")
      .in("order_id", orderIds)

    if (items) {
      itemsByOrder = items.reduce((acc: Record<string, number>, item) => {
        acc[item.order_id] = (acc[item.order_id] || 0) + item.quantity
        return acc
      }, {})
    }
  }

  // Build daily arrays
  const revenueData: SparklinePoint[] = []
  const ordersData: SparklinePoint[] = []
  const itemsData: SparklinePoint[] = []
  const completionData: SparklinePoint[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    const key = date.toISOString().split("T")[0]

    const dayOrders = (orders || []).filter(
      o => new Date(o.created_at).toISOString().split("T")[0] === key
    )

    const dayRevenue = dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
    const dayItems = dayOrders.reduce((s, o) => s + (itemsByOrder[o.id] || 0), 0)
    const dayDelivered = dayOrders.filter(o => o.status === "delivered").length
    const dayCompletion = dayOrders.length > 0 ? (dayDelivered / dayOrders.length) * 100 : 0

    revenueData.push({ value: dayRevenue })
    ordersData.push({ value: dayOrders.length })
    itemsData.push({ value: dayItems })
    completionData.push({ value: dayCompletion })
  }

  return {
    revenue: revenueData,
    orders: ordersData,
    items_sold: itemsData,
    completion: completionData,
  }
}
