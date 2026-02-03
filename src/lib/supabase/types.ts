export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_configurations: {
        Row: {
          courier_code: string
          courier_name: string
          created_at: string
          delivery_timeframe_days: number | null
          id: string
          is_active: boolean
          tracking_url_pattern: string
          updated_at: string
        }
        Insert: {
          courier_code: string
          courier_name: string
          created_at?: string
          delivery_timeframe_days?: number | null
          id?: string
          is_active?: boolean
          tracking_url_pattern: string
          updated_at?: string
        }
        Update: {
          courier_code?: string
          courier_name?: string
          created_at?: string
          delivery_timeframe_days?: number | null
          id?: string
          is_active?: boolean
          tracking_url_pattern?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          confirmation_method: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          order_id: string
          product_id: string
          quantity_reserved: number
          release_reason: string | null
          released_at: string | null
          reserved_at: string
          status: string
          updated_at: string
        }
        Insert: {
          confirmation_method?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity_reserved: number
          release_reason?: string | null
          released_at?: string | null
          reserved_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          confirmation_method?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity_reserved?: number
          release_reason?: string | null
          released_at?: string | null
          reserved_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          content_template: string
          created_at: string
          delivered_at: string | null
          engagement_data: Json | null
          error_message: string | null
          failed_at: string | null
          id: string
          notification_type: string
          order_id: string
          recipient: string
          retry_count: number
          sent_at: string
          status: string
        }
        Insert: {
          content_template: string
          created_at?: string
          delivered_at?: string | null
          engagement_data?: Json | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          notification_type: string
          order_id: string
          recipient: string
          retry_count?: number
          sent_at?: string
          status?: string
        }
        Update: {
          content_template?: string
          created_at?: string
          delivered_at?: string | null
          engagement_data?: Json | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          notification_type?: string
          order_id?: string
          recipient?: string
          retry_count?: number
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          order_id: string
          recorded_at: string
          stage_breakdown: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          order_id: string
          recorded_at?: string
          stage_breakdown?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          order_id?: string
          recorded_at?: string
          stage_breakdown?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_metrics_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery: string | null
          cancellation_reason: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_satisfaction_rating: number | null
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          last_notification_sent: string | null
          notification_preferences: Json | null
          packed_at: string | null
          packing_started_at: string | null
          processing_time_minutes: number | null
          push_subscription: Json | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_company: string | null
          status: string
          total_amount: number
          tracking_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_delivery?: string | null
          cancellation_reason?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          last_notification_sent?: string | null
          notification_preferences?: Json | null
          packed_at?: string | null
          packing_started_at?: string | null
          processing_time_minutes?: number | null
          push_subscription?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_company?: string | null
          status?: string
          total_amount: number
          tracking_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_delivery?: string | null
          cancellation_reason?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_satisfaction_rating?: number | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          last_notification_sent?: string | null
          notification_preferences?: Json | null
          packed_at?: string | null
          packing_started_at?: string | null
          processing_time_minutes?: number | null
          push_subscription?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_company?: string | null
          status?: string
          total_amount?: number
          tracking_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      packing_sessions: {
        Row: {
          admin_email: string
          completed_at: string | null
          created_at: string
          id: string
          order_id: string
          packing_duration_minutes: number | null
          scan_progress: Json | null
          started_at: string
          status: string
        }
        Insert: {
          admin_email: string
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          packing_duration_minutes?: number | null
          scan_progress?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          admin_email?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          packing_duration_minutes?: number | null
          scan_progress?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "packing_sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_summaries: {
        Row: {
          average_processing_time: number | null
          bottlenecks: Json | null
          created_at: string
          customer_satisfaction_score: number | null
          date_range: Json
          id: string
          inventory_turnover_rate: number | null
          period: string
          self_service_usage_rate: number | null
          total_orders: number
          updated_at: string
        }
        Insert: {
          average_processing_time?: number | null
          bottlenecks?: Json | null
          created_at?: string
          customer_satisfaction_score?: number | null
          date_range: Json
          id?: string
          inventory_turnover_rate?: number | null
          period: string
          self_service_usage_rate?: number | null
          total_orders?: number
          updated_at?: string
        }
        Update: {
          average_processing_time?: number | null
          bottlenecks?: Json | null
          created_at?: string
          customer_satisfaction_score?: number | null
          date_range?: Json
          id?: string
          inventory_turnover_rate?: number | null
          period?: string
          self_service_usage_rate?: number | null
          total_orders?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string | null
          price_modifier: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          price_modifier?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          price_modifier?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          colors: string[] | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_visible: boolean
          material: string | null
          name: string
          original_price: number | null
          price: number
          sku: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number | null
          sub_category_id: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_visible?: boolean
          material?: string | null
          name: string
          original_price?: number | null
          price: number
          sku?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number | null
          sub_category_id?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_visible?: boolean
          material?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sku?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number | null
          sub_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      self_service_requests: {
        Row: {
          address_change_data: Json | null
          admin_notes: string | null
          cancellation_data: Json | null
          created_at: string
          customer_reason: string | null
          id: string
          order_id: string
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          address_change_data?: Json | null
          admin_notes?: string | null
          cancellation_data?: Json | null
          created_at?: string
          customer_reason?: string | null
          id?: string
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address_change_data?: Json | null
          admin_notes?: string | null
          cancellation_data?: Json | null
          created_at?: string
          customer_reason?: string | null
          id?: string
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_service_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const