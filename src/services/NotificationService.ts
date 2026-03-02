import { supabase } from "../lib/supabase/client"
import {
  EnhancedOrder,
  NotificationLog,
  NotificationType,
  NotificationStatus,
} from "../lib/supabase/enhanced-types"

/**
 * Notification Service
 *
 * Manages multi-channel customer notifications with comprehensive logging
 * Supports email, push, and SMS notifications with retry logic
 *
 * Requirements: 3.1, 3.2, 3.5
 */

export interface NotificationTemplate {
  subject: string
  body: string
  htmlBody?: string
}

export interface NotificationOptions {
  channels?: NotificationType[]
  priority?: "high" | "normal" | "low"
  scheduleAt?: Date
  metadata?: Record<string, any>
}

export class NotificationService {
  /**
   * Email notification templates for different order statuses
   */
  private static readonly EMAIL_TEMPLATES: Record<
    string,
    NotificationTemplate
  > = {
    order_confirmed: {
      subject: "Order Confirmed - #{orderNumber}",
      body: `Dear {customerName},

Thank you for your order! We've received your order #{orderNumber} and payment has been confirmed.

Order Details:
- Order Number: #{orderNumber}
- Total Amount: ₹{totalAmount}
- Order Date: {orderDate}

What's Next:
Our team will start preparing your order for shipment. You'll receive another notification once your order is packed and ready to ship.

Expected Timeline:
Your order will be prepared within 1-2 business days.

If you have any questions, feel free to contact our support team.

Best regards,
The Team`,
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Order Confirmed!</h2>
  <p>Dear {customerName},</p>
  <p>Thank you for your order! We've received your order <strong>#{orderNumber}</strong> and payment has been confirmed.</p>
  
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Order Details</h3>
    <p><strong>Order Number:</strong> #{orderNumber}</p>
    <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
    <p><strong>Order Date:</strong> {orderDate}</p>
  </div>
  
  <h3>What's Next</h3>
  <p>Our team will start preparing your order for shipment. You'll receive another notification once your order is packed and ready to ship.</p>
  
  <p><strong>Expected Timeline:</strong> Your order will be prepared within 1-2 business days.</p>
  
  <p>If you have any questions, feel free to contact our support team.</p>
  
  <p>Best regards,<br>The Team</p>
</div>`,
    },

    order_packing: {
      subject: "Your Order is Being Prepared - #{orderNumber}",
      body: `Dear {customerName},

Great news! Your order #{orderNumber} is now being carefully prepared and packed by our team.

Order Status: Being Prepared

What's Happening:
Our team is carefully selecting and packing your items to ensure they arrive in perfect condition.

What's Next:
Once your order is packed, we'll hand it over to our courier partner for delivery. You'll receive tracking information as soon as it's shipped.

Expected Timeline:
Your order should be ready for shipment within 4-6 hours.

Thank you for your patience!

Best regards,
The Team`,
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Your Order is Being Prepared!</h2>
  <p>Dear {customerName},</p>
  <p>Great news! Your order <strong>#{orderNumber}</strong> is now being carefully prepared and packed by our team.</p>
  
  <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Order Status:</strong> Being Prepared</p>
  </div>
  
  <h3>What's Happening</h3>
  <p>Our team is carefully selecting and packing your items to ensure they arrive in perfect condition.</p>
  
  <h3>What's Next</h3>
  <p>Once your order is packed, we'll hand it over to our courier partner for delivery. You'll receive tracking information as soon as it's shipped.</p>
  
  <p><strong>Expected Timeline:</strong> Your order should be ready for shipment within 4-6 hours.</p>
  
  <p>Thank you for your patience!</p>
  
  <p>Best regards,<br>The Team</p>
</div>`,
    },

    order_shipped: {
      subject: "Your Order Has Been Shipped! - #{orderNumber}",
      body: `Dear {customerName},

Exciting news! Your order #{orderNumber} has been shipped and is on its way to you!

Shipping Details:
- Courier: {courierName}
- Tracking Number: {trackingNumber}
- Estimated Delivery: {estimatedDelivery}

Track Your Order:
You can track your package using the tracking number above on the {courierName} website:
{trackingUrl}

What's Next:
Your order will be delivered to your address within {deliveryTimeframe}. Please ensure someone is available to receive the package.

Delivery Address:
{deliveryAddress}

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
The Team`,
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Your Order Has Been Shipped!</h2>
  <p>Dear {customerName},</p>
  <p>Exciting news! Your order <strong>#{orderNumber}</strong> has been shipped and is on its way to you!</p>
  
  <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Shipping Details</h3>
    <p><strong>Courier:</strong> {courierName}</p>
    <p><strong>Tracking Number:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 3px;">{trackingNumber}</code></p>
    <p><strong>Estimated Delivery:</strong> {estimatedDelivery}</p>
  </div>
  
  <div style="text-align: center; margin: 20px 0;">
    <a href="{trackingUrl}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Package</a>
  </div>
  
  <h3>What's Next</h3>
  <p>Your order will be delivered to your address within <strong>{deliveryTimeframe}</strong>. Please ensure someone is available to receive the package.</p>
  
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h4 style="margin-top: 0;">Delivery Address</h4>
    <p style="margin: 0;">{deliveryAddress}</p>
  </div>
  
  <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
  
  <p>Best regards,<br>The Team</p>
</div>`,
    },

    order_delivered: {
      subject: "Your Order Has Been Delivered! - #{orderNumber}",
      body: `Dear {customerName},

Great news! Your order #{orderNumber} has been successfully delivered!

Delivery Confirmation:
- Delivered On: {deliveredDate}
- Order Number: #{orderNumber}

We hope you love your purchase! If you have a moment, we'd appreciate your feedback on your order.

Need Help?
If you have any issues with your order or need assistance, please contact our support team immediately.

Thank you for shopping with us! We look forward to serving you again.

Best regards,
The Team`,
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4CAF50;">Your Order Has Been Delivered!</h2>
  <p>Dear {customerName},</p>
  <p>Great news! Your order <strong>#{orderNumber}</strong> has been successfully delivered!</p>
  
  <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Delivery Confirmation</h3>
    <p><strong>Delivered On:</strong> {deliveredDate}</p>
    <p><strong>Order Number:</strong> #{orderNumber}</p>
  </div>
  
  <p>We hope you love your purchase! If you have a moment, we'd appreciate your feedback on your order.</p>
  
  <h3>Need Help?</h3>
  <p>If you have any issues with your order or need assistance, please contact our support team immediately.</p>
  
  <p>Thank you for shopping with us! We look forward to serving you again.</p>
  
  <p>Best regards,<br>The Team</p>
</div>`,
    },

    order_cancelled: {
      subject: "Order Cancelled - #{orderNumber}",
      body: `Dear {customerName},

Your order #{orderNumber} has been cancelled as requested.

Cancellation Details:
- Order Number: #{orderNumber}
- Cancelled On: {cancelledDate}
- Reason: {cancellationReason}

Questions?
If you have any questions about this cancellation or need further assistance, please contact our support team.

We hope to serve you again in the future!

Best regards,
The Team`,
      htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Order Cancelled</h2>
  <p>Dear {customerName},</p>
  <p>Your order <strong>#{orderNumber}</strong> has been cancelled as requested.</p>
  
  <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Cancellation Details</h3>
    <p><strong>Order Number:</strong> #{orderNumber}</p>
    <p><strong>Cancelled On:</strong> {cancelledDate}</p>
    <p><strong>Reason:</strong> {cancellationReason}</p>
  </div>
  
  <h3>Questions?</h3>
  <p>If you have any questions about this cancellation or need further assistance, please contact our support team.</p>
  
  <p>We hope to serve you again in the future!</p>
  
  <p>Best regards,<br>The Team</p>
</div>`,
    },
  }

  /**
   * Sends order update notification through specified channels
   */
  public static async sendOrderUpdate(
    order: EnhancedOrder,
    status: string,
    options: NotificationOptions = {},
  ): Promise<boolean> {
    try {
      const {
        channels = ["email"],
        priority = "normal",
        metadata = {},
      } = options

      // Check notification preferences
      const preferences = order.notification_preferences
      if (!preferences) {
        console.warn("No notification preferences found for order:", order.id)
        return false
      }

      // Filter channels based on user preferences
      const enabledChannels = channels.filter((channel) => {
        if (channel === "email") return preferences.email
        if (channel === "push") return preferences.push
        if (channel === "sms") return preferences.sms
        return false
      })

      if (enabledChannels.length === 0) {
        console.log("No enabled notification channels for order:", order.id)
        return true // Not an error, user has disabled notifications
      }

      // Check timing preference
      if (preferences.timing_preference === "milestone_only") {
        const milestones = ["paid", "shipped", "delivered", "cancelled"]
        if (!milestones.includes(status)) {
          console.log(
            "Skipping non-milestone notification for order:",
            order.id,
          )
          return true
        }
      }

      // Send notifications through enabled channels
      let success = true
      for (const channel of enabledChannels) {
        const sent = await this.sendNotification(
          order,
          status,
          channel,
          metadata,
        )
        if (!sent) success = false
      }

      // Update last notification sent timestamp
      if (success) {
        await supabase
          .from("orders")
          .update({ last_notification_sent: new Date().toISOString() })
          .eq("id", order.id)
      }

      return success
    } catch (error) {
      console.error("Error sending order update notification:", error)
      return false
    }
  }

  /**
   * Sends notification through a specific channel
   */
  private static async sendNotification(
    order: EnhancedOrder,
    status: string,
    channel: NotificationType,
    metadata: Record<string, any>,
  ): Promise<boolean> {
    try {
      const template = this.getTemplateForStatus(status)
      if (!template) {
        console.warn("No template found for status:", status)
        return false
      }

      const content = this.populateTemplate(template, order, metadata)
      const recipient = this.getRecipient(order, channel)

      if (!recipient) {
        console.warn("No recipient found for channel:", channel)
        return false
      }

      // Send notification based on channel
      let sent = false
      switch (channel) {
        case "email":
          sent = await this.sendEmail(
            recipient,
            content.subject,
            content.body,
            content.htmlBody,
          )
          break
        case "push":
          sent = await this.sendPushNotification(
            order,
            content.subject,
            content.body,
          )
          break
        case "sms":
          sent = await this.sendSMS(recipient, content.body)
          break
      }

      // Log notification
      await this.logNotification(
        order.id,
        channel,
        sent ? "sent" : "failed",
        template.subject,
        recipient,
      )

      return sent
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error)
      await this.logNotification(
        order.id,
        channel,
        "failed",
        "",
        "",
        String(error),
      )
      return false
    }
  }

  /**
   * Gets appropriate template for order status
   */
  private static getTemplateForStatus(
    status: string,
  ): NotificationTemplate | null {
    const templateMap: Record<string, string> = {
      paid: "order_confirmed",
      in_packing: "order_packing",
      shipped: "order_shipped",
      delivered: "order_delivered",
      cancelled: "order_cancelled",
    }

    const templateKey = templateMap[status]
    return templateKey ? this.EMAIL_TEMPLATES[templateKey] : null
  }

  /**
   * Populates template with order data
   */
  private static populateTemplate(
    template: NotificationTemplate,
    order: EnhancedOrder,
    metadata: Record<string, any>,
  ): { subject: string; body: string; htmlBody?: string } {
    const data = {
      orderNumber: order.id.substring(0, 8).toUpperCase(),
      customerName: order.customer_name || "Valued Customer",
      totalAmount: order.total_amount.toFixed(2),
      orderDate: new Date(order.created_at).toLocaleDateString("en-IN"),
      courierName: metadata.courierName || order.shipping_company || "Courier",
      trackingNumber: order.tracking_id || "N/A",
      trackingUrl: metadata.trackingUrl || "#",
      estimatedDelivery: metadata.estimatedDelivery || "Soon",
      deliveryTimeframe: metadata.deliveryTimeframe || "3-7 business days",
      deliveryAddress: this.formatAddress(order.shipping_address),
      deliveredDate: order.delivered_at
        ? new Date(order.delivered_at).toLocaleDateString("en-IN")
        : "Today",
      cancelledDate: new Date().toLocaleDateString("en-IN"),
      cancellationReason: order.cancellation_reason || "Customer request",
    }

    let subject = template.subject
    let body = template.body
    let htmlBody = template.htmlBody

    // Replace placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      subject = subject.replace(new RegExp(placeholder, "g"), String(value))
      body = body.replace(new RegExp(placeholder, "g"), String(value))
      if (htmlBody) {
        htmlBody = htmlBody.replace(new RegExp(placeholder, "g"), String(value))
      }
    })

    return { subject, body, htmlBody }
  }

  /**
   * Gets recipient for notification channel
   */
  private static getRecipient(
    order: EnhancedOrder,
    channel: NotificationType,
  ): string {
    switch (channel) {
      case "email":
        return order.customer_email || ""
      case "sms":
        return order.customer_phone || ""
      case "push":
        return order.user_id || ""
      default:
        return ""
    }
  }

  /**
   * Formats shipping address for display
   */
  private static formatAddress(address: any): string {
    if (!address) return "Address not provided"

    if (typeof address === "string") return address

    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean)

    return parts.join(", ")
  }

  /**
   * Sends email notification (placeholder - integrate with actual email service)
   */
  private static async sendEmail(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string,
  ): Promise<boolean> {
    try {
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      console.log("Sending email:", { to, subject })

      // For now, just log the email
      // In production, replace with actual email service integration

      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  /**
   * Sends push notification (placeholder - will be implemented in 5.2)
   */
  private static async sendPushNotification(
    order: EnhancedOrder,
    title: string,
    body: string,
  ): Promise<boolean> {
    try {
      // Will be implemented in task 5.2
      console.log("Push notification:", { title, body })
      return true
    } catch (error) {
      console.error("Error sending push notification:", error)
      return false
    }
  }

  /**
   * Sends SMS notification (placeholder - optional feature)
   */
  private static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // Optional: Integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log("Sending SMS:", { to, message })
      return true
    } catch (error) {
      console.error("Error sending SMS:", error)
      return false
    }
  }

  /**
   * Logs notification to database
   */
  private static async logNotification(
    orderId: string,
    type: NotificationType,
    status: NotificationStatus,
    template: string,
    recipient: string,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await supabase.from("notification_logs").insert({
        order_id: orderId,
        notification_type: type,
        status,
        content_template: template,
        recipient,
        error_message: errorMessage,
        sent_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging notification:", error)
    }
  }

  /**
   * Gets notification history for an order
   */
  public static async getNotificationHistory(
    orderId: string,
  ): Promise<NotificationLog[]> {
    try {
      const { data, error } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("order_id", orderId)
        .order("sent_at", { ascending: false })

      if (error) {
        console.error("Error fetching notification history:", error)
        return []
      }

      return data as NotificationLog[]
    } catch (error) {
      console.error("Error in getNotificationHistory:", error)
      return []
    }
  }

  /**
   * Retries failed notifications
   */
  public static async retryFailedNotification(
    notificationId: string,
  ): Promise<boolean> {
    try {
      const { data: notification, error } = await supabase
        .from("notification_logs")
        .select("*")
        .eq("id", notificationId)
        .single()

      if (error || !notification) {
        console.error("Notification not found:", notificationId)
        return false
      }

      // Get order details
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", notification.order_id)
        .single()

      if (!order) {
        console.error("Order not found:", notification.order_id)
        return false
      }

      // Retry sending
      const sent = await this.sendNotification(
        order as EnhancedOrder,
        order.status,
        notification.notification_type as NotificationType,
        {},
      )

      // Update retry count
      await supabase
        .from("notification_logs")
        .update({
          retry_count: notification.retry_count + 1,
          status: sent ? "sent" : "failed",
        })
        .eq("id", notificationId)

      return sent
    } catch (error) {
      console.error("Error retrying notification:", error)
      return false
    }
  }
}
