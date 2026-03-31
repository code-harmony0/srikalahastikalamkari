import { supabase, supabaseAdmin } from "../lib/supabase/client"
import { OrderTrackingService } from "../services/OrderTrackingService"
import { EnhancedOrder, OrderStatus } from "../lib/supabase/enhanced-types"

export interface Order {
  id: string
  user_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  total_amount: number
  status: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product?: {
    name: string
    images: string[] | null
  }
}

export interface OrderStats {
  total_orders: number
  total_revenue: number
  pending_orders: number
  processing_orders: number
  shipped_orders: number

  cancelled_orders: number
  recent_orders: Order[]
}

export async function getOrderStatistics(): Promise<OrderStats> {
  try {
    // Get total orders count
    const { count: totalOrders } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Get orders by status with timestamps for growth calculations
    const { data: ordersByStatus } = await supabaseAdmin
      .from("orders")
      .select("status, total_amount, created_at")
      .order("created_at", { ascending: false })

    if (!ordersByStatus) {
      throw new Error("Failed to fetch orders data")
    }

    // Calculate current month and last month for growth metrics
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Filter orders by time periods
    const currentMonthOrders = ordersByStatus.filter(
      (order) => new Date(order.created_at) >= currentMonthStart,
    )
    const lastMonthOrders = ordersByStatus.filter(
      (order) =>
        new Date(order.created_at) >= lastMonthStart &&
        new Date(order.created_at) <= lastMonthEnd,
    )

    // Calculate stats
    const stats: OrderStats = {
      total_orders: totalOrders || 0,
      total_revenue: ordersByStatus.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      ),
      pending_orders: ordersByStatus.filter(
        (o) => o.status === "pending" || o.status === "paid",
      ).length,
      processing_orders: ordersByStatus.filter((o) => o.status === "in_packing")
        .length,
      shipped_orders: ordersByStatus.filter((o) => o.status === "shipped")
        .length,
      cancelled_orders: ordersByStatus.filter((o) => o.status === "cancelled")
        .length,
      recent_orders: [],
    }

    // Get recent orders with items
    const { data: recentOrders } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            images
          )
        )
      `,
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
      cancelled_orders: 0,
      recent_orders: [],
    }
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            images
          )
        )
      `,
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
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (
            name,
            images
          )
        )
      `,
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
  status: OrderStatus,
  metadata?: {
    trackingId?: string
    shippingCompany?: string
    cancellationReason?: string
    adminEmail?: string
  },
): Promise<boolean> {
  try {
    // Update order status directly via Supabase
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...metadata,
      })
      .eq("id", orderId)

    return !error
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
      price_at_purchase: item.price,
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
  orderId: string,
  shippingDetails: { shipping_company: string; tracking_id: string },
): Promise<{ data: any | null; error: any }> => {
  try {
    // Update order status to shipped directly via Supabase
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "shipped",
        tracking_id: shippingDetails.tracking_id,
        shipping_company: shippingDetails.shipping_company,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) {
      return { data: null, error: { message: "Failed to update order status" } }
    }

    return { data: { id: orderId, status: "shipped" }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const createPackingSession = async (
  orderId: string,
  adminEmail: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: existingSession, error: checkError } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
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

    // Update order status to in_packing
    await supabaseAdmin
      .from("orders")
      .update({ status: "in_packing", updated_at: new Date().toISOString() })
      .eq("id", orderId)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updatePackingScanProgress = async (
  sessionId: string,
  scanProgress: Record<string, number>,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabaseAdmin
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
  sessionId: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: session, error: fetchError } = await supabaseAdmin
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
      (completedAt.getTime() - startedAt.getTime()) / 60000,
    )

    const { data, error } = await supabaseAdmin
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

    // Update order status to packed
    await supabaseAdmin
      .from("orders")
      .update({ status: "packed", updated_at: new Date().toISOString() })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const cancelPackingSession = async (
  sessionId: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data: session, error: fetchError } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
      .from("packing_sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    // Update order status back to paid (cancelled packing)
    await supabaseAdmin
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", session.order_id)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const getActivePackingSession = async (
  orderId: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const { data, error } = await supabaseAdmin
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
  orderId: string,
  reason: string,
): Promise<{ data: any | null; error: any }> => {
  try {
    const updatedOrder = await OrderTrackingService.updateOrderStatus(
      orderId,
      "cancelled",
      { cancellationReason: reason },
    )

    if (!updatedOrder) {
      return { data: null, error: { message: "Failed to cancel order" } }
    }

    return { data: updatedOrder, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Enhanced barcode generation for products
export const generateProductBarcode = async (
  productId: string,
  productName: string,
): Promise<string> => {
  try {
    // Check if product already has a barcode
    const { data: existingProduct } = await supabaseAdmin
      .from("products")
      .select("barcode")
      .eq("id", productId)
      .single()

    if (existingProduct?.barcode) {
      return existingProduct.barcode
    }

    // Generate SKU-based barcode
    const cleanName = productName
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 6)
    const cleanId = productId
      .replace(/[^0-9]/g, "")
      .slice(-6)
      .padStart(6, "0")
    const barcode = `${cleanName}${cleanId}`

    // Update product with generated barcode
    await supabaseAdmin.from("products").update({ barcode }).eq("id", productId)

    return barcode
  } catch (error) {
    console.error("Error generating product barcode:", error)
    // Fallback to simple ID-based barcode
    return productId
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .slice(-12)
  }
}

// Generate Order QR data
export const generateOrderQrData = (order: any): string => {
  return JSON.stringify({
    id: order.id,
    customer:
      order.shipping_address?.firstName || order.customer_name || "Guest",
    items: order.order_items?.length || 0,
    total: order.total_amount,
    timestamp: new Date().toISOString(),
  })
}

// Generate shipping package ID
export const generateShippingId = (orderId: string): string => {
  const timestamp = Date.now().toString().slice(-6)
  const orderShort = orderId.slice(-4).toUpperCase()
  return `PKG-${orderShort}-${timestamp}`
}

// Bulk generate barcodes for all products without them
export const generateMissingBarcodes = async (): Promise<{
  success: number
  errors: number
}> => {
  try {
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, barcode")
      .is("barcode", null)

    if (!products || products.length === 0) {
      return { success: 0, errors: 0 }
    }

    let success = 0
    let errors = 0

    for (const product of products) {
      try {
        await generateProductBarcode(product.id, product.name)
        success++
      } catch (error) {
        console.error(
          `Failed to generate barcode for product ${product.id}:`,
          error,
        )
        errors++
      }
    }

    return { success, errors }
  } catch (error) {
    console.error("Error in bulk barcode generation:", error)
    return { success: 0, errors: 1 }
  }
}

// Check if user has purchased a product
export async function hasPurchasedProduct(
  productId: string,
  customerEmail: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_items!inner (
          product_id
        )
      `,
      )
      .eq("customer_email", customerEmail)
      .eq("order_items.product_id", productId)
      .in("status", ["paid", "shipped", "packed", "in_packing"])
      .limit(1)

    if (error) throw error
    return (data?.length || 0) > 0
  } catch (error) {
    console.error("Error checking purchase history:", error)
    return false
  }
}
