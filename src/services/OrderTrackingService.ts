import { supabaseAdmin } from "@/lib/supabase/client"

export type OrderStatus = 
  | "pending"
  | "paid"
  | "in_packing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderTrackingUpdate {
  orderId: string
  status: OrderStatus
  trackingId?: string
  shippingCompany?: string
  cancellationReason?: string
  adminEmail?: string
}

export class OrderTrackingService {
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    metadata?: {
      trackingId?: string
      shippingCompany?: string
      cancellationReason?: string
      adminEmail?: string
    }
  ): Promise<{ id: string; status: OrderStatus } | null> {
    try {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status,
          ...(metadata?.trackingId && { tracking_id: metadata.trackingId }),
          ...(metadata?.shippingCompany && { shipping_company: metadata.shippingCompany }),
          ...(metadata?.cancellationReason && { cancellation_reason: metadata.cancellationReason }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order status:", error)
        return null
      }

      return { id: orderId, status }
    } catch (error) {
      console.error("Error in updateOrderStatus:", error)
      return null
    }
  }

  static async getOrderStatus(orderId: string): Promise<OrderStatus | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single()

      if (error || !data) {
        return null
      }

      return data.status as OrderStatus
    } catch (error) {
      console.error("Error getting order status:", error)
      return null
    }
  }
}
