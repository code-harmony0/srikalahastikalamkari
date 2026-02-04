// Enhanced Order Tracking System Types
// This file contains the complete type definitions for the enhanced database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Notification preferences structure
export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  timing_preference: 'immediate' | 'daily_digest' | 'milestone_only'
}

// Push subscription structure
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Self-service request data structures
export interface CancellationData {
  reason: string
  refund_requested: boolean
}

export interface AddressChangeData {
  old_address: Json
  new_address: Json
  change_reason: string
}

// Analytics data structures
export interface StageBreakdown {
  paid_to_packing?: number
  packing_to_packed?: number
  packed_to_shipped?: number

}

export interface EngagementData {
  opened_at?: string
  clicked_at?: string
  tracking_url_clicked?: boolean
}

export interface BottleneckInfo {
  stage: string
  average_delay_minutes: number
  affected_orders: number
}

export interface DateRange {
  start: string
  end: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      // Existing tables (enhanced)
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          image_url: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          image_url?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          image_url?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          sku: string | null
          stock_quantity: number
          slug: string
          images: string[] | null
          is_featured: boolean
          is_visible: boolean
          category_id: string | null
          specifications: Json | null
          material: string | null
          barcode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          sku?: string | null
          stock_quantity?: number
          slug: string
          images?: string[] | null
          is_featured?: boolean
          is_visible?: boolean
          category_id?: string | null
          specifications?: Json | null
          material?: string | null
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          sku?: string | null
          stock_quantity?: number
          slug?: string
          images?: string[] | null
          is_featured?: boolean
          is_visible?: boolean
          category_id?: string | null
          specifications?: Json | null
          material?: string | null
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string | null
          size: string | null
          color: string | null
          sku: string | null
          price_modifier: number | null
          stock_quantity: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name?: string | null
          size?: string | null
          color?: string | null
          sku?: string | null
          price_modifier?: number | null
          stock_quantity?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string | null
          size?: string | null
          color?: string | null
          sku?: string | null
          price_modifier?: number | null
          stock_quantity?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          title: string
          description: string | null
          banner_image_url: string | null
          cta_url: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          banner_image_url?: string | null
          cta_url?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          banner_image_url?: string | null
          cta_url?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          review_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          review_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          review_text?: string | null
          created_at?: string
        }
      }
      // Enhanced orders table
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'cancelled'
          total_amount: number
          shipping_address: Json | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          
          // Enhanced tracking timestamps
          packed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          packing_started_at: string | null
          estimated_delivery: string | null
          actual_delivery: string | null
          
          // Shipping information
          tracking_id: string | null
          shipping_company: string | null
          cancellation_reason: string | null
          
          // Notification and communication
          notification_preferences: Json | null
          last_notification_sent: string | null
          push_subscription: Json | null
          
          // Analytics
          processing_time_minutes: number | null
          customer_satisfaction_rating: number | null
          
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'cancelled'
          total_amount: number
          shipping_address?: Json | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          
          packed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          packing_started_at?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
          
          tracking_id?: string | null
          shipping_company?: string | null
          cancellation_reason?: string | null
          
          notification_preferences?: Json | null
          last_notification_sent?: string | null
          push_subscription?: Json | null
          
          processing_time_minutes?: number | null
          customer_satisfaction_rating?: number | null
          
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'cancelled'
          total_amount?: number
          shipping_address?: Json | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          
          packed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          packing_started_at?: string | null
          estimated_delivery?: string | null
          actual_delivery?: string | null
          
          tracking_id?: string | null
          shipping_company?: string | null
          cancellation_reason?: string | null
          
          notification_preferences?: Json | null
          last_notification_sent?: string | null
          push_subscription?: Json | null
          
          processing_time_minutes?: number | null
          customer_satisfaction_rating?: number | null
          
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_purchase: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_purchase?: number
        }
      }
      packing_sessions: {
        Row: {
          id: string
          order_id: string
          admin_email: string
          scan_progress: Json
          status: 'in_progress' | 'completed' | 'cancelled'
          started_at: string
          completed_at: string | null
          packing_duration_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          admin_email: string
          scan_progress?: Json
          status?: 'in_progress' | 'completed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          packing_duration_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          admin_email?: string
          scan_progress?: Json
          status?: 'in_progress' | 'completed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          packing_duration_minutes?: number | null
          created_at?: string
        }
      }
      // New tables for enhanced order tracking
      inventory_reservations: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity_reserved: number
          reserved_at: string
          expires_at: string
          status: 'active' | 'confirmed' | 'released' | 'expired'
          created_by: string | null
          confirmation_method: 'auto' | 'manual' | 'packing_scan' | null
          release_reason: 'cancellation' | 'expiry' | 'insufficient_stock' | 'manual' | null
          confirmed_at: string | null
          released_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity_reserved: number
          reserved_at?: string
          expires_at?: string
          status?: 'active' | 'confirmed' | 'released' | 'expired'
          created_by?: string | null
          confirmation_method?: 'auto' | 'manual' | 'packing_scan' | null
          release_reason?: 'cancellation' | 'expiry' | 'insufficient_stock' | 'manual' | null
          confirmed_at?: string | null
          released_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity_reserved?: number
          reserved_at?: string
          expires_at?: string
          status?: 'active' | 'confirmed' | 'released' | 'expired'
          created_by?: string | null
          confirmation_method?: 'auto' | 'manual' | 'packing_scan' | null
          release_reason?: 'cancellation' | 'expiry' | 'insufficient_stock' | 'manual' | null
          confirmed_at?: string | null
          released_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          order_id: string
          notification_type: 'email' | 'push' | 'sms'
          status: 'sent' | 'delivered' | 'failed' | 'bounced'
          sent_at: string
          delivered_at: string | null
          failed_at: string | null
          content_template: string
          recipient: string
          engagement_data: Json | null
          retry_count: number
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          notification_type: 'email' | 'push' | 'sms'
          status?: 'sent' | 'delivered' | 'failed' | 'bounced'
          sent_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          content_template: string
          recipient: string
          engagement_data?: Json | null
          retry_count?: number
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          notification_type?: 'email' | 'push' | 'sms'
          status?: 'sent' | 'delivered' | 'failed' | 'bounced'
          sent_at?: string
          delivered_at?: string | null
          failed_at?: string | null
          content_template?: string
          recipient?: string
          engagement_data?: Json | null
          retry_count?: number
          error_message?: string | null
          created_at?: string
        }
      }
      self_service_requests: {
        Row: {
          id: string
          order_id: string
          request_type: 'cancellation' | 'address_change'
          status: 'pending' | 'approved' | 'rejected'
          customer_reason: string | null
          admin_notes: string | null
          requested_at: string
          processed_at: string | null
          processed_by: string | null
          cancellation_data: Json | null
          address_change_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          request_type: 'cancellation' | 'address_change'
          status?: 'pending' | 'approved' | 'rejected'
          customer_reason?: string | null
          admin_notes?: string | null
          requested_at?: string
          processed_at?: string | null
          processed_by?: string | null
          cancellation_data?: Json | null
          address_change_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          request_type?: 'cancellation' | 'address_change'
          status?: 'pending' | 'approved' | 'rejected'
          customer_reason?: string | null
          admin_notes?: string | null
          requested_at?: string
          processed_at?: string | null
          processed_by?: string | null
          cancellation_data?: Json | null
          address_change_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      order_metrics: {
        Row: {
          id: string
          order_id: string
          metric_type: 'processing_time' | 'customer_satisfaction' | 'delivery_accuracy' | 'self_service_usage'
          metric_value: number
          recorded_at: string
          metadata: Json | null
          stage_breakdown: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          metric_type: 'processing_time' | 'customer_satisfaction' | 'delivery_accuracy' | 'self_service_usage'
          metric_value: number
          recorded_at?: string
          metadata?: Json | null
          stage_breakdown?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          metric_type?: 'processing_time' | 'customer_satisfaction' | 'delivery_accuracy' | 'self_service_usage'
          metric_value?: number
          recorded_at?: string
          metadata?: Json | null
          stage_breakdown?: Json | null
          created_at?: string
        }
      }
      performance_summaries: {
        Row: {
          id: string
          period: 'daily' | 'weekly' | 'monthly'
          date_range: Json
          total_orders: number
          average_processing_time: number | null
          bottlenecks: Json | null
          customer_satisfaction_score: number | null
          self_service_usage_rate: number | null
          inventory_turnover_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period: 'daily' | 'weekly' | 'monthly'
          date_range: Json
          total_orders?: number
          average_processing_time?: number | null
          bottlenecks?: Json | null
          customer_satisfaction_score?: number | null
          self_service_usage_rate?: number | null
          inventory_turnover_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period?: 'daily' | 'weekly' | 'monthly'
          date_range?: Json
          total_orders?: number
          average_processing_time?: number | null
          bottlenecks?: Json | null
          customer_satisfaction_score?: number | null
          self_service_usage_rate?: number | null
          inventory_turnover_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      contact_inquiries: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string | null
          message: string
          status: 'new' | 'solved' | 'ignored'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject?: string | null
          message: string
          status?: 'new' | 'solved' | 'ignored'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subject?: string | null
          message?: string
          status?: 'new' | 'solved' | 'ignored'
          created_at?: string
          updated_at?: string
        }
      }
      courier_configurations: {
        Row: {
          id: string
          courier_code: string
          courier_name: string
          tracking_url_pattern: string
          delivery_timeframe_days: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          courier_code: string
          courier_name: string
          tracking_url_pattern: string
          delivery_timeframe_days?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          courier_code?: string
          courier_name?: string
          tracking_url_pattern?: string
          delivery_timeframe_days?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      order_processing_analytics: {
        Row: {
          date: string | null
          status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'cancelled' | null
          order_count: number | null
          avg_processing_time: number | null
          avg_order_value: number | null
          rated_orders: number | null
          avg_satisfaction: number | null
        }
      }
      inventory_analytics: {
        Row: {
          product_name: string | null
          current_stock: number | null
          reserved_quantity: number | null
          available_quantity: number | null
          expired_reservations: number | null
        }
      }
    }
    Functions: {
      expire_inventory_reservations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_order_processing_time: {
        Args: {
          order_id: string
        }
        Returns: number
      }
    }
    Enums: {
      order_status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'cancelled'
    }
  }
}

// Enhanced Order interface with all new fields
export interface EnhancedOrder {
  id: string
  user_id: string | null
  status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'cancelled'
  total_amount: number
  shipping_address: Json | null
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  
  // Enhanced tracking timestamps
  packed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  packing_started_at: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  
  // Shipping information
  tracking_id: string | null
  shipping_company: string | null
  cancellation_reason: string | null
  
  // Notification and communication
  notification_preferences: NotificationPreferences | null
  last_notification_sent: string | null
  push_subscription: PushSubscription | null
  
  // Analytics
  processing_time_minutes: number | null
  customer_satisfaction_rating: number | null
  
  created_at: string
  updated_at: string
  
  // Relations
  order_items?: OrderItem[]
  inventory_reservations?: InventoryReservation[]
  notification_logs?: NotificationLog[]
  self_service_requests?: SelfServiceRequest[]
  order_metrics?: OrderMetric[]
}

export type InquiryStatus = 'new' | 'solved' | 'ignored';

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: 'new' | 'solved' | 'ignored';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  product?: {
    name: string
    images: string[]
    barcode?: string
  }
}

export interface InventoryReservation {
  id: string
  order_id: string
  product_id: string
  quantity_reserved: number
  reserved_at: string
  expires_at: string
  status: 'active' | 'confirmed' | 'released' | 'expired'
  created_by: string | null
  confirmation_method: 'auto' | 'manual' | 'packing_scan' | null
  release_reason: 'cancellation' | 'expiry' | 'insufficient_stock' | 'manual' | null
  confirmed_at: string | null
  released_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationLog {
  id: string
  order_id: string
  notification_type: 'email' | 'push' | 'sms'
  status: 'sent' | 'delivered' | 'failed' | 'bounced'
  sent_at: string
  delivered_at: string | null
  failed_at: string | null
  content_template: string
  recipient: string
  engagement_data: EngagementData | null
  retry_count: number
  error_message: string | null
  created_at: string
}

export interface SelfServiceRequest {
  id: string
  order_id: string
  request_type: 'cancellation' | 'address_change'
  status: 'pending' | 'approved' | 'rejected'
  customer_reason: string | null
  admin_notes: string | null
  requested_at: string
  processed_at: string | null
  processed_by: string | null
  cancellation_data: CancellationData | null
  address_change_data: AddressChangeData | null
  created_at: string
  updated_at: string
}

export interface OrderMetric {
  id: string
  order_id: string
  metric_type: 'processing_time' | 'customer_satisfaction' | 'delivery_accuracy' | 'self_service_usage'
  metric_value: number
  recorded_at: string
  metadata: Json | null
  stage_breakdown: StageBreakdown | null
  created_at: string
}

export interface PerformanceSummary {
  id: string
  period: 'daily' | 'weekly' | 'monthly'
  date_range: DateRange
  total_orders: number
  average_processing_time: number | null
  bottlenecks: BottleneckInfo[] | null
  customer_satisfaction_score: number | null
  self_service_usage_rate: number | null
  inventory_turnover_rate: number | null
  created_at: string
  updated_at: string
}

export interface CourierConfiguration {
  id: string
  courier_code: string
  courier_name: string
  tracking_url_pattern: string
  delivery_timeframe_days: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Type aliases for convenience
export type OrderStatus = Database['public']['Enums']['order_status']
export type NotificationType = 'email' | 'push' | 'sms'
export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'bounced'
export type ReservationStatus = 'active' | 'confirmed' | 'released' | 'expired'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type RequestType = 'cancellation' | 'address_change'
export type MetricType = 'processing_time' | 'customer_satisfaction' | 'delivery_accuracy' | 'self_service_usage'
export type ConfirmationMethod = 'auto' | 'manual' | 'packing_scan'
export type ReleaseReason = 'cancellation' | 'expiry' | 'insufficient_stock' | 'manual'
export type TimingPreference = 'immediate' | 'daily_digest' | 'milestone_only'
export type ReportPeriod = 'daily' | 'weekly' | 'monthly'