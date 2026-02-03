import { supabase, supabaseAdmin } from '../lib/supabase/client'
import { EnhancedOrder, OrderStatus, Database } from '../lib/supabase/enhanced-types'
import { CourierService, DeliveryEstimate } from './CourierService'
import { 
  calculateEstimatedDelivery, 
  getDeliveryMessage, 
  formatDeliveryTimeframe,
  isBusinessDay,
  addBusinessDays 
} from '../shared/config/delivery'

/**
 * Enhanced Order Tracking Service
 * 
 * Provides comprehensive order status management with:
 * - Status transition validation
 * - Timestamp tracking for all status changes
 * - Status history preservation
 * - Customer-friendly status display
 * 
 * Requirements: 1.4, 1.5
 */
export class OrderTrackingService {
  
  /**
   * Valid status transitions mapping
   * Defines which status changes are allowed from each current status
   */
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    'pending': ['paid', 'cancelled'],
    'paid': ['in_packing', 'cancelled'],
    'in_packing': ['packed', 'paid', 'cancelled'], // Can go back to paid if packing is cancelled
    'packed': ['shipped', 'in_packing'], // Can go back to in_packing if needed
    'shipped': ['delivered'],
    'delivered': [], // Terminal state
    'cancelled': [] // Terminal state
  }

  /**
   * Customer-friendly status messages
   * Maps technical status to user-friendly language with next steps
   */
  private static readonly CUSTOMER_FRIENDLY_MESSAGES: Record<OrderStatus, {
    display: string
    description: string
    nextSteps: string
    expectedTimeframe?: string
  }> = {
    'pending': {
      display: 'Order Received',
      description: 'We have received your order and are processing your payment.',
      nextSteps: 'Your order will move to preparation once payment is confirmed.',
      expectedTimeframe: 'Usually within 1-2 hours'
    },
    'paid': {
      display: 'Payment Confirmed',
      description: 'Your payment has been confirmed and your order is ready for preparation.',
      nextSteps: 'Our team will start preparing your order for shipment.',
      expectedTimeframe: '1-2 business days'
    },
    'in_packing': {
      display: 'Being Prepared',
      description: 'Your order is currently being carefully prepared and packed.',
      nextSteps: 'Once packed, your order will be ready for shipment.',
      expectedTimeframe: 'Usually within 4-6 hours'
    },
    'packed': {
      display: 'Ready to Ship',
      description: 'Your order has been packed and is ready for pickup by our courier partner.',
      nextSteps: 'Your order will be shipped and you will receive tracking information.',
      expectedTimeframe: 'Usually ships within 24 hours'
    },
    'shipped': {
      display: 'On the Way',
      description: 'Your order has been shipped and is on its way to you.',
      nextSteps: 'Track your package using the tracking number provided.',
      expectedTimeframe: 'Delivery within 3-7 business days'
    },
    'delivered': {
      display: 'Delivered',
      description: 'Your order has been successfully delivered.',
      nextSteps: 'Enjoy your purchase! We would love to hear your feedback.',
    },
    'cancelled': {
      display: 'Cancelled',
      description: 'This order has been cancelled.',
      nextSteps: 'If you have any questions, please contact our support team.',
    }
  }

  /**
   * Validates if a status transition is allowed
   * @param currentStatus Current order status
   * @param newStatus Desired new status
   * @returns true if transition is valid, false otherwise
   */
  public static validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const allowedTransitions = this.VALID_TRANSITIONS[currentStatus] || []
    return allowedTransitions.includes(newStatus)
  }

  /**
   * Gets customer-friendly status information
   * @param status Order status
   * @returns Customer-friendly status information
   */
  public static getCustomerFriendlyStatus(status: OrderStatus) {
    return this.CUSTOMER_FRIENDLY_MESSAGES[status]
  }

  /**
   * Updates order status with comprehensive tracking
   * @param orderId Order ID to update
   * @param newStatus New status to set
   * @param metadata Optional metadata for the status change
   * @returns Promise resolving to updated order or null if failed
   */
  public static async updateOrderStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    metadata?: {
      trackingId?: string
      shippingCompany?: string
      cancellationReason?: string
      adminEmail?: string
    }
  ): Promise<EnhancedOrder | null> {
    try {
      // First, get the current order to validate transition
      const { data: currentOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (fetchError || !currentOrder) {
        console.error('Error fetching current order:', fetchError)
        return null
      }

      // Validate status transition
      if (!this.validateStatusTransition(currentOrder.status as OrderStatus, newStatus)) {
        console.error(`Invalid status transition from ${currentOrder.status} to ${newStatus}`)
        return null
      }

      // Prepare update data with timestamps
      const now = new Date().toISOString()
      const updateData: Partial<Database['public']['Tables']['orders']['Update']> = {
        status: newStatus,
        updated_at: now
      }

      // Add status-specific timestamps and data
      switch (newStatus) {
        case 'paid':
          // Set initial delivery estimate when order is confirmed
          try {
            const estimate = await this.calculateDeliveryEstimate(currentOrder as EnhancedOrder)
            if (estimate) {
              updateData.estimated_delivery = estimate.estimatedDate.toISOString()
            }
          } catch (error) {
            console.error('Error setting initial delivery estimate:', error)
          }
          break
        case 'in_packing':
          updateData.packing_started_at = now
          break
        case 'packed':
          updateData.packed_at = now
          break
        case 'shipped':
          updateData.shipped_at = now
          if (metadata?.trackingId) {
            updateData.tracking_id = metadata.trackingId
          }
          if (metadata?.shippingCompany) {
            updateData.shipping_company = metadata.shippingCompany
            
            // Update delivery estimate with courier-specific timeframe
            try {
              const estimate = await this.calculateDeliveryEstimate({
                ...currentOrder,
                shipping_company: metadata.shippingCompany
              } as EnhancedOrder)
              
              if (estimate) {
                updateData.estimated_delivery = estimate.estimatedDate.toISOString()
              }
            } catch (error) {
              console.error('Error updating delivery estimate on shipping:', error)
            }
          }
          break
        case 'delivered':
          updateData.delivered_at = now
          updateData.actual_delivery = now
          break
        case 'cancelled':
          if (metadata?.cancellationReason) {
            updateData.cancellation_reason = metadata.cancellationReason
          }
          break
      }

      // Calculate processing time if order is completed or cancelled
      if (newStatus === 'delivered' || newStatus === 'cancelled') {
        const createdAt = new Date(currentOrder.created_at)
        const completedAt = new Date(now)
        const processingTimeMinutes = Math.round(
          (completedAt.getTime() - createdAt.getTime()) / (1000 * 60)
        )
        updateData.processing_time_minutes = processingTimeMinutes
      }

      // Update the order
      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select('*')
        .single()

      if (updateError) {
        console.error('Error updating order status:', updateError)
        return null
      }

      // Log the status change for audit trail
      await this.logStatusChange(orderId, currentOrder.status as OrderStatus, newStatus, metadata?.adminEmail)

      return updatedOrder as EnhancedOrder
    } catch (error) {
      console.error('Error in updateOrderStatus:', error)
      return null
    }
  }

  /**
   * Gets complete order timeline with status history
   * @param orderId Order ID
   * @returns Promise resolving to order timeline
   */
  public static async getOrderTimeline(orderId: string): Promise<{
    order: EnhancedOrder | null
    timeline: Array<{
      status: OrderStatus
      timestamp: string
      customerFriendly: ReturnType<typeof OrderTrackingService.getCustomerFriendlyStatus>
      isCompleted: boolean
    }>
  }> {
    try {
      // Get the order with all related data
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images,
              barcode
            )
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderError || !order) {
        console.error('Error fetching order:', orderError)
        return { order: null, timeline: [] }
      }

      // Build timeline from order timestamps
      const timeline: Array<{
        status: OrderStatus
        timestamp: string
        customerFriendly: ReturnType<typeof OrderTrackingService.getCustomerFriendlyStatus>
        isCompleted: boolean
      }> = []

      // Add timeline entries based on available timestamps
      const timelineEntries: Array<{ status: OrderStatus; timestamp: string | null }> = [
        { status: 'pending', timestamp: order.created_at },
        { status: 'paid', timestamp: order.created_at }, // Assuming paid immediately after creation for now
        { status: 'in_packing', timestamp: order.packing_started_at },
        { status: 'packed', timestamp: order.packed_at },
        { status: 'shipped', timestamp: order.shipped_at },
        { status: 'delivered', timestamp: order.delivered_at || order.actual_delivery }
      ]

      // Handle cancelled orders - use updated_at as cancellation timestamp
      if (order.status === 'cancelled') {
        timelineEntries.push({ status: 'cancelled', timestamp: order.updated_at })
      }

      // Build timeline with completed status
      for (const entry of timelineEntries) {
        if (entry.timestamp) {
          timeline.push({
            status: entry.status,
            timestamp: entry.timestamp,
            customerFriendly: this.getCustomerFriendlyStatus(entry.status),
            isCompleted: true
          })
        } else if (entry.status === order.status) {
          // Current status (in progress)
          timeline.push({
            status: entry.status,
            timestamp: order.updated_at,
            customerFriendly: this.getCustomerFriendlyStatus(entry.status),
            isCompleted: false
          })
          break // Don't add future statuses
        }
      }

      return { order: order as EnhancedOrder, timeline }
    } catch (error) {
      console.error('Error getting order timeline:', error)
      return { order: null, timeline: [] }
    }
  }

  /**
   * Gets orders grouped by status for customer portal
   * @param userId User ID (optional, for customer-specific orders)
   * @param limit Number of orders to fetch per status
   * @returns Promise resolving to orders grouped by status
   */
  public static async getOrdersByStatus(
    userId?: string, 
    limit: number = 10
  ): Promise<Record<OrderStatus, EnhancedOrder[]>> {
    try {
      let query = supabaseAdmin
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images,
              barcode
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: orders, error } = await query

      if (error) {
        console.error('Error fetching orders by status:', error)
        return {} as Record<OrderStatus, EnhancedOrder[]>
      }

      // Group orders by status
      const groupedOrders: Record<OrderStatus, EnhancedOrder[]> = {
        'pending': [],
        'paid': [],
        'in_packing': [],
        'packed': [],
        'shipped': [],
        'delivered': [],
        'cancelled': []
      }

      for (const order of orders || []) {
        groupedOrders[order.status as OrderStatus].push(order as EnhancedOrder)
      }

      return groupedOrders
    } catch (error) {
      console.error('Error in getOrdersByStatus:', error)
      return {} as Record<OrderStatus, EnhancedOrder[]>
    }
  }

  /**
   * Logs status changes for audit trail
   * @param orderId Order ID
   * @param fromStatus Previous status
   * @param toStatus New status
   * @param adminEmail Admin who made the change (optional)
   */
  private static async logStatusChange(
    orderId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    adminEmail?: string
  ): Promise<void> {
    try {
      // For now, we'll use the order_metrics table to log status changes
      // In a future enhancement, we could create a dedicated status_change_log table
      await supabaseAdmin
        .from('order_metrics')
        .insert({
          order_id: orderId,
          metric_type: 'processing_time',
          metric_value: 0, // Placeholder value
          recorded_at: new Date().toISOString(),
          metadata: {
            status_change: {
              from: fromStatus,
              to: toStatus,
              admin_email: adminEmail,
              timestamp: new Date().toISOString()
            }
          }
        })
    } catch (error) {
      // Don't fail the main operation if logging fails
      console.error('Error logging status change:', error)
    }
  }

  /**
   * Calculates comprehensive delivery estimate for an order
   * Integrates with courier configurations and business day handling
   * @param order Order to calculate delivery estimate for
   * @param region Regional configuration for holidays (optional)
   * @returns Promise resolving to delivery estimate
   */
  public static async calculateDeliveryEstimate(
    order: EnhancedOrder,
    region: string = 'default'
  ): Promise<DeliveryEstimate | null> {
    try {
      const orderDate = new Date(order.created_at)
      let courierTimeframeDays: number | null = null
      let courierName = 'Standard Delivery'

      // Get courier-specific timeframe if shipping company is set
      if (order.shipping_company) {
        const courier = await CourierService.getCourierByCode(order.shipping_company.toLowerCase())
        if (courier) {
          courierTimeframeDays = courier.delivery_timeframe_days
          courierName = courier.courier_name
        }
      }

      // Calculate delivery estimate using enhanced delivery configuration
      const estimate = calculateEstimatedDelivery(orderDate, courierTimeframeDays || undefined, region)

      return {
        estimatedDate: estimate.estimatedDate,
        minDate: estimate.minDate,
        maxDate: estimate.maxDate,
        timeframeDays: courierTimeframeDays || 7,
        courierName,
        processingDelay: estimate.processingDelay,
        holidayImpact: estimate.holidayImpact
      }
    } catch (error) {
      console.error('Error calculating delivery estimate:', error)
      return null
    }
  }

  /**
   * Updates order with estimated delivery date
   * Called when order status changes or shipping company is assigned
   * @param orderId Order ID to update
   * @param region Regional configuration (optional)
   * @returns Promise resolving to success status
   */
  public static async updateOrderDeliveryEstimate(
    orderId: string,
    region: string = 'default'
  ): Promise<boolean> {
    try {
      // Get the order
      const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (fetchError || !order) {
        console.error('Error fetching order for delivery estimate:', fetchError)
        return false
      }

      // Calculate delivery estimate
      const estimate = await this.calculateDeliveryEstimate(order as EnhancedOrder, region)
      if (!estimate) {
        return false
      }

      // Update order with estimated delivery
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          estimated_delivery: estimate.estimatedDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order delivery estimate:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateOrderDeliveryEstimate:', error)
      return false
    }
  }

  /**
   * Generates tracking URL for an order using CourierService
   * @param order Order with shipping information
   * @returns Promise resolving to tracking URL or null
   */
  public static async generateTrackingUrl(order: EnhancedOrder): Promise<string | null> {
    try {
      if (!order.shipping_company || !order.tracking_id) {
        return null
      }

      return await CourierService.generateTrackingUrl(
        order.shipping_company.toLowerCase(),
        order.tracking_id
      )
    } catch (error) {
      console.error('Error generating tracking URL:', error)
      return null
    }
  }

  /**
   * Gets enhanced customer-friendly status with delivery information
   * @param order Order to get status for
   * @returns Promise resolving to enhanced status information
   */
  public static async getEnhancedCustomerStatus(order: EnhancedOrder): Promise<{
    display: string
    description: string
    nextSteps: string
    expectedTimeframe?: string
    deliveryEstimate?: DeliveryEstimate
    trackingUrl?: string | null
    deliveryMessage: string
  }> {
    try {
      const baseStatus = this.getCustomerFriendlyStatus(order.status)
      const deliveryEstimate = await this.calculateDeliveryEstimate(order)
      const trackingUrl = await this.generateTrackingUrl(order)

      // Generate enhanced delivery message
      const deliveryMessage = getDeliveryMessage(
        order.status,
        order.shipping_company || undefined,
        order.tracking_id || undefined,
        deliveryEstimate?.estimatedDate,
        deliveryEstimate?.processingDelay,
        deliveryEstimate?.holidayImpact
      )

      return {
        ...baseStatus,
        deliveryEstimate: deliveryEstimate || undefined,
        trackingUrl,
        deliveryMessage
      }
    } catch (error) {
      console.error('Error getting enhanced customer status:', error)
      const baseStatus = this.getCustomerFriendlyStatus(order.status)
      return {
        ...baseStatus,
        deliveryMessage: getDeliveryMessage(order.status)
      }
    }
  }

  /**
   * Gets processing time statistics for orders
   * @param dateRange Optional date range to filter orders
   * @returns Promise resolving to processing time statistics
   */
  public static async getProcessingTimeStats(dateRange?: {
    start: string
    end: string
  }): Promise<{
    averageProcessingTime: number
    totalOrders: number
    statusBreakdown: Record<OrderStatus, { count: number; avgTime: number }>
  }> {
    try {
      let query = supabaseAdmin
        .from('orders')
        .select('status, processing_time_minutes, created_at')
        .not('processing_time_minutes', 'is', null)

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end)
      }

      const { data: orders, error } = await query

      if (error || !orders) {
        console.error('Error fetching processing time stats:', error)
        return {
          averageProcessingTime: 0,
          totalOrders: 0,
          statusBreakdown: {} as Record<OrderStatus, { count: number; avgTime: number }>
        }
      }

      // Calculate statistics
      const totalOrders = orders.length
      const totalProcessingTime = orders.reduce(
        (sum, order) => sum + (order.processing_time_minutes || 0), 
        0
      )
      const averageProcessingTime = totalOrders > 0 ? totalProcessingTime / totalOrders : 0

      // Calculate status breakdown
      const statusBreakdown: Record<OrderStatus, { count: number; avgTime: number }> = {
        'pending': { count: 0, avgTime: 0 },
        'paid': { count: 0, avgTime: 0 },
        'in_packing': { count: 0, avgTime: 0 },
        'packed': { count: 0, avgTime: 0 },
        'shipped': { count: 0, avgTime: 0 },
        'delivered': { count: 0, avgTime: 0 },
        'cancelled': { count: 0, avgTime: 0 }
      }

      for (const order of orders) {
        const status = order.status as OrderStatus
        statusBreakdown[status].count++
        statusBreakdown[status].avgTime += order.processing_time_minutes || 0
      }

      // Calculate averages
      for (const status in statusBreakdown) {
        const statusData = statusBreakdown[status as OrderStatus]
        if (statusData.count > 0) {
          statusData.avgTime = statusData.avgTime / statusData.count
        }
      }

      return {
        averageProcessingTime,
        totalOrders,
        statusBreakdown
      }
    } catch (error) {
      console.error('Error calculating processing time stats:', error)
      return {
        averageProcessingTime: 0,
        totalOrders: 0,
        statusBreakdown: {} as Record<OrderStatus, { count: number; avgTime: number }>
      }
    }
  }
}