import { CourierService, CourierConfiguration } from '../CourierService'

// Mock Supabase client
jest.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn((field, value) => ({
          order: jest.fn(() => {
            // Filter based on is_active field if specified
            const filteredCouriers = field === 'is_active' && value === true 
              ? mockCouriers.filter(c => c.is_active)
              : mockCouriers
            
            return Promise.resolve({
              data: filteredCouriers,
              error: null
            })
          })
        })),
        order: jest.fn(() => Promise.resolve({
          data: mockCouriers, // Return all couriers for cache population
          error: null
        }))
      })),
      upsert: jest.fn((data) => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: '4',
              courier_code: data.courier_code,
              courier_name: data.courier_name,
              tracking_url_pattern: data.tracking_url_pattern,
              delivery_timeframe_days: data.delivery_timeframe_days,
              is_active: data.is_active,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          error: null
        }))
      }))
    }))
  }
}))

const mockCouriers: CourierConfiguration[] = [
  {
    id: '1',
    courier_code: 'dtdc',
    courier_name: 'DTDC',
    tracking_url_pattern: 'https://www.dtdc.in/tracking/tracking_results.asp?strCnno={trackingNumber}',
    delivery_timeframe_days: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    courier_code: 'bluedart',
    courier_name: 'Blue Dart',
    tracking_url_pattern: 'https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo={trackingNumber}',
    delivery_timeframe_days: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    courier_code: 'delhivery',
    courier_name: 'Delhivery',
    tracking_url_pattern: 'https://www.delhivery.com/track/package/{trackingNumber}',
    delivery_timeframe_days: 4,
    is_active: false, // Inactive courier
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

describe('CourierService', () => {
  beforeEach(() => {
    // Clear cache before each test
    CourierService.clearCache()
    jest.clearAllMocks()
  })

  describe('getActiveCouriers', () => {
    it('should return only active couriers', async () => {
      const couriers = await CourierService.getActiveCouriers()
      
      expect(couriers).toHaveLength(2) // Only DTDC and Blue Dart are active
      expect(couriers.every(c => c.is_active)).toBe(true)
      expect(couriers.map(c => c.courier_code)).toEqual(['dtdc', 'bluedart'])
    })

    it('should cache results to reduce database calls', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      
      // First call
      await CourierService.getActiveCouriers()
      
      // Second call should use cache
      await CourierService.getActiveCouriers()
      
      // Should only call database once
      expect(mockSupabase.from).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors gracefully', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      })

      const couriers = await CourierService.getActiveCouriers()
      expect(couriers).toEqual([])
    })
  })

  describe('getCourierByCode', () => {
    it('should return courier configuration by code', async () => {
      const courier = await CourierService.getCourierByCode('dtdc')
      
      expect(courier).toBeTruthy()
      expect(courier?.courier_code).toBe('dtdc')
      expect(courier?.courier_name).toBe('DTDC')
      expect(courier?.delivery_timeframe_days).toBe(3)
    })

    it('should return null for non-existent courier', async () => {
      const courier = await CourierService.getCourierByCode('nonexistent')
      expect(courier).toBeNull()
    })

    it('should return null for inactive courier', async () => {
      const courier = await CourierService.getCourierByCode('delhivery')
      expect(courier).toBeNull() // Delhivery is inactive in mock data
    })

    it('should use cache when available', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      
      // First call to populate cache
      await CourierService.getActiveCouriers()
      
      // Reset mock call count
      jest.clearAllMocks()
      
      // This should use cache
      const courier = await CourierService.getCourierByCode('dtdc')
      
      expect(courier).toBeTruthy()
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })

  describe('generateTrackingUrl', () => {
    it('should generate correct tracking URL for DTDC', async () => {
      const url = await CourierService.generateTrackingUrl('dtdc', 'TRACK123')
      expect(url).toBe('https://www.dtdc.in/tracking/tracking_results.asp?strCnno=TRACK123')
    })

    it('should generate correct tracking URL for Blue Dart', async () => {
      const url = await CourierService.generateTrackingUrl('bluedart', 'BD456789')
      expect(url).toBe('https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=BD456789')
    })

    it('should return null for courier without tracking pattern', async () => {
      // Mock courier without tracking pattern
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: [{
                ...mockCouriers[0],
                tracking_url_pattern: null
              }],
              error: null
            }))
          }))
        }))
      })

      CourierService.clearCache() // Clear cache to force database call
      const url = await CourierService.generateTrackingUrl('dtdc', 'TRACK123')
      expect(url).toBeNull()
    })

    it('should return null for non-existent courier', async () => {
      const url = await CourierService.generateTrackingUrl('nonexistent', 'TRACK123')
      expect(url).toBeNull()
    })

    it('should handle special characters in tracking number', async () => {
      const url = await CourierService.generateTrackingUrl('dtdc', 'TRACK-123/ABC')
      expect(url).toBe('https://www.dtdc.in/tracking/tracking_results.asp?strCnno=TRACK-123/ABC')
    })
  })

  describe('validateTrackingNumber', () => {
    it('should validate DTDC tracking numbers', () => {
      expect(CourierService.validateTrackingNumber('dtdc', 'DTDC1234567890')).toBe(true)
      expect(CourierService.validateTrackingNumber('dtdc', 'ABC123')).toBe(false) // Too short
      expect(CourierService.validateTrackingNumber('dtdc', 'DTDC1234567890TOOLONG')).toBe(false) // Too long
    })

    it('should validate Blue Dart tracking numbers', () => {
      expect(CourierService.validateTrackingNumber('bluedart', 'BD123456')).toBe(true)
      expect(CourierService.validateTrackingNumber('bluedart', 'BD1234567890')).toBe(true) // Fixed length
      expect(CourierService.validateTrackingNumber('bluedart', 'BD123')).toBe(false) // Too short
      expect(CourierService.validateTrackingNumber('bluedart', 'BD1234567890123')).toBe(false) // Too long
    })

    it('should use default validation for unknown couriers', () => {
      expect(CourierService.validateTrackingNumber('unknown', 'TRACK123')).toBe(true)
      expect(CourierService.validateTrackingNumber('unknown', 'ABC')).toBe(false) // Too short
      expect(CourierService.validateTrackingNumber('unknown', 'A'.repeat(30))).toBe(false) // Too long
    })

    it('should return false for empty or null tracking numbers', () => {
      expect(CourierService.validateTrackingNumber('dtdc', '')).toBe(false)
      expect(CourierService.validateTrackingNumber('dtdc', '   ')).toBe(false)
    })

    it('should trim whitespace before validation', () => {
      expect(CourierService.validateTrackingNumber('dtdc', '  DTDC1234567890  ')).toBe(true)
    })
  })

  describe('getDeliveryTimeframe', () => {
    it('should return delivery timeframe for courier', async () => {
      const timeframe = await CourierService.getDeliveryTimeframe('dtdc')
      expect(timeframe).toBe(3)
    })

    it('should return null for non-existent courier', async () => {
      const timeframe = await CourierService.getDeliveryTimeframe('nonexistent')
      expect(timeframe).toBeNull()
    })

    it('should handle courier with null timeframe', async () => {
      // Mock courier with null timeframe
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: [{
                ...mockCouriers[0],
                delivery_timeframe_days: null
              }],
              error: null
            }))
          }))
        }))
      })

      CourierService.clearCache()
      const timeframe = await CourierService.getDeliveryTimeframe('dtdc')
      expect(timeframe).toBeNull()
    })
  })

  describe('getSupportedCouriers', () => {
    it('should return list of supported courier codes', async () => {
      const couriers = await CourierService.getSupportedCouriers()
      expect(couriers).toEqual(['dtdc', 'bluedart'])
    })

    it('should return empty array on error', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      })

      CourierService.clearCache()
      const couriers = await CourierService.getSupportedCouriers()
      expect(couriers).toEqual([])
    })
  })

  describe('getCourierDisplayName', () => {
    it('should return courier display name', async () => {
      const name = await CourierService.getCourierDisplayName('dtdc')
      expect(name).toBe('DTDC')
    })

    it('should return uppercase code for non-existent courier', async () => {
      const name = await CourierService.getCourierDisplayName('nonexistent')
      expect(name).toBe('NONEXISTENT')
    })

    it('should handle errors gracefully', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      })

      CourierService.clearCache()
      const name = await CourierService.getCourierDisplayName('dtdc')
      expect(name).toBe('DTDC') // Should return uppercase code
    })
  })

  describe('upsertCourierConfiguration', () => {
    it('should create new courier configuration', async () => {
      const newCourier = {
        courier_code: 'fedex',
        courier_name: 'FedEx',
        tracking_url_pattern: 'https://www.fedex.com/track?trackingNumber={trackingNumber}',
        delivery_timeframe_days: 2,
        is_active: true
      }

      const result = await CourierService.upsertCourierConfiguration(newCourier)
      
      expect(result).toBeTruthy()
      expect(result?.courier_code).toBe('fedex')
    })

    it('should clear cache after upsert', async () => {
      const newCourier = {
        courier_code: 'fedex',
        courier_name: 'FedEx',
        tracking_url_pattern: 'https://www.fedex.com/track?trackingNumber={trackingNumber}',
        delivery_timeframe_days: 2,
        is_active: true
      }

      // Populate cache first
      await CourierService.getActiveCouriers()
      
      // Upsert should clear cache
      await CourierService.upsertCourierConfiguration(newCourier)
      
      // Next call should hit database again
      const mockSupabase = require('../../lib/supabase/client').supabase
      jest.clearAllMocks()
      
      await CourierService.getActiveCouriers()
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      })

      const newCourier = {
        courier_code: 'fedex',
        courier_name: 'FedEx',
        tracking_url_pattern: 'https://www.fedex.com/track?trackingNumber={trackingNumber}',
        delivery_timeframe_days: 2,
        is_active: true
      }

      const result = await CourierService.upsertCourierConfiguration(newCourier)
      expect(result).toBeNull()
    })
  })

  describe('deactivateCourier', () => {
    it('should deactivate courier successfully', async () => {
      const result = await CourierService.deactivateCourier('dtdc')
      expect(result).toBe(true)
    })

    it('should clear cache after deactivation', async () => {
      // Populate cache first
      await CourierService.getActiveCouriers()
      
      // Deactivate should clear cache
      await CourierService.deactivateCourier('dtdc')
      
      // Next call should hit database again
      const mockSupabase = require('../../lib/supabase/client').supabase
      jest.clearAllMocks()
      
      await CourierService.getActiveCouriers()
      expect(mockSupabase.from).toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            error: new Error('Database error')
          }))
        }))
      })

      const result = await CourierService.deactivateCourier('dtdc')
      expect(result).toBe(false)
    })
  })

  describe('clearCache', () => {
    it('should clear the courier cache', async () => {
      // Populate cache
      await CourierService.getActiveCouriers()
      
      // Clear cache
      CourierService.clearCache()
      
      // Next call should hit database
      const mockSupabase = require('../../lib/supabase/client').supabase
      jest.clearAllMocks()
      
      await CourierService.getActiveCouriers()
      expect(mockSupabase.from).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty tracking number gracefully', async () => {
      const url = await CourierService.generateTrackingUrl('dtdc', '')
      expect(url).toBe('https://www.dtdc.in/tracking/tracking_results.asp?strCnno=')
    })

    it('should handle special characters in courier code', async () => {
      const courier = await CourierService.getCourierByCode('DTDC')
      expect(courier).toBeNull() // Case sensitive
    })

    it('should handle very long tracking numbers', () => {
      const longTrackingNumber = 'A'.repeat(100)
      expect(CourierService.validateTrackingNumber('unknown', longTrackingNumber)).toBe(false)
    })

    it('should handle courier code with special characters', () => {
      expect(CourierService.validateTrackingNumber('test-courier', 'TRACK123')).toBe(true)
    })
  })

  describe('supportsTracking', () => {
    it('should return true for couriers with tracking URLs', async () => {
      const supports = await CourierService.supportsTracking('dtdc')
      expect(supports).toBe(true)
    })

    it('should return false for manual delivery', async () => {
      const supports = await CourierService.supportsTracking('manual')
      expect(supports).toBe(false)
    })

    it('should return false for instore pickup', async () => {
      const supports = await CourierService.supportsTracking('instore')
      expect(supports).toBe(false)
    })

    it('should return false for non-existent courier', async () => {
      const supports = await CourierService.supportsTracking('nonexistent')
      expect(supports).toBe(false)
    })

    it('should handle case insensitive courier codes', async () => {
      const supportsLower = await CourierService.supportsTracking('manual')
      const supportsUpper = await CourierService.supportsTracking('MANUAL')
      expect(supportsLower).toBe(false)
      expect(supportsUpper).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: null,
              error: new Error('Database error')
            }))
          }))
        }))
      })

      CourierService.clearCache()
      const supports = await CourierService.supportsTracking('dtdc')
      expect(supports).toBe(false)
    })
  })

  describe('getCourierInfo', () => {
    it('should return complete courier information', async () => {
      const info = await CourierService.getCourierInfo('dtdc')
      
      expect(info.courier).toBeTruthy()
      expect(info.courier?.courier_code).toBe('dtdc')
      expect(info.supportsTracking).toBe(true)
      expect(info.displayName).toBe('DTDC')
    })

    it('should return info for manual delivery', async () => {
      // Mock manual courier in database
      const mockSupabase = require('../../lib/supabase/client').supabase
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [{
              id: '5',
              courier_code: 'manual',
              courier_name: 'Manual Delivery',
              tracking_url_pattern: '',
              delivery_timeframe_days: null,
              is_active: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }],
            error: null
          }))
        }))
      })

      CourierService.clearCache()
      const info = await CourierService.getCourierInfo('manual')
      
      expect(info.courier).toBeTruthy()
      expect(info.courier?.courier_code).toBe('manual')
      expect(info.supportsTracking).toBe(false)
      expect(info.displayName).toBe('Manual Delivery')
    })

    it('should return default info for non-existent courier', async () => {
      const info = await CourierService.getCourierInfo('nonexistent')
      
      expect(info.courier).toBeNull()
      expect(info.supportsTracking).toBe(false)
      expect(info.displayName).toBe('NONEXISTENT')
    })

    it('should handle errors gracefully', async () => {
      const mockSupabase = require('../../lib/supabase/client').supabase
      
      // Mock multiple calls to return error
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: null,
            error: new Error('Database error')
          }))
        }))
      })

      CourierService.clearCache()
      const info = await CourierService.getCourierInfo('dtdc')
      
      expect(info.courier).toBeNull()
      expect(info.supportsTracking).toBe(false)
      expect(info.displayName).toBe('DTDC')
    })
  })
})