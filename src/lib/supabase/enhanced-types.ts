export type OrderStatus = 
  | "pending"
  | "paid"
  | "in_packing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface EnhancedOrder {
  id: string
  user_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  total_amount: number
  status: OrderStatus
  tracking_id?: string
  shipping_company?: string
  created_at: string
  updated_at: string
  order_items: Array<{
    id: string
    order_id: string
    product_id: string
    quantity: number
    price_at_purchase: number
    product?: {
      name: string
      images: string[] | null
    }
  }>
}

export interface OrderTrackingEvent {
  id: string
  order_id: string
  status: OrderStatus
  created_at: string
  metadata?: {
    trackingId?: string
    shippingCompany?: string
    notes?: string
  }
}
