// This is a placeholder types file
// Generate actual types from your Supabase schema by running:
// npx supabase gen types typescript --linked > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          shipping_address: Json | null
          customer_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          shipping_address?: Json | null
          customer_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          shipping_address?: Json | null
          customer_email?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pending' | 'paid' | 'in_packing' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
    }
  }
}
