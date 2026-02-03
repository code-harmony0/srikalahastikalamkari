import { supabase } from '../lib/supabase/client'
import { Database } from '../lib/supabase/enhanced-types'

/**
 * Courier Service
 * 
 * Manages courier configurations and tracking URL generation
 * Integrates with database courier_configurations table
 * 
 * Requirements: 2.1, 2.2, 2.4, 2.5
 */

export type CourierType = 'dtdc' | 'bluedart' | 'delhivery' | 'ecom' | 'fedex' | 'ups' | 'dhl' | 'aramex' | 'manual' | 'instore'

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

export interface DeliveryEstimate {
  estimatedDate: Date
  minDate: Date
  maxDate: Date
  timeframeDays: number
  courierName: string
  processingDelay: boolean
  holidayImpact: boolean
}

export class CourierService {
  private static courierCache: Map<string, CourierConfiguration> = new Map()
  private static cacheExpiry: number = 0
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Gets all active courier configurations from database
   * Uses caching to reduce database calls
   */
  public static async getActiveCouriers(): Promise<CourierConfiguration[]> {
    try {
      // Check cache first
      if (Date.now() < this.cacheExpiry && this.courierCache.size > 0) {
        return Array.from(this.courierCache.values()).filter(c => c.is_active)
      }

      // Fetch all couriers (not just active ones) to populate cache properly
      const { data: allCouriers, error } = await supabase
        .from('courier_configurations')
        .select('*')
        .order('courier_name')

      if (error) {
        console.error('Error fetching courier configurations:', error)
        return []
      }

      // Update cache with all couriers
      this.courierCache.clear()
      for (const courier of allCouriers || []) {
        this.courierCache.set(courier.courier_code, courier as CourierConfiguration)
      }
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      // Return only active couriers
      return (allCouriers || []).filter(c => c.is_active) as CourierConfiguration[]
    } catch (error) {
      console.error('Error in getActiveCouriers:', error)
      return []
    }
  }

  /**
   * Gets a specific courier configuration by code
   */
  public static async getCourierByCode(courierCode: string): Promise<CourierConfiguration | null> {
    try {
      // Check cache first
      if (Date.now() < this.cacheExpiry && this.courierCache.has(courierCode)) {
        const courier = this.courierCache.get(courierCode)
        // Return null if courier is inactive
        return courier && courier.is_active ? courier : null
      }

      // Refresh cache if needed
      await this.getActiveCouriers()
      const courier = this.courierCache.get(courierCode)
      // Return null if courier is inactive or doesn't exist
      return courier && courier.is_active ? courier : null
    } catch (error) {
      console.error('Error in getCourierByCode:', error)
      return null
    }
  }

  /**
   * Generates tracking URL for a specific courier and tracking number
   * Returns null for couriers without tracking URLs (manual, instore)
   */
  public static async generateTrackingUrl(
    courierCode: string, 
    trackingNumber: string
  ): Promise<string | null> {
    try {
      // Handle special courier types that don't have tracking URLs
      const lowerCourierCode = courierCode.toLowerCase()
      if (lowerCourierCode === 'manual' || lowerCourierCode === 'instore') {
        return null
      }

      const courier = await this.getCourierByCode(courierCode)
      if (!courier || !courier.tracking_url_pattern) {
        return null
      }

      // Replace placeholder with actual tracking number
      return courier.tracking_url_pattern.replace('{trackingNumber}', trackingNumber)
    } catch (error) {
      console.error('Error generating tracking URL:', error)
      return null
    }
  }

  /**
   * Validates tracking number format for a specific courier
   * Enhanced validation with comprehensive courier-specific rules
   */
  public static validateTrackingNumber(courierCode: string, trackingNumber: string): boolean {
    if (!trackingNumber || trackingNumber.trim().length === 0) {
      return false
    }

    const trimmedTrackingNumber = trackingNumber.trim()

    // Enhanced validation rules by courier with more specific patterns
    const validationRules: Record<string, RegExp> = {
      dtdc: /^[A-Z0-9]{10,15}$/i, // DTDC tracking numbers are typically 10-15 alphanumeric
      bluedart: /^[A-Z0-9]{6,12}$/i, // Blue Dart tracking numbers are 6-12 alphanumeric
      delhivery: /^[A-Z0-9]{10,20}$/i, // Delhivery tracking numbers are 10-20 alphanumeric
      ecom: /^[A-Z0-9]{10,15}$/i, // Ecom Express tracking numbers are 10-15 alphanumeric
      fedex: /^[0-9]{12,14}$/i, // FedEx tracking numbers are typically 12-14 digits
      ups: /^1Z[A-Z0-9]{16}$/i, // UPS tracking numbers start with 1Z followed by 16 alphanumeric
      dhl: /^[0-9]{10,11}$/i, // DHL tracking numbers are typically 10-11 digits
      aramex: /^[A-Z0-9]{8,15}$/i, // Aramex tracking numbers are 8-15 alphanumeric
      manual: /^[A-Z0-9\-_]{3,20}$/i, // Manual delivery codes can include hyphens and underscores
      instore: /^[A-Z0-9\-_]{3,20}$/i // In-store pickup codes can include hyphens and underscores
    }

    const rule = validationRules[courierCode.toLowerCase()]
    if (rule) {
      return rule.test(trimmedTrackingNumber)
    }

    // Default validation for unknown couriers - more permissive for extensibility
    return trimmedTrackingNumber.length >= 4 && 
           trimmedTrackingNumber.length <= 29 &&
           /^[A-Z0-9\-_\/\.]+$/i.test(trimmedTrackingNumber)
  }

  /**
   * Gets delivery timeframe for a specific courier
   */
  public static async getDeliveryTimeframe(courierCode: string): Promise<number | null> {
    try {
      const courier = await this.getCourierByCode(courierCode)
      return courier?.delivery_timeframe_days || null
    } catch (error) {
      console.error('Error getting delivery timeframe:', error)
      return null
    }
  }

  /**
   * Gets all supported courier types
   */
  public static async getSupportedCouriers(): Promise<CourierType[]> {
    try {
      const couriers = await this.getActiveCouriers()
      return couriers.map(c => c.courier_code as CourierType)
    } catch (error) {
      console.error('Error getting supported couriers:', error)
      return []
    }
  }

  /**
   * Adds or updates a courier configuration
   * Admin function for managing courier settings
   */
  public static async upsertCourierConfiguration(
    courierData: Omit<CourierConfiguration, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CourierConfiguration | null> {
    try {
      const { data: courier, error } = await supabase
        .from('courier_configurations')
        .upsert({
          courier_code: courierData.courier_code,
          courier_name: courierData.courier_name,
          tracking_url_pattern: courierData.tracking_url_pattern,
          delivery_timeframe_days: courierData.delivery_timeframe_days,
          is_active: courierData.is_active
        }, {
          onConflict: 'courier_code'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting courier configuration:', error)
        return null
      }

      // Clear cache to force refresh
      this.courierCache.clear()
      this.cacheExpiry = 0

      return courier as CourierConfiguration
    } catch (error) {
      console.error('Error in upsertCourierConfiguration:', error)
      return null
    }
  }

  /**
   * Deactivates a courier configuration
   */
  public static async deactivateCourier(courierCode: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('courier_configurations')
        .update({ is_active: false })
        .eq('courier_code', courierCode)

      if (error) {
        console.error('Error deactivating courier:', error)
        return false
      }

      // Clear cache to force refresh
      this.courierCache.clear()
      this.cacheExpiry = 0

      return true
    } catch (error) {
      console.error('Error in deactivateCourier:', error)
      return false
    }
  }

  /**
   * Gets courier display name for UI
   */
  public static async getCourierDisplayName(courierCode: string): Promise<string> {
    try {
      const courier = await this.getCourierByCode(courierCode)
      return courier?.courier_name || courierCode.toUpperCase()
    } catch (error) {
      console.error('Error getting courier display name:', error)
      return courierCode.toUpperCase()
    }
  }

  /**
   * Clears the courier cache (useful for testing or forced refresh)
   */
  public static clearCache(): void {
    this.courierCache.clear()
    this.cacheExpiry = 0
  }

  /**
   * Checks if a courier supports tracking URLs
   * Returns false for manual and instore deliveries
   */
  public static async supportsTracking(courierCode: string): Promise<boolean> {
    try {
      const lowerCourierCode = courierCode.toLowerCase()
      
      // Manual and instore deliveries don't support tracking URLs
      if (lowerCourierCode === 'manual' || lowerCourierCode === 'instore') {
        return false
      }

      const courier = await this.getCourierByCode(courierCode)
      return courier !== null && !!courier.tracking_url_pattern
    } catch (error) {
      console.error('Error checking tracking support:', error)
      return false
    }
  }

  /**
   * Gets courier information including tracking support status
   */
  public static async getCourierInfo(courierCode: string): Promise<{
    courier: CourierConfiguration | null
    supportsTracking: boolean
    displayName: string
  }> {
    try {
      const courier = await this.getCourierByCode(courierCode)
      const supportsTracking = await this.supportsTracking(courierCode)
      const displayName = await this.getCourierDisplayName(courierCode)

      return {
        courier,
        supportsTracking,
        displayName
      }
    } catch (error) {
      console.error('Error getting courier info:', error)
      return {
        courier: null,
        supportsTracking: false,
        displayName: courierCode.toUpperCase()
      }
    }
  }
}