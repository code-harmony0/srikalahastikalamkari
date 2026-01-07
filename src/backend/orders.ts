import { supabase } from "./supabase/client"

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: {
    name: string
    image_url: string
  }
}

export interface OrderStats {
  total_orders: number
  total_revenue: number
  pending_orders: number
  processing_orders: number
  shipped_orders: number
  delivered_orders: number
  cancelled_orders: number
  recent_orders: Order[]
}

export async function getOrderStatistics(): Promise<OrderStats> {
  try {
    // Get total orders count
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Get orders by status
    const { data: ordersByStatus } = await supabase
      .from("orders")
      .select("status, total_amount")
      .order("created_at", { ascending: false })

    // Calculate stats
    const stats: OrderStats = {
      total_orders: totalOrders || 0,
      total_revenue:
        ordersByStatus?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0,
      pending_orders:
        ordersByStatus?.filter((o) => o.status === "pending").length || 0,
      processing_orders:
        ordersByStatus?.filter((o) => o.status === "processing").length || 0,
      shipped_orders:
        ordersByStatus?.filter((o) => o.status === "shipped").length || 0,
      delivered_orders:
        ordersByStatus?.filter((o) => o.status === "delivered").length || 0,
      cancelled_orders:
        ordersByStatus?.filter((o) => o.status === "cancelled").length || 0,
      recent_orders: [],
    }

    // Get recent orders with items
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5)

    stats.recent_orders = recentOrders || []

    return stats
  } catch (error) {
    console.error("Error fetching order statistics:", error)
    // Return default stats if there's an error
    return {
      total_orders: 0,
      total_revenue: 0,
      pending_orders: 0,
      processing_orders: 0,
      shipped_orders: 0,
      delivered_orders: 0,
      cancelled_orders: 0,
      recent_orders: [],
    }
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `
      )
      .eq("id", orderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

export async function getOrders(limit = 10, offset = 0): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error updating order status:", error)
    return false
  }
}

export async function createOrder(orderData: {
  user_id: string
  total_amount: number
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
}): Promise<Order | null> {
  try {
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Return the complete order with items
    return await getOrders(1, 0).then((orders) => orders[0])
  } catch (error) {
    console.error("Error creating order:", error)
    return null
  }
}

// Shipping and Packing Functions

export const shipOrder = async (
  orderId: number | string,
  shippingDetails: { shipping_company: string; tracking_id: string }
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "shipped",
        shipped_at: new Date().toISOString(),
        shipping_company: shippingDetails.shipping_company,
        tracking_id: shippingDetails.tracking_id,
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const deliverOrder = async (
  orderId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const createPackingSession = async (
  orderId: number | string,
  adminEmail: string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: existingSession, error: checkError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (checkError) {
      return { data: null, error: checkError }
    }

    if (existingSession) {
      return { data: existingSession, error: null }
    }

    const { data, error } = await supabase
      .from("packing_sessions")
      .insert({
        order_id: orderId,
        admin_email: adminEmail,
        scan_progress: {},
        status: "in_progress",
      })
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    await supabase
      .from("orders")
      .update({ status: "in_packing" })
      .eq("id", orderId)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updatePackingScanProgress = async (
  sessionId: number | string,
  scanProgress: Record<string, number>
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("packing_sessions")
      .update({ scan_progress: scanProgress })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const completePackingSession = async (
  sessionId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: session, error: fetchError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (fetchError || !session) {
      return {
        data: null,
        error: fetchError || { message: "Session not found" },
      }
    }

    const startedAt = new Date(session.started_at)
    const completedAt = new Date()
    const durationMinutes = Math.round(
      (completedAt.getTime() - startedAt.getTime()) / 60000
    )

    const { data, error } = await supabase
      .from("packing_sessions")
      .update({
        status: "completed",
        completed_at: completedAt.toISOString(),
        packing_duration_minutes: durationMinutes,
      })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    await supabase
      .from("orders")
      .update({
        status: "packed",
        packed_at: completedAt.toISOString(),
      })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const cancelPackingSession = async (
  sessionId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: session, error: fetchError } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()

    if (fetchError || !session) {
      return {
        data: null,
        error: fetchError || { message: "Session not found" },
      }
    }

    const { data, error } = await supabase
      .from("packing_sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getActivePackingSession = async (
  orderId: number | string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("packing_sessions")
      .select("*")
      .eq("order_id", orderId)
      .eq("status", "in_progress")
      .maybeSingle()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const cancelOrder = async (
  orderId: number | string,
  reason: string
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
      })
      .eq("id", orderId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
